import { Field, ID, InputType, ObjectType } from 'type-graphql'

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
}

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  token!: string

  @Field(() => UserDTO)
  user!: UserDTO
}
