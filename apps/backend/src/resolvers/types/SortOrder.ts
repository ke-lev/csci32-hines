import { registerEnumType } from 'type-graphql'

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Defines ascending or descending sort order.',
})
