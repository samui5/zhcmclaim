sap.ui.define([
	],
	function() {

		return {
			
			statusText : function(num){
				var text = {
					0 : "Draft",
					1 : "Approved",
					2 : "Rejected"
				};
				return text[num];
			},
			statusState : function(num){
				var state = {
					0 : "Information",
					1 : "Success",
					2 : "Error"
				};
				return state[num];
			},
			statusIcon : function(num){
				var state = {
					0 : "sap-icon://pending",
					1 : "sap-icon://message-success",
					2 : "sap-icon://message-error"
				};
				return state[num];
			}
		};
	}
);