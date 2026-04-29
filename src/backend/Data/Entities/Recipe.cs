namespace CocktailMaker.Data.Entities;

public class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
}
