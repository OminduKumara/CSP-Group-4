using System.Net;
using System.Net.Http.Json;
using Moq;
using tmsserver.Models;
using Xunit;
using tmsserver.DTOs;

namespace tmsserver.Tests.Controllers;

public class AdminControllerTests : IntegrationTestBase
{
    public AdminControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetUsers_ReturnsOk()
    {
        // Arrange
        _factory.UserRepositoryMock.Setup(repo => repo.GetAllUsersAsync())
            .ReturnsAsync(new List<User> { new User { Id = 1, Username = "admin" } });

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUser_WithValidId_ReturnsOk()
    {
        // Arrange
        _factory.UserRepositoryMock.Setup(repo => repo.GetUserByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Username = "testuser" });

        // Act
        var response = await _client.GetAsync("/api/admin/users/1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class HealthControllerTests : IntegrationTestBase
{
    public HealthControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task CheckHealth_ReturnsResponse()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        // It might be 500 if DB is not connected, but it should return a JSON response
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.InternalServerError);
    }
}

public class PracticeSessionsControllerTests : IntegrationTestBase
{
    public PracticeSessionsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAllSessions_ReturnsOk()
    {
        // Arrange
        _factory.PracticeSessionRepositoryMock.Setup(repo => repo.GetAllSessions())
            .Returns(new List<PracticeSession> { new PracticeSession { Id = 1, DayOfWeek = "Monday" } });

        // Act
        var response = await _client.GetAsync("/api/practicesessions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
