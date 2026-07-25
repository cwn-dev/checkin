using checkin.Data;
using checkin.Pages.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace checkin.Pages;

public class IndexModel(ICheckinsRepository checkinsRepo) : PageModel
{
    public List<ListPageDto> Checkins { get; private set; } = [];

    public void OnGet() { }

    public IActionResult OnGetMap()
    {
        return Partial("_Map");
    }

    public IActionResult OnGetAdd()
    {
        return Partial("_Add");
    }

    public async Task<IActionResult> OnGetList()
    {
        var checkins = await checkinsRepo.GetCheckins();

        var dto = checkins 
            .OrderBy(x => x.DateTime)
            .Select(x =>
                new ListPageDto(
                    x.Id,
                    x.Note,
                    x.Lat,
                    x.Long,
                    x.DateTime))
            .OrderByDescending(x => x.DateTime)
            .ToList();

        return Partial("_List", dto);
    }
}