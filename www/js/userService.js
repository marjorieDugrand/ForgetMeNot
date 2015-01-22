fmnApp.service('userService', function (databaseService, $q,$rootScope) {
    this.appUser = null;
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
        return this.appUser;
    };
    
    this.setUser = function(user) {
        this.appUser = user;
    };
    
    this.loadLanguages = function () {
        return appLanguages;
    };

    this.loadUserContexts = function () {
        if (this.appUser !== null) {
            return databaseService.getUserContexts(this.appUser.user_id);
        }
    };

});

