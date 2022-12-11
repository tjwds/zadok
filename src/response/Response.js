const SUCCESS = Symbol();
const WARNING = Symbol();
const ERROR = Symbol();

const Response = class {
  constructor(text = "", type = SUCCESS) {
    this.text = text;
    this.type = type;
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
