const fs = require('fs');
const { EOL } = require('os');


//find first log with timestamp >= searchString
function lower_bound(searchString) {
    const file_name = 'example.txt';
    let ans = null;


    fd = fs.openSync(file_name, 'r');

    let buffer = Buffer.alloc(258);

    let lo = 0, hi = fs.statSync(file_name).size - 1;

    while (lo < hi) {

        let mid = lo + Math.floor((hi - lo) / 2);

        let pos = fs.readSync(fd, buffer, 0, buffer.length, mid); //read 258 bytes and fill my buffer
        const cur = buffer.slice(0, pos).toString();
        for (let i = 0; i < cur.length; i++) {
            if (cur[i] === EOL) {
                pos = i + 1;
                break;
            }
        }


        //mid + pos should point at start of next line
        let currentLogLine = ""; //will store from mid + pos to mid + pos + 258 bytes
        pos = fs.readSync(fd, buffer, 0, buffer.length, mid + pos);
        let current = buffer.slice(0, pos).toString();
        for (let i = 0; i < current.length; i++) {
            currentLogLine += current[i];
            if (current[i] === EOL) break;
            //only want upto the first line break
        }

        let dt = currentLogLine.substr(0, 19); //extract the date and time part from the log line //OK

        //update bounds
        if (dt >= searchString) {
            hi = mid - 1;
            ans = currentLogLine;
        }
        else {
            lo = mid + 1;
        }
    }

    console.log(ans);
    return ans;
}


//find last timestamp <= searchString
function Rlower_bound(searchString) {
    const file_name = 'example.txt';
    let ans = null;


    fd = fs.openSync(file_name, 'r');

    let buffer = Buffer.alloc(258);

    let lo = 0, hi = fs.statSync(file_name).size - 1;

    while (lo < hi) {

        let mid = lo + Math.floor((hi - lo) / 2);

        let pos = fs.readSync(fd, buffer, 0, buffer.length, mid); //read 258 bytes and fill my buffer
        const cur = buffer.slice(0, pos).toString();
        for (let i = 0; i < cur.length; i++) {
            if (cur[i] === EOL) {
                pos = i + 1;
                break;
            }
        }


        //mid + pos should point at start of next line

        let currentLogLine = ""; //will store from mid + pos to mid + pos + 258 bytes
        pos = fs.readSync(fd, buffer, 0, buffer.length, mid + pos);
        let current = buffer.slice(0, pos).toString();
        for (let i = 0; i < current.length; i++) {
            currentLogLine += current[i];
            if (current[i] === EOL) break;
            //only want upto the first line break
        }

        let dt = currentLogLine.substr(0, 19); //extract the date and time part from the log line //OK

        //update bounds
        if (dt <= searchString) {
            lo = mid + 1;
            ans = currentLogLine;
        }
        else {
            hi = mid - 1;
        }
    }

    console.log(ans);
    return ans;
}

module.exports = {lower_bound, Rlower_bound};