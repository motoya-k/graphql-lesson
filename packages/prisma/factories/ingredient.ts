import { Factory } from "fishery";
import { Ingredient } from "@prisma/client";
import { chance } from "./client";

export const ingredientFactory = Factory.define<Ingredient>(({ params }) => {
  if (!params.recipeId) throw new Error("recipe is required");
  return {
    id: chance.guid({ version: 4 }),
    name: chance.name(),
    quantity: chance.email(),
    recipeId: params.recipeId,
  };
});
