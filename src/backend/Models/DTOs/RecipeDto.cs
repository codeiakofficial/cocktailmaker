using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record RecipeDto(int Id, string Name, string? ImageUrl, List<RecipeIngredient> RecipeIngredients)
{
    internal static RecipeDto From(Recipe recipe) =>
        new(recipe.Id, recipe.Name, recipe.ImageUrl, recipe.RecipeIngredients ?? new List<RecipeIngredient>());

    internal Recipe ToRecipe() =>
        new()
        {
            Id = Id,
            Name = Name,
            ImageUrl = ImageUrl,
            RecipeIngredients = RecipeIngredients,
        };
}

public record CreateRecipeDto
{
    internal static CreateRecipeDto From(Recipe recipe) =>
        new()
        {
            Name = recipe.Name,
            ImageUrl = recipe.ImageUrl,
            RecipeIngredients = recipe.RecipeIngredients ?? new List<RecipeIngredient>(),
        };

    internal Recipe ToRecipe() => new() { Name = Name, ImageUrl = ImageUrl, RecipeIngredients = RecipeIngredients };

    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}

public record UpdateRecipeDto
{
    internal static UpdateRecipeDto From(Recipe recipe) =>
        new()
        {
            Name = recipe.Name,
            ImageUrl = recipe.ImageUrl,
            RecipeIngredients = recipe.RecipeIngredients ?? new List<RecipeIngredient>(),
        };

    internal Recipe ToRecipe(int id) =>
        new()
        {
            Id = id,
            Name = Name,
            ImageUrl = ImageUrl,
            RecipeIngredients = RecipeIngredients,
        };

    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}
