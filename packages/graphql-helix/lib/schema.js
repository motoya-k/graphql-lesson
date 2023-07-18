"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
exports.schema = new graphql_1.GraphQLSchema({
    mutation: new graphql_1.GraphQLObjectType({
        name: "Mutation",
        fields: () => ({
            echo: {
                args: {
                    text: {
                        type: graphql_1.GraphQLString,
                    },
                },
                type: graphql_1.GraphQLString,
                resolve: (_root, args) => {
                    return args.text;
                },
            },
        }),
    }),
    query: new graphql_1.GraphQLObjectType({
        name: "Query",
        fields: () => ({
            _sdl: {
                type: graphql_1.GraphQLString,
                resolve: () => {
                    return `
            type Query {
              _sdl: String
              alphabet: [String]
              song: Song
            }
            type Song {
              firstVerse: String
              secondVerse: String
            }
          `;
                },
            },
            alphabet: {
                type: new graphql_1.GraphQLList(graphql_1.GraphQLString),
                resolve: async function* () {
                    for (let letter = 65; letter <= 90; letter++) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        yield String.fromCharCode(letter);
                    }
                },
            },
            song: {
                type: new graphql_1.GraphQLObjectType({
                    name: "Song",
                    fields: () => ({
                        firstVerse: {
                            type: graphql_1.GraphQLString,
                            resolve: () => "Now I know my ABC's.",
                        },
                        secondVerse: {
                            type: graphql_1.GraphQLString,
                            resolve: () => new Promise((resolve) => setTimeout(() => resolve("Next time won't you sing with me?"), 5000)),
                        },
                    }),
                }),
                resolve: () => ({}),
            },
        }),
    }),
    subscription: new graphql_1.GraphQLObjectType({
        name: "Subscription",
        fields: () => ({
            count: {
                type: graphql_1.GraphQLInt,
                args: {
                    to: {
                        type: graphql_1.GraphQLInt,
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
//# sourceMappingURL=schema.js.map