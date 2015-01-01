/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.controller("ContextController", function ($scope, userService, databaseService, $location) {
    $scope.contexts = userService.loadUserContexts();
    $scope.context = new Context();
    $scope.location = $location;
    $scope.useAddress = false;
    $scope.useGeolocation = false;
    $scope.contextSaved = false;

    $scope.addressChoiceChange = function () {
        $scope.useAddress = !($scope.useAddress);
        $scope.useGeolocation = false;
    };

    $scope.geolocationChoiceChange = function () {
        $scope.useGeolocation = !($scope.useGeolocation);
        $scope.useAddress = false;
        if ($scope.useGeolocation) {
            $scope.checkGeolocation();
        }
    };

    $scope.addressUsed = function () {
        return $scope.useAddress && !($scope.useGeolocation);
    };

    $scope.geolocationUsed = function () {
        return !($scope.useAddress) && $scope.useGeolocation;
    };

    $scope.showContextFooter = function() {
        return $scope.contextSaved;
    };
    
    $scope.saveContext = function () {

        $scope.context.owner_id = userService.loadUser().user_id;
        $scope.context.addressUsed = $scope.useAddress;
        $scope.context.lastModification = Date.now();
        databaseService.storeContext($scope.context).then(function(result) {
            $scope.context.context_id = result;
            $scope.contextSaved = true;
            $scope.location.path("/contexts/" + $scope.context.context_id);
           // setTimeout(function(){}, 2000);
        });
    };

    $scope.cancelContext = function () {
        $scope.context = new Context();
    };

    $scope.geolocationMessage = '';

    $scope.checkGeolocation = function () {
        if (userService.loadUser().geolocation) {
            if (navigator.geolocation) {
                console.log("geolocation supported");
                navigator.geolocation.getCurrentPosition(function (pos) {
                    $scope.context.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    var mapOptions = {
                        center: $scope.context.location,
                        zoom: 16,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: 'Your location'
                    });
                });
            }
            else {
                $scope.geolocationMessage = "Geolocation is not supported by this browser.";
            }
        } else {
            $scope.geolocationMessage = "Please modify your settings to accept geolocation.";
        }
    };

    $scope.getGeolocationMessage = function () {
        return $scope.geolocationMessage;
    };

});

    var printMap = function(position) {
        console.log("printing map");
      var mapOptions = {
        center: position,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      var marker = new google.maps.Marker({
         position: position,
         map: map,
         title: 'Your location'
      });
    };
    
fmnApp.controller("ContextDetailsController", function($scope, $stateParams, databaseService) {
    
    $scope.context = null;
    $scope.position;
    
    databaseService.getContext(parseInt($stateParams.contextId)).then(function(result) {
        $scope.context = result;
        if($scope.hasAddress) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': $scope.context.location}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    //var latitude = results[0].geometry.location.lat();
                    //var longitude = results[0].geometry.location.lng();
                    //position = new google.maps.LatLng(latitude,longitude);
                    $scope.position = results[0].geometry.location;
                    console.log("position 1 : " + $scope.position);
                    printMap($scope.position);
                } else {
                    console.log("Request failed.");
                }
            });
        } else {
            $scope.position = $scope.context.location;
            printMap($scope.position);
        }      
    });
    
    $scope.hasAddress = function() {
        if($scope.context) {
            return $scope.context.addressUsed;
        } else {
            return false;
        }
    };
});
