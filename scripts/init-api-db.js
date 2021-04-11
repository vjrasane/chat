/* eslint-disable no-undef, no-restricted-globals */
print('Start #################################################################');

db = db.getSiblingDB('db');
db.createUser(
  {
    user: 'api-user',
    pwd: 'api-pass',
    roles: [{ role: 'readWrite', db: 'db' }]
  }
);
db.createCollection('messages');

print('END #################################################################');
