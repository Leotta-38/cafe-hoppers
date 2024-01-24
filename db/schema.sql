CREATE DATABASE cafehoppers;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username TEXT,
  email TEXT,
  hashed_password TEXT,
  icon_url TEXT
);

CREATE TABLE cafes(
  id SERIAL PRIMARY KEY,
  name TEXT,
  gmap_url TEXT,
  phone TEXT,
  website TEXT,
  date TEXT,
  user_id INTEGER,
  ave_review_point TEXT
);

CREATE TABLE comments(
  id SERIAL PRIMARY KEY,
  comment TEXT,
  cafe_id INTEGER,
  user_id INTEGER,
  date TEXT,
  review_point INTEGER,
  likes INTEGER
);

CREATE TABLE photos(
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  cafe_id INTEGER,
  user_id INTEGER,
  comment_id INTEGER,
  date TEXT,
  likes INTEGER
);

