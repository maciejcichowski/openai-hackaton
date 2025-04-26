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

        // Save image to disk
        var imageName = $"{Guid.NewGuid()}.jpg";
        var imagePath = Path.Combine("Uploads", imageName);
        Directory.CreateDirectory("Uploads");
        await File.WriteAllBytesAsync(imagePath, Convert.FromBase64String(base64Image));

        // Store the image file name in the receipt
        receipt.ImagePath = imageName;

        var categories = await context.Categories.ToListAsync();

        foreach (var item in receipt.Items)
        {
            var category = categories.FirstOrDefault(c => c.Name == item.CategoryName);

            if (category == null)
            {
                category = new Category
                {
                    Name = item.CategoryName,
                };
                await context.Categories.AddAsync(category);
                await context.SaveChangesAsync();
            }

            item.CategoryId = category.Id;
        }

        // Save to database
        context.Receipts.Add(receipt);
        await context.SaveChangesAsync();

        return receipt;
    }

    public async Task<List<Receipt>> GetAllReceipts(DateOnly? datefrom, DateOnly? dateTo)
    {
        var query = context.Receipts
            .Include(r => r.Items)
            .ThenInclude(i => i.Category)
            .AsQueryable();

        if (datefrom.HasValue) query = query.Where(r => r.PurchaseDate >= datefrom.Value);

        if (dateTo.HasValue) query = query.Where(r => r.PurchaseDate <= dateTo.Value);

        return await query
            .OrderByDescending(r => r.PurchaseDate)
            .ToListAsync();
    }

    public async Task<Receipt> GetReceiptById(Guid id)
    {
        return await context.Receipts
            .Include(x => x.Items)
            .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(r => r.Id == id) ?? throw new KeyNotFoundException("Receipt not found");
    }

    public async Task<decimal> GetSpendingByCategory(string category, DateOnly? startDate, DateOnly? endDate)
    {
        var query = context.ReceiptItems
            .Where(item => item.Category.Name == category);

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
            .ThenInclude(i => i.Category)
            .Where(r => r.StoreName.Contains(query) ||
                        r.Items.Any(i => i.Name.Contains(query) || i.Category.Name.Contains(query)))
            .ToListAsync();
    }

    public async Task<List<ReceiptItem>> SearchSpendingsByStoreName(string query)
    {
        return await context.ReceiptItems
            .Include(item => item.Receipt)
            .Where(item => item.Receipt.StoreName.ToLower().Contains(query.ToLower()))
            .ToListAsync();
    }

    public async Task<Receipt?> GetLastReceiptContainingKeyword(string query)
    {
        return await context.Receipts
            .Include(r => r.Items)
            .ThenInclude(i => i.Category)
            .Where(r => r.StoreName.Contains(query) ||
                        r.Items.Any(i => i.Name.Contains(query) || i.Category.Name.Contains(query)))
            .OrderByDescending(r => r.PurchaseDate)
            .FirstOrDefaultAsync();
    }
}