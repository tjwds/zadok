import { TodoCommand } from "../TodoCommand.js";

class HabitCommand extends TodoCommand {
  constructor() {
    super("habit", "habits");
  }

  async openWithTitle(title) {
    return await this.instance.source.prisma.habit.create({
      data: {
        title,
      },
    });
  }

  // TODO delete log entries?

  // TODO for this one, it might be better to just address the habit by
  // name...
  async findById(id) {
    return await this.instance.source.prisma.habit.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(done) {
    const source = this.instance.source;
    const prisma = source.prisma;

    let habits = await prisma.habit.findMany();

    const loggedHabits = (
      await prisma.habitLogEntry.findMany({
        where: {
          time: {
            gte: source.today,
          },
        },
      })
    ).map((loggedHabit) => loggedHabit.habitId);

    if (!done) {
      habits = habits.filter((habit) => !loggedHabits.includes(habit.id));
    }

    return habits;
  }

  async isDone(habit) {
    const source = this.instance.source;
    // TODO Maybe we could make this lookup more efficient by adding a key
    // to the table, but I'm going to wait until I really think this is the
    // shape I want this data to be in.
    const loggedHabit = await source.prisma.habitLogEntry.findFirst({
      where: {
        time: {
          gte: source.today,
        },
        habitId: habit.id,
      },
    });

    return !!loggedHabit;
  }

  async markAs(done, habit) {
    if (!done) {
      // TODO
      throw new Error("I can't mark habits as undone yet, sorry.");
    }
    return await this.instance.source.prisma.habitLogEntry.create({
      data: { habitId: habit.id },
    });
  }
}

const habit = new HabitCommand();

export { habit };
