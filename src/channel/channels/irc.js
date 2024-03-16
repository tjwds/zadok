import IRC from "irc-framework";

import { default as config } from "../../../config.js";

import { Channel } from "../Channel.js";

const IrcChannel = class IrcChannel extends Channel {
  constructor() {
    if (config.irc.host) {
      setInterval(() => {
        // TODO other things to prevent excess flood…
        for (let i = 0; i < 2; i++) {
          let words = this.messageQueue.shift();
          if (!words) {
            break;
          }
          this.spout(words.substring(0, 300));
        }
      }, 1000);
    }

    super("irc", !!config.irc.host);
  }

  spout = () => {};
  messageQueue = [];

  async watchInput() {
    console.log("IRC client connecting, this will take a bit…");
    const { host, port, nick, channel, channelPassword, yourNick } =
      config.irc || {};

    const bot = new IRC.Client();
    bot.connect({ host, port, nick });
    bot.on("debug", (msg) => console.log(msg));
    bot.on("error", (msg) => console.log(msg));

    bot.on("message", (event) => {
      const { type, nick, target, message } = event;
      if (
        type === "privmsg" &&
        (!yourNick || nick === yourNick) &&
        target === channel
      ) {
        this.parseInput(message);
      }
    });

    bot.on("registered", () => {
      bot.join(channel, channelPassword);
      this.spout = (message) => bot.say(channel, message);
      console.log("IRC client connected.");
    });
  }

  executeOutput({ text }) {
    this.messageQueue.push(text);
  }
};

const ircChannel = new IrcChannel();

export { ircChannel };
