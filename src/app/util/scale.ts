
// Loop through the x and y coordinates of a vertex array, find the upper and lower bounds,
// and calculate a reasonable scale factor for the viewport.
export function getRecommendedScale(vertices: Float32Array): number {
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;

  for (let idx = 0; idx < vertices.length; idx += 3) {
    const x = vertices[idx];
    const y = vertices[idx + 1];
    if (x > xMax) {
      xMax = x;
    } else if (x < xMin) {
      xMin = x;
    }
    if (y > yMax) {
      yMax = y;
    } else if (y < yMin) {
      yMin = y;
    }
  }
  const boundX = Math.abs(xMax - xMin);
  const boundY = Math.abs(yMax - yMin);
  const scaleX = 1 / boundX;
  const scaleY = 1 / boundY;

  let scale = scaleY;
  if (scaleX > scaleY) {
    scale = scaleX;
  }
  console.log(`Scale: ${scale}`);
  return scale;
}
