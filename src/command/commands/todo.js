import { Command } from "../Command.js";
import { Response, WARNING } from "../../response/Response.js";

// I know, I know, I called the other TodoCommand that and this todo.  Sorry.

class ThingsTodoCommand extends Command {
  constructor() {
    super("todo");
  }

  async input(input) {
    if (input.words.length > 1) {
      const response = new Response(
        "I don't know that command.  You probably wrote `todo` when you meant `task` or something."
      );
      response.type = WARNING;
      return response;
    }
    ["goal", "points today", "task list", "habit list", "project list"].forEach(
      (infoType) =>
        input.channel.parseInput(infoType, {
          event: input.extra?.event,
        })
    );
    const response = this.emptyResponse();
    response.intentionallyEmpty = true;
    return response;
  }
}

const todo = new ThingsTodoCommand();

export { todo };
