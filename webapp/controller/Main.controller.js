sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";
	return Controller.extend("hcm.claim.controller.Main", {
		onInit: function() {
			// this.oLocalModel = new JSONModel({
			// 	tableData : [],
			// 	screenFields:{
			// 		"Month": "",
			// 		"Year": "",
			// 		"Text": ""
			// 	}
			// });
			// this.getView().setModel(this.oLocalModel, "local");
			this.oDataModel = this.getView().getModel();
			// var that = this;
			// this.oDataModel.read("/ClaimSet",{
			// 	success: function(data){
			// 		that.     
			// 		that.oLocalModel.setProperty("/tableData", aItems);
			// 	}
			// });
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
				"Wagetype": "",
				"ClaimDate": "",
				"TimeStart": "",
				"TimeEnd": "",
				"Status": "",
				"Purpose": "",
				"Destination": "",
				"Total": "0.00"
			};
			record.Createdate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
			var aItems = this.getView().getModel("local").getProperty("/tableData");
			aItems.push(record);
			this.getView().getModel("local").setProperty("/tableData", aItems);
		},
		onDeleteRow: function(oEvent) {
			var map = new Map();
			var sPaths = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			oEvent.getSource().getParent().getParent().removeSelections();
			var records = this.getView().getModel("local").getProperty("/tableData");
			records.forEach(function(item, index) {
				map.set(index.toString(), item);
			});
			var newRecords = [];
			sPaths.forEach(function(item) {
				map.delete(item.match(/\d/g)[0]);
			});
			this.getView().getModel("local").setProperty("/tableData", Array.from(map.values()));
		}
	});
});