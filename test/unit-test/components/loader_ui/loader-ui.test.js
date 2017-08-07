describe('Loader UI Service', function() {
	var loaderuiService;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   

	beforeEach(inject(function ($controller, $injector) {
		loaderuiService = $injector.get('LoaderUiService');
		var elem = document.getElementById('process-loader');
		if (elem) {
			elem.parentNode.removeChild(elem);	
		}
		
	}));

	it('should show the loader for the single component', function () {
		loaderuiService.showLoader('user-profile');
		expect(loaderuiService.queues.length).to.be.equal(1);
		loaderuiService.hideLoader('user-profile');
	});

	it('should show the loader for multiple components', function () {
		loaderuiService.showLoader('user-profile');
		loaderuiService.showLoader('business-filters');
		expect(loaderuiService.queues.length).to.be.equal(2);
		loaderuiService.hideLoader('user-profile');
		loaderuiService.hideLoader('business-filters');
	});

	it('should show the loader once if loader for the same component called twice', function () {
		loaderuiService.showLoader('user-profile');
		loaderuiService.showLoader('user-profile');
		expect(loaderuiService.queues.length).to.be.equal(1);
		loaderuiService.hideLoader('user-profile');
	});

	it('should hide the loader for the single component', function () {
		loaderuiService.showLoader('user-profile');
		loaderuiService.hideLoader('user-profile');
		expect(loaderuiService.queues.length).to.be.equal(0);
	});

	it('should hide only the loader for the component which is loaded', function () {
		loaderuiService.showLoader('user-profile');
		loaderuiService.showLoader('business-filters');
		loaderuiService.hideLoader('user-profile');
		expect(loaderuiService.queues.length).to.be.equal(1);
		loaderuiService.hideLoader('business-filters');
	});
});