import {
  CoreEvents,
  CoreState,
  EventTypeMap,
  MutationState,
  MutationStatesSubject,
  MutationStateSubjects,
  StateBuilder,
  StateUpdater,
} from './mutationState'
import { ConfigGenerators, ConfigArguments, ConfigProperties } from './config'

import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'
import { GraphQLFieldResolver } from 'graphql'

export interface MutationsModule<
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> {
  resolvers: MutationResolvers<TConfig, TState, TEventMap>
  config: TConfig
  stateBuilder?: StateBuilder<TState, TEventMap>
}

export interface MutationContext<
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> {
  [prop: string]: any
  graph: {
    config: ConfigProperties<TConfig>
    state: StateUpdater<TState, TEventMap>
  }
}

export interface InternalMutationContext<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> extends MutationContext<TConfig, TState, TEventMap> {
  _mutationsCalled: string[]
  _rootSub?: MutationStatesSubject<TState, TEventMap>
  _mutationSubs: MutationStateSubjects<TState, TEventMap>
}

export interface MutationResolvers<
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> {
  Mutation: {
    [field: string]: GraphQLFieldResolver<
      any,
      MutationContext<TConfig, TState, TEventMap>
    >
  }
}

export interface MutationQuery<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> {
  query: DocumentNode
  variables: Record<string, any>
  operationName: string
  extensions?: Record<string, any>
  setContext: (context: any) => any
  getContext: () => any
  stateSub?: MutationStatesSubject<TState, TEventMap>
}

export type MutationResult = ExecutionResult

export interface Mutations<
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> {
  execute: (query: MutationQuery<TState, TEventMap>) => Promise<MutationResult>
  configure: (config: ConfigArguments<TConfig>) => Promise<void>
}
