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
import { useMutation } from '../'

Enzyme.configure({ adapter: new Adapter() })

describe('useMutation', () => {
  it('Correctly sets observer object inside context', async () => {
    let mutationFunction: Function
    let observerSet = false

    function Wrapper() {
      const [execute, { data }] = useMutation(PUBLISH_STATES, {
        client,
      })

      if (data && data.publishStates) {
        observerSet = true
      }

      mutationFunction = execute
      return null
    }

    mount(<Wrapper />)

    await act(async () => {
      mutationFunction()
    })

    expect(observerSet).toEqual(true)
  })

  it('Returns states in dispatch order', async () => {
    let mutationFunction: Function
    let states: number[] = []

    function Wrapper() {
      const [execute, { state }] = useMutation(PUBLISH_STATES, {
        client,
      })

      mutationFunction = execute

      useEffect(() => {
        if (state.publishStates && state.publishStates.progress) {
          states.push(state.publishStates.progress)
        }
      }, [state])

      return null
    }

    mount(<Wrapper />)

    await act(async () => {
      mutationFunction()
    })

    expect(states).toEqual(statesToPublish)
  })

  it('Uses ApolloProvider client', async () => {
    let mutationFunction: Function
    let mutationData

    function Wrapper() {
      const [execute, { data }] = useMutation(RETURN_TRUE)
      mutationFunction = execute

      useEffect(() => {
        mutationData = data
      }, [data])

      return null
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
