import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:4000/api/graphql',
  documents: ['app/**/*.{ts,tsx}', '!app/generated/**/*'],
  generates: {
    'schema.graphql': {
      plugins: ['schema-ast'],
    },
    'app/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
}

export default config
