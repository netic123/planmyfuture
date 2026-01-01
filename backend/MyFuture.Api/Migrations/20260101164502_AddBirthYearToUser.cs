using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyFuture.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBirthYearToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BirthYear",
                table: "Users",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthYear",
                table: "Users");
        }
    }
}
