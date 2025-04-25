using System.ComponentModel;
using System.Text;
using Microsoft.SemanticKernel;
using Paragony.Abstract;
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

        var prompt = @"
            You are a helpful assistant that helps users get information about their purchase history and receipts.
            Use the ReceiptQueries functions to get the data the user is asking for.
            
            User's question: {{$question}}
            
            Think step by step about what information you need to retrieve to answer the question.
            ";

        var arguments = new KernelArguments
        {
            ["question"] = question
        };

        var result = await _kernel.InvokePromptAsync(prompt, arguments);
        return result.GetValue<string>();
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