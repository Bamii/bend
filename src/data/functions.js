async function mw__auth__authmiddleware(context) {
    // const number = utils.add(2, 4)
    console.log(context.req)
}

async function fn__utils__getrandomNumber() {
    return maths.random(10)
}

async function ctrl__cat__get__getsinglecat(context) {
    const rand = maths.random(10)
    const dog = models.create("dogs", { data: {}, options: {} })

    return {
        "name": "siamese fucking cat",
        "specie": "siamese"
    };
}

async function ctrl__dog__get__getsingledog(context) {
    return {
        "name": "boerbel",
        "specie": "boerbel"
    };
}

async function ctrl__dog__post__createdog(context) {
    return {
        "status": "created",
        "message": "created dog"
    };
}
