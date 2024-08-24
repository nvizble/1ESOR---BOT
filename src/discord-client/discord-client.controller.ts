import { Controller, Logger } from '@nestjs/common';
import { DiscordClientService } from './discord-client.service';
import {
  Activity,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  ActivityType,
} from 'discord.js';
import * as fs from 'node:fs/promises';

interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

@Controller()
export class DiscordClientController {
  private client: ExtendedClient;

  constructor(private readonly discordClientService: DiscordClientService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    }) as ExtendedClient;

    this.client.commands = new Collection();

    this.loadCommands()
      .then(() => this.registerCommands())
      .catch((error) => Logger.error('Failed to load commands', error));

    this.client.on(Events.ClientReady, () => {
      Logger.log('Bot initialized');
    });

    this.client.once('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);

      // Set bot presence to "Playing"
      this.client.user?.setPresence({
        activities: [
          {
            name: 'Studying Software Engineering - FIAP',
            type: ActivityType.Watching,
            url: 'https://on.fiap.com.br/',
          },
        ],
        status: 'dnd', // Bot's status can be 'online', 'idle', 'dnd', 'invisible'
      });
    });

    this.client.login(process.env.DISCORD_TOKEN).then(() => {
      Logger.log('Bot logged in successfully!');
    });
  }

  private async loadCommands() {
    try {
      const foldersPath = __dirname + '/' + 'commands';
      const files = await fs.readdir(foldersPath);

      const commandFiles = files
        .filter((file) => file.endsWith('.js'))
        .map((file) => foldersPath + '/' + file);

      for (const filePath of commandFiles) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const commandModule = require(filePath);
          const command = commandModule.default;

          if (command.data && command.execute) {
            this.client.commands.set(command.data.name, command);
          } else {
            console.error(
              `Command at ${filePath} is missing required properties.`,
            );
          }
        } catch (error) {
          console.error(`Failed to load command at ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  }

  private async registerCommands() {
    try {
      const rest = new REST({ version: '10' }).setToken(
        process.env.DISCORD_TOKEN,
      );

      const commands = Array.from(this.client.commands.values()).map(
        (command) => command.data.toJSON(),
      );

      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID,
        ),
        {
          body: commands,
        },
      );

      Logger.log('Commands registered successfully');
    } catch (error) {
      Logger.error('Error registering commands:', error);
    }
  }
}
