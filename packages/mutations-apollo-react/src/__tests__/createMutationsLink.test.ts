import { createMutationsLink } from '../'
import {
  createMutations,
  Mutations,
} from '@graphprotocol/mutations'

import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'

const schema = `
  type Mutation {
    testResolve: Boolean!
    testError: Boolean!
  }
`

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    },
    testError: async () => {
      throw Error(`I'm an error...`)
    },
  },
}

describe('createMutationsLink', () => {
  let mutations: Mutations<{ }>

  beforeAll(() => {
    mutations = createMutations({
      mutations: {
        resolvers,
        config: { },
        schema,
      },
      subgraph: 'test',
      node: 'http://localhost:5000',
      config: {
        value: '...',
      },
    })
  })

  it('Successfully creates mutations link and executes mutation', async () => {
    const mutationLink = createMutationsLink({ mutations })
    const client = new ApolloClient({
      link: mutationLink,
      cache: new InMemoryCache(),
    })

    const { data } = await client.mutate({
      mutation: gql`
        mutation testResolve {
          testResolve
        }
      `,
    })

    expect(data && data.testResolve).toEqual(true)
  })

  it('Catches resolve execution errors', async () => {
    const mutationLink = createMutationsLink({ mutations })
    const client = new ApolloClient({
      link: mutationLink,
      cache: new InMemoryCache(),
    })

    try {
      await client.mutate({
        mutation: gql`
          mutation testResolve {
            testError
          }
        `,
      })

      expect('').toBe('This should never happen...')
    } catch (e) {
      expect(e.message).toEqual(`GraphQL error: I'm an error...`)
    }
  })
})
