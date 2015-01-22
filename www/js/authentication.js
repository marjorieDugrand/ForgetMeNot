/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.service("fbService", function($q) {
    
    var authenticationRequired = false;
    
    this.isAuthenticationRequired = function() {
        return authenticationRequired;
    };
    
    function statusChangeCallback(connectionPromise,response) {
        console.log('statusChangeCallback');
        console.log(response);

        if (response.status === 'connected') {
          // Logged into your app and Facebook.
          testAPI(connectionPromise);
        } else if (response.status === 'not_authorized') {
            authenticationRequired = true;
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
            connectionPromise.resolve(null);
        } else {
            authenticationRequired = true;
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
        
        //this.checkLoginState();
    };
    
    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    function testAPI(connectionPromise) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
            connectionPromise.resolve(response);
        });
    }
});

fmnApp.controller("authenticationController", function($scope, $location, fbService, userService, databaseService) {
    $scope.location = $location;
    $scope.authenticationNeeded = fbService.isAuthenticationRequired();
    
    $scope.userResponse;
    
    var checkAuthentication = function() {
        var user = localStorage.getItem("connectedUser");
        if(user) {
            console.log("user alreay connected, no need to authenticate");
            userService.serviceInit().then(function () {
                databaseService.getUser(user).then(function(result) {
                    $scope.userResponse = result;
                    userService.setUser($scope.userResponse);
                    $scope.location.path("/home");
                    
                });
            });
        } else {
            fbService.init();
            console.log("checking authentication");
            fbLogin();
        }
    };
    
    var fbLogin = function() {
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
                    localStorage.setItem("connectedUser", $scope.userResponse.email);
                    databaseService.addIfNotAlreadyInDatabase($scope.userResponse).then(function(result) {
                        console.log("ouais nouvel utilisateur! : " + result.username + " " +result.serveur_id);
                        $scope.userResponse = result;
                        userService.setUser($scope.userResponse);
                        $scope.location.path("/home");
                    });
                });
            }   
        });
    };
    
    checkAuthentication();
    
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