# User Guide

## Instantiating The `Mutations` Module

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

TODO execute, listen to state updates, configure, define resolvers, define config, define state builder + events
