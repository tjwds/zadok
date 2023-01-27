import { TodoCommand } from "./TodoCommand.js";

class TaskCommand extends TodoCommand {
  constructor(name, pluralName) {
    super(name, pluralName);
  }

  async openWithTitle(title) {
    return await this.instance.source.prisma.task.create({
      data: {
        title,
        type: this.name,
      },
    });
  }

  async markAs(done, todo) {
    return await this.instance.source.prisma.task.update({
      where: { id: todo.id },
      data: { done },
    });
  }

  async findById(id) {
    return await this.instance.source.prisma.task.findUnique({
      where: {
        id,
      },
    });
  }

  async #findAllTasks(done) {
    return await this.instance.source.prisma.task.findMany({
      where: {
        done,
        type: this.name,
      },
    });
  }

  async findAll(done, { sort = "alphabetical" } = {}) {
    const tasks = await this.#findAllTasks(done);
    if (sort === "alphabetical") {
      tasks.sort((a, b) => a.title.localeCompare(b.title));
    }

    return tasks;
  }

  async findRandom(done) {
    const allTasks = await this.#findAllTasks(done);
    if (!allTasks.length) {
      return null;
    }

    return allTasks[Math.floor(Math.random() * allTasks.length)];
  }

  async isDone(todo) {
    return !!todo.done;
  }

  async setDueDate(todoId, time) {
    const due = new Date(time);
    if (Number.isNaN(Number(due))) {
      throw new Error(`${time} is not a valid date.`);
    }
    return await this.instance.source.prisma.task.update({
      where: { id: Number(todoId) },
      data: { due },
    });
  }
}

export { TaskCommand };
