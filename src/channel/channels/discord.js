import { Client, GatewayIntentBits, Message } from "discord.js";

import { default as config } from "../../../config.js";

import { Channel } from "../Channel.js";

const DiscordChannel = class DiscordChannel extends Channel {
  constructor() {
    super("discord");
  }

  // TODO this api is kind of weird.
  async watchInput() {
    // TODO shouldRegister? if !config.discordToken
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });
    client.login(config.discord.token);
    await new Promise((resolve) => {
      client.on("ready", () => {
        resolve();
      });
    });

    // TODO add support for more interactions
    client.on("messageCreate", (event) => {
      if (!config.discord.channels.includes(event?.channelId)) {
        return;
      }
      // don't respond to self
      if (event?.member && event.member.user.id === client.user.id) {
        return;
      }

      const text = ((event && event.content) || "").trim();
      // don't act on empty messages (though they can have attachments)
      // may want to reconsider this later!
      if (event instanceof Message && !text) {
        return;
      }

      this.parseInput(text, { event });
    });
  }

  executeOutput(response) {
    // TODO warning support
    response.extra.event.reply(response.text);
  }
};

const discord = new DiscordChannel();

export { discord };
