import { Factory } from "fishery";
import { Category } from "@prisma/client";
import { chance } from "./client";

class CategoryFactory implements Category {
  id: string;
  name: string;

  constructor() {
    this.id = chance.guid({ version: 4 });
    this.name = chance.name();
  }
}

export const categoryFactory = Factory.define<Category>(() => {
  return {
    id: chance.guid({ version: 4 }),
    name: chance.name(),
  };
});
