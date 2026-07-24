namespace checkin.Pages.Dtos;

public sealed record ListPageDto(
    int Id,
    string? Note,
    double Latitude,
    double Longitude,
    string DateTime
);