FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

RUN apt update; \
    apt install minify

WORKDIR /app

COPY ./src ./

RUN minify -o ./wwwroot/dist/style.css ./wwwroot/dist/style.css; \
    minify -r -o ./wwwroot/dist/scripts/ --match="*.js" ./wwwroot/dist/scripts/

RUN dotnet restore; \
    dotnet publish checkin.csproj --configuration Release --output ./out

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

VOLUME [ "/data" ]
ENTRYPOINT ["dotnet", "checkin.dll"]