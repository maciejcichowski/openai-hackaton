using Microsoft.AspNetCore.Mvc;
using Paragony.Abstract;

namespace Paragony.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VoiceController : ControllerBase
{
    private readonly IVoiceTranscriptionService _voiceService;
    private readonly ISemanticKernelService _semanticService;
    private readonly ITextToVoiceService _textToVoiceService;

    public VoiceController(
        IVoiceTranscriptionService voiceService,
        ISemanticKernelService semanticService,
        ITextToVoiceService textToVoiceService)
    {
        _voiceService = voiceService;
        _semanticService = semanticService;
        _textToVoiceService = textToVoiceService;       
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
    
    [HttpPost("transcribe")]
    public async Task<ActionResult<VoiceResponseDto>> Transcribe([FromBody] VoiceRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Base64Audio))
            return BadRequest("Audio data is required");

        var audioBytes = Convert.FromBase64String(request.Base64Audio);

        // Transcribe audio to text
        var transcription = await _voiceService.TranscribeAudio(audioBytes);

        return Ok(new TranscribeResponseDto
        {
            Transcription = transcription
        });
    }
    
    [HttpPost("generate-audio")]
    public async Task<IActionResult> GenerateAudio([FromBody] TextToSpeechRequest request)
    {
        if (string.IsNullOrEmpty(request.Text))
        {
            return BadRequest("Text is required");
        }

        byte[] audioData = await _textToVoiceService.GenerateAudio(request.Text);
        
        return File(audioData, "audio/mpeg", "speech.mp3");
    }

    public class TextToSpeechRequest
    {
        public string Text { get; set; }
    }

    public class VoiceRequestDto
    {
        public required string Base64Audio { get; set; }
    }

    public class TranscribeResponseDto
    {
        public required string Transcription { get; set; }
    }
    
    public class VoiceResponseDto
    {
        public required string Transcription { get; set; }
        public required string Answer { get; set; }
    }
}