using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record IngredientDto(string Name, List<int> UsedInRecipes)
{
    internal static IngredientDto From(Ingredient ingredient) =>
        new(ingredient.Name, ingredient.UsedInRecipes ?? new List<int>());

    internal Ingredient ToIngredient() => new() { Name = Name, UsedInRecipes = UsedInRecipes };
}

public record CreateIngredientDto(string Name)
{
    internal static CreateIngredientDto From(Ingredient ingredient) => new(ingredient.Name);

    internal Ingredient ToIngredient() => new() { Name = Name };
}
