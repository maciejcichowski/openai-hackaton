namespace Paragony.Abstract;

public interface ISemanticKernelService
{
    Task<string> ProcessQuestion(string question);
}