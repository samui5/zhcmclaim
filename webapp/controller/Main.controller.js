sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"hcm/claim/util/formatter",
	"sap/m/Dialog"
], function(Controller, JSONModel, formatter,Dialog) {
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
		aItems: [], // changes by Surya 06.12.2020
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
				"To_Attachments": [ ] // changes by Surya 06.12.2020
			};
			record.Createdate = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
			this.aItems = this.getView().getModel("local").getProperty("/tableData");
			this.aItems.push(record);
			this.getView().getModel("local").setProperty("/tableData", this.aItems);
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
		// Start of changes  by Surya 06.12.2020
		onSelectPhoto: function(oEvent) {
			debugger;
			var that = this;
			if (!that.photoPopup) {
				that.photoPopup = new sap.ui.xmlfragment("hcm.claim.fragments.PhotoUploadDialog", that);
				that.getView().addDependent(that.photoPopup);
			}
			that.photoPopup.open();
			// get the index of the row for which the attachment button has been clicked
				var path = oEvent.getSource().mBindingInfos.text.binding.getBindings()[0].getContext().getPath();
				this.selectedIndex = path.split("/", 3)[2];
		},

		selectedIndex: null,
		handleUploadPress: function(oEvent) {
			debugger;
			var oFileUploader = sap.ui.getCore().byId("idCoUploader");
			// if (!oFileUploader.getValue()) {
			//   sap.m.MessageToast.show("Choose a file first");
			//   return;
			// }
			if (oFileUploader.getValue()) {
				this.flag = 'U';
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];

				this.fileName = file.name;
				this.fileType = file.type;

				var reader = new FileReader();
				reader.onload = function(e) {
					var oFile = {};
					oFile.imgContent = e.currentTarget.result;
					// getting the attachment content into local json model
					this.aItems[this.selectedIndex].To_Attachments.push({ Content : oFile.imgContent});
            //show uploaded picture
                  var oModelPhoto = new JSONModel();
                  oModelPhoto.setData(this.aItems[this.selectedIndex]);
                  this.getView().setModel(oModelPhoto, "photo");
					//that.savePicToDb(that.fileName, that.fileType, picture);
					//if picture already exists update the picture
					// if (that.selRow.Picture==="X") {
					//   var photoId = that.getView().getModel("photo").getData().id;
					//   var payload = {
					//     id: photoId,
					//     Content: picture,
					//     name: that.fileName,
					//     type:that.fileType
					//   };
					//   $.post('/updatePhoto', payload)
					//     .done(function(data, status) {
					//       sap.m.MessageToast.show("Photo updated");
					//       debugger;
					//       var oModelPhoto = new JSONModel();
					//       oModelPhoto.setData(payload);
					//       that.getView().setModel(oModelPhoto, "photo");
					//     })
					//     .fail(function(xhr, status, error) {
					//       sap.m.MessageBox.error("Failed to update photo");
					//     });
					// } else{
					// // if picture doesn't exist then create new record
					//     var payload = {
					//       CustomerOrderId: that.selRow.id,
					//       Content: picture,
					//       Filename: that.fileName,
					//       Filetype: that.fileType
					//     }
					//     that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos",
					//                       "POST", {}, payload, that)
					//       .then(function(oData) {
					//           sap.m.MessageToast.show("Photo uploaded Successfully");
					//           // update picture flag in customer orders
					//           debugger;
					//     //show uploaded picture
					//           var oModelPhoto = new JSONModel();
					//           oModelPhoto.setData(oData);
					//           that.getView().setModel(oModelPhoto, "photo");
					//    // update photo flag in customer order
					//           that2.selRow.Picture = "X";
					//           var payload = {
					//             id: that2.selRow.id,
					//             PhotoValue : that2.selRow.Picture
					//           };
					//           $.post('/updatePhotoFlag', payload)
					//   					.done(function(data, status) {
					//   						sap.m.MessageToast.show("Data updated");
					//   					})
					//   					.fail(function(xhr, status, error) {
					//   						sap.m.MessageBox.error("Failed to update");
					//   					});
					//     // call clear to update the color of the image
					//             that2.onClear();
					//           that2.getView().setBusy(false);
					//         }).catch(function(oError) {
					//           that2.getView().setBusy(false);
					//           var oPopover = that.getErrorMessage(oError);
					//         });
					//   ;}
				}.bind(this);
				reader.readAsDataURL(file);
			} else if (this.flag === 'C') {
				var snapId = 'Capture';
			//	this.savePicToDb(this.attachName,
			//		"jpeg",
			//		document.getElementById(snapId).toDataURL())
			} else {
				sap.m.MessageToast.show("Upload or capture Picture");
				return;
			}
		},
      
		// close photo upload popup
		handleClosePress: function(oEvent) {
			debugger;
			if (!this.photoPopup) {
				this.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", this);
			}
			var oFileUploader = sap.ui.getCore().byId("idCoUploader");
			oFileUploader.setValue("");
			// var oVBox = this.getView().getDependents()[0].getContent()[0].getContent()[0];
			//oVBox.getItems()[3].destroyLayoutData();
			// oVBox.getItems()[3].setProperty("content", "");
			this.photoPopup.close();
		},

		// End of changes  by Surya 06.12.2020
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