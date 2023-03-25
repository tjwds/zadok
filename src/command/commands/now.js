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

      const now = new Date();

      const timeAsNumber = Number(
        `${now.getHours()}${String(now.getMinutes()).padStart(2, "0")}`
      );
      const nowWeather = data.weather[0].hourly
        .reverse()
        .find((x) => Number(x.time) < timeAsNumber);

      if (nowWeather) {
        nowText += `\n🌡️ It's ${nowWeather.weatherDesc[0].value.toLowerCase()} and ${
          nowWeather.tempC
        }C.`;
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
    // TODO maybe higher-fidelity data here would be nice.
    nowText += `\n\n⌨️ I've typed ${whatpulseJson.Keys} keys and clicked ${whatpulseJson.Clicks} times.`;

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

    nowText += "\n\n🌳 Generated with [Zadok](https://github.com/tjwds/zadok)";

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
