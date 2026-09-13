#!/bin/bash
DOMAINNAME=takai.rd.tuni.fi
DEBIAN_FRONTEND=noninteractive

apt update
./install-docker.sh
apt install nginx certbot git
systemctl stop apache2
apt remove apache2 -y

## Let's configure nginx from a template
sed 's/{{DOMAINNAME}}/'$DOMAINNAME'/g' templates/nginx > /etc/nginx/sites-enabled/takaiwebsite

## Now we are going to request for the certificate
systemctl stop nginx
certbot certonly --standalone -d $DOMAINNAME --agree-tos -n
systemctl start nginx

## Create auto-deploy user
useradd -u 1223 -m -d /home/auto-deploy auto-deploy

## Generate keys for the deployment
rm -rf keys/ 2> /dev/null
mkdir keys/
ssh-keygen -t rsa -b 8192 -f keys/auto-deploy -C auto-deploy -N ""
mkdir -p /home/auto-deploy/.ssh
cat keys/auto-deploy.pub >> /home/auto-deploy/.ssh/authorized_keys
