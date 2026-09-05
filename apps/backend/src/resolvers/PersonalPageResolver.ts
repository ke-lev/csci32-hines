import 'reflect-metadata'
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import type { Context } from '@/utils/graphql'
import { requireCurrentUser } from '@/utils/graphql'
import { normalizeStrokes, validateIntroInput } from '@/services/personal-page-validation'
import { GraphQLError } from 'graphql'

@ObjectType()
class PersonalPage {
  @Field(() => String, { nullable: true })
  introTitle?: string | null

  @Field(() => String, { nullable: true })
  introSubhead?: string | null

  @Field(() => String, { nullable: true })
  introBody?: string | null

  @Field(() => [[Number]])
  strokes!: number[][]

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

@InputType()
class SavePersonalDrawingInput {
  @Field(() => [[Number]])
  strokes!: number[][]
}

type PersonalPageRow = {
  intro_body: string | null
  intro_subhead: string | null
  intro_title: string | null
  strokes: unknown
  updated_at: Date
}

const pageSelection = {
  intro_body: true,
  intro_subhead: true,
  intro_title: true,
  strokes: true,
  updated_at: true,
} as const

/**
 * Stored strokes are re-validated on the way out: the column is JSON, so a row written by an
 * older shape would otherwise reach the browser unchecked. An unreadable drawing reads as blank
 * rather than failing the whole page.
 */
function toView(row: PersonalPageRow): PersonalPage {
  const strokes = normalizeStrokes(row.strokes)

  return {
    introBody: row.intro_body,
    introSubhead: row.intro_subhead,
    introTitle: row.intro_title,
    strokes: strokes.ok ? strokes.value : [],
    updatedAt: row.updated_at.toISOString(),
  }
}

@Resolver()
export class PersonalPageResolver {
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

  @Mutation(() => PersonalPage)
  async savePersonalDrawing(
    @Arg('input', () => SavePersonalDrawingInput) input: SavePersonalDrawingInput,
    @Ctx() context: Context,
  ): Promise<PersonalPage> {
    const currentUser = requireCurrentUser(context)
    const strokes = normalizeStrokes(input.strokes)

    if (!strokes.ok) {
      throw new GraphQLError(strokes.reason, {
        extensions: { code: 'BAD_USER_INPUT', field: 'strokes' },
      })
    }

    const row = await context.prisma.personalPage.upsert({
      create: { strokes: strokes.value, user_id: currentUser.user_id },
      select: pageSelection,
      update: { strokes: strokes.value },
      where: { user_id: currentUser.user_id },
    })

    return toView(row)
  }
}
