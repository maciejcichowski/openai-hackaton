using System.ComponentModel.DataAnnotations;

namespace Paragony.Models;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
}