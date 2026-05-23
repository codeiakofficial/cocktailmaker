namespace CocktailMaker.Services;

public interface IMqttService
{
    Task PublishAsync(string topic, string payload, bool retain = false);
}
