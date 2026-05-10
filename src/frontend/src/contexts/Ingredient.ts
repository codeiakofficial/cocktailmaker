export interface IIngredient {
    id: number;
    name: string;
    usedInRecipes: {
        name: string;
    }[];
}
export type IngredientContextType = {
    ingredients: IIngredient[];
    deleteIngredient: (id: number) => Promise<void>;
};