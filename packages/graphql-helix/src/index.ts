import express, { RequestHandler } from "express";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
  sendResult,
} from "graphql-helix";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

export const schema = new GraphQLSchema({
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
      echo: {
        args: {
          text: {
            type: GraphQLString,
          },
        },
        type: GraphQLString,
        resolve: (_root, args) => {
          return args.text;
        },
      },
    }),
  }),
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      alphabet: {
        type: new GraphQLList(GraphQLString),
        resolve: async function* () {
          for (let letter = 65; letter <= 90; letter++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            yield String.fromCharCode(letter);
          }
        },
      },
      song: {
        type: new GraphQLObjectType({
          name: "Song",
          fields: () => ({
            firstVerse: {
              type: GraphQLString,
              resolve: () => "Now I know my ABC's.",
            },
            secondVerse: {
              type: GraphQLString,
              resolve: () =>
                new Promise((resolve) =>
                  setTimeout(
                    () => resolve("Next time won't you sing with me?"),
                    5000
                  )
                ),
            },
          }),
        }),
        resolve: () => ({}),
      },
    }),
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: () => ({
      count: {
        type: GraphQLInt,
        args: {
          to: {
            type: GraphQLInt,
          },
        },
        subscribe: async function* (_root, args) {
          for (let count = 1; count <= args.to; count++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            yield { count };
          }
        },
      },
    }),
  }),
});

const app = express();
app.use(express.json());
app.use("/graphql", async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if (shouldRenderGraphiQL(request)) {
    res.send(renderGraphiQL());
  } else {
    const { operationName, query, variables } = getGraphQLParameters(request);

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
    });

    sendResult(result, res);
  }
});

const port = process.env.PORT || 4003;

app.listen(port, () => {
  console.log(`GraphQL server is running on port ${port}.`);
});
