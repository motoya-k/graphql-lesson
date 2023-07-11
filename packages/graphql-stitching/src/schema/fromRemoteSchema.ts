import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { stitchSchemas } from "@graphql-tools/stitch";
import { SubschemaConfig } from "@graphql-tools/delegate/typings";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { GraphQLSchema, print } from "graphql";
import { AsyncExecutor } from "@graphql-tools/utils";
import { fetch } from "@whatwg-node/fetch";
import { SchemaConfig } from "./config";

const remoteExecutor = buildHTTPExecutor({
  endpoint: "http://localhost:4001/graphql",
});

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

const createExecutor = async (endpoint: string) => {
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
    });
    return fetchResult.json();
  };

  const remoteSchema = await schemaFromExecutor(executor);
  const subSchema = {
    schema: remoteSchema,
    executor,
  };
  return subSchema;
};

export const createGatewaySchema = async <
  TContext extends Record<string, any> = Record<string, any>
>(
  config: SchemaConfig
) => {
  const subSchemas = await Promise.all(
    Object.keys(config).map(async (key) => {
      const subSchema = await createExecutor(config[key].graphqlEndpoint);
      return subSchema;
    })
  );
  return stitchSchemas<TContext>({
    subschemas: subSchemas,
  });
};
