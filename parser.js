var fs = require('fs'),
    _ = require('underscore'),
    async = require("async"),
    csv = require('csv');


// Grab certain tables
var getData = function(cb) {
  async.map(['routes.txt', 'shapes.txt', 'trips.txt'], readCsv, function(err, res) {
    out = {};
    _.each(res, function(i) {
      out[i.filename] = i.data;
    });
    cb(out);
  });
}

var readCsv = function(filename, cb) {
  csv().from.path(__dirname+'/gtfs/'+filename, {columns: true}).to.array(function(data) {
    cb(null, {filename: filename, data: data});
  });
}

getData(function(data) {
  var trips = data['trips.txt'],
      routes = data['routes.txt'],
      shapes = data['shapes.txt'],
      shape_geojson = {},
      route_shapes = {};

  // Build geojson feature for each shape
  _.each(shapes, function(shape) {
    // Init geojson container for the shape if not yet present
    if (!shape_geojson[shape.shape_id]) {
      shape_geojson[shape.shape_id] = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        },
        options: shape
      }
    }
    
    // Push coords
    var coords = shape_geojson[shape.shape_id].geometry.coordinates;
    coords.push([shape.shape_pt_lon, shape.shape_pt_lat]);
  });

  // Trips match shapes to routes
  _.each(trips, function(trip) {
    var route_name = trip.route_short_name;
    if (!route_shapes[route_name]) {
      route_shapes[route_name] = {
        type: 'FeatureCollection',
        features: []
      }
    }
    var features = route_shapes[route_name].features;
    features.push(shape_geojson[trip.shape_id]);
  });

  _.each(route_shapes, function(route_shape, route_name) {
    fs.writeFileSync(__dirname+'/route_shapes/'+route_name+'.geojson', JSON.stringify(route_shape));
  });
  // fs.writeFileSync(__dirname+'/81.json', JSON.stringify(route_shapes['81']));
});
