import { Source } from "./source/Source.js";
import { exec } from "child_process";

const Instance = class {
  constructor() {
    this.channels = new Map();
    this.nextChannelId = 0;

    this.commands = {};

    this.source = new Source();
  }

  async registerChannel(channel) {
    this.channels.set(this.nextChannelId, channel);
    channel.instance = this;

    await channel.watchInput();

    this.say("Registered channel " + channel.name);
    this.nextChannelId++;
  }

  registerCommand(command) {
    const { name } = command;
    this.commands[name] = command;
    command.instance = this;
  }

  sayHi() {
    exec('say -v Bells "Zadok online"');
    this.say("Zadok online. Hi there.");
  }

  say(text, prefix = "🌳") {
    console.log(`${prefix} ${text}`);
  }
};

let instance;
if (!instance) {
  instance = new Instance();
}

export { instance };
