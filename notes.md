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

# -------------------------------------------------------
hmmm so i thought about why i'm even using a dsl or why a dsl is the best hammer for the job. 
mostly because i can just construct an ast directly. (which is in the intermediary between a dsl and a target language anyway.)

# --------
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
        - get the instance using the id
        - request for block using type.
        - update the instance obj using block's update operation.

## 12th may 2024
i just found [blocky](www.blocky.com) and i just realised that i can use this to create the functions. i would have opted to build this up myself... but i'm pressed for time and i want to reduce my development time. LGTM real quick please.
so, basically... 
- per module 
    - module middlewares
    - create endpoint, with inputs and types...
        - representation
            - type: endpoint
            - path: string with ":"
            - method: get/post/patch/delete
            - inputs: (types: header, body)
            - middlewares: middleware[]
            - body: function
        - function body created with blocky
            - all endpoint functions in a particular module will be appended together in a single file.
i have created a [sample file](/sample.json) that contains a list of the components representations that'll be used by bender.
(this software will be self hostable)
- here is the file structure of the project.
    - gen                   // folder that will contain the generated backend code.
        - database
            - schema.prisma
            - models
                - cat.js  // reexports prisma's CRUD functions
        - modules           
            - cat           // sample module
                - cat.controller.js
                - cat.service.js
            - app.controller.js
            - app.service.js
        - utils
        - ... default and config files.
    - app                   // frontend app
    - package.json
    - ... some config files.

here will be the user flow. 
- init
    1. if there is a gen folder, continue to 2, if not continue to 7.
    2. scan the gen folder, and look for every ".service.js" file in gen/modules. parse those files and extract their respective middleware function names. ~ add some meta tags that depict if that function was auto-generated or user defined (this is mostly because i dont want to touch functions manually updated by the user) ~
    3. store the middlewares in map(middlewares)
    4. scan the gen/database/models folder and get all the files in this folder. these folders are the respective entity models. since every model has the same functions, we can just keep a json file of the argument structure. we will also have a models.json file that will be used to initially generate the prisma file. this file will get us the datatypes and the fields of the models.
    5. store the models and its respective fields and datatypes in map(models)
    6. store the models functions in map(functions)
    7. parse the bend.(yaml | json) file and populate the respective map(models | functions | middlewares | modules | cron).
    8. use the above data to initialise a dev session.

- generate_server
    <!-- 0. do init 1-7 -->
    1, parse models.json, and for each model 
        1. generate CRUD functions for the model and store it in gen/database/models/model_name.js
        2. store the function names in map(function)
    2. generate main.js ast.
    3. parse functions.js and store the functions accordingly below
        1. generate utils/middlewares.js ast, append the middleware functions.
        2. generate utils/functions.js ast and append the functions in it.
        3. if the function is a controller, 
            1. generate the folder gen/modules/controller_module if not already generated,
            2. generate ./module.controllers.js ast if not generated, and append the controllers accordingly.
    5. get the modules from the main bend ast. and for each module do this
        1. generate an ast template for `import modulename from module` & `app.use(modulename.routes())` and prepend & append the templates respectively to the main.js ast
        1. prepare a folder using the module name if not already prepared (at this point all module folders should be prepared.)
        2. generate ast for module_name.module.js
        3. get all the endpoints and for each of all the endpoints do this
            1. generate the ast template representing 
                - `import middlewares, controller`
                - `router.use(endpoint_name, ...endpoint.middlewares, endpoint_function_body)`
            2. append the ast template in 1 to the the module.controller.js's asts children list.
    6. get the crons from the main bend ast. and for each cron jobs
        1. generate the ast template for the cron definition statement from [cron](https://www.npmjs.com/package/cron)
        2. append the template to the main.js ast.

- dev
    1. generate the functions and store the function names and its respective types(middleware, regular function) in a map 
    