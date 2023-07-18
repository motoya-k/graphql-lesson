import { Factory } from "fishery";
import { Assignment, Course } from "@prisma/client";
import { chance } from "./client";

class AssignmentFactory implements Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;

  // FIXME: ここの course がうまく入らない
  // NOTE: やっぱ JS は関数にしたほうがいい ?
  constructor(props: { course: Course }) {
    const { course } = props;
    this.id = chance.guid({ version: 4 });
    this.title = chance.name();
    this.description = chance.email();
    this.courseId = course.id;
  }
}

export const assignmentFactory = Factory.define<Assignment>(({ params }) => {
  if (!params.courseId) throw new Error("course is required");
  return {
    id: chance.guid({ version: 4 }),
    title: chance.name(),
    description: chance.email(),
    courseId: params.courseId,
  };
});
