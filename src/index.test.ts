import { checkDependencies } from "./index";

// Setup

const makeA = () => ({
  x: 234234,
});

type A = ReturnType<typeof makeA>;

type BDeps = {
  a: A;
};

const makeB =
  ({ a }: BDeps) =>
  () => ({
    y: "asdasdas",
  });

type B = ReturnType<typeof makeB>;

type CDeps = {
  a: A;
  b: B;
};

const makeC =
  ({ a, b }: CDeps) =>
  () => ({
    z: true,
  });

type C = ReturnType<typeof makeC>;

type DDeps = {
  a: A;
  c: C;
};

class D {
  constructor({ a, c }: DDeps) {}
}

type EDeps = {
  val: number;
};

const makeE = ({ val }: EDeps) => null;

type F = () => { w: null };

type FDeps = {
  f: F;
};

const makeF =
  ({ f }: FDeps): F =>
  () => ({ w: null });

type GDeps = {
  h: H
}

const makeG = ({}: GDeps) => () => () => true;

type G = ReturnType<typeof makeG>

type HDeps = {
  g: G
};

const makeH = ({}: HDeps) => () => () => false

type H = ReturnType<typeof makeH>;

// Tests

// When we have a single service without any dependencies
() => {
  () => {
    // It passes the check
    checkDependencies({
      a: makeA,
    });
  };
};

// When we have a service that depends on another service
() => {
  // And we do not provide that service
  () => {
    // It fails the check
    () => {
      // @ts-expect-error
      checkDependencies({
        b: makeB,
      });
    };
  };

  // And we DO provide that service
  () => {
    // It passes the check
    () => {
      checkDependencies({
        a: makeA,
        b: makeB,
      });
    };
  };

  // And we DO provide that service but with
  // the wrong name
  () => {
    // It fails the check
    () => {
      //@ts-expect-error
      checkDependencies({
        aDep: makeA,
        b: makeB,
      });
    };
  };
};

// When we have a service that has more than one
// dependency
() => {
  // And we do not provide them
  () => {
    // It fails the check
    () => {
      //@ts-expect-error
      checkDependencies({
        c: makeC,
      });

      //@ts-expect-error
      checkDependencies({
        a: makeA,
        c: makeC,
      });

      //@ts-expect-error
      checkDependencies({
        b: makeB,
        c: makeC,
      });
    };
  };

  // And we provide all of them
  () => {
    // It passes the check
    () => {
      checkDependencies({
        a: makeA,
        b: makeB,
        c: makeC,
      });
    };
  };
};

// When a service is created using a class resolver
() => {
  // And some of its dependencies are missing
  () => {
    // It fails the check
    () => {
      //@ts-expect-error
      checkDependencies({
        d: D,
      });

      //@ts-expect-error
      checkDependencies({
        a: makeA,
        d: D,
      });
    };
  };

  // And all of its dependencies are provided
  () => {
    // It passes the check
    () => {
      checkDependencies({
        a: makeA,
        b: makeB,
        c: makeC,
        d: D,
      });
    };
  };
};

// When a service is provided using a value resolver
() => {
  // It passes the check
  () => {
    checkDependencies({
      val: 1234,
      e: makeE,
    });
  };
};

// When a service has a circular dependency on itself
() => {
  // It passes the check
  () => {
    checkDependencies({
      f: makeF,
    });
  };
};

// When a service has an indirect circular dependency 
() => {
  // And all dependencies are provided
  () => {
    // It passes the check
    () => {
      checkDependencies({
        g: makeG,
        h: makeH
      })
    }
  }

  // And NOT all dependencies are provided
  () => {
    // It fails the check
    () => {
      // @ts-expect-error
      checkDependencies({
        g: makeG,
      });

      // @ts-expect-error
      checkDependencies({
        h: makeH,
      });
    }
  }
}