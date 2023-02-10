PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
	id INTEGER PRIMARY KEY ASC,
	name VARCHAR(40) UNIQUE
);

CREATE TABLE IF NOT EXISTS Exercises (
	id INTEGER PRIMARY KEY ASC,
	userId INTEGER,
	description VARCHAR(40),
	duration INTEGER,
	date TEXT DEFAULT (datetime('now','localtime')),

	FOREIGN KEY (userID) REFERENCES Users(id)
);
