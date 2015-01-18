fmnApp.service('userService', function (databaseService, $q) {
    var appUser = null;
    var appLanguages;
    this.initialized = false;
    this.serviceInit = function () {
        var servicePromise = $q.defer();
        /*if (this.initialized) {
            servicePromise.resolve();
        } else {
            this.initialized = true;
            databaseService.rmDB().then(function() {
             console.log("RM DB"); 
             })*/
            databaseService.initDB().then(function () {
                databaseService.getLanguages().then(function(languagesResult) {
                    appLanguages = languagesResult;
                    servicePromise.resolve();  
                });            
            });
       // }
        return servicePromise.promise;
    };
    this.loadUser = function () {
        return appUser;
    };
    
    this.setUser = function(user) {
        appUser = user;
    };
    
    this.loadLanguages = function () {
        return appLanguages;
    };

    this.loadUserContexts = function () {
        if (appUser !== null) {
            return databaseService.getUserContexts(appUser.user_id);
        }
    };

});

