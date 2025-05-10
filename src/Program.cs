using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseFileServer();

const string SqliteConnectionString = @"Data Source=/data/db.db";

app.MapPost("/checkin", static async (string apiKey, CheckIn checkIn) => 
{
    if(apiKey != Environment.GetEnvironmentVariable("CHECKIN_API_KEY"))
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
    cmd.Parameters.AddWithValue("$timestamp", checkIn.DateTimeUtc);

    await cmd.ExecuteNonQueryAsync();

    return Results.Ok(checkIn);
});

app.MapGet("/checkins", async (string apiKey) =>
{
    if(apiKey != Environment.GetEnvironmentVariable("CHECKIN_API_KEY"))
    {
        return Results.Unauthorized();
    }

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

record CheckIn(double Lat, double Long, string Note, string DateTimeUtc);