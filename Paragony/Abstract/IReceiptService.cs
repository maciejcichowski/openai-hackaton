using Paragony.Models;

namespace Paragony.Abstract;

public interface IReceiptService
{
    Task<Receipt> AddReceiptFromImage(string base64Image);
    Task<List<Receipt>> GetAllReceipts();
    Task<Receipt> GetReceiptById(int id);
    Task<decimal> GetSpendingByCategory(string category, DateTime? startDate, DateTime? endDate);
    Task<decimal> GetSpendingByDate(DateTime date);
    Task<List<Receipt>> SearchReceipts(string query);
}