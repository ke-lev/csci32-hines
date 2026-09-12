import 'reflect-metadata'
import { Arg, Authorized, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { GraphQLError } from 'graphql'
import { PermissionName } from '@repo/database'

const IDEA_STATUSES = ['heard', 'trying_it', 'shipped'] as const
type IdeaStatus = (typeof IDEA_STATUSES)[number]

@ObjectType()
class TipIdea {
  @Field(() => String)
  body!: string

  @Field(() => String)
  createdAt!: string

  @Field(() => String, { nullable: true })
  closedAt?: string | null

  @Field(() => String)
  receipt!: string

  @Field(() => String)
  status!: string

  @Field(() => String, { nullable: true })
  shippedHref?: string | null
}

@InputType()
class UpdateTipIdeaInput {
  @Field(() => String)
  receipt!: string

  @Field(() => String)
  status!: string

  @Field(() => String, { nullable: true })
  shippedHref?: string
}

@InputType()
class SetTipIdeaClosedInput {
  @Field(() => String)
  receipt!: string

  @Field(() => Boolean)
  closed!: boolean
}

function isIdeaStatus(value: string): value is IdeaStatus {
  return IDEA_STATUSES.includes(value as IdeaStatus)
}

function isSafeInternalHref(value: string) {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\n') && !value.includes('\r')
}

function toView(row: {
  body: string
  closed_at: Date | null
  created_at: Date
  receipt: string
  shipped_href: string | null
  status: string
}): TipIdea {
  return {
    body: row.body,
    closedAt: row.closed_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    receipt: row.receipt,
    shippedHref: row.shipped_href,
    status: row.status,
  }
}

@Resolver()
export class TipIdeaResolver {
  @Query(() => [TipIdea])
  @Authorized(PermissionName.UserWrite)
  async findManyTipIdeas(@Ctx() context: Context): Promise<TipIdea[]> {
    const rows = await context.prisma.tipIdea.findMany({
      orderBy: [{ created_at: 'desc' }, { idea_id: 'desc' }],
      select: {
        body: true,
        closed_at: true,
        created_at: true,
        idea_id: true,
        receipt: true,
        shipped_href: true,
        status: true,
      },
    })

    return rows.map(toView)
  }

  @Mutation(() => TipIdea)
  @Authorized(PermissionName.UserWrite)
  async updateTipIdea(
    @Arg('input', () => UpdateTipIdeaInput) input: UpdateTipIdeaInput,
    @Ctx() context: Context,
  ): Promise<TipIdea> {
    const status = input.status === 'trying' ? 'trying_it' : input.status
    if (!isIdeaStatus(status)) {
      throw new GraphQLError('status must be heard, trying, or shipped', {
        extensions: { code: 'BAD_USER_INPUT', field: 'status' },
      })
    }

    const shippedHref = input.shippedHref?.trim() ?? ''
    if (status === 'shipped' && shippedHref && !isSafeInternalHref(shippedHref)) {
      throw new GraphQLError('shippedHref must be a site-relative path', {
        extensions: { code: 'BAD_USER_INPUT', field: 'shippedHref' },
      })
    }

    try {
      const row = await context.prisma.tipIdea.update({
        where: { receipt: input.receipt.trim() },
        data: {
          shipped_href: status === 'shipped' && shippedHref ? shippedHref : null,
          status,
        },
        select: {
          body: true,
          closed_at: true,
          created_at: true,
          idea_id: true,
          receipt: true,
          shipped_href: true,
          status: true,
        },
      })

      return toView(row)
    } catch {
      throw new GraphQLError('idea not found', {
        extensions: { code: 'NOT_FOUND' },
      })
    }
  }

  @Mutation(() => TipIdea)
  @Authorized(PermissionName.UserWrite)
  async setTipIdeaClosed(
    @Arg('input', () => SetTipIdeaClosedInput) input: SetTipIdeaClosedInput,
    @Ctx() context: Context,
  ): Promise<TipIdea> {
    try {
      const row = await context.prisma.tipIdea.update({
        where: { receipt: input.receipt.trim() },
        data: { closed_at: input.closed ? new Date() : null },
        select: {
          body: true,
          closed_at: true,
          created_at: true,
          idea_id: true,
          receipt: true,
          shipped_href: true,
          status: true,
        },
      })

      return toView(row)
    } catch {
      throw new GraphQLError('idea not found', {
        extensions: { code: 'NOT_FOUND' },
      })
    }
  }
}
