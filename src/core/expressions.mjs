const babel = await import("@babel/types");

// array
// assignment
// arrow fn
// await
// binary
// bind

class Expression {}

export class ArrayExpression extends Expression {
    construct(elements) {
        // if(elements !== null || typeof element === "")
        return babel.arrayExpression(elements)
    }
}

export class AssignmentExpression extends Expression {
    construct(operator, left, right) {
        // if(elements !== null || typeof element === "")
        return babel.assignmentExpression(operator, left, right)
    }
}

export class ArrowFunctionExpression extends Expression {
    construct(params, body, is_async) {
        // if(elements !== null || typeof element === "")
        return babel.arrowFunctionExpression(params, body, is_async)
    }
}

export class BinaryExpression extends Expression {
    construct(operator, left, right) {
        // if(elements !== null || typeof element === "")
        return babel.binaryExpression(operator, left, right)
    }
}

export class LogicalExpression extends Expression {
    construct(operator, left, right) {
        // if(elements !== null || typeof element === "")
        return babel.logicalExpression(operator, left, right)
    }
}

export class UnaryExpression extends Expression {
    construct(operator, argument, prefix) {
        // if(elements !== null || typeof element === "")
        return babel.unaryExpression(operator, argument, prefix)
    }
}

export class TupleExpression extends Expression {
    construct(elements) {
        // if(elements !== null || typeof element === "")
        return babel.tupleExpression(elements)
    }
}

export class UpdateExpression extends Expression {
    construct(operator, argument) {
        // if(elements !== null || typeof element === "")
        return babel.updateExpression(operator, argument)
    }
}

// export class SequenceExpression extends Expression {
//     construct(expressions) {
//         // if(elements !== null || typeof element === "")
//         return babel.sequenceExpression(operator)
//     }
// }