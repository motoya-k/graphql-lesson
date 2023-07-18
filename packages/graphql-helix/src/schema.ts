import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLOutputType,
} from "graphql";
import { prisma } from "./client/prisma";

const CourseType = new GraphQLObjectType({
  name: "Course",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    instructorId: { type: GraphQLString },
    instructor: {
      type: UserType,
      resolve: async (parent) => {
        const user = await prisma.user.findUnique({
          where: {
            id: parent.instructorId,
          },
        });
        return user;
      },
    },
  }),
});
const AssignmentType = new GraphQLObjectType({
  name: "Assignment",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    courseId: { type: GraphQLString },
    course: {
      type: CourseType,
      resolve: async (parent) => {
        const course = await prisma.course.findUnique({
          where: {
            id: parent.courseId,
          },
        });
        return course;
      },
    },
  }),
});
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    eventId: { type: GraphQLString },
  }),
});

export const schema = new GraphQLSchema({
  // mutation: new GraphQLObjectType({
  //   name: "Mutation",
  //   fields: () => ({
  //     echo: {
  //       args: {
  //         text: {
  //           type: GraphQLString,
  //         },
  //       },
  //       type: GraphQLString,
  //       resolve: (_root, args) => {
  //         return args.text;
  //       },
  //     },
  //   }),
  // }),
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      ping: {
        type: GraphQLString,
        resolve: () => "pong from graphql-helix",
      },
      _sdl: {
        type: GraphQLString,
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
      courses: {
        type: new GraphQLList(CourseType),
        resolve: async () => {
          console.log('call courses from graphql-helix')
          const courses = await prisma.course.findMany();
          return courses;
        },
      },
      courseById: {
        type: CourseType,
        args: {
          id: {
            type: GraphQLString,
          },
        },
        resolve: async (_root, args) => {
          const course = await prisma.course.findUnique({
            where: {
              id: args.id,
            },
          });
          return course;
        },
      },
      assignments: {
        type: new GraphQLList(AssignmentType),
        resolve: async () => {
          const assignments = await prisma.assignment.findMany();
          return assignments;
        },
      },
      users: {
        type: new GraphQLList(UserType),
        resolve: async () => {
          console.log('call users from graphql-helix')
          const users = await prisma.user.findMany();
          return users;
        },
      },
    }),
  }),
  // subscription: new GraphQLObjectType({
  //   name: "Subscription",
  //   fields: () => ({
  //     count: {
  //       type: GraphQLInt,
  //       args: {
  //         to: {
  //           type: GraphQLInt,
  //         },
  //       },
  //       subscribe: async function* (_root, args) {
  //         for (let count = 1; count <= args.to; count++) {
  //           await new Promise((resolve) => setTimeout(resolve, 1000));
  //           yield { count };
  //         }
  //       },
  //     },
  //   }),
  // }),
});
