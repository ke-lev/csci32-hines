import { Field, InputType, Int, registerEnumType } from 'type-graphql'
import { FindManyUsersFilters } from './FindManyUsersFilters'
import { SortOrder } from './SortOrder'

// The only columns a caller may sort by. This is an enum rather than a String field so the
// value that reaches Prisma's orderBy can never be an arbitrary column name — a bare string
// would let a caller order by passwordHash and read it back one comparison at a time.
export enum UserSortColumn {
  USERNAME = 'username',
  EMAIL = 'email',
}

registerEnumType(UserSortColumn, {
  name: 'UserSortColumn',
  description: 'Columns a user listing may be sorted by.',
})

@InputType()
export class FindManyUsersInput {
  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number

  @Field(() => UserSortColumn, { nullable: true })
  sortColumn?: UserSortColumn

  @Field(() => SortOrder, { nullable: true })
  sortDirection?: SortOrder

  @Field(() => FindManyUsersFilters, { nullable: true })
  filters?: FindManyUsersFilters
}
