using System.ComponentModel.DataAnnotations;

namespace Paragony.Models;

public class Receipt
{
    [Key]
    public Guid Id { get; set; }
    public string StoreName { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string ReceiptNumber { get; set; }
    //public string ImagePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public virtual List<ReceiptItem> Items { get; set; } = new();
}
