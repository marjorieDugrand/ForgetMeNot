/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.service("fbService", function($q) {
    
        
    function statusChangeCallback(connectionPromise,response) {
        console.log('statusChangeCallback');
        console.log(response);

        if (response.status === 'connected') {
          // Logged into your app and Facebook.
          testAPI(connectionPromise);
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
            connectionPromise.resolve(null);
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
            connectionPromise.resolve(null);
        }
    };

    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
    this.checkLoginState = function() {
        var connectionPromise = $q.defer();
        FB.getLoginStatus(function(response) {
            statusChangeCallback(connectionPromise,response);
        });
        return connectionPromise.promise;
    };
    
    this.init = function() {
        FB.init({
            appId      : '500150540124641',
            xfbml      : true,
            version    : 'v2.2'
        });
        
        this.checkLoginState();
    };
    
    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
        });
    }
});

fmnApp.controller("authenticationController", function($scope, fbService, userService, databaseService) {
    fbService.init();
    $scope.choiceToMake = function() {
        return true;
    };
    
    $scope.userResponse;
    
    fbLogin = function() {
        fbService.checkLoginState().then(function(response) {
            if(response !== null) {
                userService.serviceInit().then(function () {
                    var languageId = determineUserLanguageId(response.locale);
                    $scope.userResponse = new User(response.first_name,
                                                   response.email,
                                                   false,
                                                   languageId,
                                                   null,
                                                   Date.now());
                    databaseService.addIfNotAlreadyInDatabase($scope.userResponse);
                    userService.setUser($scope.userResponse);
                });
            }   
        });
    };
    
    function determineUserLanguageId(userLanguage) {
        var appLanguages = userService.loadLanguages();
        var i; var found = false; var languageId;
        for (i = 0; i < appLanguages.length && !found; i++) {
            if (appLanguages[i].name === userLanguage) {
                languageId = appLanguages[i].language_id;
                found = true;
            } else if (appLanguages[i].name === 'English') {
                languageId = appLanguages[i].language_id;
            }
        }
    };      
                           
});