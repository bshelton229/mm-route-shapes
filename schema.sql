DROP TABLE IF EXISTS shapes;

CREATE TABLE shapes
(
  id serial NOT NULL,
  name character varying(255),
  geom geometry(LineString,4326)
)
WITH (
  OIDS=FALSE
);


-- Index: shape_name

CREATE INDEX shape_name
  ON shapes
  USING btree
  (name COLLATE pg_catalog."default");

