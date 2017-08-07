describe('SingleActionController Widget Controller', function() {
	var constructor, appEvents, eventbus, modal, scope ;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));

	modal = {
		open:function(){}
	};   
	beforeEach(inject(function ($controller, $injector, $rootScope) {
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		scope = $rootScope.$new();
		constructor = $controller('SingleActionController', {
			$modal : modal,
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

	it('should handle add listener from Action Menu Launch', function () {
		var addListenersStub = sinon.stub(constructor.eventbus, 'addListner');
		constructor.addListeners();
		expect(addListenersStub
			.withArgs(appEvents.SingleActionMenuLaunch.name, constructor.onSingleActionMenuLaunch).calledOnce).to.be.ok;
	});

	it('should call the necessary functions on controller initialization on success', function () {
		var returnObj = { result: {} };
		var rows = 3;
		returnObj.result.then = function(success,error) {
			if(rows){
				return success(rows);
			}else{
				return error();
			}
		};
		modal.open = function() {
			return returnObj;
		};
		var modalStub = sinon.spy(modal, 'open');
		constructor.onSingleActionMenuLaunch({name:'onMultiActionsMenuLaunch'});
		expect(modalStub.calledOnce).to.be.ok;
		expect(scope.rows).to.be.equal(rows);
	});

	it('should call the necessary functions on controller initialization on error', function () {
		var returnObj = { result: {} };
		var resData = null;	
		var rows = null;
		returnObj.result.then = function(success, error) {
			if(rows){
				return success(rows);
			}else{
				return error();
			}
		};
		modal.open = function(config) {
			resData = config.resolve.data();
			return returnObj;
		};
		var modalStub = sinon.spy(modal, 'open');
		var evt = {name:'onMultiActionsMenuLaunch', selectedData:{selectedRows:3} };

		constructor.onSingleActionMenuLaunch(evt);
		expect(modalStub.withArgs().calledOnce).to.be.ok;
		expect(resData).to.be.equal(evt.selectedData);
		modalStub.restore();
	});
});

describe('SingleActionPopupController Widget Controller', function() {
	var  modalInstance, scope, data,  appEvents, eventbus, appMsgs, $controllerConstructor, modal;
	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));
	beforeEach(module('automation.components.http.wrapper.module'));
	beforeEach(module('automation.components.eventbus.module'));   


	data = { selectedRows: [{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
	'Status':'Completed','Recurring':'Yes'}] };
	modal = {};

	beforeEach(inject(function ($controller, $injector, $rootScope) {
		modalInstance = {dismiss:function(){}};
		eventbus = $injector.get('eventbus');
		appEvents = $injector.get('AppEvents');
		appMsgs = $injector.get('AppMsgs');
		$controllerConstructor = $controller;
		scope = $rootScope.$new();
	}));

	it('should call the necessary functions on controller intialisation', function () {
		$controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});
		var dismissStub = sinon.stub(modalInstance, 'dismiss');
		scope.closePopup();
		expect(scope.isMenuActionDisabled).to.be.true;
		expect(dismissStub.calledOnce).to.be.ok;
	});

	it('should call the view summary function', function () {
		$controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var retProcessData = null;
		modal.open = function(obj) {
			retProcessData = obj.resolve.processData();
		};
		scope.viewSummary(data);
		expect(retProcessData).to.be.equal(data.selectedRows[0]);
	});

	it('should call the edit suppression', function () {
		$controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var windStub = sinon.stub(window, 'open');
		scope.editReboot(data);
		expect(windStub.calledOnce).to.be.ok;
	});

	it('should cancel single Reboot on cancel action', function () {
		data = { selectedRows: [
			{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
		'Status':'New','Recurring':'Yes'}]
	   };
		var ctrl = $controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var respData = {
			data:{
			  FormID: '582a3290-e39c-41ce-986b-8546f1e99210',
				ID: '8a419bf6-ff44-4eaf-99f3-9d8aad82d550',
				Request:{
					Inputs:{
						ActionType: 'CREATE',
						isactive: false
					}
				}
			}
		};

		var error ='Error API not working';

		var responseObj1 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};
		var responseObj2 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};
		var responseObj3 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};

		var getFormApiStub = sinon.stub(ctrl.httpWrapperService, 'get');
		var responseSpy = sinon.spy(responseObj1, 'then');
		getFormApiStub.returns(responseObj1);

		var cancelFormApiStub = sinon.stub(ctrl.httpWrapperService, 'post');
		var postResponseSpy = sinon.spy(responseObj2, 'then');
		cancelFormApiStub.returns(responseObj2);

		var updateFormApiStub = sinon.stub(ctrl.httpWrapperService, 'put');
		var putresponseSpy = sinon.spy(responseObj3, 'then');
		updateFormApiStub.returns(responseObj3);

		window.AricMessage = {};
		window.AricMessage.showConfirmationMessage = function (msg, makeFormApiGetCall){
			 makeFormApiGetCall();
		};

		window.AricMessage.showSuccessMessage = function(msg, msgTitle, msgAutoClose, onCancelSuccesMsgClose){
			onCancelSuccesMsgClose();
		};
		var cancelSuccesMsgSpy = sinon.spy(eventbus, 'raise');

		scope.cancelReboot();

		expect(getFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(cancelFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(updateFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(cancelSuccesMsgSpy.withArgs(new appEvents.RefreshGrid()).calledOnce).to.be.ok;

		responseSpy.restore();
		postResponseSpy.restore();
		putresponseSpy.restore();
		cancelSuccesMsgSpy.restore();
	});

	it('should Show error msg on single reboot Error handling action', function () {
		data = { selectedRows: [
			{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
		'Status':'New','Recurring':'No'}]
	   };
		var ctrl = $controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var respData = {
			data:{
				FormID: '582a3290-e39c-41ce-986b-8546f1e99210',
				ID: '8a419bf6-ff44-4eaf-99f3-9d8aad82d550',
				Error:'API not working'
			}
		};

		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData.data.Request) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(respData);
				}
			}
		};

		var getFormApiStub = sinon.stub(ctrl.httpWrapperService, 'get');
		var responseSpy = sinon.spy(responseObj, 'then');
		getFormApiStub.returns(responseObj);

		window.AricMessage = {};
		window.AricMessage.showConfirmationMessage = function (msg, makeFormApiGetCall){
			 makeFormApiGetCall();
		};
		window.AricMessage.showFailureMessage = function(){};
		var showFailureMsgSpy = sinon.spy(window.AricMessage, 'showFailureMessage');

		scope.cancelReboot();

		expect(getFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(showFailureMsgSpy.withArgs(appMsgs.CANCEL_FAILURE_TYPE_SINGLE, '',
			false, respData.data.Error).called).to.be.ok;

		getFormApiStub.restore();
		responseSpy.restore();
		showFailureMsgSpy.restore();
	});

	it('should cancel Recurrence Reboot on cancel action', function () {
		data = { selectedRows: [
			{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
		'Status':'New','Recurring':'No'}]
		};
		var ctrl = $controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var respData = {
			data:{
			  FormID: '582a3290-e39c-41ce-986b-8546f1e99210',
				ID: '8a419bf6-ff44-4eaf-99f3-9d8aad82d550',
				Request:{
					Inputs:{
						ActionType: 'CREATE',
						isactive: false
					}
				}
			}
		};

		var error ='Error API not working';

		var responseObj1 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};
		var responseObj2 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};
		var responseObj3 = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(error);
				}
			}
		};

		var getFormApiStub = sinon.stub(ctrl.httpWrapperService, 'get');
		var responseSpy = sinon.spy(responseObj1, 'then');
		getFormApiStub.returns(responseObj1);

		var cancelFormApiStub = sinon.stub(ctrl.httpWrapperService, 'post');
		var postResponseSpy = sinon.spy(responseObj2, 'then');
		cancelFormApiStub.returns(responseObj2);

		var updateFormApiStub = sinon.stub(ctrl.httpWrapperService, 'put');
		var putresponseSpy = sinon.spy(responseObj3, 'then');
		updateFormApiStub.returns(responseObj3);

		window.AricMessage = {};
		window.AricMessage.showConfirmationMessage = function (msg, makeFormApiGetCall){
			 makeFormApiGetCall();

		};

		window.AricMessage.showSuccessMessage = function(msg, msgTitle, msgAutoClose, onCancelSuccesMsgClose){
			onCancelSuccesMsgClose();
		};
		var cancelSuccesMsgSpy = sinon.spy(eventbus, 'raise');

		scope.cancelReboot();

		expect(getFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(cancelFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(updateFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(cancelSuccesMsgSpy.withArgs(new appEvents.RefreshGrid()).calledOnce).to.be.ok;

		responseSpy.restore();
		postResponseSpy.restore();
		putresponseSpy.restore();
		cancelSuccesMsgSpy.restore();
	});

	it('should show error msg on Recurrence Reboot Error handling action', function () {
		data = { selectedRows: [
			{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
		'Status':'New','Recurring':'Yes'}]
	   };
		var ctrl = $controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
			//AppConstants: appConstants
		});

		var respData = {
			data:{
			  FormID: '582a3290-e39c-41ce-986b-8546f1e99210',
				ID: '8a419bf6-ff44-4eaf-99f3-9d8aad82d550',
				Error:'API not working'
			}
		};

		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData.data.Request) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(respData);
				}
			}
		};

		var getFormApiStub = sinon.stub(ctrl.httpWrapperService, 'get');
		var responseSpy = sinon.spy(responseObj, 'then');
		getFormApiStub.returns(responseObj);

		window.AricMessage = {};
		window.AricMessage.showConfirmationMessage = function (msg, makeFormApiGetCall){
			 makeFormApiGetCall();
		};
		window.AricMessage.showFailureMessage = function(){};
		var showFailureMsgSpy = sinon.spy(window.AricMessage, 'showFailureMessage');

		scope.cancelReboot();

		expect(getFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(showFailureMsgSpy.withArgs(appMsgs.CANCEL_FAILURE_TYPE_RECURRENCE, '',
			false, respData.data.Error).called).to.be.ok;

		getFormApiStub.restore();
		responseSpy.restore();
		showFailureMsgSpy.restore();
	});

	it('should show error massage if response do not have error details ', function () {
		data = { selectedRows: [
			{'name':'row1', 'FormID':'582a3290-e39c-41ce-986b-8546f1e99210',
		'Status':'New','Recurring':'Yes'}]
	   };
		var ctrl = $controllerConstructor('SingleActionPopupController', {
			$modalInstance : modalInstance,
			$scope: scope,
			data: data,
			AppEvents : appEvents,
			eventbus: eventbus,
			AppMsgs: appMsgs,
			$modal: modal
		});

		var respData = '';

		var responseObj = {
			then: function(successHandlerCB, errorHandlerCB)  {
				if (respData.data) {
					successHandlerCB(respData);
				} else {
					errorHandlerCB(respData);
				}
			}
		};

		var getFormApiStub = sinon.stub(ctrl.httpWrapperService, 'get');
		var responseSpy = sinon.spy(responseObj, 'then');
		getFormApiStub.returns(responseObj);

		window.AricMessage = {};
		window.AricMessage.showConfirmationMessage = function (msg, makeFormApiGetCall){
			 makeFormApiGetCall();
		};
		window.AricMessage.showFailureMessage = function(){};
		var showFailureMsgSpy = sinon.spy(window.AricMessage, 'showFailureMessage');

		scope.cancelReboot();

		expect(getFormApiStub.withArgs().calledOnce).to.be.ok;
		expect(showFailureMsgSpy.withArgs(appMsgs.CANCEL_FAILURE_TYPE_RECURRENCE, '',
			false, '').called).to.be.ok;

		getFormApiStub.restore();
		responseSpy.restore();
		showFailureMsgSpy.restore();
	});

});

