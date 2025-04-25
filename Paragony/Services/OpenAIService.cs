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
                    "Categorize each grocery and shopping items. The available categories are: Jedzenie, Chemia, Elektronika, Ubrania, Dom, Alkohol, Inne."),
                ChatMessageContentPart.CreateImagePart(imageData, "image/jpeg"))
        ];

        var generator = new JSchemaGenerator();
        var schema = """
                     {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/receipt.schema.json",
  "title": "Receipt",
  "type": "object",

  "properties": {
    "StoreName":     { "type": ["string", "null"] },
    "PurchaseDate":  { "type": "string", "null"] },
    "TotalAmount":   { "type": "number" },
    "ReceiptNumber": { "type": ["string", "null"] },
    "CreatedAt":     { "type": "string", "null"] },
    "Items": {
      "type": ["array", "null"],
      "items": { "$ref": "#/definitions/ReceiptItem" }
    }
  },

  "required": [
    "StoreName",
    "PurchaseDate",
    "TotalAmount",
    "ReceiptNumber",
    "CreatedAt",
    "Items"
  ],
  "additionalProperties": false,

  "definitions": {
    "ReceiptItem": {
      "type": "object",
      "title": "Receipt item",
      "properties": {
        "Name":      { "type": ["string", "null"] },
        "Price":     { "type": "number" },
        "Quantity":  { "type": "number" },
        "Category":  { "type": ["string", "null"] }
      },
      "required": [
        "Name",
        "Price",
        "Quantity",
        "Category"
      ],
      "additionalProperties": false
    }
  }
}
""";
            
            //generator.Generate(typeof(Receipt));

        ChatCompletionOptions options = new()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                jsonSchemaFormatName: "json_schema",
                jsonSchema: BinaryData.FromString(schema.ToString()),
                jsonSchemaIsStrict: true
                
                ),
            
            MaxOutputTokenCount = 2000
        };

        ChatCompletion completion = await _client.CompleteChatAsync(messages, options);

        //using var structurizedResponse = JsonDocument.Parse(completion.Content[0].Text);

        //if (structurizedResponse is null) throw new Exception("Invalid response");

        var response = JsonSerializer.Deserialize<Receipt>(completion.Content[0].Text);
        
        return response ?? throw new Exception("Invalid response");
    }
}