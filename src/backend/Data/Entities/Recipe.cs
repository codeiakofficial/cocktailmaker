namespace CocktailMaker.Data.Entities;
public class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
}