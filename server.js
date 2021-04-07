const http = require('http');

const server = http.createServer((req,res) => {
    req.setEncoding('utf-8');

    //req is a stream, 'data' event listens for body content to be
    //processed in chunks
    const {method, url} = req;
    req.on('data', (data) => {
        const json = JSON.parse(data);
        console.log(json.text);
    });
    req.on('end', () => {
        //this is done when the stream ends
        console.log("End of request");
    })
    req.on('close', () => {
        console.log('Connection closed')
    });
    req.on('error', (err) => {
        console.log(err);
    });
});

server.listen(8000, () => {
    console.log("Server started on port 8000..");
});