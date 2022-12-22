import { Command } from "../Command.js";
import { Response, WARNING } from "../../response/Response.js";
import { HelpEntry } from "../HelpEntry.js";

class TimeBlockCommand extends Command {
  constructor() {
    super("timeblock");

    this.help = new HelpEntry("timeblock", "Blocks of time to get things done.")
      .addSubEntry("create", "Make a new one.")
      .addSubEntry("<block name>", "Show what's scheduled for that time block.")
      .addSubEntry(
        "<block name> add <todo type> <todo id>",
        "e.g. `timeblock night add task 1`"
      );
  }

  async input(input) {
    const [, /* command */ title, subcommand, type, idStr] = input.words;

    const source = this.instance.source;
    const prisma = source.prisma;

    if (!title) {
      // TODO list all timeblocks
      return;
    }

    // create
    if (title === "create") {
      await prisma.timeBlock.create({
        data: {
          // shrug
          title: subcommand,
        },
      });

      return this.responseFromText(`Created timeblock ${subcommand}.`);
    }

    const requestedBlock = await prisma.timeBlock.findFirst({
      where: {
        title,
      },
    });

    if (!requestedBlock) {
      return this.responseFromText("Couldn't find a timeblock by that name.");
    }

    if (subcommand) {
      // TODO use createWords…
      if (subcommand === "add") {
        // "timeblock night add habit 1" — associate
        if (type && idStr) {
          const id = Number(idStr);
          // TODO actually catch any errors here; it's fine for my toy, but
          // this is definitely not, like, ready for other people to see.
          // XXX oh yeah, this is dynamically determining the table to use.
          // this isn't fragile at all.
          const target = prisma[type].findUnique({
            where: {
              id,
            },
          });
          if (target) {
            await prisma[type].update({
              where: { id },
              data: {
                timeBlockId: requestedBlock.id,
              },
            });
            return this.responseFromText("Got it, that's when you'll do that.");
          } else {
            const response = new Response(
              `Sorry, I couldn't find that target.`
            );
            response.type = WARNING;
            return response;
          }
        }
      }
    } else {
      // e.g. "timeblock night" should list all items
      let response = "";
      const tasks = await prisma.task.findMany({
        where: {
          timeBlockId: requestedBlock.id,
          done: false,
        },
      });
      if (tasks.length) {
        response += "Tasks:\n";
        response = tasks.reduce(
          (string, todos) => string + "\n" + todos.id + "\t" + todos.title,
          response
        );
      }
      const habits = await prisma.habit.findMany({
        where: {
          timeBlockId: requestedBlock.id,
        },
      });
      if (habits.length) {
        response += "Habits:\n";
        response = habits.reduce(
          (string, todos) => string + "\n" + todos.id + "\t" + todos.title,
          response
        );
      }
      if (!response) {
        return this.responseFromText(
          "Nothing associated with that timeblock yet."
        );
      }

      return this.responseFromText(response);
    }
  }
}

const timeblock = new TimeBlockCommand();

export { timeblock };
