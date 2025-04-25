namespace Paragony.Abstract;

public interface ITextToVoiceService
{
    Task<byte[]> GenerateAudio(string text);
}