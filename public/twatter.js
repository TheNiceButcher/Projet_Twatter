Vue.component('publication',{
	props:['publi','client','global'],
	data : function () {
			return {
				reaction : 0
			}
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
		filtres_defaut : function () {
			var f = this.global.filtres;
			return f.ateveryone == true && f.atclient == true && f.atpseudo == false && f.hashtag == false &&f.abo == true;
		},
		to_print_everyone : function () {
			return this.publi.contenu.includes("@everyone");
		},
		to_print_atclient : function () {
			return this.publi.contenu.includes("@" + this.client.pseudo);
		},
		to_print_hashtag : function () {
			return this.publi.pseudo.includes("#" + this.global.filtres.nomhash);
		},
		to_print_pseudo : function(){
			return this.publi.pseudo === this.global.filtres.user;
		},
		to_print_abos : function () {
			return this.client.abos.includes(this.publi.pseudo);
		},
		to_print : function () {
				if(this.global.filtres.ouet == "ou")
				{
					if (this.filtres_defaut())
					{
						return this.to_print_everyone() || this.to_print_abos() || this.to_print_atclient() || this.publi.pseudo == this.client.pseudo;
					}
					if (this.global.filtres.ateveryone && this.to_print_everyone())
						return true;
					if (this.global.filtres.atclient && this.to_print_atclient()){
						return true;
					}
					if (this.global.filtres.hashtag && this.to_print_hashtag()){
						return true;
					}
					if (this.global.filtres.abo && this.to_print_abos()){
						return true;
					}
					if (this.global.filtres.atpseudo && this.to_print_pseudo())
						return true;
					return false;
				}
				if(this.global.filtres.ouet == "et")
				{
					if (this.global.filtres.ateveryone && !this.to_print_everyone())
						return false;
					if (this.global.filtres.atclient && !this.to_print_atclient()){
						return false;
					}
					if (this.global.filtres.hashtag && !this.to_print_hashtag()){
						return false;
					}
					if (this.global.filtres.abo && !this.to_print_abos()){
						return false;
					}
					if (this.global.filtres.atpseudo && !this.to_print_pseudo())
						return false;
					return true;
				}


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
		},
		react : function () {
				$.get("http://localhost:8080/react",{pseudo : this.client.pseudo,nmessage : this.publi.nmessage,reaction : this.reaction},
				function (data){
				});
		},
		profile : function () {
			twatter.global.filtres.atpseudo = true;
			twatter.global.filtres.atclient = false;
			twatter.global.filtres.user = this.publi.pseudo;
			twatter.global.filtres.abo = false;
			twatter.global.filtres.ateveryone = false;
		},
		repondre : function () {
			twatter.publi_en_cours = "@" + this.publi.pseudo;
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
					return this.global.avatars[i].avatar;
				}
			}
		},
		non_abonne : function () {
			return this.client.connected && !this.client.abos.includes(this.publi.pseudo) && this.client.pseudo != this.publi.pseudo;
		},
		desabonnable : function () {
			return this.client.connected && this.client.abos.includes(this.publi.pseudo) && this.client.pseudo != this.publi.pseudo;
		},
		idmess : function () {
				return "mess" + this.publi.nmessage;
		},

	},
	template:
	"<div v-if=to_print() class='publi' v-bind:id=idmess> <span> <img class=avatar v-bind:src=avatar /> <p v-on:click='profile'>{{publi.pseudo}}</p>" +
	"<button v-on:click='abonne' v-if=non_abonne>S'abonner</button> <button v-on:click='desabonne' v-if=desabonnable>Se desabonner</button> </span>" +
	"<pre> {{publi.contenu}} </pre> {{afficherdate()}} {{afficherheure()}} ({{like}} J'aime,{{dislike}} J'aime pas)"
	+"<div v-if=\"client.pseudo!=publi.pseudo\" > <input type=\"radio\" v-model=\"reaction\" v-on:change='react' value =1> J'aime"
	+"<input type=\"radio\" v-model=\"reaction\" v-on:change='react' value =-1> J'aime pas <input type='radio' v-model='reaction' value = 0 v-on:change='react'></div>"
	+ "<a href='#poste'><button v-if='client.pseudo!=publi.pseudo' v-on:click='repondre'>Repondre</button></a></div>"
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
				abo : true,
				ouet : "ou",
			}

		},
		client : {
			connected: false,
			pseudo : '',
			avatar : '',
			unknown : false,
			reactions : [],
			abos : [],
			modif_profil : "/edit_profil/",
			couleur : "",
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
		},500);
	},
	methods: {
		publier: function (event) {
			console.log(this.publi_en_cours);
			if (this.publi_en_cours != "")
			{
				$.post("http://localhost:8080/publi/",{pseudo:this.client.pseudo,message:this.publi_en_cours.replace("'","\'\'")},
					function (data) {
					});
				this.publi_en_cours = "";
			}
		},
		defaut: function (event) {
			this.global.filtres.ateveryone = true;
			this.global.filtres.atclient = true;
			this.global.filtres.atpseudo = false;
			this.global.filtres.user = "";
			this.global.filtres.hashtag = false;
			this.global.filtres.nomhash = "";
			this.global.filtres.abo = true;
			this.global.filtres.ouet = "ou";
		},
		retour_sauver : function () {
			console.log("Salut " + this.client.couleur);
			$.get("http://localhost:8080/modif_profil",{pseudo : this.client.pseudo, avatar : this.client.avatar, couleur : this.client.couleur},
				function (data) {
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
function ajout_msg(data) {
	var deja_ajout = [];
	for (var msg in twatter.messages) {
		deja_ajout.push(twatter.messages[msg].nmessage);
	}
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
/*function reaction(nmessage,pseudo){
	return $.get("http://localhost:8080/react",{pseudo : pseudo,nmsg : nmessage},function () {

	});
}*/
function get_name_client() {
	var url = window.location.href;
	var i = url.lastIndexOf('/')+1;
	twatter.client.connected = true;
	twatter.client.pseudo = url.substring(i);
	twatter.client.modif_profil += twatter.client.pseudo;
};
get_name_client();
$.get("http://localhost:8080/info_client",{pseudo : twatter.client.pseudo},
	function (data) {
		avatar(data);
});
$.get("http://localhost:8080/react_client",{pseudo : twatter.client.pseudo},function (data) {
	reactions(data);
});
function reactions(data) {
	twatter.client.reactions = data;
}
function avatar(data){
	twatter.client.avatar = data[0].avatar;
	twatter.client.couleur = data[0].couleur;
	$(".jumbotron").css({"background-color":data[0].couleur});
}
