using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.ValueGeneration;
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

        modelBuilder.Entity<Receipt>()
            .HasKey(r => r.Id);

        /*modelBuilder.Entity<Receipt>()
            .Property(r => r.Id)
            .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();  */

        // Configure ReceiptItem entity
        modelBuilder.Entity<ReceiptItem>()
            .HasKey(i => i.Id);

        /*modelBuilder.Entity<ReceiptItem>()
            .Property(i => i.Id)
            .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();*/

        // Configure Category entity
        modelBuilder.Entity<Category>()
            .HasKey(c => c.Id);

        /*modelBuilder.Entity<Category>()
            .Property(c => c.Id)
            .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();*/

        modelBuilder.Entity<Receipt>()
            .HasMany(x => x.Items)
            .WithOne(x => x.Receipt)
            .HasForeignKey(x => x.ReceiptId);

        modelBuilder.Entity<ReceiptItem>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId);

        modelBuilder.Entity<ReceiptItem>()
            .Ignore(x => x.CategoryName);

        // Seed categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.Parse("4DF2457F-AF33-4C31-8B70-86DB6BDC35AA"), Name = "Jedzenie", Description = "Artykuły spożywcze" },
            new Category { Id = Guid.Parse("882E9888-F64B-41E9-99BC-2C9F52BC79C3"), Name = "Chemia", Description = "Środki czystości i higieny" },
            new Category { Id = Guid.Parse("D3225F27-B658-4696-B2B8-68C7670E2CD7"), Name = "Elektronika", Description = "Urządzenia elektroniczne" },
            new Category { Id = Guid.Parse("AB5BDD86-8BF1-4ED4-8EE1-9A2B9E6995A9"), Name = "Ubrania", Description = "Odzież i obuwie" },
            new Category { Id = Guid.Parse("27DFB8CE-F64A-442D-B3A8-9A767DD83A0E"), Name = "Dom", Description = "Artykuły domowe" },
            new Category { Id = Guid.Parse("27653B89-3B92-4ACE-87C3-F025DCAB07B3"), Name = "Alkohol", Description = "Alkohol" }    ,
            new Category { Id = Guid.Parse("7223583B-AC12-4DB7-8043-B9D81427FF9E"), Name = "Inne", Description = "Inne" }
        );
    }
}
