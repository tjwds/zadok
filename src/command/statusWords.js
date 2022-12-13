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

export { doneWords, undoneWords, statusWords };
