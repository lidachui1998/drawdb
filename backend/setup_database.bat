@echo off
echo "Running database setup script..."
echo.

echo "1/4: Creating users table..."
npx wrangler d1 execute drawdb --remote --command "CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
if %errorlevel% neq 0 (
    echo "Error creating users table."
    goto :eof
)
echo "Success."
echo.

echo "2/4: Creating diagrams table..."
npx wrangler d1 execute drawdb --remote --command "CREATE TABLE diagrams (id TEXT PRIMARY KEY, name TEXT NOT NULL, content TEXT, owner_id TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (owner_id) REFERENCES users(id))"
if %errorlevel% neq 0 (
    echo "Error creating diagrams table."
    goto :eof
)
echo "Success."
echo.

echo "3/4: Creating diagram_collaborators table..."
npx wrangler d1 execute drawdb --remote --command "CREATE TABLE diagram_collaborators (diagram_id TEXT NOT NULL, user_id TEXT NOT NULL, PRIMARY KEY (diagram_id, user_id), FOREIGN KEY (diagram_id) REFERENCES diagrams(id), FOREIGN KEY (user_id) REFERENCES users(id))"
if %errorlevel% neq 0 (
    echo "Error creating diagram_collaborators table."
    goto :eof
)
echo "Success."
echo.

echo "4/4: Creating auth_codes table..."
npx wrangler d1 execute drawdb --remote --command "CREATE TABLE auth_codes (email TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at TIMESTAMP NOT NULL)"
if %errorlevel% neq 0 (
    echo "Error creating auth_codes table."
    goto :eof
)
echo "Success."
echo.

echo "Database setup script finished successfully."
pause
