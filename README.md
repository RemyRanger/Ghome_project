# Ghome_project
Server implementation of a Google Home/Dialogflow logic with a websocket connection to Diasuite

1. Requirements
2. Install & Run
3. Setup & Config
5. FAQ

## Requirements
### Environnement
* NPM & git
```bash
sudo apt install npm git -y
```
* Node >8
```bash
sudo npm i -g n
sudo n 8
```

* Google Account
cf FAQ : Client Secret Config

## Install & Run
```bash
git clone https://github.com/RemyRanger/Ghome_project.git
npm i
sudo npm start
```
## Setup & Config
Change the client secret
Setup an SSL enabled server to connect to Google Home

## FAQ

### Sockets
https://github.com/websockets/ws#installing

#### Client Secret Config
[Pour modifier client_secret.json](https://developers.google.com/gmail/api/auth/web-server)
