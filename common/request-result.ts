import { curry } from "lodash/fp";

type RequestResult<T> =
  | {
      status: "success";
      data: T;
    }
  | { status: "loading" }
  | { status: "failed"; error: Error }
  | { status: "not asked" };

const mapResult = curry(
  <T, R>(mapper: (value: T) => R, res: RequestResult<T>): RequestResult<R> => {
    switch (res.status) {
      case "success":
        return { ...res, data: mapper(res.data) };
      default:
        return res;
    }
  }
);

const defaultResult = curry(
  <T>(defaultValue: T, res: RequestResult<T>): T => {
    switch (res.status) {
      case "success":
        return res.data;
      default:
        return defaultValue;
    }
  }
);

export { RequestResult, mapResult, defaultResult };
