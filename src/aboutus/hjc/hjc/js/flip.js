$(document).ready(function() {
	$(".flip").click(function(){

		var title=this.title;

		$(this).parent().parent().parent().next().slideToggle("normal");

		if(this.title=="open"){
			this.title="close";
			this.src="images/close.png";
		}
		else
		{
			this.title="open";
			this.src="images/open.png";
		}
		
	  });
});