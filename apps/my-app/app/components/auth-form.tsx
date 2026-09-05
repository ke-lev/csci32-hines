'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { useAuth } from './use-auth'
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_INPUT_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateSignupField,
} from './auth-validation'

type AuthFormInputs = {
  username: string
  email: string
  password: string
}

export function AuthForm() {
  const { clearError, error, isLoading, signIn, signUp } = useAuth()
  const [isSignUpMode, setIsSignUpMode] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AuthFormInputs>()

  const onSubmit = async (data: AuthFormInputs) => {
    if (isSignUpMode) {
      await signUp(data)
    } else {
      await signIn({ username: data.username, password: data.password })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-[clamp(18px,2vw,28px)] py-5">
        <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
          {isSignUpMode ? 'sign up' : 'login'}
        </h2>
      </div>

      {error ? (
        <div
          className="flex items-center justify-between gap-3 border-b border-danger bg-danger-surface px-[clamp(18px,2vw,28px)] py-3 font-mono text-[0.68rem] tracking-[0.06em] text-danger lowercase"
          role="alert"
        >
          {error.message}
          <button
            className="cursor-pointer border-0 bg-transparent p-0 text-danger underline underline-offset-4"
            onClick={clearError}
            type="button"
          >
            dismiss
          </button>
        </div>
      ) : null}

      <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto px-[clamp(18px,3vw,48px)] py-7 [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin]">
          <label className="flex flex-col gap-2" htmlFor="auth-username">
            <span className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">
              {isSignUpMode ? 'name' : 'username'}
            </span>
            <Input
              ariaDescribedBy={errors.username ? 'auth-username-error' : undefined}
              ariaInvalid={Boolean(errors.username)}
              autoComplete={isSignUpMode ? 'name' : 'username'}
              className="w-full"
              id="auth-username"
              placeholder={isSignUpMode ? 'john doe' : 'john-doe'}
              size={Size.LARGE}
              variant={Variant.SECONDARY}
              {...register('username', {
                maxLength: isSignUpMode
                  ? {
                      message: `keep your name under ${MAX_USERNAME_INPUT_LENGTH} characters`,
                      value: MAX_USERNAME_INPUT_LENGTH,
                    }
                  : undefined,
                required: `${isSignUpMode ? 'name' : 'username'} is required`,
                validate: isSignUpMode ? (value) => validateSignupField('username', value) : undefined,
              })}
            />
            {errors.username ? (
              <p
                className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase"
                id="auth-username-error"
              >
                {errors.username.message}
              </p>
            ) : null}
          </label>

          {isSignUpMode ? (
            <label className="flex flex-col gap-2" htmlFor="auth-email">
              <span className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">email</span>
              <Input
                ariaDescribedBy={errors.email ? 'auth-email-error' : undefined}
                ariaInvalid={Boolean(errors.email)}
                autoComplete="email"
                className="w-full"
                id="auth-email"
                placeholder="you@example.com"
                size={Size.LARGE}
                type="email"
                variant={Variant.SECONDARY}
                {...register('email', {
                  maxLength: {
                    message: `keep your email under ${MAX_EMAIL_LENGTH} characters`,
                    value: MAX_EMAIL_LENGTH,
                  },
                  required: 'email is required',
                  validate: (value) => validateSignupField('email', value),
                })}
              />
              {errors.email ? (
                <p
                  className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase"
                  id="auth-email-error"
                >
                  {errors.email.message}
                </p>
              ) : null}
            </label>
          ) : null}

          <label className="flex flex-col gap-2" htmlFor="auth-password">
            <span className="font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">password</span>
            <Input
              ariaDescribedBy={errors.password ? 'auth-password-error' : undefined}
              ariaInvalid={Boolean(errors.password)}
              autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
              className="w-full"
              id="auth-password"
              placeholder="six or more"
              size={Size.LARGE}
              type="password"
              variant={Variant.SECONDARY}
              {...register('password', {
                maxLength: isSignUpMode
                  ? {
                      message: `keep your password under ${MAX_PASSWORD_LENGTH} characters`,
                      value: MAX_PASSWORD_LENGTH,
                    }
                  : undefined,
                minLength: isSignUpMode
                  ? { message: `at least ${MIN_PASSWORD_LENGTH} characters`, value: MIN_PASSWORD_LENGTH }
                  : undefined,
                required: 'password is required',
                validate: isSignUpMode ? (value) => validateSignupField('password', value) : undefined,
              })}
            />
            {errors.password ? (
              <p
                className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase"
                id="auth-password-error"
              >
                {errors.password.message}
              </p>
            ) : null}
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-[clamp(18px,2vw,28px)] py-4">
          <Button
            onClick={() => {
              clearError()
              setIsSignUpMode((currentMode) => !currentMode)
            }}
            size={Size.MEDIUM}
            variant={Variant.TERTIARY}
          >
            {isSignUpMode ? 'back to login' : 'create new account'}
          </Button>
          <Button
            className="disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={isLoading}
            size={Size.MEDIUM}
            type="submit"
            variant={Variant.PRIMARY}
          >
            {isLoading ? 'checking...' : isSignUpMode ? 'make an account' : 'let me in'}
          </Button>
        </div>
      </form>
    </div>
  )
}
