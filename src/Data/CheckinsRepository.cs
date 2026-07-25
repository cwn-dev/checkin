using checkin.Data.Models;
using Microsoft.Data.Sqlite;

namespace checkin.Data;

public sealed class CheckinsRepository(IConfiguration config) : ICheckinsRepository
{
    public async Task<List<Checkin>> GetCheckins()
    {
        using var connection = new SqliteConnection(
        config.GetConnectionString("Sqlite"));

        await connection.OpenAsync();

        string query = "SELECT * FROM `CheckIns`";

        using var cmd = new SqliteCommand(query, connection);
        using var reader = await cmd.ExecuteReaderAsync();

        List<Checkin> results = [];

        while (await reader.ReadAsync())
        {
            results.Add(new Checkin(
                Id: reader.GetInt32(0),
                Lat: reader.GetDouble(2),
                Long: reader.GetDouble(3),
                Note: reader.GetString(1),
                DateTime: reader.GetString(4)));
        }

        return results;
    }

    public async Task<Checkin> CreateCheckin(Checkin checkin)
    {
        using var connection = new SqliteConnection(
            config.GetConnectionString("Sqlite"));

        await connection.OpenAsync();

        string query = """
            INSERT INTO CheckIns (Note, Latitude, Longitude, Timestamp)
            VALUES ($note, $latitude, $longitude, $timestamp)
            RETURNING Id
        """;

        using var cmd = new SqliteCommand(query, connection);

        cmd.Parameters.AddWithValue("$note", checkin.Note);
        cmd.Parameters.AddWithValue("$latitude", checkin.Lat);
        cmd.Parameters.AddWithValue("$longitude", checkin.Long);
        cmd.Parameters.AddWithValue("$timestamp", checkin.DateTime);

        var newId = await cmd.ExecuteScalarAsync();

        return checkin with { Id = Convert.ToInt32(newId) };
    }
}