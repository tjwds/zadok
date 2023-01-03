import { default as config } from "../../../config.js";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

/*
We get our routines from the config file.  It might be slightly better to get
these from the database, but putting them in the config means that you can do
some metaprogramming (e.g. changing the routine based on whether or not it's a 
weekend, among other ideas).

This was written mostly to get things into my next stack, but you could use it
to make macros for basically anything.
*/

class RoutineCommand extends Command {
  constructor() {
    super("routine");

    this.help = new HelpEntry(
      "routine",
      "Execute a predefined routine from your config file."
    );
  }

  async input(input) {
    const commandName = input.words[1];

    let commands = config.routines[commandName];
    if (!commands) {
      return;
    }
    if (typeof commands === "string") {
      commands = [commands];
    }

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      await input.channel.parseInput(command, {
        event: input.extra?.event,
      });
    }

    const response = this.emptyResponse();
    response.intentionallyEmpty = true;
    return response;
  }
}

const routine = new RoutineCommand();

export { routine };
