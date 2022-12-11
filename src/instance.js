const Instance = class {
  constructor() {
    this.channels = new Map();
    this.nextChannelId = 0;

    this.commands = {};

    // TODO database / source
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

  say(text) {
    console.log(`🌳 ${text}`);
  }
};

let instance;
if (!instance) {
  instance = new Instance();
}

export { instance };
