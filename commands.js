import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// List webhooks command, DM only
const LIST_HOOKS_COMMAND = {
  name: 'listhooks',
  type: 1,
  description: 'List your webhooks',
  integration_types: [1],
  contexts: [0, 1, 2],
};

// List webhooks command, DM only
const HOOK_INFO_COMMAND = {
  name: 'hookinfo',
  type: 1,
  description: 'Get information about a specific hook.',
  options: [
    {
      type: 3,
      name: 'hook',
      description: 'Hook to lookup (ID)',
      required: true
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const CREATE_WEBHOOK_COMMAND = {
  name: 'createhook',
  type: 1,
  description: 'Create a webhook.',
  options: [
    {
      type: 3,
      name: 'name',
      description: 'A name for this webhook',
      required: true
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const DELETE_WEBHOOK_COMMAND = {
  name: 'deletehook',
  type: 1,
  description: 'Delete a webhook.',
  options: [
    {
      type: 3,
      name: 'hook',
      description: 'Hook to delete (ID)',
      required: true
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
  LIST_HOOKS_COMMAND,
  HOOK_INFO_COMMAND,
  CREATE_WEBHOOK_COMMAND,
  DELETE_WEBHOOK_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
