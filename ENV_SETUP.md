# Environment Variables Setup

## Frontend Configuration

### Local Development

1. Copy `.env.example` to `.env.development`:
   ```bash
   cp .env.example .env.development
   ```

2. Update `.env.development` with your local backend URL:
   ```
   VITE_API_URL=http://localhost:5011/api
   ```

### Production (Vercel)

Set the following environment variable in Vercel:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-azure-backend.azurewebsites.net/api`

## Backend Configuration

### Local Development

Update `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=tennis_management;User=root;Password=;"
  }
}
```

### Production (Azure App Service)

Set the following environment variables in Azure Portal (App Service → Configuration → Application settings):

1. **Database Connection**:
   - Name: `DB_CONNECTION_STRING`
   - Value: `Server=your-mysql-host;Port=3306;Database=tennis_management;User=your-db-user;Password=your-db-password;`

2. **JWT Secret**:
   - Name: `JWT_KEY`
   - Value: `your-super-secret-jwt-key-min-32-chars-2024`

3. **Frontend URL** (for CORS):
   - Name: `FRONTEND_URL`
   - Value: `https://your-vercel-app.vercel.app`

## Security Notes

- Never commit `.env.development` or `.env.production` files
- Keep `.env.example` as a template with placeholder values
- Rotate JWT keys regularly in production
- Use strong database passwords
