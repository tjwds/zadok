import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

import config from "../../../config.js";

const rouletteCache = {};

class RouletteCommand extends Command {
  constructor() {
    super("roulette");

    this.help = new HelpEntry(
      "roulette <type>",
      "Choose a random value from a predefined set in your config file."
    );
  }

  input(input) {
    const type = input.words[1];
    const target = config.roulette[type];

    if (!type || !target) {
      return;
    }

    let targetArray = rouletteCache[type];
    if (!targetArray) {
      targetArray = [];

      // this is silly, but it works.
      Object.entries(target).forEach(([key, num]) => {
        for (let i = 0; i < num; i++) {
          targetArray.push(key);
        }
      });

      rouletteCache[type] = targetArray;
    }

    const resultNum = Math.floor(Math.random() * targetArray.length);
    const result = targetArray[resultNum];

    const probability = ((target[result] / targetArray.length) * 100).toFixed(
      2
    );

    return this.responseFromText(
      `Rolled a ${resultNum} on the ${type}-roulette ${targetArray.length}-sided die. This indicates that "${result}" is the winner, which had a ${probability}% chance of happening.`
    );
  }
}

const rouletteCommand = new RouletteCommand();

export { rouletteCommand };
