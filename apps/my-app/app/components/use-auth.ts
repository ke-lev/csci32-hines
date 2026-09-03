'use client'

export type AuthUser = {
  user_id: string
  name: string
  email: string
}

export type SignUpInput = {
  email: string
  password: string
  name?: string
}

export type SignInInput = {
  email: string
  password: string
}

/**
 * Stubbed for the authorization form lab: the form is built against this shape first, and the
 * calls are swapped for the real GraphQL signUp/signIn mutations later. Nothing here touches a
 * network, so the credentials it is handed go nowhere — deliberately, including the password,
 * which is never logged.
 */
export function useAuth() {
  const signUp = async (data: SignUpInput): Promise<{ user: AuthUser }> => ({
    user: { email: data.email, name: data.name || 'Test User', user_id: '123' },
  })

  const signIn = async (data: SignInInput): Promise<{ user: AuthUser }> => ({
    user: { email: data.email, name: 'Existing User', user_id: '456' },
  })

  const signOut = () => {}

  return {
    clearError: () => {},
    error: null as string | null,
    isLoading: false,
    signIn,
    signOut,
    signUp,
    user: null as AuthUser | null,
  }
}
