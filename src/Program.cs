using System.Text;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

// TODO: Need to set up RazorLight for use with this so we can return whole pages
// and partials without building HTML: https://chatgpt.com/c/6a498d45-1354-83eb-8fda-71d4288d6cf7

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));

builder.Services.AddRazorPages();

var app = builder.Build();

app.UseFileServer();

const string SqliteConnectionString = @"Data Source=/Users/craig/Development/checkin/db.db";

// app.MapGet("/map", static async () =>
// {
//     return Results.Content("""
//         <div id="map" class="map">
//             <button id="add-btn" type="button" hx-get="/add" hx-target="#sidebar" hx-swap="innerHTML">+</button>
//         </div>
//     """, "text/html");
// });

// app.MapGet("/add", static async () =>
// {
//     const string content = """
//         <div class="add-sidebar opening" _="on closeSidebar add .closing then remove .opening then wait for animationend then remove me">
//             <form method="post" id="checkin-form" hx-ext="json-enc" hx-post="/checkin" hx-target=".result" hx-swap="innerHTML">
//                 <textarea id="note" name="note" placeholder="Note" required autofocus></textarea>

//                 <input type="text" id="lat" name="lat" placeholder="Latitude" required>

//                 <input type="text" id="long" name="long" placeholder="Longitude" required>

//                 <input type="datetime-local" step="1" id="datetime" name="datetime" required>

//                 <input id="timezoneInput" name="timezone" list="timezoneList" required />
//                 <datalist id="timezoneList"></datalist>

//                 <input type="text" id="apiKey" name="apikey" placeholder="API Key" required>

//                 <div class="button-row">
//                     <button type="submit" _"on click trigger closeSidebar">Submit</button>
//                     <button type="button" _="on click trigger closeSidebar">Close</button>
//                 </div>
//             </form>

//             <div class="result"></div>
//         </div>
//     """;

//     return Results.Content(content);
// });

// app.MapGet("/list", static async () =>
// {
//     using var connection = new SqliteConnection(SqliteConnectionString);
//     await connection.OpenAsync();

//     string query = "SELECT * FROM `CheckIns`";

//     using var cmd = new SqliteCommand(query, connection);
//     using var reader = await cmd.ExecuteReaderAsync();

//     List<CheckIn> results = [];

//     while (await reader.ReadAsync())
//     {
//         results.Add(new CheckIn(
//             reader.GetDouble(2),
//             reader.GetDouble(3),
//             reader.GetString(1),
//             reader.GetString(4)));
//     } 

//     results = [..results.OrderByDescending(x => x.DateTime)];

//     var sb = new StringBuilder();

//     sb.Append("""
//         <div id="list">
//             <table border="1" cellpadding="8" cellspacing="0">
//                 <thead>
//                     <tr>
//                         <th>Note</th>
//                         <th>Latitude</th>
//                         <th>Longitude</th>
//                         <th>Timestamp</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//     """);

//     foreach (var result in results)
//     {
//         sb.AppendLine($"""
//             <tr>
//                 <td>{result.Note}</td>
//                 <td>{result.Lat}</td>
//                 <td>{result.Long}</td>
//                 <td>{result.DateTime}</td>
//             </tr>
//         """);
//     }

//     sb.AppendLine("""
//                 </tbody>
//             </table>
//         </div>
//     """);

//     return Results.Content(sb.ToString());
// });

app.MapPost("/checkin", static async (
    CheckInPost checkIn,
    IOptions<Settings> settings) =>
{
    if (checkIn.ApiKey != settings.Value.ApiKey)
    {
        return Results.Unauthorized();
    }

    using var connection = new SqliteConnection(SqliteConnectionString);
    await connection.OpenAsync();

    string query = @"
        INSERT INTO CheckIns (Note, Latitude, Longitude, Timestamp)
        VALUES ($note, $latitude, $longitude, $timestamp)
    ";

    using var cmd = new SqliteCommand(query, connection);

    cmd.Parameters.AddWithValue("$note", checkIn.Note);
    cmd.Parameters.AddWithValue("$latitude", checkIn.Lat);
    cmd.Parameters.AddWithValue("$longitude", checkIn.Long);
    cmd.Parameters.AddWithValue("$timestamp", checkIn.DateTime);

    await cmd.ExecuteNonQueryAsync();

    return Results.Ok(checkIn);
});

app.MapGet("/checkins", static async () =>
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

    return Results.Ok(results);
});

app.MapRazorPages();

app.Run();

class Settings
{
    public required string ApiKey { get; set; }
}

record CheckIn(double Lat, double Long, string? Note, string DateTime);
record CheckInPost(string ApiKey, double Lat, double Long, string? Note, string DateTime);