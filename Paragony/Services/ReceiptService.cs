using Microsoft.EntityFrameworkCore;
using Paragony.Abstract;
using Paragony.Data;
using Paragony.Models;

namespace Paragony.Services;

public class ReceiptService(AppDbContext context, IOpenAIService openAiService) : IReceiptService
{
    public async Task<Receipt> AddReceiptFromImage(string base64Image)
    {
        // Analyze receipt image using OpenAI
        var receipt = await openAiService.AnalyzeReceiptImage(base64Image);

        // Save image to disk (in a real app, you'd want to use blob storage)
        /*var imageName = $"{Guid.NewGuid()}.jpg";
        var imagePath = Path.Combine("Uploads", imageName);
        Directory.CreateDirectory("Uploads");
        await File.WriteAllBytesAsync(imagePath, Convert.FromBase64String(base64Image));

        receipt.ImagePath = imagePath;*/

        // Save to database
        context.Receipts.Add(receipt);
        await context.SaveChangesAsync();

        return receipt;
    }

    public async Task<List<Receipt>> GetAllReceipts()
    {
        return await context.Receipts
            .Include(r => r.Items)
            .OrderByDescending(r => r.PurchaseDate)
            .ToListAsync();
    }

    public async Task<Receipt> GetReceiptById(Guid id)
    {
        return await context.Receipts
            .Include(x => x.Items)
            .FirstOrDefaultAsync(r => r.Id == id) ?? throw new KeyNotFoundException("Receipt not found");
    }

    public async Task<decimal> GetSpendingByCategory(string category, DateOnly? startDate, DateOnly? endDate)
    {
        var query = context.ReceiptItems
            .Where(item => item.Category == category);

        if (startDate.HasValue)
            query = query.Where(item => item.Receipt.PurchaseDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(item => item.Receipt.PurchaseDate <= endDate.Value);

        return await query.SumAsync(item => item.Price);
    }

    public async Task<decimal> GetSpendingByDate(DateOnly date)
    {
        return await context.Receipts
            .Where(r => r.PurchaseDate == date)
            .SumAsync(r => r.TotalAmount);
    }

    public async Task<List<Receipt>> SearchReceipts(string query)
    {
        return await context.Receipts
            .Include(r => r.Items)
            .Where(r => r.StoreName.Contains(query) ||
                        r.Items.Any(i => i.Name.Contains(query) || i.Category.Contains(query)))
            .ToListAsync();
    }

    public async Task<Receipt?> GetLastReceiptContainingKeyword(string query)
    {
        return await context.Receipts
            .Include(r => r.Items)
            .Where(r => r.StoreName.Contains(query) ||
                        r.Items.Any(i => i.Name.Contains(query) || i.Category.Contains(query)))
            .OrderByDescending(r => r.PurchaseDate)
            .FirstOrDefaultAsync();
    }
}