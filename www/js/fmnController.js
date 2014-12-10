/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
fmnApp.service('userService', function(databaseService, $q) {
    var appUser = null;
    var appLanguages;
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
        if(appUser !== null) {
            return databaseService.getUserContexts(appUser.user_id);
        }
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
         $scope.contexts = userService.loadUserContexts();
         $scope.selectedLanguage;
         $scope.initSelectedLanguages = function() {
             var i;
             var found = false;
             for(i=0; i < $scope.languages.length && !found; i++) {
                 if($scope.languages[i].language_id === $scope.user.language_id) {
                     $scope.selectedLanguages = $scope.languages[i];
                     found = true;
                 }
             }
         };
    });
   
   $scope.saveSettings = function() {
       console.log("Save settings");
   }
});


