const { open, close, read, stat, readdir } = require('./promisify');
const { EOL } = require('os');

async function searchInFiles(startSearchString, endSearchString, res) {
    const logFolder = "./logs/";
    try {
        // NOTE: Unlike before, if the end timestamp points to the future, query will give logs from start timestamp
        // to the last log.
        // TODO: find a way to enforce maximum size of logs transferred in request. 

        const files = await readdir(logFolder); // get files in logs directory
        for (let i = 0; i < files.length; i++) {
            const file_path = logFolder + files[i]; //OK
            console.log(file_path);

            // open file
            let file_descriptor = open(file_path, 'r');
            let stats = stat(file_path);
            const [fd, bytes] = await Promise.all([file_descriptor, stats]); // file descriptor and stats object

            // search
            const result_1 = lower_bound(startSearchString, fd, bytes.size);
            const result_2 = lower_bound(endSearchString, fd, bytes.size);
            const [upper, lower] = await Promise.all([result_1, result_2]); // both are independent, faster searching

            console.log(upper, lower);

            // parse results
            let startLine = upper.ans;
            let endLine = lower.ans;


            if (startLine === null) {
                // This file is a bust, move on
            }
            else {
                //more parsing
                let startLineByte = upper.start_byte;
                let endLineByte = lower.start_byte + lower.len;
                if (endLine === null) {
                    // this query spans files, take this file upto it's end and move to next file
                    endLineByte = bytes.size - 1;
                    let bytesToServe = endLineByte - startLineByte + 1;
                    console.log("reading spans query in ", files[i]);
                    let buffer = Buffer.alloc(bytesToServe);
                    let { bytesRead, buf } = await read(fd, buffer, 0, buffer.length, startLineByte);
                    let result = buffer.slice(0, bytesRead).toString();
                    res.write(result);
                    await close(fd);
                }
                else {
                    // This file contains the whole query
                    // or this is the final part of a query spanning files
                    // take data and exit from file iteration
                    let bytesToServe = endLineByte - startLineByte + 1;
                    if (endLine > endSearchString) bytesToServe--;

                    let buffer = Buffer.alloc(bytesToServe);
                    let { bytesRead, buf } = await read(fd, buffer, 0, buffer.length, startLineByte);
                    let result = buffer.slice(0, bytesRead).toString();
                    res.write(result);
                    await close(fd);
                    break;
                }
            }
        }
        res.end();

    }
    catch (e) {
        // TODO: probably will throw a no such folder error
        console.log(e);
    }
}

//find first log with timestamp >= searchString
async function lower_bound(searchString, fd, bytes) {
    // IMPORTANT NOTE: Requires log file to have a EOL at the very end, otherwise this breaks.
    let ans = null;
    let start_byte = null; //store the byte at which the ans starts
    let len = 0;

    let buffer = Buffer.alloc(258);

    let lo = 0;
    let hi = bytes - 1;

    while (lo < hi) {

        const mid = lo + Math.floor((hi - lo) / 2);
        let pos;
        let bytesToNext = 0;
        if (mid > 0) {
            pos = await read(fd, buffer, 0, buffer.length, mid); // read 258 bytes and fill my buffer
            const cur = buffer.slice(0, pos.bytesRead).toString();
            for (let i = 0; i < cur.length; i++) {
                if (cur[i] === EOL) {
                    bytesToNext = i + 1;
                    break; // break at first line break
                }
            }
        }

        // mid + bytesToNext now points at start of line after the line mid is on
        let currentLogLine = "";
        // will store from mid + bytesToNext to mid + bytesToNext + 256 bytes or wherever
        // line break occurs earlier


        pos = await read(fd, buffer, 0, buffer.length, mid + bytesToNext);
        const current = buffer.slice(0, pos.bytesRead).toString();
        for (let i = 0; i < current.length; i++) {
            currentLogLine += current[i];
            if (current[i] === EOL) break;
            // only want upto the first line break, makes one whole log
        }

        const dt = currentLogLine.substr(0, 19); // extract the date and time part from the log line //OK
        // console.log("current comparators : ", dt, searchString);

        // update bounds
        if (dt >= searchString) {
            hi = mid - 1;
            ans = currentLogLine;
            start_byte = mid + bytesToNext;
            len = currentLogLine.length;
        }
        else {
            lo = mid + 1;
        }
    }
    // if (start_byte >= bytes) ans = null;
    return {
        ans,
        start_byte,
        len
    }
}

// async function Icheckbinarysearch() {
//     const file_path = "./checker.txt";
//     let file_descriptor = open(file_path, 'r');
//     let stats = stat(file_path);
//     const [fd, bytes] = await Promise.all([file_descriptor, stats]);
//     const searchString = "2020-01-01T00:01:50"
//     const res1 = await lower_bound(searchString, fd, bytes.size);
//     console.log(res1);
// }

// Icheckbinarysearch();


module.exports = { lower_bound, searchInFiles };