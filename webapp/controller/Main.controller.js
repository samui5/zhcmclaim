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
				"Claimno": "",
				"Pernr": "00000000",
				"Seqnr": "000",
				"Docstat": "",
				"Createdate": "",
				"ClaimValue": "0.00",
				"Wagetype": "C",
				"ClaimDate": "",
				"TimeStart": "00:00",
				"TimeEnd": (date.getHours()) + ":" + date.getMinutes(),
				"Status": "0",
				"Purpose": "",
				"Destination": "",
				"Total": "0.00"
			};
			record.Createdate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
			var aItems = this.getView().getModel("local").getProperty("/tableData");
			aItems.push(record);
			this.getView().getModel("local").setProperty("/tableData", aItems);
		},
		onSave: function() {
			var that = this;
			var payload = {
				"Claimno": "blank", //same
				"Pernr": "00000000", //same
				"Cmonth": this.getView().byId('idMonth').getSelectedKey(), //dropdown
				"Cyear": this.getView().byId('idYear').getSelectedKey(), //dropdown
				"Docstat": "", //blank
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
					"Claimno": "", //blank
					"Pernr": "00000000", //blank
					"Seqnr": "000", //blank
					"Createdate": new Date(item.Createdate), //blank
					"Wagetype": item.Wagetype, //screen - table
					"TimeStart": item.TimeStart, //screen - table
					"TimeEnd": item.TimeEnd, //screen - table
					"Status": item.Status, //blank
					"Purpose": item.Purpose, //screen - table
					"Destination": item.Destination, //screen - table
					"Total": item.Total, ////screen - table
					"ClaimAmount": item.ClaimAmount, //screen - table
					"To_Attachments": [

					]
				});
			});
			payload.To_Items = itemsPayload;
			this.oDataModel.create("/ClaimSet", payload, {
				success: function() {
					sap.m.MessageToast.show(that.oResource.getText("Success"));
				},
				error: function() {
					sap.m.MessageToast.show(that.oResource.getText("Error"));
				}
			});
		},
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
		}
	});
});