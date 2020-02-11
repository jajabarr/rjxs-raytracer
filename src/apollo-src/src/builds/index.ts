import { query, mutation } from './builds';
import { loader } from 'graphql.macro';
const QueryGQL = loader('./get-builds.graphql');
const MutationGQL = loader('./set-builds.graphql');

export const Build = {
  resolvers: {
    query,
    mutation
  },
  query: QueryGQL,
  mutation: MutationGQL
};
