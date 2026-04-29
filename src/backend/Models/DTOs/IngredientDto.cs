using CocktailMaker.Data.Entities;

public record IngredientDto(string Name)
{
    internal static IngredientDto From(Ingredient ingredient) => new(ingredient.Name);

    internal Ingredient ToIngredient() => new() { Name = Name };
}
