import config from "../../../config.js";
import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

import { execSync } from "child_process";

const { backupCommand: backupShellCommand } = config;

class BackupCommand extends Command {
  constructor() {
    super("backup");

    this.help = new HelpEntry(
      "backup",
      `Runs pre-defined command to back up Zadok's database.`
    );
  }

  shouldRegister() {
    return !!backupShellCommand;
  }

  async input() {
    const response = execSync(backupShellCommand);
    return this.responseFromText(response);
  }
}

const backupCommand = new BackupCommand();

export { backupCommand };
