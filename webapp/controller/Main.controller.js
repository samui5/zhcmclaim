sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"hcm/claim/util/formatter",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, JSONModel, formatter, Dialog, MessageBox, MessageToast) {
	"use strict";
	return Controller.extend("hcm.claim.controller.Main", {
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("main").attachMatched(this._onRouteMatched, this);
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oLocalModel = this.getOwnerComponent().getModel("local");
			this.oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.itemCrudMap = new Map();
			this.itemCrudMap.set("Delete", new Set());
			this.itemCrudMap.set("Update", new Set());
			this.itemCrudMap.set("Attachment", new Set());
		},
		onNavButtonPress: function() {
			this.oRouter.navTo("master");
		},
		formatter: formatter,
		_onRouteMatched: function(oEvent) {
			var that = this;
			var path = oEvent.getParameter("arguments").claimid;
			var currentDate = new Date();
			var currentYear = currentDate.getFullYear();
			var currentMonth = currentDate.getMonth();
			var yearList = [];
			var monthList = [];
			if (path === "new") {
				that.oLocalModel.setProperty("/header", {
					"Pernr": "{unloaded}",
					"Claimno": "{unassigned}",
					"Claimid": "",
					"Docstat": ""
				});
				this.oDataModel.read("/ValueHelpSet", {
					success: function(data) {
						var months = that.oLocalModel.getProperty("/calendar/monthCollection");
						if (currentMonth === 0) {
							yearList = [{
								year: currentYear
							}, {
								year: currentYear - 1
							}];
							monthList = [months[currentMonth], months[11]];
						} else {
							yearList = [{
								year: currentYear
							}];
							monthList = [months[currentMonth], months[currentMonth - 1]];
						}
						that.oLocalModel.setProperty("/empId", data.results[0].Text);
						that.oLocalModel.setProperty("/calendar/years", yearList);
						that.oLocalModel.setProperty("/calendar/months", monthList);
						that.getView().getModel("local").setProperty("/tableData", []);
						that.getView().getModel("local").setProperty("/date", {
							minDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
							maxDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
						});
						that.getView().byId('idMonth').setSelectedKey(currentDate.getMonth() + 1);
					},
					error: function(err) {
						sap.m.MessageToast.show("Loading failed " + err);
					}
				});

			} else {
				this.oDataModel.read("/ValueHelpSet", {
					success: function(data) {
						that.oLocalModel.setProperty("/empId", data.results[0].Text);
					},
					error: function(err) {
						sap.m.MessageToast.show("Loading failed " + err);
					}
				});
				this.getView().setBusy(true);
				this.getView().getModel().read("/" + path, {
					urlParameters: {
						'$expand': 'To_Items,To_Items/To_Attachments'
					},
					success: function(data) {
						yearList = [{
							year: data.Cyear
						}];
						that.oLocalModel.setProperty("/calendar/years", yearList);
						that.oLocalModel.setProperty("/calendar/months", that.oLocalModel.getProperty("/calendar/monthCollection"));
						var header = {
							Claimid: data.Claimid,
							Claimno: data.Claimno,
							Cmonth: data.Cmonth,
							Cyear: data.Cyear,
							Docstat: data.Docstat,
							Pernr: data.Pernr,
							Total: data.Total,
							CreatedOn: that.formatter.getSAPFormattedDate(data.CreatedOn)
						};
						that.getView().getModel("local").setProperty("/header", header);
						data.To_Items.results.forEach(function(item, index) {
							data.To_Items.results[index].Createdate = new Date(item.Createdate);
							if (data.To_Items.results[index].To_Attachments.results.length > 0) {
								data.To_Items.results[index].To_Attachments = data.To_Items.results[index].To_Attachments.results;
								data.To_Items.results[index].To_Attachments[0].Content = atob(data.To_Items.results[index].To_Attachments[0].Content);
							}
						});
						that.getView().getModel("local").setProperty("/tableData", data.To_Items.results);
						that.getView().byId('idMonth').setSelectedKey(data.Cmonth);
						that.getView().byId('idYear').setSelectedKey(data.CYear);
						if (data.Docstat === "0") {
							that.getView().byId("idonSave").setEnabled(false);
							that.getView().byId("idonSubmit").setEnabled(true);
						} else {
							that.getView().byId("idonSave").setEnabled(false);
							that.getView().byId("idonSubmit").setEnabled(false);
						}
						that.getView().setBusy(false);
					},
					error: function(err) {
						that.getView().setBusy(false);
						MessageToast.show("Loading Failed");
					}
				});
			}
		},
		onDateChange: function(oEvent) {
			var currentDate = new Date();
			var month = this.getView().byId('idMonth').getSelectedKey();
			month = parseInt(month) - 1;
			if (currentDate.getMonth() === 0 && month === 11) {
				this.getView().byId('idYear').setSelectedKey(currentDate.getFullYear() - 1);
			}
			var year = this.getView().byId('idYear').getSelectedKey();
			this.getView().getModel("local").setProperty("/date", {
				minDate: new Date(year, month, 1),
				maxDate: new Date(year, month + 1, 0)
			});
		},
		aItems: [], // changes by Surya 06.12.2020
		onAddRow: function() {
			var month = this.getView().byId('idMonth').getSelectedKey();
			this.getView().byId('idMonth').setEnabled(false);
			var year = this.getView().byId('idYear').getSelectedKey();
			var date = new Date(year, parseInt(month) - 1, 1);
			var currentDate = new Date();
			// var record = this.getView().getModel("local").getProperty("/record");
			var record = {
				"Createdate": date,
				"ClaimAmount": "0.00",
				"Wagetype": "2509",
				"TimeStart": "00:00",
				"TimeEnd": (currentDate.getHours()) + ":" + currentDate.getMinutes(),
				"Status": "",
				"Purpose": "",
				"Destination": "",
				"Comments": "",
				"To_Attachments": [] // changes by Surya 06.12.2020
			};
			//record.Createdate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
			this.aItems = this.getView().getModel("local").getProperty("/tableData");
			this.aItems.push(record);
			this.getView().getModel("local").setProperty("/tableData", this.aItems);
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		},
		onLiveChange: function(oEvent) {
			var id = this.getView().getModel('local').getProperty(oEvent.getSource().getParent().getBindingContextPath()).ItemId;
			if (id) {
				this.itemCrudMap.get("Update").add(id);
			}
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		},
		onSave: function() {
			var header = this.getView().getModel("local").getProperty("/header");
			var items = this.getView().getModel("local").getProperty("/tableData");
			this.total = 0;
			for (var i = 0; i < items.length; i++) {
				this.total += parseFloat(items[i].ClaimAmount);
				if (parseFloat(items[i].ClaimAmount) < 1) {
					MessageBox.error("Claim amount must be greater than 0");
					return;
				}
			}
			if (header.Claimid) {
				this.onUpsert(header);
			} else {
				var that = this;
				var payload = {
					"Cmonth": this.getView().byId('idMonth').getSelectedKey(), //dropdown
					"Cyear": this.getView().byId('idYear').getSelectedKey(), //dropdown
					"Docstat": header.Docstat, //0 - Draft  , Submit button 0-->1, In case of Submit pura screen lock
					"Total": this.total, //blank
					"To_Items": []
				};
				var itemsPayload = [];
				if (items.length === 0) {
					MessageBox.alert("Please add a item first");
					return;
				}
				items.forEach(function(item) {
					if (item.Wagetype === "2509") {
						item.Purpose = "";
						item.Destination = "";
					}
					var claimDate = new Date();
					claimDate.setTime(item.Createdate);
					claimDate.setDate(claimDate.getDate() + 1);
					if (item.To_Attachments.length > 0) {
						delete item.To_Attachments[0].Stream;
						item.To_Attachments[0].Content = btoa(item.To_Attachments[0].Content);
					}
					itemsPayload.push({
						//"Createdate": new Date(date[2] + "." + date[1] + "." + date[0]), //blank
						"Createdate": claimDate,
						"Wagetype": item.Wagetype, //screen - table
						"TimeStart": item.TimeStart, //screen - table
						"TimeEnd": item.TimeEnd, //screen - table
						"Status": item.Status, //blank
						"Purpose": item.Purpose, //screen - table
						"Destination": item.Destination, //screen - table
						"ClaimAmount": item.ClaimAmount, //screen - table
						"To_Attachments": item.To_Attachments
					});
				});
				payload.To_Items = itemsPayload;
				this.getView().setBusy(true);
				this.oDataModel.create("/ClaimSet", payload, {
					success: function(data) {
						header = {
							Claimid: data.Claimid,
							Claimno: data.Claimno,
							Cmonth: data.Cmonth,
							Cyear: data.Cyear,
							Docstat: data.Docstat,
							Pernr: data.Pernr,
							Total: data.Total,
							CreatedOn: that.formatter.getSAPFormattedDate(data.CreatedOn)
						};
						that.getView().getModel("local").setProperty("/header", header);
						data.To_Items.results.forEach(function(item, index) {
							data.To_Items.results[index].Createdate = new Date(item.Createdate);
						});
						that.getView().getModel("local").setProperty("/tableData", data.To_Items.results);
						that.getView().byId("idonSave").setEnabled(false);
						that.getView().byId("idonSubmit").setEnabled(true);
						that.getView().setBusy(false);
						sap.m.MessageToast.show(that.oResource.getText("Claim Saved Successfully"));
					},
					error: function(oError) {
						that.getView().setBusy(false);
						MessageBox.error(JSON.parse(oError.responseText).error.message.value);
					}
				});
			}
		},
		onUpsert: function(header) {
			var that = this;
			var items = this.getView().getModel("local").getProperty("/tableData");
			var deleted = this.itemCrudMap.get("Delete");
			var updated = this.itemCrudMap.get("Update");
			var attachment = this.itemCrudMap.get("Attachment");
			var claimDate = new Date();
			var newItems = [];
			that.oDataModel.setDeferredGroups(["foo"]);
			var mParameters = {
				groupId: "foo",
				success: function(odata, resp) {
					//console.log(resp); 
					that.getView().byId("idonSave").setEnabled(false);
					that.getView().byId("idonSubmit").setEnabled(true);
					that.getView().setBusy(true);
					that.getView().getModel().read("/ClaimSet('" + header.Claimid + "')", {
						urlParameters: {
							'$expand': 'To_Items,To_Items/To_Attachments'
						},
						success: function(data) {
							var yearList = [{
								year: data.Cyear
							}];
							that.oLocalModel.setProperty("/calendar/years", yearList);
							that.oLocalModel.setProperty("/calendar/months", that.oLocalModel.getProperty("/calendar/monthCollection"));
							var oHeader = {
								Claimid: data.Claimid,
								Claimno: data.Claimno,
								Cmonth: data.Cmonth,
								Cyear: data.Cyear,
								Docstat: data.Docstat,
								Pernr: data.Pernr,
								Total: data.Total,
								CreatedOn: that.formatter.getSAPFormattedDate(data.CreatedOn)
							};
							that.getView().getModel("local").setProperty("/header", oHeader);
							data.To_Items.results.forEach(function(item, index) {
								data.To_Items.results[index].Createdate = new Date(item.Createdate);
								if (data.To_Items.results[index].To_Attachments.results.length > 0) {
									data.To_Items.results[index].To_Attachments = data.To_Items.results[index].To_Attachments.results;
									data.To_Items.results[index].To_Attachments[0].Content = atob(data.To_Items.results[index].To_Attachments[0].Content);
								}
							});
							that.getView().getModel("local").setProperty("/tableData", data.To_Items.results);
							that.getView().byId('idMonth').setSelectedKey(data.Cmonth);
							that.getView().byId('idYear').setSelectedKey(data.CYear);
							that.getView().setBusy(false);
							that.itemCrudMap.set("Delete", new Set());
							that.itemCrudMap.set("Update", new Set());
							that.itemCrudMap.set("Attachment", new Set());
							MessageToast.show("Data has been saved successfully");
						},
						error: function(err) {
							that.getView().setBusy(false);
							MessageToast.show("Loading Failed");
						}
					});
				},
				error: function(odata, resp) {
					//console.log(resp); 
					that.getView().setBusy(false);
					//Centralized Error Processing

				}
			};

			items.forEach(function(item) {
				item.Createdate = item.Createdate;
				if (updated.has(item.ItemId)) {
					var updatePayload = JSON.parse(JSON.stringify(item));
					delete updatePayload.To_Attachments;
					claimDate = new Date();
					claimDate.setTime(item.Createdate);
					claimDate.setDate(claimDate.getDate() + 1);
					updatePayload.Createdate = claimDate;
					that.oDataModel.update("/ClaimItemSet('" + item.ItemId + "')", updatePayload, mParameters
						// {
						// 	success: function(data) {
						// 		that.itemCrudMap.set("Update", new Set());
						// 		MessageToast.show("Update Success");
						// 		that.getView().byId("idonSave").setEnabled(false);
						// 		that.getView().byId("idonSubmit").setEnabled(true);
						// 	},
						// 	error: function(oError) {
						// 		MessageBox.error(JSON.parse(oError.responseText).error.message.value);
						// 		that.getView().byId("idonSave").setEnabled(true);
						// 		that.getView().byId("idonSubmit").setEnabled(false);
						// 	}
						// }
					);
				} else if (attachment.has(item.ItemId) && item.To_Attachments.length > 0) {
					var attachId = item.To_Attachments[0].AttachId;
					delete item.To_Attachments[0].Stream;
					item.To_Attachments[0].Content = btoa(item.To_Attachments[0].Content);
					if (attachId) {
						that.oDataModel.update("/AttachmentSet('" + attachId + "')", {
								ItemId: item.ItemId,
								Content: item.To_Attachments[0].Content
							}, mParameters
							// {
							// 	success: function(data) {
							// 		that.itemCrudMap.set("Update", new Set());
							// 		MessageToast.show("Attachment Update Success");
							// 		that.getView().byId("idonSave").setEnabled(false);
							// 		that.getView().byId("idonSubmit").setEnabled(true);
							// 	},
							// 	error: function(oError) {
							// 		MessageBox.error(JSON.parse(oError.responseText).error.message.value);
							// 		that.getView().byId("idonSave").setEnabled(true);
							// 		that.getView().byId("idonSubmit").setEnabled(false);
							// 	}
							// }
						);
					} else {
						that.oDataModel.create("/AttachmentSet", {
								ItemId: item.ItemId,
								Content: item.To_Attachments[0].Content
							}, mParameters
							// {
							// 	success: function(data) {
							// 		MessageToast.show("Attachment Added");
							// 		that.getView().byId("idonSave").setEnabled(false);
							// 		that.getView().byId("idonSubmit").setEnabled(true);
							// 	},
							// 	error: function(oError) {
							// 		MessageBox.error(JSON.parse(oError.responseText).error.message.value);
							// 		that.getView().byId("idonSave").setEnabled(true);
							// 		that.getView().byId("idonSubmit").setEnabled(false);
							// 	}
							// }
						);
					}
				} else if (!item.ItemId) {
					item.Claimid = header.Claimid;
					if (item.Wagetype === "2509") {
						item.Purpose = "";
						item.Destination = "";
					}
					claimDate = new Date();
					claimDate.setTime(item.Createdate);
					claimDate.setDate(claimDate.getDate() + 1);
					item.Createdate = claimDate;
					if (item.To_Attachments.length > 0) {
						delete item.To_Attachments[0].Stream;
						item.To_Attachments[0].Content = btoa(item.To_Attachments[0].Content);
					}
					newItems.push(item);
				}
			});
			if (newItems.length > 0) {
				var payload = header;
				delete payload.CreatedOn;
				payload.Total = this.total;
				payload.To_Items = newItems;
				that.oDataModel.create("/ClaimSet", payload, mParameters);
			}
			deleted.forEach(function(item) {
				that.getView().setBusy(true);
				that.oDataModel.remove("/ClaimItemSet('" + item + "')", mParameters
					// {
					// 	success: function(data) {
					// 		that.itemCrudMap.set("Delete", new Set());
					// 		MessageToast.show("Delete Success");
					// 		that.getView().byId("idonSave").setEnabled(false);
					// 		that.getView().byId("idonSubmit").setEnabled(true);
					// 		that.getView().setBusy(false);
					// 	},
					// 	error: function(oError) {
					// 		that.getView().setBusy(false);
					// 		MessageToast.show("Error In Delete");
					// 		that.getView().byId("idonSave").setEnabled(true);
					// 		that.getView().byId("idonSubmit").setEnabled(false);
					// 	}
					// }
				);
			});
			that.oDataModel.submitChanges(mParameters);

		},
		onSubmit: function() {
			var that = this;
			MessageBox.confirm("Do you want to Submit for Approval, Claim will be locked", function(oVal) {
				if (oVal === "OK") {
					var header = that.getView().getModel("local").getProperty("/header");
					var payload = {
						Docstat: "1"
					};
					that.getView().setBusy(true);
					that.oDataModel.update("/ClaimSet('" + header.Claimid + "')", payload, {
						success: function(data) {
							that.getView().getModel("local").setProperty("/header/Docstat", "1");
							var items = that.getView().getModel("local").getProperty("/tableData");
							items.forEach(function(item, index) {
								items[index].Status = "1";
							});
							that.getView().getModel("local").setProperty("/tableData", items);
							that.getView().byId("idonSave").setEnabled(false);
							that.getView().byId("idonSubmit").setEnabled(false);
							that.getView().setBusy(false);
							sap.m.MessageToast.show(that.oResource.getText("Success"));
						},
						error: function() {
							sap.m.MessageToast.show(that.oResource.getText("Error"));
						}
					});
				}
			});
		},
		// Start of changes  by Surya 06.12.2020
		onSelectPhoto: function(oEvent) {
			var that = this;
			that.photoPopup = new sap.ui.xmlfragment("hcm.claim.fragments.PhotoUploadDialog", that);
			that.getView().addDependent(that.photoPopup);
			that.photoPopup.open();
			// get the index of the row for which the attachment button has been clicked
			this.itemPath = oEvent.getSource().getParent().getBindingContextPath();
			var attachs = this.getView().getModel("local").getProperty(this.itemPath + "/To_Attachments");
			if (attachs.length > 0) {
				var attach = attachs[0];
				var oControl = that.photoPopup.getAggregation("content")[1];
				that.img.Content = attach.Content;
				if (attach.Stream === "" || attach.Stream === undefined) {
					attach.Stream = that.img.Stream = that.formatter.convertPDFToUrl(attach.Content);
				} else {
					that.img.Stream = attach.Stream;
				}

				oControl.setSource(that.img.Stream);
			}
		},

		selectedIndex: null,
		handleUploadPress: function(oEvent) {
			if (this.img.Content) {
				var item = this.getView().getModel("local").getProperty(this.itemPath);
				if (item.To_Attachments.length > 0 && item.To_Attachments[0].AttachId) {
					this.img.AttachId = item.To_Attachments[0].AttachId;
				}
				if (item.ItemId) {
					this.itemCrudMap.get("Attachment").add(item.ItemId);
				}
				this.getView().getModel("local").setProperty(this.itemPath + "/To_Attachments", [JSON.parse(JSON.stringify(this.img))]);
			}
			this.img = {};
			this.photoPopup.close();
			this.photoPopup.destroy();
			this.itemPath = "";
			this.getView().byId("idonSave").setEnabled(true);
			this.getView().byId("idonSubmit").setEnabled(false);
		},
		// close photo upload popup
		handleClosePress: function(oEvent) {
			// if (!this.photoPopup) {
			// 	this.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", this);
			// }
			// var oFileUploader = sap.ui.getCore().byId("idCoUploader");
			// oFileUploader.setValue("");
			this.img = {};
			this.photoPopup.close();
			this.photoPopup.destroy();
		},
		_onFileUploaderFileSizeExceed: function() {
			MessageBox.error("File Size should not exceed 5 MB");
		},
		// End of changes  by Surya 06.12.2020
		img: {
			"Stream": "",
			"Content": ""
		},
		onUploadChange: function(oEvent) {
			var files = oEvent.getParameter("files");
			var that = this;
			if (!files.length) {

			} else {
				for (var i = 0; i < files.length; i++) {
					var reader = new FileReader();
					var oControl = oEvent.getSource().getParent().getAggregation("content")[1];
					reader.onload = function(e) {
						try {
							var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
							that.img.Content = vContent;
							that.img.Stream = that.formatter.convertPDFToUrl(vContent);
							oControl.setSource(that.img.Stream);
						} catch (e) {

						}
					};
					reader.readAsDataURL(files[i]);
				}
			}
		},
		onDeleteRow: function(oEvent) {
			var that = this;
			var oTable = oEvent.getSource().getParent().getParent();
			var sPaths = oTable.getSelectedContextPaths();
			if (sPaths.length === 0) {
				sap.m.MessageToast.show("Please select an Claim Item");
				return;
			}
			oTable.removeSelections();
			MessageBox.confirm(" Do you want to delete the item?", function(sVal) {
				if (sVal === "OK") {
					var map = new Map();
					var records = that.getView().getModel("local").getProperty("/tableData");
					records.forEach(function(item, index) {
						map.set(index.toString(), item);
					});
					sPaths.forEach(function(item) {
						var id = map.get(item.match(/\d/g)[0]).ItemId;
						if (id) {
							that.itemCrudMap.get("Delete").add(id);
						}
						map.delete(item.match(/\d/g)[0]);
					});
					that.getView().getModel("local").setProperty("/tableData", Array.from(map.values()));
					that.getView().byId("idonSave").setEnabled(true);
					that.getView().byId("idonSubmit").setEnabled(false);
				}
			});
		},
		onClear: function() {
			this.oDataModel.callFunction("/FlushData", // function import name
				"GET", // http method
				{}, // function import parameters
				null,
				function(oData, response) {
					MessageBox.success("Table Flushed");
				}, // callback function for success
				function(oError) {});
		}
	});
});