using Microsoft.EntityFrameworkCore;
using CocktailMaker.Data.Entities;

namespace CocktailMaker.Data.Contexts;
public class CocktailDbContext : DbContext
{
    public CocktailDbContext(DbContextOptions<CocktailDbContext> options) : base(options)
    {
    }

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
}