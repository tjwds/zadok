import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { Channel } from "../Channel.js";

const Terminal = class Terminal extends Channel {
  constructor() {
    super("terminal");
  }

  watchInput() {
    const readlineInstance = createInterface({ input, output });

    readlineInstance.on("line", (line) => {
      this.parseInput(line);
    });
  }

  executeOutput(response) {
    this.instance.say(response.text);
  }
};

const terminal = new Terminal();

export { terminal };
