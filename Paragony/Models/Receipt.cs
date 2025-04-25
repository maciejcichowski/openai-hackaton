using System.ComponentModel.DataAnnotations;

namespace Paragony.Models;

public class Receipt
{
    [Key]
    public int Id { get; set; }
    public string StoreName { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string ReceiptNumber { get; set; }
    //public string ImagePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public List<ReceiptItem> Items { get; set; } = new();
}
