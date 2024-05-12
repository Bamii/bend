const {
    NullLiteral,
    BigIntLiteral,
    NumberLiteral,
    RegExpLiteral,
    StringLiteral,
    BooleanLiteral,
    DecimalLiteral,
} = await import("./literals.mjs");

const {
    ArrayExpression,
    TupleExpression,
    UnaryExpression,
    BinaryExpression,
    LogicalExpression,
    AssignmentExpression,
    UpdateExpression,
    ArrowFunctionExpression
} = await import("./expressions.mjs");

export const LITERALS = [
    NullLiteral,
    BigIntLiteral,
    NumberLiteral,
    RegExpLiteral,
    StringLiteral,
    BooleanLiteral,
    DecimalLiteral,
];

export const EXPRESSIONS = [
    ArrayExpression,
    TupleExpression,
    UnaryExpression,
    BinaryExpression,
    LogicalExpression,
    AssignmentExpression,
    UpdateExpression,
    ArrowFunctionExpression
]

export class Coordinator {
    #blocks = new Map();

    constructor() {
        this.register();
    }

    register() {
        for (let block in LITERALS) {
            const instance_name = block.name;
            const instance = new block();
            this.#blocks.set(instance_name, instance);
        }
    }

    get_block(id) {
        return this.#blocks.get(id);
    }

    make_block(type, params) {
        
    }
}
