const http = require('http');
const routes = require('./routes');
const URL = require('url');


const server = http.createServer();
server.on('request', (req, res) => {
    //console.log(req.url);
    let parsedURL = URL.parse(req.url, true);
    let path = parsedURL.pathname;
    console.log(parsedURL);
    // standardize the requested url by removing any '/' at the start or end
    // '/folder/to/file/' becomes 'folder/to/file'
    // makes it easier when setting up routes
    path = path.replace(/^\/+|\/+$/g, "");
    let qs = parsedURL.query; //request parameters
    let headers = req.headers;
    let method = req.method.toLowerCase();

    //req is a stream, 'data' event listens for body content to be
    //processed in chunks
    req.on('data', () => {
        //need it just for 'end' to fire, don't need it here
    });
    req.on('end', () => {
        //'end' event occurs when the stream ends
        console.log("End of request");
        let route =
            typeof routes[path] !== "undefined" ? routes[path] : routes["notFound"];
        const data = {
            path: path,
            queryString: qs,
            headers: headers,
            method: method
        };
        console.log(data);
        route(data, res);
    });
    req.on('close', () => {
        console.log('Connection closed')
    });
    req.on('error', (err) => {
        console.log(err);
        res.statusCode(400);
        res.end();
    });
});

server.listen(8000, () => {
    console.log("Server started on port 8000..");
});