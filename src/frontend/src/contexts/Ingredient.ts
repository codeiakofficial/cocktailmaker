export interface IIngredient {
    id: number;
    name: string;
    usedInRecipes: number[];
}
export type IngredientContextType = {
    ingredients: IIngredient[];
    fetchIngredients: () => Promise<void>;
    deleteIngredient: (id: number) => Promise<void>;
};