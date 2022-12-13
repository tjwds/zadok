import { Command } from "./Command.js";
import { doneWords, statusWords } from "./statusWords.js";
import { Response, WARNING } from "../response/Response.js";

// A TodoCommand is a kind of abstract base command for a type of task.  This
// can include things like arbitrary things to do, but also things like habits.

class TodoCommand extends Command {
  constructor(name, pluralName) {
    super(name);

    this.name = name;
    this.pluralName = pluralName;
  }

  async openWithTitle(title) {
    throw new Error(`I can't create new ${this.pluralName} yet, sorry.`);
  }

  async markAs(done, todo) {
    throw new Error(`I can't mark ${this.pluralName} done yet, sorry.`);
  }

  async findById(id) {
    throw new Error(`I can't find ${this.pluralName} by id yet, sorry.`);
  }

  async findAll(done) {
    throw new Error(`I can't list ${this.pluralName} yet, sorry.`);
  }

  async isDone(todo) {
    throw new Error(
      `I can't determine whether or not ${this.pluralName}s are done yet, sorry.`
    );
  }

  // ---

  async input(input) {
    const command = input.words[1];
    const text = input.words.slice(2).join(" ");

    // TODO DRY
    if (["new", "add"].includes(command) && text) {
      const newTodo = await this.openWithTitle(text);
      return this.responseFromText(
        `Created ${this.name} ${newTodo.id}: ${text}`
      );
    } else if (command === "list") {
      // TODO filtering by done/not done
      let todos = await this.findAll(false);

      if (!todos.length) {
        return this.responseFromText(
          `You don't have any incomplete ${this.pluralName}.`
        );
      }
      return this.responseFromText(
        todos.reduce(
          (string, todos) => string + "\n" + todos.id + "\t" + todos.title,
          `Your ${this.pluralName} to do today:\n`
        )
      );
    } else if (statusWords.includes(command) && text) {
      const done = doneWords.includes(command);
      const id = Number(text);
      const todo = await this.findById(id);

      if (todo) {
        const isDone = await this.isDone(todo);

        if (isDone === done) {
          const response = new Response(
            `Buddy, you already told me that one ${
              done ? "was" : "wasn't"
            } done.`
          );
          response.type = WARNING;

          return response;
        }

        await this.markAs(done, todo);

        return this.responseFromText(
          `Cool${done ? ", good job" : ""}.  "${todo.title}" marked as ${
            done ? "complete" : "incomplete"
          }.`
        );
      } else {
        const response = new Response(
          `Sorry, I couldn't find a ${this.name} with that ID.`
        );
        response.type = WARNING;

        return response;
      }
    }
  }
}

export { TodoCommand };
