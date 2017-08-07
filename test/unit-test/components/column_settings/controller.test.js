describe('ColumnSettings Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, timeout, urlQueryMgr;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	// appEvents = {FormLoad:'onFormLoad', PageLoad:'onPageLoad'};

	beforeEach(inject(function ($controller, $injector) {
		timeout = $injector.get('$timeout');
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');
		urlQueryMgr = $injector.get('URLQueryStrManagerService');

		constructor = $controller('ColumnSettingsController', {
			AppEvents : appEvents,
			eventbus: eventbus
		});
	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenersStub = sinon.stub(constructor, 'addListeners');
		constructor.initialise();
		expect(addListenersStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle column toggle', function () {
		constructor.toggleColumns();
		expect(constructor.isColumnExpanded).to.be.equal(true);
	});
	it('should toggle column when there is no data', function () {
		var evt = {'forceClose': true};
		constructor.toggleColumns(evt);
		expect(constructor.isColumnExpanded).to.be.equal(false);
	});

	it('should handle initialise of Save Search', function () {
		constructor.onSaveSearchInitialise();
		expect(constructor.isSaveSearchEnabled).to.be.equal(true);
	});

	it('should handle initialise of Recent Search', function () {
		constructor.onRecentSearchInitialise();
		expect(constructor.isRecentSearchEnabled).to.be.equal(true);
	});

	it('should handle save search select', function () {
		constructor.saveSearchSelect();
		expect(constructor.isSaveSearchActive).to.be.equal(true);
	});

	it('should handle recent search select', function () {
		constructor.recentSearchSelect();
		expect(constructor.isSaveSearchActive).to.be.equal(false);
	});
	it('should handle add listenser', function () {
		var addListenersStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();
		expect(addListenersStub
			.withArgs(appEvents.SaveSearchInitialise.name, constructor.onSaveSearchInitialise).calledOnce).to.be.ok;
		expect(addListenersStub
			.withArgs(appEvents.RecentSearchInitialise.name, constructor.onRecentSearchInitialise).calledOnce).to.be.ok;
	});

	it('should handle loading the profile on complete of loading all the search profiles', function () {
		constructor.isSaveSearchLoading = true;
		constructor.isRecentSearchLoading = true;
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');

		var evt = {name:appEvents.SaveSearchLoadComplete.name};
		constructor.onSearchLoadComplete (evt);
		evt = {name:appEvents.RecentSearchLoadComplete.name};
		constructor.onSearchLoadComplete (evt);

		expect(loadProfileStub.withArgs().calledOnce).to.be.ok;
	});

	it('should not load the profile if loading all the recent search profiles is not completed', function () {
		constructor.isSaveSearchLoading = true;
		constructor.isRecentSearchLoading = true;
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');

		var evt = {name:appEvents.SaveSearchLoadComplete.name};
		constructor.onSearchLoadComplete (evt);

		expect(loadProfileStub.withArgs().calledOnce).not.to.be.ok;
	});
  
	it('should not load the profile if loading all the saved search profiles is not completed', function () {
		constructor.isSaveSearchLoading = true;
		constructor.isRecentSearchLoading = true;
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');

		var evt = {name:appEvents.RecentSearchLoadComplete.name};
		constructor.onSearchLoadComplete (evt);

		expect(loadProfileStub.withArgs().calledOnce).not.to.be.ok;
	});
	
  	it('on complete of both save and recent search profiles load, check for url query param', function () {
  		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
  		var urlQueryMgrStub = sinon.stub(urlQueryMgr, 'hasURLQuery');
  		var eventbusStub = sinon.stub(eventbus, 'raise');
  		urlQueryMgrStub.returns(true);

		constructor.isSaveSearchLoading = true;
		constructor.isRecentSearchLoading = true;

  		constructor.onSearchLoadComplete({name:appEvents.SaveSearchLoadComplete.name});
  		constructor.onSearchLoadComplete({name:appEvents.RecentSearchLoadComplete.name});

		expect(loadProfileStub.withArgs().calledOnce).not.to.be.ok;
		expect(eventbusStub.withArgs(new appEvents.BasicSearch()).calledOnce).to.be.ok;

		loadProfileStub.restore();
		urlQueryMgrStub.restore();
		eventbusStub.restore();
	});

	it('should load the selected filter for the user', function () {
		constructor.userProfileURL = '/staging/v2/internal/userprofile/listpage/user/@userName/@profile/@setting/';
		constructor.userName = 'user1234';
		constructor.httpWrapperService = { get: function() {} };
		var respObj = { then : function () {} };
		var httpGetStub = sinon.stub(constructor.httpWrapperService, 'get');
		httpGetStub.returns(respObj);
		var responseStb = sinon.stub(respObj, 'then');

		constructor.loadProfile ();

		var finalURL = '/staging/v2/internal/userprofile/listpage/user/user1234/grid/selectedfilter/';

		expect(httpGetStub.withArgs(finalURL, constructor.headers).calledOnce).to.be.ok;
		expect(responseStb.withArgs(constructor.userProfileSuccessHandler, constructor.userProfileErrorHandler)
			.calledOnce).to.be.ok;
	});

	it('should handle the succes call back for selected filter profile load', function () {
		var response = { data: { Settings: { selectedfilter: '{"selectedSlot":"slot2"}'} } };
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');

		constructor.userProfileSuccessHandler (response);

		var filterData = constructor.userAppProfile.Settings.selectedfilter;
		expect(raiseStub.withArgs(new appEvents.LoadLastSelectedSearchProfile(filterData))
			.calledOnce).to.be.ok;

	});

	it('should handle the succes for selected filter profile load if selected slot is not valid', function () {
		var response = { data: { Settings: { selectedfilter: '{"selectedSlot":""}'} } };
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');

		constructor.userProfileSuccessHandler (response);

		//var filterData = constructor.userAppProfile.Settings.selectedfilter;
		expect(raiseStub.withArgs(new appEvents.ApplySearchProfile(null))
			.calledOnce).to.be.ok;
	});

	it('should handle the error call back for selected filter profile load', function () {
		var error = { status: '404'};
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');

		constructor.userProfileErrorHandler (error);

		expect(raiseStub.withArgs(new appEvents.ApplySearchProfile(null))
			.calledOnce).to.be.ok;
	});

	it('should handle updating the selectedfilter profile for put method on success', function () {
		constructor.userName = 'user1234';
		constructor.userProfileURL = '/staging/v2/internal/userprofile/listpage/user/@userName/@profile/@setting/';
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		constructor.userAppProfile = { Settings: { selectedfilter: '{"selectedSlot":""}'} };
		var respData = {
			data:{
			  'AppID': 'rebootlist',
			  'Settings': {
			    'refresh': '{\"isRefresh\":true,\"refreshTime\":\"60 SEC\"}'
			  }
			}
		};
		var error ='Error: API not working';
		var respObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpGetStub = sinon.stub(constructor.httpWrapperService, 'put');
		httpGetStub.returns(respObj);
		var responseSpy = sinon.spy(respObj, 'then');

		constructor.updateUserProfile (evt);

		var finalURL = '/staging/v2/internal/userprofile/listpage/user/user1234/grid/selectedfilter/';
		expect(httpGetStub.withArgs(finalURL,'', constructor.headers)).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});

	it('should handle updating the selectedfilter profile for put method on error', function () {
		constructor.userName = 'user1234';
		constructor.userProfileURL = '/staging/v2/internal/userprofile/listpage/user/@userName/@profile/@setting/';
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		var profileObj = { Settings: { selectedfilter: '{"selectedSlot":""}'} };
		constructor.userAppProfile = profileObj;
		var respData = null;
		var error ='Error: API not working';
		var respObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpGetStub = sinon.stub(constructor.httpWrapperService, 'put');
		httpGetStub.returns(respObj);
		var responseSpy = sinon.spy(respObj, 'then');

		constructor.updateUserProfile (evt);

		var finalURL = '/staging/v2/internal/userprofile/listpage/user/user1234/grid/selectedfilter/';
		expect(httpGetStub.withArgs(finalURL,'', constructor.headers)).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(profileObj);
	});

	it('should handle updating the selectedfilter profile for post method on success', function () {
		constructor.userName = 'user1234';
		constructor.userProfileURL = '/staging/v2/internal/userprofile/listpage/user/@userName/@profile/@setting/';
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		constructor.userAppProfile = null;
		var respData = {
			data:{
			  'AppID': 'rebootlist',
			  'Settings': {
			    'refresh': '{\"isRefresh\":true,\"refreshTime\":\"60 SEC\"}'
			  }
			}
		};
		var error ='Error: API not working';
		var respObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpGetStub = sinon.stub(constructor.httpWrapperService, 'post');
		httpGetStub.returns(respObj);
		var responseSpy = sinon.spy(respObj, 'then');

		constructor.updateUserProfile (evt);

		var finalURL = '/staging/v2/internal/userprofile/listpage/user/user1234/grid/selectedfilter/';
		expect(httpGetStub.withArgs(finalURL, '', constructor.headers)).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should handle updating the selectedfilter profile for post method on error', function () {
		constructor.userName = 'user1234';
		constructor.userProfileURL = '/staging/v2/internal/userprofile/listpage/user/@userName/@profile/@setting/';
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		var profileObj = null;
		constructor.userAppProfile = profileObj;
		var respData = null;
		var error ='Error: API not working';
		var respObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);					
				} else {
					errorHandlerCB(error);
				}				
			}
		};
		var httpGetStub = sinon.stub(constructor.httpWrapperService, 'post');
		httpGetStub.returns(respObj);
		var responseSpy = sinon.spy(respObj, 'then');

		constructor.updateUserProfile (evt);

		var finalURL = '/staging/v2/internal/userprofile/listpage/user/user1234/grid/selectedfilter/';
		expect(httpGetStub.withArgs(finalURL, '', constructor.headers)).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(profileObj);
	});

	it('should handle updating the selected search profile', function () {
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		var updateStub = sinon.stub(constructor, 'updateUserProfile');

		constructor.onUpdateSelectedSearchProfile (evt);

		expect(updateStub.withArgs(evt).calledOnce).to.be.ok;
	});

});