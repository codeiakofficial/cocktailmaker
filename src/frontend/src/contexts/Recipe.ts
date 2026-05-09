export interface IRecipes {
  recipes: IRecipe;
  }[];

export interface IRecipe {
  id: number;
  name: string;
  recipeIngredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}
export type RecipeContextType = {
  recipes: IRecipe[];
  saveRecipe: (recipe: IRecipe) => Promise<void>;
  updateRecipe: (id: number, recipe: IRecipe) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
};