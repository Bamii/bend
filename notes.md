## 24th april 2024
bend is an open source nocode backend builder, the design is supposed to have the following considerations
    x - shareable server config 
    - should (transpile) down to javascript. (will use expressjs as a server, zod for validations, )
    
i'm trying to figure out the grammar of the dsl. check [grammar](./grammar)

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
mostly because i can just construct an ast directly. (which is the intermediary between a dsl and a target language anyway.)

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
on the UI end of things, basically they're going to be lego blocks. and there will be blocks of different shapes and sizes... these blocks will all be thrown in a pool. so that we can request for an instance of a block anytime we need it.
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
            - path: nb: string with ":"
            - method: get/post/patch/delete...
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
- init dev
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

    
## 15th may 2024
its implementation time, i've started writing the code to use the configuration to build a working backend. i want to get the core right before refactoring and sorting things like auth.

## 16th may 2024
implementation continues.. i pretty muuch work into the next day a lot of times. right now i'm trying to implement the `generate_server` 'build step' i defined earlier (12th may).
i figure its not sufficient to just store the general functions as `utils/functions.js` because of possible third party functions. i decided to let everything be 'plugins', a plugin is essentially a reuseable module. 
it MUST contain a `package.json` that will have all the dependencies it uses. it MUST also contain a `functions.mjs` that will contain an export of all the functions that this plugin provides. all the exports in the folder MUST also have jsdoc comments that will give us details about the argument and return value.
as part of the project configuration, there will also be a `functions.json` that will contain all the meta about all the functions used in the program, this meta will include an imports field, this field will be used to populate the import statements.
at "generate time" the related imported plugins will be copied into the plugins folder of the generated project. and it will be imported from the plugins folder by any file that uses it.
doing it this way ensures that there is a uniform and predictable way of parsing and finding functions, and its easier to add new functionality to the generated project at little cost.
this would mean that here's the minimal files to get started with `bend`
- functions.js
- functions.json
- bendast.json
- models.json

i also added a distinction between MiddlewareFunction and a ControllerMiddlewareFunction this is to know where to put the function `on generate` (either in the service file or the middlewares file)

it works right now, i've successfully generated a folder with the correct linkings and all. i do need a correct aliasing method because i'm relying on it to import the plugins and the middleware, mostly because figuring out relative positioning is a lot of stress. or at least i dont want to use it.
this will probably lead me to using vite as a runner. i do also still need to generate the package.json :(

## 17th may 2024
ive been flirting with the idea of using dependency injection inside the plugins to avoid explicitly passing implementations. i.e: instead of requiring files and stuff, the plugins can register (with a unique id) with the dependency controller and then any plugin that requires another one can just request for a container using its id.
this is based on the assumption that plugins will want to call other plugins.
so what will this look like?

## 18th may 2024
worked on generating the database entites and CRUD functions using prisma. by now you should know that the pre-representation will be a json file.
after successfully generating the schema file and the database migration, everything is now complete and all thats left if to run a server using sample configuration. this didnt come without its challenges.. although i already predicted this ahead of time. 

the major challenge i had was absolute vs relative imports. like i said earlier it MIGHT not be easy to figure out relative imports (tbh im not just interested), so i opted to see how it was done in the wild... 
sticking with nodejs would mean i might have to introduce typescript (which i'm not thinking of until this version is stable.), and some other hoops i was not ready to jump through. 
[bun](bun.sh) was my other thought, on further research it seemed that i would also need to introduce typescript somehow... (idk, i saw something about a tsconfig and i closed the page.)
i turned to [deno](deno.com) and ALAS I FOUND WHAT I WAS LOOKING FOR, NO HOOPS REQUIRED. and apparently i dont even have to specify the dependency tree in a package.json, (a HUGE WIN for me given that i still had a task in the back burner... populating the dependencies field in package.json)

i chose deno and life hasn't been easier!!!
i run the server and YAYYYYY! IT FUCKING WORKED.

now to the UI part... LET'S FUCKING GO.
bami out.

## 21st may 2024
spent the last couple of days trying to debug an issue where prisma kept rejecting my DATABASE_URL it was so annoying that i almost pull my hair out... i fucking tried to hardcode the string in the schema but it didnt change anything.
i figured it was a deno thing, given that i HAVE TO run `prisma generate` with the `--no-engine` flag... this option apparently works only with prisma accelerate but i didnt see that fineprint until later on.
this meant that any server generated that will have a datasource MUST also go through prisma accelerate.. this is not ideal for user experience, sooo i started thinking of ways to not use this.
i went back to my first love... bun. and i tried to fix the relative path thing and it was as simple as adding a `tsconfig.json` lool. idk why i thought this would be stressful, anyway with that out of the way, i went on to try generating a client using the schema... and voila it worked!!! beautifully.
sooo safe to say that we will be going the bun way.
i actually was starting to like deno.. till next time amigos.

------------------

i've gotten everything to work well now, and while i wanted to add the authentication... i tried to make it work with making it just another middleware... but there were some issues especially given the fact that stratefy names are not always the same as the module name.
i decided to have a top level `authentication_schemes` that will contain all the authentication schemes that will be used in the project.
and then a per-module and per-endpoint `authentication` array that contains a list of authentication scheme names.

it works like butter. smooth, baby!

-----

passport doesnt interface well with koajs... the only adapter i found was last updated last year. it looks like i'll be going back to use hapi. why?
- built-in auth support,
- simple controllers.
- builtin routing
- builtin input validation (with joi)... (although i prefer zod)

