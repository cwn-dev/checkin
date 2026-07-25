using checkin.Data.Models;

namespace checkin.Data;

public interface ICheckinsRepository
{
    public Task<List<Checkin>> GetCheckins();

    public Task<Checkin> CreateCheckin(Checkin checkin);
}
