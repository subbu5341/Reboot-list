describe('Paginator Controller', function() {
	var constructor, appEvents, eventbus;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');

		constructor = $controller('PaginatorController', {
			AppEvents : appEvents,
			eventbus : eventbus
		});
	}));

	it('should call the necessary functions on controller intialisation', function () {
		var addListenersStub = sinon.stub(constructor, 'addListeners');
		constructor.initialise();
		expect(addListenersStub.withArgs().calledOnce).to.be.ok;
	});

	it('should add the necessary listeners on calling addListeners', function () {
		var addListenerStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();

		expect(addListenerStub.withArgs(appEvents.GridDataLoad.name, constructor.onGridDataLoad)
			.calledOnce).to.be.ok;
		expect(addListenerStub.withArgs(appEvents.GridPageChange.name, constructor.onGridPageChange)
			.calledOnce).to.be.ok;
	});
	it('should handle grid load', function () {
		var evt = {
			paginationData: {
				'paginationMarker':{ 
					'ID': 60,
					'Direction': 'FORWARD',
					'Count': 20
				},
				totalRecords:75
			},
			pageSize: 20	
		};
		constructor.disabledFirst = false;
		constructor.disabledPrevious = false;
		constructor.disabledNext = false;
		constructor.disabledLast = false;

		constructor.onGridDataLoad(evt);

		expect(constructor.paginationData).to.be.equal(evt.paginationData);
		expect(constructor.pageSize).to.be.equal(evt.pageSize);
		expect(constructor.disabledNext).to.be.true;
		expect(constructor.disabledLast).to.be.true;
	});

	it('should handle grid data load for previous and firstpage', function () {
		var evt = {
			paginationData: {
				'paginationMarker':{ 
					'ID': 0,
					'Direction': 'FORWARD',
					'Count': 50
		      	},
				totalRecords:75
		  	},
			pageSize: 50
		};
		constructor.disabledFirst = false;
		constructor.disabledPrevious = false;
		constructor.disabledNext = false;
		constructor.disabledLast = false;
		constructor.onGridDataLoad(evt);

		expect(constructor.paginationData).to.be.equal(evt.paginationData);
		expect(constructor.pageSize).to.be.equal(evt.pageSize);
		expect(constructor.disabledPrevious).to.be.true;
		expect(constructor.disabledFirst).to.be.true;

	});

	it('should handle grid page change', function () {
		constructor.currentPageNum = 1;
		var evt = { currentPage : 25 };
		constructor.onGridPageChange(evt);
		expect(constructor.currentPageNum).to.be.equal(25);
	});
	it('should handle grid  first page of list page', function () {
		var firstpageStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.first();
		expect(firstpageStub.calledOnce).to.be.ok;
	});
	it('should handle grid  previous page of list page ', function () {
		var previouspageStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.previous();
		expect(previouspageStub.calledOnce).to.be.ok;
	});
	it('should handle grid  next page of list page ', function () {
		var nextpageStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.next();
		expect(nextpageStub.calledOnce).to.be.ok;
	});
	it('should handle grid  last page of list page ', function () {
		var lastpageStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.last();
		expect(lastpageStub.calledOnce).to.be.ok;
	});
	it('should handle grid  seekPage page of list page ', function () {
		var seekPagepageStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.seekPage();
		expect(seekPagepageStub.calledOnce).to.be.ok;
	});

	it('should handle grid page size change', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.pageSizeChange();
		expect(eventbusStub.calledOnce).to.be.ok;
	});

	it('should handle toggle select all rows', function () {
		var eventbusStub = sinon.stub(constructor.eventbus, 'raise');
		constructor.toggleSelectAll();
		expect(eventbusStub.calledOnce).to.be.ok;
	});
});