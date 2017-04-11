require('babel-polyfill');
require('angular');
require('angular-mocks');

var testsContext = require.context('./src', true, /\.spec\.ts$/);

// requires and returns all modules that match
testsContext.keys().map(testsContext);