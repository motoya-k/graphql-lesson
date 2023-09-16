import { IStitchSchemasOptions } from "@graphql-tools/stitch";

export type SchemaConfig<
  TContext extends Record<string, any> = Record<string, any>
> = {
  [name: string]: {
    graphqlEndpoint: string;
    sdlEndpoint: string;
  } & Partial<
    NonNullable<IStitchSchemasOptions<TContext>["subschemas"]>[number]
  >;
};

export const schemaConfig: SchemaConfig = {
  // "apollo-server": {
  //   graphqlEndpoint: "http://localhost:4001/graphql",
  // },
  // "express-graphql": {
  //   graphqlEndpoint: "http://localhost:4002/graphql",
  // },
  // "graphql-helix": {
  //   graphqlEndpoint: "http://localhost:4003/graphql",
  //   batch: true, // Type Mergingする際のリクエストをbach化する
  //   merge: {
  //     Course: {
  //       fieldName: "courses",
  //       selectionSet: "{ id }",
  //       args: (originalObject) => {
  //         console.log("originalObject", originalObject);
  //         return {
  //           id: originalObject.id,
  //         };
  //       },
  //     },
  //     UnExpected: {
  //       fieldName: "unExpected",
  //       selectionSet: "{ id }",
  //       args: (originalObject) => {
  //         console.log("originalObject", originalObject);
  //         return {
  //           id: originalObject.id,
  //         };
  //       }
  //     }
  //   },
  // },
  "graphql-yoga": {
    graphqlEndpoint: "http://localhost:4004/graphql",
    sdlEndpoint: "http://localhost:4404/graphql",
  },
  "graphql-yoga-2": {
    graphqlEndpoint: "http://localhost:4014/graphql",
    sdlEndpoint: "http://localhost:4414/graphql",
  },
};
