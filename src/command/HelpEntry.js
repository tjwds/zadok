const HelpEntry = class {
  constructor(name, description) {
    this.description = description;
    this.name = name;
    this.subEntries = {};
  }

  addSubEntry(name, description) {
    this.subEntries[name] = description;

    return this;
  }

  formatHelp(more) {
    const moreEntries = Object.entries(this.subEntries);

    let text = `${this.name}${moreEntries.length ? " …" : ""}\n\t${
      this.description
    }\n`;
    if (more) {
      moreEntries.forEach(([name, description]) => {
        text += `${name}\n\t${description}\n`;
      });
    }

    return text;
  }
};

export { HelpEntry };
