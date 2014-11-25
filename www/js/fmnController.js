/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
fmnApp.service('userService', function(databaseService, $q) {
    var appUser;
    var appLanguages;
    var userContexts;
    this.initialized = false;
    this.serviceInit = function() {
        var servicePromise = $q.defer();
        if(this.initialized) {
            servicePromise.resolve();
        } else {   
            this.initialized = true;
            databaseService.initDB().then(function() {
                
                appLanguages = databaseService.getLanguages();
                databaseService.getUser('Rajon').then(function(result) {
                    appUser = result;
                    userContexts = databaseService.getUserContexts(appUser.user_id);
                    servicePromise.resolve();
                });
            });
        }
        return servicePromise.promise;
    };
    this.loadUser = function () {
        return appUser;
    };
    this.loadLanguages = function () {
        return appLanguages;
    };
    this.loadUserContexts = function() {
        return userContexts;
    };
});

fmnApp.controller('fmnController',function($scope, $state, userService, databaseService) {
    $scope.isWelcomePage  = function() {
        return $state.current.name === 'home';
    };
    $scope.languages;
    $scope.user;
    userService.serviceInit().then(function() {
         $scope.languages = userService.loadLanguages();
         console.log("hey");
         $scope.user = userService.loadUser();
    });
   
});


