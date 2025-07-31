-- migrations/0000_init.sql

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diagrams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE diagram_collaborators (
  diagram_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (diagram_id, user_id),
  FOREIGN KEY (diagram_id) REFERENCES diagrams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE auth_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
