describe('BasicSearchController Widget Controller', function() {
	var constructor, appEvents, wrapperService, eventbus, timeout, scope, urlQueryStrMgr;
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
		urlQueryStrMgr = $injector.get('URLQueryStrManagerService');
// $timeout, $scope, eventbus, AppEvents
		constructor = $controller('BasicSearchController', {
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
	
	it('should call the necessary functions on controller intialisation', function () {
		constructor.selectedColumn = 'testColumn';
		constructor.searchKeyword = 'saveSearch';
		constructor.onResetData();
		expect(constructor.selectedColumn).to.be.equal('');
		expect(constructor.searchKeyword).to.be.equal('');
	});


	it('should handle add listenser', function () {
		var addListenersStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();
		expect(addListenersStub
			.withArgs(appEvents.ApplySearchProfile.name, constructor.onApplySearchProfile).calledOnce).to.be.ok;
		expect(addListenersStub.withArgs(appEvents.ExpandOrCollapseAdvSearch.name,
			constructor.onExpandOrCollapseAdvSearch).calledOnce).to.be.ok;
	});

	it('should return me.isComponentDisabled value as true when true supplied', function() {
		var obj = {isExpanded:true};
		constructor.onExpandOrCollapseAdvSearch(obj);
		expect(constructor.isComponentDisabled).to.equal(true);
	});

	it('should populate the data on to the basic search components', function () {
		constructor.populateData();
		expect(constructor.gridColumns).to.have.length(4);
	});
	
	it('should populate the data on to the basic search components when URL query is unavailable ', function () {
		var queryStrObj = {};
		var urlQueryStrMgrStub = sinon.stub(urlQueryStrMgr, 'getURLQueryParams');
		constructor.searchKeyword = '';
		urlQueryStrMgrStub.returns(queryStrObj);
		constructor.populateData();
		expect(constructor.gridColumns).to.have.length.above(0);
		expect(constructor.searchKeyword).to.equal('');
		urlQueryStrMgrStub.restore();
	});

	it('should populate the data on to the basic search components when URL query is available ', function () {
		var queryStrObj = {AccountID:'ecd5ddd0-5ac8-44d5-a074-7938db1a6f41'};
		var urlQueryStrMgrStub = sinon.stub(urlQueryStrMgr, 'getURLQueryParams');
		urlQueryStrMgrStub.returns(queryStrObj);
		constructor.populateData();
		expect(constructor.gridColumns).to.have.length.above(0);
		expect(constructor.searchKeyword).to.equal(queryStrObj.AccountID);
		urlQueryStrMgrStub.restore();
	});

	//Application consuming this framework would provide implementation,then we can expect the value
	it('should reset basic search option', function () {
		constructor.reset(); 	
	});
	it('should show search icon click', function () {
		var onSearchIconClickStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.onSearchIconClick (); 
		expect(onSearchIconClickStub.withArgs().calledOnce).to.be.ok;
	});
	it('should getSearchQueryData return if the isComponentDisabled value is true', function(){
		constructor.isComponentDisabled = true;
		var data = constructor.getSearchQueryData();
		expect(data).to.be.equal(undefined);
	});

	it('should return the search query for basic search components', function () {
		constructor.isComponentDisabled = false;
		constructor.selectedColumn = {value:'testColumn'};
		constructor.searchKeyword = 'testKeyword';
		var data = constructor.getSearchQueryData();
		expect(data).to.be.equal('testColumn = ' + '\'' + constructor.searchKeyword +'\'');
	});

	it('should call once me.getSearchQueryData in getSearchQuery function', function() {
		var testObj = {searchStr:'testword'};
		var searchQueryDataStub = sinon.stub(constructor,'getSearchQueryData');
		searchQueryDataStub.returns(testObj);
		expect(constructor.getSearchQuery()).to.equal(testObj);
		searchQueryDataStub.restore();
	});

	it('should return the search render data for basic search components', function () {
		constructor.selectedColumn = {value:'testColumn'};
		constructor.searchKeyword = 'testKeyword';
		constructor.isComponentDisabled = false;
		var data = constructor.getSearchRenderData();
		expect(data.column).to.be.equal(constructor.selectedColumn.value);
		expect(data.keyword).to.be.equal(constructor.searchKeyword);
	});

	it('should return getSearchRenderData if isComponentDisabled is true',function () {
		constructor.isComponentDisabled = true;
		var data = constructor.getSearchRenderData();
		expect(data).to.be.equal(undefined);
	});

	it('should render the search components on applying search profile', function () {
		constructor.selectedColumn = null;
		constructor.searchKeyword = null;
		constructor.gridColumns = [
			{name:'column1', value:'column-1'},
			{name:'column2', value:'column-2'},
			{name:'column3', value:'column-3'}
		];

		var profileData = {'column' : 'column-2', 'keyword': 'testKeyword' };
		var evt = {
			searchData : {
				renderData : {
					BasicSearchController : profileData
				}
			}
		};

		constructor.onApplySearchProfile(evt);
		expect(constructor.selectedColumn).to.be.equal(constructor.gridColumns[1]);
		expect(constructor.searchKeyword).to.be.equal(profileData.keyword);
	});
	//if profiledata is false the constructor.searchContainer and constructor.searchKeyword values will be default.
	it('should reset data on applying invalid search profile', function () {
		var onresetdataStub = sinon.stub(constructor, 'onResetData');

		var evt = {
			searchData : {
				renderData : { },
				queryData : { }
			}
		};
		constructor.onApplySearchProfile(evt);
		expect(onresetdataStub).to.be.ok;
		expect(constructor.searchContainer).to.be.undefined;
		expect(constructor.searchKeyword).to.be.equal('');
	});

});

describe('URLQueryStrManager Service', function() {
	var hasURLQueryMgr, location;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));

	beforeEach(inject(function ($controller, $injector) {
		location = $injector.get('$location');
		hasURLQueryMgr = $injector.get('URLQueryStrManagerService');
	}));

	it('should return true, if url query string is available', function () {
		var locationStub = sinon.stub(location, 'search');
		locationStub.returns({AccountID:'ae5da768-f0fd-4d01-a258-bb93fcf923ae'});
		var retVal = hasURLQueryMgr.hasURLQuery();
		expect(retVal).to.be.true;
		locationStub.restore();
	});

	it('should return false, if url query string is not available', function () {
		var locationStub = sinon.stub(location, 'search');
		locationStub.returns({});
		var retVal = hasURLQueryMgr.hasURLQuery();
		expect(retVal).to.be.false;
		locationStub.restore();
	});

	it('should return the query params, if url query string is available', function () {
		var locationStub = sinon.stub(location, 'search');
		locationStub.returns({AccountID:'ae5da768-f0fd-4d01-a258-bb93fcf923ae'});
		var retVal = hasURLQueryMgr.getURLQueryParams();
		expect(retVal.AccountID).to.equal('ae5da768-f0fd-4d01-a258-bb93fcf923ae');
		locationStub.restore();
	});

	it('should return null object, if url query string is not available', function () {
		var locationStub = sinon.stub(location, 'search');
		locationStub.returns({});
		var retVal = hasURLQueryMgr.getURLQueryParams();
		expect(retVal).to.be.null;
		locationStub.restore();
	});
});