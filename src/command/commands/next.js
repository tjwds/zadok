import { task } from "./taskCommands.js";
import { habit } from "./habit.js";
import { linear } from "./linear.js";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

import { timeAgo } from "../../../utils/timeAgo.js";

const tasksAreEqual = (a, b) => {
  if (a.id) {
    return a.id === b.id;
  }
  return a === b;
};

const commands = {
  push(array, item) {
    array.push(item);
    return array;
  },
  unshift(array, item) {
    array.unshift(item);
    return array;
  },
  remove(array, item) {
    return array.filter((id) => !tasksAreEqual(id, item));
  },
  pop(array) {
    array.pop();
    return array;
  },
  shift(array) {
    array.shift();
    return array;
  },
  clear() {
    return [];
  },
  // lol
  list(array) {
    return array;
  },
};

class NextCommand extends Command {
  constructor() {
    super("next");

    this.help = new HelpEntry("next", "A queue of tasks that are 'up next' …")
      .addSubEntry(
        "push <optional task type> <item>",
        "Push a task to the end of the stack."
      )
      .addSubEntry(
        "unshift <optional task type> <item>",
        "Stick a task on the beginning of the stack."
      )
      .addSubEntry("remove <item>", "Remove a specific item from the queue")
      .addSubEntry("pop", "Pop from the stack.")
      .addSubEntry("shift", "Remove a task from the front of the stack.")
      .addSubEntry("clear", "Clear the stack.")
      .addSubEntry("list", "List the tasks you've queued.");
  }

  // TODO generalize this
  taskListToString(tasks) {
    const longestId = tasks.reduce((before, task) => {
      const taskIdLength = String(task.id).length;
      return taskIdLength > before ? taskIdLength : before;
    }, 0);
    return tasks.reduce(
      (string, todos) =>
        string +
        "\n" +
        todos.id +
        " ".repeat(longestId + 2 - String(todos.id).length) +
        todos.title +
        (todos.created
          ? "\n" +
            " ".repeat(longestId + 2) +
            timeAgo(todos.created) +
            "\t" +
            (todos.due ? `due ${timeAgo(todos.due)}` : "no due date")
          : "") +
        "\n",
      ""
    );
  }

  taskIdentifierToCommandInstance(type) {
    if (type === "linear") {
      return linear;
    }
    if (type === "habit") {
      return habit;
    }

    // XXX good luck!
    return task;
  }

  async input(input) {
    const prisma = this.instance.source.prisma;
    let [, command, word2, word3] = input.words;

    if (!command) {
      command = "list";
    }

    const taskId = word3 || word2;
    const taskNumber = Number(taskId);
    const loggedHabits = (
      await prisma.habitLogEntry.findMany({
        where: {
          time: {
            gte: this.instance.source.today,
          },
        },
      })
    ).map((loggedHabit) => loggedHabit.habitId);

    let taskTypeString = taskId === word3 ? word2 : null;
    if (!taskTypeString) {
      if (Number.isInteger(taskNumber)) {
        // XXX This is a hack, but let's assume that all ids under 20 are
        //     habits.
        taskTypeString = taskNumber < 20 ? "habit" : "task";
      } else {
        taskTypeString = "linear";
      }
    }

    const taskType = this.taskIdentifierToCommandInstance(taskTypeString);

    let taskRecord;

    // Get the command function
    const commandFunction = commands[command];

    // Check the arity of the function; if it requires a taskId, make sure we
    // have one
    if (commandFunction.length > 1) {
      if (
        !taskId ||
        (taskTypeString === "habit" && loggedHabits.includes(taskNumber))
      ) {
        // TODO better error message
        return;
      }
      // XXX ugh, this type mismatch makes me sad
      taskRecord = await taskType.findById(
        Number.isNaN(taskNumber) ? taskId : taskNumber
      );
      if (!taskRecord || taskRecord.done) {
        // TODO better error message
        return;
      }
    }

    // Get the current queue
    let queueRecord = (await prisma.next.findMany())[0];
    let queueId;

    // If one doesn't exist, create one
    let queue = [];
    if (!queueRecord) {
      queueRecord = await prisma.next.create({
        data: { queue: "[]" },
      });
      queueId = queueRecord.id;
    } else {
      queue = JSON.parse(queueRecord.queue);
      queueId = JSON.parse(queueRecord.id);
    }

    // XXX optimize this query
    let tasksInQueue = await Promise.all(
      queue.map((id) => {
        const [recordIdString, type] = id.split("#");
        const recordId = Number(recordIdString);
        return this.taskIdentifierToCommandInstance(type).findById(
          recordIdString === String(recordId) ? recordId : recordIdString
        );
      })
    );

    // clean the queue of tasks that are already done
    tasksInQueue = (
      await Promise.all(
        tasksInQueue.map(async (task) =>
          // XXX This is absurd.
          (await this.taskIdentifierToCommandInstance(
            task.id,
            task.type
          ).isDone(task))
            ? null
            : task
        )
      )
    ).filter(Boolean);

    queue = tasksInQueue.map((task) => String(task.id) + "#" + task.type);
    // XXX Ugh, this is just a stack of bad hacks.
    queue = commandFunction(
      queue,
      String(Number.isNaN(taskNumber) ? taskId : taskNumber) +
        "#" +
        taskTypeString
    );

    await prisma.next.update({
      where: { id: queueId },
      data: {
        queue: JSON.stringify(queue),
      },
    });

    // tasksInQueue needs to be updated, too
    tasksInQueue = commandFunction(tasksInQueue, taskRecord);

    return this.responseFromText(
      this.taskListToString(tasksInQueue) || "Nothing in the queue!"
    );
  }
}

const next = new NextCommand();

export { next };
