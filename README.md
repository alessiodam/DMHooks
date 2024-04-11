# DMHooks

DMHooks is a way to send webhooks to your DMs, no more need to create a server for webhook logging!  
It's in other terms a webhook -> DM proxy

> All the data is stored in sqlite (database.sqlite3), if you delete that file, all data is lost.

## Installation

Normal:

1. clone the repo
2. install dependencies with `npm install`
3. rename .env.sample to .env
4. edit .env and put the credentials obtained from a fresh new user app from https://discord.com/developers
5. run `npm run register` to register the slash commands
6. run `npm start` to start the bot

Docker:

1. clone this repository
2. edit .env and put the credentials obtained from a fresh new user app from https://discord.com/developers
3. run `docker-compose up -d`

## Warning

I have almost no knowledge about JS, plz don't blame me for bad code.
