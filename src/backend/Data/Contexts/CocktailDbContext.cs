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
            entity.HasKey(e => e.Name);
        });
    }
}
