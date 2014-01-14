## Madison Metro GeoJSON routes

GeoJSON for each route is in the **route_shapes** directory

## Developers

You'll need Python 2.x, and the shapely library

[https://pypi.python.org/pypi/Shapely](https://pypi.python.org/pypi/Shapely)

Download the gtfs files from here:

[http://www.cityofmadison.com/metro/Apps/terms.cfm](http://www.cityofmadison.com/metro/Apps/terms.cfm)

and unzip the archive to a folder named **gtfs** in the root of the project

Run the importer:

```bash
python import.py
```

This will re-generate the geojson files in **route_shapes** basd on the gtfs data.
