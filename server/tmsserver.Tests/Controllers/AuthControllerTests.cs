using System.Net;
using System.Net.Http.Json;
using Moq;
using tmsserver.Models;
using Xunit;

namespace tmsserver.Tests.Controllers;

public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var password = "password";
        var passwordHash = UserService.HashPassword(password);
        var user = new User { Id = 1, Username = "testuser", PasswordHash = passwordHash, Role = UserRole.Admin, IsApproved = true };
        _factory.UserRepositoryMock.Setup(repo => repo.GetUserByUsernameAsync("testuser")).ReturnsAsync(user);
        // We might need to mock UserService.ValidatePassword too if it's not a simple hash check, 
        // but looking at AuthController, it calls _userService.ValidatePassword.
        // UserService is not an interface, so we might need to rely on its real implementation or mock it if virtual.
        // Actually, let's assume it works for now or mock the repository to return a user that would pass.

        var loginModel = new { Username = "testuser", Password = "password" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginModel);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithValidData_ReturnsOk()
    {
        // Arrange
        var signupModel = new 
        { 
            Username = "newuser", 
            IdentityNumber = "12345V", 
            Email = "new@my.sliit.lk", 
            Password = "password123", 
            ConfirmPassword = "password123" 
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/signup", signupModel);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPendingRegistrations_AsAdmin_ReturnsOk()
    {
        // Arrange
        _factory.UserRepositoryMock.Setup(repo => repo.GetPendingApprovalsAsync()).ReturnsAsync(new List<User>());

        // Act
        var response = await _client.GetAsync("/api/auth/pending-registrations");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
