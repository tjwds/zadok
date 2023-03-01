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
    const start = new Date(today);
    start.setDate(today.getDate() - 2);
    const end = new Date(today);
    end.setDate(today.getDate() + 2);

    const req = await fetch(
      // TODO parameterize
      `http://localhost:5600/api/0/buckets/aw-stopwatch/events?end=${end.getFullYear()}-${String(
        end.getMonth() + 1
      ).padStart(2, "0")}-${String(end.getDate()).padStart(
        2,
        "0"
      )}&start=${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(start.getDate()).padStart(2, "0")}&limit=200`,
      { accept: "application/json" }
    );
    const items = await req.json();

    const tagsToSeconds = new Map();
    let workedSeconds = 0;
    items.forEach((item) => {
      const { duration, timestamp } = item;
      const dateDelta = new Date(timestamp) - today;

      if (dateDelta < 0 || dateDelta > 1000 * 60 * 60 * 24) {
        return;
      }

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
