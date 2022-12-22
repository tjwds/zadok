import { Command } from "../Command.js";
import { HelpEntry } from "../HelpEntry.js";

class TranslateCommand extends Command {
  constructor() {
    super("translate");

    this.help = new HelpEntry(
      "translate",
      "Translate an arbitrary string into English."
    );
  }

  async input(input) {
    // TODO from X to X
    const sourceLang = "auto";
    const targetLang = "en";

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURI(
      input.textWithoutCommandName()
    )}`;

    return fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const response = json[0][0][0];
        if (!response) {
          throw new Error();
        }
        // TODO it would be nice to go from language code to full language name,
        // then say that here.
        return this.responseFromText(`That's: ${response}`);
      })
      .catch(() => this.responseFromText("Hmm, something went wrong, sorry!"));
  }
}

const translate = new TranslateCommand();

export { translate };
