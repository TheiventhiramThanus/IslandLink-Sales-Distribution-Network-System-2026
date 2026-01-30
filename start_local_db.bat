@echo off
echo Starting MongoDB with data path: %~dp0isdn_system
mongod --dbpath "%~dp0isdn_system" --port 27017
pause
