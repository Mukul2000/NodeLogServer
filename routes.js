const {lower_bound, Rlower_bound} = require('./search');

const routes = {
    logs: async (data, res) => {
        // date format is YYYY-MM-DD
        // time format is hh:mm:ss
        // searchString is date + "T" + time
        const {startDate, startTime, endDate, endTime} = data.queryString;
        const startSearchString = startDate + "T" + startTime;
        const endSearchString = endDate + "T" + endTime;

        
    },
    notFound: (data, res) => {
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