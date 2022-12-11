const SUCCESS = Symbol();
const WARNING = Symbol();
const ERROR = Symbol();

const Response = class {
  constructor(text = "") {
    this.text = text;
    this.type = SUCCESS;
  }

  isSuccess() {
    return this.type === SUCCESS;
  }

  isWarning() {
    return this.type === WARNING;
  }

  isError() {
    return this.type === ERROR;
  }
};

export { Response, SUCCESS, WARNING, ERROR };
