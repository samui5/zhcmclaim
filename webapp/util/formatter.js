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
			getFormattedDate: function(monthInc) {
				var dateObj = new Date();
				dateObj.setDate(dateObj.getDate());
				var dd = dateObj.getDate();
				dateObj.setMonth(dateObj.getMonth() + monthInc);
				var mm = dateObj.getMonth() + 1;
				var yyyy = dateObj.getFullYear();
				if (dd < 10) {
					dd = '0' + dd;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				return dd + '.' + mm + '.' + yyyy;
			},
			getSAPFormattedDate: function(newDate) {
				var dateObj = new Date(newDate);
				dateObj.setDate(dateObj.getDate());
				var dd = dateObj.getDate();
				dateObj.setMonth(dateObj.getMonth());
				var mm = dateObj.getMonth() + 1;
				var yyyy = dateObj.getFullYear();
				if (dd < 10) {
					dd = '0' + dd;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				return dd + '.' + mm + '.' + yyyy;
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
			},
			enabledWagetype: function(wagetype, status) {
				if (status === "1" || status === "2") {
					return false;
				} else if (wagetype === "2509") {
					return false;
				} else {
					return true;
				}
			}
		};
	}
);