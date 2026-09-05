import 'reflect-metadata'
import { Arg, Ctx, Field, ID, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { requireCurrentUser, requireSiteOwner } from '@/utils/graphql'
import { AuthPayload, SignUpInput, UserDTO } from '@/resolvers/types/AuthTypes'
import { SignInInput } from '@/resolvers/types/SignInTypes'

@ObjectType()
class PublicUser {
  @Field(() => ID)
  user_id!: string

  @Field(() => String)
  username!: string
}

@Resolver()
export class UserResolver {
  @Query(() => [PublicUser])
  findManyUsers(@Ctx() context: Context) {
    requireSiteOwner(context)
    return context.userService.findMany()
  }

  @Query(() => UserDTO)
  currentUser(@Ctx() context: Context) {
    return requireCurrentUser(context)
  }

  @Mutation(() => AuthPayload)
  async signUp(
    @Arg('input', () => SignUpInput) input: SignUpInput,
    @Ctx() { userService }: Context,
  ): Promise<AuthPayload> {
    return userService.createUser(input)
  }

  @Mutation(() => AuthPayload)
  async signIn(
    @Arg('input', () => SignInInput) input: SignInInput,
    @Ctx() { userService }: Context,
  ): Promise<AuthPayload> {
    if (!input.username || !input.password) {
      throw new Error('username and password are required')
    }

    return userService.authenticateUser(input)
  }
}
