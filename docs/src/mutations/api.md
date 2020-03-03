# API Reference

## function `createMutations(...)`

| Argument  |      Type      |  Description |
|------------|:--------------:|:-------------|
| `options` | **`CreateMutationsOptions`** | Options |

| Return Type | Description |
|-------------|-------------|
| **`Mutations`** | Mutations that can be executed & re-configured |

## interface **`CreateMutationsOptions`**

| Property |      Type      |  Description |
|----------|:--------------:|:-------------|
| `mutations` | **`MutationsModule`** | Mutations module |
| `subgraph` | **`string`** | Name of the subgraph |
| `node` | **`string`** | URL of a graph-node |
| `config` | **`ConfigArguments`** | All configuration arguments required by the `mutations` module |
| (optional) `mutationExecutor` | **`MutationExecutor`** | Function that will execute the mutations being queried |
| (optional) `queryExecutor` | **`QueryExecutor`** | Function that will execute any query requests coming from the mutation resolvers |

## interface **`Mutations`**

| Method | Arguments | Return Type | Description |
|--------|-----------|-------------|-------------|
| `execute` | `query: `**`MutationQuery`** | **`Promise<MutationResult>`** | Execute a GraphQL mutation query |
| `configure` | `config: `**`ConfigArguments`** | **`Promise<void>`** | Re-configure the mutations module |

## interface **`MutationQuery`**
| Property | Type | Description |
|----------|------|-------------|
| `query` | **`DocumentNode`** | GraphQL DocumentNode |
| (optional) `variables` | **`Record<string, any>`** | Variables to pass into the mutation resolver |
| (optional) `extensions` | **`Record<string, any>`** | GraphQL type system extensions |
| (optional) `stateSubject` | **`MutationStatesSubject`** | Mutation state observer (rxjs Subject) |

| Method | Arguments | Return Type | Description |
|--------|-----------|-------------|-------------|
| `setContext` | `context: `**`any`** | **`any`** | Set the context, and return the updated context |
| `getContext` |  | **`any`** | Get the context |

## interface **`MutationResult`**

Equivalent to GraphQL's [**`ExecutionResult`**](https://graphql.org/graphql-js/execution/)

## function type **`MutationExecutor`**

| Argument | Type | Description |
|----------|------|-------------|
| `query` | **`MutationQuery`** | A GraphQL mutation query |
| `schema` | **`GraphQLSchema`** | A built GraphQL schema |

| Return Type | Description |
|-------------|-------------|
| **`Promise<MutationResult>`** | The result of the mutation |

## function type **`QueryExecutor`**

| Argument | Type | Description |
|----------|------|-------------|
| `query` | **`Query`** | A GraphQL query |
| `uri` | **`string`** | GraphQL server URI |

| Return Type | Description |
|-------------|-------------|
| **`Promise<QueryResult>`** | The result of the query |
