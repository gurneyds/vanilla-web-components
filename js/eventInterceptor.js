(function() {
	// This function transforms a person object into the "standard" form
	function transformPerson(data) {
		var transformedData = {
			"id": data.person.id,
			"user": data.person.name,
			"role": data.person.role,
			"address": {
				"street": data.person.addresses[0].street,
				"city": data.person.addresses[0].city,
				"state": data.person.addresses[0].state,
				"zip": data.person.addresses[0].zip
			},
			"contact" : {
				"phone": {
					"home": data.person.details.phone.home,
					"office": data.person.details.phone.office,
					"cell": data.person.details.phone.cell
				},
				"email": data.person.online.emailAddress,
				"web": data.person.online.website
			}
		}
		return transformedData;
	}

 	document.querySelector('body').addEventListener("data-received", function(event){
		if(event.detail.person) {
			// Stop the normal event flow because the data needs to be transformed
			event.preventDefault();

			// Send the data back to the target
			event.target.data = transformPerson(event.detail);
		}
	})
})();
