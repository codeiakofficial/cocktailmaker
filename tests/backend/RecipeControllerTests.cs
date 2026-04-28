using CocktailMaker.Controllers;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using CocktailMaker.Data.Contexts;
using Microsoft.AspNetCore.Mvc;

namespace CocktailMaker.Tests;
public class RecipeControllerTests
{
    private DbContextOptions<CocktailDbContext> _options;

    public RecipeControllerTests()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        _options = new DbContextOptionsBuilder<CocktailDbContext>().UseSqlite(connection).Options;
        using (var context = new CocktailDbContext(_options))
        {
            context.Database.EnsureCreated();
        }
    }

    [Fact]
    public async Task CreateRecipe()
    {
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            await controller.CreateRecipe(new Models.DTOs.CreateRecipeDto
            {
                Name = "Test Cocktail",
                Ingredients = new List<string> { "Ingredient1", "Ingredient2" }
            });
        }
        
        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.ToList().FirstOrDefault();
            Assert.Equal(1, recipe?.Id);
            Assert.Equal("Test Cocktail", recipe?.Name);
            Assert.Equal("[\"Ingredient1\",\"Ingredient2\"]", recipe?.Ingredients);
        }
    }

    [Fact]
    public async Task GetRecipes()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(new Data.Entities.Recipe
            {
                Name = "Test Cocktail",
                Ingredients = "[\"Ingredient1\",\"Ingredient2\"]"
            });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.GetRecipes();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var recipeDtos = Assert.IsType<List<Models.DTOs.RecipeDto>>(okResult.Value);
            Assert.Single(recipeDtos);
            Assert.Equal(1, recipeDtos[0].Id);
            Assert.Equal("Test Cocktail", recipeDtos[0].Name);
            Assert.Equal(new List<string> { "Ingredient1", "Ingredient2" }, recipeDtos[0].Ingredients);
        }
    }

    [Fact]
    public async Task GetRecipeById()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(new Data.Entities.Recipe
            {
                Name = "Test Cocktail",
                Ingredients = "[\"Ingredient1\",\"Ingredient2\"]"
            });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.GetRecipe(1);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var recipeDto = Assert.IsType<Models.DTOs.RecipeDto>(okResult.Value);
            Assert.Equal(1, recipeDto.Id);
            Assert.Equal("Test Cocktail", recipeDto.Name);
            Assert.Equal(new List<string> { "Ingredient1", "Ingredient2" }, recipeDto.Ingredients);
        }
    }

    [Fact]
    public async Task UpdateRecipe()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(new Data.Entities.Recipe
            {
                Name = "Test Cocktail",
                Ingredients = "[\"Ingredient1\",\"Ingredient2\"]"
            });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.UpdateRecipe(1, new Models.DTOs.UpdateRecipeDto
            {
                Name = "Updated Cocktail",
                Ingredients = new List<string> { "Ingredient3", "Ingredient4" }
            });
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.ToList().FirstOrDefault();
            Assert.Equal(1, recipe?.Id);
            Assert.Equal("Updated Cocktail", recipe?.Name);
            Assert.Equal("[\"Ingredient3\",\"Ingredient4\"]", recipe?.Ingredients);
        }
    }
}