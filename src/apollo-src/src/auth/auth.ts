import { InMemoryCache } from 'apollo-cache-inmemory';

export const query = () => {
  return {
    __typename: 'auth',
    id: 'auth',
    valid: false
  };
};
export const mutation = (
  _: any,
  { valid, id }: { valid: boolean; id: string },
  { cache }: { cache: InMemoryCache }
) => {
  const data = { auth: { __typename: 'auth', id: 'auth', valid } };
  cache.writeData({ data });
};
