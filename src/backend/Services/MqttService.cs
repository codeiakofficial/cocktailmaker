using CocktailMaker.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using MQTTnet;
using MQTTnet.Client;

namespace CocktailMaker.Services;

public class MqttService : IHostedService, IDisposable
{
    private readonly ILogger<MqttService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly AgentEventBroadcaster _broadcaster;
    private IMqttClient? _client;
    private readonly MqttFactory _factory = new();
    private CancellationTokenSource? _cts;

    public MqttService(
        ILogger<MqttService> logger,
        IConfiguration configuration,
        IServiceScopeFactory scopeFactory,
        AgentEventBroadcaster broadcaster)
    {
        _logger = logger;
        _configuration = configuration;
        _scopeFactory = scopeFactory;
        _broadcaster = broadcaster;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        _ = ConnectWithRetryAsync(_cts.Token);
        return Task.CompletedTask;
    }

    private async Task ConnectWithRetryAsync(CancellationToken cancellationToken)
    {
        var host = _configuration["Mqtt:Host"] ?? "localhost";
        const int port = 1883;

        _client = _factory.CreateMqttClient();

        _client.ApplicationMessageReceivedAsync += OnMessageReceivedAsync;

        var options = new MqttClientOptionsBuilder()
            .WithTcpServer(host, port)
            .WithCleanSession()
            .Build();

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                await _client.ConnectAsync(options, cancellationToken);

                var subscribeOptions = _factory.CreateSubscribeOptionsBuilder()
                    .WithTopicFilter("cocktailmaker/agents/+/status")
                    .Build();

                await _client.SubscribeAsync(subscribeOptions, cancellationToken);

                _logger.LogInformation("[MQTT] Connected to broker {Host}:{Port} and subscribed to agent status topics", host, port);
                return;
            }
            catch (OperationCanceledException)
            {
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[MQTT] Could not connect to broker {Host}:{Port} — {Message}. Retrying in 5 seconds...", host, port, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken).ConfigureAwait(false);
            }
        }
    }

    private async Task OnMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payload = e.ApplicationMessage.ConvertPayloadToString();

        // Topic: cocktailmaker/agents/{agentId}/status
        var segments = topic.Split('/');
        if (segments.Length != 4)
            return;

        var agentId = segments[2];
        _logger.LogInformation("[MQTT] agent {AgentId} is {Status}", agentId, payload);

        var isOnline = payload == "online";
        var lastSeen = DateTime.UtcNow;

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CocktailDbContext>();
        var agent = await db.Agents.FirstOrDefaultAsync(a => a.AgentId == agentId);
        if (agent != null)
        {
            agent.IsOnline = isOnline;
            agent.LastSeen = lastSeen;
            await db.SaveChangesAsync();
        }

        await _broadcaster.BroadcastAsync(new AgentStatusEvent(agentId, isOnline, lastSeen));
    }

    public async Task PublishAsync(string topic, string payload)
    {
        if (_client == null || !_client.IsConnected)
            return;

        var message = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payload)
            .Build();
        await _client.PublishAsync(message);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _cts?.Cancel();

        if (_client?.IsConnected == true)
        {
            await _client.DisconnectAsync(cancellationToken: cancellationToken);
        }
    }

    public void Dispose()
    {
        _cts?.Dispose();
        _client?.Dispose();
    }
}
