import 'reflect-metadata'
import { Arg, Authorized, Ctx, Field, ID, Int, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { requireCurrentUser } from '@/utils/graphql'
import { AuthPayload, SignUpInput, UserDTO } from '@/resolvers/types/AuthTypes'
import { SignInInput } from '@/resolvers/types/SignInTypes'
import { FindManyUsersInput } from '@/resolvers/types/FindManyUsersInput'
import { PermissionName } from '@repo/database'

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
  @Authorized(PermissionName.UserRead)
  findManyUsers(
    @Ctx() { userService }: Context,
    @Arg('params', () => FindManyUsersInput, { nullable: true }) params?: FindManyUsersInput,
  ) {
    return userService.findMany(params ?? {})
  }

  @Query(() => Int)
  @Authorized(PermissionName.UserRead)
  totalUsers(
    @Ctx() { userService }: Context,
    @Arg('params', () => FindManyUsersInput, { nullable: true }) params?: FindManyUsersInput,
  ) {
    return userService.getTotalUsers(params?.filters)
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
