var fs = require('fs'),
    _ = require('underscore'),
    read_csv = require(__dirname+'/lib/read_csv_files');

read_csv(['routes', 'shapes', 'trips'], function(data) {
  var trips = data['trips'],
      routes = data['routes'],
      shapes = data['shapes'],
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

  // Write out each route's geoJSON FeatureCollection to its own file
  _.each(route_shapes, function(route_shape, route_name) {
    fs.writeFileSync(__dirname+'/route_shapes/'+route_name+'.geojson', JSON.stringify(route_shape));
  });
});
