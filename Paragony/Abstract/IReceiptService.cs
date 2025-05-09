using Paragony.DTOs;
using Paragony.Models;

namespace Paragony.Abstract;

public interface IReceiptService
{
    Task<Receipt> AddReceiptFromImage(string base64Image);
    Task<List<Receipt>> GetAllReceipts(DateOnly? startDate, DateOnly? endDate);
    Task<Receipt> GetReceiptById(Guid id);
    Task<decimal> GetSpendingByCategory(string category, DateOnly? startDate, DateOnly? endDate);
    Task<decimal> GetSpendingByDate(DateOnly date);
    Task<List<Receipt>> SearchReceipts(string query);
    Task<List<ReceiptItem>> SearchSpendingsByStoreName(string query);
    Task<Receipt?> GetLastReceiptContainingKeyword(string query);
    Task<List<CategoryTotalDto>> GetCategoriesWithTotal(DateOnly? datefrom, DateOnly? dateTo);
}