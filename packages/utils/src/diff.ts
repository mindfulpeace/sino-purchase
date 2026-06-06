export type DiffId = { id: number };
export type DiffBody = { [key in Exclude<string, "id">]: any };
export type DiffRow<B extends DiffBody> = DiffId & B;
export interface DiffResult<B extends DiffBody> {
  added: DiffRow<B>[];
  modified: (DiffId & Partial<B>)[];
  deleted: DiffId["id"][];
}

export const calculateDiff = <B extends DiffBody>(originalData: DiffRow<B>[], currentData: DiffRow<B>[]): DiffResult<B> => {
  if (!originalData || !currentData) {
    return { added: [], modified: [], deleted: [] };
  }

  const originalMap = new Map(originalData.map((item) => [item.id, item]));
  const currentMap = new Map(currentData.map((item) => [item.id, item]));

  const added = currentData.filter((item) => !originalMap.has(item.id));

  const deleted = originalData.filter((item) => !currentMap.has(item.id)).map((item) => item.id);

  const modified = currentData
    .filter((currentItem) => {
      const originalItem = originalMap.get(currentItem.id);
      if (!originalItem) return false;

      const keys = new Set([...Object.keys(currentItem), ...Object.keys(originalItem)]);
      for (const key of Array.from(keys)) {
        if (key === "id") continue;
        if (currentItem[key] !== originalItem[key]) {
          return true;
        }
      }
      return false;
    })
    .map((item) => {
      const originalItem = originalMap.get(item.id)!;
      const changes: Partial<B> = {};

      const keys = new Set([...Object.keys(item), ...Object.keys(originalItem)]);
      for (const key of Array.from(keys)) {
        if (key === "id") continue;
        if (item[key] !== originalItem[key]) {
          (changes as any)[key] = item[key];
        }
      }

      return { id: item.id, ...changes };
    });

  return { added, modified, deleted };
};
