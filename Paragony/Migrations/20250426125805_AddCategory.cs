using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Paragony.Migrations
{
    /// <inheritdoc />
    public partial class AddCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[] { new Guid("e9ec3a1a-3373-4baf-a34c-546249dd69b5"), "Leki", "Leki" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e9ec3a1a-3373-4baf-a34c-546249dd69b5"));
        }
    }
}
