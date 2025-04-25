using OpenAI.Audio;
using Paragony.Abstract;

namespace Paragony.Services;

public class TextToVoiceService : ITextToVoiceService
{
    AudioClient _client;
    
    public TextToVoiceService(IConfiguration configuration)
    {
        var apiKey = configuration["OpenAI:ApiKey"]!;
         _client = new("tts-1", apiKey);
    }

    public async Task<byte[]> GenerateAudio(string text)
    {
        var tempFile = Path.GetTempFileName() + ".mp3";

        try
        {
            BinaryData speech = await _client.GenerateSpeechAsync(text, GeneratedSpeechVoice.Ash,
                new SpeechGenerationOptions()
                {
                    ResponseFormat = GeneratedSpeechFormat.Mp3,
                    SpeedRatio = 1f
                });


            await using FileStream stream = File.OpenWrite(tempFile);
            await speech.ToStream().CopyToAsync(stream);

            return speech.ToArray();
        }
        finally
        {
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }
}