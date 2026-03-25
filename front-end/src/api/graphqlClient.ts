import { getAuthToken } from "@/store/auth/authStorage";

type GraphQLErrorItem = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorItem[];
};

type GraphQLRequestOptions = {
  skipAuth?: boolean;
  endpoint?: string;
  authToken?: string;
};

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: GraphQLRequestOptions = {}
): Promise<T> {
  const endpoint =
    options.endpoint ??
    (typeof process !== "undefined" ? process.env?.HASURA_GRAPHQL_URL : undefined) ??
    "http://localhost:8080/v1/graphql";
  if (!endpoint) {
    throw new Error("HASURA_GRAPHQL_URL is not set");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (!options.skipAuth) {
    const token = options.authToken ?? getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables })
  });

  const result = (await response.json()) as GraphQLResponse<T>;

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error: ${response.status}`);
  }

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  if (!result.data) {
    throw new Error("GraphQL response has no data");
  }

  return result.data;
}
