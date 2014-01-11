var fs = require('fs'),
    _ = require('underscore'),
    async = require("async"),
    csv = require('csv');

var readCsv = function(filename, cb) {
  csv().from.path(__dirname+'/../gtfs/'+filename, {columns: true}).to.array(function(data) {
    cb(null, {filename: filename, data: data});
  });
}

module.exports = function(file_names, cb) {
  var file_names = _.map(file_names, function(i) { return i + '.txt'});
  async.map(file_names, readCsv, function(err, res) {
    out = {};
    _.each(res, function(i) {
      out[i.filename.replace('.txt', '')] = i.data;
    });
    cb(out);
  });
}
