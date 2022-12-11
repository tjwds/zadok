import { instance } from "../instance.js";
import { Response } from "../response/Response.js";

const Command = class {
  // TODO add help text for command

  constructor(name) {
    this.name = name;

    if (this.shouldRegister()) {
      instance.registerCommand(this);
    }
  }

  input(input) {
    return new Response(
      input.commandName === "ping" ? "pong" : "Sorry, I didn't catch that."
    );
  }

  shouldRegister() {
    return true;
  }
};

export { Command };
