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

  async findAll(done) {
    return (await this.#findAllTasks(done)).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
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
}

export { TaskCommand };
