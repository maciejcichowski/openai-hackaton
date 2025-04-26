using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Paragony.Migrations
{
    /// <inheritdoc />
    public partial class RelationCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "ReceiptItems");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "ReceiptItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptItems_CategoryId",
                table: "ReceiptItems",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptItems_Categories_CategoryId",
                table: "ReceiptItems",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptItems_Categories_CategoryId",
                table: "ReceiptItems");

            migrationBuilder.DropIndex(
                name: "IX_ReceiptItems_CategoryId",
                table: "ReceiptItems");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "ReceiptItems");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "ReceiptItems",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
