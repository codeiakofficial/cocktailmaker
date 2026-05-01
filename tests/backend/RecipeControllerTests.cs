using CocktailMaker.Controllers;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

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
            await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.ToList().FirstOrDefault();
            Assert.Equal(1, recipe?.Id);
            Assert.Equal("Test Cocktail", recipe?.Name);
            Assert.Equivalent(
                new List<RecipeIngredient>
                {
                    new RecipeIngredient
                    {
                        Name = "Ingredient1",
                        Quantity = 50,
                        Unit = "ml",
                    },
                    new RecipeIngredient
                    {
                        Name = "Ingredient2",
                        Quantity = 30,
                        Unit = "ml",
                    },
                },
                recipe?.RecipeIngredients
            );
        }
    }

    [Fact]
    public async Task GetRecipes()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(
                new Recipe
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
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
            Assert.Equivalent(
                new List<RecipeIngredient>
                {
                    new RecipeIngredient
                    {
                        Name = "Ingredient1",
                        Quantity = 50,
                        Unit = "ml",
                    },
                    new RecipeIngredient
                    {
                        Name = "Ingredient2",
                        Quantity = 30,
                        Unit = "ml",
                    },
                },
                recipeDtos[0].RecipeIngredients
            );
        }
    }

    [Fact]
    public async Task GetRecipeById()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(
                new Recipe
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
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
            Assert.Equivalent(
                new List<RecipeIngredient>
                {
                    new RecipeIngredient
                    {
                        Name = "Ingredient1",
                        Quantity = 50,
                        Unit = "ml",
                    },
                    new RecipeIngredient
                    {
                        Name = "Ingredient2",
                        Quantity = 30,
                        Unit = "ml",
                    },
                },
                recipeDto.RecipeIngredients
            );
        }
    }

    [Fact]
    public async Task UpdateRecipe()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(
                new Recipe
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.UpdateRecipe(
                1,
                new Models.DTOs.UpdateRecipeDto
                {
                    Name = "Updated Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient3",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient4",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.ToList().FirstOrDefault();
            Assert.Equal(1, recipe?.Id);
            Assert.Equal("Updated Cocktail", recipe?.Name);
            //Assert.Equal("[\"Ingredient3\",\"Ingredient4\"]", recipe?.IngredientsJson);
        }
    }

    [Fact]
    public async Task DeleteRecipe()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(
                new Recipe
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.DeleteRecipe(1);
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.ToList().FirstOrDefault();
            Assert.Null(recipe);
        }
    }

    [Fact]
    public async Task CreateIngredientsIfNotExistOnCreate()
    {
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            var ingredients = context.Ingredients.ToList();
            Assert.Equal(2, ingredients.Count);
            Assert.Equal("Ingredient1", ingredients[0].Name);
            Assert.Equal("Ingredient2", ingredients[1].Name);
        }
    }

    [Fact]
    public async Task CreateIngredientsIfNotExistOnUpdate()
    {
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.UpdateRecipe(
                1,
                new Models.DTOs.UpdateRecipeDto
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient3Updated",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var ingredients = context.Ingredients.ToList();
            Assert.Equal(3, ingredients.Count);
            Assert.Equal("Ingredient1", ingredients[0].Name);
            Assert.Equal("Ingredient2", ingredients[1].Name);
            Assert.Equal("Ingredient3Updated", ingredients[2].Name);
        }
    }

    [Fact]
    public async Task CreateIngredientsIfNotExistDoesNotCreateExistingIngredients()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Ingredients.Add(new Ingredient { Name = "Ingredient1" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "Test Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 30,
                            Unit = "ml",
                        },
                    ],
                }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            var ingredients = context.Ingredients.ToList();
            Assert.Equal(2, ingredients.Count);
            Assert.Equal("Ingredient1", ingredients[0].Name);
            Assert.Equal("Ingredient2", ingredients[1].Name);
        }
    }
}
