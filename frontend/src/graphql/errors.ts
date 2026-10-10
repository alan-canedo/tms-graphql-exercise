import { CombinedGraphQLErrors } from "@apollo/client/errors"

export function hasGraphQLErrorCode(error: unknown, code: string): boolean {
  return CombinedGraphQLErrors.is(error) &&
    error.errors.some((graphQLError) => graphQLError.extensions?.code === code)
}
