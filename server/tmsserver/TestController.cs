using Microsoft.AspNetCore.Mvc;

namespace tmsserver.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Test controller is working!", timestamp = DateTime.UtcNow });
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { status = "pong", message = "API is responding" });
    }

    [HttpPost("echo")]
    public IActionResult Echo([FromBody] object data)
    {
        return Ok(new { received = data, timestamp = DateTime.UtcNow });
    }
}
