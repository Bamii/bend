// parse the init file.
const babel = await import("@babel/types");
// const traverse = await import("@babel/traverse");
import traverse from "@babel/traverse"
// const { StringLiteral } = import("./literals/index.mjs");

class Logic {
    act() {}

    construct() {

    }
}

class BooleanLiteral {
    construct(value) {
        return babel.booleanLiteral(value)
    }

    update(struct, value) {
        struct.value = value;
    }
}

// value declaration
class ValueDeclarationLogic {
    name = 'value-declaration';

    construct({ id, value }) {
        if(!babel.isIdentifier(id))
            throw new Error();
        
        if(value !== null && value !== undefined && !babel.isExpression(value)) 
            throw new Error();

        const declarator = babel.variableDeclarator(id, value)
        return babel.variableDeclaration("let", [declarator]);
    }
}

class IfDoLogic extends Logic {}
class ReturnLogic extends Logic {}


class BlockStatement {
    construct(statements) {
        return babel.blockStatement([]) 
    }

    append() {

    }
    
    prepend() {
        
    }
    
    move() {
        
    }

    rep() {
        return this
    }
}

class WhileStatement {
    construct(test, body) {
        if(!babel.isExpression(test))
            throw new Error()

        if(!babel.isStatement(body))
            throw new Error();

        return babel.whileStatement(test, body)
    }
}

class DoWhileStatement {
    construct(test, body) {
        if(!babel.isExpression(test))
            throw new Error()

        if(!babel.isStatement(body))
            throw new Error();

        return babel.doWhileStatement(test, body)
    }
}

class BreakStatement {
    construct() {
        return babel.breakStatement(null)
    }
}

class IfStatement {
    construct(test, consequent, alternate) {
        return babel.ifStatement(test, consequent, alternate)
    }
}

class Identifier {
    construct(name) {
        return babel.identifier(name)
    }
}

class ForStatement {
    construct(init, test, update, body) {
        return babel.forStatement(init, test, update, body)
    }
}

class ForOfStatement {
    construct(left, right, body) {
        return babel.forOfStatement(left, right, body)
    }
}

class ForInStatement {
    construct(left, right, body) {
        return babel.forInStatement(left, right, body)
    }
}

class ReturnStatement {
    construct(returned) {
        return babel.returnStatement(returned)
    }
}

class SwitchStatement {
    construct(discriminant, cases) {
        return babel.switchStatement(discriminant, cases)
    }

    appendCase(statement, switch_case) {
        statement.cases.push(switch_case)
    }
     
    prependCase(statement, switch_case) {
        statement.cases.shift(switch_case)
    }

    deleteCase(statement, index) {
        statement.cases.splice(index, 1)
    }

    moveCase(statement, origin, destination) {}
}

class SwitchCaseStatement {
    block = "consequent"
    // consequent = case body
    construct(test, consequent) {
        return babel.switchCase(test, consequent ? [consequent] : [])
    }
}

class Builder {

}

class Program {

}

const declarer =  new ValueDeclarationLogic()
// const stringer = new StringLiteral()
// const doWhiler = new DoWhileBlock();
const switcher = new SwitchStatement()
const switchCaser = new SwitchCaseStatement()
const booler = new BooleanLiteral()
// const iffer = new IfStatement()

function create() {
    const map = new Map();
    const program = new Program();
    map.set("program", program)

    const blocky = new BlockStatement();
    map.set("blocky", blocky.rep());

    // const bamiString = stringer.construct("bami")
    // const declareValBami = declarer.construct({ id: "bami", value: bamiString })
    const trueVal = booler.construct(true);
    const switchVal = switcher.construct(trueVal, [])
    const switchCaseVal = switchCaser.construct(trueVal, null)

    booler.update(trueVal, false)

    // const condition = iffer.construct()
    // const dowWhile = doWhiler.construct()

    switcher.appendCase(switchVal, switchCaseVal)

    console.log(switchVal)

    traverse.default(switchVal, {
        noScope: true,
        enter(path) {
            // console.log(path)
        }
    })
}

create()
// console.log(babel.thisExpression())