import csv
import json
from shapely.geometry import LineString, mapping, shape
from shapely.ops import linemerge, unary_union
shapes = {}
trip_shapes = {}

# Parse shapes into a dict
with open('gtfs/shapes.txt') as f:
  reader = csv.DictReader(f)
  for row in reader:
    if not row['shape_id'] in shapes:
      shapes[row['shape_id']] = []
    shapes[row['shape_id']].append((float(row['shape_pt_lon']), float(row['shape_pt_lat'])))

# Read and organize trips
with open('gtfs/trips.txt') as f:
  reader = csv.DictReader(f)
  for row in reader:
    short_name, shape_id = row['route_short_name'], row['shape_id']
    if not short_name in trip_shapes:
      trip_shapes[short_name] = {}
    trip_shapes[short_name][shape_id] = shapes[shape_id]

# Write out merged Linestrings for each route
for trip_name, shapes in trip_shapes.items():
    lines = []
    for k,v in shapes.items():
      line = LineString(v)
      lines.append(line)

    merged_line = unary_union(lines)
    with open('route_shapes/'+trip_name+'.geojson', 'w+') as f:
      f.write(json.dumps(mapping(merged_line)))
