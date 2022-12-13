import { Command } from "../Command.js";
import { Response, WARNING } from "../../response/Response.js";
import { doneWords, undoneWords, statusWords } from '../statusWords.js';

class TaskCommand extends Command {
  constructor() {
    super("task");
  }

  async input(input) {
    const command = input.words[1];
    const text = input.words.slice(2).join(" ");
    // TODO this API could be improved somewhat
    const prisma = this.instance.source.prisma;
    if (["new", "add"].includes(command) && text) {
      const newTask = await prisma.task.create({
        data: {
          title: text,
        },
      });
      return this.responseFromText(`Created task ${newTask.id}: ${text}`);
    } else if (command === "list") {
      // TODO filtering by done/not done
      // TODO at some point I'm going to need pagination
      const tasks = await prisma.task.findMany({
        where: {
          done: false,
        },
      });
      if (!tasks.length) {
        return this.responseFromText("You don't have any incomplete tasks.");
      }
      return this.responseFromText(
        tasks.reduce(
          (string, task) => string + "\n" + task.id + "\t" + task.title,
          "Your tasks:\n"
        )
      );
    } else if (statusWords.includes(command) && text) {
      const done = doneWords.includes(command);
      const id = Number(text);
      const task = await prisma.task.findUnique({
        where: {
          id,
        },
      });

      if (task) {
        if (task.done === done) {
          const response = new Response(
            `Buddy, you already told me that one ${
              done ? "was" : "wasn't"
            } done.`
          );
          response.type = WARNING;

          return response;
        }
        await prisma.task.update({
          where: { id },
          data: { done },
        });

        return this.responseFromText(
          `Cool${done ? ", good job" : ""}.  "${task.title}" marked as ${
            done ? "complete" : "incomplete"
          }.`
        );
      } else {
        const response = new Response(
          "Sorry, I couldn't find a task with that ID."
        );
        response.type = WARNING;

        return response;
      }
    }
  }
}

const task = new TaskCommand();

export { task };
