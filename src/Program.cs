using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));

builder.Services.AddRazorPages();

var app = builder.Build();

app.UseFileServer();

app.MapPost("/checkin", static async (
    CheckInPost checkIn,
    IOptions<Settings> settings,
    IConfiguration config) =>
{
    if (checkIn.ApiKey != settings.Value.ApiKey)
    {
        return Results.Unauthorized();
    }

    using var connection = new SqliteConnection(
        config.GetConnectionString("Sqlite"));

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

app.MapGet("/checkins", static async (IConfiguration config) =>
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

    return Results.Ok(results);
});

app.MapRazorPages();
app.Run();

class Settings
{
    public required string ApiKey { get; set; }
}

record CheckIn(int Id, double Lat, double Long, string? Note, string DateTime);
record CheckInPost(string ApiKey, double Lat, double Long, string? Note, string DateTime);