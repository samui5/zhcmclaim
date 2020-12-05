sap.ui.define([],
	function() {

		return {

			statusText: function(num) {
				var text = {
					"0": "Draft",
					"1": "Submitted",
					"2": "Approved",
					"3": "Rejected"
				};
				return num === "" ? text["0"] : text[num];
			},
			statusState: function(num) {
				var state = {
					"": sap.ui.core.ValueState.Information,
					"0": sap.ui.core.ValueState.Success,
					"1": sap.ui.core.ValueState.Success,
					"2": sap.ui.core.ValueState.Success,
					"3": sap.ui.core.ValueState.Error
				};
				return state[num];
			},
			statusIcon: function(num) {
				var state = {
					"": "sap-icon://edit",
					"0": "sap-icon://edit",
					"1": "sap-icon://message-success",
					"2": "sap-icon://message-success",
					"3": "sap-icon://message-error"
				};
				return state[num];
			},
			enabledItem: function(num) {
				if (num === "" || num === "0") {
					return true;
				} else {
					return false;
				}
			}
		};
	}
);