using Paragony.Models;

namespace Paragony.Abstract;

public interface IOpenAIService
{
    Task<Receipt> AnalyzeReceiptImage(string base64Image);
}