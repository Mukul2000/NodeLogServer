const fs = require('fs');
const { EOL } = require('os');


//find first log with timestamp >= searchString
function lower_bound(searchString) {
    const file_name = 'example.txt';
    let ans = null;
    let start_byte = null;
    let len = 0;

    fd = fs.openSync(file_name, 'r');

    let buffer = Buffer.alloc(258);

    let lo = 0, hi = fs.statSync(file_name).size - 1;

    while (lo < hi) {

        let mid = lo + Math.floor((hi - lo) / 2);
        let pos = 0;
        if (mid > 0) {
            pos = fs.readSync(fd, buffer, 0, buffer.length, mid); //read 258 bytes and fill my buffer
            const cur = buffer.slice(0, pos).toString();
            for (let i = 0; i < cur.length; i++) {
                if (cur[i] === EOL) {
                    pos = i + 1;
                    break;
                }
            }
        }

        //mid + pos now points at start of new line
        let pos2 = pos;
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
            start_byte = mid + pos2;
            len = currentLogLine.length;
        }
        else {
            lo = mid + 1;
        }
    }

    fs.closeSync(fd);

    return {
        ans,
        start_byte,
        len
    }
}



module.exports = { lower_bound };