import {
  Event,
  EventTypeMap,
  MutationEvents,
  MutationState,
  InferEventPayload,
  StateBuilder,
  MutationStateSubject,
} from './types'
import { coreStateBuilder as core } from './core'
import { executeMaybeAsyncFunction } from '../utils'

import { cloneDeep, merge } from 'lodash'

class StateUpdater<TState, TEventMap extends EventTypeMap> {
  private state: MutationState<TState, TEventMap>
  private subject?: MutationStateSubject<TState, TEventMap>
  private ext?: StateBuilder<TState, TEventMap>

  constructor(
    uuid: string,
    ext?: StateBuilder<TState, TEventMap>,
    subscriber?: MutationStateSubject<TState, TEventMap>,
  ) {
    this.ext = ext
    this.subject = subscriber

    this.state = {
      events: [],
      ...core.getInitialState(uuid),
      ...(this.ext ? this.ext.getInitialState(uuid) : ({} as TState)),
    }

    // Publish the initial state
    this.publish()
  }

  public get current() {
    return cloneDeep(this.state)
  }

  public async dispatch<TEvent extends keyof MutationEvents<TEventMap>>(
    eventName: TEvent,
    payload: InferEventPayload<TEvent, MutationEvents<TEventMap>>,
  ) {
    const event: Event<TEventMap> = {
      name: eventName,
      payload,
    }

    // Append the event
    this.state.events.push(event)

    // Call all relevant reducers
    const coreReducers = core.reducers as any
    const extReducers = this.ext?.reducers as any
    const extReducer = this.ext?.reducer

    if (coreReducers && coreReducers[event.name] !== undefined) {
      const coreStatePartial = await executeMaybeAsyncFunction(
        coreReducers[event.name],
        cloneDeep(this.state),
        payload,
      )
      this.state = merge(this.state, coreStatePartial)
    }

    if (extReducers && extReducers[event.name] !== undefined) {
      const extStatePartial = await executeMaybeAsyncFunction(
        extReducers[event.name],
        cloneDeep(this.state),
        payload,
      )
      this.state = merge(this.state, extStatePartial)
    } else if (extReducer) {
      const extStatePartial = await executeMaybeAsyncFunction(
        extReducer,
        cloneDeep(this.state),
        event
      )
      this.state = merge(this.state, extStatePartial)
    }

    // Publish the latest state
    this.publish()
  }

  private publish() {
    if (this.subject) {
      this.subject.next(cloneDeep(this.state))
    }
  }
}

export { StateUpdater }
export * from './core'
export * from './types'
