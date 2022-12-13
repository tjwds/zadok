import { TodoCommand } from "../TodoCommand.js";

class TaskCommand extends TodoCommand {
  constructor() {
    super("task", "tasks");
  }

  async openWithTitle(title) {
    return await this.instance.source.prisma.task.create({
      data: {
        title,
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
    return await this.instance.source.prisma.task.findMany({
      where: {
        done,
      },
    });
  }

  async isDone(todo) {
    return !!todo.done;
  }
}

const task = new TaskCommand();

export { task };
