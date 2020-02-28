import localResolver from '../mutation/localResolver'
import gql from 'graphql-tag'
import { buildSchema } from 'graphql'

describe('Mutation localResolver', () => {
  it('Detects invalid operations', async () => {
    try {
      await localResolver(
        {
          query: gql`
            input TestResolve {
              testResolve: Boolean
            }
          `,
          setContext: () => ({ }),
          getContext: () => ({ })
        },
        buildSchema(`
          type Mutation {
            testResolver: Boolean!
          }
        `)
      )

      expect('').toBe('This should never happen...')
    } catch (e) {
      expect(e.message).toBe(
        'Unrecognized DefinitionNode.kind InputObjectTypeDefinition'
      )
    }
  })

  it('Detects invalid field', async () => {
    try {
      await localResolver(
        {
          query: gql`
            mutation TestResolve {
              ... on Foo {
                something
              }
            }
          `,
          setContext: () => ({ }),
          getContext: () => ({ })
        },
        buildSchema(`
          type Mutation {
            testResolver: Boolean!
          }
        `)
      )

      expect('').toBe('This should never happen...')
    } catch (e) {
      expect(e.message).toBe(
        'Unrecognized SelectionNode.kind InlineFragment'
      )
    }
  })
})