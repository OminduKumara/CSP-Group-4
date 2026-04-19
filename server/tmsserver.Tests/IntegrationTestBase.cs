using Xunit;
using System.Net.Http;
using tmsserver.Models;
using tmsserver.Data.Repositories;
using Moq;

namespace tmsserver.Tests;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory<Program>>
{
    protected readonly CustomWebApplicationFactory<Program> _factory;
    protected readonly HttpClient _client;

    protected IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }
}
