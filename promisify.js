const fs = require('fs');
const {promisify} = require('util');

module.exports = {
    open : promisify(fs.open),
    close: promisify(fs.close),
    read: promisify(fs.read),
    stat: promisify(fs.stat),
    readdir: promisify(fs.readdir)
}