import './home.scss';

import angularLibSample from '../../module';

angularLibSample.config(router);

/* @ngInject */
function router ($stateProvider: ng.ui.IStateProvider) {
    $stateProvider.state('home', {
        url: '/home',
        template: require('./home.html'),
    });
}
