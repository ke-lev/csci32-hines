import 'reflect-metadata'
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { requireCurrentUser } from '@/utils/graphql'
import { validateIntroInput } from '@/services/personal-page-validation'
import { GraphQLError } from 'graphql'

@ObjectType()
class PersonalPage {
  @Field(() => String, { nullable: true })
  introTitle?: string | null

  @Field(() => String, { nullable: true })
  introSubhead?: string | null

  @Field(() => String, { nullable: true })
  introBody?: string | null

  @Field(() => String)
  updatedAt!: string
}

@InputType()
class SavePersonalIntroInput {
  @Field(() => String)
  introTitle!: string

  @Field(() => String)
  introSubhead!: string

  @Field(() => String, { nullable: true })
  introBody?: string
}

type PersonalPageRow = {
  intro_body: string | null
  intro_subhead: string | null
  intro_title: string | null
  updated_at: Date
}

const pageSelection = {
  intro_body: true,
  intro_subhead: true,
  intro_title: true,
  updated_at: true,
} as const

function toView(row: PersonalPageRow): PersonalPage {
  return {
    introBody: row.intro_body,
    introSubhead: row.intro_subhead,
    introTitle: row.intro_title,
    updatedAt: row.updated_at.toISOString(),
  }
}

@ObjectType()
class PublicProfile {
  @Field(() => String)
  username!: string

  @Field(() => String, { nullable: true })
  introTitle?: string | null

  @Field(() => String, { nullable: true })
  introSubhead?: string | null

  @Field(() => String, { nullable: true })
  introBody?: string | null
}

@Resolver()
export class PersonalPageResolver {
  /**
   * Public: this is what a handle in the room resolves to. The selection is written out rather
   * than spread, so the password hash and email cannot reach it by accident.
   */
  @Query(() => PublicProfile, { nullable: true })
  async publicProfile(
    @Ctx() context: Context,
    @Arg('username', () => String) username: string,
  ): Promise<PublicProfile | null> {
    const row = await context.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        personalPage: { select: { intro_title: true, intro_subhead: true, intro_body: true } },
      },
    })

    if (!row) return null

    return {
      username: row.username,
      introTitle: row.personalPage?.intro_title ?? null,
      introSubhead: row.personalPage?.intro_subhead ?? null,
      introBody: row.personalPage?.intro_body ?? null,
    }
  }

  @Query(() => PersonalPage, { nullable: true })
  async myPersonalPage(@Ctx() context: Context): Promise<PersonalPage | null> {
    const currentUser = requireCurrentUser(context)

    const row = await context.prisma.personalPage.findUnique({
      select: pageSelection,
      where: { user_id: currentUser.user_id },
    })

    return row ? toView(row) : null
  }

  @Mutation(() => PersonalPage)
  async savePersonalIntro(
    @Arg('input', () => SavePersonalIntroInput) input: SavePersonalIntroInput,
    @Ctx() context: Context,
  ): Promise<PersonalPage> {
    const currentUser = requireCurrentUser(context)
    const validation = validateIntroInput(input)

    if (!validation.ok) {
      throw new GraphQLError('that intro needs a fix', {
        extensions: { code: 'BAD_USER_INPUT', fieldErrors: validation.fieldErrors },
      })
    }

    const intro = validation.value
    const row = await context.prisma.personalPage.upsert({
      create: {
        intro_body: intro.introBody,
        intro_subhead: intro.introSubhead,
        intro_title: intro.introTitle,
        user_id: currentUser.user_id,
      },
      select: pageSelection,
      update: {
        intro_body: intro.introBody,
        intro_subhead: intro.introSubhead,
        intro_title: intro.introTitle,
      },
      where: { user_id: currentUser.user_id },
    })

    return toView(row)
  }
}
