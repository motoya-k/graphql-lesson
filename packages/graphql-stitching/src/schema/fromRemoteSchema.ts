import { parse, buildSchema, OperationTypeNode } from "graphql";
import { IStitchSchemasOptions, stitchSchemas } from "@graphql-tools/stitch";
import { stitchingDirectives } from '@graphql-tools/stitching-directives'

import { print } from "graphql";
import { AsyncExecutor } from "@graphql-tools/utils";
import { SchemaConfig } from "./config";
import fs from "fs";

const { stitchingDirectivesTransformer } = stitchingDirectives();

const createExecutor = async (endpoint: string): Promise<AsyncExecutor> => {
  const executor: AsyncExecutor = async ({
    document,
    variables,
    operationName,
    extensions,
  }) => {
    const query = print(document);
    const fetchResult = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables, operationName, extensions }),
      // cache: 'no-cache',
    });
    return fetchResult.json();
  };
  return executor;
};

type NonNullable<T> = T extends null | undefined ? never : T;
const createSubSchema = async <
  TContext extends Record<string, any> = Record<string, any>
>(
  endpoint: string,
  sdlEndpoint: string,
  schemaOptions?: Partial<
    NonNullable<IStitchSchemasOptions<TContext>["subschemas"]>[number]
  >
) => {
  const executor = await createExecutor(endpoint);
  const sdlExecutor = await createExecutor(sdlEndpoint);
  const remoteSchema = await fetchRemoteSchema(sdlExecutor);

  const subSchema: NonNullable<
    IStitchSchemasOptions<TContext>["subschemas"]
  >[number] = {
    schema: remoteSchema,
    executor,
    ...(schemaOptions ?? {}),
  };
  return subSchema;
};

// NOTE: dsl を参照する方
const fetchRemoteSchema = async (executor: AsyncExecutor) => {
  const result: any = await executor({ document: parse("{ _sdl }") });
  return buildSchema(result.data._sdl);
};

export const createGatewaySchema = async <
  TContext extends Record<string, any> = Record<string, any>
>(
  config: SchemaConfig
) => {
  const subSchemas = await Promise.all(
    Object.keys(config).map(async (key) => {
      const { graphqlEndpoint, sdlEndpoint, ...subSchemaOption } = config[key];
      const subSchema = await createSubSchema(
        graphqlEndpoint,
        sdlEndpoint,
        subSchemaOption
      );
      return subSchema;
    })
  );
  console.log("subSchemas", subSchemas);
  // subSchemas を /tmp 配下に json 形式で保存する
  // fs.writeFileSync(
  //   "/tmp/subSchemas.json",
  //   JSON.stringify(subSchemas, null, 2),
  //   "utf8"
  // );
  return stitchSchemas<TContext>({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: subSchemas,
  });
};
