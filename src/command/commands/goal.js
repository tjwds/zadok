import { setWords } from "../statusWords.js";
import { Command } from "../Command.js";
import { Response, ERROR } from "../../response/Response.js";

// A goal is a single overarching todo for the day.

class ThingsTodoCommand extends Command {
  constructor() {
    super("goal");
  }

  async input(input) {
    // TODO it would be great to have helpers for these
    const command = input.words[1];

    const source = this.instance.source;
    const prisma = source.prisma;

    // TODO Maybe we could make this lookup more efficient by adding a key
    // to the table, but I'm going to wait until I really think this is the
    // shape I want this data to be in.
    const todaysGoal = await prisma.goal.findFirst({
      where: {
        time: {
          gte: source.today,
        },
      },
    });

    if (setWords.includes(command)) {
      if (todaysGoal) {
        const response = new Response(
          "Right now, setting more than one goal is not supported."
        );
        response.type = ERROR;
        return response;
      }

      const text = input.words.slice(2).join(" ");
      if (!text) {
        const response = new Response(
          "You have to tell me what you're gonna to do, champ."
        );
        response.type = ERROR;
        return response;
      }

      await prisma.goal.create({
        data: {
          title: text,
        },
      });

      return this.responseFromText("Alright, let's do it!");
    }

    if (!todaysGoal) {
      const response = new Response("You don't have a goal yet for the day.");
      response.type = ERROR;
      return response;
    }

    if (command === "done") {
      return this.responseFromText(`Congratulations!  You did it.`);
    }

    return this.responseFromText(
      `Today's goal${todaysGoal.done ? ", which you've accomplished!" : ""}:  ${
        todaysGoal.title
      }`
    );
  }
}

const todo = new ThingsTodoCommand();

export { todo };
