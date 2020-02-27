import {
  MutationQuery,
  MutationResult,
  Query,
  QueryResult
} from '../types'
import { EventTypeMap } from '../mutationState'

import { GraphQLSchema } from 'graphql'

export type MutationExecutor = <
  TState,
  TEventMap extends EventTypeMap
> (
  query: MutationQuery<TState, TEventMap>,
  schema: GraphQLSchema,
) => Promise<MutationResult>

export type QueryExecutor = (
  query: Query,
  uri: string,
) => Promise<QueryResult>
