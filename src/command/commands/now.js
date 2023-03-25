import geoip from "geoip-lite";
import os from "os";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

class NowCommand extends Command {
  constructor() {
    super("now");

    this.help = new HelpEntry("now", "Update your omglol now entry.");
  }

  async input() {
    const networkInterfaces = os.networkInterfaces();
    const location = Object.values(networkInterfaces)
      .flat()
      .map((networkInterface) => geoip.lookup(networkInterface.address))
      .filter(Boolean)[0];
    if (location) {
      console.log(
        `I'm in ${location.city}, ${location.region}, ${location.country}.`
      );

      const res = await fetch(`https://wttr.in/${location.city}?format=j1`);
      const data = await res.json();

      const now = new Date();

      const timeAsNumber = Number(
        `${now.getHours()}${String(now.getMinutes()).padStart(2, "0")}`
      );
      const nowWeather = data.weather[0].hourly
        .reverse()
        .find((x) => Number(x.time) < timeAsNumber);

      if (nowWeather) {
        console.log(
          `It's ${nowWeather.weatherDesc[0].value.toLowerCase()} and ${
            nowWeather.tempC
          }C.`
        );
      }
    }

    // last.fm
    // last roundup article

    // whatpulse

    // last blog post
    // last toot

    // mood?
    // reading
  }
}

const now = new NowCommand();

export { now };
