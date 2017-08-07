describe('Search Button Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, dataConsolidator;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		wrapperService = $injector.get('httpWrapperService');
		dataConsolidator = $injector.get('searchDataConsolidator');

		constructor = $controller('searchBtnController', {
			AppEvents : appEvents,
			eventbus : eventbus,
			dataConsolidator : dataConsolidator
		});
	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenersStub = sinon.stub(constructor, 'addListeners');
		constructor.initialise();
		expect(addListenersStub.withArgs().calledOnce).to.be.ok;
	});
	it('should toggle Advance Search button when it is been clicked during search', function () {
		var toggleAdvSearchStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.toggleAdvSearch();
		expect(toggleAdvSearchStub.withArgs().calledOnce).to.be.ok;
	});
	it('should initialise on advance search to list page', function () {
		constructor.enableAdvancedSearch = false;
		constructor.onAdvancedSearchInitialise();
		expect(constructor.enableAdvancedSearch).to.be.true;
	});
	it('should resetdata on click and update', function () {
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.resetClick();
		expect(raiseStub.withArgs().calledTwice).to.be.true;	
	});

	it('should handle exportCSV function', function () {
		var raiseStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.exportCSV();
		expect(raiseStub.withArgs().calledOnce).to.be.ok;
		raiseStub.restore();
	});

	it('should handle onGridDataLoad function in true case', function () {
		constructor.isExportDisabled = false;
		var evt = {};
		evt.paginationData = {totalRecords: 0};
		constructor.onGridDataLoad(evt);
		expect(constructor.isExportDisabled).to.equal(true);
	});

	it('should handle onGridDataLoad function in false case', function () {
		constructor.isExportDisabled = false;
		var evt = {};
		evt.paginationData = {totalRecords: 1};
		constructor.onGridDataLoad(evt);
		expect(constructor.isExportDisabled).not.to.equal(true);
	});

	it('should handle search button click', function () {
		var consolidatorStub = sinon.stub(constructor.dataConsolidator, 'getSearchQuery');
		var query = 'testVar = testValue';
		consolidatorStub.returns(query);

		constructor.searchClick();

		expect(consolidatorStub.withArgs().calledOnce).to.be.ok;
	});

	it('should handle search button click', function () {
		var consolidatorStub = sinon.stub(constructor.dataConsolidator, 'getSearchData');
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		var searchData = '{ "testVar" : "testValue" }';
		consolidatorStub.returns(searchData);

		constructor.onSaveSearch();

		expect(consolidatorStub.withArgs().calledOnce).to.be.ok;
		expect(eventbusStub.withArgs().calledOnce).to.be.ok;
	});

});

describe('Search Data Consolidator', function() {
	var dataConsolidator;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		dataConsolidator = $injector.get('searchDataConsolidator');
	}));

	it('should return consolidated query of the search widgets', function () {
		var searchWidget1 = {
			getSearchQuery : function () {}
		};
		var searchWidget2 = {
			getSearchQuery : function () {}
		};

		var searchWidgetStub1 = sinon.stub(searchWidget1, 'getSearchQuery');
		searchWidgetStub1.returns('testVar1 = true');
		var searchWidgetStub2 = sinon.stub(searchWidget2, 'getSearchQuery');
		searchWidgetStub2.returns('testVar2 = false');
		
		dataConsolidator.addSearchWidget(searchWidget1);
		dataConsolidator.addSearchWidget(searchWidget2);

		var data = dataConsolidator.getSearchQuery();
		
		expect(searchWidgetStub1.withArgs().calledOnce).to.be.ok;
		expect(data).to.be.equal('testVar1 = true AND testVar2 = false');
	});

	it('should return consolidated search data of the search widgets', function () {
		var advSearchWidget = {
			name: 'advSearchController',
			getSearchQueryData : function () {},
			getSearchRenderData : function () {return ['test'];}
		};
		var basicSearchWidget = {
			name: 'BasicSearchController',
			getSearchQueryData : function () {},
			getSearchRenderData : function () {}
		};

		var advSearchQuery = 'URN = "Source"';
		var basicSearchQuery = '{name = rackspace}';

		var advSearchQueryStub = sinon.stub(advSearchWidget, 'getSearchQueryData');
		advSearchQueryStub.returns(advSearchQuery);

		var basicSearchQueryStub = sinon.stub(basicSearchWidget, 'getSearchQueryData');
		basicSearchQueryStub.returns(basicSearchQuery);
		
		dataConsolidator.addSearchWidget(advSearchWidget);
		dataConsolidator.addSearchWidget(basicSearchWidget);
		dataConsolidator.searchWidgetList ={AbstractWidgetCtrl :{getSearchRenderData:'test'}};
		var data = dataConsolidator.getSearchData();
		
		expect(data.queryData.BasicSearchController).to.be.equal(basicSearchQuery);
		expect(data.queryData.advSearchController).to.be.equal(advSearchQuery);
	});

});