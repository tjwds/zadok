import { instance } from "../instance.js";
import { Input } from "./Input.js";

const Channel = class {
  constructor(name) {
    this.ready = false;
    this.instance = null;

    this.name = name;

    this.initialize();
  }

  async initialize() {
    await instance.registerChannel(this);
    this.ready = true;
  }

  watchInput() {
    // On input, invoke parseInput on the sentence.
    throw new Error("Unimplemented.");
  }

  parseInput(fullMessage = "", extra) {
    const words = fullMessage.split(" ");
    this.actionInput(
      new Input({
        fullMessage,
        words,

        commandName: words[0].toLocaleLowerCase(),

        channel: this,

        // For passing through the raw event, if needed (see Discord)
        extra,
      })
    );
  }

  async actionInput(input) {
    const { commandName } = input;
    const { instance } = this;
    const { commands } = instance;

    const command = commands[commandName];
    let response;
    if (command) {
      response = await command.input(input);
    }
    if (!response) {
      response = await commands.default.input(input);
    }
    response.extra = input.extra;

    if (!response.intentionallyEmpty) {
      this.executeOutput(response);
    }
  }

  executeOutput(response) {
    throw new Error("Unimplemented.", { response });
  }

  clear() {
    throw new Error("I don't know how to clear this channel, sorry.");
  }
};

export { Channel };
