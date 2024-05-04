const babel = await import("@babel/types");

class Literal {}

export class StringLiteral extends Literal {
    static name = "string-literal";
    construct(value) {
        if (!babel.isStringLiteral(value)) throw new Error();

        return babel.stringLiteral(value);
    }
}

export class NumberLiteral extends Literal {
    static name = "number-literal";
    construct(value) {
        if (!babel.isNumericLiteral(value)) throw new Error();

        return babel.numericLiteral(value);
    }
}

export class NullLiteral extends Literal {
    static name = "null-literal";
    construct(value) {
        if (babel.isNullLiteral(value)) throw new Error();

        return babel.nullLiteral(value);
    }
}

export class BooleanLiteral extends Literal {
    static name = "boolean-literal";
    construct(value) {
        if (!babel.isBooleanLiteral(value)) throw new Error();

        return babel.booleanLiteral(value);
    }
}

export class BigIntLiteral extends Literal {
    static name = "bigint-literal";
    construct(value) {
        if (!babel.isBigIntLiteral(value)) throw new Error();

        return babel.bigIntLiteral(value);
    }
}

export class RegExpLiteral extends Literal {
    static name = "bigint-literal";
    construct(value) {
        if (!babel.isRegExpLiteral(value)) throw new Error();

        return babel.regExpLiteral(value);
    }
}

export class DecimalLiteral extends Literal {
    static name = "bigint-literal";
    construct(value) {
        if (!babel.isDecimalLiteral(value)) throw new Error();

        return babel.decimalLiteral(value);
    }
}
