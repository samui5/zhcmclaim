sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"hcm/claim/util/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("hcm.claim.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf hcm.claim.view.Worklist
		 */
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachMatched(this.herculis, this);
		},
		herculis: function() {
			this.getView().getModel().refresh(true);
		},
		onNextItem: function(oEvent) {
			var selectedItem = oEvent.getParameter("listItem");
			var sPath = selectedItem.getBindingContextPath();
			var sIndex = sPath.split("/")[sPath.split("/").length - 1];
			this.oRouter.navTo("main", {
				claimid: sIndex
			});
		},
		onSearch: function(oEvent) {
			var val = oEvent.getSource().getValue();
			// this.getView().byId("claims").getBinding("items").filter([new sap.ui.model.Filter("Claimno","Contains",val)]);
			this.getView().byId("claims").getBinding("items").filter([new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ,
				val)]);
		},
		onAdd: function() {
			this.oRouter.navTo("main", {
				claimid: "new"
			});
		},
		formatter: formatter

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf hcm.claim.view.Worklist
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf hcm.claim.view.Worklist
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf hcm.claim.view.Worklist
		 */
		//	onExit: function() {
		//
		//	}

	});

});