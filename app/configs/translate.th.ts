import * as angular from 'angular';
import angularLibSampleApp from '../module';
                
let langs: any[] = [];

let merged = angular.merge({}, ...langs);
angularLibSampleApp.config(
    // @ngInject
    function($translateProvider: ng.translate.ITranslateProvider) {
        $translateProvider.translations('th', { alApp: merged });
    }
);