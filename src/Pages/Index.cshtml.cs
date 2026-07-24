using checkin.Pages.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.Sqlite;

namespace checkin.Pages;

public class IndexModel(IConfiguration config) : PageModel
{
    public List<ListPageDto> Checkins { get; private set; } = [];

    public void OnGet() { }

    public IActionResult OnGetMap()
    {
        return Partial("_Map");
    }

    public IActionResult OnGetAdd()
    {
        return Partial("_Add");
    }

    public async Task<IActionResult> OnGetList()
    {
        using var connection = new SqliteConnection(
            config.GetConnectionString("Sqlite"));

        await connection.OpenAsync();

        string query = "SELECT * FROM `CheckIns`";

        using var cmd = new SqliteCommand(query, connection);
        using var reader = await cmd.ExecuteReaderAsync();

        List<CheckIn> results = [];

        while (await reader.ReadAsync())
        {
            results.Add(new CheckIn(
                Id: reader.GetInt32(0),
                Lat: reader.GetDouble(2),
                Long: reader.GetDouble(3),
                Note: reader.GetString(1),
                DateTime: reader.GetString(4)));
        }

        var dto = results
            .OrderBy(x => x.DateTime)
            .Select(x =>
                new ListPageDto(
                    x.Id,
                    x.Note,
                    x.Lat,
                    x.Long,
                    x.DateTime))
            .OrderByDescending(x => x.DateTime)
            .ToList();

        return Partial("_List", dto);
    }
}