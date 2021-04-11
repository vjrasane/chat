const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const retry = async <T>(operation:
    () => T | Promise<T>, interval: number = 0, retries: number = Infinity): Promise<T> => {
  try {
    return await operation();
  } catch (err) {
    if (retries <= 0) throw err;
    await sleep(interval);
    return retry(operation, interval, retries - 1);
  }
};

export { sleep, retry };
