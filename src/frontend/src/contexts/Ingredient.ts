export interface IIngredient {
    id: number;
    name: string;
    usedInRecipes: number[];
}
export type IngredientContextType = {
    ingredients: IIngredient[];
    deleteIngredient: (id: number) => Promise<void>;
};