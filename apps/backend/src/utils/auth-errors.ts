import { GraphQLError } from 'graphql'
import type { SignupFieldErrors } from '@/services/auth-validation'

export function validationError(fieldErrors: SignupFieldErrors, message = 'please check your details') {
  const firstMessage = Object.values(fieldErrors)[0]

  return new GraphQLError(firstMessage ?? message, {
    extensions: {
      code: 'VALIDATION_ERROR',
      fieldErrors,
    },
  })
}

export function unauthenticatedError() {
  return new GraphQLError('authentication required', {
    extensions: { code: 'UNAUTHENTICATED' },
  })
}

export function forbiddenError() {
  return new GraphQLError('you do not have permission for that', {
    extensions: { code: 'FORBIDDEN' },
  })
}
