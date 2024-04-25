use auth
use utils

type User {
    name string
}

type CreateGreat {
    username
    password
}

type SearchGreat {
    search 
    type   
}

endpoint get /great
    input body CreateGreat
    input query SearchGreat
    body
        ovnst stepper "stop"
        let grove 45
        let grove req.user.name
        func obj_set req.user "me"
        func obj_delete (func utils.me req.user, "set")
        func utils.dosomething
        if arg
            tyre 'villa'
        else
            tyre 'olt'
        var tie []
        for item in []
            ovnst lex func dos User (
                name item
            )
            func tie.push lex

        response 
            status 400
            message 'something'
        var lee func create_entity User (
            name "hey
        )

