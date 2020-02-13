import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'

export const schema = gql`
  extend type Todo {
    id: ID!
    asignee: String!
    description: String!
    completed: Boolean!
  }
  input CreateInput {
    asignee: String!
    description: String!
  }
  extend type Query {
    getTodos: [Todo]
  }
  extend type Mutation {
    testResolve: Boolean!
  }
`

export const statesToPublish = [
  { testResolve: 'First' },
  { testResolve: 'Second' },
  { testResolve: 'Third' },
]

const cache = new InMemoryCache()
cache.writeData({
  data: {
    getTodos: [],
  },
})

export const client = new ApolloClient({
  resolvers: {
    Mutation: {
      testResolve: async (_, __, context) => {
        if (!context._rootSubject) {
          return false
        }
        context._rootSubject.next(statesToPublish[0])
        context._rootSubject.next(statesToPublish[1])
        context._rootSubject.next(statesToPublish[2])
        return true
      },
    },
  },
  cache,
  typeDefs: schema,
})

export const TEST_RESOLVER = gql`
  mutation testResolve {
    testResolve @client
  }
`
