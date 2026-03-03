import jwt from "jsonwebtoken";

type AppRole = "customer" | "admin";

type JwtPayload = {
  sub: string;
  email: string;
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": AppRole;
    "x-hasura-allowed-roles": AppRole[];
    "x-hasura-user-id": string;
  };
};

export function signUserToken(userId: string, email: string, role: AppRole): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload: JwtPayload = {
    sub: userId,
    email,
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": role,
      "x-hasura-allowed-roles": [role],
      "x-hasura-user-id": userId
    }
  };

  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}
