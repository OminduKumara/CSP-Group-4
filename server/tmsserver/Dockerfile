# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj file from the same folder as the Dockerfile
COPY tmsserver.csproj .
RUN dotnet restore

# Copy everything else in the tmsserver folder and publish
COPY . .
RUN dotnet publish tmsserver.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
# Corrected: Based on your file name 'tmsserver.csproj'
ENTRYPOINT ["dotnet", "tmsserver.dll"]