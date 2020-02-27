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

## Interfaces and types

### `CoreEvents`

Type that has pre-defined events, and their payload types mapped, that can be dispatched through the `stateUpdater` object's `dispatch` method.

```ts

type CoreEvents = {
  TRANSACTION_CREATED: TransactionCreatedEvent
  TRANSACTION_COMPLETED: TransactionCompletedEvent
  TRANSACTION_ERROR: TransactionErrorEvent
  PROGRESS_UPDATE: ProgressUpdateEvent
}

```

### `CoreState`

Interface that partially defines the state data of a mutation, that will be dispatched through the `stateUpdater` object's `dispatch` method in a `MutationStates` object. Does not include the `events` state property, which is an array containing all dispatched events and their payloads, and which is also dispatched in the same state object.

```ts

interface CoreState {
  uuid: string
  progress: number
}

```

It contains the following properties: 

| Property   |  Description |
  |----------|:-------------|
  | `uuid` |  Unique identifier for each event. It is randomly and automatically generated. |
  | `progress` |  Number between 0 and 1 that indicates the progress the invoked mutation has. It is modified through the `PROGRESS_UPDATE` core event dispatch |


### `Event`

It contains

```ts

interface Event<TEventMap extends EventTypeMap = CoreEvents> {
  name: keyof MutationEvents<TEventMap>
  payload: EventPayload
}

```

It contains the following properties: 

| Property   |  Description |
  |----------|:-------------|
  | `name` |  Name of the event. It matches the key used to name this event either in the `CoreEvents` type or a custom `EventMap` type. |
  | `payload` |  Payload of the event dispatched. Its type matches the type mapped to the event's name either in the `CoreEvents` type or a custom `EventMap` type. |

### `EventMap`

Optional custom extension of the `CoreEvents` type. It defines custom events, and their payload types, that can be dispatched through the `stateUpdater` object's `dispatch` method.

Example:

```ts

type EventMap = {
  CUSTOM_EVENT: CustomEvent
}

```

### `MutationState`

Interface that fully defines the state data of a mutation that will be dispatched through the `stateUpdater` object's `dispatch` method, in a `MutationStates` object. It contains an `events` key which is an array that contains all dispatched events and their payloads, along with the properties defined in the `CoreState` interface and the optionally custom `TState` interface.

```ts

type MutationState<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> = { events: EventLog<TEventMap> } & CoreState & TState

```

### `MutationStates`

```ts

type MutationStates<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> = {
  [mutation: string]: MutationState<TState, TEventMap>
}

```

A type that defines the actual object passed to the UI, through the `stateUpdater` object's `dispatch` method. It is an object that has each `MutationState`'s state data mapped to its mutation name. In the case where the same mutation gets called more than once in the same query, the mutation's name changes to the mutation name followed by an underscore and a consecutive integer. Example: 'addMutation_2'.

### `StateBuilder`

**Optional** object that implements the `StateBuilder` interface. It is implemented to add an initial values to custom state properties and custom reducers for custom events. It can implement a catch-all reducer. If it exists it should be exported in the resolvers module.

```ts

interface StateBuilder<TState, TEventMap extends EventTypeMap> {
  getInitialState(uuid: string): TState
  reducers?: {
    [TEvent in keyof MutationEvents<TEventMap>]?: (
      state: MutationState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>,
    ) => MaybeAsync<Partial<MutationState<TState>>>
  }
  reducer?: (
    state: MutationState<TState>,
    event: Event<TEventMap>,
  ) => MaybeAsync<Partial<MutationState<TState>>>
}

```

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