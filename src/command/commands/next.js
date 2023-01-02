import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

import { timeAgo } from "../../../utils/timeAgo.js";

const polymorphicTasksAreEqual = (a, b) => {
  if (typeof a === "number") {
    return a === b;
  }
  return a.id === b.id;
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
    return array.filter((id) => !polymorphicTasksAreEqual(id, item));
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
    return tasks.reduce(
      (string, todos) =>
        string +
        "\n" +
        todos.id +
        "\t" +
        todos.title +
        (todos.created ? "\n\t" + timeAgo(todos.created) + "\n" : ""),
      ""
    );
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
      // XXX horrible hack based on my own personal db; fix before really
      // sharing
      const taskType = taskNumber < 100 ? "habit" : "task";
      taskRecord = await prisma[taskType].findUnique({
        where: { id: taskNumber },
      });
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
      queue.map((id) =>
        prisma[id < 100 ? "habit" : "task"].findUnique({
          where: { id },
        })
      )
    );

    // clean the queue of tasks that are already done
    tasksInQueue = tasksInQueue
      .filter((task) => !task.done)
      .filter((habit) => !loggedHabits.includes(habit.id));

    queue = tasksInQueue.map((task) => task.id);
    queue = commandFunction(queue, Number(taskId));

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
