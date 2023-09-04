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

  async findById(id) {
    const habit = await this.instance.source.prisma.habit.findUnique({
      where: {
        id,
      },
    });
    habit.type = "habit";

    return habit;
  }

  async findAll(done) {
    const source = this.instance.source;
    const prisma = source.prisma;

    let habits = (await prisma.habit.findMany()).filter(
      (habit) => habit.active
    );
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
    habits.forEach((habit) => (habit.type = "habit"));

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

  async input(input) {
    const response = await super.input(input);
    if (response) {
      return response;
    }

    const { words } = input;
    const [, command] = words;
    const text = words.slice(2).join(" ");

    let newActiveState;
    if (["activate", "enable"].includes(command)) {
      newActiveState = true;
    } else if (["disable", "deactivate"].includes(command)) {
      newActiveState = false;
    }
    if (typeof newActiveState === "boolean" && text) {
      const id = Number(text);
      const habit = await this.findById(id);

      try {
        await this.instance.source.prisma.habit.update({
          where: { id: habit.id },
          data: {
            active: newActiveState,
          },
        });
      } catch (err) {
        return;
      }

      return this.responseFromText(
        `Habit ${id} ${newActiveState ? "enabled" : "disabled"}: ${
          habit.title
        }.`
      );
    }
  }
}

const habit = new HabitCommand();

export { habit };
