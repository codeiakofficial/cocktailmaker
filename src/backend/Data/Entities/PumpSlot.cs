namespace CocktailMaker.Data.Entities;

public class PumpSlot
{
    public int PumpIndex { get; set; }
    public int? IngredientId { get; set; }
    public string? IngredientName { get; set; }
}
