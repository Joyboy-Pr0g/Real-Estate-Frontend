type FieldEquals<T, K extends keyof T> = (next: T[K], original: T[K]) => boolean;

type FieldEqualsMap<T> = Partial<{ [K in keyof T]: FieldEquals<T, K> }>;

export function buildPartialUpdate<T extends object>(
  next: T,
  original: T,
  equals?: FieldEqualsMap<T>,
): Partial<T> {
  const patch = {} as Partial<T>;

  for (const key of Object.keys(next) as (keyof T)[]) {
    const nextValue = next[key];
    const originalValue = original[key];
    const isEqual = equals?.[key]
      ? equals[key]!(nextValue, originalValue)
      : nextValue === originalValue;

    if (!isEqual) {
      patch[key] = nextValue;
    }
  }

  return patch;
}

export function hasPartialChanges<T extends object>(patch: Partial<T>): boolean {
  return Object.keys(patch).length > 0;
}
