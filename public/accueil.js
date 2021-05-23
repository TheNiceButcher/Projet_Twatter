Vue.component('publication',{
	props:['publi','client','global'],
	data : function (){
		return {
		liked : this.client.reactions.includes({nmessage : this.publi.nmessage,reaction : 1}),
		disliked : this.client.reactions.includes({nmessage : this.publi.nmessage,reaction : -1})
		};
	},
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

			var connected = this.client.connected;
			var pseudo = this.client.pseudo;
			var abos = this.client.abos;
			//Non connecté -> on verifie si le message continent @everyone
			if(!connected && !this.publi.contenu.includes("@everyone"))
			{
				return false;
			}
			if (connected)
			{
				var name_to_at = [pseudo,"everyone"].concat(abos.slice());
				//Le message n'est pas ecrit par une personne que l'on suit
				if(this.publi.pseudo !== pseudo && !(abos.includes(this.publi.pseudo)))
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
			for (var i = 0; i < this.global.likes.length; i++)
			{
				if (this.global.likes[i].nmessage === this.publi.nmessage)
				{
					return this.global.likes[i].nlike;
				}
			}
			return 0;
		},
		dislike : function () {
			for (var i = 0; i < this.global.dislikes.length; i++)
			{
				if (this.global.dislikes[i].nmessage === this.publi.nmessage)
				{
					return this.global.dislikes[i].ndislike;
				}
			}
			return 0;
		},
		avatar : function () {
			for (var i = 0; i < this.global.avatars.length; i++)
			{
				if (this.global.avatars[i].pseudo === this.publi.pseudo)
				{
					return "pictures/" + this.global.avatars[i].avatar;
				}
			}
		}
	},
	template:
	"<div v-if=to_print() class = 'publi'> <span> <img class=avatar v-bind:src=avatar /> {{publi.pseudo}}" +
	"</span> : <pre> {{publi.contenu}} </pre> {{afficherdate()}} {{afficherheure()}} ({{like}} J'aime,{{dislike}} J'aime pas)</div>"
});
var twatter = new Vue({
	el: "#all",
	data:{
		messages: [],
		publi_en_cours: "",
		global : {
			avatars : [],
			likes : [],
			dislikes : [],
			filtres : {
				ateveryone : false,
				atclient : false,
				atpseudo : false,
				user : "",
				hashtag : false,
				nomhash : ""
			}

		},
		client : {
			connected: false,
			pseudo : '',
			avatar : '',
			unknown : false,
			reactions : [],
			abos : []
		},
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
			$.get("http://localhost:8080/avatars",function (data) {
				avatars(data);
			});
			$.get("http://localhost:8080/like",function(data){
				like(data);
			});
			$.get("http://localhost:8080/dislike",function(data){
				dislike(data);
			});
			/*$.get("http://localhost:8080/react_client",{pseudo : this.client.pseudo},function (data) {
				reactions(data);
			});*/
		},500);
	},
	methods: {
		publier: function (event) {
			console.log(this.publi_en_cours);
			$.post("http://localhost:8080/publi/",{pseudo:this.client.pseudo,message:this.publi_en_cours},
				function (data) {
				});
			this.publi_en_cours = "";
		},
		connexion : function () {
			var d = this.client.unknown;
			var s = $.post("http://localhost:8080/connect/",{name:this.client.pseudo},function(data){
				console.log(data);
				connect(data);
			});
		},
		deconnexion : function () {
			this.client.connected = false;
			this.client.pseudo = '';
			this.client.reactions = [];
			this.client.avatar = '';
			this.client.unknown = false;
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
function ajout_msg(data) {
	var deja_ajout = [];
	for (var msg in twatter.messages) {
		deja_ajout.push(twatter.messages[msg].nmessage);
	}
	//console.log(deja_ajout);
	twatter.messages = data.filter(msg => ! (deja_ajout.includes(msg.nmessage))).concat(twatter.messages);
};
function avatars(data) {
	twatter.global.avatars = data;
}
function like(data) {
	twatter.global.likes = data;
}
function dislike(data) {
	twatter.global.dislikes = data;
}
function get_name_client() {
			var url = window.location.href;
			if(url != "http://localhost:8080/")
			{
				var i = url.lastIndexOf('/')+1;
				console.log(url.substring(i+1));
				twatter.client.connected = true;
				twatter.client.pseudo = url.substring(i+1);
			}
	};
get_name_client();
