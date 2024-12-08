#!/bin/bash
# Aktualizacja systemu
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y docker.io git openssl

echo "Klonowanie Tictactoe repozytorium..."
cd /home/ubuntu
git clone https://github.com/kdmaciejewski/TictactoeAws.git
cd TictactoeAws
git pull origin vite
cd /home/ubuntu/TictactoeAws

# Aktualizacja pliku .env
# Get the public IP addresses from Terraform output
#FRONTEND_IP=$(terraform output -raw frontend_public_ip)
#BACKEND_IP=$(terraform output -raw backend_public_ip)

FRONTEND_IP=$(frontend_public_ip -f)
BACKEND_IP=$(backend_public_ip -f)

# Update .env file in the frontend folder
echo "Aktualizacja .env dla frontendu"
echo "FRONTEND_IP: $FRONTEND_IP"
echo "BACKEND_IP: $BACKEND_IP"
sed -i "s|VITE_APP_PUBLIC_DNS=.*|VITE_APP_PUBLIC_DNS=https://$FRONTEND_IP:3000|" client/.env
sed -i "s|VITE_APP_SERVER=https://$BACKEND_IP:3001|" client/.env

echo "Generowanie certyfikatów..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /home/ubuntu/TictactoeAws/client/key.pem -out /home/ubuntu/TictactoeAws/client/cert.crt -subj "/CN=$FRONTEND_IP" -addext "subjectAltName=IP:$FRONTEND_IP"
echo "SSL Certificates generated"

cd /home/ubuntu/TictactoeAws/client
sudo docker build --tag 'client-image' .
sudo docker run -p 3000:3000 --name client-container client-image