import { Factory } from "fishery";
import { Ticket } from "@prisma/client";
import { chance } from "./client";

export const ticketFactory = Factory.define<Ticket>(
  ({ params: { assignedToId } }) => {
    if (!assignedToId) throw new Error("assignedToId is required");
    return {
      id: chance.guid({ version: 4 }),
      title: chance.name(),
      description: chance.paragraph(),
      assignedToId,
    };
  }
);
