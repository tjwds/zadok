const asciiChart = function (data) {
  // TODO make configurable
  let height = 20;
  let width = 79;

  let verticalJump = 1;
  // TODO also add horizontal jump

  if (!data.length) {
    return "No data.";
  }
  if (data.length > width) {
    throw new Error(`For now, the number of columns must not exceed ${width}.`);
  }
  width = data.length;

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    if (value > max) {
      max = value;
    }
    if (value < min) {
      min = value;
    }
  }

  const distance = max - min;
  if (distance > height) {
    verticalJump = Math.ceil(distance / height);
  } else {
    height = distance;
  }

  const entries = new Set();

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const thisHeight = Math.ceil((value - min) / verticalJump);

    entries.add(`${thisHeight}#${i}`);
  }

  let string = "";
  for (let y = height; y >= 0; y--) {
    const realY = Math.floor((min + y * verticalJump) / verticalJump);
    for (let x = 0; x <= width; x++) {
      if (x === 0) {
        string += "|";
      } else if (entries.has(`${y}#${x - 1}`)) {
        string += "o";
      } else if (realY === 0) {
        string += "-";
      } else {
        string += " ";
      }
    }
    string += "\n";
  }

  return string;
};

export { asciiChart };
