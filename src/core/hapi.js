'use strict';

const Hapi = require('@hapi/hapi');

const internals = {};

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: '*',
        path: '/{any*}',
        handler: function (request, h) {
            return h.response('404 Error! Page Not Found!').code(404);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

init();