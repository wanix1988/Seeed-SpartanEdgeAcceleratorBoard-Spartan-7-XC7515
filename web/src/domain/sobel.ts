export function sobelMagnitude(gray: Uint8Array, width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gx =
        -gray[index - width - 1] +
        gray[index - width + 1] -
        2 * gray[index - 1] +
        2 * gray[index + 1] -
        gray[index + width - 1] +
        gray[index + width + 1];
      const gy =
        -gray[index - width - 1] -
        2 * gray[index - width] -
        gray[index - width + 1] +
        gray[index + width - 1] +
        2 * gray[index + width] +
        gray[index + width + 1];
      out[index] = Math.min(255, Math.hypot(gx, gy));
    }
  }
  return out;
}

export function rectangleScene(width: number, height: number): Uint8Array {
  const gray = new Uint8Array(width * height);
  gray.fill(24);
  const x0 = Math.floor(width * 0.28);
  const x1 = Math.floor(width * 0.72);
  const y0 = Math.floor(height * 0.22);
  const y1 = Math.floor(height * 0.78);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) gray[y * width + x] = 210;
  }
  return gray;
}
