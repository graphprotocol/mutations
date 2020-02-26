import remoteResolver from '../query/remoteResolver'

import {
  ApolloLink,
  execute,
  makePromise,
  Observable,
  Operation
} from 'apollo-link'
import gql from 'graphql-tag'

let link: ApolloLink

describe('RemoteResolver', () => {
  beforeAll(() => {
    link = new ApolloLink(
      (operation: Operation) =>
        new Observable(observer => {
          remoteResolver(operation, 'http://localhost:5000')
            .then(
              (result: any) => {
                observer.next(result)
                observer.complete()
              },
              (e: Error) => observer.error(e),
            )
        }),
    )
  })

  it('Correctly executes local mutation resolver', async () => {
    try {
      await makePromise(
        execute(link, {
          query: gql`
            query testQuery {
              testQuery {
                id
              }
            }
          `,
        }),
      )
      expect('').toBe('This should never happen.')
    } catch (e) {
      expect(e.message).toContain('ECONNREFUSED')
    }
  })
})
