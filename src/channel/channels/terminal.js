import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { Channel } from "../Channel.js";
import { ERROR, Response, SUCCESS, WARNING } from "../../response/Response.js";

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
    this.instance.say(
      response.text,
      response.type === SUCCESS
        ? "🌳"
        : response.type === WARNING
        ? "🍂"
        : /* ERROR */ "🔥"
    );
  }
};

const terminal = new Terminal();

/* Capture errors, log them without crashing! */
process.on("uncaughtException", function (err) {
  terminal.executeOutput(
    new Response(err.message || "Messageless error", ERROR)
  );
});

export { terminal };
