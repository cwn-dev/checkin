FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:fe3c1ed472bb0964c100f06aa9b1759f5ed84e0dfe6904d60f6a82159d3c7ae4 AS build

ENV CHECKIN_API_KEY=

WORKDIR /app

COPY ./src ./

RUN dotnet restore; \
    dotnet publish -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:96db63a87bb638bf3189a1763f0361f52a7793bca2a8056d2f4f2ac91915bccf

WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

VOLUME [ "/data" ]
ENTRYPOINT ["dotnet", "checkin.dll"]