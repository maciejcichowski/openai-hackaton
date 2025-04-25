using Paragony.Models;

namespace Paragony.Abstract;

public interface IReceiptService
{
    Task<Receipt> AddReceiptFromImage(string base64Image);
    Task<List<Receipt>> GetAllReceipts();
    Task<Receipt> GetReceiptById(Guid id);
    Task<decimal> GetSpendingByCategory(string category, DateOnly? startDate, DateOnly? endDate);
    Task<decimal> GetSpendingByDate(DateOnly date);
    Task<List<Receipt>> SearchReceipts(string query);
    Task<Receipt?> GetLastReceiptContainingKeyword(string query);
}