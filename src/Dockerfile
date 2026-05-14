# https://hub.docker.com/_/microsoft-dotnet

# frontend build stage
FROM node:22-alpine AS frontend-build
WORKDIR /source/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/. ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# copy everything and build app
COPY backend/. ./backend/
WORKDIR /source/backend/
RUN dotnet restore
RUN dotnet publish -c release -o /app --no-restore

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
COPY --from=frontend-build /source/frontend/dist ./wwwroot
EXPOSE 8080
ENTRYPOINT ["dotnet", "CocktailMaker.dll"]