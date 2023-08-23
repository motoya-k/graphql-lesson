import { parse, buildSchema, OperationTypeNode } from "graphql";
import { IStitchSchemasOptions, stitchSchemas } from "@graphql-tools/stitch";
import { stitchingDirectives } from "@graphql-tools/stitching-directives";
// import { schemaFromExecutor } from "@graphql-tools/wrap";
import { print } from "graphql";
import { AsyncExecutor } from "@graphql-tools/utils";
import { SchemaConfig } from "./config";
// import { delegateToSchema } from "@graphql-tools/delegate";
// import fs from "fs";
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

// const fetchRemoteSchema = async (executor: AsyncExecutor) => {
//   return schemaFromExecutor(executor);
// };

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
  return stitchSchemas<TContext>({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: subSchemas,
    // typeDefs: `
    //   extend type User {
    //     courses: [Course]
    //     likes: [Like]
    //   }
    // `,
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
    //     // expectedQuery: {
    //     //   selectionSet: `{ id }`,
    //     //   resolve: (user, _args, context, info) => {
    //     //     console.log("call delegate to schema with user", user);
    //     //     return delegateToSchema({
    //     //       schema: subSchemas[0],
    //     //       operation: OperationTypeNode.QUERY,
    //     //       fieldName: "expectedQuery",
    //     //       // args: {
    //     //       //   where: {
    //     //       //     userId: user.id,
    //     //       //   },
    //     //       // },
    //     //       context,
    //     //       info,
    //     //     });
    //     //   }

    //     // }
    //   },
    // },
  });
};
