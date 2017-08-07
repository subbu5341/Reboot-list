describe('View Summary Widget Controller', function() {
    var constructor, modalInstance, processData, convertDateTime;
    beforeEach(module('myApp'));
    beforeEach(module('myApp.widgets'));

    beforeEach(inject(function($controller, $injector) {
        convertDateTime = $injector.get('convertDateTime');
        modalInstance = {
            dismiss: function() {}
        };
        processData = {
            'ID': '389ceba1-de9b-4cc9-8159-f600277331bf',
            'FormID': '582a3290-e39c-41ce-986b-8546f1e99210',
            'StartDate': '2016-11-18T09:27:00Z',
            'StartTime': '02:57 PM',
            'EndDate': '2016-11-18T18:30:00Z',
            'Status': 'Completed',
            'Recurring': 'Yes',
            'RebootType': 'Schedule for Future',
            'Schedule': [{
                'Name': 'Recurrence1',
                'Pattern': 'Weekly',
                'RecOption': '12 AM every day',
                'Duration': 1234
            }, {
                'Name': 'Recurrence2',
                'Pattern': 'Monthly',
                'RecOption': '12 AM every day',
                'Duration': 12
            }],
            'DevicesToReboot': {
                'AccountID': '300009',
                'Team': 'ENTZ-8MIX',
                'Segment': 'ENT Z',
                'AccountName': 'Run Book Automation',
                'Manager': 'Maria Gero',
                'Devices': [{
                    'URN': 'core.rackspace.com:py:core:#:device:606516',
                    'DeviceID': '606516',
                    'Name': '606516-asops.hkg.intensive.int'
                }]
            },
            'Reason': 'reboot list -Test2',
            'Notifications': [{
                'EventType': 'Created',
                'Message': 'The following request has been Created.'
            }, {
                'EventType': 'Modified',
                'Message': 'The following request has been Modified.'
            }],
            'Environment': 'staging'
        };
        constructor = $controller('viewSummaryController', {
            $modalInstance: modalInstance,
            processData: processData,
            convertDateTime: convertDateTime
        });

    }));

    it('should call the necessary functions on controller intialisation', function() {
        var getSummaryAPIDetailsStub = sinon.stub(constructor, 'getSummaryAPIDetails');
        constructor.initialise();
        expect(getSummaryAPIDetailsStub.withArgs().calledOnce).to.be.ok;
        getSummaryAPIDetailsStub.restore();
    });

    it('should get summary API Details', function() {
        var data = {
            'ID': '389ceba1-de9b-4cc9-8159-f600277331bf',
            'FormID': '582a3290-e39c-41ce-986b-8546f1e99210',
            'StartDate': '2016-11-18T09:27:00Z',
            'StartTime': '02:57 PM',
            'EndDate': '2016-11-18T18:30:00Z',
            'Status': 'Completed',
            'Recurring': 'Yes',
            'RebootType': 'Schedule for Future',
            'Schedule': [{
                'Name': 'Recurrence1',
                'Pattern': 'Weekly',
                'RecOption': '12 AM every day',
                'Duration': 1234
            }, {
                'Name': 'Recurrence2',
                'Pattern': 'Monthly',
                'RecOption': '12 AM every day',
                'Duration': 12
            }],
            'DevicesToReboot': {
                'AccountID': '300009',
                'Team': 'ENTZ-8MIX',
                'Segment': 'ENT Z',
                'AccountName': 'Run Book Automation',
                'Manager': 'Maria Gero',
                'Devices': [{
                    'URN': 'core.rackspace.com:py:core:#:device:606516',
                    'DeviceID': '606516',
                    'Name': '606516-asops.hkg.intensive.int'
                }]
            },
            'Reason': 'reboot list -Test2',
            'Notifications': [{
                'EventType': 'Created',
                'Message': 'The following request has been Created.'
            }, {
                'EventType': 'Modified',
                'Message': 'The following request has been Modified.'
            }],
            'Environment': 'staging'
        };

        constructor.getSummaryAPIDetails(data);

        expect(constructor.duration).to.equal('1 day(s), 0 hour(s) and 0 min(s)');

    });

    it('should return empty Details for Duration', function() {
        var data = {
            'ID': '389ceba1-de9b-4cc9-8159-f600277331bf',
            'FormID': '582a3290-e39c-41ce-986b-8546f1e99210',
            'StartDate': '2016-11-18T09:27:00Z',
            'StartTime': '02:57 PM',
            'EndDate': '2016-11-10T18:30:00Z',
            'Status': 'Completed',
            'Recurring': 'Yes',
            'RebootType': 'Schedule for Future',
            'Schedule': [{
                'Name': 'Recurrence1',
                'Pattern': 'Weekly',
                'RecOption': '12 AM every day',
                'Duration': 1234
            }, {
                'Name': 'Recurrence2',
                'Pattern': 'Monthly',
                'RecOption': '12 AM every day',
                'Duration': 12
            }],
            'DevicesToReboot': {
                'AccountID': '300009',
                'Team': 'ENTZ-8MIX',
                'Segment': 'ENT Z',
                'AccountName': 'Run Book Automation',
                'Manager': 'Maria Gero',
                'Devices': [{
                    'URN': 'core.rackspace.com:py:core:#:device:606516',
                    'DeviceID': '606516',
                    'Name': '606516-asops.hkg.intensive.int'
                }]
            },
            'Reason': 'reboot list -Test2',
            'Notifications': [{
                'EventType': 'Created',
                'Message': 'The following request has been Created.'
            }, {
                'EventType': 'Modified',
                'Message': 'The following request has been Modified.'
            }],
            'Environment': 'staging'
        };

        constructor.getSummaryAPIDetails(data);

        expect(constructor.duration).to.equal('-');

    });

    it('should dismiss modal instance when calling clearSuppression', function() {
        var dismissStub = sinon.stub(modalInstance, 'dismiss');
        constructor.clearSuppression();
        expect(dismissStub.calledOnce).to.be.ok;
    });

});