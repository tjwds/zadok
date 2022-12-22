import { Command } from "../Command.js";

const HelpCommand = class extends Command {
  constructor() {
    super("help");
  }

  input(input) {
    const subHelp = input.words[1];
    if (subHelp) {
      const forWhich = this.instance.commands[subHelp];
      if (forWhich) {
        const help = forWhich.help;
        if (help) {
          return this.responseFromText(help.formatHelp(true));
        }
      }
    }

    const text = Object.values(this.instance.commands).reduce(
      (before, command) => {
        const help = command.help;
        if (!help) {
          return before;
        }
        return before + help.formatHelp();
      },
      ""
    );

    return this.responseFromText(text);
  }
};

const helpCommand = new HelpCommand();

export { helpCommand };
