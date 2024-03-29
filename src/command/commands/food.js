/*

TODO

This plugin is worse than the minimum viable plugin, but I hope to improve it
over time.

To generate the data for this plugin, visit overpass-turbo — e.g.
http://overpass-turbo.eu/s/1oVP — and export the resulting GeoJSON.

utils/averageFood.js will give each of those entries a "center" geometry point,
which can be used to calculate the distance from your current location.

I'm not even going to bother documenting the tags I've been manually adding,
since they're subject to change when I turn this into a database anyway.

*/

import { Command } from "../Command.js";
import { default as config } from "../../../config.js";
import { HelpEntry } from "../HelpEntry.js";

import haversine from "haversine-distance";

import foodDict from "../../../food.json" assert { type: "json" };

const foodFeatures = foodDict.features.filter(
  (feature) =>
    !feature.tags?.ban && !feature.tags?.uninterested && !feature.tags?.closed
);

// TODO this is currently static, but it could end up being dynamic
const location = config.location;

const locationToLine = (location) => {
  const { name, website } = location.properties;
  let line = name;
  if (website) {
    line = `[${line}](${website})`;
  }
  const distance = Math.round(location.geometry.distance * 100) / 100;
  line += ` (${distance}km)`;
  const veganness = location.properties["diet:vegan"];
  if (veganness === "yes") {
    line += " (they've got vegan food!)";
  }
  if (veganness === "only") {
    line += " (they're a vegan place!)";
  }
  return line;
};

class FoodCommand extends Command {
  constructor() {
    super("food");

    this.help = new HelpEntry("food", "What's for lunch and/or dinner?")
      .addSubEntry("genre", "List some genres of food near you")
      .addSubEntry("new", "Only show places you haven't been");
  }

  async input(input) {
    const { words } = input;
    const text = input.textWithoutCommandName();
    if (["genre", "genres", "cuisine", "cuisines"].includes(text)) {
      const cuisines = new Set();
      foodFeatures.forEach((feature) => {
        const cuisineList = feature.properties.cuisine;
        if (cuisineList) {
          cuisineList.split(";").forEach((cuisine) => {
            cuisines.add(cuisine);
          });
        }
      });
      return this.responseFromText(Array.from(cuisines).sort().join(", "));
    }
    // TODO
    const response = [`I'm assuming you're in ${location.name}.`, ""];
    let foodArr = foodFeatures.filter((item) => item.properties.name);

    if (input.words.includes("new")) {
      foodArr = foodArr.filter((feature) => !feature.tags?.visited);
    }

    foodArr.forEach((feature) => {
      const center = feature.geometry.center;
      feature.geometry.distance =
        haversine(location, {
          lng: center[0],
          lat: center[1],
        }) / 1000;
    });
    foodArr.sort((a, b) => a.geometry.distance - b.geometry.distance);

    const number = Number(
      words.find((word) => !Number.isNaN(Number(word))) || 10
    );

    for (let i = 0; i < number; i++) {
      response.push(`${i + 1}. ${locationToLine(foodArr[i])}`);
    }

    return this.responseFromText(response.join("\n"));
  }
}

const food = new FoodCommand();

export { food };
