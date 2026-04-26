## Cocktail Maker - .NET React Application

### Project Overview
- **Type**: Full-stack web application
- **Backend**: .NET Core API
- **Frontend**: React with TypeScript
- **Purpose**: Cocktail discovery and recipe management application

### Development Setup

#### Prerequisites
- .NET 10 SDK installed
- Node.js 18+ installed
- npm or yarn package manager

#### Project Structure
```
cocktailmaker
├── src/
│   ├── backend/      # .NET Core API
│   └── frontend/     # React TypeScript app
└── .github/          # GitHub-specific files
```

#### Running the Application
1. **Backend**: `cd src/backend && dotnet run`
2. **Frontend**: `cd src/frontend && npm start`
3. **Both**: Use the VS Code tasks (Ctrl+Shift+B)

### Important Notes
- API runs on port 5000 (development)
- Frontend runs on port 3000 (development)
- Update frontend proxy in package.json if changing API port
- Use `dotnet ef` for database migrations in backend
