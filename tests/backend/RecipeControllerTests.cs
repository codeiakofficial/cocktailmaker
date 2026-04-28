using CocktailMaker.Controllers;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using CocktailMaker.Data.Contexts;

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
}