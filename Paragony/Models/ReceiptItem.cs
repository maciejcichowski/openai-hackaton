using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Paragony.Models;

public class ReceiptItem
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Quantity { get; set; }
    public string Category { get; set; }
        
    public int ReceiptId { get; set; }
    [ForeignKey("ReceiptId")]
    public Receipt Receipt { get; set; }
}
