using Microsoft.AspNetCore.Mvc;
using Paragony.Abstract;
using Paragony.Models;

namespace Paragony.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController(ISemanticKernelService semanticService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<string>> ProcessVoiceQuery([FromBody] ChatHistoryWithPrompt request)
    {
        var response = await semanticService.ProcessChat(request);

        return Ok(response);
    }
}