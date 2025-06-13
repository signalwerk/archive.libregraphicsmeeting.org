$(document).ready(function() {

	var fields = new Array (
		"form_first_name",
		"form_last_name",
		"form_address1",
		"form_email",
		"form_org_proj",
		"form_city",
		"form_country",
		"form_pcode"
	);
	
	
	$("#signup_submit").click(function () {
		for(var a = 0; a < fields.length; a++)
		{
			if ($("#" + fields[a]).val() == '')
			{
				alert('Pleas, fill all required gaps!');
				return false;
			}
		}
	});
	
});