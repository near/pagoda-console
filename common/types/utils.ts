export type Flavored<
  T extends string,
  R extends string | number = string,
> = R & {
  __flavor?: T;
};

export const flavored = <T extends string, R extends string | number>(
  x: R,
): x is Flavored<T, R> => true;
