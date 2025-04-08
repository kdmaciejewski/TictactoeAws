#!/bin/bash
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y docker.io git openssl postgresql

sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "Klonowanie repozytorium..."
cd /home/ubuntu
git clone https://github.com/kdmaciejewski/TictactoeAws.git
cd TictactoeAws
git pull origin vite
cd /home/ubuntu/TictactoeAws

DB_HOST="terraform-20241208182807859100000004.c16ejl6j0lwa.us-east-1.rds.amazonaws.com"
DB_NAME="mydb"
DB_USERNAME="postgres"
DB_PASSWORD="postgres"

echo "Aktualizacja .env dla backendu"
echo "DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME" >server/.env
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME|" server/.env

echo ".env files updated with frontend, backend IPs and RDS endpoint."
BACKEND_IP="54.91.207.245"
echo "BACKEND_IP: $BACKEND_IP"

echo "Generowanie certyfikatów..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /home/ubuntu/TictactoeAws/server/src/certs/key.pem -out /home/ubuntu/TictactoeAws/server/src/certs/cert.crt -subj "/CN=$BACKEND_IP" -addext "subjectAltName=IP:$BACKEND_IP"
echo "SSL Certificates generated"

cd /home/ubuntu/TictactoeAws/server
#sudo docker build --tag 'server-image' .
sudo docker build --no-cache --tag server-image .
sudo docker run -p 3001:3001 --name server-container -e NODE_TLS_REJECT_UNAUTHORIZED=0 server-image