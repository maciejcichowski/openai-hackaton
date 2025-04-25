using Microsoft.EntityFrameworkCore;
using Paragony.Models;

namespace Paragony.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Receipt> Receipts { get; set; }
    public DbSet<ReceiptItem> ReceiptItems { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Jedzenie", Description = "Artykuły spożywcze" },
            new Category { Id = 2, Name = "Chemia", Description = "Środki czystości i higieny" },
            new Category { Id = 3, Name = "Elektronika", Description = "Urządzenia elektroniczne" },
            new Category { Id = 4, Name = "Ubrania", Description = "Odzież i obuwie" },
            new Category { Id = 5, Name = "Dom", Description = "Artykuły domowe" }
        );
    }
}
