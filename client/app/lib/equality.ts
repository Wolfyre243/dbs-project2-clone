export default function deepEqualArray(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every(
    (item, idx) => JSON.stringify(item) === JSON.stringify(b[idx]),
  );
}
