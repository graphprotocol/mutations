# User Guide

# dApp Developer
## Instantiating The `Mutations` Module

In order to use the mutations module, we must first instantiate it using `createMutations`:  
```ts
import exampleMutations from 'example-mutations'
import { createMutations } from '@graphprotocol/mutations'

const mutations = createMutations({
  mutations: exampleMutations,
  subgraph: "example",
  node: "http://localhost:8080",
  config: {
    // Configuration arguments can be defined as values,
    // or functions that return values
    ethereum: async () => {
      const { ethereum } = window

      if (!ethereum) {
        throw Error("Please install metamask")
      }

      await ethereum.enable()
      return window.web3.currentProvider
    },
    ipfs: "http://localhost:5001"
  }
})
```

## Execute Mutations
`NOTE: If you're using Apollo Client, please see the @graphprotocol/mutations-apollo-react docs.`  

Once the mutations are instantiated with `createMutations(...)`, we can now call the `execute(...)` method to execute a mutation like so:  
```typescript
import gql from 'graphql-tag'

let context = { }

const { data } = await mutations.execute({
  query: gql`
    mutation Example($var: String!) {
      example(var: $var)
    }
  `,
  setContext: (newContext: any) => {
    context = newContext
    return context
  },
  getContext: () => context
})

console.log(data.example) // example's return value
```

## Get Mutation State Updates
If the mutations module dispatches state updates, you can subscribe to them like so:  
```typescript
import {
  MutationStatesSubject,
  MutationStates
} from '@graphprotocol/mutations'

// Custom mutation state (optional)
import { State, EventMap } from 'example-mutations`

const subject = new MutationStatesSubject<State, EventMap>({ })

// Called every time there's a state update
subject.subscribe((state: MutationStates<State, EventMap>) => {
  // All state values can be accessed like so:
  state.example.progress

  // Including any custom state variables defined
  // in 'example-mutations'
  state.example.customValue
})

let context = { }

const { data } = await mutations.execute({
  query: gql`
    mutation Example($var: String!) {
      example(var: $var)
    }
  `,
  stateSubject: subject,
  setContext: (newContext: any) => {
    context = newContext
    return context
  },
  getContext: () => context
})
```

## Re-Configure Mutations Module
If you'd like to re-configure the mutations module, you can do so like so:  
```typescript
await mutations.configure({
  ethereum: ...,
  ipfs: "..."
})
```

# Subgraph Developer
For more in-depth information on how to add mutations to your subgraph's project, please read more [here](https://thegraph.com/docs/mutations). In the following sections we'll only cover the parts that involve the `@graphprotocol/mutations` API.  

## Implement Mutation Resolvers
```typescript
import {
  MutationContext,
  MutationResolvers
} from '@graphprotocol/mutations'

// Define Config (see sections below)
...

// Define Custom State (see sections below)
...

type Context = MutationContext<Config, State, EventMap>

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    example: (_: any, variables: any, context: Context) => {
      const { var } = variables
      ...
    }
  }
}

// Ensure the resolvers are exported
// as apart of the default export
export default {
  resolvers,
  ...
}
```

## Mutation Module Configuration
```typescript
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return ipfsHttpClient(endpoint)
  },
}

type Config = typeof config

...

// Ensure the config is exported
// as part of the default export
export default {
  ...
  config,
  ...
}

// Additionally, we export the config's type
export { Config }
```

## Mutation State
```typescript
import {
  EventPayload,
  MutationState,
  StateBuilder,
} from '@graphprotocol/mutations'

interface State {
  customValue: string
}

interface CustomEvent extends EventPayload {
  value: string
}

type EventMap = {
  CUSTOM_EVENT: CustomEvent
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      customValue: ''
    }
  },
  reducers: {
    CUSTOM_EVENT: async (state: MutationState<State>, payload: CustomEvent) => {
      return {
        customValue: payload.value
      }
    }
  }
}

...

// Ensure the stateBuilder is exported
// as part of the default export
export default {
  ...
  stateBuilder
}

// Additionally, we export the state & event map types,
// along with all custom event types
export { State, EventMap, CustomEvent }
```

## All Together
Putting all the pieces together:  
```typescript
import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder
} from '@graphprotocol/mutations'

import {
  AsyncSendable,
  Web3Provider
} from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'

interface State {
  customValue: string
}

interface CustomEvent extends EventPayload {
  value: string
}

type EventMap = {
  CUSTOM_EVENT: CustomEvent
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      customValue: ''
    }
  },
  reducers: {
    CUSTOM_EVENT: async (state: MutationState<State>, payload: CustomEvent) => {
      return {
        customValue: payload.value
      }
    }
  }
}

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return ipfsHttpClient(endpoint)
  },
}

type Config = typeof config

type Context = MutationContext<Config, State, EventMap>

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    example: (_: any, variables: any, context: Context) => {
      const { var } = variables
      ...
    }
  }
}

export default {
  config,
  resolvers,
  stateBuilder
}

export {
  Config,
  CustomEvent,
  EventMap,
  State
}
```
