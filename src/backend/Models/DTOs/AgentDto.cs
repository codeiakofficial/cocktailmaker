using CocktailMaker.Data.Entities;

namespace CocktailMaker.Models.DTOs;

public record AgentDto(int id, string Name, string Address)
{
    internal static AgentDto From(Agent agent) => new(agent.Id, agent.Name, agent.Address);

    internal Agent ToAgent() =>
        new()
        {
            Id = id,
            Name = Name,
            Address = Address,
        };
}