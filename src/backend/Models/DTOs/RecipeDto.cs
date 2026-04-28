using System.Text.Json;
using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record RecipeDto(int Id, string Name, List<string> Ingredients)
{
    internal static RecipeDto From(Recipe recipe) =>
        new(recipe.Id, recipe.Name, JsonSerializer.Deserialize<List<string>>(recipe.Ingredients) ?? new List<string>());
    internal Recipe ToRecipe() => new() { Id = Id, Name = Name, Ingredients = JsonSerializer.Serialize(Ingredients) };
}

public record CreateRecipeDto
{
    internal static CreateRecipeDto From(Recipe recipe) =>
        new() { Name = recipe.Name, Ingredients = JsonSerializer.Deserialize<List<string>>(recipe.Ingredients) ?? new List<string>() };
    internal Recipe ToRecipe() => new() { Name = Name, Ingredients = JsonSerializer.Serialize(Ingredients) };
    public string Name { get; set; } = string.Empty;
    public List<string> Ingredients { get; set; } = new();
}

public record UpdateRecipeDto
{
    internal static UpdateRecipeDto From(Recipe recipe) =>
        new() { Name = recipe.Name, Ingredients = JsonSerializer.Deserialize<List<string>>(recipe.Ingredients) ?? new List<string>() };
    internal Recipe ToRecipe(int id) => new() { Id = id, Name = Name, Ingredients = JsonSerializer.Serialize(Ingredients) };
    public string Name { get; set; } = string.Empty;
    public List<string> Ingredients { get; set; } = new();
}