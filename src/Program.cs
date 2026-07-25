using checkin;
using checkin.Data;
using checkin.Data.Models;
using checkin.Options;
using checkin.Pages.Dtos;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));

builder.Services.AddRazorPages();

// App services
builder.Services.AddCheckinApp();

var app = builder.Build();
app.UseFileServer();

app.MapPost("/checkin", static async (
    CheckinPostDto checkin,
    IOptions<Settings> settings,
    IConfiguration config,
    ICheckinsRepository checkinsRepo) =>
{
    if (checkin.ApiKey != settings.Value.ApiKey)
    {
        return Results.Unauthorized();
    }

    var newCheckin = await checkinsRepo.CreateCheckin(new Checkin(
        checkin.Lat,
        checkin.Long,
        checkin.Note,
        checkin.DateTime
    ));

    var dto = new CheckinDto(
        newCheckin.Id,
        newCheckin.Lat,
        newCheckin.Long,
        newCheckin.Note,
        newCheckin.DateTime
    );

    return Results.Ok(dto);
});

app.MapGet("/checkins", static async (
    IConfiguration config,
    ICheckinsRepository checkinsRepo) =>
{
    var results = await checkinsRepo.GetCheckins();

    var dto = results.ConvertAll(x => new CheckinDto(
        x.Id,
        x.Lat,
        x.Long,
        x.Note,
        x.DateTime
    ));

    return Results.Ok(dto);
});

app.MapRazorPages();
app.Run();