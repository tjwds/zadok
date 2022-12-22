import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

const getWeather = function resolveLocationToWeatherString(location) {
  return new Promise((resolve) => {
    fetch(`https://wttr.in/${location}?format=j1`)
      .then((res) => res.json())
      .then((res) =>
        resolve(
          `${location}: ${res.current_condition[0].weatherDesc[0].value}, ${res.current_condition[0].temp_C}°C (${res.current_condition[0].temp_F}°F)`
        )
      );
  });
};

class WeatherCommand extends Command {
  constructor() {
    super("weather");

    this.help = new HelpEntry("weather <place name>", "What's the weather?");
  }

  async input(input) {
    let location = input.textWithoutCommandName();
    let responseText = "";

    if (!location) {
      location = "Philadelphia";

      responseText += "I don't know where you are!\n";
    }

    return getWeather(location).then((res) =>
      this.responseFromText(responseText + res)
    );
  }
}

const weather = new WeatherCommand();

export { weather };
