using System.ClientModel;
using System.Text.Json;
using Newtonsoft.Json.Schema.Generation;
using OpenAI;
using OpenAI.Chat;
using Paragony.Abstract;
using Paragony.Models;

namespace Paragony.Services;

public class OpenAiService : IOpenAIService
{
    private readonly ChatClient _client;

    public OpenAiService(IConfiguration configuration)
    {
        var apiKey = configuration["OpenAI:ApiKey"]!;
        var visionModel = configuration["OpenAI:VisionModel"]!;
        _client = new ChatClient(visionModel, new ApiKeyCredential(apiKey), new OpenAIClientOptions());
    }

    public async Task<Receipt> AnalyzeReceiptImage(string base64Image)
    {
        var imageData = new BinaryData(Convert.FromBase64String(base64Image));

        List<ChatMessage> messages =
        [
            new UserChatMessage(
                ChatMessageContentPart.CreateTextPart(
                    "You are a helpful assistant specialized in analyzing receipt images. Extract structured data from the receipt including: store name, date, receipt number, total amount, and all items with their quantities and prices. Format the output as JSON."),
                ChatMessageContentPart.CreateTextPart(
                    "Analyze this receipt image and extract all the information in JSON format"),
                ChatMessageContentPart.CreateTextPart(
                    "Categorize each grocery and shopping items. The available categories are: Jedzenie, Chemia, Elektronika, Ubrania, Dom."),
                ChatMessageContentPart.CreateImagePart(imageData, "image/jpeg"))
        ];

        var generator = new JSchemaGenerator();
        var schema = generator.Generate(typeof(Receipt));

        ChatCompletionOptions options = new()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                jsonSchemaFormatName: "ReceiptData",
                jsonSchema: BinaryData.FromString(schema.ToString()),
                jsonSchemaIsStrict: true),
            MaxOutputTokenCount = 2000
        };

        ChatCompletion completion = await _client.CompleteChatAsync(messages, options);

        using var structurizedResponse = JsonDocument.Parse(completion.Content[0].Text);

        if (structurizedResponse is null) throw new Exception("Invalid response");

        var response = structurizedResponse.Deserialize<Receipt>();
        
        return response ?? throw new Exception("Invalid response");
    }
}