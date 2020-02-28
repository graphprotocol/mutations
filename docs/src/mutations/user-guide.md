# User Guide

## 1. Instantiating The `Mutations` Module

In order to use the mutation resolvers module, we must first instantiate it using `createMutations`:  
`App.tsx`
```ts
import myMutations from 'my-mutations'
import { createMutations } from '@graphprotocol/mutations'

const mutations = createMutations({
  mutations: gravatarMutations,
  subgraph: "example",
  node: "http://localhost:8080",
  config: {
    // Configuration arguments can be defined as values,
    // or functions that return values
    ethereum: async () => {
      const { ethereum } = (window as any)

      if (!ethereum) {
        throw Error("Please install metamask")
      }

      await ethereum.enable()
      return (window as any).web3.currentProvider
    },
    ipfs: "http://localhost:5001"
  }
})

...
``` 

## 2. Creating an Apollo Link & Client

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