using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));

var app = builder.Build();

app.UseFileServer();

const string SqliteConnectionString = @"Data Source=/data/db.db";

app.MapPost("/checkin", static async (
    [FromQuery] string apiKey,
    CheckInPost checkIn,
    IOptions<Settings> settings) => 
{
    if(apiKey != settings.Value.ApiKey)
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

    while(await reader.ReadAsync())
    {
        results.Add(new CheckIn(
            reader.GetDouble(2),
            reader.GetDouble(3),
            reader.GetString(1),
            reader.GetString(4)));
    }

    return Results.Ok(results);
});

app.Run();

class Settings
{
    public required string ApiKey { get; set; }
}
record CheckIn(double Lat, double Long, string? Note, string DateTime);
record CheckInPost(double Lat, double Long, string? Note, string? TimeZone, string DateTime);