import { BaseMutationOptionsWithState, MutationTupleWithState } from './types'
import {
  CoreEvents,
  CoreState,
  ConfigGenerators,
  EventTypeMap,
  MutationResult,
  Mutations,
  MutationStates,
  MutationStatesSubject,
} from '@graphprotocol/mutations'

import { useEffect, useState } from 'react'
import {
  useMutation as apolloUseMutation,
  MutationHookOptions,
} from '@apollo/react-hooks'
import { OperationVariables } from '@apollo/react-common'
import { ApolloLink, Operation, Observable } from 'apollo-link'
import { DocumentNode } from 'graphql'

export const createMutationsLink = <
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
>({
  mutations,
}: {
  mutations: Mutations<TConfig, TState, TEventMap>
}): ApolloLink => {
  return new ApolloLink((operation: Operation) => {
    const setContext = (context: any) => {
      return operation.setContext(context)
    }

    const getContext = () => {
      return operation.getContext()
    }

    return new Observable(observer => {
      mutations
        .execute({
          query: operation.query,
          variables: operation.variables,
          setContext: setContext,
          getContext: getContext,
        })
        .then((result: MutationResult) => {
          observer.next(result)
          observer.complete()
        })
    })
  })
}

export const useMutation = <
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents,
  TData = any,
  TVariables = OperationVariables
>(
  mutation: DocumentNode,
  options?: MutationHookOptions<TData, TVariables>,
): MutationTupleWithState<TState, TEventMap, TData, TVariables> => {
  const [state, setState] = useState({} as MutationStates<TState, TEventMap>)
  const [observable] = useState(new MutationStatesSubject<TState, TEventMap>({}))

  const graphContext = {
    graph: {
      rootSubject: observable,
    },
  }

  const updatedOptions = options
    ? {
        ...options,
        context: {
          ...options.context,
          ...graphContext,
        },
      }
    : {
        context: {
          ...graphContext,
        },
      }

  const [execute, result] = apolloUseMutation(mutation, updatedOptions)

  useEffect(() => {
    let subscription = observable.subscribe(
      (result: MutationStates<TState, TEventMap>) => {
        setState(result)
      },
    )
    return () => subscription.unsubscribe()
  }, [observable, setState])

  return [
    execute,
    {
      ...result,
      state,
    },
  ]
}

export const Mutation = <
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents,
  TData = any,
  TVariables = OperationVariables
>(
  props: BaseMutationOptionsWithState<TState, TEventMap, TData, TVariables>,
) => {
  const [runMutation, result] = useMutation<TState, TEventMap>(props.mutation, props)
  return props.children ? props.children(runMutation, result) : null
}
