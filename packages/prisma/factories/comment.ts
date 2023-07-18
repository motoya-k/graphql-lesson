import { Factory } from "fishery";
import { Comment, Post, User } from "@prisma/client";
import { chance } from "./client";

class CommentFactory implements Comment {
  id: string;
  text: string;
  authorId: string;
  postId: string;

  constructor(props: { author: User; post: Post }) {
    this.id = chance.guid({ version: 4 });
    this.text = chance.name();
    this.authorId = props.author.id;
    this.postId = props.post.id;
  }
}

export const commentFactory = Factory.define<Comment>(({ params }) => {
  const { authorId, postId } = params;
  if (!authorId) throw new Error("authorId is required");
  if (!postId) throw new Error("postId is required");
  return {
    id: chance.guid({ version: 4 }),
    text: chance.name(),
    authorId,
    postId,
  };
});
