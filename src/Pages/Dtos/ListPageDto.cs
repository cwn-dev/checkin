namespace checkin.Pages.Dtos;

public sealed record ListPageDto(
    string? Note,
    double Latitude,
    double Longitude,
    string DateTime
);