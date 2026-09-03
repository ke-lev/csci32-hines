import { Field, InputType } from 'type-graphql'

@InputType()
export class SignInInput {
  @Field(() => String)
  username!: string

  @Field(() => String)
  password!: string
}
