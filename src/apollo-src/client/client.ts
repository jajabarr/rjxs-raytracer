import { ApolloClient, Resolver } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { loader } from 'graphql.macro';
import * as resolvers from '../src';
const typeDefs = loader('../src/schema.graphql');

const _parseResolvers = (field: 'query' | 'mutation') =>
  Object.assign(
    {},
    ...Object.entries(resolvers)
      .map(imported => {
        const [key, { resolvers }] = imported;
        return { [`${key.toLowerCase()}`]: resolvers[field] } as {
          [field: string]: Resolver;
        };
      })
      .filter(Boolean)
  ) as { [field: string]: Resolver };

const Queries = _parseResolvers('query');
const Mutations = _parseResolvers('mutation');

export const client = new ApolloClient({
  typeDefs,
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first'
    }
  },
  resolvers: {
    Query: { ...Queries },
    Mutation: { ...Mutations }
  }
});
