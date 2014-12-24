/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.controller("ContextController", function ($scope, userService, databaseService) {

    $scope.context = new Context();

    $scope.useAddress = false;
    $scope.useGeolocation = false;

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

    $scope.saveContext = function () {

        $scope.context.owner_id = userService.loadUser().user_id;
        //$scope.context.lastModification = Date.now();
        databaseService.storeContext($scope.context);
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
