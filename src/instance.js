import { Source } from "./source/Source.js";

const Instance = class {
  constructor() {
    this.channels = new Map();
    this.nextChannelId = 0;

    this.commands = {};

    this.source = new Source();
  }

  registerChannel(channel) {
    this.channels.set(this.nextChannelId, channel);
    channel.instance = this;

    channel.watchInput();

    this.say("Registered channel " + channel.name);
    this.nextChannelId++;
  }

  registerCommand(command) {
    const { name } = command;
    this.commands[name] = command;

    this.say("Registered command " + name);
  }

  sayHi() {
    this.say("Hi there.");
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
