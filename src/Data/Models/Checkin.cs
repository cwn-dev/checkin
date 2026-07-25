namespace checkin.Data.Models;

public record Checkin(
    int Id,
    double Lat,
    double Long,
    string? Note,
    string DateTime)
{
    public Checkin(double Lat, double Long, string? Note, string DateTime)
        : this(0, Lat, Long, Note, DateTime) { }
};