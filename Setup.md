1-Install Python, nodejs, npm, docker
    Check version by run these commands
``` 
python3 --version
node --version
npm --version
docker --version
```

2-Start Flask
```
mkdir backend
python3 -m venv .venv
-> Create a new environment -> Quick create
source .venv/bin/activate

pip install flask flask-cors flask-sqlalchemy flask-migrate "psycopg[binary]" PyJWT bcrypt httpx python-dotenv pytest

pip freeze > requirements.txt
```

3-Setup Docker
create compose.yaml -> add dependencies
create Dockerfile in backend folder
create proxy folder
run docker compose up -d

