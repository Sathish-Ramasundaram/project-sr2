type HasuraError = {
  message: string;
};

type HasuraResponse<T> = {
  data?: T;
  errors?: HasuraError[];
};

export async function hasuraAdminRequest<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const url = process.env.HASURA_GRAPHQL_URL;
  const adminSecret = process.env.HASURA_ADMIN_SECRET;

  if (!url || !adminSecret) {
    throw new Error("HASURA_GRAPHQL_URL / HASURA_ADMIN_SECRET is not set");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": adminSecret
    },
    body: JSON.stringify({ query, variables })
  });

  const json = (await response.json()) as HasuraResponse<T>;

  if (!response.ok) {
    throw new Error(`Hasura HTTP error: ${response.status}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("Hasura response has no data");
  }

  return json.data;
}
