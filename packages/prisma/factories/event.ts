import { Factory } from "fishery";
import { Event } from "@prisma/client";
import { chance } from "./client";

export const eventFactory = Factory.define<Event>(() => {
  return {
    id: chance.guid({ version: 4 }),
    title: chance.name(),
    date: chance.date(),
    location: chance.address(),
  };
});
