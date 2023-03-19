const doneWords = [
  "done",
  "finish",
  "finished",
  "complete",
  "completed",
  "close",
];
const undoneWords = ["reopen", "undone"];
const statusWords = [...doneWords, ...undoneWords];

// TODO createWords
const setWords = ["set", "add", "is", "create", "new"];

export { doneWords, undoneWords, statusWords, setWords };
