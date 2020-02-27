import { MutationExecutor } from '../types'
import { MutationQuery, MutationResult } from '../../types'
import { EventTypeMap } from '../../mutationState'

import { execute, GraphQLSchema, OperationDefinitionNode, FieldNode } from 'graphql'

const localResolver: MutationExecutor = <
  TState,
  TEventMap extends EventTypeMap
>(
  query: MutationQuery<TState, TEventMap>,
  schema: GraphQLSchema,
): Promise<MutationResult> => {

  const results: Promise<any>[] = []
  const queryDefs = query.query.definitions

  for (const def of queryDefs) {
    if (def.kind === 'OperationDefinition') {
      const operation = def as OperationDefinitionNode

      // Save a copy of the original field selections
      const selectionSet = operation.selectionSet
      const selections = [...selectionSet.selections]

      for (const selection of selections) {

        // Augment the original document, allowing us to query
        // one field at a time
        selectionSet.selections = [selection]

        // TODO: handle aggregating results + fix state aggregation + update docs
        results.push(
          new Promise(async (resolve) => {
            resolve(
              await execute({
                schema: schema,
                document: query.query,
                contextValue: query.getContext(),
                variableValues: query.variables,
              })
            )
          })
        )
      }
    } else {
      throw Error(`Unrecognized DefinitionNode.kind ${def.kind}`)
    }
  }

  return Promise.all(results)
}

export default localResolver
