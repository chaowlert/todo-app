import * as angular from 'angular';

import angularLibSampleName from '../src/index';

let angularLibSampleApp = angular.module('leadAssignmentApp', [
    require('angular-ui-router'),
    angularLibSampleName,
]);
export default angularLibSampleApp;