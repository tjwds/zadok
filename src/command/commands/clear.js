import { Command } from "../Command.js";

class ClearCommand extends Command {
  constructor() {
    super("clear");
  }

  async input(input) {
    input.channel.clear();
    const response = this.emptyResponse();
    response.intentionallyEmpty = true;
    return response;
  }
}

const clear = new ClearCommand();

export { clear };
