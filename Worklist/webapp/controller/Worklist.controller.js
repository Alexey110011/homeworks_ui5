/*global location history */
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment" //добавлено
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

			formatter: formatter,

			
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			
			onUpdateFinished : function (oEvent) {
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			
			onPress : function (oEvent) {
				this._showObject(oEvent.getSource());
			},

			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("DocumentNumber", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},
			
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/*Вызов диалога для создания новой записи*/
			onPressCreate : function () {
				if(!this.pDialog){
					this.pDialog = Fragment.load({
						name: "WorkList1.view.CreateDialog"
					});
				}
					this.pDialog.then(function(oDialog){
						return oDialog.open();
					});
			},
			/*==========================================================================================*/
			/* inner methods*/
			

			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("HeaderID")
				});
			},

			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			},

			//Задание структуры таблицы через js
			_getTableTemplate : function () {
				var oTable = this.byId('table');
				 var oColumns = [
						new sap.m.Column({
						header : new sap.m.Label({
							text:"DocumentNumber"
						})
					}),
						new sap.m.Column({
							header : new sap.m.Label({
								text:"DocumentDate"
							})
						}),
						new sap.m.Column({
							header : new sap.m.Label({
								text:"PlantText"
							})
						}),
						new sap.m.Column({
							header : new sap.m.Label({
								text:"RegionText"
							})
						}),
						new sap.m.Column({
							header : new sap.m.Label({
								text:"Description"
							})
						}),
						new sap.m.Column({
							header : new sap.m.Label({
								text:"Created"
							})
						})
				];
				var oTemplate = new sap.m.ColumnListItem({
					type: "Navigation",
					navigated: true,
					press: "onPress",  //при нажатии не работает
					cells: [
						new sap.m.Text ({
							text: '{DocumentNumber}'
						}),
						new sap.m.Text ({
							text: '{DocumentDate}'
						}),
						new sap.m.Text ({
							text: '{PlantText}'
						}),
						new sap.m.Text ({
							text: '{RegionText}'
						}),
						new sap.m.Text ({
							text: '{Description}'
						}),
						new sap.m.Text ({
							text: '{Created}'
						})
					]
				});
				
				oColumns.map(function(column){
					oTable.addColumn(column);
					});
					
				oTable.bindItems('/zjblessons_base_Headers', oTemplate);
			},
			/*=============================================================================================*/
		});
	}
);