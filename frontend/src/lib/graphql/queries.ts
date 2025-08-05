import { gql } from "@apollo/client";

export const GET_API_KEYS = gql`
  query GetApiKeys($status: String) {
    apiKeys(status: $status) {
      id
      name
      provider
      maskedKey
      status
      createdAt
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalKeys
      activeAlerts
      monthlyCost
      avgResponseTime
    }
  }
`;

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($id: ID!) {
    deleteApiKey(id: $id) {
      id
    }
  }
`;

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($id: ID!, $name: String!) {
    updateApiKey(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const ADD_API_KEY = gql`
  mutation AddApiKey($name: String!, $provider: String!, $apiKey: String!) {
    addApiKey(name: $name, provider: $provider, apiKey: $apiKey) {
      id
      name
      provider
      maskedKey
      status
      createdAt
      fullKey
    }
  }
`;
