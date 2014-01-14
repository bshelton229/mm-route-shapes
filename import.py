import csv
import json
import psycopg2
from shapely.geometry import LineString, mapping, shape
from shapely.ops import linemerge, unary_union
from shapely.wkt import dumps, loads

# Set up
shapes = {}
trip_shapes = {}
routes = {}

try:
    conn = psycopg2.connect("dbname='mm_routes'")
except:
    print "I am unable to connect to the database"

# Cursor for the db
cur = conn.cursor()
# Clear out, don't worry about updating, it's like a cache
cur.execute("DELETE FROM shapes")
conn.commit()

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

# Load some data about routes
with open('gtfs/routes.txt') as f:
  reader = csv.DictReader(f)
  for row in reader:
    routes[row['route_short_name']] = row

# Write out merged Linestrings for each route
for trip_name, shapes in trip_shapes.items():
    route = routes[trip_name]
    for shape_id, points in shapes.items():
      line = LineString(points)
      # Insert into the database
      cur.execute("INSERT INTO shapes (name, geom) VALUES(%s, ST_GeomFromText(%s, 4326))", (trip_name, dumps(line)))

# Write the inserts
conn.commit()

# Let PostGIS do the linestring merge
cur.execute("SELECT name, ST_AsGeoJSON(ST_LineMerge(ST_UNION(geom))) as geojson FROM shapes GROUP BY name ORDER BY name ASC")

for row in cur.fetchall():
  route_name, raw_json = row
  route = routes[route_name]
  geojson = json.loads(raw_json)
  
  # Write to disk
  with open('route_shapes/'+route_name+'.geojson', 'w+') as f:
    f.write(json.dumps(geojson))

conn.close()
