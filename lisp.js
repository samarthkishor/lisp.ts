// Declare basic Lisp types
// Parsing
/**
 * Converts a string into a list of tokens
 */
function tokenize(chars) {
    return chars
        .replace("(", " ( ")
        .replace(")", " ) ")
        .split(" ");
}
/**
 * Read a Lisp expression from a string
 */
function parse(program) {
    return readFromTokens(tokenize(program));
}
/**
 * Read an expression from a sequence of tokens
 */
function readFromTokens(tokens) {
    if (tokens.length === 0) {
        throw new SyntaxError("Error: unexpected EOF");
    }
    var token = tokens.shift();
    if (token === "(") {
        var list = [];
        while (tokens[0] !== ")") {
            list.push(readFromTokens(tokens));
        }
        tokens.shift();
        return list;
    }
    else if (token === ")") {
        throw new SyntaxError("Error: unexpected )");
    }
    else {
        return atomize(token);
    }
}
/**
 * Numbers become numbers
 * Every other token is a symbol
 */
function atomize(token) {
    return Number(token) === NaN ? token : Number(token);
}
// Environments
function sum(x) {
    var v = function (n) { return sum(x + n); };
    v.valueOf = function () { return x; };
    return v;
}
/**
 * Creates an environment with some standard procedures
 */
function standardEnvironment() {
    return {
        "+": function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args.reduce(function (acc, val) { return acc + val; });
        },
        "-": function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args.reduce(function (acc, val) { return acc - val; });
        },
        "*": function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args.reduce(function (acc, val) { return acc * val; });
        },
        "/": function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args.reduce(function (acc, val) { return acc / val; });
        },
        ">": function (x) { return x > x; },
        "<": function (x) { return x < x; },
        ">=": function (x) { return x >= x; },
        "<=": function (x) { return x <= x; },
        "=": function (x) { return x === x; },
        abs: function (x) { return Math.abs(x); },
        apply: function (proc, args) { return proc.apply(void 0, args); },
        car: function (x) { return x[0]; },
        cdr: function (x) { return x.shift(); },
        cons: function (x, y) { return y.unshift(x); },
        "eq?": function (x, y) { return x == y; },
        "equal?": function (x, y) { return x === y; },
        length: function (x) { return x.length; },
        list: function (x) { return new Array(x); },
        "list?": function (x) { return x.isArray(); },
        // "map":     (...args: any[]) => [].map()
        not: function (x) { return !x; },
        "null?": function (x) { return x === undefined || x === null; }
        //     "number?": (x: any) => typeof x === "Num",
        //     "symbol?": (x: any) => typeof x === "Sym"
    };
}
var globalEnv = standardEnvironment();
// Evaluation
function isSym(x) {
    return x !== undefined;
}
function isNum(x) {
    return x !== undefined;
}
function isList(x) {
    return x !== undefined;
}
/**
 * Evaluates an expression in an environment
 */
function evaluate(x, env) {
    if (env === void 0) { env = globalEnv; }
    if (isNum(x)) {
        // console.log("num");
        return x;
    }
    else if (isSym(x)) {
        // console.log("sym");
        console.log(env[x]);
        return env[x];
    }
    else if (x[0] === "if") {
        var test = x[1];
        var consequence = x[2];
        var alternate = x[3];
        var expression = void 0;
        if (evaluate(test, env)) {
            expression = consequence;
        }
        else {
            expression = alternate;
        }
        return evaluate(expression, env);
    }
    else if (x[0] === "define") {
        var symbol = x[1];
        var expression = x[2];
        env[symbol] = evaluate(expression, env);
    }
    else {
        var procedure = function () { return evaluate(x[0], env); };
        var args = x.slice(0).map(function (arg) { return evaluate(arg, env); });
        return procedure.apply(null, args);
    }
}
// REPL
/**
 * A rudimentary Lisp repl
 */
function repl() {
    var stdin = process.openStdin();
    process.stdout.write("lisp.ts> ");
    stdin.addListener("data", function (d) {
        process.stdout.write("lisp.ts> ");
        var data = evaluate(parse(d.toString().trim()));
        if (data !== undefined) {
            console.log(stringify(data));
        }
    });
}
/**
 * Convert an object into a Lisp-readable string
 */
function stringify(exp) {
    if (isList(exp)) {
        return "(" + exp.map(function (e) { return stringify(e); }).join(" ") + ")";
    }
    else {
        return exp.toString();
    }
}
console.log(evaluate(parse("(begin (define r 10) (* 5 (* r r)))")));
console.log(evaluate(parse("(+ 10 3 2)")));
