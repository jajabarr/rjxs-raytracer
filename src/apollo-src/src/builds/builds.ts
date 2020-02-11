import { InMemoryCache } from 'apollo-cache-inmemory';

export const query = () => {
  return [];
};

export const mutation = (
  _: any,
  { builds }: { builds: any[] },
  { cache }: { cache: InMemoryCache }
) => {};
