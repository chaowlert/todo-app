import * as angular from 'angular';
import angularLibSample from '../module';
                
let langs: any[] = [];

let merged = angular.merge({}, ...langs);
angularLibSample.config(
    // @ngInject
    function($translateProvider: ng.translate.ITranslateProvider) {
        $translateProvider.translations('en', { al: merged });
    }
);