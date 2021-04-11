const getAuthorizationHeaders = (token: string) => ({
  authorization: `Bearer ${token}`,
});

export { getAuthorizationHeaders };
