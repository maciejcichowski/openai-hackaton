using System.ClientModel;
using OpenAI;
using OpenAI.Audio;
using Paragony.Abstract;

namespace Paragony.Services;

public class VoiceProcessingService : IVoiceProcessingService
{
    private readonly AudioClient _client;

    public VoiceProcessingService(IConfiguration configuration)
    {
        var apiKey = configuration["OpenAI:ApiKey"]!;
        _client = new AudioClient("whisper-1", new ApiKeyCredential(apiKey), new OpenAIClientOptions());
    }

    public async Task<string> TranscribeAudio(byte[] audioData)
    {
        // Save audio temporarily
        var tempFile = Path.GetTempFileName() + ".mp3";
        await File.WriteAllBytesAsync(tempFile, audioData);

        try
        {
            // Use OpenAI's audio transcription endpoint
            AudioTranscription transcription = await _client.TranscribeAudioAsync(tempFile);
            return transcription.Text;
        }
        finally
        {
            // Clean up a temp file
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }
}