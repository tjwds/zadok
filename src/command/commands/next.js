import { task } from "./task.js";
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
      .addSubEntry("push <item>", "Push a task to the end of the stack.")
      .addSubEntry(
        "unshift <item>",
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
          ? "\n" + " ".repeat(longestId + 2) + timeAgo(todos.created)
          : "") +
        "\n",
      ""
    );
  }

  taskNumberToCommandInstance(taskNumber) {
    // XXX horrible hack based on my own personal db; fix before really sharing
    // Number.isInteger:  test for string or NaN
    return !Number.isInteger(taskNumber)
      ? linear
      : taskNumber < 100
      ? habit
      : task;
  }

  async input(input) {
    const prisma = this.instance.source.prisma;
    const [, command, taskId] = input.words;
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
    const taskType = this.taskNumberToCommandInstance(taskNumber);

    let taskRecord;

    // Get the command function
    const commandFunction = commands[command];
    if (!commandFunction) {
      return;
    }

    // Check the arity of the function; if it requires a taskId, make sure we
    // have one
    if (commandFunction.length > 1) {
      if (!taskId || loggedHabits.includes(taskNumber)) {
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
      queue.map((id) => this.taskNumberToCommandInstance(id).findById(id))
    );

    // clean the queue of tasks that are already done
    tasksInQueue = (
      await Promise.all(
        tasksInQueue.map(async (task) =>
          // XXX This is absurd.
          (await this.taskNumberToCommandInstance(task.id).isDone(task))
            ? null
            : task
        )
      )
    ).filter(Boolean);

    queue = tasksInQueue.map((task) => task.id);
    // XXX Ugh, this is just a stack of bad hacks.
    queue = commandFunction(
      queue,
      Number.isNaN(taskNumber) ? taskId : taskNumber
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
