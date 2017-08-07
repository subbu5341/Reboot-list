describe('advSearchController Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, timeout, scope;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	// appEvents = {FormLoad:'onFormLoad', PageLoad:'onPageLoad'};

	beforeEach(inject(function ($controller, $injector, $rootScope) {
		timeout = $injector.get('$timeout');
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		scope = $rootScope.$new();
		wrapperService = $injector.get('httpWrapperService');
// $timeout, $scope, eventbus, AppEvents
		constructor = $controller('advSearchController', {
			timeout : timeout,
			$scope: scope,
			AppEvents : appEvents,
			eventbus: eventbus
		});
	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenersStub = sinon.stub(constructor, 'addListeners');
		constructor.initialise();
		expect(addListenersStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle add listenser', function () {
		var addListenersStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();
		expect(addListenersStub
			.withArgs(appEvents.ApplySearchProfile.name, constructor.onApplySearchProfile).calledOnce).to.be.ok;
	});

	it('should handle grid Loaded', function () {
		constructor.populateData();
		expect(constructor.getSourceFields().length).to.be.above(0);
	});

	it('should populate the components on applying the search profile', function () {
		var profileData = {'advanceSearchVal' : 'testValue' };
		var queryStr = 'column1 = "rackspace" AND column2 = "source"';
		var evt = {
			searchData : {
				renderData : {
					advSearchController : profileData
				},
				queryData : {
					advSearchController : queryStr
				}
			}
		};

		constructor.onApplySearchProfile(evt);
		expect(constructor.searchContainer).to.be.equal(profileData.advanceSearchVal);
		expect(constructor.expressionString).to.be.equal(queryStr);
	});

	it('should reset on applying the search profile if not profile data available', function () {
		var resetStub = sinon.stub(constructor, 'onResetData');
		var evt = {
			searchData : {
				renderData : { },
				queryData : { }
			}
		};

		constructor.onApplySearchProfile(evt);

		expect(resetStub.withArgs().calledOnce).to.be.ok;
	});

	it('should return the search query for advances search components', function () {
		constructor.expressionString = 'testVar = true';
		var data = constructor.getSearchQueryData();
		expect(data).to.be.equal(constructor.expressionString);
	});

	it('should reinitialise the data on reset', function () {
		constructor.searchContainer.groups[0].conditions = [{'sourceField':{'name':'rowData','displayName':'URN'},
			'comparisonOperator':{'displayName':'!='},
			'inputItem':{'displayName':'asd','data':'asd'}},
			{'$$hashKey':'object:466','sourceField':{'name':'rowData','displayName':'URN'},
			'comparisonOperator':{'displayName':'='},'inputItem':{'displayName':'asd','data':'asd'}}];
		constructor.onResetData();
		expect(constructor.searchContainer.groups[0].conditions.length).to.be.equal(0);
	});

	it('should return the search render data for advances search components', function () {
		constructor.searchContainer = '{testData: true}';
		var data = constructor.getSearchRenderData();
		expect(data.advanceSearchVal).to.be.equal(constructor.searchContainer);
	});

	it('should collapse the advanced search panel if it is expanded', function () {
		scope.slide = true;
		constructor.toggleAdvSearch();
		expect(scope.slide).to.be.equal(false);
	});

	it('should collapse the advanced search panel if it is expanded', function () {
		var resetStub = sinon.stub(constructor, 'toggleAdvSearch');
		scope.slide = true;
		constructor.onExpandColumnSettings();
		expect(resetStub.withArgs().calledOnce).to.be.ok;
	});

	it('should expand the advanced search panel if it is collapsed', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		scope.slide = false;
		constructor.toggleAdvSearch();
		expect(scope.slide).to.be.equal(true);
		expect(constructor.autoUpdateQuery).to.be.equal(true);
   		expect(eventbusStub.withArgs(new appEvents.ToggleColumnSettings(true)).calledOnce).to.be.ok;
	});

	it('should call when we are adding new group', function () {
		var onSearchDataChangeStub = sinon.stub(constructor, 'onSearchDataChange');
		constructor.onAddGroup ();
		expect(onSearchDataChangeStub.withArgs().calledOnce).to.be.ok;
	});
	it('should call when we are adding some condition', function () {
		var onSearchDataChangecondStub = sinon.stub(constructor, 'onSearchDataChange');
		constructor.onAddCondition();
		expect(onSearchDataChangecondStub.withArgs().calledOnce).to.be.ok;
	});
	it('should call when we are reoving group', function () {
		var onSearchDataChangeremStub = sinon.stub(constructor, 'onSearchDataChange');
		constructor.onRemoveGroup();
		expect(onSearchDataChangeremStub.withArgs().calledOnce).to.be.ok;
	});
	it('should call when we are removing condition', function () {
		var onSearchDataChangeremcondStub = sinon.stub(constructor, 'onSearchDataChange');
		constructor.onRemoveCondition();
		expect(onSearchDataChangeremcondStub.withArgs().calledOnce).to.be.ok;
	});
	it('should call when we are removing condition', function () {
		var onExpandOrCollapseAdvSearchStub = sinon.stub(constructor, 'onExpandOrCollapseAdvSearch');
		scope.slide = false;
		constructor.CollapseTextCenter ();
		expect(scope.slide).to.be.true;
		expect(onExpandOrCollapseAdvSearchStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle getSearchQuery' , function () {
		constructor.searchContainer.groups[0].conditions = [{'sourceField':{'name':'rowData','displayName':'URN'},
			'comparisonOperator':{'displayName':'!='},
			'inputItem':{'displayName':'asd','data':'asd'}},
			{'$$hashKey':'object:466','sourceField':{'name':'rowData','displayName':'URN'},
			'comparisonOperator':{'displayName':'='},'inputItem':{'displayName':'asd','data':'asd'}}];
		constructor.expressionString = '((StartDate = \'Thu Nov 17 2016 16:18:00 GMT+0530 (India Standard Time)\'))';
		constructor.autoUpdateQuery = true;
		expect(constructor.getSearchQuery()).to.equal('((StartDate = \'2016-11-17T10:48:00.000Z\'))');
	});

	it('should handle getSearchQuery if autoUpdateQuery is false' , function () {
		constructor.autoUpdateQuery = false;
		var data = constructor.getSearchQuery();
		expect(data).to.equal(null);
	});
});