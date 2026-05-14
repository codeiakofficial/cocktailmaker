using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record AgentDto(int Id, string Name, string AgentId)
{
    internal static AgentDto From(Agent agent) => new(agent.Id, agent.Name, agent.AgentId);

    internal Agent ToAgent() =>
        new()
        {
            Id = Id,
            Name = Name,
            AgentId = AgentId,
        };
}