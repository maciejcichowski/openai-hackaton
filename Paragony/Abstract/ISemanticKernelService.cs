using Paragony.Models;

namespace Paragony.Abstract;

public interface ISemanticKernelService
{
    Task<string> ProcessQuestion(string question);
    Task<string> ProcessChat(ChatHistoryWithPrompt chatHistoryWithPrompt);
}