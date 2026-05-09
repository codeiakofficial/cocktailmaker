export interface IIngredient {
    id: number;
    name: string;
    usedInRecipes: {
        name: string;
    }[];
}
export type IngredientContextType = {
    ingredients: IIngredient[];
};