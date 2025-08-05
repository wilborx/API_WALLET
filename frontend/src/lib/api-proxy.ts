import { gql } from '@apollo/client';
import client from './apollo-client';

const PROXY_REQUEST_MUTATION = gql`
  mutation ProxyRequest(
    $apiKeyId: ID!
    $provider: String!
    $endpoint: String!
    $payload: String!
  ) {
    proxyRequest(
      apiKeyId: $apiKeyId
      provider: $provider
      endpoint: $endpoint
      payload: $payload
    ) {
      success
      data
      error
    }
  }
`;

export const callApiProxy = async (
  apiKeyId: string,
  provider: string,
  endpoint: string,
  payload: object
) => {
  try {
    const { data } = await client.mutate({
      mutation: PROXY_REQUEST_MUTATION,
      variables: {
        apiKeyId,
        provider,
        endpoint,
        payload: JSON.stringify(payload),
      },
    });

    if (data.proxyRequest.success) {
      return JSON.parse(data.proxyRequest.data);
    } else {
      throw new Error(data.proxyRequest.error || 'Proxy request failed');
    }
  } catch (error) {
    console.error('Error calling API via proxy:', error);
    throw error;
  }
};
