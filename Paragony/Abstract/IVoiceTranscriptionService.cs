namespace Paragony.Abstract;

public interface IVoiceTranscriptionService
{
    Task<string> TranscribeAudio(byte[] audioData);
}