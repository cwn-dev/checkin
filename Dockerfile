FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /app

COPY ./src ./

RUN dotnet restore; \
    dotnet publish checkin.csproj --configuration Release --output ./out

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

VOLUME [ "/data" ]
ENTRYPOINT ["dotnet", "checkin.dll"]