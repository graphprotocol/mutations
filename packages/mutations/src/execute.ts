import { MutationQuery, MutationResult } from './types'
import { isPromise } from './utils'
import { EventTypeMap } from './mutationState'

import {
  execute as graphqlExecute,
  FieldNode,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql'

const execute = <TState, TEventMap extends EventTypeMap>(
  query: MutationQuery<TState, TEventMap>,
  schema: GraphQLSchema,
): Promise<MutationResult> => {
  return new Promise(async (resolve, reject) => {
    const results: MutationResult = {}
    const mutationCount: { [mutation: string]: number } = {}
    const queryDefs = query.query.definitions

    // For each mutation query definition
    for (const def of queryDefs) {
      if (def.kind !== 'OperationDefinition') {
        reject(Error(`Unrecognized DefinitionNode.kind ${def.kind}`))
        return
      }

      const operation = def as OperationDefinitionNode

      // Save a copy of the original field selections
      const selectionSet = operation.selectionSet
      const selections = [...selectionSet.selections]

      // For each mutation selected
      for (const selection of selections) {
        if (selection.kind !== 'Field') {
          reject(Error(`Unrecognized SelectionNode.kind ${selection.kind}`))
          return
        }

        if (!results.data) {
          results.data = {}
        }

        // Get the mutation name
        const field = selection as FieldNode
        const mutationName = field.name.value

        // Determine what this mutation execution's result
        // name should be: mutationName OR '${mutationName}_${number}
        let resultKey
        if (results.data[mutationName]) {
          if (!mutationCount[mutationName]) {
            mutationCount[mutationName] = 1
          }

          resultKey = `${mutationName}_${mutationCount[mutationName]++}`
        } else {
          resultKey = mutationName
        }

        // Augment the original document, allowing us to query
        // one field at a time
        selectionSet.selections = [selection]

        const result = graphqlExecute({
          schema: schema,
          document: query.query,
          contextValue: query.getContext(),
          variableValues: query.variables,
        })

        let mutationResult
        if (isPromise(result)) {
          mutationResult = await result
        } else {
          mutationResult = result as MutationResult
        }

        if (mutationResult.data) {
          results.data[resultKey] = mutationResult.data[mutationName]
        }

        if (mutationResult.errors) {
          if (!results.errors) {
            results.errors = []
          }
          results.errors = [...results.errors, ...mutationResult.errors]
        }
        results
      }
    }

    resolve(results)
  })
}

export { execute }
