describe('Recent Search Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $rootScope, $injector) {
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');

		constructor = $controller('RecentSearchController', {
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
		expect(constructor.userProfileURL).to.be.equal('recentsearch/@setting');
		expect(addListenerStub.withArgs().calledOnce).to.be.ok;
		expect(initProfileStub.withArgs(constructor.userProfileMode).calledOnce).to.be.ok;
	});

	it('should add the necessary listeners on calling addListeners', function () {
		var addListenerStub = sinon.stub(constructor.eventbus, 'addListner');

		constructor.addListeners();

		expect(addListenerStub
			.withArgs(appEvents.SaveRecentSearch.name, constructor.onSaveRecentSearch)
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
			.withArgs(url.replaceAll('@setting', slot), constructor.headers)
			.calledOnce).to.be.ok;
		expect(responseThenStub
			.withArgs(constructor.getSuccessHandler, constructor.getErrorHandler)
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
				.withArgs(constructor.saveSuccessHandler, constructor.saveErrorHandler)
				.calledOnce).to.be.ok;
	});

	it('should handle saving the search data in user profile with post call', function () {
		var responseObj = {then:function(){}};
		var responseThenStub = sinon.stub(responseObj, 'then');
		var httpWrapperStub = sinon.stub(constructor.wrapperService, 'post');
		var saveData = { 'testVar' : 'testValue' };
		httpWrapperStub.returns(responseObj);
		constructor.userName = 'guest';
		constructor.userAppProfile = {};
		constructor.userProfileURL = 'test/@userName/test';
		constructor.currentProfileMode = constructor.defaultProfileMode;
		constructor.noUserProfileSlots = ['slot1', 'slot2', 'slot3'];
		
		constructor.saveSlotData('slot2', saveData);

		var url  = constructor.userProfileURL.replaceAll('@userName', constructor.userName);

		expect(httpWrapperStub.withArgs(url).calledOnce).to.be.ok;
		expect(responseThenStub
				.withArgs(constructor.saveSuccessHandler, constructor.saveErrorHandler)
				.calledOnce).to.be.ok;
	});

	it('should handle the success response for the save search user profile calls', function () {
 		var responseData = {
 			data: {
 				Settings: {
 					'slot1': '{ "timestamp" : "2016-05-22T16:16:00.000Z", "tempVar":"tempValue" }'
 				}
 			}
 		};
 		var sortSlotsByTimeStub = sinon.stub(constructor, 'sortSlotsByTime');
 		constructor.slotsData[0] = { 
 								timestamp: null,
	    						data:null, 
	    						slot: 'slot1',
	    						disabled:true, 
	    						selected:false
	    					};

		constructor.saveSuccessHandler(responseData);

		expect(sortSlotsByTimeStub.calledOnce).to.be.ok;
 		expect(constructor.slotsData[0].timestamp).not.to.be.null;
 		expect(constructor.slotsData[0].data).not.to.be.null;
 		expect(constructor.slotsData[0].disabled).to.be.false;
	});

	it('should handle the applying the saved search filter', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [{name:'slot1', data:'testData1'}, {name:'slot2', data:'testData2'}];
		constructor.slotNames = ['slot1', 'slot2', 'slot3'];
		constructor.selectedApplySlot = 'slot2';

		constructor.apply();

 		expect(eventbusRaiseStub.called).to.be.ok;
	});
	it('should apply changes to saved search filter', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [];
		constructor.apply();

 		expect(eventbusRaiseStub.called).to.be.ok;
	});
	it('should update selected data in save search with slots selected or created ', function () {
		var evt = {
			  'name': 'onUpdateSelectedSearchProfile',
			  'type': 'savesearch',
			  'selectedSlot': 'slot1'
			};
		constructor.onUpdateSelectedSearchProfile(evt);
 		expect(evt.type).to.be.equal('savesearch');
 		expect(constructor.selectedApplySlot ).to.be.equal(null);
	});	

	it('should handle resetting the saved search filter', function () {
		var eventbusRaiseStub = sinon.stub(constructor.eventbus, 'raise');

		constructor.reset();
		
		expect(constructor.selectedApplySlot).to.be.null;
 		expect(eventbusRaiseStub.calledOnce).to.be.ok;
	});

	it('should handle success response for get call', function () {
		var loadCompleteStub = sinon.stub(constructor, 'checkForLoadComplete');
		constructor.slotsData = [{name:'slot1', data:'testData1'}, {name:'slot2', data:'testData2'}];
 		var responseData = {
 			data: {
 				Settings: {
 					'slot1': '{ "timestamp" : "2016-05-22T16:16:00.000Z", "testVar":"testValue" }'
 				}
 			}
 		};

		constructor.getSuccessHandler(responseData);
		var day = new Date('2016-05-22T16:16:00.000Z').getDay();
		expect(constructor.slotsData[0].timestamp.getDay()).to.be.equal(day);
		expect(constructor.slotsData[0].slot).to.be.equal('slot1');
 		expect(loadCompleteStub.calledOnce).to.be.ok;
	});

	it('should handle error response for get call in user profile mode', function () {
		var error = { config : { url : 'internal/user/user123/recentsearch/slot2' } };
		var getSlotDataStub = sinon.stub(constructor, 'getSlotData');

		constructor.slotsData = [{name:'slot1', data:'testData1'}, {name:'slot2', data:'testData2'}];

		constructor.getErrorHandler(error);

 		expect(getSlotDataStub.calledOnce).to.be.ok;
 		expect(constructor.noUserProfileSlots).to.include('slot2');
	});

	it('should handle error response for get call in default profile mode', function () {
		var error = { config : { url : 'internal/user/default/recentsearch/slot2' } };
		var LoadCompleteStub = sinon.stub(constructor, 'checkForLoadComplete');

		constructor.slotsData = [{name:'slot1', data:'testData1'}, {name:'slot2', data:'testData2'}];

		constructor.getErrorHandler(error);
		
 		expect(LoadCompleteStub.calledOnce).to.be.ok;
 		expect(constructor.slotsData[1].slot).to.include('slot2');
	});

	it('should handle error response for save call', function () {
		var error = { config : { url : 'internal/user/default/recentsearch/slot2' } };
		constructor.saveErrorHandler(error);
	});

	it('should handle applying last selected filter when all slots are loaded', function () {
		var sortSlotsStub = sinon.stub(constructor, 'sortSlotsByTime');
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [ {loaded : true}, {loaded : true}, {loaded : true}, 
									{loaded : true}, {loaded : true}]; 
		constructor.checkForLoadComplete();
		expect(sortSlotsStub.calledOnce).to.be.ok;
		expect(raiseStub.calledOnce).to.be.ok;
	});

	it('should handle not applying last selected filter when all slots are not loaded', function () {
		var sortSlotsStub = sinon.stub(constructor, 'sortSlotsByTime');
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.slotsData = [ {loaded : true}, {loaded : true}, {loaded : false},
									 {loaded : true}, {loaded : true}];
		constructor.checkForLoadComplete();
		expect(sortSlotsStub.calledOnce).not.to.be.ok;
		expect(raiseStub.calledOnce).not.to.be.ok;
	});

	it('should handle sorting slots by time', function () {
		constructor.slotsData = [ 	
							{'timestamp' : new Date('2016-05-22T16:16:00.000Z'), data: {'name':'testValue1'} }, 
							{'timestamp' : new Date('2016-05-24T16:16:00.000Z'), data: {'name':'testValue2'} }, 
							{'timestamp' : new Date('2016-05-23T16:16:00.000Z'), data: {'name':'testValue3'} },
							{data : null},
							{data : null}
						]; 
		constructor.sortSlotsByTime();
		expect(constructor.slotsData[0].data.name).to.be.equal('testValue2');
		expect(constructor.slotsData[1].data.name).to.be.equal('testValue3');
		expect(constructor.slotsData[2].data.name).to.be.equal('testValue1');
		expect(constructor.slotsData[3].data).to.be.equal(null);
		expect(constructor.slotsData[4].data).to.be.equal(null);
	});

	it('should handle saving the resent search', function () {
		var getSlotStub = sinon.stub(constructor, 'getSlotForSave');
		var saveSlotStub = sinon.stub(constructor, 'saveSlotData');
		constructor.selectedApplySlot = null;
		getSlotStub.returns('slot2');
		var evt = {searchData: {'name':'testValue'}};

		constructor.onSaveRecentSearch(evt);

		expect(getSlotStub.calledOnce).to.be.ok;
		expect(saveSlotStub.withArgs('slot2').calledOnce).to.be.ok;
		expect(constructor.selectedApplySlot).to.be.equal(null);
	});

	it('should handle returning the slot for save when atleast one slot is not filled', function () {
		constructor.slotsData = [ 	
			{'slot':'slot1','timestamp' : new Date('2016-05-22T16:16:00.000Z'), data: {'name':'testValue1'} }, 
			{'slot':'slot2','timestamp' : new Date('2016-05-24T16:16:00.000Z'), data: {'name':'testValue2'} }, 
			{'slot':'slot3','timestamp' : new Date('2016-05-23T16:16:00.000Z'), data: {'name':'testValue3'} },
			{'slot':'slot4', data : null},
			{'slot':'slot5',data : null}
		]; 
		constructor.selectedApplySlot = null;

		var slot = constructor.getSlotForSave();
 		expect(slot).to.be.equal('slot4');
	});

	it('should handle returning the slot for save when all slots are filled', function () {
		constructor.slotsData = [ 	
			{'slot':'slot1','timestamp' : new Date('2016-05-22T16:16:00.000Z'), data: {'name':'testValue1'} }, 
			{'slot':'slot2','timestamp' : new Date('2016-05-23T16:16:00.000Z'), data: {'name':'testValue2'} }, 
			{'slot':'slot3','timestamp' : new Date('2016-05-24T16:16:00.000Z'), data: {'name':'testValue3'} },
			{'slot':'slot4','timestamp' : new Date('2016-05-25T16:16:00.000Z'), data: {'name':'testValue4'} },
			{'slot':'slot5','timestamp' : new Date('2016-05-26T16:16:00.000Z'), data: {'name':'testValue5'}}
		];

		constructor.selectedApplySlot = null;

		var slot = constructor.getSlotForSave();

 		expect(slot).to.be.equal('slot5');
	});
	it('should save last selected search profile in different slots', function () {
		var evt = {
					  'name': 'onLoadLastSelectedSearchProfile',
					  'profileData': '{"type":"recentsearch","selectedSlot":"slot2"}'
					};
		constructor.slotsData = [ 	
			{'slot':'slot1','timestamp' : new Date('2016-05-22T16:16:00.000Z'), data: {'name':'testValue1'} }, 
			{'slot':'slot2','timestamp' : new Date('2016-05-23T16:16:00.000Z'), data: {'name':'testValue2'} }, 
			{'slot':'slot3','timestamp' : new Date('2016-05-24T16:16:00.000Z'), data: {'name':'testValue3'} },
			{'slot':'slot4','timestamp' : new Date('2016-05-25T16:16:00.000Z'), data: {'name':'testValue4'} },
			{'slot':'slot5','timestamp' : new Date('2016-05-26T16:16:00.000Z'), data: {'name':'testValue5'}}
		];
		constructor.onLoadLastSelectedSearchProfile(evt);
		expect(constructor.selectedApplySlot).to.be.equal('Slot 2');
	});
});


