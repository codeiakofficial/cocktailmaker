namespace CocktailMaker.Data.Entities;

public class RecipeIngredient
{
    public string Name { get; set; } = string.Empty;
    public double Quantity { get; set; }
    public string Unit { get; set; } = "ml";
}
