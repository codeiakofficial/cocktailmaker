using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record AgentDto(int Id, string Name, string AgentId, bool IsOnline, DateTime? LastSeen)
{
    internal static AgentDto From(Agent agent) =>
        new(agent.Id, agent.Name, agent.AgentId, agent.IsOnline, agent.LastSeen);

    internal Agent ToAgent() =>
        new()
        {
            Id = Id,
            Name = Name,
            AgentId = AgentId,
            IsOnline = IsOnline,
            LastSeen = LastSeen,
        };
}

public class DispenseRequest
{
    public int RecipeId { get; set; }
}
