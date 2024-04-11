import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import axios from 'axios';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  const url = 'https://discord.com/api/v10/' + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function sendDM(userId, data) {
  try {
    const response = await axios.post(
      'https://discord.com/api/users/@me/channels',
      { recipient_id: userId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      }
    );
    const channelId = response.data.id;
    
    await axios.post(
      `https://discord.com/api/channels/${channelId}/messages`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.error('Error sending DM:', error);
    throw error;
  }
}
