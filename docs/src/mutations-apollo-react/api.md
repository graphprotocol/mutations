# API Reference

## function `createMutationsLink(...)`

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `options` |  **`{ mutations: Mutations }`** | Mutations object that was returned from `createMutations(...)` |

| Return Type | Description |
|-------------|-------------|
| **`ApolloLink`** | Apollo link that executes `mutation` queries using the `mutations`' resolvers |

## function `useMutation(...)`

Wrapper around Apollo's `useMutation(...)` React hook. Native Apollo's `useMutation(...)` hook full reference can be found [here](https://www.apollographql.com/docs/react/api/react-hooks/#options-2). The only difference is that this wrapper returns an additional `state` value alongside `data`:

```typescript
const [exec, { data, state }] = useMutation(MY_MUTATION)

state.myMutation.progress
```

## React.Component `Mutation`

Wrapper around Apollo's `Mutation` JSX React Component. Native Apollo's `Mutation` Component full reference can be found [here](https://www.apollographql.com/docs/react/api/react-components/#mutation). The only difference is that this wrapper returns an additional `state` value alongside `data`:  

```html
<Mutation mutation={MY_MUTATION}>
  {(exec, { data, state }) => (
    ...
  )}
</Mutation>
```
