using System.Threading.Channels;

namespace CocktailMaker.Services;

public record AgentStatusEvent(string AgentId, bool IsOnline, DateTime? LastSeen);

public class AgentEventBroadcaster
{
    private readonly List<Channel<AgentStatusEvent>> _channels = new();
    private readonly Lock _lock = new();

    public Channel<AgentStatusEvent> Subscribe()
    {
        var channel = Channel.CreateUnbounded<AgentStatusEvent>();
        lock (_lock)
        {
            _channels.Add(channel);
        }
        return channel;
    }

    public void Unsubscribe(Channel<AgentStatusEvent> channel)
    {
        lock (_lock)
        {
            _channels.Remove(channel);
        }
        channel.Writer.TryComplete();
    }

    public async Task BroadcastAsync(AgentStatusEvent evt)
    {
        List<Channel<AgentStatusEvent>> snapshot;
        lock (_lock)
        {
            snapshot = new List<Channel<AgentStatusEvent>>(_channels);
        }

        foreach (var channel in snapshot)
        {
            await channel.Writer.WriteAsync(evt);
        }
    }
}
