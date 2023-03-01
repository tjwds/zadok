import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

const tagRegex = /#[a-zA-Z0-9-]+/g;
const peopleRegex = /@[a-zA-Z0-9]+/g;

class TimerCommand extends Command {
  constructor() {
    super("timer");

    this.help = new HelpEntry(
      "timer",
      "Get information about ActivityWatch stopwatch."
    );
  }

  async input(input) {
    const { words } = input;
    const forWeek = words.includes("--week");

    // TODO add more filtering/reporting
    const today = this.instance.source.today;
    const start = new Date(today);
    start.setDate(today.getDate() - (forWeek ? 9 : 2));
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
      )}-${String(start.getDate()).padStart(2, "0")}&limit=1000`,
      { accept: "application/json" }
    );
    const items = await req.json();

    const filteredWords = words.filter((word) => !word.startsWith("--"));
    const buildReport = filteredWords[1] === "report";
    const keyword = filteredWords[2];

    const tagsToSeconds = new Map();
    const peopleToSeconds = new Map();
    let workedSeconds = 0;
    let reportItemToSeconds = new Map();

    let dateToCheck = new Date(today);
    if (forWeek) {
      dateToCheck.setDate(today.getDate() - 1);
    }

    items.forEach((item) => {
      const { duration, timestamp } = item;
      const dateDelta = new Date(timestamp) - dateToCheck;

      if (
        dateDelta < 0 ||
        dateDelta > 1000 * 60 * 60 * 24 * (forWeek ? 7 : 1)
      ) {
        return;
      }

      workedSeconds += duration;
      const tags = item.data.label.match(tagRegex);
      if (tags) {
        tags.forEach((tag) => {
          tagsToSeconds.set(tag, (tagsToSeconds.get(tag) || 0) + duration);
          if (buildReport && `#${keyword}` === tag) {
            reportItemToSeconds.set(
              item.data.label,
              (reportItemToSeconds.get(item.data.label) || 0) + duration
            );
          }
        });
      } else {
        tagsToSeconds.set(
          "No label",
          (tagsToSeconds.get("No label") || 0) + duration
        );
      }

      const people = item.data.label.match(peopleRegex);
      if (people) {
        people.forEach((person) => {
          peopleToSeconds.set(
            person,
            (peopleToSeconds.get(person) || 0) + duration
          );

          if (buildReport && `@${keyword}` === person) {
            reportItemToSeconds.set(
              item.data.label,
              (reportItemToSeconds.get(item.data.label) || 0) + duration
            );
          }
        });
      }
    });

    let result = `You've worked ${(workedSeconds / 60 / 60).toFixed(2)} hours ${
      forWeek ? "this week" : "today"
    }.`;
    [
      [tagsToSeconds, "Labels"],
      [peopleToSeconds, "With these people"],
      [reportItemToSeconds, `Report for ${keyword}`, true],
    ].forEach(([collection, collectionName, reportOrdering]) => {
      if (collection.size) {
        result += `\n---\n${collectionName}:`;
        collection.forEach((value, key) => {
          result += "\n";
          result += reportOrdering
            ? `${(value / 60 / 60).toFixed(2)}h\t${key}`
            : `${key}: ${(value / 60 / 60).toFixed(2)}h`;
        });
      }
    });
    return this.responseFromText(result);
  }
}

const timer = new TimerCommand();

export { timer };
