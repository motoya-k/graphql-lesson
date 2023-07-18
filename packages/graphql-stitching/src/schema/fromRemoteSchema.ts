import { parse, buildSchema, OperationTypeNode } from "graphql";
import { IStitchSchemasOptions, stitchSchemas } from "@graphql-tools/stitch";
import { stitchingDirectives } from "@graphql-tools/stitching-directives";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { print } from "graphql";
import { AsyncExecutor } from "@graphql-tools/utils";
import { fetch } from "@whatwg-node/fetch";
import { SchemaConfig } from "./config";
import { delegateToSchema } from "@graphql-tools/delegate";
import fs from "fs";
const { stitchingDirectivesTransformer } = stitchingDirectives();

/**
 A simple way to create executor
 
 const remoteExecutor = buildHTTPExecutor({
   endpoint: url,
 });
 
You can also pass options to the executor

const remoteExecutor2 = buildHTTPExecutor({
  endpoint: url,
  // optional and default is false
  useGETForQueries: false,
  // optional
  headers: {
      authorization: "Bearer MY-TOKEN",
  },
  // optional and default is POST
  method: "POST",
  // Timeout and default is Infinity
  timeout: Infinity,
  // Request Credentials (default: 'same-origin') [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)
  credentials: "same-origin",
  // Retry attempts on fail and default is 0
  retry: 0,
});

**/

type NonNullable<T> = T extends null | undefined ? never : T;
const createExecutor = async <
  TContext extends Record<string, any> = Record<string, any>
>(
  endpoint: string,
  schemaOptions?: Partial<
    NonNullable<IStitchSchemasOptions<TContext>["subschemas"]>[number]
  >
) => {
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

  const remoteSchema = await fetchRemoteSchema(executor);

  console.log("schemaOptions", schemaOptions);
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
// const fetchRemoteSchema = async (executor: AsyncExecutor) => {
//   const result: any = await executor({ document: parse("{ _sdl }") });
//   return buildSchema(
//     `directive @test (reason: String) on FIELD_DEFINITION | ENUM_VALUE | QUERY | FIELD \n ${result.data._sdl}`
//   );
// };

const fetchRemoteSchema = async (executor: AsyncExecutor) => {
  return schemaFromExecutor(executor);
};

export const createGatewaySchema = async <
  TContext extends Record<string, any> = Record<string, any>
>(
  config: SchemaConfig
) => {
  const subSchemas = await Promise.all(
    Object.keys(config).map(async (key) => {
      const { graphqlEndpoint, ...subSchemaOption } = config[key];
      const subSchema = await createExecutor(graphqlEndpoint, subSchemaOption);
      return subSchema;
    })
  );
  console.log('subSchemas', subSchemas)
  return stitchSchemas<TContext>({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: subSchemas,
    typeDefs: `
      extend type User {
        courses: [Course]
      }
    `,
    // resolvers: {
    //   User: {
    //     // courses: {
    //     //   selectionSet: `{ id }`,
    //     //   resolve: (user, _args, context, info) => {
    //     //     console.log("call delegate to schema with user", user);
    //     //     return delegateToSchema({
    //     //       // schema を key で指定できるようにしたほうがいい
    //     //       schema: subSchemas[2],
    //     //       operation: OperationTypeNode.QUERY,
    //     //       fieldName: "courses",
    //     //       // args: {
    //     //       //   where: {
    //     //       //     userId: user.id,
    //     //       //   },
    //     //       // },
    //     //       context,
    //     //       info,
    //     //     });
    //     //   },
    //     // },
    //     likes: {
    //       selectionSet: `{ id }`,
    //       resolve: (user, _args, context, info) => {
    //         console.log("call delegate to schema with user", user);
    //         return delegateToSchema({
    //           schema: subSchemas[1],
    //           operation: OperationTypeNode.QUERY,
    //           fieldName: "likes",
    //           // args: {
    //           //   where: {
    //           //     userId: user.id,
    //           //   },
    //           // },
    //           context,
    //           info,
    //         });
    //       },
    //     },
    //   },
    // },
  });
};
