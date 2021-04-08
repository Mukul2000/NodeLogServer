const routes = {
    logs: (data, res) => {
        //IDEA: find lower_bound for the given bounds and give +- 100 records into socket.
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