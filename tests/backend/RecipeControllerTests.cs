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
            await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "Another Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient2",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient3",
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
            Assert.Equal(3, ingredients.Count);
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
            Assert.Equal("Another Cocktail", recipe?.Name);
            var ingredients = context.Ingredients.ToList();
            Assert.Equal(3, ingredients.Count);
            Assert.Equal("Ingredient1", ingredients[0].Name);
            Assert.Empty(ingredients[0].UsedInRecipes);
            Assert.Equal("Ingredient2", ingredients[1].Name);
            Assert.Single(ingredients[1].UsedInRecipes);
            Assert.Equal(2, ingredients[1].UsedInRecipes.FirstOrDefault());
            Assert.Equal("Ingredient3", ingredients[2].Name);
            Assert.Single(ingredients[2].UsedInRecipes);
            Assert.Equal(2, ingredients[2].UsedInRecipes.FirstOrDefault());
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

    [Fact]
    public async Task UpdateRecipeNotFound()
    {
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.UpdateRecipe(
                999,
                new Models.DTOs.UpdateRecipeDto
                {
                    Name = "Nonexistent Cocktail",
                    RecipeIngredients =
                    [
                        new RecipeIngredient
                        {
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                    ],
                }
            );
            Assert.IsType<NotFoundResult>(result);
        }
    }

    [Fact]
    public async Task CreateRecipe_WithImageUrl_PersistsImageUrl()
    {
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            await controller.CreateRecipe(new Models.DTOs.CreateRecipeDto
            {
                Name = "Visual Cocktail",
                ImageUrl = "http://example.com/drink.jpg",
                RecipeIngredients = [],
            });
        }

        using (var context = new CocktailDbContext(_options))
        {
            var recipe = context.Recipes.First();
            Assert.Equal("http://example.com/drink.jpg", recipe.ImageUrl);
        }
    }

    [Fact]
    public async Task UpdateRecipe_WithImageUrl_UpdatesImageUrl()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(new Recipe { Name = "Old", ImageUrl = "http://example.com/old.jpg" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            await controller.UpdateRecipe(1, new Models.DTOs.UpdateRecipeDto
            {
                Name = "Old",
                ImageUrl = "http://example.com/new.jpg",
                RecipeIngredients = [],
            });
        }

        using (var context = new CocktailDbContext(_options))
        {
            Assert.Equal("http://example.com/new.jpg", context.Recipes.First().ImageUrl);
        }
    }

    [Fact]
    public async Task GetRecipes_ReturnsImageUrl()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Recipes.Add(new Recipe { Name = "Photo Cocktail", ImageUrl = "http://example.com/photo.jpg" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.GetRecipes();
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dtos = Assert.IsType<List<Models.DTOs.RecipeDto>>(ok.Value);
            Assert.Equal("http://example.com/photo.jpg", dtos[0].ImageUrl);
        }
    }

    [Fact]
    public async Task IngredientUsedInRecipesIsUpdated()
    {
        // Create a recipe with an ingredient
        using (var context = new CocktailDbContext(_options))
        {
            RecipeController controller = new RecipeController(context);
            var result = await controller.CreateRecipe(
                new Models.DTOs.CreateRecipeDto
                {
                    Name = "New Cocktail",
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

        // Update the recipe with a new ingredient
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
                            Name = "Ingredient1",
                            Quantity = 50,
                            Unit = "ml",
                        },
                        new RecipeIngredient
                        {
                            Name = "Ingredient3",
                            Quantity = 20,
                            Unit = "ml",
                        },
                    ],
                }
            );
        }

        using (var context = new CocktailDbContext(_options))
        {
            // Check that all ingredients are updated correctly and that the recipeId has been added and removed correctly
            var ingredient1 = context.Ingredients.FirstOrDefault(i => i.Name == "Ingredient1");
            Assert.NotNull(ingredient1);
            Assert.Contains(1, ingredient1.UsedInRecipes);
            var ingredient2 = context.Ingredients.FirstOrDefault(i => i.Name == "Ingredient2");
            Assert.NotNull(ingredient2);
            Assert.DoesNotContain(1, ingredient2.UsedInRecipes);
            var ingredient3 = context.Ingredients.FirstOrDefault(i => i.Name == "Ingredient3");
            Assert.NotNull(ingredient3);
            Assert.Contains(1, ingredient3.UsedInRecipes);
        }
    }
}
