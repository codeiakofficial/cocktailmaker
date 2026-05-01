using CocktailMaker.Controllers;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Tests;

public class IngredientControllerTests
{
    private DbContextOptions<CocktailDbContext> _options;

    public IngredientControllerTests()
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
    public async Task CreateIngredient()
    {
        using (var context = new CocktailDbContext(_options))
        {
            IngredientController controller = new IngredientController(context);
            await controller.CreateIngredient(
                new Models.DTOs.CreateIngredientDto { Name = "Test Ingredient" }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            var ingredient = context.Ingredients.ToList().FirstOrDefault();
            Assert.Equal(1, ingredient?.Id);
            Assert.Equal("Test Ingredient", ingredient?.Name);
        }
    }

    [Fact]
    public async Task GetIngredients()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Ingredients.Add(new Ingredient { Name = "Ingredient1" });
            context.Ingredients.Add(new Ingredient { Name = "Ingredient2" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            IngredientController controller = new IngredientController(context);
            var result = await controller.GetIngredients();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var ingredientDtos = Assert.IsType<List<Models.DTOs.IngredientDto>>(okResult.Value);
            Assert.Equal(2, ingredientDtos.Count);
            Assert.Equal(1, ingredientDtos[0].id);
            Assert.Equal("Ingredient1", ingredientDtos[0].Name);
            Assert.Equal(2, ingredientDtos[1].id);
            Assert.Equal("Ingredient2", ingredientDtos[1].Name);
        }
    }
}
