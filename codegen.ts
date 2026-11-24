import type { CodegenConfig } from "@graphql-codegen/cli";

// The API contract is gl-node's published schema, read from openledger-v2
// (never edited from here). Point OPENLEDGER_V2_PATH elsewhere if that repo
// is not beside this one. The generated files are committed, so building
// the app (on Vercel too) never needs openledger-v2: run `bun run codegen`
// after the schema or an operation changes.
const openledgerRepositoryPath = process.env.OPENLEDGER_V2_PATH ?? "../openledger-v2";

// documentMode "string": each operation is a typed string, sent as it is,
// so the app ships no GraphQL parser or printer.
const sharedConfig = {
  documentMode: "string",
  enumsAsTypes: true,
  useTypeImports: true,
  avoidOptionals: { field: true, inputValue: false, object: true, defaultValue: false },
  scalars: {
    Date: "string",
    Decimal: "string",
    TxId: "string"
  }
};

const plugins = ["typescript", "typescript-operations", "typed-document-node"];

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "src/graphql/generated/ledger.ts": {
      schema: `${openledgerRepositoryPath}/docs/api/schema.graphql`,
      documents: "src/graphql/ledger/**/*.graphql",
      plugins,
      config: sharedConfig
    },
    "src/graphql/generated/node.ts": {
      schema: `${openledgerRepositoryPath}/docs/api/node-schema.graphql`,
      documents: "src/graphql/node/**/*.graphql",
      plugins,
      config: sharedConfig
    }
  }
};

export default config;
