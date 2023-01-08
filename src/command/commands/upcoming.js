import { default as config } from "../../../config.js";
import { asciiCalendar } from "../../../utils/calendar/asciiCalendar.js";
import { getAndParseIcs } from "../../../utils/calendar/getAndParseIcs.js";

import { Command } from "../Command.js";

const UpcomingCommand = class extends Command {
  constructor() {
    super("upcoming", !!config.calendars.length);
  }

  async input() {
    const events = Array.prototype.concat(
      ...(await Promise.all(config.calendars.map(getAndParseIcs)))
    );

    return this.responseFromText("\n" + asciiCalendar({ events }));
  }
};

const upcoming = new UpcomingCommand();

export { upcoming };
