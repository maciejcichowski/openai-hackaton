using System.ComponentModel;
using System.Text;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Paragony.Abstract;
using Paragony.Models;
using ChatHistory = Microsoft.SemanticKernel.ChatCompletion.ChatHistory;

// ReSharper disable UnusedMember.Local

namespace Paragony.Services;

public class SemanticKernelService(
    IConfiguration configuration,
    IReceiptService receiptService)
    : ISemanticKernelService
{
    private Kernel? _kernel;

    public void InitializeKernel()
    {
        if (_kernel != null) return;

        var apiKey = configuration["OpenAI:ApiKey"]!;
        var modelId = configuration["OpenAI:CompletionModel"]!;

        var builder = Kernel.CreateBuilder()
            .AddOpenAIChatCompletion(modelId, apiKey);

        _kernel = builder.Build();

        // Register custom functions that can be called by the AI
        _kernel.ImportPluginFromObject(new ReceiptQueries(receiptService), "ReceiptQueries");
    }

    public async Task<string> ProcessQuestion(string question)
    {
        InitializeKernel();

        var prompt = @$"
            You are a helpful assistant that helps users get information about their purchase history and receipts.
            Use the ReceiptQueries functions to get the data the user is asking for.
            If you cannot find the information in the item name, try categories and dates.

            User's question: {question}
            
            Think step by step about what information you need to retrieve to answer the question.
            ";

        var history = new ChatHistory();

        var chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();

        OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new() 
        {
            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
        };

        history.AddUserMessage(prompt);

        var result = await chatCompletionService.GetChatMessageContentAsync(
            history,
            executionSettings: openAIPromptExecutionSettings,
            kernel: _kernel);
        
        return result.Content;
    }

    public async Task<string> ProcessChat(ChatHistoryWithPrompt chatHistoryWithPrompt)
    {
        InitializeKernel();
        
        var history = new ChatHistory();
        foreach (var chat in chatHistoryWithPrompt.ChatHistory)
        {
            if(!string.IsNullOrWhiteSpace(chat.UserMessage))
                history.AddUserMessage(chat.UserMessage);
            
            if(!string.IsNullOrWhiteSpace(chat.BotMessage))
                history.AddAssistantMessage(chat.BotMessage); 
        }
        
        var chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();

        OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new() 
        {
            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
        };
        
        history.AddUserMessage(chatHistoryWithPrompt.Prompt);

        var result = await chatCompletionService.GetChatMessageContentAsync(
            history,
            executionSettings: openAIPromptExecutionSettings,
            kernel: _kernel);
        
        return result.Content;
    }

    // Custom plugin for receipt queries that Semantic Kernel can use
    private class ReceiptQueries
    {
        private readonly IReceiptService _receiptService;

        public ReceiptQueries(IReceiptService receiptService)
        {
            _receiptService = receiptService;
        }

        [KernelFunction]
        [Description("Get spending by category within a date range")]
        public async Task<string> GetSpendingByCategory(
            [Description("The category to filter by")]
            string category,
            [Description("The start date in yyyy-MM-dd format")]
            string? startDate = null,
            [Description("The end date in yyyy-MM-dd format")]
            string? endDate = null)
        {
            DateOnly? start = null;
            DateOnly? end = null;

            if (!string.IsNullOrEmpty(startDate))
                start = DateOnly.Parse(startDate);

            if (!string.IsNullOrEmpty(endDate))
                end = DateOnly.Parse(endDate);

            var amount = await _receiptService.GetSpendingByCategory(category, start, end);
            return $"Spending in category {category}: {amount:C}";
        }

        [KernelFunction]
        [Description("Get spending for a specific date")]
        public async Task<string> GetSpendingByDate(
            [Description("The date in yyyy-MM-dd format")]
            string date)
        {
            var parsedDate = DateOnly.Parse(date);
            var amount = await _receiptService.GetSpendingByDate(parsedDate);
            return $"Spending on {parsedDate.ToShortDateString()}: {amount:C}";
        }
        
        [KernelFunction]
        [Description("Get get most recent recipt containing item by keyword")]
        public async Task<string> GetLastSpendingByKeyword(
            [Description("The keyword to search for")]
            string keyword)
        {
            var receipt = await _receiptService.GetLastReceiptContainingKeyword(keyword);
            
            if(receipt == null)
                return "No receipts found";
            
            var sb = new StringBuilder();
            sb.AppendLine($"Spending on {receipt.PurchaseDate.ToShortDateString()}: {receipt.TotalAmount:C}");
            
            foreach (var receiptItem in receipt.Items)
            {
                sb.AppendLine(
                    $"- Item on the receipt: {receiptItem.Name}  Price: {receiptItem.Price:C}");
            }

            return sb.ToString();
        }

        [KernelFunction]
        [Description("Search receipts by keyword")]
        public async Task<string> SearchReceipts(
            [Description("The keyword to search for")]
            string keyword)
        {
            var receipts = await _receiptService.SearchReceipts(keyword);

            var sb = new StringBuilder();
            sb.AppendLine($"Found {receipts.Count} receipts matching '{keyword}':");

            foreach (var receipt in receipts)
            {
                sb.AppendLine(
                    $"- {receipt.StoreName} on {receipt.PurchaseDate.ToShortDateString()}: {receipt.TotalAmount:C}");
            }

            return sb.ToString();
        }
    }
}