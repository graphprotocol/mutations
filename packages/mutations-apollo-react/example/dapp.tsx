import * as React from 'react'
import { createMutations } from '@graphprotocol/mutations'
import {
  createMutationsLink,
  Mutation,
  useMutation,
} from '../src'

import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'

const schema = `
  type Mutation {
    testResolve: Boolean!
  }
`

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    },
  },
}

const mutations = createMutations({
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

const mutationLink = createMutationsLink({ mutations })

const client = new ApolloClient({
  link: mutationLink,
  cache: new InMemoryCache(),
})


const EXAMPLE = gql`
  mutation example($input: String!) {
    example(input: $input) {
      output
    }
  }
`

export function Component() {
  const [exec, { state }] = useMutation(EXAMPLE, {
    variables: {
      input: '...',
    },
    client,
  })

  return (
    <Mutation mutation={EXAMPLE} client={client}>
      {(exec, { state }) => (
        <div>
          {state.example ? state.example.progress : ''}
        </div>
      )}
    </Mutation>
  )
}
