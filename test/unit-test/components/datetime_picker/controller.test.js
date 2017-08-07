describe('datetimePickerController Widget Controller', function() {
	var constructor, eventbus, timeout, appEvents;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		timeout = $injector.get('$timeout');
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');

		constructor = $controller('datetimePickerController', {
			timeout : timeout,
			eventbus: eventbus,
			AppEvents : appEvents
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
		expect(addListenersStub.withArgs(appEvents.ApplySearchProfile.name,constructor.onApplySearchProfile)
			.calledOnce).to.be.ok;
		expect(addListenersStub.withArgs(appEvents.ExpandOrCollapseAdvSearch.name,
			constructor.onExpandOrCollapseAdvSearch).calledOnce).to.be.ok;
	});

	it('should return me.isComponentDisabled value as true when true supplied', function() {
		var obj = {isExpanded:true};
		constructor.onExpandOrCollapseAdvSearch(obj);
		expect(constructor.isComponentDisabled).to.equal(true);
	});

	it('should getSearchQueryData return if the isComponentDisabled value is true', function(){
		constructor.isComponentDisabled = true;
		var data = constructor.getSearchQueryData();
		expect(data).to.be.equal(undefined);
	});

	it('should return the search query for date picker components', function () {
		constructor.isComponentDisabled = false;
		constructor.startDate = new Date('2016-05-22T16:16:00.000Z');
		constructor.endDate = new Date('2016-06-22T16:16:00.000Z');
		var data = constructor.getSearchQueryData();
		var expectedData = 'StartDate >= \''+ constructor.startDate.toISOString() +'\'' +' AND EndDate <= \'' + 
 		constructor.endDate.toISOString() +'\'';
 		expect(data).to.be.equal(expectedData);
 	});
 	it('should return the search query as null when start date and end date is not there', function () {
 		constructor.startDate = '';
 		constructor.endDate = '';
 		var data = constructor.getSearchQueryData();
 		expect(data).to.be.equal(null);
 	});
 	it('should return the search query when start date is not defined', function () {
 		constructor.startDate = '';
 		constructor.endDate = new Date('2016-06-22T16:16:00.000Z');
 		var data = constructor.getSearchQueryData();
 		var expectedStartDate = new Date('1969-12-31T23:58:33.600Z');
 		var expectedData = 'StartDate  >= \''+ expectedStartDate.toISOString() +'\'' +' AND EndDate <= \'' + 
 			constructor.endDate.toISOString() +'\'';
 		expect(data).to.be.equal(expectedData);
 	});
 	it('should return the search query when end date is not defined', function () {
 		constructor.startDate = new Date('2016-05-22T16:16:00.000Z');
 		constructor.endDate = '';
 		var data = constructor.getSearchQueryData();
 		var expectedEndDate =  new Date();
 		var expectedData = 'StartDate >= \''+ constructor.startDate.toISOString() +'\'' +
 			' AND EndDate <= \'' +expectedEndDate.toISOString() +'\'';
  		expect(data).to.be.equal(expectedData);		  		
  	});

  	it('should getSearchRenderData return if the isComponentDisabled value is true', function(){
		constructor.isComponentDisabled = true;
		var data = constructor.getSearchRenderData();
		expect(data).to.be.equal(undefined);
	});
  	
	it('should return the search render data for basic search components', function () {
		constructor.startDate = new Date('2016-05-22T16:16:00.000Z');
		constructor.endDate = new Date('2016-06-22T16:16:00.000Z');
		var data = constructor.getSearchRenderData();
		expect(data.startDate).to.be.equal(constructor.startDate);
		expect(data.endDate).to.be.equal(constructor.endDate);
	});

	it('should call once me.getSearchQueryData in getSearchQuery function', function() {
		var searchObj = {startDate : '2016-05-22T16:16:00.000Z'};
		var searchQueryDataStub = sinon.stub(constructor, 'getSearchQueryData');
		searchQueryDataStub.returns(searchObj);
		expect(constructor.getSearchQuery()).to.equal(searchObj);
		searchQueryDataStub.restore();
	});

	it('should return the search query for basic search components', function () {
		constructor.startDate = null;
		constructor.endDate = null;

		var profileData = { startDate : '2016-05-22T16:16:00.000Z', 
							 endDate : '2016-06-22T16:16:00.000Z' };
		var evt = {
			searchData : {
				renderData : {
					datetimePickerController : profileData
				}
			}
		};

		constructor.onApplySearchProfile(evt);
		expect(constructor.startDate.getDay()).to.be.equal(new Date(profileData.startDate).getDay());
		expect(constructor.endDate.getDay()).to.be.equal(new Date(profileData.endDate).getDay());
	});
	it('should reset date on applying invalid search profile', function () {
		var onresetdataStub = sinon.stub(constructor, 'onResetData');
		constructor.startDate = null;
		constructor.endDate = null;
		var evt = {
			searchData : {
				renderData : { }
			}
		};

		constructor.onApplySearchProfile(evt);
		expect(onresetdataStub).to.be.ok;
		
	});
	it('should reset date on applying invalid date', function () {
		constructor.startDate = '13-10-2016 02:04 PM';
		constructor.endDate = '26-10-2016 02:06 PM';
		constructor.onResetData();
		expect(constructor.startDate).to.be.null;
		expect(constructor.endDate).to.be.null;
		
	});
	
	//Application consuming this framework would provide implementation,then we can expect the value
	it('should call date picker CB', function () {
		constructor.datePickerCB();	
	});
	it('should handle MethodNotImplemented prototype functions', function () {
		constructor.datePickerCB.MethodNotImplemented();	
	});

});

describe('Directives ::', function() {

	beforeEach(angular.mock.module('myApp.widgets'));

	describe('Testing hide-date-picker directive', function() {
		var scope, element, directiveElem, compile;

		beforeEach(inject(function($rootScope, $injector) {
			scope = $rootScope.$new();
			compile = $injector.get('$compile');
		}));

		it('should hide date picker on click of directive element', function() {
			var template = [
				'<input id="picker-start" hide-date-picker></input>'
			].join('');
				element = angular.element(template);
				directiveElem = compile(element)(scope);
				$('body').append(directiveElem);
				scope.$apply();
				var eleObj = { scope:function(){} };
				var scopeObj = { hide: function () {} };
				var eleStub = sinon.stub(angular, 'element');
				var scopeStub = sinon.stub(eleObj, 'scope');
				eleStub.returns(eleObj); 
				scopeStub.returns(scopeObj);
				$(directiveElem).trigger('click');
				expect(eleStub.withArgs().calledOnce).to.be.ok;
				expect(scopeStub.withArgs().calledOnce).to.be.ok;
				eleStub.restore();
		});
	});
});