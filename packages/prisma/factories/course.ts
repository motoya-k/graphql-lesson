import { Factory } from "fishery";
import { Course, Post, User } from "@prisma/client";
import { chance } from "./client";

export const courseFactory = Factory.define<Course>(({ params }) => {
  const { instructorId } = params;
  if (!instructorId) throw new Error("instructorId is required");
  return {
    id: chance.guid({ version: 4 }),
    title: chance.name(),
    instructorId,
  };
});
