import bcrypt from 'bcryptjs';

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 10 /* salt rounds */);

const passwordMatchesHash = (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);

export { hashPassword, passwordMatchesHash };
