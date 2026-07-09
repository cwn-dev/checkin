using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace checkin.Pages;

public class IndexModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnGetMap()
    {
        return Partial("_Map");
    }

    public IActionResult OnGetAdd()
    {
        return Partial("_Add");
    }
}