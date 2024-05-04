## 24th april 2024
bend is an open source nocode backend builder, the design is supposed to have the following considerations
    x - shareable server config 
    - should (transpile) down to javascript. (will use expressjs as a server, zod for validations, )
    
- trying to figure out the grammar of the dsl. check [grammar](./grammar)

## 25th april 2024
- i intend on learning about parsing and lexing a dsl, and i should be ready to complete the grammar by tomorrow (26th april 2024)

- the language should comprise of blocks in the root. and the only allowed blocks are "type", "endpoint", "entity", "cron", "middleware" (more to come)
- the dsl is supposed to describe a server that has database entities, serves endpoints and runs some cron jobs.
    - (entities could also be storage repositories, cache, any extra addon that auguments the server)
    - DATABASE ENTITIES should be prisma config formatted.. (althougn the data types will not be used in the program)
    - an ENDPOINT should have INPUTS which should either be a "body", a "query", 
        - (GET endpoints cannot accept body inputs)
    - an ENDPOINT should have a body (which will be a function)
        - i envision using dependency injection to inject inputs, and stuff into the endpoint controller... could just use arguments too though
    - a CRON should have a duration, and a body (which will be a function)
    - a MIDDLEWARE should have a body which is a function 

-------------------------------------------------------
hmmm so i thought about why i'm even using a dsl or why a dsl is the best hammer for the job. 
mostly because i can just construct an ast directly. (which is in the intermediary between a dsl and a target language anyway.)
--------
ast > dsl
pros / cons
direct codegen / larger init files.
fastr dev start / 

dsl > ast
pros / cons
smaller files / longer startup & dev time
easy reading /  
--------
decisions decisions... im checking out how it'll look if i use an ast directly instead. check [ast](./ast)

## 26th april 2024
i have decided to go the route of ast first for now... i can always still add in the dsl later on because it'll still need the ast as IR.
i have also decided to use the following tools
- [babel](https://babeljs.io/docs/babel-types#node-builders) for building the ast and generating the code.
- [escodegen](https://github.com/estools/escodegen) for generating code (will use alongside esprima)

now to determining the scope of the "grammar" we'd need in the builder.
since we'll be dealing mostly in function scope.
- middleware -> function
- function -> function
- endpoint body -> function 

## 3rd may 2024
its been a while, i have been caught up in work and stuff, 
so, basically they're going to be lego blocks. and there will be blocks of different shapes and sizes... these blocks will all be thrown in a pool. so that we can request for an instance of a block anytime we need it.
basically,

    - create block
        - request for block 
        - generate syntax for block (using construct),
        - save reference to the block using a generated_id. (this works because objects work as references)

    - update block (using instance id)
        - request for block
        - get the instance using the id
        - update the instance obj using block's update operation.