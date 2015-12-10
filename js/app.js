/**
 * Created by pedro on 2/13/14.
 */
var tomatoGears = angular.module('tomatoGears', []);

tomatoGears.config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|data):/);
}]);
