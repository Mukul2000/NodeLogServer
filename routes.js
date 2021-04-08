const fs = require('fs');
const readline = require('readline');

const routes = {
    logs: async (data, res) => {
        //filtering out the required logs
        const { startDate, startTime, endDate, endTime } = data.queryString;
        if (startDate === undefined && endDate === undefined) {
            let payload = {
                message: "Bad request, dates missing",
                code: 400
            };
            let payloadStr = JSON.stringify(payload);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(404);

            res.write(payloadStr);
            res.end("\n");
        }

        const fileStream = fs.createReadStream('./example.txt');

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const date_now = line.substr(0, 10);
            const time_now = line.substr(11, 8);
            if (date_now >= startDate && date_now <= endDate) {
                if (startTime !== undefined && endTime !== undefined) {
                    if (time_now >= startTime && time_now <= endTime) {
                        res.write(line);
                        res.write("\n");
                    }
                }
                else {
                    res.write(line);
                    res.write("\n");
                }
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