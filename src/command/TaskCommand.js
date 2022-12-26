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

  async findAll(done) {
    return (
      await this.instance.source.prisma.task.findMany({
        where: {
          done,
          type: this.name,
        },
      })
    ).sort((a, b) => a.title.localeCompare(b.title));
  }

  async isDone(todo) {
    return !!todo.done;
  }
}

export { TaskCommand };
