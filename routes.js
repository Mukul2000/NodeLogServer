const {open, close, read, stat} = require('./promisify');
const { lower_bound } = require('./search');

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
        if ((endDate < startDate) || ( (startDate === endDate) && (endTime < startTime) )) {
            bad_request("Bad request, request intervals incorrect", res, 400);
            return;
        }

        // form search strings
        // format is date + "T" + time
        const startSearchString = startDate + "T" + startTime;
        const endSearchString = endDate + "T" + endTime;


        const upper = await lower_bound(startSearchString);
        const startLine = upper.ans;
        const startLineByte = upper.start_byte;

        const lower = await lower_bound(endSearchString);
        const endLine = lower.ans;
        const endLineByte = lower.start_byte + lower.len;
        console.log(startSearchString, endSearchString);
        console.log(upper,lower);

        // Take care of when any one of startLine or endLine are null
        // user is possibly requesting logs at a future point of time
        if(startLine == null || endLine == null) {
            bad_request("Something went wrong, possibly your parameters include a point of time in the future",res, 400);
            return;
        }

        // serve up everything from startLineByte to endLineByte
        // subject to limitation on size of logs to transfer per request
        const max_transfer_size = 1024000000; //10MB
        let flag = 0; //To add a message that logs have been truncated

        let bytesToServe = endLineByte - startLineByte + 1;
        if(bytesToServe > max_transfer_size) {
            bytesToServe = max_transfer_size;
            flag = 1;
        }

        if (endLine > endSearchString) bytesToServe--;
        
        let buffer = Buffer.alloc(bytesToServe);
        fd = await open('example.txt', 'r');
        await read(fd, buffer, 0, buffer.length, startLineByte);
        let result = buffer.slice(0, buffer.length).toString();
        res.write(result);
        if(flag === 1) res.write("Lines truncated....");
        res.end();
        await close(fd);
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