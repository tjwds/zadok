import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

class ClearCommand extends Command {
  constructor() {
    super("clear");

    this.help = new HelpEntry("clear", "Clear the screen.");
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
