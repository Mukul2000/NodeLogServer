const http = require('http');
const url = require('url');
const routes = require('./routes');


const server = http.createServer((req,res) => {
    req.setEncoding('utf-8');
    let path = req.url
    // '/folder/to/file/' becomes 'folder/to/file'
    path = path.replace(/^\/+|\/+$/g, "");
    console.log(path);


    //req is a stream, 'data' event listens for body content to be
    //processed in chunks
    let details;
    req.on('data', (data) => {
        details = data;
    });
    req.on('end', () => {
        //'end' event occurs when the stream ends
        console.log("End of request");
        const json = JSON.parse(details);
        let route =
            typeof routes[path] !== "undefined" ? routes[path] : routes["notFound"];

        route(json,res);
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