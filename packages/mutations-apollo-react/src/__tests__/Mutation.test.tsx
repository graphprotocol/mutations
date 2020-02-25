import { JSDOM } from 'jsdom'
const doc = new JSDOM('<!doctype html><html><body></body></html>')
const glob = global as any
glob.dom = doc
glob.window = doc.window
glob.document = doc.window.document
glob.navigator = doc.window.navigator

import React, { useEffect } from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'
import { ApolloProvider } from '@apollo/react-hooks'

import {
  client,
  statesToPublish,
  PUBLISH_STATES,
  RETURN_TRUE
} from './utils'
import { Mutation } from '../'

Enzyme.configure({ adapter: new Adapter() })

describe('Mutation', () => {
  it('Correctly sets observer object inside context', async () => {
    let executeFunction: Function
    let observerSet = false

    function Wrapper() {
      return (
        <Mutation mutation={PUBLISH_STATES} client={client}>
          {(execute, { data }) => {
            executeFunction = execute
            if (data && data.publishStates) {
              observerSet = true
            }
            return null
          }}
        </Mutation>
      )
    }

    mount(<Wrapper />)

    await act(async () => {
      executeFunction()
    })

    expect(observerSet).toEqual(true)
  })

  it('Returns states in dispatch order', async () => {
    let executeFunction: any
    let states: number[] = []

    function Wrapper() {
      return (
        <Mutation mutation={PUBLISH_STATES} client={client}>
          {(execute, { state }) => {
            executeFunction = execute

            useEffect(() => {
              if (state.publishStates && state.publishStates.progress) {
                states.push(state.publishStates.progress)
              }
            }, [state])

            return null
          }}
        </Mutation>
      )
    }

    mount(<Wrapper />)

    await act(async () => {
      executeFunction()
    })

    expect(states).toEqual(statesToPublish)
  })

  it('Uses ApolloProvider client', async () => {
    let mutationFunction: Function
    let mutationData

    function Wrapper() {
      return (
        <Mutation mutation={RETURN_TRUE}>
          {(execute, { data }) => {
            mutationFunction = execute

            mutationData = data
            return null
          }}
        </Mutation>
      )
    }

    mount(
      <ApolloProvider client={client}>
        <Wrapper />
      </ApolloProvider>
    )

    await act(async () => {
      mutationFunction()
    })

    expect(mutationData).toBeTruthy()
    // @ts-ignore
    expect(mutationData.returnTrue).toEqual(true)
  })
})
