namespace CocktailMaker.Data.Entities;

public class Ingredient
{
    public string Name { get; set; } = string.Empty;
    public List<int> UsedInRecipes { get; set; } = new();
}
