import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import {
  VerifyDiscordRequest,
  sendDM
} from './utils.js';
import {
  getWebhooksByUserID,
  getWebhookByUserIdAndInternalID,
  getWebhookByIdAndSecret,
  createWebhook,
  deleteWebhookByUserAndInternalId
} from './dataprovider.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    express.json()(req, res, next);
  } else {
    express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) })(req, res, next);
  }
});

app.post('/interactions', async function (req, res) {
  const { type, data } = req.body;
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const interactionContext = req.body.context;
    if (interactionContext == 2) {
      if (name === 'listhooks') {
        let user_hooks = await getWebhooksByUserID(req.body.user.id);
        if (user_hooks.length == 0) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You don't have any webhooks, create one with /createhook",
              flags: 64,
            },
          });
        }
        let embed_fields = [];
        for (let i in user_hooks) {
          const webhook = user_hooks[i];
          embed_fields.push({
            name: `${webhook.id} - ${webhook.name}`,
            value: `\n`,
          });
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "Your webhooks",
                color: 0x00ff00,
                fields: embed_fields,
                footer: {
                  text: "More info with /hookinfo <webhook_id>",
                }
              }
            ],
            flags: 64,
          },
        });
      }
      if (name === 'hookinfo') {
        const webhook = await getWebhookByUserIdAndInternalID(req.body.user.id, data.options[0].value);
        if (!webhook) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Webhook does not exist",
              flags: 64,
            },
          });
        }
        let webhookPayloadData = {
          content: JSON.stringify(webhook),
          flags: 64,
        };
        const description = "ID: " + webhook.id + "\nName: " + webhook.name + "\n\nURL:\n" + req.protocol + "://" + req.headers.host + "/api/webhooks/" + webhook.webhook_id + "/" + webhook.webhook_secret;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "DMHook " + webhook.id + " (" + webhook.name + ") information",
                description: description,
                color: 0x00ff00,
              }
            ],
            flags: 64,
          },
        });
        
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: webhookPayloadData,
        });
      }
      if (name === "createhook") {
        const webhookName = data.options[0].value.slice(0, 15);
        if (webhookName.length > 15) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Webhook name is too long. Maximum 15 characters.",
              flags: 64,
            },
          });
        }
        const webhook_id = await createWebhook(req.body.user.id, webhookName);
        if (!webhook_id) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Failed to create webhook",
              flags: 64,
            },
          });
        }
        const webhook = await getWebhookByUserIdAndInternalID(req.body.user.id, webhook_id);
        if (!webhook) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Failed to fetch newly created webhook",
              flags: 64,
            },
          });
        }
        const webhook_url = req.protocol + "://" + req.headers.host + "/api/webhooks/" + webhook.webhook_id + "/" + webhook.webhook_secret;
        const description = "DMHook created! Internal ID: "+ webhook_id + "\nWebhook URL: " + webhook_url + "\nYou can use this webhook like a normal discord webhook.";
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "DMHook created successfully!",
                description: description,
                color: 0x00ff00,
              }
            ],
            flags: 64,
          },
        });
      }
      if (name === 'deletehook') {
        const webhook = await getWebhookByUserIdAndInternalID(req.body.user.id, data.options[0].value);
        if (!webhook) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "DMHook does not exist",
              flags: 64,
            },
          });
        }
        const webhook_deleted = await deleteWebhookByUserAndInternalId(req.body.user.id, data.options[0].value);
        if (!webhook_deleted) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Failed to delete webhook",
              flags: 64,
            },
          });
        } else
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "DMHook deleted successfully!",
              flags: 64,
            },
          });
      }
    } else {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "You can only do this in DMs. (All commands associated with this bot are only in DMs.)",
          flags: 64,
        },
      });
    }
  }
});

app.post('/api/webhooks/:id/:secret', async function (req, res) {
  const { id, secret } = req.params;
  const webhook = await getWebhookByIdAndSecret(id, secret);
  if (!webhook) {
    return res.sendStatus(404);
  }
  const user_id = webhook.user;
  const webhook_payload = req.body;
  if (!webhook_payload) {
    return res.sendStatus(400);
  }
  const message = `From: \`${webhook.name}\` Internal ID: ${webhook.id}.\n\n`;
  let content = message;
  if (webhook_payload.content) {
    content = message + webhook_payload.content;
  }
  
  webhook_payload.content = content;
  await sendDM(user_id, webhook_payload);
  return res.sendStatus(200);
});


app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
