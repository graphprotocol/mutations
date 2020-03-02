# API Reference

## Functions

### `createMutationsLink`

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `mutations` |  `Mutations` | Mutations object, returned from `createMutations` function |

## Hooks

### `useMutation`

Wrapper of Apollo's useMutation React hook. Takes the same parameters but returns an additional "state" value. Native Apollo's `useMutation` hook full reference can be found [here](https://www.apollographql.com/docs/react/api/react-hooks/#options-2). However parameters and results worth mentioning because of specific behavior for this wrapper implementation are mentioned below:

* **Parameters**

  * **Options**:

| Property   |      Type      |  Description |
|----------|:-------------:|:------|
| `client` |  `ApolloClient` | `ApolloClient` instance. If passed, this will be the GraphQL client used to query the graph-node for results after a succesful transaction in the resolver function of the mutation invoked. If not passed, a default non-Apollo GraphQL client implementation will be used |

* **Result**

  * **MutationResult**:

| Property   |      Type      |  Description |
|----------|:-------------:|:------|
| `state` |  `MutationStates` | `MutationStates` object passed through resolver's `StateUpdater` object's `dispatch` method (see Mutations package API docs). It contains a key for each mutation called in the mutation query. In the case where the same mutation gets called more than once in the same query, the mutation's name changes to the mutation name followed by an underscore and a consecutive integer. Example: 'addMutation_2'. This object contains the latest mutation state and an `EventLog` with all the events, and their payloads, dispatched so far |

## Components

### `Mutation`

Wrapper of Apollo's Mutation React component. Takes the same props but the renderProps function passed as a child to it, receives an additional "state" object as parameter. Native Apollo's `Mutation` component full reference can be found [here](https://www.apollographql.com/docs/react/api/react-components/#mutation). However props and renderProps parameters worth mentioning because of specific behavior for this wrapper implementation are mentioned below:

* **Props**

| Property   |      Type      |  Description |
|----------|:-------------:|:------|
| `client` |  `ApolloClient` | `ApolloClient` instance. If passed, this will be the GraphQL client used to query the graph-node for results after a succesful transaction in the resolver function of the mutation invoked. If not passed, a default non-Apollo GraphQL client implementation will be used |

* **RenderProps function parameters**

  * **MutationResult**:

| Property   |      Type      |  Description |
|----------|:-------------:|:------|
| `state` |  `MutationStates` | `MutationStates` object passed through resolver's `StateUpdater` object's `dispatch` method (see Mutations package API docs). It contains a key for each mutation called in the mutation query. In the case where the same mutation gets called more than once in the same query, the mutation's name changes to the mutation name followed by an underscore and a consecutive integer. Example: 'addMutation_2'. This object contains the latest mutation state and an `EventLog` with all the events, and their payloads, dispatched so far |