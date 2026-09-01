import 'reflect-metadata'
import { Resolver, Query, Field, ObjectType, Ctx, ID } from 'type-graphql'
import type { Context } from '@/utils/graphql'

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
}
