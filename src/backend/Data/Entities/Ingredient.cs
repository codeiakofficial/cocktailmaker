namespace CocktailMaker.Data.Entities;
public class Ingredient
{
    public string Name { get; set; }
    public double Quantity { get; set; }
    public string Unit { get; set; } = "ml";
    public List<int> UsedInRecipes { get; set; } = new();
}