import {
  Mutations,
  MutationsModule,
  MutationContext,
  MutationQuery,
  InternalMutationContext,
  QueryExecutor,
} from './types'
import { ConfigGenerators, ConfigArguments, ConfigProperties } from './config'
import { validateConfig, createConfig } from './config'
import {
  CoreState,
  CoreEvents,
  EventTypeMap,
  StateUpdater,
  MutationState,
  MutationStates,
  MutationStateSubject,
} from './mutationState'
import { getUniqueMutations } from './utils'
import { execute } from './execute'

import { v4 } from 'uuid'
import { combineLatest } from 'rxjs'
import { buildSchema } from 'graphql'

interface CreateMutationsOptions<
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> {
  mutations: MutationsModule<TConfig, TState, TEventMap>
  config: ConfigArguments<TConfig>
  queryExecutor?: QueryExecutor
}

const createMutations = <
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
>(
  options: CreateMutationsOptions<TConfig, TState, TEventMap>,
): Mutations<TConfig, TState, TEventMap> => {
  const { mutations, config } = options

  // Validate that the configuration getters and setters match 1:1
  validateConfig(config, mutations.config)

  // One config instance for all mutation executions
  let configProperties: ConfigProperties<TConfig> | undefined = undefined

  // Build the schema from the source
  let schema = buildSchema(mutations.schema)

  // If there's no Query type, add one to avoid execution errors
  if (!schema.getQueryType()) {
    const schemaWithQuery = mutations.schema + `type Query { _: String }`
    schema = buildSchema(schemaWithQuery)
  }

  const mutation = schema.getMutationType()

  if (!mutation) {
    throw Error(`type Mutation { ... } missing from the mutations module's schema`)
  }

  // Wrap each resolver and add a mutation state instance to the context
  const mutationFields = mutation.getFields()
  const mutationNames = Object.keys(mutationFields)

  for (const mutationName of mutationNames) {
    const field = mutationFields[mutationName]
    const resolver = mutations.resolvers.Mutation[mutationName]

    // Wrap the resolver
    field.resolve = async (source, args, context, info) => {
      const internalContext = context as InternalMutationContext<
        TConfig,
        TState,
        TEventMap
      >
      const rootSubject = internalContext.graph?.rootSubject
      const mutationSubjects = internalContext.graph?.mutationSubjects
      const mutationsCalled = internalContext.graph?.mutationsCalled

      // If a root mutation state sub is being used, and we haven't
      // instantiated subscribes for each mutation being executed...
      if (rootSubject && mutationSubjects.length === 0) {
        // Create observers for each mutation that's called
        mutationsCalled.forEach(() => {
          mutationSubjects.push(
            new MutationStateSubject<TState, TEventMap>(
              {} as MutationState<TState, TEventMap>,
            ),
          )
        })

        // Subscribe to all of the mutation observers
        combineLatest(mutationSubjects).subscribe(values => {
          const result: MutationStates<TState, TEventMap> = {}

          values.forEach((value, key) => {
            result[mutationsCalled[key]] = value
          })

          rootSubject.next(result)
        })
      }

      // Generate a unique ID for this resolver execution
      let uuid = v4()

      // Create a new StateUpdater for the resolver to dispatch updates through
      const state = new StateUpdater<TState, TEventMap>(
        uuid,
        mutations.stateBuilder,
        // Initialize StateUpdater with a state subscription if one is present
        rootSubject ? mutationSubjects.shift() : undefined,
      )

      // Create a new context with the state added to context.graph
      const newContext: MutationContext<TConfig, TState, TEventMap> = {
        ...context,
        graph: {
          ...context.graph,
          state,
        },
      }

      // Execute the resolver
      return await resolver(source, args, newContext, info)
    }
  }

  return {
    execute: async (mutationQuery: MutationQuery<TState, TEventMap>) => {
      const { setContext, getContext, query, stateSubject } = mutationQuery

      // Create the config instance during
      // the first mutation execution
      if (!configProperties) {
        configProperties = await createConfig(config, mutations.config)
      }

      const context = getContext() as InternalMutationContext<TConfig, TState, TEventMap>

      const graphContext: InternalMutationContext<TConfig, TState, TEventMap> = {
        graph: {
          config: configProperties,
          // This will get overridden by the wrapped resolver above
          state: {} as StateUpdater<TState, TEventMap>,
          rootSubject: stateSubject ? stateSubject : context.graph?.rootSubject,
          mutationSubjects: [],
          mutationsCalled: getUniqueMutations(
            query,
            Object.keys(mutations.resolvers.Mutation),
          ),
        },
      }

      // Set the context
      setContext({
        ...context,
        ...graphContext,
      })

      // Execute the mutation
      return await execute(mutationQuery, schema)
    },
    configure: async (config: ConfigArguments<TConfig>) => {
      validateConfig(config, mutations.config)
      configProperties = await createConfig(config, mutations.config)
    },
  }
}

export { createMutations }

export { MutationContext, MutationResolvers, MutationResult, Mutations } from './types'

export { ConfigGenerators } from './config'

export {
  CoreState,
  CoreEvents,
  Event,
  EventPayload,
  EventTypeMap,
  MutationState,
  MutationStates,
  MutationStatesSubject,
  ProgressUpdateEvent,
  StateBuilder,
  StateUpdater,
  TransactionCompletedEvent,
  TransactionCreatedEvent,
  TransactionErrorEvent,
} from './mutationState'
