# STAGE 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file from the current directory (server/tmsserver)
COPY tmsserver.csproj .
RUN dotnet restore

# Copy everything else in the server/tmsserver folder
COPY . .
RUN dotnet publish tmsserver.csproj -c Release -o /app/publish

# STAGE 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
# Matches the name of your compiled output
ENTRYPOINT ["dotnet", "tmsserver.dll"]