(function() {
	// This function transforms a person object into the "standard" form
	function transformPerson(data, addToName) {
		var transformedData = {
			"id": data.person.id,
			"user": data.person.name + (addToName || ''),
			"role": data.person.role,
			"address": {
				"street": data.person.location.street,
				"city": data.person.location.city,
				"state": data.person.location.state,
				"zip": data.person.location.zip
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

 	document.querySelector('body').addEventListener("proxy-comp-data-received", function(event){
		if(event.detail.person) {
			// Stop the normal event flow because the data needs to be transformed
			event.preventDefault();

			// Send the data back to the target
			event.target.data = transformPerson(event.detail);
		}
	});

	document.querySelector('body').addEventListener("my-custom-event-name", function(event){
		if(event.detail.person) {
			// Stop the normal event flow because the data needs to be transformed
			event.preventDefault();

			// Send the data back to the target
			event.target.data = transformPerson(event.detail, "-custom event name");
		}
	})

})();
