using System.ClientModel;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Schema.Generation;
using OpenAI;
using OpenAI.Chat;
using Paragony.Abstract;
using Paragony.Data;
using Paragony.Models;

namespace Paragony.Services;

public class OpenAiService : IOpenAIService
{
    private readonly AppDbContext _context;
    private readonly ChatClient _client;

    public OpenAiService(IConfiguration configuration,
        AppDbContext context)
    {
        _context = context;
        var apiKey = configuration["OpenAI:ApiKey"]!;
        var visionModel = configuration["OpenAI:VisionModel"]!;
        _client = new ChatClient(visionModel, new ApiKeyCredential(apiKey), new OpenAIClientOptions());
    }

    public async Task<Receipt> AnalyzeReceiptImage(string base64Image)
    {
        var imageData = new BinaryData(Convert.FromBase64String(base64Image));
        var categories = await _context.Categories.ToListAsync();
        var categoryNames = categories.Select(c => c.Name).ToList();
        var categoryNamesString = string.Join(", ", categoryNames);

        List<ChatMessage> messages =
        [
            new UserChatMessage(
                ChatMessageContentPart.CreateTextPart(
                    "You are a helpful assistant specialized in analyzing receipt images. Extract structured data from the receipt including: store name, date, receipt number, total amount, and all items with their quantities and prices. Format the output as JSON. Parse purchase date only as a Date without time, if you can't find the date make your best guess."),
                ChatMessageContentPart.CreateTextPart(
                    "Analyze this receipt image and extract all the information in JSON format"),
                ChatMessageContentPart.CreateTextPart(
                    "When providing item prices, ensure to calculate and include any applicable discounts."),
                ChatMessageContentPart.CreateTextPart(
                    "Always save price as total price for all items."),
                ChatMessageContentPart.CreateTextPart(
                    $"Categorize each grocery and shopping items. The available categories are: {categoryNamesString}."),
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
    "PurchaseDate":  { "type": "string" },
    "TotalAmount":   { "type": "number" },
    "ReceiptNumber": { "type": ["string", "null"] },
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
        "CategoryName":  { "type": ["string", "null"] }
      },
      "required": [
        "Name",
        "Price",
        "Quantity",
        "CategoryName"
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