describe('Get PopUp Position using Single Action Service ', function() {
	var popUpPosService;
	beforeEach(module('myApp.widgets'));

	var elem = document.createElement('span');

	var computedObj = { height: '500px' };
	beforeEach(inject(function ($controller, $injector) {
		popUpPosService = $injector.get('getPopUpPosSingleActionService');
	}));

	it('should return the position for click on left top of the grid', function () {
		var data = {
			event: {
				clientX: 100,
				clientY: 100
			},
			config: {
				width: '200px',
				height: '100px'
			}
		};
		var windowStub = sinon.stub(window, 'getComputedStyle');
		windowStub.returns(computedObj);

		var posObj = popUpPosService.getPositions(elem, data);

		expect(posObj.left).to.be.below(200);
		expect(posObj.top).to.be.below(200);
		windowStub.restore();
	});

	it('should return the position for click on left bottom of the grid', function () {
		var data = {
			event: {
				clientX: 100,
				clientY: 800
			},
			config: {
				width: '200px',
				height: '100px'
			}
		};
		var windowStub = sinon.stub(window, 'getComputedStyle');
		windowStub.returns(computedObj);

		var posObj = popUpPosService.getPositions(elem, data);

		expect(posObj.left).to.be.below(200);
		expect(posObj.top).to.be.below(300);
		windowStub.restore();
	});

	it('should return the position for click on right bottom of the grid', function () {
		var data = {
			event: {
				clientX: 800,
				clientY: 800
			},
			config: {
				width: '200px',
				height: '100px'
			}
		};
		var windowStub = sinon.stub(window, 'getComputedStyle');
		windowStub.returns(computedObj);

		var posObj = popUpPosService.getPositions(elem, data);

		expect(posObj.left).to.be.above(700);
		expect(posObj.top).to.be.below(300);
		windowStub.restore();
	});

	it('should return the position for click on right top of the grid', function () {
		var data = {
			event: {
				clientX: 800,
				clientY: 100
			},
			config: {
				width: '200px',
				height: '100px'
			}
		};
		var windowStub = sinon.stub(window, 'getComputedStyle');
		windowStub.returns(computedObj);

		var posObj = popUpPosService.getPositions(elem, data);

		expect(posObj.left).to.be.above(700);
		expect(posObj.top).to.be.below(200);
		windowStub.restore();
	});
	it('should return the position for click on right top of the grid', function () {
		var data = {
			event: {
				clientX: 2400,
				clientY: 100
			},
			config: {
				width: '1400px',
				height: '100px'
			}
		};
		var windowStub = sinon.stub(window, 'getComputedStyle');
		windowStub.returns(computedObj);

		var posObj = popUpPosService.getPositions(elem, data);

		expect(posObj.left).to.be.equal(-46);
		expect(posObj.top).to.be.equal(120);
		windowStub.restore();
	});
});

