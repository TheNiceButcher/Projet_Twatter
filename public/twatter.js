Vue.component('publication',{
	props:['publi','connected','pseudo','abos','avatars'],
	methods: {
		afficherdate: function(){
			var date = this.publi.d_msg;
			var result = "";
			result = date.substring(0,10).split("-").reverse().join("/");
			return result;
		},
		afficherheure : function () {
			var date = this.publi.d_msg;
			var result = "";
			result = date.substring(11,19);
			return result;
		},
		to_print : function () {
			//Non connecté -> on verifie si le message continent @everyone
			if(!this.connected && !this.publi.contenu.includes("@everyone"))
			{
				return false;
			}
			if (this.connected)
			{
				var name_to_at = [this.pseudo,"everyone"].concat(this.abos.slice());
				//Le message n'est pas ecrit par une personne que l'on suit
				if(this.publi.pseudo !== this.pseudo && !(this.abos.includes(this.publi.pseudo)))
				{
					for (var pseudo in name_to_at) {
						if(this.publi.contenu.includes("@" + name_to_at[pseudo]))
						{
							return true;
						}
					}
					return false;
				}
			}
			return true;
		}

	},
	computed: {
		like : function () {
			return 0;
		},
		dislike : function () {
			return 0;
		},
		avatar : function () {
			for (var i = 0; i < this.avatars.length; i++)
			{
				console.log(this.avatars[i]);
				if (this.avatars[i].pseudo === this.publi.pseudo)
				{
					console.log(this.avatars[i]);
					return "pictures/" + this.avatars[i].avatar;
				}
			}
		}
	},
	template:
	"<div v-if=to_print()> <span> <img class=avatar v-bind:src=avatar /> {{publi.pseudo}} </span> :" +
	"<pre> {{publi.contenu}} </pre> {{afficherdate()}} {{afficherheure()}} ({{like}} J'aime,{{dislike}} J'aime pas)</div>"
});
var twatter = new Vue({
	el: "#all",
	data:{
		connected: false,
		pseudo : '',
		messages: [],
		publi_en_cours: "",
		abos : [],
		avatar : '',
		avatars : [],
		unknown : false,
		dernier_import : new Date("1970-11-25")
	},
	//Toutes les 500 ms, on voit s'il y a des nouveaux messages
	mounted: function () {
		setInterval(() => {
			var d = this.dernier_import;
			var result = convert_date(d);
			$.get("http://localhost:8080/msg/",{date:result},function (data) {
				ajout_msg(data);
			});
			this.dernier_import = new Date();
			$.get("http://localhost:8080/abos",{pseudo: this.pseudo},function (data) {
				list_abos(data);
			});
			$.get("http://localhost:8080/avatars",{},function (data) {
				avatars(data);
			})
		},500);
	},
	methods: {
		publier: function (event) {
			console.log(this.publi_en_cours);
			$.post("http://localhost:8080/publi/",{pseudo:this.pseudo,message:this.publi_en_cours},
				function (data) {
				});
			this.publi_en_cours = "";
		},
		connexion : function () {
			var d = this.unknown;
			var s = $.post("http://localhost:8080/connect/",{name:this.pseudo},function(data){
				console.log(data);
				connect(data);
			});
		}
	}
});
//Renvoie la chaine de caractère correspondant à la Date d
function convert_date(d){
	var result = d.getFullYear() + "-";
	if (d.getMonth() < 9)
	{
		result += "0";
	}
	result += (d.getMonth() + 1) + "-";
	if(d.getDate() < 10)
	{
		result += "0";
	}
	result += d.getDate() + " ";
	if (d.getHours() < 10)
	{
		result += "0";
	}
	result += d.getHours() + ":";
	if(d.getMinutes() < 10)
	{
		result += "0"
	}
	result += d.getMinutes() + ":";
	if (d.getSeconds() < 10)
	{
		result += "0";
	}
	result += d.getSeconds();
	return result;
};
function connect(data) {
		if (data.length == 0)
		{
			twatter.unknown = true;
		}
		else {
			twatter.unknown = false;
			twatter.avatar = "/pictures/" + data[0].avatar;
			twatter.connected = true;
		}
	};
function ajout_msg(data) {
	var deja_ajout = [];
	for (var msg in twatter.messages) {
		deja_ajout.push(twatter.messages[msg].nmessage);
	}
	//console.log(deja_ajout);
	twatter.messages = data.filter(msg => ! (deja_ajout.includes(msg.nmessage))).concat(twatter.messages);
};
function list_abos(data) {
}
function avatars(data) {
	twatter.avatars = data;
}
