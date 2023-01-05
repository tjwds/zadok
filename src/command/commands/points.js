import { asciiChart } from "../../../utils/asciiChart.js";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

class PointsCommand extends Command {
  constructor() {
    super("points");

    this.help = new HelpEntry("points", "Award or count some points …")
      .addSubEntry(
        "<amount> <reason>",
        "Award yourself (or subtract) some points, for a reason."
      )
      .addSubEntry("today", "How many points have you been awarded today?");
  }

  async pointsSince(date = this.instance.source.today) {
    return (
      await this.instance.source.prisma.points.findMany({
        where: { time: { gte: date } },
      })
    ).reduce((before, points) => before + points.amount, 0);
  }

  async lastPointsArray() {
    const allRecords = await this.instance.source.prisma.points.findMany();

    const hackArray = [];
    allRecords.forEach((record) => {
      const { time, amount } = record;

      const index =
        (time.getYear() - 123) * 10000 +
        time.getMonth() +
        1 * 100 +
        time.getDay() +
        1;
      hackArray[index] = (hackArray[index] || 0) + amount;
    });

    return hackArray.filter((entry) => typeof entry === "number");
  }

  async input(input) {
    // TODO it would be great to have helpers for these
    const command = input.words[1];
    const prisma = this.instance.source.prisma;

    const amount = Number(command);
    if (command === "today") {
      const todaysPoints = await this.pointsSince();

      // TODO add list of reasons
      return this.responseFromText(`Your score for today is ${todaysPoints}.`);
    } else if (command === "yesterday") {
      const yesterday = this.instance.source.today;
      yesterday.setDate(yesterday.getDate() - 1);
      const todaysPoints = await this.pointsSince(yesterday);

      // TODO add list of reasons
      return this.responseFromText(
        `Your score for yesterday was ${todaysPoints}.`
      );
    } else if (command === "chart") {
      return this.responseFromText(
        "\n" + asciiChart(await this.lastPointsArray())
      );
    } else if (String(amount) === command) {
      const reason = input.words.slice(2).join(" ");
      if (reason) {
        await prisma.points.create({
          data: {
            reason,
            amount,
          },
        });

        const todaysPoints = await this.pointsSince();

        return this.responseFromText(
          `${
            points > 0 ? "Great!" : "Okay."
          } Your score for today is now ${todaysPoints}.`
        );
      }
    }
  }
}

const points = new PointsCommand();

export { points };
