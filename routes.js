const fs = require('fs');
const readline = require('readline');

const routes = {
    logs: async (data, res) => {
        //filtering out the required logs
        const { startDate, startTime, endDate, endTime } = data;
        console.log(startDate, startTime, endDate, endTime)
        const fileStream = fs.createReadStream('./example.txt');

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const date = line.substr(0,10);
            const time = line.substr(11,8);
            if(date >= startDate && time >= startTime && date <= endDate && time <= endTime) {
                res.write(line+"\n");
                console.log(date,time);
            }
        });
        rl.on('close', () => {
            res.end();
        });
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