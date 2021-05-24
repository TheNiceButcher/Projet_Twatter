DROP DATABASE IF EXISTS twatter;
DROP USER IF EXISTS twattos;
CREATE USER twattos LOGIN PASSWORD 'pwd';
CREATE DATABASE twatter;
\c twatter twattos localhost;
CREATE TABLE Utilisateur (
	pseudo TEXT PRIMARY KEY,
	avatar TEXT DEFAULT 'default.jpeg',
	mot_de_passe TEXT NOT NULL
);
CREATE TABLE Message (
	nmessage SERIAL PRIMARY KEY,
	pseudo TEXT REFERENCES Utilisateur(pseudo),
	contenu TEXT NOT NULL,
	d_msg TIMESTAMP NOT NULL
);
CREATE TABLE Abonnements (
	abonne TEXT REFERENCES Utilisateur(pseudo),
	abonnement TEXT REFERENCES Utilisateur(pseudo),
	PRIMARY KEY(abonne,abonnement)
);
CREATE TABLE Likes (
	nmessage INT REFERENCES Message(nmessage),
	pseudo TEXT  REFERENCES Utilisateur(pseudo),
	reaction INT NOT NULL
);
INSERT INTO Utilisateur(pseudo,mot_de_passe) VALUES
('KCorp','champion'),
('Kameto','super'),
('Laink','yeah'),
('Elon-kun','tesla');
INSERT INTO Message(pseudo,contenu,d_msg) VALUES
('Elon-kun','vIVE TESLA', NOW()),
('Laink','@everyone Bienvenue', NOW());
INSERT INTO Abonnements(abonne,abonnement) VALUES
('Laink,Elon-kun');
