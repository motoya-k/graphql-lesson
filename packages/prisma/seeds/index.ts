import { Like, PrismaClient } from "@prisma/client";
import {
  userFactory,
  postFactory,
  likeFactory,
  eventFactory,
  courseFactory,
  assignmentFactory,
  ticketFactory,
} from "../factories";

const prisma = new PrismaClient();

export const seedSimpleUsers = async () => {
  const users = userFactory.buildList(24);
  await prisma.user.createMany({ data: users });
};

export const seedUserLikePosts = async () => {
  const ROW_NUMBER = 3;

  const users = userFactory.buildList(ROW_NUMBER);
  const posts = postFactory.buildList(ROW_NUMBER, { authorId: users[0].id });
  await prisma.user.createMany({ data: users });
  await prisma.post.createMany({ data: posts });

  const likes: Like[] = [];
  users.forEach(async (user) => {
    posts.forEach(async (post) => {
      const _like = likeFactory.build({
        userId: user.id,
        postId: post.id,
      });
      likes.push(_like);
    });
  });
  await prisma.like.createMany({ data: likes });
};

export const createEventAndUsers = async () => {
  const events = eventFactory.buildList(3);
  await prisma.event.createMany({ data: events });
  events.forEach(async (event) => {
    const users = userFactory.buildList(3, { eventId: event.id });
    await prisma.user.createMany({ data: users });
  });
};

export const createCourseAndAssignments = async () => {
  const users = userFactory.buildList(3);
  await prisma.user.createMany({ data: users });
  users.forEach(async (user) => {
    const courses = courseFactory.buildList(3, { instructorId: user.id });
    await prisma.course.createMany({ data: courses });
    courses.forEach(async (course) => {
      const assignments = assignmentFactory.buildList(3, {
        courseId: course.id,
      });
      await prisma.assignment.createMany({ data: assignments });
    });
  });
};

export const createTickets = async () => {
  const users = userFactory.buildList(3);
  await prisma.user.createMany({ data: users });
  users.forEach(async (user) => {
    const ticket = ticketFactory.build({ assignedToId: user.id });
    await prisma.ticket.create({ data: ticket });
  });
};

const execute = async () => {
  await seedSimpleUsers();
  await seedUserLikePosts();
  await createEventAndUsers();
  await createCourseAndAssignments();
  await createTickets();
};

execute();
