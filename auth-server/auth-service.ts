import jwt from "jsonwebtoken";
import { JWK } from "node-jose";
import fs from "fs";
import { first } from "lodash/fp";

type JWTPayload = {
  id: string;
  username: string;
};

type AuthService = {
  generateJwt: (payload: JWTPayload) => string;
  verifyJwt: (token: string) => string | object;
};

type AuthConfig = {
  keystorePath: string;
};

const getJWK = async (keystorePath: string): Promise<JWK.Key> => {
  let keystore: JWK.KeyStore;
  let key: JWK.Key;
  if (!fs.existsSync(keystorePath)) {
    keystore = JWK.createKeyStore();
    key = await keystore.generate("RSA");
    fs.writeFileSync(keystorePath, JSON.stringify(keystore.toJSON(true)));
  } else {
    keystore = await JWK.asKeyStore(fs.readFileSync(keystorePath, "utf-8"));
    const rawKeys: JWK.RawKey[] = await keystore.all({ kty: "RSA" });
    key = await JWK.asKey(first(rawKeys) as JWK.RawKey);
  }
  return key;
};

const createAuthService = async (config: AuthConfig): Promise<AuthService> => {
  const { keystorePath } = config;

  const key: JWK.Key = await getJWK(keystorePath);

  const generateJwt = (payload: JWTPayload): string => {
    const token = jwt.sign(payload, key.toPEM(true), { algorithm: "RS256" });
    return token;
  };

  const verifyJwt = (token: string) =>
    jwt.verify(token, key.toPEM(), { algorithms: ["RS256"] });

  return {
    generateJwt,
    verifyJwt,
  };
};

export { createAuthService, AuthService, JWTPayload };
