const Input = class {
  constructor({ fullMessage, words, commandName, channel, extra }) {
    this.fullMessage = fullMessage;
    this.words = words;
    this.commandName = commandName;
    this.channel = channel;
    this.extra = extra;
  }

  textWithoutCommandName() {
    return this.words.slice(1).join(" ");
  }
};

export { Input };
