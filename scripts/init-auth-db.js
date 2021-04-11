/* eslint-disable no-undef, no-restricted-globals */
print('Start #################################################################');

db = db.getSiblingDB('db');
db.createUser(
  {
    user: 'auth-user',
    pwd: 'auth-pass',
    roles: [{ role: 'readWrite', db: 'db' }]
  }
);
db.createCollection('users');

print('END #################################################################');
