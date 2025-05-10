using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/checkin", static async (CheckIn checkIn) => 
{
    if(checkIn.ApiKey != Environment.GetEnvironmentVariable("CHECKIN_API_KEY"))
    {
        return Results.Unauthorized();
    }

    using var connection = new SqliteConnection(@"Data Source=/data/db.db");
    connection.Open();

    var cmd = connection.CreateCommand();

    cmd.CommandText = @"
        INSERT INTO CheckIns (Note, Longitude, Latitude, Timestamp)
        VALUES ($note, $longitude, $latitude, $timestamp)
    ";

    cmd.Parameters.AddWithValue("$note", checkIn.Note);
    cmd.Parameters.AddWithValue("$longitude", checkIn.Long);
    cmd.Parameters.AddWithValue("$latitude", checkIn.Lat);
    cmd.Parameters.AddWithValue("$timestamp", checkIn.DateTimeUtc);

    await cmd.ExecuteNonQueryAsync();

    return Results.Ok(checkIn);
});

app.Run();

record CheckIn(string ApiKey, double Long, double Lat, string Note, string DateTimeUtc);