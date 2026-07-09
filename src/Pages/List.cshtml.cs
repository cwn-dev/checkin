using checkin.Pages.Dtos;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.Sqlite;

namespace checkin.Pages;

public class ListModel : PageModel
{
    public List<ListPageDto> Checkins { get; private set; } = [];

    const string SqliteConnectionString = @"Data Source=/Users/craig/Development/checkin/db.db";

    public async Task OnGet()
    {
        using var connection = new SqliteConnection(SqliteConnectionString);
        await connection.OpenAsync();

        string query = "SELECT * FROM `CheckIns`";

        using var cmd = new SqliteCommand(query, connection);
        using var reader = await cmd.ExecuteReaderAsync();

        List<CheckIn> results = [];

        while (await reader.ReadAsync())
        {
            results.Add(new CheckIn(
                reader.GetDouble(2),
                reader.GetDouble(3),
                reader.GetString(1),
                reader.GetString(4)));
        }
        
        var dto = results.ConvertAll(x =>
            new ListPageDto(
                x.Note,
                x.Lat,
                x.Long,
                x.DateTime));

        Checkins = dto;
    }
}