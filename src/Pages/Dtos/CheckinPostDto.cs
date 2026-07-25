namespace checkin.Pages.Dtos;

public sealed record CheckinPostDto(
    string ApiKey,
    double Lat,
    double Long,
    string? Note,
    string DateTime
);