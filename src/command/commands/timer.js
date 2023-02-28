import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

const tagRegex = /#[a-zA-Z0-9]+/g;

class TimerCommand extends Command {
  constructor() {
    super("timer");

    this.help = new HelpEntry(
      "timer",
      "Get information about ActivityWatch stopwatch."
    );
  }

  async input() {
    // TODO add more filtering/reporting
    const today = this.instance.source.today;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const req = await fetch(
      // TODO parameterize
      `http://localhost:5600/api/0/buckets/aw-stopwatch/events?end=${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1
      ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(
        2,
        "0"
      )}&start=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}&limit=200`,
      { accept: "application/json" }
    );
    const items = await req.json();

    const tagsToSeconds = new Map();
    let workedSeconds = 0;
    items.forEach((item) => {
      const { duration } = item;
      workedSeconds += duration;
      const tags = item.data.label.match(tagRegex);
      if (tags) {
        tags.forEach((tag) => {
          tagsToSeconds.set(tag, (tagsToSeconds.get(tag) || 0) + duration);
        });
      } else {
        tagsToSeconds.set(
          "No label",
          (tagsToSeconds.get("No label") || 0) + duration
        );
      }
    });

    let result = `You've worked ${(workedSeconds / 60 / 60).toFixed(
      2
    )} hours today.`;
    if (tagsToSeconds.size) {
      tagsToSeconds.forEach((value, key) => {
        result += "\n";
        result += `${key}: ${(value / 60 / 60).toFixed(2)}h`;
      });
    }
    return this.responseFromText(result);
  }
}

const timer = new TimerCommand();

export { timer };
