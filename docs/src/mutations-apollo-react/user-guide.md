# User Guide

## Creating an Apollo Link & Client

For ease of use, we'll create an Apollo Client that can be used inside of a React application to easily integrate our mutation queries with our UI.
First, we must wrap our `mutations` instance with an Apollo Link:  
```ts
import { createMutationsLink } from `@graphprotocol/mutations`

const mutationLink = createMutationsLink({ mutations })
```

And use the link within an Apollo Client. We'll first create a "root" link that splits our `query` and `mutation` queries. This way our data queries will be sent to the subgraph, and our mutation queries will be sent to our local resolvers:  

```tsx
import { createHttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

const queryLink = createHttpLink({ uri: `http://localhost:8080/subgraphs/name/example` })

// Combine (split) the query & mutation links
const link = split(
  ({ query }) => {
    const node = getMainDefinition(query)
    return node.kind === "OperationDefinition" && node.operation === "mutation"
  },
  mutationLink,
  queryLink
)

// Create the Apollo Client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})
```

At this point, you have a fully functional ApolloClient that can be used to send `query` and `mutation` queries, the same way you would within a web2 GraphQL application.

## `useMutation(...)` hook

Developers can just import `useMutation` from the `@graphprotocol/mutations-apollo-react` package, and consuming the state object can be done like so:

```ts
import { useMutation } from '@graphprotocol/mutations-apollo-react'

const MY_MUTATION = gql`
  mutation MyMutation() {
    myMutation
  }
`;

const Component = () => {
  const [exec, { data, loading, state }] = useMutation(MY_MUTATION)

  return (
    {loading ?
      <div>state.myMutation.progress</div> :
      <div>data.myMutation</div>
    }
  )
}
```

In order to access extended state properties, we can templatize the state object using the `State` interface we exported from the mutations module:  
```ts
import { Mutation } from '@graphprotocol/mutations-apollo-react'
import { MutationState } from '@graphprotocol/mutations'
import { State } from 'my-mutations'

const MY_MUTATION = gql`
  mutation MyMutation() {
    myMutation
  }
`;

const Component = () => {
  const [exec, { data, loading, state }] = useMutation<State>(MY_MUTATION)

  return (
    {loading ? 
      <div>state.myMutation.myValue</div> :
      <div>data.myMutation</div>
    }
  )
}
```

## Mutation component

Developers can just import `Mutation` component from the 'mutations-apollo-react' package, and consuming the state object can be done like so:

```ts
import { Mutation } from '@graphprotocol/mutations-apollo-react'

const MY_MUTATION = gql`
  mutation MyMutation() {
    myMutation
  }
`;

const Component = () => {
  return (
    <Mutation mutation={MY_MUTATION}>
    {(exec, { data, loading, state }) => (
      ...
    )}
    </Mutation>
  )
}
```

In order to access extended state properties, we can templatize the state object using the `State` interface we exported from the mutations module:  
```ts
import { Mutation } from '@graphprotocol/mutations-apollo-react'
import { MutationState } from '@graphprotocol/mutations'
import { State } from 'my-mutations'

const MY_MUTATION = gql`
  mutation MyMutation() {
    myMutation
  }
`;

const Component = () => {

  return (
    <Mutation mutation={MY_MUTATION}>
    {(exec, { data, loading, state: MutationState<State> }) => (
      ...
    )}
    </Mutation>
  )
}
```

## Additional notes

The `state` object gets refreshed every time the component re-renders, and any updates received by it will also trigger a component re-render. The state's structure is an object where each of its keys is the name of a mutation called in the mutation query. Each key has a `MutationState` object as value. In the case the same mutation is called more than once in the same mutation query, then each duplicated state key will be renamed to ${mutationName}_${n} where n is a consecutive number that corresponds to the nth time the mutation was called. For example:
```ts
const MY_MUTATION_TWICE = gql`
  mutation MyMutation() {
    myMutation
    myMutation
  }
`;

const Component = () => {
  const [exec, { data, loading, state }] = useMutation(MY_MUTATION_TWICE)

  return (
    {loading ?
      <>
        <div>state.myMutation.myValue</div>
        <div>state.myMutation_1.myValue</div>
      </> :
      <div>data.myMutation</div>
    }
  )
}
```
