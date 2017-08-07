describe('Save Search Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $rootScope, $injector) {
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');

		constructor = $controller('SaveSearchController', {
			AppEvents : appEvents,
			eventbus: eventbus,
			httpWrapperService: wrapperService
		});

	}));

	it('should call the necessary functions on controller intialisation', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');
		var addListenerStub = sinon.stub(constructor, 'addListeners');
		var initProfileStub = sinon.stub(constructor, 'initProfileLoad');
		constructor.userProfileURL = '@profile/@setting';
		
		constructor.initialise();
		
		expect(eventbusRaiseStub.calledOnce).to.be.ok;
		expect(constructor.userProfileURL).to.be.equal('savesearch/@setting');
		expect(addListenerStub.withArgs().calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.userProfileMode).calledOnce).to.be.ok;
	});

	it('should add the necessary listeners on calling addListeners', function () {
		var addListenerStub = sinon.stub(constructor.eventbus, 'addListner');

		constructor.addListeners();

		expect(addListenerStub
			.withArgs(appEvents.ShowSaveWindow.name, constructor.onShowSaveWindow)
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
		var getSlotDataStub = sinon.stub(constructor, 'getSlotData');
		var userProfileURL = 'test/guest/test';
		constructor.maxSlots = 3;

		constructor.loadProfile(userProfileURL);	
		
		for (var i = 0; i < constructor.maxSlots; i++) {
			expect(getSlotDataStub
				.withArgs(userProfileURL, 'slot'+(i+1))
				.calledOnce).to.be.ok;
		}

	});

	it('should get the slot data', function () {
		var url = 'test/@setting/test';
		var slot = 'slot1';		
		var httpWrapperStub = sinon.stub(constructor.wrapperService, 'get');
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		httpWrapperStub.returns(responseObj);

		constructor.getSlotData(url, slot);
		
		expect(httpWrapperStub
			.withArgs(url.replaceAll('@setting', slot), constructor.userProfileHeaders)
			.calledOnce).to.be.ok;
		expect(responseThenStub
			.withArgs(constructor.successHandler, constructor.errorHandler)
			.calledOnce).to.be.ok;
	});

	it('should handle saving the search data in user profile with put call', function () {
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.wrapperService, 'put');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		
		constructor.saveSlotData(1, 'temp search', {});
		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenStub
				.withArgs(constructor.successHandler, constructor.errorHandler)
				.calledOnce).to.be.ok;
	});

	it('should handle saving the search data in user profile with post call', function () {
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.wrapperService, 'post');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.noUserProfileSlots = ['slot1'];
		
		constructor.saveSlotData(1, 'temp search', {});

		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenStub
				.withArgs(constructor.successHandler, constructor.errorHandler)
				.calledOnce).to.be.ok;
	});
	it('should save search data to user profile when save as is empty', function () {
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.wrapperService, 'post');
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.noUserProfileSlots = ['slot1'];
		
		constructor.saveSlotData(1, ' ', {});

		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenStub
				.withArgs(constructor.successHandler, constructor.errorHandler)
				.calledOnce).to.be.ok;
	});

	it('should handle the success response for the save search user profile calls', function () {
 		var responseData = {
 			data: {
 				Settings: {
 					'slot1': '{ "tempVar":"tempValue" }'
 				}
 			}
 		};
 		var loadCompleteStub = sinon.stub(constructor, 'checkForLoadComplete');
 		constructor.slotsData[0] = { name: 'slot1', 
	    						displayName:'my slot1', 
	    						data:null, disabled:true, 
	    						selected:false 
	    					};

		constructor.successHandler(responseData);

 		expect(constructor.slotsData[0].data).not.to.be.null;
 		expect(constructor.slotsData[0].disabled).to.be.false;
 		expect(loadCompleteStub.calledOnce).to.be.ok;
 		//expect(constructor.slotsData[0].displayName).to.be.equal('tempValue');
	});

	it('should handle the error response for the save search user profile calls', function () {
		var getSlotDataStub = sinon.stub(constructor, 'getSlotData');
 		var errObj = {
 			config: {
 				url: 'user/guest/savesearch/slot1'
 			}
 		};

		constructor.errorHandler(errObj);

		var url = constructor.userProfileURL.replaceAll('@userName', constructor.defaultProfileMode);
 		expect(getSlotDataStub.withArgs(url,'slot1').calledOnce).to.be.ok;
 		expect(constructor.noUserProfileSlots).to.include('slot1');
	});
	it('should handle the error response for default user', function () {
		var checkForLoadCompleteStub = sinon.stub(constructor, 'checkForLoadComplete');
 		var errObj = {
 			config: {
 				url: 'user/default/savesearch/slot1'
 			}
 		};
 		constructor.slotsData[0] = { name: 'slot1', 
	    						displayName:'my slot1', 
	    						data:null, disabled:true, 
	    						selected:false,
	    						loaded:false

	    					};

		constructor.errorHandler(errObj);
 		expect(checkForLoadCompleteStub.calledOnce).to.be.ok;
 		expect(constructor.slotsData).not.to.be.null;
	});
	it('should check slots data is been completed or not', function () {
		//var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.maxSlots = 3;
 		constructor.slotsData[0] = { name: 'slot1', 
	    						displayName:'my slot1', 
	    						data:null, disabled:true, 
	    						selected:false,
	    						loaded:false

	    					};

		constructor.checkForLoadComplete();
 		expect(constructor.slotsData).not.to.be.null;
	});

	it('should check slots data is been completed ?', function () {
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.maxSlots = 1;
		constructor.slotsData[0] = { name: 'slot1', 
	    						displayName:'my slot1', 
	    						data:null, disabled:true, 
	    						selected:false,
	    						loaded:true

	    					};
		constructor.checkForLoadComplete();
 		expect(constructor.isLoadComplete).to.be.true;
 		expect(raiseStub.calledOnce).to.be.ok;
	});

   it('should save last selected search filter to user profile', function () {
		var applyStub = sinon.stub(constructor, 'apply');
		constructor.applyLastSelectedSearchFilter();
 		expect(applyStub.calledOnce).to.be.ok;
 		applyStub.restore();
	});

   it('should update the search box on selected search profile', function () {
		var evt = { type: 'recentsearch', selectedSlot: 'slot3'};
		constructor.onUpdateSelectedSearchProfile(evt);
		expect(evt.type).to.be.equal('recentsearch');
 		expect(constructor.selectedApplySlot).to.be.null;
	});
   //Application consuming this framework would provide implementation,then we can expect the value
   it('should hadnle show save model', function () {
		constructor.showSaveModal(); 
	});

	it('should handle the applying the saved search filter', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [{name:'slot1', 'displayName':'slot-1', 'data': {'slot-1':'testData1'} }, 
								{name:'slot2','displayName':'slot-2', 'data': {'slot-2':'testData2'} }];
		constructor.selectedApplySlot = 'slot2';

		constructor.apply();

 		expect(eventbusRaiseStub.called).to.be.ok;
	});
	it('should handle when slots is not  available', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [];
		constructor.apply();

 		expect(eventbusRaiseStub.called).to.be.ok;
	});

	it('should handle resetting the saved search filter', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');

		constructor.reset();
		
		expect(constructor.selectedApplySlot).to.be.null;
 		expect(eventbusRaiseStub.calledOnce).to.be.ok;
	});

	it('should handle resetting the saved search filter', function () {
		var showSaveModalStub = sinon.stub(constructor, 'showSaveModal');
		var evt = {searchData:'testData'};

		constructor.onShowSaveWindow(evt);
		
		expect(showSaveModalStub.calledOnce).to.be.ok;
		expect(constructor.searchDataForSave).to.be.equal(evt.searchData);

	});


	it('should handle saving the search filter', function () {
		var saveSlotDataStub = sinon.stub(constructor, 'saveSlotData');
		constructor.slotNames = ['slot1', 'slot2'];
		constructor.selectedSaveSlot = 'slot2';
		constructor.saveSearchAs = 'test slot2';
		constructor.searchDataForSave = 'test data';

		constructor.saveSearchData();

		expect(saveSlotDataStub.withArgs(2, constructor.saveSearchAs, 'test data').calledOnce).to.be.ok;
		expect(constructor.searchDataForSave).to.be.null;

	});
	it('should handle saving the search filter', function () {
		constructor.savePopup =  {};
		constructor.savePopup.close = function(){};	
		var savepopupDataStub = sinon.stub(constructor.savePopup, 'close');
		constructor.saveSearchData();

		expect(savepopupDataStub.calledOnce).to.be.ok;
		expect(constructor.savePopup).to.be.null;

	});
	it('should load last search to user profile', function () {
		var lastSearchStub = sinon.stub(constructor, 'applyLastSelectedSearchFilter');
		var evt = {
					  'name': 'onLoadLastSelectedSearchProfile',
					  'profileData': '{"type":"savesearch","selectedSlot":"slot2"}'
					};

		constructor.onLoadLastSelectedSearchProfile (evt);
		expect(constructor.selectedApplySlot ).to.be.equal('slot2');
		expect(lastSearchStub.calledOnce).to.be.ok;

	});

});


