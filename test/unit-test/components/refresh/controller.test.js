describe('Refresh Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, timeout;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		timeout = $injector.get('$timeout');
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');

		constructor = $controller('RefreshController', {
			$timeout: timeout, 
			eventbus: eventbus,
			AppEvents : appEvents,
			httpWrapperService: wrapperService
		});

	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenerStub = sinon.stub(constructor, 'addListeners');
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.userProfileURL = '@profile/@setting';
		constructor.initialise();

		expect(constructor.userProfileURL).to.be.equal('grid/refresh');
		expect(addListenerStub.withArgs().calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.userProfileMode).calledOnce).to.be.ok;
	});

	it('should add the necessary listeners on calling addListeners', function () {
		var addListenerStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();

		expect(addListenerStub.withArgs(appEvents.GridDataLoad.name, constructor.onGridDataLoad)
			.calledOnce).to.be.ok;
		expect(addListenerStub.withArgs(appEvents.GridPageChange.name, constructor.onGridPageChange)
			.calledOnce).to.be.ok;
	});

	it('should initialise the profile load for user', function () {
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
		constructor.userName = 'guest';
		constructor.userProfileURL = 'test/@userName/test';
		constructor.initProfileLoad(constructor.userProfileMode);	
		
		expect(loadProfileStub.withArgs('test/'+constructor.userName+'/test')
			.calledOnce).to.be.ok;
	});

	it('should initialise the default profile load', function () {
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
		constructor.userProfileURL = 'test/@userName/test';
		constructor.initProfileLoad(constructor.defaultProfileMode);	
		
		expect(loadProfileStub
			.withArgs('test/'+constructor.defaultProfileMode+'/test')
			.calledOnce).to.be.ok;
	});
	it('should trigger load profile', function () {
		var userProfileURL = 'test/guest/test';
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'get');
		httpWrapperStub.returns(responseObj);

		constructor.loadProfile(userProfileURL);	
		
		expect(httpWrapperStub
			.withArgs(userProfileURL, constructor.headers)
			.calledOnce).to.be.ok;

		expect(responseThenStub
			.withArgs(constructor.userProfileSuccessHandler, constructor.userProfileErrorHandler)
			.calledOnce).to.be.ok;
	});

	it('should handle the profile load success', function () {
		var updateProfileStub = sinon.stub(constructor, 'updateProfileObjects');
		var responseObj = {data:{}};
		constructor.userProfileSuccessHandler(responseObj);

		expect(constructor.userAppProfile).to.be.equal(responseObj.data);
		expect(updateProfileStub.calledOnce).to.be.ok;
	});

	it('should handle the profile load error', function () {
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		var errObj = {data:{}};
		constructor.currentProfileMode = constructor.userProfileMode;
		constructor.userProfileErrorHandler(errObj);

		expect(initProfileStub
			.withArgs(constructor.defaultProfileMode)
			.calledOnce).to.be.ok;
	});

	it('should handle updating the profile objects if the profile has value', function () {
 		var refreshTimerStub = sinon.stub(constructor, 'activateRefreshTimer');
 		constructor.userAppProfile = {
 			Settings: {
 				refresh:'{"isRefresh":"true","refreshTime":"60 SEC"}'
 			}
 		};
		constructor.isGridLoaded = true;
		constructor.updateProfileObjects();

		expect(constructor.isRefresh).to.be.equal(true);
		expect(constructor.refreshTime).to.be.equal('60 SEC');
		expect(refreshTimerStub.calledOnce).to.be.ok;
	});

	it('should update the with the default values for the profile objects if profile has no values', function () {
 		var refreshTimerStub = sinon.stub(constructor, 'activateRefreshTimer');
 		constructor.userAppProfile = {
 			Settings: {		
 			}
 		};
		constructor.isRefresh = false;
		constructor.refreshTime = '120 SEC'; 		
		constructor.isGridLoaded = false;
		constructor.updateProfileObjects();

		expect(constructor.isRefresh).to.be.equal(false);
		expect(constructor.refreshTime).to.be.equal('120 SEC');
		expect(refreshTimerStub.calledOnce).not.to.be.ok;
	});

	it('should handle updating the user profile with put call on success', function () {
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
		var responseThenSpy = sinon.spy(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'put');
		httpWrapperStub.returns(responseObj);

		constructor.userName = 'guest';
		constructor.userAppProfile = {
			Settings: {
 				refresh:'{"isRefresh":"true","refreshTime":"60 SEC"}'
 			}
 		};
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.userName;
		constructor.updateUserProfile(responseObj);
		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);

	});
	it('should handle updating the user profile with put call on error', function () {
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
		var responseThenSpy = sinon.spy(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'put');
		httpWrapperStub.returns(responseObj);

		constructor.userName = 'guest';
		var profileObj = {
			Settings: {
 				refresh:'{"isRefresh":"true","refreshTime":"60 SEC"}'
 			}
 		};
		constructor.userAppProfile = profileObj;
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.userName;
		constructor.updateUserProfile(responseObj);
		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(profileObj);
	});


	it('should handle updating the user profile with post call on success', function () {
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
		var responseThenSpy = sinon.spy(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'post');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = null;
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		
		constructor.updateUserProfile(responseObj);
		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should handle updating the user profile with post call on error', function () {
		var respData = null;
		var profileObj = null;
		constructor.userAppProfile = profileObj;
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
		var responseThenSpy = sinon.spy(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.httpWrapperService, 'post');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		
		constructor.updateUserProfile(responseObj);
		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenSpy.calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(profileObj);
	});

	it('should handle toggling of the refresh control when refresh is deactivated', function () {
		var activateRefreshStub = sinon.stub(constructor, 'activateRefreshTimer');
		var updateProfileStub = sinon.stub(constructor, 'updateUserProfile');
		var timeoutStub = sinon.stub(timeout, 'cancel');
		constructor.isRefresh = false;
		constructor.refreshTimer = {};
		constructor.toggleRefresh();
		
		expect(timeoutStub.withArgs(constructor.refreshTimer).calledOnce).to.be.ok;
		expect(activateRefreshStub.calledOnce).not.to.be.ok;
		expect(updateProfileStub.calledOnce).to.be.ok;
	});

	it('should handle toggling of the refresh control when refresh is activated', function () {
		var activateRefreshStub = sinon.stub(constructor, 'activateRefreshTimer');
		var updateProfileStub = sinon.stub(constructor, 'updateUserProfile');
		var timeoutStub = sinon.stub(timeout, 'cancel');
		constructor.isRefresh = true;
		
		constructor.toggleRefresh();

		expect(timeoutStub.calledOnce).not.to.be.ok;
		expect(activateRefreshStub.calledOnce).to.be.ok;
		expect(updateProfileStub.calledOnce).to.be.ok;
	});

	it('should handle changing the refresh time', function () {
		var activateRefreshStub = sinon.stub(constructor, 'activateRefreshTimer');
		var updateProfileStub = sinon.stub(constructor, 'updateUserProfile');
		var timeoutStub = sinon.stub(timeout, 'cancel');

		constructor.refreshTimeChange();

		expect(timeoutStub.calledOnce).to.be.ok;
		expect(activateRefreshStub.calledOnce).to.be.ok;
		expect(updateProfileStub.calledOnce).to.be.ok;
	});

	it('should handle grid data load event', function () {
		var activateRefreshStub = sinon.stub(constructor, 'activateRefreshTimer');
		constructor.isGridLoaded = false;
		
		constructor.onGridDataLoad();

		expect(activateRefreshStub.calledOnce).to.be.ok;
		expect(constructor.isGridLoaded).to.be.true;
	});

	it('should not activate the refresh timer if the refresh is disabled', function () {
		constructor.refreshTimer = null;
		constructor.isRefresh = false;
		constructor.activateRefreshTimer();

		expect(constructor.refreshTimer).to.be.null;
	});

	it('should not activate the refresh timer if the refresh is disabled', function () {
		constructor.refreshTimer = null;
		constructor.isRefresh = true;

		constructor.activateRefreshTimer();

		expect(constructor.refreshTimer).not.to.be.null;
	});

});


