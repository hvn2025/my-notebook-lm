export function toPgVectorLiteral(
  embedding: number[],
  expectedDimensions: number,
) {
  if (embedding.length !== expectedDimensions) {
    throw new Error(
      `Expected ${expectedDimensions} embedding values, received ${embedding.length}`,
    );
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("Embedding contains a non-finite value");
  }

  return `[${embedding.join(",")}]`;
}
