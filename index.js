import { join } from "node:path";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "url";

import { instance } from "./src/instance.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const importCommands = async () => {
  const commandDirectory = join(__dirname, "src", "command", "commands");
  return Promise.all(
    readdirSync(commandDirectory).map((file) => {
      if (!file.endsWith("js")) {
        return new Promise((resolve) => resolve());
      }
      return import(join(commandDirectory, file));
    })
  );
};

const importChannels = async () => {
  const channelDirectory = join(__dirname, "src", "channel", "channels");
  const foo = Promise.all(
    readdirSync(channelDirectory).map((file) => {
      if (!file.endsWith("js")) {
        return new Promise((resolve) => resolve());
      }
      return import(join(channelDirectory, file));
    })
  );
  return foo;
};

Promise.all([importCommands(), importChannels()]).then(() => instance.sayHi());
