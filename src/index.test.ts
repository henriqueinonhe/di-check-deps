import { checkDependencies } from "./index";

const makeA = () => ({
  x: 10,
});

type A = ReturnType<typeof makeA>;

const makeB = ({ a }: { a: A }) => ({
  y: "Duba",
});

type B = ReturnType<typeof makeB>;

const makeC = ({ b }: { b: B }) => ({
  z: true,
});

class D {
  constructor({ a }: { a: A }) {}
}

const makeE = ({ val }: { val: number }) => undefined;

checkDependencies({
  a: makeA,
  b: makeB,
  c: makeC,
});

checkDependencies({
  b: makeB,
});

checkDependencies({
  c: makeC,
});

checkDependencies({
  b: makeB,
  c: makeC,
});

checkDependencies({
  a: () => "1",
  b: makeB,
  c: makeC,
});

checkDependencies({
  d: D,
});

checkDependencies({
  val: 234234,
  e: makeE,
});
