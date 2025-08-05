import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
  }

  type ApiKey {
    id: ID!
    name: String!
    provider: String!
    maskedKey: String!
    status: String!
    expiresAt: DateTime
    createdAt: DateTime!
    # This field is only populated on creation
    fullKey: String
    usageLogs: [ApiUsageLog]
    securityAlerts: [SecurityAlert]
    costAlerts: [CostAlert]
    auditLogs: [AuditLog]
  }

  type Team {
    id: ID!
    name: String!
    members: [User]
    apiKeys: [ApiKey]
  }

  type ApiUsageLog {
    id: ID!
    timestamp: DateTime!
    statusCode: Int!
    responseTime: Int!
    promptTokens: Int
    completionTokens: Int
    totalTokens: Int
  }

  type ProxyResponse {
    success: Boolean!
    data: String # JSON stringified data
    error: String
  }

  type SecurityAlert {
    id: ID!
    type: String!
    details: String!
    status: String!
    createdAt: DateTime!
  }

  type CostAlert {
    id: ID!
    threshold: Float!
    period: String!
    triggerPercent: Int!
    notification: String!
  }

  type AuditLog {
    id: ID!
    action: String!
    details: String
    createdAt: DateTime!
    user: User
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardStats {
    totalKeys: Int!
    activeAlerts: Int!
    monthlyCost: Float!
    avgResponseTime: Int!
  }

  type Query {
    # Filter by status, provider, or team. Add pagination.
    apiKeys(status: String, provider: String, teamId: ID, limit: Int, offset: Int): [ApiKey]
    apiKey(id: ID!): ApiKey
    teams: [Team]
    team(id: ID!): Team
    getDashboardStats: DashboardStats
  }

  type Mutation {
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    proxyRequest(apiKeyId: ID!, provider: String!, endpoint: String!, payload: String!): ProxyResponse!

    addApiKey(name: String!, provider: String!, apiKey: String!, teamId: ID): ApiKey!
    updateApiKey(id: ID!, name: String): ApiKey
    deleteApiKey(id: ID!): ApiKey

    createTeam(name: String!): Team!
    addUserToTeam(teamId: ID!, email: String!, role: String!): Team
    removeUserFromTeam(teamId: ID!, userId: ID!): Team
  }
`;
