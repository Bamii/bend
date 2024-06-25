export function walk(ast, actions) {
    const { pre, post, prenode, postnode } = actions;
    let res;
    switch (ast.type) {
        case "Program": {
            pre?.(ast);
            res = prenode?.["Program"]?.(ast);
            if (res) return;
            for (let _module of ast.modules) {
                walk(_module, actions);
            }
            postnode?.["Program"]?.(ast);
            post?.(ast);
            break;
        }

        case "Module": {
            pre?.(ast);
            res = prenode?.["Module"]?.(ast);
            if (res) return;
            for (let middleware of ast.middlewares) {
                walk(middleware, actions);
            }
            for (let endpoint of ast.endpoints) {
                walk(endpoint, actions);
            }
            post?.(ast);
            postnode?.["Module"]?.(ast);
            break;
        }
        case "Endpoint": {
            pre?.(ast);
            res = prenode?.["Endpoint"]?.(ast);
            if (res) return;
            for (let input of ast.inputs) {
                walk(input, actions);
            }
            for (let middleware of ast.middlewares) {
                walk(middleware, actions);
            }
            walk(ast.body, actions);
            post?.(ast);
            postnode?.["Endpoint"]?.(ast);
            break;
        }

        case "ControllerMiddlewareFunction": {
            pre?.(ast);
            res = prenode?.["ControllerMiddlewareFunction"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["ControllerMiddlewareFunction"]?.(ast);
            break;
        }

        case "MiddlewareFunction": {
            pre?.(ast);
            res = prenode?.["MiddlewareFunction"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["MiddlewareFunction"]?.(ast);
            break;
        }

        case "Function": {
            pre?.(ast);
            res = prenode?.["Function"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["Function"]?.(ast);
            break;
        }

        case "HeaderInput": {
            pre?.(ast);
            res = prenode?.["HeaderInput"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["HeaderInput"]?.(ast);
            break;
        }

        case "BodyInput": {
            pre?.(ast);
            res = prenode?.["BodyInput"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["BodyInput"]?.(ast);
            break;
        }
        case "CronJob": {
            pre?.(ast);
            res = prenode?.["CronJob"]?.(ast);
            if (res) return;
            walk(ast.body, actions);
            post?.(ast);
            postnode?.["CronJob"]?.(ast);
            break;
        }

        case "Entity": {
            pre?.(ast);
            res = prenode?.["Entity"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["Entity"]?.(ast);
            break;
        }

        default:
            break;
    }
}