import { EventPayload, StateBuilder } from './types'

export interface CoreState {
  uuid: string
  progress: number
}

export type CoreEvents = {
  TRANSACTION_CREATED: TransactionCreatedEvent
  TRANSACTION_COMPLETED: TransactionCompletedEvent
  TRANSACTION_ERROR: TransactionErrorEvent
  PROGRESS_UPDATE: ProgressUpdateEvent
}

export interface TransactionCreatedEvent extends EventPayload {
  id: string
  to: string
  from: string
  data: string
  amount: string
  network: string
  description: string
}

export interface TransactionCompletedEvent extends EventPayload {
  id: string
  description: string
}

export interface TransactionErrorEvent extends EventPayload {
  id: string
  error: Error
}

export interface ProgressUpdateEvent extends EventPayload {
  value: number
}

export const coreStateBuilder: StateBuilder<CoreState, CoreEvents> = {
  getInitialState(uuid: string): CoreState {
    return {
      progress: 0,
      uuid,
    }
  },
  reducers: {
    PROGRESS_UPDATE: async (state: CoreState, payload: ProgressUpdateEvent) => {
      if (payload.value < 0 || payload.value > 1) {
        throw new Error('Progress value must be between 0 and 1')
      }

      return {
        progress: payload.value,
      }
    },
  },
}
