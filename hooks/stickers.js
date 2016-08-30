// using error to see if this shows up in AB
console.error("Running hook");

var xcode = require('./xcode'),
    fs = require('fs'),
    path = require('path');

module.exports = function (context) {
    console.log(xcode)
};