namespace Paragony.Abstract;

public interface IVoiceProcessingService
{
    Task<string> TranscribeAudio(byte[] audioData);
}