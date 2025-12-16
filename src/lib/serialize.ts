/**
 * Utility function to serialize objects containing BigInt values
 * Converts BigInt values to numbers for JSON serialization
 */
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return value;
  }));
}