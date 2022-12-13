import { Command } from "../Command.js";

// I know, I know, I called the other TodoCommand that and this todo.  Sorry.

class ThingsTodoCommand extends Command {
  constructor() {
    super("todo");
  }

  async input(input) {
    input.channel.parseInput("goal");
    ["task", "habit"].forEach((todoType) => {
      input.channel.parseInput(`${todoType} list`);
    });
    const response = this.emptyResponse();
    response.intentionallyEmpty = true;
    return response;
  }
}

const todo = new ThingsTodoCommand();

export { todo };
