import { Request, Response, Router } from 'express';
import { object, string, guard } from 'decoders';
import { isObject } from 'lodash/fp';
import { AuthService } from './auth-service';
import { UserService, User } from './user-service';
import { passwordMatchesHash } from './utils';

const credentialsDecoder = object({
  username: string,
  password: string
});

type Services = {
    authService: AuthService,
    userService: UserService
}

const initRoutes = (router: Router, services: Services) => {
  const { authService, userService } = services;

  const loginHandler = async (req: Request, res: Response) => {
    let username: string; let password: string;
    try {
      ({ username, password } = guard(credentialsDecoder)(req.body));
    } catch (err) {
      return res.status(400).send(err.message);
    }

    const user: User | null = await userService.getUser(username);
    if (!user || !(await passwordMatchesHash(password, user.password))) {
      return res.status(401).send();
    }

    try {
      const jwt: string = authService.generateJwt(
        {
          id: user.id,
          username: user.username
        }
      );
      res.status(200).send(jwt);
    } catch (err) {
      res.status(401).send();
    }
  };

  const signupHandler = async (req: Request, res: Response) => {
    try {
      const { username, password } = guard(credentialsDecoder)(req.body);
      await userService.createUser(username, password);
    } catch (err) {
      return res.status(400).send(err.message);
    }

    res.status(200).send();
  };

  const verifyHandler = (req: Request, res: Response) => {
    try {
      const { token } = guard(object({ token: string }))(req.body);
      const verified = authService.verifyJwt(token);
      if (!isObject(verified)) {
        return res.status(400).send(verified);
      }
      return res.status(200).send(verified);
    } catch (err) {
      return res.status(400).send(err.message);
    }
  };

  router.post('/auth/login', loginHandler);
  router.post('/auth/signup', signupHandler);
  router.post('/auth/verify', verifyHandler);
};

export { initRoutes };
