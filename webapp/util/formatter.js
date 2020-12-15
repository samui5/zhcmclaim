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
			convertPDFToUrl: function(vContent) {
				var decodedPdfContent = atob(vContent.replace("data:application/pdf;base64,", ""));
				var byteArray = new Uint8Array(decodedPdfContent.length);
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}
				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});
				jQuery.sap.addUrlWhitelist("blob");
				return URL.createObjectURL(blob);
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
				if (newDate) {
					var dateObj = newDate;
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
				}

			},
			displaySAPDate: function() {

			},
			statusIcon: function(num) {
				var state = {
					"": "sap-icon://edit",
					"0": "sap-icon://edit",
					"1": "sap-icon://message-success",
					"2": "sap-icon://complete",
					"3": "sap-icon://decline"
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
			},
			attachBtnText: function(attachment) {
				if (attachment) {
					return attachment.length > 0 ? "Attached" : "Attach";
				} else {
					return "Attach";
				}

			},
			attachBtnType: function(attachment) {
				if (attachment.length>0 && attachment[0].Stream) {
					return "Attention";
				} else if(attachment.length>0) {
					return "Accept";
				}
				return "Reject";
			},
			enabledUploadBtn: function(attachment, status) {
				if (attachment.length > 0 || status === "" || status === "0") {
					return true;
				}
				return false;
			}

		};
	}
);