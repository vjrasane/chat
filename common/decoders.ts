import {
  constant, either, number, either3, undefined_, null_,
  Decoder, compose, string, date, map, jsonObject, optional, predicate, hardcoded
} from 'decoders';
import fs from 'fs';

import { nonEmptyString } from 'decoders/string';

const stringToDate: Decoder<Date> = compose(
  map(string, (str: string) => new Date(str)),
  date
);

const stringToObject: Decoder<object> = compose(map(nonEmptyString, JSON.parse), jsonObject);

const emptyStringToUndefined: Decoder<string | undefined> = map(string, (str) => (str.length ? str : undefined));

const nonEmptyStringToObject: Decoder<object | undefined> = compose(emptyStringToUndefined, optional(stringToObject));

const stringToFilePath: Decoder<string> = compose(
  string,
  predicate(
    (str: string) => fs.existsSync(str), 'file must exist'
  )
);

const stringToBoolean: Decoder<boolean> = either(
  map(constant('false'), () => false),
  map(constant('true'), () => true)
);

const stringToInt: Decoder<number> = compose(
  map(string, (str: string) => parseInt(str, 10)),
  number
);

const withDefault = <T>(decoder: Decoder<T>, defaultValue: T): Decoder<T> => either3(
  compose(undefined_, hardcoded(defaultValue)),
  compose(null_, hardcoded(defaultValue)),
  decoder
);

const anyOf = <T>(decoders: Decoder<T>[]): Decoder<T> => {
  const [first, ...rest] = decoders;
  if (!rest.length) return first;
  return either(first, anyOf<T>(rest));
};

export {
  anyOf,
  stringToDate,
  stringToObject,
  stringToBoolean,
  emptyStringToUndefined,
  nonEmptyStringToObject,
  stringToFilePath,
  stringToInt,
  withDefault
};
