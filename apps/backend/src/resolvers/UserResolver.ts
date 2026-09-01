import 'reflect-metadata'
import { Arg, Ctx, Field, ID, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { AuthPayload, SignUpInput } from '@/resolvers/types/AuthTypes'
import { SignInInput } from '@/resolvers/types/SignInTypes'

@ObjectType()
class User {
  @Field(() => ID)
  user_id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  email?: string
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  findManyUsers(@Ctx() { userService }: Context) {
    return userService.findMany()
  }

  @Mutation(() => AuthPayload)
  async signUp(
    @Arg('input', () => SignUpInput) input: SignUpInput,
    @Ctx() { userService }: Context,
  ): Promise<AuthPayload> {
    if (!input.email || !input.password) {
      throw new Error('email and password are required')
    }

    return userService.createUser(input)
  }

  @Mutation(() => AuthPayload)
  async signIn(
    @Arg('input', () => SignInInput) input: SignInInput,
    @Ctx() { userService }: Context,
  ): Promise<AuthPayload> {
    if (!input.email || !input.password) {
      throw new Error('email and password are required')
    }

    return userService.authenticateUser(input)
  }
}
