import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { createMutations, createMutationsLink, MutationContext } from '@graphprotocol/mutations'

export const statesToPublish = [ 0.1, 0.2, 0.3 ]

const schema = `
  type Mutation {
    publishStates: Boolean!
    returnTrue: Boolean!
  }
`

const resolvers = {
  Mutation: {
    publishStates: async (_: any, __: any, context: MutationContext<{}>) => {
      context.graph.state.dispatch('PROGRESS_UPDATE', { value: 0.1 })
      context.graph.state.dispatch('PROGRESS_UPDATE', { value: 0.2 })
      context.graph.state.dispatch('PROGRESS_UPDATE', { value: 0.3 })
      return true
    },
    returnTrue: () => {
      return true
    },
  },
}

const mutations = createMutations({
  mutations: {
    resolvers,
    config: {},
    schema,
  },
  config: {},
  node: "",
  subgraph: "",
})

const link = createMutationsLink({ mutations })

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export const PUBLISH_STATES = gql`
  mutation publishStates {
    publishStates
  }
`

export const RETURN_TRUE = gql`
  mutation returnTrue {
    returnTrue
  }
`
