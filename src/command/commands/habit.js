import { Command } from "../Command.js";
import { Response, WARNING } from "../../response/Response.js";
import { doneWords, undoneWords, statusWords } from "../statusWords.js";

// TODO There's a _whole_ lot of overlap between this and tasks.  Factor these
// out to a class to inherit from.

class HabitCommand extends Command {
  constructor() {
    super("habit");
  }

  async input(input) {
    const command = input.words[1];
    const text = input.words.slice(2).join(" ");
    // TODO this API could be improved somewhat
    const source = this.instance.source;
    const prisma = source.prisma;
    // TODO DRY
    if (["new", "add"].includes(command) && text) {
      const newHabit = await prisma.habit.create({
        data: {
          title: text,
        },
      });
      return this.responseFromText(`Created habit ${newHabit.id}: ${text}`);
    } else if (command === "list") {
      // TODO filtering by done/not done
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

      habits = habits.filter((habit) => !loggedHabits.includes(habit.id));

      if (!habits.length) {
        return this.responseFromText("You don't have any incomplete habits.");
      }
      return this.responseFromText(
        habits.reduce(
          (string, habit) => string + "\n" + habit.id + "\t" + habit.title,
          "Your habits to do today:\n"
        )
      );
    } else if (doneWords.includes(command) && text) {
      // TODO delete log entries?
      // TODO for this one, it might be better to just address the habit by
      // name...
      // TODOTODO okay, this is where it gets weird
      const id = Number(text);
      const habit = await prisma.habit.findUnique({
        where: {
          id,
        },
      });

      if (habit) {
        // TODO Maybe we could make this lookup more efficient by adding a key
        // to the table, but I'm going to wait until I really think this is the
        // shape I want this data to be in.
        const loggedHabit = await prisma.habitLogEntry.findFirst({
          where: {
            time: {
              gte: source.today,
            },
            habitId: habit.id,
          },
        });

        if (loggedHabit) {
          const response = new Response(
            `Buddy, you already told me that one was done.`
          );
          response.type = WARNING;

          return response;
        }
        await prisma.habitLogEntry.create({
          data: { habitId: habit.id },
        });

        return this.responseFromText(
          `Cool, good job.  "${habit.title}" marked as done for today.`
        );
      } else {
        const response = new Response(
          "Sorry, I couldn't find a habit with that ID."
        );
        response.type = WARNING;

        return response;
      }
    }
  }
}

const habit = new HabitCommand();

export { habit };
