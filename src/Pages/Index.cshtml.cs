using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class IndexModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnGetMap()
    {
        return Partial("_Map");
    }
}