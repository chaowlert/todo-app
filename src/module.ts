import * as angular from 'angular';

let bluebird = require('bluebird');
(<any>window).Promise = bluebird;

let angularLibSample = angular.module('angularLibSample', [
    require('angular-translate'),
    require('angular-ui-router'),
    require('angular-loading-bar'),
    require('angular-ui-bootstrap'),
    require('angular-sanitize'),
    require('angular-messages')
]);

angularLibSample.run(($rootScope: ng.IRootScopeService) => {
    bluebird.setScheduler(function (cb: any) {
        $rootScope.$evalAsync(cb);
    });
});

export default angularLibSample;