using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanArchitectureApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: "01JEYQZ0Z0Z0Z0Z0Z0Z0Z0ZZZ1",
                column: "Description",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tenants");
        }
    }
}
