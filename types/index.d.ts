type JWTPayload = {
  id: string;
  username: string;
};

declare global {
  namespace Express {
    interface Request {
      token?: JWTPayload;
    }
  }
}

export {};
