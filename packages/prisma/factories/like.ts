import { Factory } from "fishery";
import { Like } from "@prisma/client";
import { chance } from "./client";

export const likeFactory = Factory.define<Like>(({ params }) => {
  const { userId, postId } = params;
  if (!userId) throw new Error("userId is required");
  if (!postId) throw new Error("postId is required");

  return {
    id: chance.guid({ version: 4 }),
    userId,
    postId,
  };
});
