import geoip from "geoip-lite";
import os from "os";

import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";
import config from "../../../config.js";

const formatWeather = (value) =>
  value
    .toLowerCase()
    .replace("mist", "misting")
    .replace("rain", "raining")
    .replace("fog", "foggy")
    .replace("light", "lightly")
    .replace("heavy", "heavily");

class NowCommand extends Command {
  constructor() {
    super("now");

    this.help = new HelpEntry("now", "Update your omglol now entry.");
  }

  async input() {
    const now = new Date();
    let nowText = "";

    const networkInterfaces = os.networkInterfaces();
    const location = Object.values(networkInterfaces)
      .flat()
      .map((networkInterface) => geoip.lookup(networkInterface.address))
      .filter(Boolean)[0];
    if (location) {
      nowText += `🌐 I'm in ${location.city}, ${location.region}, ${location.country}.  `;

      const res = await fetch(`https://wttr.in/${location.city}?format=j1`);
      const data = await res.json();

      const timeAsNumber = Number(
        `${now.getHours()}${String(now.getMinutes()).padStart(2, "0")}`
      );
      const nowWeather = data.weather[0].hourly
        .reverse()
        .find((x) => Number(x.time) < timeAsNumber);

      if (nowWeather) {
        nowText += `\n🌡️ It's ${formatWeather(
          nowWeather.weatherDesc[0].value
        )} and ${nowWeather.tempC}C.`;
      }
    }

    const lastFmRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${config.now.lastFmUsername}&api_key=${config.now.lastFmApiKey}&format=json&limit=1`
    );
    const lastFmJson = await lastFmRes.json();
    const lastTrack = lastFmJson.recenttracks.track[0];
    nowText += `\n\n🎧 I recently listened to "${lastTrack.name}" by ${lastTrack.artist["#text"]}.`;

    const whatpulseRes = await fetch(
      `https://api.whatpulse.org/user.php?user=${config.now.whatpulseUsername}&format=json`
    );
    const whatpulseJson = await whatpulseRes.json();

    const whatpulsePulses = await fetch(
      `https://api.whatpulse.org/pulses.php?user=${config.now.whatpulseUsername}&format=json`
    );
    const whatpulsePulsesJson = await whatpulsePulses.json();

    let last24Hours = { keys: 0, clicks: 0 };
    let last7Days = { keys: 0, clicks: 0 };

    const twentyFourHoursInMilliseconds = 1000 * 60 * 60 * 24;
    const sevenDaysInMilliseconds = twentyFourHoursInMilliseconds * 7;

    Object.values(whatpulsePulsesJson).forEach((pulse) => {
      const pulseTime = new Date(pulse.Timedate + "Z");
      const timeDistance = now - pulseTime;
      if (timeDistance < sevenDaysInMilliseconds) {
        const keys = Number(pulse.Keys);
        const clicks = Number(pulse.Clicks);

        last7Days.keys += keys;
        last7Days.clicks += clicks;

        if (timeDistance < twentyFourHoursInMilliseconds) {
          last24Hours.keys += keys;
          last24Hours.clicks += clicks;
        }
      }
    });

    nowText += `\n\n⌨️ I've typed ${last24Hours.keys.toLocaleString()} keys and clicked ${last24Hours.clicks.toLocaleString()} times in the last 24 hours.  \nI've typed ${last7Days.keys.toLocaleString()} keys and clicked ${last7Days.clicks.toLocaleString()} times in the last 7 days.  \nI've typed ${Number(
      whatpulseJson.Keys
    ).toLocaleString()} keys and clicked ${Number(
      whatpulseJson.Clicks
    ).toLocaleString()} times total.`;

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
      nowText += `\n\n📓 My latest blog post: [${latestPost.title.rendered}](${latestPost.link})  `;
    }
    if (latestRoundup) {
      nowText += `\n🤠 My latest roundup: [${latestRoundup.title.rendered}](${latestRoundup.link})`;
    }

    const mastodonRes = await fetch(config.now.mastodonApiUrl);
    const toots = await mastodonRes.json();
    const latestToot = toots.find((toot) => toot.visibility !== "unlisted");
    nowText += `\n\n🐘 My latest toot:  \n${latestToot.content
      .replaceAll("</p><p>", "\n\n")
      .replaceAll(/<[^>]*>/g, "")}  \n[link](${latestToot.url})`;

    // mood?
    // reading

    nowText += `\n\n🌳 Generated with [Zadok](https://github.com/tjwds/zadok) on ${now.toLocaleString(
      "en-US",
      {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "long",
        day: "numeric",
        year: "numeric",
        ordinal: "numeric",
      }
    )}.`;

    await fetch(`https://api.omg.lol/address/${config.now.omglolAccount}/now`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.now.omglolApiKey}`,
      },
      body: JSON.stringify({
        content: `<div style="text-align: left;">${nowText.replaceAll(
          "  ",
          "<br />"
        )}</div>`,
        listed: "1",
      }),
    });

    return this.responseFromText(nowText);
  }
}

const now = new NowCommand();

export { now };
