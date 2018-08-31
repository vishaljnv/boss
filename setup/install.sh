#!/bin/sh

echo "Installing dependencies.."
sudo apt-get install supervisor
sudo pip install pymongo

echo "Creating Directories..."
mkdir -p /opt/logs
mkdir -p /opt/etc
mkdir -p /opt/logs/supervisor

echo "Creating Supervisor log and PID files"
touch /opt/logs/supervisord.log
touch /opt/logs/supervisor/supervisord.pid

echo "Copying build.."
#cp -r ../../boss /opt/

echo "Updating User permissions.."
chown -R vishal:vishal /opt/*

echo "Copying config file.."
cp ../../boss/config/config.py /opt/etc/

echo "Configuring supervisor.."
python /opt/boss/supervisor/configure_supervisor.py
