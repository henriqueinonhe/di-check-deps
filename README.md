# DI Check Deps

Type utility to check whether we didn't forget any factories/resolvers when using Dependency Injection, especially when using automatic DI containers, that usually don't check for missing dependencies in compile time.

Example:

```ts
import { checkDependencies } from "di-check-deps";

const makeA = () => ({
  x: 234234,
});

type A = ReturnType<typeof makeA>;

type BDeps = {
  a: A;
};

// B is a service that 
// depends on `a`
const makeB =
  ({ a }: BDeps) =>
  () => ({
    y: "asdasdas",
  });

type B = ReturnType<typeof makeB>;

const dependenciesResolvers = {
  // Oops, we forgot `a`'s resolver!
  b: makeB
};

/**
 * TS Error!
 * Argument of type 
 * '{
 *    b: ({ a }: BDeps) => () => { y: string; }; 
 *  }' is not assignable to parameter of type 
 * '{ 
 *    a: 
 *      Resolver<{ x: number; }>; } & 
 *      { b: ({ a }: BDeps) => () => { y: string; }; 
 *  }'.
 * Property 'a' is missing in type 
 * '{ 
 *    b: ({ a }: BDeps) => () => { y: string; }; 
 *  }' but required in type 
 * '{ 
 *    a: Resolver<{ x: number; }>; 
 *  }'.ts(2345)
 */
checkDependencies(dependenciesResolvers);

// Some function that creates our container
// automatically from resolvers
createContainer(dependenciesResolvers);
```

## Usage

This lib exports a single `checkDependencies` function that you can use to check whether you're missing some dependency.

```ts
import { checkDependencies } from "di-check-deps";

const dependenciesResolvers = {
  depA: makeDepA, //Factory Function
  depB: DepB, //Class
  someValue: 234234 //Value
};

checkDependencies(dependenciesResolvers);
```

`checkDependencies` does **absolutely nothing** in runtime (it returns `undefined`) and if you use a bundler/terser/minifier it's likely that it'll get stripped out from bundled code.

If you're missing some dependency, `checkDependencies` will raise a type error telling you which dependencies you are missing and what their types are.

## Features

`di-check-deps` handles:

- Factory function resolvers
- Class resolvers
- "Pure" value resolvers
- Cyclic dependencies
