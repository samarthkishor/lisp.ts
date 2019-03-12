// Declare basic Lisp types

type Sym = string;
type Num = number;
type Atom = Sym | Num;
type List = any[];
type Expression = Atom | List;

// Parsing

/**
 * Converts a string into a list of tokens
 */
function tokenize(chars: string): List {
  return chars
    .replace("(", " ( ")
    .replace(")", " ) ")
    .split(" ");
}

/**
 * Read a Lisp expression from a string
 */
function parse(program: string): Expression {
  return readFromTokens(tokenize(program));
}

/**
 * Read an expression from a sequence of tokens
 */
function readFromTokens(tokens: List): Expression {
  if (tokens.length === 0) {
    throw new SyntaxError("Error: unexpected EOF");
  }
  const token: Atom = tokens.shift();
  if (token === "(") {
    let list: List = [];
    while (tokens[0] !== ")") {
      list.push(readFromTokens(tokens));
    }
    tokens.shift();
    return list;
  } else if (token === ")") {
    throw new SyntaxError("Error: unexpected )");
  } else {
    return atomize(token);
  }
}

/**
 * Numbers become numbers
 * Every other token is a symbol
 */
function atomize(token: any): Atom {
  return Number(token) === NaN ? token as Sym : Number(token);
}

// Environments

function sum(x: number) {
  const v = (n: number) => sum(x + n);
  v.valueOf = () => x;
  return v;
}

/**
 * Creates an environment with some standard procedures
 */
function standardEnvironment() {
  return {
    "+": (...args: number[]) => args.reduce((acc, val) => acc + val),
    "-": (...args: number[]) => args.reduce((acc, val) => acc - val),
    "*": (...args: number[]) => args.reduce((acc, val) => acc * val),
    "/": (...args: number[]) => args.reduce((acc, val) => acc / val),
    ">": (x: number) => x > x,
    "<": (x: number) => x < x,
    ">=": (x: number) => x >= x,
    "<=": (x: number) => x <= x,
    "=": (x: number) => x === x,
    abs: (x: number) => Math.abs(x),
    apply: (proc: any, args: any) => proc(...args),
    car: (x: List) => x[0],
    cdr: (x: List) => x.shift(),
    cons: (x: Expression, y: List) => y.unshift(x),
    "eq?": (x: any, y: any) => x == y,
    "equal?": (x: any, y: any) => x === y,
    length: (x: List) => x.length,
    list: (x: any) => new Array(x),
    "list?": (x: any) => x.isArray(),
    // "map":     (...args: any[]) => [].map()
    not: (x: any) => !x,
    "null?": (x: any) => x === undefined || x === null
    //     "number?": (x: any) => typeof x === "Num",
    //     "symbol?": (x: any) => typeof x === "Sym"
  };
}

const globalEnv = standardEnvironment();

// Evaluation

function isSym(x: any): x is Sym {
  return (x as Sym) !== undefined;
}

function isNum(x: any): x is Num {
  return (x as Num) !== undefined;
}

function isList(x: any): x is List {
  return (x as List) !== undefined;
}

/**
 * Evaluates an expression in an environment
 */
function evaluate(x: Expression, env = globalEnv): Expression {
  if (isNum(x)) {
    // console.log("num");
    return x;
  } else if (isSym(x)) {
    // console.log("sym");
    console.log(env[x]);
    return env[x];
  } else if (x[0] === "if") {
    const test = x[1];
    const consequence = x[2];
    const alternate = x[3];
    let expression: Expression;
    if (evaluate(test, env)) {
      expression = consequence;
    } else {
      expression = alternate;
    }
    return evaluate(expression, env);
  } else if (x[0] === "define") {
    const symbol = x[1];
    const expression = x[2];
    env[symbol] = evaluate(expression, env);
  } else {
    const procedure = () => evaluate(x[0], env);
    const args: Expression[] = x.slice(0).map(arg => evaluate(arg, env));
    return procedure.apply(null, args);
  }
}

// REPL

/**
 * A rudimentary Lisp repl
 */
function repl() {
  const stdin: any = process.openStdin();
  process.stdout.write("lisp.ts> ");
  stdin.addListener("data", (d: any) => {
    process.stdout.write("lisp.ts> ");
    const data = evaluate(parse(d.toString().trim()));
    if (data !== undefined) {
      console.log(stringify(data));
    }
  });
}

/**
 * Convert an object into a Lisp-readable string
 */
function stringify(exp: Expression): string {
  if (isList(exp)) {
    return "(" + exp.map(e => stringify(e)).join(" ") + ")";
  } else {
    return exp.toString();
  }
}

console.log(evaluate(parse("(begin (define r 10) (* 5 (* r r)))")));
console.log(evaluate(parse("(+ 10 3 2)")));
