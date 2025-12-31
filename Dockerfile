# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY backend/MyFuture.Api/MyFuture.Api.csproj ./backend/MyFuture.Api/
RUN dotnet restore ./backend/MyFuture.Api/MyFuture.Api.csproj

# Copy everything else and build
COPY backend/MyFuture.Api/ ./backend/MyFuture.Api/
WORKDIR /src/backend/MyFuture.Api
RUN dotnet publish -c Release -o /app/publish

# Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published backend
COPY --from=build /app/publish .

# Copy frontend build to wwwroot
COPY --from=frontend-build /frontend/dist ./wwwroot

# Set environment variables
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port (Render uses 10000 by default)
EXPOSE 10000

# Start the application
ENTRYPOINT ["dotnet", "MyFuture.Api.dll"]

