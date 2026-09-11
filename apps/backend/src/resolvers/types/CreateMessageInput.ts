import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  body!: string
}
