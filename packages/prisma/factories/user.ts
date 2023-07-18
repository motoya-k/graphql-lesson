import { Factory } from "fishery";
import { User } from "@prisma/client";
import { chance } from "./client";

export const userFactory = Factory.define<User>(({ params: { eventId } }) => ({
  id: chance.guid({ version: 4 }),
  name: chance.name(),
  email: chance.email(),
  eventId: eventId ?? null,
}));
