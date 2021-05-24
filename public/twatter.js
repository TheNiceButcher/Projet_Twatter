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

				var abos = this.client.abos;
				var name_to_at = [pseudo,"everyone"].concat(abos.slice());
				if(this.global.filtres.atclient && this.publi.pseudo == this.client.pseudo)
				{
					return true;
				}
				//Le message n'est pas ecrit par une personne que l'on suit
				if(!(abos.includes(this.publi.pseudo)))
				{
					for (var pseudo in name_to_at) {
						if(this.publi.contenu.includes("@" + name_to_at[pseudo]))
						{
							return true;
						}
					}
					return false;
				}
				return true;

		},
		abonne : function () {
			$.get("http://localhost:8080/abonne",{abonne : this.client.pseudo, abonnement : this.publi.pseudo},
				function (data) {

				});
		},
		desabonne : function () {
			$.get("http://localhost:8080/desabonne",{abonne : this.client.pseudo, abonnement : this.publi.pseudo },
				function (data) {

				});
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
					return "/pictures/" + this.global.avatars[i].avatar;
				}
			}
		},
		jaimepas : function () {
			$.get("http://localhost:8080/disliked",{pseudo : this.client.pseudo,nmessage : this.publi.nmessage},
			function (){});
		},
		non_abonne : function () {
			return this.client.connected && !this.client.abos.includes(this.publi.pseudo) && this.client.pseudo != this.publi.pseudo;
		},
		desabonnable : function () {
			return this.client.connected && this.client.abos.includes(this.publi.pseudo) && this.client.pseudo != this.publi.pseudo;
		}
	},
	template:
	"<div v-if=to_print() class = 'publi'> <span> <img class=avatar v-bind:src=avatar /> {{publi.pseudo}}" +
	"<button v-on:click='abonne' v-if=non_abonne>S'abonner</button> <button v-on:click='desabonne' v-if=desabonnable>Se desabonner</button> </span> :" +
	"<pre> {{publi.contenu}} </pre> {{afficherdate()}} {{afficherheure()}} ({{like}} J'aime,{{dislike}} J'aime pas)"
	+"<div v-if=\"client.pseudo!=publi.pseudo\" > <input type=\"checkbox\" v-model=\"liked\"> Jaime"
	+"<input type=\"checkbox\" v-model=\"disliked\"> Jaime pas</div></div>"
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
				ateveryone : true,
				atclient : true,
				atpseudo : false,
				user : "",
				hashtag : false,
				nomhash : "",
				ouet : "ou",
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
			$.get("http://localhost:8080/abos",{pseudo: this.client.pseudo},function (data) {
				list_abos(data);
			});
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
function list_abos(data) {
	twatter.client.abos = data;
}
function avatars(data) {
	twatter.global.avatars = data;
}
function like(data) {
	twatter.global.likes = data;
}
function dislike(data) {
	twatter.global.dislikes = data;
}
function reactions(data) {
	twatter.client.reactions = data;
}
function get_name_client() {
			var url = window.location.href;
			var i = url.lastIndexOf('/')+1;
			twatter.client.connected = true;
			twatter.client.pseudo = url.substring(i);
	};
get_name_client();
$.get("http://localhost:8080/avatar",{pseudo : twatter.client.pseudo},
	function (data) {
		avatar(data);
});
function avatar(data){
	twatter.client.avatar = "/pictures/" + data[0].avatar;
}
