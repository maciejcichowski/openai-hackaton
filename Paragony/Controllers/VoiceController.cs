using Microsoft.AspNetCore.Mvc;
using Paragony.Abstract;

namespace Paragony.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VoiceController : ControllerBase
{
    private readonly IVoiceProcessingService _voiceService;
    private readonly ISemanticKernelService _semanticService;

    public VoiceController(
        IVoiceProcessingService voiceService,
        ISemanticKernelService semanticService)
    {
        _voiceService = voiceService;
        _semanticService = semanticService;
    }

    [HttpPost("process")]
    public async Task<ActionResult<VoiceResponseDto>> ProcessVoiceQuery([FromBody] VoiceRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Base64Audio))
            return BadRequest("Audio data is required");

        var audioBytes = Convert.FromBase64String(request.Base64Audio);

        // Transcribe audio to text
        var transcription = await _voiceService.TranscribeAudio(audioBytes);

        // Process the question using Semantic Kernel
        var answer = await _semanticService.ProcessQuestion(transcription);

        return Ok(new VoiceResponseDto
        {
            Transcription = transcription,
            Answer = answer
        });
    }

    public class VoiceRequestDto
    {
        public required string Base64Audio { get; set; }
    }

    public class VoiceResponseDto
    {
        public required string Transcription { get; set; }
        public required string Answer { get; set; }
    }
}