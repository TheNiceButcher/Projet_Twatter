const express = require('express');
const server = new express();
const json = require('json');
var bodyparser = require('body-parser');
const {Client} = require('pg');
const client = new Client({
  user: 'twattos',
  host: 'localhost',
  database: 'twatter',
  password: 'pwd',
  port: 5432,
});
client.connect();
server.use(express.static('public'));
server.use(bodyparser.urlencoded({ extended: false }));
server.get("/",function (req,res) {
	res.sendFile('twatter.html',{root:"public"});
});
server.post("/connect",function (req,res) {
	console.log("Connexion de " + req.body.name);
	var requete = 'SELECT * FROM Utilisateur WHERE pseudo LIKE \'' + req.body.name + '\';';
	var r = client.query(requete,function (err,resp) {
		if(err){
			console.log(err);
			return;
		}
		var r = resp.rows;
		res.json(r);
	});
});
server.get("/msg", function (req,res) {
	var d = req.query.date;
	var requete = 'SELECT * FROM Message WHERE d_msg > \'' + req.query.date + '\' ORDER BY nmessage DESC;';
	var t = [];
	var r = client.query(requete,function(err,resp){
		if(err){
			console.log(err);
			return;
		}
		var r = resp.rows;
		res.json(r);
	});
});
server.get("/abos",function (req,res) {
	var d = req.query.pseudo;
	var requete = 'SELECT abonnement FROM Abonnements WHERE abonne LIKE \'' + d + '\';';
	var r = client.query(requete,function (err,resp) {
		if(err){
			console.log(err);
			return;
		}
		var r = resp.rows;
		res.json(r);
	});
});
server.post("/publi",function (req,res) {
	const pseudo = req.body.pseudo;
	const msg = req.body.message;
	var requete = 'INSERT INTO Message(pseudo,contenu,d_msg) VALUES (\'' + pseudo + '\',\'' + msg + '\',NOW());'
	client.query(requete,function (err,resp){
		if(err){
			console.log(err);
			return;
		}
	});
});
server.get("/avatars",function (req,res) {
	var requete = 'SELECT * FROM Utilisateur;';
	client.query(requete,function (err,resp){
		if(err){
			console.log(err);
			return;
		}
		res.json(resp.rows);
	});
});
server.listen(8080);
