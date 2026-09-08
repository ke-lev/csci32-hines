/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type FindManyUsersFilters = {
  query?: string | null | undefined
}

export type FindManyUsersInput = {
  filters?: FindManyUsersFilters | null | undefined
  skip?: number | null | undefined
  sortColumn?: UserSortColumn | null | undefined
  sortDirection?: SortOrder | null | undefined
  take?: number | null | undefined
}

/** Whether a room line was posted by an account or emitted by a site event */
export type MessageKind = 'system' | 'user'

/** Enum representing valid permissions for authorization */
export type PermissionName = 'UserRead' | 'UserWrite'

/** Enum representing valid roles for users */
export type RoleName = 'Admin' | 'Basic'

export type SavePersonalDrawingInput = {
  strokes: Array<Array<number>>
}

export type SavePersonalIntroInput = {
  introBody?: string | null | undefined
  introSubhead: string
  introTitle: string
}

export type SignInInput = {
  password: string
  username: string
}

export type SignUpInput = {
  email: string
  password: string
  username: string
}

/** Defines ascending or descending sort order. */
export type SortOrder = 'ASC' | 'DESC'

export type UpdateTipIdeaInput = {
  receipt: string
  shippedHref?: string | null | undefined
  status: string
}

/** Columns a user listing may be sorted by. */
export type UserSortColumn = 'EMAIL' | 'USERNAME'

export type FindManyUsersQueryVariables = Exact<{
  params?: FindManyUsersInput | null | undefined
}>

export type FindManyUsersQuery = { totalUsers: number; findManyUsers: Array<{ user_id: string; username: string }> }

export type SignUpMutationVariables = Exact<{
  input: SignUpInput
}>

export type SignUpMutation = {
  signUp: {
    token: string
    user: {
      user_id: string
      username: string
      email: string | null
      role: RoleName | null
      permissions: Array<PermissionName>
    }
  }
}

export type SignInMutationVariables = Exact<{
  input: SignInInput
}>

export type SignInMutation = {
  signIn: {
    token: string
    user: {
      user_id: string
      username: string
      email: string | null
      role: RoleName | null
      permissions: Array<PermissionName>
    }
  }
}

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>

export type CurrentUserQuery = {
  currentUser: {
    user_id: string
    username: string
    email: string | null
    role: RoleName | null
    permissions: Array<PermissionName>
  }
}

export type MyPersonalPageQueryVariables = Exact<{ [key: string]: never }>

export type MyPersonalPageQuery = {
  myPersonalPage: {
    introTitle: string | null
    introSubhead: string | null
    introBody: string | null
    strokes: Array<Array<number>>
    updatedAt: string
  } | null
}

export type SavePersonalIntroMutationVariables = Exact<{
  input: SavePersonalIntroInput
}>

export type SavePersonalIntroMutation = {
  savePersonalIntro: {
    introTitle: string | null
    introSubhead: string | null
    introBody: string | null
    strokes: Array<Array<number>>
    updatedAt: string
  }
}

export type SavePersonalDrawingMutationVariables = Exact<{
  input: SavePersonalDrawingInput
}>

export type SavePersonalDrawingMutation = {
  savePersonalDrawing: {
    introTitle: string | null
    introSubhead: string | null
    introBody: string | null
    strokes: Array<Array<number>>
    updatedAt: string
  }
}

export type RoomMessagesQueryVariables = Exact<{
  after?: string | null | undefined
  before?: string | null | undefined
  limit?: number | null | undefined
}>

export type RoomMessagesQuery = {
  roomMessages: Array<{
    messageId: string
    kind: MessageKind
    body: string
    authorUsername: string | null
    createdAt: string
    cursor: string
  }>
}

export type PostMessageMutationVariables = Exact<{
  body: string
}>

export type PostMessageMutation = {
  postMessage: {
    messageId: string
    kind: MessageKind
    body: string
    authorUsername: string | null
    createdAt: string
    cursor: string
  }
}

export type TipIdeasQueryVariables = Exact<{ [key: string]: never }>

export type TipIdeasQuery = {
  findManyTipIdeas: Array<{
    body: string
    createdAt: string
    receipt: string
    shippedHref: string | null
    status: string
  }>
}

export type UpdateTipIdeaMutationVariables = Exact<{
  input: UpdateTipIdeaInput
}>

export type UpdateTipIdeaMutation = {
  updateTipIdea: { body: string; createdAt: string; receipt: string; shippedHref: string | null; status: string }
}

export const FindManyUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'FindManyUsers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'params' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'FindManyUsersInput' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'findManyUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'params' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'params' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'user_id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'totalUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'params' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'params' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FindManyUsersQuery, FindManyUsersQueryVariables>
export const SignUpDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SignUp' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'SignUpInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'signUp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'user_id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'permissions' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>
export const SignInDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SignIn' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'SignInInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'signIn' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'user_id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'permissions' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SignInMutation, SignInMutationVariables>
export const CurrentUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurrentUser' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'user_id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'permissions' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>
export const MyPersonalPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyPersonalPage' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myPersonalPage' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'introTitle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introSubhead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introBody' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strokes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyPersonalPageQuery, MyPersonalPageQueryVariables>
export const SavePersonalIntroDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SavePersonalIntro' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SavePersonalIntroInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'savePersonalIntro' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'introTitle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introSubhead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introBody' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strokes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SavePersonalIntroMutation, SavePersonalIntroMutationVariables>
export const SavePersonalDrawingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SavePersonalDrawing' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SavePersonalDrawingInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'savePersonalDrawing' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'introTitle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introSubhead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'introBody' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strokes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SavePersonalDrawingMutation, SavePersonalDrawingMutationVariables>
export const RoomMessagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RoomMessages' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'after' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'before' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'roomMessages' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'after' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'after' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'before' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'before' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'authorUsername' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cursor' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RoomMessagesQuery, RoomMessagesQueryVariables>
export const PostMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'PostMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'body' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'body' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'body' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'authorUsername' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cursor' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostMessageMutation, PostMessageMutationVariables>
export const TipIdeasDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TipIdeas' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'findManyTipIdeas' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'receipt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'shippedHref' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TipIdeasQuery, TipIdeasQueryVariables>
export const UpdateTipIdeaDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTipIdea' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateTipIdeaInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTipIdea' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'receipt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'shippedHref' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateTipIdeaMutation, UpdateTipIdeaMutationVariables>