describe('Directives ::', function() {

	beforeEach(module('myApp'));
	beforeEach(module('myApp.widgets'));

	describe('Testing single-action-popup-align', function() {
		var scope, compile, getPopUpPosSingleActionService;

		var serviceData = {
			'left': 523,
			'top': 392,
			'width': '400px',
			'height': 'auto',
			'popArrowPos': null,
			'arrowLeft': true,
			'arrowBottom': true
		};

		beforeEach(inject(function($rootScope, $compile, $injector) {
			scope = $rootScope.$new();
			compile = $compile;
			getPopUpPosSingleActionService = $injector.get('getPopUpPosSingleActionService');
		}));

		it('should return the position for click on left bottom of the grid', function() {

			var getPosStub = sinon.stub(getPopUpPosSingleActionService, 'getPositions');
			getPosStub.returns(serviceData);

			var template = [
				'<div tabindex="-1" class="reveal-overlay',
				' ng-isolate-scope" style="visibility: visible;',
				'z-index: -1;',
				'display: block;;display: block; visibility: visible;;display: block;',
				' visibility: visible;" modal-window="" window-class="" index="0">',
				'<div>',
				'<div id="singleActionPopup" single-action-popup-align>',
				'<div class="header"></div>',
				'<div class ="popoverActions"></div>',
				'</div>',
				'</div>',
				'</div>'
			].join('');

			var elem = angular.element(template);
			var compileElement = compile(elem)(scope);
			$('body').append(compileElement);
			scope.$digest();

			$('#singleActionPopup').scope().delayedPopupUpdate();
			var finalWidth = compileElement.css('width').replace(/\D+/g,'');
			expect(getPosStub.withArgs().calledOnce).to.be.ok;
			expect(compileElement.css('margin')).to.equal(0 + 'px');
			expect(finalWidth).to.be.above(980);
			expect(compileElement.css('left')).to.equal('auto');
			expect(compileElement.css('top')).to.equal('auto');
		});
	});
});