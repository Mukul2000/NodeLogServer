const {open, close, read, stat} = require('./promisify');
const { EOL } = require('os');        


//find first log with timestamp >= searchString
async function lower_bound(searchString) {
    const file_path = 'example.txt';
    let ans = null;
    let start_byte = null; //store the byte at which the ans starts
    let len = 0;

    let fd = await open(file_path, 'r');

    let buffer = Buffer.alloc(258);
    let bytes = (await stat(file_path)).size;
    let lo = 0;
    let hi = bytes - 1;
    
    // console.log(hi);

    while (lo < hi) {

        let mid = lo + Math.floor((hi - lo) / 2);
        let pos;
        let bytesToNext=0;
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
        let current = buffer.slice(0, pos.bytesRead).toString();
        for (let i = 0; i < current.length; i++) {
            currentLogLine += current[i];
            if (current[i] === EOL) break;
            // only want upto the first line break, makes one whole log
        }

        let dt = currentLogLine.substr(0, 19); // extract the date and time part from the log line //OK

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

    await close(fd);
    if(start_byte >= bytes) {
        ans = null;
    }
    return {
        ans,
        start_byte,
        len
    }
}



module.exports = { lower_bound };