import { Field, ID, InputType, ObjectType } from 'type-graphql'

@InputType()
export class SignUpInput {
  @Field(() => String)
  email!: string

  @Field(() => String)
  password!: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class UserDTO {
  @Field(() => ID)
  user_id!: string

  @Field(() => String, { nullable: true })
  name?: string | null

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
