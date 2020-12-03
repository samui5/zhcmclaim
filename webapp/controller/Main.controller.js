sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";
	return Controller.extend("hcm.claim.controller.Main", {
		onInit: function(){
			this.oLocalModel = new JSONModel({
				tableData : [],
				screenFields:{
					"Month": "",
					"Year": "",
					"Text": ""
				}
			});
			this.getView().setModel(this.oLocalModel, "local");
			this.oDataModel = this.getView().getModel();
			var that = this;
			// this.oDataModel.read("/ClaimSet",{
			// 	success: function(data){
			// 		that.     
			// 		that.oLocalModel.setProperty("/tableData", aItems);
			// 	}
			// });
		},
		onAddRow: function(){
			var record = {
						        "Claimno": "",
						        "Pernr": "00000000",
						        "Seqnr": "000",
						        "Docstat": "",
						        "Createdate": "/Date(1606953600000)/",
						        "ClaimValue": "0.00",
						        "Wagetype": "",
						        "ClaimDate": "/Date(1606953600000)/",
						        "TimeStart": "",
						        "TimeEnd": "",
						        "Status": "",
						        "Purpose": "",
						        "Destination": "",
						        "Total": "0.00"
						};
			var aItems =  this.oLocalModel.getProperty("/tableData");
			aItems.push(record);
			this.oLocalModel.setProperty("/tableData", aItems);
			
		}
	});
});