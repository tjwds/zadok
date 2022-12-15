const doneWords = [
  "done",
  "finish",
  "finished",
  "complete",
  "completed",
  "close",
];
const undoneWords = ["reopen"];
const statusWords = [...doneWords, ...undoneWords];

const setWords = ["set", "add", "is", "create", "new"];

export { doneWords, undoneWords, statusWords, setWords };
