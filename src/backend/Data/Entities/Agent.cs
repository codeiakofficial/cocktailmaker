namespace CocktailMaker.Data.Entities;

public class Agent
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AgentId { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public DateTime? LastSeen { get; set; }
}
