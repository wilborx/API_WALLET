import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import jwt from "jsonwebtoken";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./resolvers/resolvers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface MyContext {
  userId?: string;
}

async function startServer() {
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      if (token) {
        try {
          const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET) as {
            userId: string;
          };
          return { userId: decoded.userId };
        } catch (e) {
          // Tolerate invalid tokens, just don't authenticate
          console.log("Invalid or expired token.");
        }
      }
      return {};
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();
