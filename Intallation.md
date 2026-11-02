## postgreSQL install

- Promt “postgresql getting started mac” on Google AI mode
1. Install via Homebrew (Command Line)
2.  Open your Terminal application and install PostgreSQL by running the Homebrew package manager command: 
```
brew install postgresql.
```

3. Start the background service so the database server runs automatically:
```
brew services start postgresql
```

4. Verify that the server is active and accepting connections with pg_isready.
```   
    If OK -> /tmp:5432 - accepting connections
    Access the interactive SQL terminal shell as the default superuser using psql -U postgres.
    If there is error “psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL: role "postgres" does not exist”
    Then need to create by “psql postgres
    Quit the interactive shell when finished by typing \q
```

## Docker install
1. Step 1: Download Docker Desktop
Visit the Docker Desktop for Mac download page
Download the appropriate version for your Mac (Intel or Apple Silicon)

2. Step 2: Install Docker Desktop
Open the downloaded .dmg file
Drag the Docker icon to your Applications folder
Double-click Docker.app in Applications to start Docker

3. Step 3: Complete Setup
Accept the terms and conditions
Enter your system password when prompted (Docker needs privileged access)
Wait for Docker to start (the whale icon in the menu bar will stop animating)

4. Step 4: Verify Installation
Open Terminal and run:
```
docker --version
docker run hello-world
```
