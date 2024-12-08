#!/bin/bash
# Aktualizacja systemu
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y docker.io git openssl

echo "Klonowanie repozytorium..."
cd /home/ubuntu
git clone https://github.com/kdmaciejewski/TictactoeAws.git
cd TictactoeAws
git pull origin vite
cd /home/ubuntu/TictactoeAws

# Aktualizacja pliku .env
#DB_HOST=$(terraform output -raw db_host)
#DB_NAME=$(terraform output -raw db_name)
#DB_USERNAME=$(terraform output -raw db_username)
#DB_PASSWORD=$(terraform output -raw db_password)

DB_HOST=$(db_host -f)
DB_NAME=$(db_name -f)
DB_USERNAME=$(db_username -f)
DB_PASSWORD=$(db_password -f)

echo "Aktualizacja .env dla backendu"
echo "DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME" >server/.env
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME|" server/.env

echo ".env files updated with frontend, backend IPs and RDS endpoint."

# Get the public IP addresses from Terraform output
#BACKEND_IP=$(terraform output -raw backend_public_ip)
BACKEND_IP=$(backend_public_ip -f)

echo "Generowanie certyfikatów..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /home/ubuntu/TictactoeAws/server/src/certs/key.pem -out /home/ubuntu/TictactoeAws/server/src/certs/cert.crt -subj "/CN=$BACKEND_IP" -addext "subjectAltName=IP:$BACKEND_IP"
echo "SSL Certificates generated"

cd /home/ubuntu/TictactoeAws/server
sudo docker build --tag 'server-image' .
sudo docker run -p 3001:3001 --name server-container -e NODE_TLS_REJECT_UNAUTHORIZED=0 server-image