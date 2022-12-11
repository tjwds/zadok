const Input = class {
  constructor({ fullMessage, words, commandName, channel }) {
    this.fullMessage = fullMessage;
    this.words = words;
    this.commandName = commandName;
    this.channel = channel;
  }
};

export { Input };
