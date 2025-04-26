FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the .csproj file and restore dependencies
COPY ["Paragony.csproj", "./"]
RUN dotnet restore "Paragony.csproj"

# Copy the entire source code
COPY . .

# Build the application
RUN dotnet build "Paragony.csproj" -c Release -o /app/build

FROM build AS publish
# Publish the application
RUN dotnet publish "Paragony.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app

# Copy the published output to the final image
COPY --from=publish /app/publish .

# Set the entry point for the application
ENTRYPOINT ["dotnet", "Paragony.dll"]
