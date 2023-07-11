export type SchemaConfig = {
  [name: string]: {
    graphqlEndpoint: string;
  };
};

export const schemaConfig: SchemaConfig = {
  "apollo-server": {
    graphqlEndpoint: "http://localhost:4001/graphql",
  },
  "express-graphql": {
    graphqlEndpoint: "http://localhost:4002/graphql",
  },
  "graphql-helix": {
    graphqlEndpoint: "http://localhost:4003/graphql",
  },
  "graphql-yoga": {
    graphqlEndpoint: "http://localhost:4004/graphql",
  },
};
