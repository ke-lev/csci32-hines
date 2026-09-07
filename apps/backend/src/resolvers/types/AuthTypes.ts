import { Field, ID, InputType, ObjectType } from 'type-graphql'
import { PermissionName, RoleName } from '@repo/database'

@InputType()
export class SignUpInput {
  @Field(() => String)
  username!: string

  @Field(() => String)
  email!: string

  @Field(() => String)
  password!: string
}

@ObjectType()
export class UserDTO {
  @Field(() => ID)
  user_id!: string

  @Field(() => String)
  username!: string

  @Field(() => String, { nullable: true })
  email?: string | null

  @Field(() => RoleName, { nullable: true })
  role?: RoleName | null

  @Field(() => [PermissionName])
  permissions!: PermissionName[]
}

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  token!: string

  @Field(() => UserDTO)
  user!: UserDTO
}
