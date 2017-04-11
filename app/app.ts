import './app.scss';

import * as angular from 'angular';

import angularLibSampleAppName from './index';

angular.element(document).ready(() => {
    angular.bootstrap(document, [angularLibSampleAppName]);
});