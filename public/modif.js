$("input[type='color']").change(function () {
	$(".jumbotron").css({"background-color":$(this).val()});
	twatter.client.couleur = $(this).val();
});
$("#color-defaut").click(function () {
	$("input[type='color']").val("#E9ECEF");
});
$("#home_client").attr("href","/home/" + twatter.client.pseudo);
