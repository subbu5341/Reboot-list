describe('Grid Widget Controller', function() {
	var constructor, scope, appEvents, wrapperService, eventbus, timeout, compile, windowobj, uiGridExporterService;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $rootScope, $injector) {
		scope = $rootScope.$new();
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');
		timeout = $injector.get('$timeout');
		compile = $injector.get('$compile');
		windowobj =  $injector.get('$window');
		uiGridExporterService =  $injector.get('uiGridExporterService');

		constructor = $controller('GridController', {
			$scope: scope,
			AppEvents : appEvents,
			eventbus: eventbus,
			httpWrapperService: wrapperService,
			$timeout: timeout,
			$window: windowobj,
			uiGridExporterService: uiGridExporterService
		});

	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenerStub = sinon.stub(constructor, 'addListeners');
		var initGridDataStub = sinon.stub(constructor, 'initialiseGridData');
		var confGridViewStub = sinon.stub(constructor, 'configureGridView');
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.userProfileURL = '@profile/@setting';
		
		constructor.initialise();
		
		expect(constructor.userProfileURL).to.be.equal('grid/pagination');
		expect(addListenerStub.calledOnce).to.be.ok;
		expect(initGridDataStub.calledOnce).to.be.ok;
		expect(confGridViewStub.calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.userProfileMode).calledOnce).to.be.ok;
	});

	it('should add the necessary listeners on calling addListeners', function () {
		var addListenerStub = sinon.stub(constructor.eventbus, 'addListner');

		constructor.addListeners();

		expect(addListenerStub
			.withArgs(appEvents.FirstPage.name, constructor.firstPage)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.PreviousPage.name, constructor.previousPage)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.NextPage.name, constructor.nextPage)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.LastPage.name, constructor.lastPage)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.SeekPage.name, constructor.seekPage)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.PageSizeChange.name, constructor.onPageSizeChange)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.SelectAllRows.name, constructor.onSelectAllRows)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.GridColumnChange.name, constructor.onGridColumnChange)
			.calledOnce).to.be.ok;			
		expect(addListenerStub
			.withArgs(appEvents.RefreshGrid.name, constructor.onRefreshGrid)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.TriggerSearchQuery.name, constructor.onTriggerSearchQuery)
			.calledOnce).to.be.ok;
		expect(addListenerStub
			.withArgs(appEvents.ResetData.name, constructor.onResetData)
			.calledOnce).to.be.ok;
	});	

	it('should initialise the grid data', function () {
		var gridapi = {
			pagination:{
				on:{}
			}
		};
		var called = false;
		gridapi.pagination.on.paginationChanged = function(pgNo, pgSize) {
						called = true;
						pgSize();
					};
		
		constructor.$timeout = function(callback) {
			callback();
		};
		constructor.initialiseGridData();
		constructor.gridOptions.onRegisterApi(gridapi);

		expect(constructor.gridOptions.multiSelect).to.be.equal(true);
		expect(called).to.be.equal(true);
	});

	it('should configure the grid view', function () {
		constructor.gridOptions = {};

		constructor.configureGridView();

		expect(constructor.gridOptions.columnDefs.length).to.be.equal(constructor.AppConfig.Columns.length);
	});

	it('should initialise the default profile load', function () {
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
		constructor.userName = 'guest';
		constructor.userProfileURL = 'test/@userName/test';

		constructor.initProfileLoad(constructor.userProfileMode);	
		
		expect(loadProfileStub.withArgs('test/'+constructor.userName+'/test')
			.calledOnce).to.be.ok;
	});

	it('should initialise the profile load for user', function () {
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
		constructor.userProfileURL = 'test/@userName/test';

		constructor.initProfileLoad(constructor.defaultProfileMode);	
		
		expect(loadProfileStub.withArgs('test/'+constructor.defaultProfileMode+'/test')
			.calledOnce).to.be.ok;
	});

	it('should handle recent search initialise', function () {
		constructor.isRecentSearchAvailable = false;
		constructor.onRecentSearchInitialise();	
		expect(constructor.isRecentSearchAvailable).to.be.true;
	});

	it('should call an event when row is been clicked', function () {	
		constructor.onRowClick();	
	});
	it('Should set grid height for list page', function () {	
		var template = [
	        '<div id="topContainer" style="height:80px"></div>',
	        '<div id="refreshContainer" style="height:35px"></div>',
	        '<div id="paginator" style="height:20px"></div>',
	        '<div id="gridWrapper" style="height:389px"></div>'
	    ].join('');
	    var element = angular.element(template);
	    var compileElement = compile(element)(scope);
	    $('body').append(compileElement);
	    var gridApi = {
	        grid: {
	            handleWindowResize: function() {}
	        }
	    };
	    windowobj.innerHeight = 212;
	    constructor.gridApi = gridApi;
		constructor.setGridHeight();
		expect(constructor.gridWrapperHeight).to.be.equal(37);
	});

	it('should load the use profile data', function () {
		var url = 'test/@setting/test';	
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'get');
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		httpWrapperStub.returns(responseObj);

		constructor.loadProfile(url);
		
		expect(httpWrapperStub
			.withArgs(url, constructor.headers)
			.calledOnce).to.be.ok;
		expect(responseThenStub
			.withArgs(constructor.userProfileSuccessHandler, constructor.userProfileErrorHandler)
			.calledOnce).to.be.ok;
	});

	it('should handle the success response for the user profile load', function () {
		var updateProfileStub = sinon.stub(constructor, 'updateProfileObjects');
 		var response = {
 			data: {
 				Settings: {
 					'test': '{ "tempVar":"tempValue" }'
 				}
 			}
 		};

		constructor.userProfileSuccessHandler(response);

 		expect(constructor.userAppProfile).to.be.equal(response.data);
 		expect(updateProfileStub.calledOnce).to.be.ok;
	});
	
	it('should handle the error response for the default profile load', function () {
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.currentProfileMode = constructor.userProfileMode;

		constructor.userProfileErrorHandler(null);

 		expect(initProfileStub.withArgs(constructor.defaultProfileMode).calledOnce).to.be.ok;
	});

	it('should handle the error response for the user profile load', function () {
		var updateProfileStub = sinon.stub(constructor, 'updateProfileObjects');
		constructor.currentProfileMode = constructor.defaultProfileMode;

		constructor.userProfileErrorHandler(null);

 		expect(updateProfileStub.calledOnce).to.be.ok;
	});

	it('should update the profile objects after loading te profile', function () {
		var callAPIStub = sinon.stub(constructor, 'callAPI');
		constructor.pageSize = constructor.AppConfig.PageSize.default;
		constructor.userAppProfile = {
			Settings:{
				pagination:'{"pageSize":"50"}'
			}
		};
		
		constructor.updateProfileObjects();

		expect(constructor.pageSize).to.be.equal(50);
		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('LOAD'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});
	
	it('should update the user profile with the new values using post method on success', function () {
		constructor.userProfileURL = 'test/@userName/test';	
		var respData = {
			data:{
			  'AppID': 'rebootlist',
			  'Settings': {
			    'refresh': '{\"isRefresh\":true,\"refreshTime\":\"60 SEC\"}'
			  }
			}
		};
		var error ='Error: API not working';
		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'post');
		var responseThenSpy = sinon.spy(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.userName = 'guest';
		
		constructor.updateUserProfile();

		expect(httpWrapperStub.withArgs('test/'+constructor.userName+'/test').calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should update the user profile with the new values using post method on error', function () {
		constructor.userProfileURL = 'test/@userName/test';	
		var respData = null;
		var error ='Error: API not working';
		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'post');
		var responseThenSpy = sinon.spy(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.userName = 'guest';
		
		constructor.updateUserProfile();

		expect(httpWrapperStub.withArgs('test/'+constructor.userName+'/test').calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		
	});

	it('should update the user profile with the new values using put method on success', function () {
		constructor.userProfileURL = 'test/@userName/test';
		var respData = {
			data:{
			  'AppID': 'rebootlist',
			  'Settings': {
			    'refresh': '{\"isRefresh\":true,\"refreshTime\":\"60 SEC\"}'
			  }
			}
		};
		var error ='Error: API not working';
		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'put');
		var responseThenSpy = sinon.spy(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.currentProfileMode = constructor.userProfileMode;

		constructor.updateUserProfile();

		expect(httpWrapperStub.withArgs('test/'+constructor.userName+'/test').calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should update the user profile with the new values using put method on error', function () {
		constructor.userProfileURL = 'test/@userName/test';
		var respData = null;
		var error ='Error: API not working';
		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};	
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'put');
		var responseThenSpy = sinon.spy(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.currentProfileMode = constructor.userProfileMode;

		constructor.updateUserProfile();

		expect(httpWrapperStub.withArgs('test/'+constructor.userName+'/test').calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
	});

	it('should handle the function onExportToCSV', function () {
		var serviceStub = sinon.stub(uiGridExporterService, 'csvExport');
		constructor.gridApi = {};
		constructor.gridApi.grid = {row: [{visible: true}, {visible: true}]};

		constructor.onExportToCSV();

		expect(serviceStub.withArgs().calledOnce).to.be.ok;
		serviceStub.restore();
	});

	it('should return the api details for the mode as LOAD', function () {
		var retObj = constructor.getAPIDetails('LOAD');	

		expect(retObj.URL).to.be.equal(constructor.AppConfig.API.GridApiURL);
		//expect(retObj.Payload).to.be.equal(constructor.AppConfig.API.Payload);
		expect(retObj.Headers).to.be.equal(constructor.AppConfig.API.Headers);
		expect(retObj.Method).to.be.equal(constructor.AppConfig.API.Method);
	});

	it('should call the api with the Post method', function () {
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'post');
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		var apiCfg = {
			Method: 'POST',
			URL: 'test/@userName/test',
			Payload: 'testPayload',
			Headers: 'testHeaders'
		};
		var successHandler = function(){};
		var errorHandler = function(){};

		constructor.callAPI(apiCfg, successHandler, errorHandler);

 		expect(httpWrapperStub.withArgs(apiCfg.URL, apiCfg.Payload, apiCfg.Headers).calledOnce).to.be.ok;
 		expect(responseThenStub.withArgs(successHandler, errorHandler).calledOnce).to.be.ok;
	});
	
	it('should call the api with the get method', function () {
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'get');
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		httpWrapperStub.returns(responseObj);
		var apiCfg = {
			Method: 'GET',
			URL: 'test/@userName/test',
			Payload: 'testPayload',
			Headers: 'testHeaders'
		};
		var successHandler = function(){};
		var errorHandler = function(){};

		constructor.callAPI(apiCfg, successHandler, errorHandler);

 		expect(httpWrapperStub.withArgs(apiCfg.URL, apiCfg.Headers).calledOnce).to.be.ok;
 		expect(responseThenStub.withArgs(successHandler, errorHandler).calledOnce).to.be.ok;
	});

	it('should handle success of grid data load when response.data is available', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.gridOptions = {};
		constructor.gridApi = {};
		constructor.gridApi.grid = {};
		constructor.gridApi.grid.options = {};
		constructor.gridApi.pagination = {};
		var response = {
			data:{
				Result:{
					Result: [{'DevicesToReboot': [{'AccountID' : '123'},
										   {'AccountID' : '300009'}]},
							 {'RebootType':'testData'}
						]
				}
			}
		};

		constructor.onGridDataLoadSuccess(response);	

		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
		eventbusStub.restore();
	});
	it('should handle grid data load when there is no data', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		var apiErrorStub = sinon.stub(constructor, 'onApiError');
		var response = {
			data:{ }
		};

		constructor.onGridDataLoadSuccess(response);	

		expect(eventbusStub.withArgs().calledOnce).not.to.be.ok;
		apiErrorStub.restore();
	});
	
	it('should handle success of grid data load when response.data.Marker is available', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.gridOptions = {};
		constructor.gridApi = {};
		constructor.gridApi.grid = {};
		constructor.gridApi.grid.options = {};
		constructor.gridApi.pagination = {};
		var response = {
			data:{
				Result:{
					Result: 'testData'
				},
				Marker:{
					Count: 50,
					Direction: 'FORWARD'
				}
			}
		};
		var propByStringStub = sinon.stub(Object,'getPropByString');
		propByStringStub.withArgs().returns(response);

		constructor.onGridDataLoadSuccess(response);
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
		eventbusStub.restore();
		propByStringStub.restore();
	});

	it('should handle grid data load when there is no data', function () {
		var onApiErrorStub = sinon.stub(constructor, 'onApiError');
		var response = {
			data:{}
		};

		constructor.onGridDataLoadSuccess(response);

		expect(onApiErrorStub.withArgs().calledOnce).to.be.ok;
		onApiErrorStub.restore();
	});

	it('should handle the function convertStringToObject', function () {
		var stringDataInArray = ['item1', 'item2'];

		var response = constructor.convertStringToObject(stringDataInArray);
		expect(response.length).to.equal(stringDataInArray.length);
	});

	it('should handle the function onApirError when no data is present', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.gridOptions = {};
		constructor.gridApi = {};
		constructor.gridApi.grid = {};
		constructor.gridApi.grid.options = {};
		constructor.gridApi.pagination = {totalRecords: undefined};

		constructor.onApiError();

		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
		expect(constructor.gridApi.pagination.totalRecords).to.equal(0);
		eventbusStub.restore();
	});


	it('should handle right click when no rows are selected', function () {
		var eleObj = { scope:function(){} };
		var scopeObj = { $parent:{ row: { isSelected:false} } };
		constructor.gridApi = {
			selection: {
				getSelectedRows:function () { return true;},
				clearSelectedRows:function () {}
			}
			};
		var eleStub = sinon.stub(angular, 'element');
		var scopeStub = sinon.stub(eleObj, 'scope');
		var clearRowsStub = sinon.stub(constructor.gridApi.selection, 'clearSelectedRows');
		
		eleStub.returns(eleObj); 
		scopeStub.returns(scopeObj); 

		var evt = { target:{} };
		constructor.rightClick(evt);

		expect(eleStub.withArgs(evt.target).calledOnce).to.be.ok;
		expect(clearRowsStub.calledOnce).to.be.ok;
		eleStub.restore();
	});

	it('should handle right click when single row is selected', function () {
		var eleObj = { scope:function(){} };
		var scopeObj = { $parent: { row: { isSelected:true} } };
		var rows = [{ 'name':'row1' }];
		constructor.gridApi = {
			selection: {
				getSelectedRows:function () { return true;},
				clearSelectedRows:function () {}
		}
		};
		var eleStub = sinon.stub(angular, 'element');
		var scopeStub = sinon.stub(eleObj, 'scope');
		var selectRowsStub = sinon.stub(constructor.gridApi.selection, 'getSelectedRows');
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');

		eleStub.returns(eleObj); 
		scopeStub.returns(scopeObj); 
		selectRowsStub.returns(rows);

		var evt = { target:{} };

		constructor.rightClick(evt);

		expect(eleStub.withArgs(evt.target).calledOnce).to.be.ok;
		expect(eventbusStub.calledOnce).to.be.ok;

		eleStub.restore();
	});

	it('should handle right click when multiple rows are selected', function () {
		var eleObj = { scope:function(){} };
		var scopeObj = { $parent: { row: { isSelected:true} } };
		var rows = [{ 'name':'row1' }, { 'name':'row2' }];
		constructor.gridApi = {
			selection: {
			 getSelectedRows:function () { return true;},
			 clearSelectedRows:function () {}
		}
		};
		var eleStub = sinon.stub(angular, 'element');
		var scopeStub = sinon.stub(eleObj, 'scope');
		var selectRowsStub = sinon.stub(constructor.gridApi.selection, 'getSelectedRows');
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');

		eleStub.returns(eleObj); 
		scopeStub.returns(scopeObj); 
		selectRowsStub.returns(rows);

		var evt = { target:{} };

		constructor.rightClick(evt);

		expect(eleStub.withArgs(evt.target).calledOnce).to.be.ok;
		expect(eventbusStub.calledOnce).to.be.ok;

		eleStub.restore();
	});

	it('should navigate to the first page', function () {
		constructor.paginationMarkers = { First: { ID: 'test' }};
		var firstpageStub = sinon.stub(constructor, 'callAPI');

		constructor.firstPage();

		expect(firstpageStub.calledOnce).to.be.ok;
	});

	it('should navigate to the next page', function () {
		constructor.paginationMarkers = { Next: { ID: 'test' }};
		var nextPageStub = sinon.stub(constructor, 'callAPI');
		var evt = {};

		constructor.nextPage(evt);

		expect(nextPageStub.calledOnce).to.be.ok;
	});

	it('should navigate to the previous page', function () {
		constructor.paginationMarkers = { Previous: { ID: 'test' }};
		var previousPageStub = sinon.stub(constructor, 'callAPI');
		var evt = {};

		constructor.previousPage(evt);

		expect(previousPageStub.calledOnce).to.be.ok;
	});

	it('should navigate to the last page', function () {
		var lastPagesStub = sinon.stub(constructor, 'callAPI');

		constructor.paginationMarkers = { Last: { ID: 'test' }};
		constructor.lastPage();

		expect(lastPagesStub.calledOnce).to.be.ok;
	});

	it('should navigate to the seek page', function () {
		constructor.gridApi = {
			pagination: {
				seek: function(){}
			}
		};
		var pageNum = 2;
		var evt = {pageNumber:pageNum};
		var seekPageStub = sinon.stub(constructor.gridApi.pagination, 'seek');

		constructor.seekPage(evt);

		expect(seekPageStub.withArgs(pageNum).calledOnce).to.be.ok;
	});

	it('should handle page size change', function () {
		constructor.paginationMarkers = { Last: { ID: 'test' }};
		var callAPIStub = sinon.stub(constructor, 'callAPI');
		var updateUserProfileStub = sinon.stub(constructor, 'updateUserProfile');
		var evt = {pageSize:50};
		constructor.gridOptions = {data:[{rowData:'test'}]};
		constructor.paginationMarkers = { 'Previous': { 'ID': '', 'Direction': 'FORWARD', 'Count': 25 }};

		constructor.onPageSizeChange(evt);

		expect(constructor.gridOptions.paginationPageSize).to.be.equal(evt.pageSize);
		expect(callAPIStub.calledOnce).to.be.ok;
		expect(updateUserProfileStub.calledOnce).to.be.ok;
	});

	it('should handle handle select all rows for valid rows selection', function () {
 		var evt = {state:{}};
 		constructor.gridApi = {
			selection: {
				selectAllRows: function(){}
			}
		};
 		var selectAllRowsStub = sinon.stub(constructor.gridApi.selection, 'selectAllRows');

		constructor.onSelectAllRows(evt);

		expect(selectAllRowsStub.calledOnce).to.be.ok;
	});

	it('should handle select all rows for no row selection', function () {
 		var evt = {state:null};
 		constructor.gridApi = {
			selection: {
				clearSelectedRows: function(){}
			}
		};
 		var clearSelectedRowsStub = sinon.stub(constructor.gridApi.selection, 'clearSelectedRows');

		constructor.onSelectAllRows(evt);

		expect(clearSelectedRowsStub.calledOnce).to.be.ok;
	});

	it('should handle column settings change', function () {
		constructor.gridApi = {
			grid: {
				refresh: function(){}
			}
		};
 		var evt = {
 			columnDefs:[
 				{'name':'column2', 'visible':'false'},
 				{'name':'column3', 'visible':'true'},
 				{'name':'column1', 'visible':'true'}
 			]
 		};
 		constructor.gridOptions = {
			columnDefs:[
 				{'name':'column1', 'visible':'true'},
 				{'name':'column2', 'visible':'true'},
 				{'name':'column3', 'visible':'true'}
 			]
		};
 		var refreshStub = sinon.stub(constructor.gridApi.grid, 'refresh');

		constructor.onGridColumnChange(evt);

		expect(constructor.gridOptions.columnDefs[0].name).to.be.equal('column2');
		expect(constructor.gridOptions.columnDefs[0].visible).to.be.equal('false');
		expect(constructor.gridOptions.columnDefs[1].name).to.be.equal('column3');
		expect(constructor.gridOptions.columnDefs[1].visible).to.be.equal('true');
		expect(refreshStub.calledOnce).to.be.ok;
	});

	it('should trigger search query for search action', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');
 		var evt = {
 			searchData : 'column1 = "rackspace"'
 		};
		constructor.onTriggerSearchQuery(evt);

		expect(constructor.searchData).to.be.equal(evt.searchData);
		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('Search'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});

	it('should trigger load complete data for search action if the query is empty', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');
 		var evt = {
 			searchData : ''
 		};
		constructor.onTriggerSearchQuery(evt);

		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('Load'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});

	it('should apply search filters to from the profile ', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');
 		var evt = {
 			searchData :{ queryData:'column1 = "rackspace"'}
 		};
		constructor.onApplySearchProfile(evt);

		expect(constructor.searchData).to.be.equal(evt.searchData.queryData);
		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('Search'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});

	it('should load complete data is applied search filters are not valid', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');
 		var evt = {
 			searchData :{}
 		};
		constructor.onApplySearchProfile(evt);

		expect(constructor.searchData).to.be.equal('');
		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('Load'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});


	it('should load the complete list on reset', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');
 		constructor.searchData = 'column1 = "rackspace"';

		constructor.onResetData ();

		expect(constructor.searchData).to.be.equal('');
		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('Load'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});

	it('should handle refreshing of the grid data', function () {
 		var callAPIStub = sinon.stub(constructor, 'callAPI');

		constructor.onRefreshGrid();

		expect(callAPIStub
			.withArgs(constructor.getAPIDetails('LOAD'), constructor.onGridDataLoadSuccess, constructor.onApiError)
			.calledOnce).to.be.ok;
	});

	it('should handle onAdvSearchDataChange', function() {
	    var template = [
	        '<div id="gridContainer" style="position:relative;top:115px"></div>',
	        '<div id="paginator" style="height:20px"></div>',
	        '<div id="gridWrapper" style="height:503px"></div>'
	    ].join('');

	    var element = angular.element(template);
	    var compileElement = compile(element)(scope);
	    $('body').append(compileElement);
	    var gridApi = {
	        grid: {
	            handleWindowResize: function() {}
	        }
	    };

	    var resizeStub = sinon.stub(gridApi.grid, 'handleWindowResize');
	    constructor.gridApi = gridApi;
	    constructor.delayedGridUpdate();
	    expect($('#gridContainer').position().top).to.be.above(130);
	    expect($('#gridContainer').height()).to.be.equal(0);
	    expect($('#gridWrapper').height()).to.be.equal(0);
	    expect(resizeStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle onExpandOrCollapseAdvSearch', function() {
	    var template = [
	        '<div id="gridContainer" style="height:389px"></div>',
	        '<div id="paginator" style="height:20px"></div>',
	        '<div id="gridWrapper" style="height:389px"></div>'
	    ].join('');

	    var element = angular.element(template);
	    var compileElement = compile(element)(scope);
	    $('body').append(compileElement);
	    var gridApi = {
	        grid: {
	            handleWindowResize: function() {}
	        }
	    };

	    var resizeStub = sinon.stub(gridApi.grid, 'handleWindowResize');
	    constructor.gridApi = gridApi;
	    constructor.searchUpdateDelay = true;
	    constructor.gridHeight = 503;
	    constructor.gridWrapperHeight = 503;
	    constructor.onExpandOrCollapseAdvSearch();
	    expect($('#gridContainer').height()).to.be.equal(0);
	    expect($('#gridWrapper').height()).to.be.equal(503);
	    expect(resizeStub.withArgs().calledOnce).to.be.ok;
	});

	it('Should show the error message on copy failed', function () {
			var template = [
			        '<show-copy-tooltip>',
	                '<a class="copy-column"' ,
	                'ng-click="grid.appScope.CopyToClipboard(COL_FIELD,succToolTip,errToolTip)">',
	                '<i class="fa fa-files-o" aria-hidden="true"></i></a>',
	                '</show-copy-tooltip>',
			    ].join('');
		    var element = angular.element(template);
		    var compileElement = compile(element)(scope);
		    $('body').append(compileElement);
		    scope.notCopied = false;
		    var COL_FIELD = 'ae5da768-f0fd-4d01-a258-bb93fcf923ae';

		    constructor.CopyToClipboard(COL_FIELD,scope.succToolTip,scope.errToolTip);
		    expect(scope.notCopied).to.be.equal(true);
	});
});
describe('Directives ::', function() {

	beforeEach(angular.mock.module('myApp.widgets'));

	describe('Testing rightClick directive', function() {
		var scope, element, directiveElem, compile;

		beforeEach(inject(function($rootScope, $injector) {
			scope = $rootScope.$new();
			compile = $injector.get('$compile');
		}));

		it('should hide date picker on click of directive element', function() {
			var template = [
				'<div id="contextMenu" right-click></div>'
			].join('');
				element = angular.element(template);
				directiveElem = compile(element)(scope);
				$('body').append(directiveElem);
				scope.$apply();
				$('#contextMenu').trigger('contextmenu');
				expect('contextmenu').to.have.been.calledOnce;
				//expect(bindSpy.calledOnce).to.be.ok;
		});

	});
});