import gql from 'graphql-tag'
import 'cross-fetch/polyfill'

import {
  createMutations,
  Mutations,
  MutationContext,
  MutationStates,
} from '../'
import { MutationStatesSubject } from '../mutationState'

const schema = `
  type Mutation {
    testResolve: Boolean!
    secondTestResolve: Boolean!
    dispatchStateEvent: Boolean!
    testConfig: String!
    testError: Boolean!
    testQuery: Boolean!
  }
`

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    },
    secondTestResolve: async () => {
      return true
    },
    dispatchStateEvent: async (_: any, __: any, context: MutationContext<Config>) => {
      await context.graph.state.dispatch('PROGRESS_UPDATE', { value: .5 })
      return true
    },
    testConfig: async (_: any, __: any, context: MutationContext<Config>) => {
      return context.graph.config.value
    },
    testError: async () => {
      throw Error(`I'm an error...`)
    },
    testQuery: async (_: any, __: any, context: MutationContext<Config>) => {
      try {
        await context.graph.client.query({
          query: gql`
            query testQuery {
              testQuery {
                id
              }
            }
          `
        })
        return false
      } catch (e) {
        return e.message.indexOf('ECONNREFUSED') > -1
      }
    },
  },
}

type Config = typeof config
const config = {
  value: (arg: string) => arg,
}

describe('Mutations', () => {
  let mutations: Mutations<Config>
  let observer = new MutationStatesSubject({} as MutationStates)
  let latestState: MutationStates = {}

  beforeAll(() => {
    mutations = createMutations({
      mutations: {
        resolvers,
        config,
        schema,
      },
      subgraph: 'test',
      node: 'http://localhost:5000',
      config: {
        value: '...',
      },
    })

    observer.subscribe((value: MutationStates) => {
      latestState = value
    })
  })

  const getSetContext = () => {
    let context = { }
    return {
      setContext: (newContext: any) => {
        context = newContext
        return context
      },
      getContext: () => context
    }
  }

  it('Successfully creates mutations and executes. No observer provided', async () => {
    const { data } = await mutations.execute({
      query: gql`
        mutation testResolve {
          testResolve
        }
      `,
      ...getSetContext()
    })

    expect(data && data.testResolve).toEqual(true)
  })

  it('Correctly wraps resolvers and formats observer results to object with mutation name as key and state as value', async () => {
    await mutations.execute({
      query: gql`
        mutation testResolve {
          testResolve
        }
      `,
      ...getSetContext(),
      stateSubject: observer,
    })

    expect(latestState).toHaveProperty('testResolve')
    expect(latestState.testResolve.events).toBeTruthy()
  })

  it('Executes multiple mutations in the same mutation query and dispatches object with different states for each', async () => {
    const { data } = await mutations.execute({
      query: gql`
        mutation testResolve {
          testResolve
          secondTestResolve
        }
      `,
      ...getSetContext(),
      stateSubject: observer,
    })

    if (!data) {
      throw Error('data is undefined...')
    }

    expect(data).toHaveProperty('testResolve')
    expect(data.testResolve).toBeTruthy()

    expect(data).toHaveProperty('secondTestResolve')
    expect(data.secondTestResolve).toBeTruthy()

    expect(latestState).toHaveProperty('testResolve')
    expect(latestState.testResolve.events).toBeTruthy()

    expect(latestState).toHaveProperty('secondTestResolve')
    expect(latestState.secondTestResolve.events).toBeTruthy()

    expect(latestState.testResolve).not.toEqual(latestState.secondTestResolve)
  })

  it('Executes the same mutation several times in the same query and dispatches object with different states for each', async () => {
    const { data } = await mutations.execute({
      query: gql`
        mutation testResolve {
          testResolve
          testResolve
        }
      `,
      ...getSetContext(),
      stateSubject: observer,
    })

    if (!data) {
      throw Error('data is undefined...')
    }

    expect(data).toHaveProperty('testResolve')
    expect(data.testResolve).toBeTruthy()

    expect(data).toHaveProperty('testResolve_1')
    expect(data.testResolve_1).toBeTruthy()

    expect(latestState).toHaveProperty('testResolve')
    expect(latestState.testResolve.events).toBeTruthy()

    expect(latestState).toHaveProperty('testResolve_1')
    expect(latestState.testResolve_1.events).toBeTruthy()

    expect(latestState.testResolve).not.toEqual(latestState.testResolve_1)
  })

  it('Calls custom mutationExecutor', async () => {
    let called = false
    const mutations = createMutations({
      mutations: {
        resolvers,
        config,
        schema,
      },
      subgraph: '',
      node: '',
      config: {
        value: '...',
      },
      mutationExecutor: (query) => {
        called = true
        return new Promise((resolve) => resolve({
          data: { testResolve: true }
        }))
      }
    })

    await mutations.execute({
      query: gql`
        mutation testResolve {
          testResolve
        }
      `,
      ...getSetContext(),
    })

    expect(called).toBeTruthy()
  })

  it('Catches resolver execution errors', async () => {
      const { errors } = await mutations.execute({
        query: gql`
          mutation testError {
            testError
          }
        `,
        ...getSetContext(),
      })

      if (!errors) {
        throw Error('errors is undefined...')
      }

      expect(errors[0].message).toBe(`I'm an error...`)
  })

  it('State is correctly updated', async () => {
    const observer = new MutationStatesSubject({})

    let context = {
      graph: {
        rootSubject: observer,
      },
    }

    let progress = 0

    const subject = observer.subscribe((state: MutationStates) => {
      if (state.dispatchStateEvent) {
        progress = state.dispatchStateEvent.progress
      }
    })

    await mutations.execute({
      query: gql`
        mutation TestResolve {
          dispatchStateEvent
        }
      `,
      variables: {},
      getContext: () => context,
      setContext: (newContext: any) => {
        context = newContext
        return context
      },
      stateSubject: observer,
    })

    expect(progress).toEqual(.5)
    subject.unsubscribe()
  })

  it('Correctly queries using the remote executor', async () => {
    let context = {} as MutationContext<Config>

    const { data } = await mutations.execute({
      query: gql`
        mutation testQuery {
          testQuery
        }
      `,
      variables: {},
      getContext: () => context,
      setContext: (newContext: MutationContext<Config>) => {
        context = newContext
        return context
      },
    })

    expect(data && data.testQuery).toEqual(true)
  })

  describe('mutations.configure(...)', () => {
    it('Correctly reconfigures the mutation module', async () => {
      {
        const { data } = await mutations.execute({
          query: gql`
            mutation testConfig {
              testConfig
            }
          `,
          ...getSetContext(),
        })

        if (!data) {
          throw Error('data is undefined...')
        }

        expect(data.testConfig).toEqual('...')
      }

      await mutations.configure({
        value: 'foo',
      })

      {
        const { data } = await mutations.execute({
          query: gql`
            mutation testConfig {
              testConfig
            }
          `,
          ...getSetContext(),
        })

        if (!data) {
          throw Error('data is undefined...')
        }

        expect(data.testConfig).toEqual('foo')
      }
    })

    it('Detects incorrect configuration values object', async () => {
      try {
        await mutations.configure({ notValues: '' } as any)
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe(
          `Failed to find mutation configuration value for the property 'value'.`,
        )
      }
    })
  })
})
