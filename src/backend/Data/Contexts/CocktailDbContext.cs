using System.Text.Json;
using CocktailMaker.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Data.Contexts;

public class CocktailDbContext : DbContext
{
    public CocktailDbContext(DbContextOptions<CocktailDbContext> options)
        : base(options) { }

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<Agent> Agents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity
                .Property(e => e.RecipeIngredients)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v =>
                        JsonSerializer.Deserialize<List<RecipeIngredient>>(
                            v,
                            (JsonSerializerOptions?)null
                        ) ?? new List<RecipeIngredient>()
                );
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<Agent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.AgentId).IsRequired();
            entity.HasIndex(e => e.AgentId).IsUnique();
            entity
                .Property(e => e.PumpsJson)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<PumpSlot>>(v, (JsonSerializerOptions?)null)
                );
        });
    }

    public void SeedDeveloperData()
    {
        InitDeveloperData();
    }

    private void InitDeveloperData()
    {
        if (!Recipes.Any())
        {
            var recipe = new Recipe
            {
                Name = "Mojito",
                RecipeIngredients = new List<RecipeIngredient>
                {
                    new() { Name = "White Rum", Quantity = 50 },
                    new() { Name = "Lime Juice", Quantity = 25 },
                    new() { Name = "Sugar Syrup", Quantity = 15 },
                    new() { Name = "Mint Leaves", Quantity = 10 },
                    new() { Name = "Soda Water", Quantity = 100 },
                },
            };
            Recipes.Add(recipe);
            SaveChanges();
        }

        if (!Ingredients.Any())
        {
            var recipeId = Recipes.FirstOrDefault(r => r.Name == "Mojito")?.Id;
            var recipeIds = new List<int> { recipeId ?? 0 };
            var ingredients = new List<Ingredient>
            {
                new() { Name = "White Rum", UsedInRecipes = recipeIds },
                new() { Name = "Lime Juice", UsedInRecipes = recipeIds },
                new() { Name = "Sugar Syrup", UsedInRecipes = recipeIds },
                new() { Name = "Mint Leaves", UsedInRecipes = recipeIds },
                new() { Name = "Soda Water", UsedInRecipes = recipeIds },
                new() { Name = "Some special ingredients" },
            };
            Ingredients.AddRange(ingredients);
            SaveChanges();
        }

        if (!Agents.Any())
        {
            var agents = new List<Agent>
            {
                new() { Name = "Dispenser 1", AgentId = "dispenser-1" },
            };
            Agents.AddRange(agents);
            SaveChanges();
        }
    }
}
