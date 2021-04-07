const routes = {
    logs: (data, res) => {
        //TODO: Entire logic for filtering out the required logs
        res.end(JSON.stringify(data));
    },
    notFound: (data,res) => {
        //If no route matches
        let payload = {
            message: "File Not Found",
            code: 404
        };
        let payloadStr = JSON.stringify(payload);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(404);

        res.write(payloadStr);
        res.end("\n");
    }
}

module.exports = routes;