using checkin.Data;

namespace checkin;

public static class ServiceCollection
{
    public static IServiceCollection AddCheckinApp(this IServiceCollection services)
    {
        services.AddTransient<ICheckinsRepository, CheckinsRepository>();

        return services;
    }
}