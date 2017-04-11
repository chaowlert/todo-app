import coreApp from '../module';

coreApp.config(
    // @ngInject
    function ($translateProvider: ng.translate.ITranslateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.use('th');
    }
);