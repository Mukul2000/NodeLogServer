const { open, close, read, stat } = require('./promisify');
const { lower_bound, searchInFiles } = require('./search');

const routes = {
    logs: async (data, res) => {
        // date format is YYYY-MM-DD
        // time format is hh:mm:ss

        const { startDate, startTime, endDate, endTime } = data.queryString;

        //all parameters are required
        if (startDate === undefined || startTime === undefined
            || endDate === undefined || endTime === undefined) {
            bad_request("Bad request, one or more request parameters missing", res, 400);
            return;
        }

        //invalid request interval
        if ((endDate < startDate) || ((startDate === endDate) && (endTime < startTime))) {
            bad_request("Bad request, request intervals incorrect", res, 400);
            return;
        }

        // form search strings
        // format is date + "T" + time
        const startSearchString = startDate + "T" + startTime;
        const endSearchString = endDate + "T" + endTime;

        await searchInFiles(startSearchString, endSearchString, res);
    },
    notFound: (data, res) => bad_request("Invalid route", res, 404)
}

function bad_request(message, res, code) {
    let payload = {
        message: message,
        code: code
    };
    let payloadStr = JSON.stringify(payload);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(code);

    res.write(payloadStr);
    res.end("\n");
}

module.exports = routes;