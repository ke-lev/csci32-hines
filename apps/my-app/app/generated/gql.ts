/* eslint-disable */
import * as types from './graphql'
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query FindManyUsers {\n    findManyUsers {\n      user_id\n      username\n    }\n  }\n': typeof types.FindManyUsersDocument
  '\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n': typeof types.SignUpDocument
  '\n  mutation SignIn($input: SignInInput!) {\n    signIn(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n': typeof types.SignInDocument
  '\n  query CurrentUser {\n    currentUser {\n      user_id\n      username\n      email\n      role\n      permissions\n    }\n  }\n': typeof types.CurrentUserDocument
  '\n  query MyPersonalPage {\n    myPersonalPage {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n': typeof types.MyPersonalPageDocument
  '\n  mutation SavePersonalIntro($input: SavePersonalIntroInput!) {\n    savePersonalIntro(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n': typeof types.SavePersonalIntroDocument
  '\n  mutation SavePersonalDrawing($input: SavePersonalDrawingInput!) {\n    savePersonalDrawing(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n': typeof types.SavePersonalDrawingDocument
  '\n  query TipIdeas {\n    findManyTipIdeas {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n': typeof types.TipIdeasDocument
  '\n  mutation UpdateTipIdea($input: UpdateTipIdeaInput!) {\n    updateTipIdea(input: $input) {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n': typeof types.UpdateTipIdeaDocument
}
const documents: Documents = {
  '\n  query FindManyUsers {\n    findManyUsers {\n      user_id\n      username\n    }\n  }\n':
    types.FindManyUsersDocument,
  '\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n':
    types.SignUpDocument,
  '\n  mutation SignIn($input: SignInInput!) {\n    signIn(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n':
    types.SignInDocument,
  '\n  query CurrentUser {\n    currentUser {\n      user_id\n      username\n      email\n      role\n      permissions\n    }\n  }\n':
    types.CurrentUserDocument,
  '\n  query MyPersonalPage {\n    myPersonalPage {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n':
    types.MyPersonalPageDocument,
  '\n  mutation SavePersonalIntro($input: SavePersonalIntroInput!) {\n    savePersonalIntro(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n':
    types.SavePersonalIntroDocument,
  '\n  mutation SavePersonalDrawing($input: SavePersonalDrawingInput!) {\n    savePersonalDrawing(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n':
    types.SavePersonalDrawingDocument,
  '\n  query TipIdeas {\n    findManyTipIdeas {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n':
    types.TipIdeasDocument,
  '\n  mutation UpdateTipIdea($input: UpdateTipIdeaInput!) {\n    updateTipIdea(input: $input) {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n':
    types.UpdateTipIdeaDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query FindManyUsers {\n    findManyUsers {\n      user_id\n      username\n    }\n  }\n',
): (typeof documents)['\n  query FindManyUsers {\n    findManyUsers {\n      user_id\n      username\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SignIn($input: SignInInput!) {\n    signIn(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation SignIn($input: SignInInput!) {\n    signIn(input: $input) {\n      token\n      user {\n        user_id\n        username\n        email\n        role\n        permissions\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CurrentUser {\n    currentUser {\n      user_id\n      username\n      email\n      role\n      permissions\n    }\n  }\n',
): (typeof documents)['\n  query CurrentUser {\n    currentUser {\n      user_id\n      username\n      email\n      role\n      permissions\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query MyPersonalPage {\n    myPersonalPage {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  query MyPersonalPage {\n    myPersonalPage {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SavePersonalIntro($input: SavePersonalIntroInput!) {\n    savePersonalIntro(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  mutation SavePersonalIntro($input: SavePersonalIntroInput!) {\n    savePersonalIntro(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SavePersonalDrawing($input: SavePersonalDrawingInput!) {\n    savePersonalDrawing(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  mutation SavePersonalDrawing($input: SavePersonalDrawingInput!) {\n    savePersonalDrawing(input: $input) {\n      introTitle\n      introSubhead\n      introBody\n      strokes\n      updatedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TipIdeas {\n    findManyTipIdeas {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n',
): (typeof documents)['\n  query TipIdeas {\n    findManyTipIdeas {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateTipIdea($input: UpdateTipIdeaInput!) {\n    updateTipIdea(input: $input) {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateTipIdea($input: UpdateTipIdeaInput!) {\n    updateTipIdea(input: $input) {\n      body\n      createdAt\n      receipt\n      shippedHref\n      status\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
