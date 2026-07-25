FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

RUN apt update; \
    apt install minify

WORKDIR /app

COPY ./src ./

RUN minify -o ./wwwroot/dist/style.css ./wwwroot/dist/style.css; \
    minify -o ./wwwroot/lib/leaflet/leaflet.css ./wwwroot/lib/leaflet/leaflet.css; \
    mkdir ./wwwroot/dist/scripts/minified; \
    minify -r -o ./wwwroot/dist/scripts/minified --match="*.js" -- ./wwwroot/dist/scripts/; \
    mv -f ./wwwroot/dist/scripts/minified/* ./wwwroot/dist/scripts/; \
    rm -r ./wwwroot/dist/scripts/minified

RUN dotnet restore; \
    dotnet publish checkin.csproj --configuration Release --output ./out

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

VOLUME [ "/data" ]
ENTRYPOINT ["dotnet", "checkin.dll"]