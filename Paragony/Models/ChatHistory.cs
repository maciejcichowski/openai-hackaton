namespace Paragony.Models;

public class ChatHistoryWithPrompt
{
    public IEnumerable<Models.ChatHistory> ChatHistory { get; set; }
    public string Prompt { get; set; }
}

public class ChatHistory
{
    public string UserMessage { get; set; }
    public string BotMessage { get; set; }
}