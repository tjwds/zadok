const rtf = new Intl.RelativeTimeFormat("en", { style: "narrow" });

const operations = [
  [1000, "seconds"],
  [60, "minutes"],
  [60, "hours"],
  [24, "days"],
  [7, "weeks"],
  [30.5, "months"],
  [12, "years"],
];

const timeAgo = function (date) {
  const now = new Date();
  let ago = now - date;

  if (ago < 0) {
    return "in the future";
  }
  if (ago < 1000) {
    return "now";
  }

  let i = 0;
  while (true) {
    const next = operations[i];
    ago = ago / next[0];

    const nextOp = operations[i + 1];
    if (!nextOp || ago < nextOp[0]) {
      return rtf.format(Math.floor(-ago), next[1]);
    }

    i++;
  }
};

export { timeAgo };
