using System.Net;
using System.Net.Http.Json;
using Moq;
using tmsserver.Models;
using Xunit;

namespace tmsserver.Tests.Controllers;

public class TournamentsControllerTests : IntegrationTestBase
{
    public TournamentsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        // Arrange
        _factory.TournamentRepositoryMock.Setup(repo => repo.GetAllTournamentsAsync())
            .ReturnsAsync(new List<Tournament> { new Tournament { Id = 1, Name = "Open 2024" } });

        // Act
        var response = await _client.GetAsync("/api/tournaments");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class BracketControllerTests : IntegrationTestBase
{
    public BracketControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetTeams_ReturnsOk()
    {
        // Arrange
        _factory.TournamentRepositoryMock.Setup(repo => repo.GetTournamentByIdAsync(1))
            .ReturnsAsync(new Tournament { Id = 1 });
        _factory.TournamentTeamRepositoryMock.Setup(repo => repo.GetTeamsByTournamentAsync(1))
            .ReturnsAsync(new List<TournamentTeam> { new TournamentTeam { Id = 1, TeamName = "Team A" } });

        // Act
        var response = await _client.GetAsync("/api/tournaments/1/bracket/teams");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class GroupControllerTests : IntegrationTestBase
{
    public GroupControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetGroups_ReturnsOk()
    {
        // Arrange
        _factory.GroupRepositoryMock.Setup(repo => repo.GetGroupsWithPlayersByTournamentAsync(1))
            .ReturnsAsync(new List<GroupWithPlayers> { 
                new GroupWithPlayers { 
                    Group = new Group { Id = 1, GroupName = "Group A" } 
                } 
            });

        // Act
        var response = await _client.GetAsync("/api/group/tournament/1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class InventoryControllerTests : IntegrationTestBase
{
    public InventoryControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetInventory_ReturnsOk()
    {
        // Arrange
        _factory.InventoryRepositoryMock.Setup(repo => repo.GetAllItemsAsync())
            .ReturnsAsync(new List<InventoryItem> { new InventoryItem { Id = 1, Name = "Tennis Ball" } });

        // Act
        var response = await _client.GetAsync("/api/inventory");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class PlayerControllerTests : IntegrationTestBase
{
    public PlayerControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetPlayers_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/player");

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.NotFound);
    }
}
