import { Command } from "./Command.js";
import { doneWords, setWords, statusWords } from "./statusWords.js";
import { Response, WARNING } from "../response/Response.js";
import { timeAgo } from "../../utils/timeAgo.js";
import { HelpEntry } from "./HelpEntry.js";

// A TodoCommand is a kind of abstract base command for a type of task.  This
// can include things like arbitrary things to do, but also things like habits.
class TodoCommand extends Command {
  constructor(name, pluralName) {
    super(name);

    this.name = name;
    this.pluralName = pluralName;

    // TODO less generic
    this.help = new HelpEntry(name, "Manage things to do.")
      .addSubEntry("add <words>", "Add one!")
      .addSubEntry(
        "list (optionally: all|n,n|chronological|unpack|upcoming)",
        "Show 'em!  Try e.g. 'list -5'.  Can sort, too: upcoming is by due date."
      )
      .addSubEntry("done", "Mark 'em done!");
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

  async findRandom(done) {
    throw new Error(`I can't get random ${this.pluralName} yet, sorry.`);
  }

  async isDone(todo) {
    throw new Error(
      `I can't determine whether or not ${this.pluralName} are done yet, sorry.`
    );
  }

  async setDueDate(todoId, time) {
    throw new Error(
      `I can't set the due dates of ${this.pluralName} yet, sorry.`
    );
  }

  // ---

  async input(input) {
    const { words } = input;
    const [, command, subcommand, word4] = words;
    const text = words.slice(2).join(" ");

    // TODO DRY
    if (setWords.includes(command) && text) {
      const newTodo = await this.openWithTitle(text);
      return this.responseFromText(
        `Created ${this.name} ${newTodo.id}: ${text}`
      );
    } else if (command === "list") {
      const isAll = subcommand === "all";
      const shouldUnpack = words.includes("unpack");

      let todos = await this.findAll(isAll, {
        sort: words.includes("chronological")
          ? "chronological"
          : words.includes("upcoming")
          ? "due"
          : "alphabetical",
      });

      if (!todos.length) {
        return this.responseFromText(
          `You don't have any incomplete ${this.pluralName}.`
        );
      }

      let [startString, endString] = (subcommand || "").split(",");
      let start = Number(startString);
      const end = Number(endString);
      const startIsNaN = Number.isNaN(start);
      if (!startIsNaN || !Number.isNaN(end)) {
        if (Number.isNaN(start)) {
          start = 0;
        }

        todos = todos.slice(start, end || undefined);
      }

      const groups = new Map();
      if (!shouldUnpack) {
        todos.forEach((task) => {
          const { title } = task;
          const colonIndex = title.indexOf(":");
          if (colonIndex > -1) {
            const groupName = title.slice(0, colonIndex);
            const amount = groups.get(groupName) || 0;
            groups.set(groupName, amount + 1);
          }
        });

        // weird comparator because value could be undefined
        todos = todos.filter(
          (task) => !(groups.get(task.title.split(":")[0]) > 1)
        );
      }

      let responseString = todos.reduce(
        (string, todos) =>
          string +
          "\n" +
          todos.id +
          "\t" +
          todos.title +
          (todos.created
            ? "\n\t" +
              timeAgo(todos.created) +
              "\t" +
              (todos.due ? `due ${timeAgo(todos.due)}` : "no due date") +
              "\n"
            : ""),
        `Your ${this.pluralName}${isAll ? "" : " to do"}:\n`
      );

      if (!shouldUnpack) {
        const labelNames = Array.from(groups.entries())
          .filter(([, value]) => value > 1)
          .map(([key]) => key);
        if (labelNames.length) {
          const labels =
            labelNames.length === 1
              ? labelNames[0]
              : labelNames.length === 2
              ? labelNames.join(" and ")
              : labelNames.reduce((previous, next, index) => {
                  return (
                    previous +
                    (index === labelNames.length - 1
                      ? ", and "
                      : index
                      ? ", "
                      : "") +
                    next
                  );
                }, "");
          responseString += `\n…and some ${this.pluralName} labeled ${labels}.\n`;
        }
      }

      return this.responseFromText(responseString);
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
    } else if (command === "random") {
      try {
        const random = await this.findRandom(false);

        if (!random) {
          throw new Error(
            `You don't have any ${this.pluralNames} with that ID.`
          );
        }

        return this.responseFromText(
          random.id +
            "\t" +
            random.title +
            (random.created ? "\n\t" + timeAgo(random.created) + "\n" : "")
        );
      } catch (error) {
        const response = new Response(error.message);
        response.type = WARNING;
        return response;
      }
    } else if (command === "due") {
      await this.setDueDate(subcommand, word4);
      return this.responseFromText("Due date set.  You can do it!");
    }
  }
}

export { TodoCommand };
