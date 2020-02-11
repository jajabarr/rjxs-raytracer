import { loader } from 'graphql.macro';
import { query, mutation } from './auth';
const QueryGQL = loader('./get-auth.graphql');
const MutationGQL = loader('./set-auth.graphql');

export const Auth = {
  resolvers: {
    query,
    mutation
  },
  query: QueryGQL,
  mutation: MutationGQL
};
