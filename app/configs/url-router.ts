import coreApp from '../module';

coreApp.config(
    // @ngInject
    function ($urlRouterProvider: ng.ui.IUrlRouterProvider) {
        $urlRouterProvider.otherwise('/todo');
    }
);