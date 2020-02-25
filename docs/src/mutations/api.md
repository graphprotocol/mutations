# API Reference

## Functions

### `createMutations`

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `mutations` |  JS Module | Built mutations module. This module should export resolvers object, config object and optionally stateBuilder object |
| `subgraph` |    string   | Name of the subgraph |
| `config` | Object | Object whose properties must match the resolvers module's config object 1:1 |

### `createMutationsLink`

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `mutations` |  `Mutations` | Mutations object, returned from `createMutations` function |

## Objects

### `stateUpdater`

#### Properties

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `current` |  `MutationState` | Inmutable copy of current state |

#### Methods

* `dispatch`:  **async** method used to emit/dispatch events to the UI, in real time. It modifies the `state` object, appending the dispatched event to its `events` array property.

| Argument   |      Type      |  Description |
|----------|:-------------:|:------|
| `eventName` |  string | Name of the event to dispatch, it must match the key used for this event in the custom `EventMap` or `CoreEvents` interface. |
| `payload` |  Object | Payload of the event to dispatch, its type must match the interface used for this event in the custom `EventMap` or `CoreEvents` interface |

**Returns** a void promise.

## `stateBuilder`

**Optional** object that implements the `StateBuilder` interface. It is implemented to add an initial values to custom state properties and custom reducers for custom events. It can implement a catch-all reducer. If it exists it should be exported in the resolvers module.

It implements the following methods and properties:

* `getInitialState`: method that returns a `Partial<TState>`, where `TState` is a custom defined `MutationState` interface.
* `reducers`: object that contains the reducers for custom events. Each event reducer is a key in this object, that must match the event's key in the `EventMap` interface, and its value is a function with the following arguments:

  | Argument   |      Type      |  Description |
  |----------|:-------------:|:------|
  | `state` |  `MutationState` | Inmutable copy of current state |
  | `payload` |  `MutationState` | Payload of the event to dispatch, its type must match the interface used for this event in the custom `EventMap` or `CoreEvents` interface |

  Each of these reducers **must return** a `Partial<MutationState>`
* `reducer` **(Optional)**: catch-all reducer. It runs after any event is dispatched. It receives the following arguments:

  | Argument   |      Type      |  Description |
  |----------|:-------------:|:------|
  | `state` |  `MutationState` | Inmutable copy of current state |
  | `event` |  `Event` | Object with dispatched event's name and payload. The name matches each event's key used in the `EventMap` or `CoreEvents` interface |

## Interfaces

### 