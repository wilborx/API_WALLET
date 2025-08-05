import { prisma } from "../lib/db";
import { encrypt, decrypt } from "../lib/crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MyContext } from "..";
import { getProviderStrategy } from "../providers/providerFactory";
import { DateTimeResolver } from "graphql-scalars";
import { Prisma, PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const resolvers = {
  DateTime: DateTimeResolver,

  ApiKey: {
    usageLogs: (parent: any) => prisma.apiUsageLog.findMany({ where: { apiKeyId: parent.id } }),
    securityAlerts: (parent: any) => prisma.securityAlert.findMany({ where: { apiKeyId: parent.id } }),
    costAlerts: (parent: any) => prisma.costAlert.findMany({ where: { apiKeyId: parent.id } }),
    auditLogs: (parent: any) => prisma.auditLog.findMany({ where: { apiKeyId: parent.id } }),
  },

  Team: {
    members: async (parent: any) => {
      const memberships = await prisma.teamMembership.findMany({
        where: { teamId: parent.id },
        include: { user: true },
      });
      return memberships.map((m: { user: any; }) => m.user);
    },
    apiKeys: (parent: any) => prisma.apiKey.findMany({ where: { teamId: parent.id } }),
  },

  AuditLog: {
    user: (parent: any) => prisma.user.findUnique({ where: { id: parent.userId } }),
  },

  Query: {
    apiKeys: (_: any, { status, provider, teamId, limit = 10, offset = 0 }: { status?: string, provider?: string, teamId?: string, limit?: number, offset?: number }, context: MyContext) => {
      if (!context.userId) throw new Error("Not authenticated");
      
      const where: any = {
        // User can see their own keys or keys of teams they are a member of
        OR: [
          { userId: context.userId },
          { team: { members: { some: { userId: context.userId } } } }
        ]
      };

      if (status) where.status = status;
      if (provider) where.provider = provider;
      if (teamId) where.teamId = teamId;

      return prisma.apiKey.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
    },
    apiKey: async (_: any, { id }: { id: string }, context: MyContext) => {
      if (!context.userId) throw new Error("Not authenticated");
      const key = await prisma.apiKey.findFirst({
        where: { id, OR: [{ userId: context.userId }, { team: { members: { some: { userId: context.userId } } } }] },
      });
      if (!key) throw new Error("API Key not found or access denied.");
      return key;
    },
    teams: (_: any, __: any, context: MyContext) => {
      if (!context.userId) throw new Error("Not authenticated");
      return prisma.team.findMany({
        where: { members: { some: { userId: context.userId } } },
      });
    },
    team: async (_: any, { id }: { id: string }, context: MyContext) => {
      if (!context.userId) throw new Error("Not authenticated");
      const team = await prisma.team.findFirst({
        where: { id, members: { some: { userId: context.userId } } },
      });
      if (!team) throw new Error("Team not found or access denied.");
      return team;
    },
    getDashboardStats: async (_: any, __: any, context: MyContext) => {
      if (!context.userId) throw new Error("Not authenticated");

      const userFilter = {
        OR: [
          { userId: context.userId },
          { team: { members: { some: { userId: context.userId } } } }
        ]
      };

      const totalKeys = await prisma.apiKey.count({ where: userFilter });

      const activeAlerts = await prisma.securityAlert.count({
        where: {
          status: 'new',
          apiKey: userFilter
        }
      });

      // TODO: Implement real cost and response time calculation
      const monthlyCost = 0.0;
      const avgResponseTime = 0;

      return {
        totalKeys,
        activeAlerts,
        monthlyCost,
        avgResponseTime,
      };
    }
  },
  Mutation: {
    proxyRequest: async (
      _: any,
      {
        apiKeyId,
        provider,
        endpoint,
        payload,
      }: {
        apiKeyId: string;
        provider: string;
        endpoint: string;
        payload: string;
      },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");

      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: apiKeyId,
          OR: [
            { userId: context.userId },
            { team: { members: { some: { userId: context.userId } } } },
          ],
        },
      });

      if (!apiKey || apiKey.status !== "active") {
        throw new Error("API key is not valid or you don't have access.");
      }

      const decryptedKey = decrypt(apiKey.encryptedKey);
      const startTime = Date.now();
      let responseData: any;
      let statusCode: number = 500; // Default to internal server error
      let promptTokens: number | undefined;
      let completionTokens: number | undefined;
      let totalTokens: number | undefined;

      try {
        // This is a simplified example. A real implementation would need
        // a more robust way to handle different provider SDKs and endpoints.
        switch (provider.toLowerCase()) {
          case "openai":
            const openai = new (require("openai"))({ apiKey: decryptedKey });
            responseData = await openai.chat.completions.create(JSON.parse(payload));
            statusCode = 200; // Assuming success
            promptTokens = responseData.usage?.prompt_tokens;
            completionTokens = responseData.usage?.completion_tokens;
            totalTokens = responseData.usage?.total_tokens;
            break;
          case "anthropic":
            const anthropic = new (require("@anthropic-ai/sdk"))({ apiKey: decryptedKey });
            responseData = await anthropic.messages.create(JSON.parse(payload));
            statusCode = 200;
            promptTokens = responseData.usage?.input_tokens;
            completionTokens = responseData.usage?.output_tokens;
            totalTokens = (promptTokens || 0) + (completionTokens || 0);
            break;
          case "google":
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(decryptedKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or get from payload
            responseData = await model.generateContent(JSON.parse(payload).prompt);
            statusCode = 200;
            // Google's token counting is done separately, so we might not have it here
            // This would require another call or a different implementation
            break;
          case "cohere":
            const { CohereClient } = require("cohere-ai");
            const cohere = new CohereClient({ token: decryptedKey });
            responseData = await cohere.chat(JSON.parse(payload));
            statusCode = 200;
            promptTokens = responseData.meta?.billedUnits?.inputTokens;
            completionTokens = responseData.meta?.billedUnits?.outputTokens;
            totalTokens = (promptTokens || 0) + (completionTokens || 0);
            break;
          default:
            throw new Error("Provider not supported for proxy.");
        }

        return {
          success: true,
          data: JSON.stringify(responseData),
        };
      } catch (error: any) {
        statusCode = error.response?.status || 500;
        return {
          success: false,
          error: error.message,
        };
      } finally {
        const responseTime = Date.now() - startTime;
        await prisma.apiUsageLog.create({
          data: {
            apiKeyId,
            statusCode,
            responseTime,
            promptTokens,
            completionTokens,
            totalTokens,
          },
        });
      }
    },

    register: async (
      _: any,
      { email, password, name }: any
    ) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },
    login: async (_: any, { email, password }: any) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("No such user found");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },
    addApiKey: async (
      _: any,
      {
        name,
        provider,
        apiKey,
        teamId,
      }: { name: string; provider: string; apiKey: string, teamId?: string },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");

      // If teamId is provided, check if user is part of the team
      if (teamId) {
        const membership = await prisma.teamMembership.findFirst({
          where: { teamId, userId: context.userId },
        });
        if (!membership) throw new Error("You are not a member of this team.");
      }

      // 1. Immediately save the key with "verifying" status
      const encryptedKey = encrypt(apiKey);
      const maskedKey = `${apiKey.substring(0, 4)}....${apiKey.substring(
        apiKey.length - 4
      )}`;

      const newKey = await prisma.apiKey.create({
        data: {
          name,
          provider,
          encryptedKey,
          maskedKey,
          status: "verifying",
          userId: teamId ? null : context.userId, // Assign to user OR team
          teamId: teamId,
        },
      });

      // 2. Start validation in the background (fire and forget)
      (async () => {
        const strategy = getProviderStrategy(provider);
        if (strategy) {
          const { isValid, metadata } = await strategy.validate(apiKey);
          await prisma.apiKey.update({
            where: { id: newKey.id },
            data: {
              status: isValid ? "active" : "invalid",
              metadata,
            },
          });
        } else {
          // If no strategy, mark as active but with a note
          await prisma.apiKey.update({
            where: { id: newKey.id },
            data: {
              status: "active",
              metadata: { note: "Provider not supported for validation." },
            },
          });
        }
      })().catch(console.error);

      // 3. Return the key immediately to the user
      return {
        ...newKey,
        fullKey: apiKey,
      };
    },
    deleteApiKey: async (
      _: any,
      { id }: { id: string },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");
      
      const apiKey = await prisma.apiKey.findFirst({
        where: { id, OR: [{ userId: context.userId }, { team: { members: { some: { userId: context.userId } } } }] },
      });

      if (!apiKey) {
        throw new Error("API key not found or you do not have permission");
      }
      
      // Additional check: only team admins or key owner can delete
      if (apiKey.teamId) {
        const membership = await prisma.teamMembership.findFirst({
          where: { teamId: apiKey.teamId, userId: context.userId },
        });
        if (membership?.role !== 'ADMIN') {
          throw new Error("Only team admins can delete this key.");
        }
      }

      return prisma.apiKey.delete({
        where: { id },
      });
    },
    updateApiKey: async (
      _: any,
      { id, name }: { id: string; name: string },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");
      
      const apiKey = await prisma.apiKey.findFirst({
        where: { id, OR: [{ userId: context.userId }, { team: { members: { some: { userId: context.userId } } } }] },
      });

      if (!apiKey) {
        throw new Error("API key not found or you do not have permission");
      }

      return prisma.apiKey.update({
        where: { id },
        data: { name },
      });
    },
    createTeam: async (_: any, { name }: { name: string }, context: MyContext) => {
      if (!context.userId) {
        throw new Error("Not authenticated");
      }
      
      // Re-assign to a new const to help TS infer it's not undefined
      const adminUserId = context.userId;

      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const team = await tx.team.create({
          data: { name },
        });

        await tx.teamMembership.create({
          data: {
            teamId: team.id,
            userId: adminUserId,
            role: 'ADMIN',
          },
        });

        return team;
      });
    },
    addUserToTeam: async (
      _: any,
      { teamId, email, role }: { teamId: string; email: string; role: string },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");

      const membership = await prisma.teamMembership.findFirst({
        where: { teamId, userId: context.userId, role: 'ADMIN' },
      });
      if (!membership) throw new Error("Only team admins can add users.");

      const userToAdd = await prisma.user.findUnique({ where: { email } });
      if (!userToAdd) throw new Error("User with that email not found.");

      await prisma.teamMembership.create({
        data: { teamId, userId: userToAdd.id, role },
      });

      return prisma.team.findUnique({ where: { id: teamId } });
    },
    removeUserFromTeam: async (
      _: any,
      { teamId, userId }: { teamId: string; userId: string },
      context: MyContext
    ) => {
      if (!context.userId) throw new Error("Not authenticated");

      const adminMembership = await prisma.teamMembership.findFirst({
        where: { teamId, userId: context.userId, role: 'ADMIN' },
      });
      if (!adminMembership) throw new Error("Only team admins can remove users.");

      if (context.userId === userId) {
        throw new Error("Admins cannot remove themselves.");
      }

      await prisma.teamMembership.delete({
        where: { userId_teamId: { teamId, userId } },
      });

      return prisma.team.findUnique({ where: { id: teamId } });
    }
  },
};
