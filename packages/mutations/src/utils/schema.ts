import { makeRepeatedUnique } from './array'

import { DocumentNode } from 'graphql'
import { visit } from 'graphql/language/visitor'

export const getUniqueMutations = (doc: DocumentNode, resolverNames: string[]) => {
  let names: string[] = []

  visit(doc, {
    OperationDefinition(node) {
      node.selectionSet.selections.reduce((result: string[], selection) => {
        if (selection.kind === 'Field' && resolverNames.includes(selection.name.value)) {
          result.push(selection.name.value)
        }
        return result
      }, names)
    },
  })

  return makeRepeatedUnique(names)
}
