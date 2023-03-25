import geoip from "geoip-lite";
import os from "os";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";
import config from "../../../config.js";

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

    const lastFmRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${config.now.lastFmUsername}&api_key=${config.now.lastFmApiKey}&format=json&limit=1`
    );
    const lastFmJson = await lastFmRes.json();
    const lastTrack = lastFmJson.recenttracks.track[0];
    console.log(
      `I recently listened to "${lastTrack.name}" by ${lastTrack.artist["#text"]}.`
    );

    // whatpulse

    const wpRes = await fetch(
      `${config.now.blogUrl}/wp-json/wp/v2/posts?_embed&per_page=10`
    );
    const wpData = await wpRes.json();

    let latestRoundup;
    let latestPost;
    for (let i = 0; (!latestRoundup || !latestPost) && i < wpData.length; i++) {
      const post = wpData[i];
      const isRoundup = post.categories.includes(2);
      if (isRoundup) {
        if (!latestRoundup) {
          latestRoundup = post;
        }
      } else {
        if (!latestPost) {
          latestPost = post;
        }
      }
    }

    if (latestPost) {
      console.log(
        `My latest blog post: [${latestPost.title.rendered}](${latestPost.link})`
      );
    }
    if (latestRoundup) {
      console.log(
        `My latest roundup: [${latestRoundup.title.rendered}](${latestRoundup.link})`
      );
    }

    // last toot

    // mood?
    // reading
  }
}

const now = new NowCommand();

export { now };
