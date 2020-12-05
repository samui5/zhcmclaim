sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"hcm/claim/util/formatter"
], function(Controller, JSONModel, formatter) {
	"use strict";
	return Controller.extend("hcm.claim.controller.Main", {
		onInit: function() {
			var that = this;
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oLocalModel = this.getOwnerComponent().getModel("local");
			this.oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var currentYear = (new Date()).getFullYear();
			var yearList = [];
			for (var i = 0; i < 20; i++) {
				yearList.push({
					year: currentYear - i
				});
			}
			this.oDataModel.read("/ValueHelpSet", {
				success: function(data) {
					that.oLocalModel.setProperty("/empId", data.results[0].Text);
					that.oLocalModel.setProperty("/calendar/years", yearList);
					// var header = {
					// 	Pernr: "",
					// 	Docstat: ""
					// };
					// that.getView().getModel("local").setProperty("/header", header);
				},
				error: function(err) {
					sap.m.MessageToast.show("Loading failed " + err);
				}

			});
		},
		formatter: formatter,
		_onRouteMatched: function() {

		},
		onAddRow: function() {
			var date = new Date();
			// var record = this.getView().getModel("local").getProperty("/record");
			var record = {
				"Createdate": "",
				"ClaimAmount": "0.00",
				"Wagetype": "C",
				"ClaimDate": "",
				"TimeStart": "00:00",
				"TimeEnd": (date.getHours()) + ":" + date.getMinutes(),
				"Status": "0",
				"Purpose": "",
				"Destination": "",
				"Comments": "",
				"To_Attachments": []
			};
			record.Createdate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
			var aItems = this.getView().getModel("local").getProperty("/tableData");
			aItems.push(record);
			this.getView().getModel("local").setProperty("/tableData", aItems);
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		},
		onLiveChange: function() {
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		},
		onSave: function() {
			var that = this;
			var header = this.getView().getModel("local").getProperty("/header");
			var payload = {
				"Cmonth": this.getView().byId('idMonth').getSelectedKey(), //dropdown
				"Cyear": this.getView().byId('idYear').getSelectedKey(), //dropdown
				"Docstat": header.Docstat, //0 - Draft  , Submit button 0-->1, In case of Submit pura screen lock
				"Total": "0.00", //blank
				"To_Items": []
			};
			var itemsPayload = [];
			var items = this.getView().getModel("local").getProperty("/tableData");
			items.forEach(function(item) {
				if (item.Wagetype === "C") {
					item.Purpose = "";
					item.Destination = "";
				}
				itemsPayload.push({
					"Createdate": new Date(item.Createdate), //blank
					"Wagetype": item.Wagetype, //screen - table
					"TimeStart": item.TimeStart, //screen - table
					"TimeEnd": item.TimeEnd, //screen - table
					"Status": item.Status, //blank
					"Purpose": item.Purpose, //screen - table
					"Destination": item.Destination, //screen - table
					"ClaimAmount": item.ClaimAmount, //screen - table
					"To_Attachments": []
				});
			});
			payload.To_Items = itemsPayload;
			this.oDataModel.create("/ClaimSet", payload, {
				success: function(data) {
					header = {
						Pernr: data.Pernr,
						Claimno: data.Claimno,
						Claimid: data.Claimid,
						Docstat: data.Docstat === "" ? "0" : data.Docstat
					};
					that.getView().getModel("local").setProperty("/header", header);
					that.getView().byId("idonSave").setEnabled(false);
					that.getView().byId("idonSubmit").setEnabled(true);
					sap.m.MessageToast.show(that.oResource.getText("Success"));
				},
				error: function() {
					sap.m.MessageToast.show(that.oResource.getText("Error"));
				}
			});
		},
		onSubmit: function() {
			var that = this;
			// var header = {
			// 	Pernr: "",
			// 	Docstat: "1"
			// };
			// that.getView().getModel("local").setProperty("/header", header);
			var header = this.getView().getModel("local").getProperty("/header");
			var payload = {
				Docstat: "1"
			};
			this.oDataModel.update("/ClaimSet('" + header.Claimid + "')", payload, {
				success: function(data) {
					that.getView().getModel("local").setProperty("/header/Docstat", "1");
					that.getView().byId("idonSave").setEnabled(false);
					that.getView().byId("idonSubmit").setEnabled(false);
					sap.m.MessageToast.show(that.oResource.getText("Success"));
				},
				error: function() {
					sap.m.MessageToast.show(that.oResource.getText("Error"));
				}
			});
		},
		onSelectPhoto: function(oEvent) {
			var that = this;
			// move selected row data to global variable
			// this.selRow = oEvent.getSource().getBindingContext().getObject();
			// var relPath = oEvent.getSource().getBindingContext().getPath() + ("/ToPhotos");
			that.photoPopup = new sap.ui.xmlfragment("hcm.claim.fragments.PhotoUploadDialog", that);
			that.getView().addDependent(that.photoPopup);
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 		relPath, "GET", {}, {}, this)
			// 	.then(function(oData) {
			// 		if (!that.photoPopup) {
			// 			that.photoPopup = new sap.ui.xmlfragment("hcm.claim.fragments.PhotoUploadDialog", that);
			// 			that.getView().addDependent(that.photoPopup);
			// 		}
			// 		var oModelPhoto = new JSONModel();
			// 		oModelPhoto.setData(oData.results[0]);
			// 		that.getView().setModel(oModelPhoto, "photo");
			// 		that.photoPopup.open();
			// 	}).catch(function(oError) {
			// 		that.getView().setBusy(false);
			// 		// var oPopover = that.getErrorMessage(oError);
			// 	});
		},
		// onUploadChange: function(oEvent) {
		// 	debugger;
		// 	var files = oEvent.getParameter("files");
		// 	var that = this;
		// 	if (!files.length) {

		// 	} else {
		// 		for (var i = 0; i < files.length; i++) {
		// 			var reader = new FileReader();
		// 			reader.onload = function(e) {
		// 				try {
		// 					var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
		// 					console.log(vContent);
		// 				} catch (e) {

		// 				}
		// 			};
		// 			// var img = {
		// 			// 	"Claimno" : "000000",
		// 			// 	"Pernr" : "0000",
		// 			// 	"Seqnr" : "000",
		// 			// 	"Type" : "document-pdf",
		// 			// 	"Content" : vContent
		// 			// };
		// 			reader.readAsDataURL(files[i]);

		// 		}
		// 	}
		// },
		onDeleteRow: function(oEvent) {
			var map = new Map();
			var sPaths = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			oEvent.getSource().getParent().getParent().removeSelections();
			var records = this.getView().getModel("local").getProperty("/tableData");
			records.forEach(function(item, index) {
				map.set(index.toString(), item);
			});
			sPaths.forEach(function(item) {
				map.delete(item.match(/\d/g)[0]);
			});
			this.getView().getModel("local").setProperty("/tableData", Array.from(map.values()));
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		}
	});
});