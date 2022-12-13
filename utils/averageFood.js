import food from "../food.json" assert { type: "json" };

if (food.features[0].geometry.center) {
  throw new Error("This file has already been processed!  good job.");
}

food.features.forEach((feature) => {
  let { coordinates } = feature.geometry;

  if (coordinates) {
    if (typeof coordinates[0][0] === "object") {
      coordinates = coordinates[0];
    }
    if (typeof coordinates[0] === "number") {
      coordinates = [coordinates];
    }
    feature.geometry.center = coordinates
      .reduce(
        ([before1, before2], [coordinate1, coordinate2]) => [
          before1 + Number(coordinate1),
          before2 + Number(coordinate2),
        ],
        [0, 0]
      )
      .map((coordinate) => coordinate / coordinates.length);
  }
});

console.log(JSON.stringify(food));
