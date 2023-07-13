import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

// Construct a schema, using GraphQL schema language
const typeDef = `
  type Query {
    hello: String
    _sdl: String
  }
`;
var schema = buildSchema(typeDef);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!";
  },
  _sdl: () => {
    return typeDef;
  },
};

async function server() {
  var app = express();
  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );
  const PORT = 4002;
  app.listen(PORT);
  console.log(
    `Running a GraphQL API server at http://localhost:${PORT}/graphql`
  );
}

server();
