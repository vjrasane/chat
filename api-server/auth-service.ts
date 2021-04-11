import { Request } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import { JWK } from "node-jose";
import { first } from "lodash/fp";
import { Decoder, guard, object, string } from "decoders";

type JWTPayload = {
  id: string;
  username: string;
};

const jwtDecoder: Decoder<JWTPayload> = object({
  id: string,
  username: string,
});

type AuthService = {
  verifyRequestToken: (req: Request) => JWTPayload;
};

type AuthConfig = {
  keystorePath: string;
};

const getJWK = async (keystorePath: string): Promise<JWK.Key> => {
  const keystore: JWK.KeyStore = await JWK.asKeyStore(
    fs.readFileSync(keystorePath, "utf-8")
  );
  const rawKeys: JWK.RawKey[] = await keystore.all({ kty: "RSA" });
  return JWK.asKey(first(rawKeys) as JWK.RawKey);
};

const createAuthService = async (config: AuthConfig): Promise<AuthService> => {
  const { keystorePath } = config;

  const key: JWK.Key = await getJWK(keystorePath);

  const verifyRequestToken = (req: Request): JWTPayload => {
    const [method, token] = req.headers.authorization?.split(" ") || [];
    if (method !== "Bearer" || !token) {
      throw new Error("no brearer authorization token");
    }
    const decodedToken = jwt.verify(token, key.toPEM(), {
      algorithms: ["RS256"],
    });
    return guard(jwtDecoder)(decodedToken);
  };

  return {
    verifyRequestToken,
  };
};

export { createAuthService, AuthService };
