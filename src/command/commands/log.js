import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

class LogCommand extends Command {
  constructor() {
    super("log");

    this.help = new HelpEntry(
      "log <target log> <...value>",
      `Log something in an arbitrary log.`
    );
  }

  async input(input) {
    const prisma = this.instance.source.prisma;

    const [, /* command */ type /* ...value */] = input.words;
    const value = input.words.slice(2).join(" ");
    if (type && value) {
      await prisma.logEntry.create({
        data: {
          type,
          value,
        },
      });
      return this.responseFromText(
        `Cool, I added to the ${type} log:  ${value}.`
      );
    }
  }
  // TODO add retrieving items from the log
}

const log = new LogCommand();

export { log };
