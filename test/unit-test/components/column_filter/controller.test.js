describe('Column Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, timeout;
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

		constructor = $controller('ColumnFilterController', {
			AppEvents : appEvents,
			eventbus: eventbus,
			httpWrapperService: wrapperService
		});
	}));

	it('should call the necessary functions on controller intialisation', function () {
		// var addListenerStub = sinon.stub(constructor, 'addListeners');
		var addListenersStub = sinon.stub(constructor, 'addListeners');
		var configureColumnsStub = sinon.stub(constructor, 'configureColumns');
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		// constructor.userProfileURL = '@profile/@setting';
		constructor.initialise();
		expect(addListenersStub.withArgs().calledOnce).to.be.ok;
		expect(configureColumnsStub.withArgs().calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.userProfileMode).calledOnce).to.be.ok;
	});

	it('should handle configuration of columns', function () {
		constructor.configureColumns();
		expect(constructor.defaultColumnDefs.length).to.be.above(0);
	});
	it('should call the necessary functions on ProfileLoad', function () {
		var loadProfileStub = sinon.stub(constructor, 'loadProfile');
		constructor.initProfileLoad('user');
		constructor.initProfileLoad('user123');
		expect(loadProfileStub.withArgs().calledTwice).to.be.ok;
	});

	it('should handle user profile load', function () {
		var wrapperGetStub = sinon.stub(constructor.httpWrapperService, 'get');
		var responseObj = {then: function () {}};
		var responseStub = sinon.stub(responseObj, 'then');
		wrapperGetStub.returns(responseObj);
		var url = 'test/@profile/@setting/test';
		
		constructor.loadProfile(url);

		expect(wrapperGetStub.withArgs(url, constructor.headers).calledOnce).to.be.ok;
		expect(responseStub
			.withArgs(constructor.userProfileSuccessHandler, constructor.userProfileErrorHandler)
			.calledOnce).to.be.ok;
	});

	it('should handle user profile success', function () {
		var updateProfileStub = sinon.stub(constructor, 'updateProfileObjects');
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.userAppProfile = null;
		var response = { 'data' : 'testdata'};
		constructor.currentProfileMode = constructor.userProfileMode;

		constructor.userProfileSuccessHandler(response);

		expect(updateProfileStub.withArgs().calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.defaultProfileMode).calledOnce).to.be.ok;
	});

	it('should handle default profile success', function () {
		constructor.userAppProfile = {};
		var response = { data : 'testdata'};
		constructor.currentProfileMode = constructor.defaultProfileMode;

		constructor.userProfileSuccessHandler(response);

		expect(constructor.defaultAppProfile).to.be.equal(response.data);
	});

	it('should handle user profile error handler', function () {
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.currentProfileMode = constructor.userProfileMode;
		constructor.userProfileErrorHandler();
		expect(initProfileStub.withArgs(constructor.defaultProfileMode).calledOnce).to.be.ok;
	});

	it('should handle user profile update object', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.userAppProfile = window.mockData.userAppProfile;
		constructor.columnDefs = window.mockData.columnDefs;
		constructor.updateProfileObjects();
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle user profile update object default mode', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.userAppProfile = window.mockData.userAppProfile;
		constructor.columnDefs = window.mockData.columnDefs;
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.updateProfileObjects();
		expect(constructor.defaultColumnDefs).to.be.equal(constructor.columnDefs);
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle user profile update for put method on success', function () {
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

		var wrapperPutStub = sinon.stub(constructor.httpWrapperService, 'put');
		var responseSpy = sinon.spy(responseObj, 'then');
		wrapperPutStub.returns(responseObj);

		constructor.userProfileURL = 'test/@username/test';
		constructor.userAppProfile = {'testVar' : 'testValue'};
		
		constructor.updateUserProfile('user');

		expect(wrapperPutStub.withArgs(constructor.userProfileURL).calledOnce).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should handle user profile update for put method on error', function () {
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

		var wrapperPutStub = sinon.stub(constructor.httpWrapperService, 'put');
		var responseSpy = sinon.spy(responseObj, 'then');
		wrapperPutStub.returns(responseObj);

		constructor.userProfileURL = 'test/@username/test';
		constructor.userAppProfile = {'testVar' : 'testValue'};
		
		constructor.updateUserProfile('user');

		expect(wrapperPutStub.withArgs(constructor.userProfileURL).calledOnce).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
	});

	it('should handle user profile update for post method on success', function () {
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

		var wrapperPutStub = sinon.stub(constructor.httpWrapperService, 'post');
		var responseSpy = sinon.spy(responseObj, 'then');
		wrapperPutStub.returns(responseObj);

		constructor.userProfileURL = 'test/@username/test';
		constructor.userAppProfile = null;
		
		constructor.updateUserProfile('user');

		expect(wrapperPutStub.withArgs(constructor.userProfileURL).calledOnce).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
		expect(constructor.userAppProfile).to.be.equal(respData.data);
	});
	it('should handle user profile update for post method on error', function () {
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

		var wrapperPutStub = sinon.stub(constructor.httpWrapperService, 'post');
		var responseSpy = sinon.spy(responseObj, 'then');
		wrapperPutStub.returns(responseObj);

		constructor.userProfileURL = 'test/@username/test';
		constructor.userAppProfile = null;
		
		constructor.updateUserProfile('user');

		expect(wrapperPutStub.withArgs(constructor.userProfileURL).calledOnce).to.be.ok;
		expect(responseSpy.withArgs().calledOnce).to.be.ok;
	});

	it('should handle apply changes', function () {
		var updateUserProfileStub = sinon.stub(constructor, 'updateUserProfile');
		constructor.apply();
		expect(updateUserProfileStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle reset changes for default profile mode', function () {
		var updateProfileObjectsStub = sinon.stub(constructor, 'updateProfileObjects');
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.defaultAppProfile = {};
		constructor.reset();
		expect(updateProfileObjectsStub.withArgs().calledOnce).to.be.ok;
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle reset changes for user profile mode', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.defaultAppProfile = null;
		constructor.defaultColumnDefs = [{name:'col1'}, {name:'col2'}];
		constructor.reset();
		expect(constructor.columnDefs.length).to.be.equal(2);
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
	});
	
});


