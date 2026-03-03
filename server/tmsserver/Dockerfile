# Use SDK to build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy and restore based on the backend folder structure
COPY *.sln .
COPY src/*.csproj ./src/
RUN dotnet restore

# Copy everything else and publish
COPY . .
RUN dotnet publish src/*.csproj -c Release -o /app/publish

# Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "YourBackendApp.dll"]