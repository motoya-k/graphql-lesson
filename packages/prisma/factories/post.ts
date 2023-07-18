import { Factory } from "fishery";
import { Post, User } from "@prisma/client";
import { chance } from "./client";

export const postFactory = Factory.define<Post>(({ params: { authorId } }) => {
  if (!authorId) throw new Error("authorId is required");
  return {
    id: chance.guid({ version: 4 }),
    title: chance.name(),
    content: chance.paragraph(),
    authorId,
  };
});
