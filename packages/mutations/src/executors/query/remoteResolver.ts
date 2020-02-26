import { QueryExecutor } from '../types'
import { Query, QueryResult } from '../../types'

import { execute, makePromise } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import fetch from 'cross-fetch'

const remoteResolver: QueryExecutor = (
  query: Query,
  uri: string,
): Promise<QueryResult> => {
  const link = createHttpLink({ uri, fetch })
  return makePromise(
    execute(link, query)
  )
}

export default remoteResolver
