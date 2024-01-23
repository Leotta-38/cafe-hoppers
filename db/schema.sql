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
  user_id INTEGER
);