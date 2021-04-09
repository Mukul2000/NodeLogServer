const fs = require('fs');
const { lower_bound } = require('./search');

const routes = {
    logs: async (data, res) => {
        // date format is YYYY-MM-DD
        // time format is hh:mm:ss
        // searchString is date + "T" + time
        const { startDate, startTime, endDate, endTime } = data.queryString;

        //all parameters required
        if (startDate === undefined || startTime === undefined
            || endDate === undefined || endTime === undefined) {
            bad_request("Bad request, request parameters missing", res, 400);
            return;
        }

        //invalid request interval
        if ((endDate < startDate) || (endTime < startTime)) {
            bad_request("Bad request, request intervals incorrect", res, 400);
            return;
        }

        //form search strings
        const startSearchString = startDate + "T" + startTime;
        const endSearchString = endDate + "T" + endTime;


        const upper = lower_bound(startSearchString);
        const startLine = upper.ans;
        const startLineByte = upper.start_byte;

        const lower = lower_bound(endSearchString);
        const endLine = lower.ans;
        const endLineByte = lower.start_byte + lower.len;

        //Take care of when any one of start`Line or endLine are null
        //user is possibly requesting logs at a future point of time
        if(startLine == null || endLine == null) {
            bad_request("Something went wrong, possibly your parameters include a point of time in the future",res, 400);
            return;
        }

        //serve up everything from startLineByte to endLineByte
        //TODO: subject to limitation on how many logs to transfer
        let bytesToServe = endLineByte - startLineByte + 1;
        if (endLine > endSearchString) bytesToServe--;
        let buffer = Buffer.alloc(bytesToServe);
        fd = fs.openSync('example.txt', 'r');
        let ps = fs.readSync(fd, buffer, 0, buffer.length, startLineByte);
        let result = buffer.slice(0, ps).toString();
        res.write(result);
        res.end();
        fs.closeSync(fd);


    },
    notFound: (data, res) => bad_request("Invalid route", res, 404)
}

function bad_request(message, res, code) {
    //If no route matches
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