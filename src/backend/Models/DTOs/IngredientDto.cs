using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record IngredientDto(int id, string Name, List<int> UsedInRecipes)
{
    internal static IngredientDto From(Ingredient ingredient) =>
        new(ingredient.Id, ingredient.Name, ingredient.UsedInRecipes ?? new List<int>());

    internal Ingredient ToIngredient() =>
        new()
        {
            Id = id,
            Name = Name,
            UsedInRecipes = UsedInRecipes,
        };
}

public record CreateIngredientDto
{
    internal static CreateIngredientDto From(Ingredient ingredient) =>
        new() { Name = ingredient.Name };

    internal Ingredient ToIngredient() => new() { Name = Name };

    public string Name { get; set; } = string.Empty;
}

public record UpdateIngredientDto
{
    internal static UpdateIngredientDto From(Ingredient ingredient) =>
        new() { Name = ingredient.Name };

    internal Ingredient ToIngredient() => new() { Name = Name };

    public string Name { get; set; } = string.Empty;
}
