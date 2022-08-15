type ValuesType<T> = T[keyof T];

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

type FactoryFunction<T> = (deps: Record<string, unknown> & any) => T;

type Constructor<T> = new (deps: Record<string, unknown> & any) => T;

type Value<T> = T;

type Resolver<T> = FactoryFunction<T> | Constructor<T> | Value<T>;

type ExtractDependenciesFromResolvers<Resolvers extends Resolver<unknown>> =
  UnionToIntersection<
    NonNullable<
      ValuesType<{
        [DependencyName in keyof Resolvers]: Resolvers[DependencyName] extends FactoryFunction<unknown>
          ? Parameters<Resolvers[DependencyName]>[0]
          : Resolvers[DependencyName] extends Constructor<unknown>
          ? ConstructorParameters<Resolvers[DependencyName]>[0]
          : Resolvers[DependencyName] extends Value<unknown>
          ? Record<never, unknown>
          : never;
      }>
    >
  >;

export const checkDependencies = <Resolvers extends Record<string, Resolver<unknown>>>(
  resolvers: {
    [DependencyName in keyof ExtractDependenciesFromResolvers<Resolvers>]: Resolver<
      ExtractDependenciesFromResolvers<Resolvers>[DependencyName]
    >;
  } & Resolvers
) => undefined;