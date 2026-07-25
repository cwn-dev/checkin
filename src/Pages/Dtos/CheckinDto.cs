namespace checkin.Pages.Dtos;

public sealed record CheckinDto(
    int Id,
    double Lat,
    double Long,
    string? Note,
    string DateTime
);