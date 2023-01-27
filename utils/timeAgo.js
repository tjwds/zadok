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
  let isFuture = false;

  if (ago < 0) {
    ago = date - now;
    isFuture = true;
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
      return rtf.format(Math.floor(ago) * (isFuture ? 1 : -1), next[1]);
    }

    i++;
  }
};

export { timeAgo };
