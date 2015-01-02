/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.controller("AddContextController", function ($scope, userService, databaseService) {
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
                    var latlng = $scope.context.location;
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
                    // Trace un cercle autour de la position repérée indiquant la précision de la localisation
                    var circle = new google.maps.Circle({
                        center: latlng,
                        radius: pos.coords.accuracy,
                        map: map,
                        fillColor: '#46b4c8',
                        fillOpacity: 0.3,
                        strokeColor: '#46b4c8',
                        strokeOpacity: 1.0
                    });
                    map.fitBounds(circle.getBounds());
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

fmnApp.controller("ContextController", function ($scope, userService, databaseService, $ionicPopup) {
    $scope.contexts = userService.loadUserContexts();

    $scope.showConfirm = function (context) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Remove a context',
            template: 'Are you sure you want to remove the context "' + context.name + '"? \nAll the tasks related to this context will have a null context from now on.',
            okType: 'button-energized',
            cancelType: 'button-energized'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('You are sure');
                removeContext(context);
            }
            else {
                console.log('You are not sure');
            }
        });
    };

    /* Supprime un contexte (de la BD + met à jour l'affichage) */
    var removeContext = function (context) {
        databaseService.removeContextFromDB(context.context_id);
        arrayUnset($scope.contexts, context.context_id);
        console.log("length: " + $scope.contexts.length);
    };

    /* Supprime un élément donné d'un tableau */
    var arrayUnset = function (array, val) {
        var index = getIndex(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    /* Renvoie l'index de l'élément d'un tableau correspondant à l'id du contexts passé en paramètre*/
    var getIndex = function (array, id) {
        var found = false;
        var i = 0;
        var index = -1;

        while (!found && i < array.length) {
            if (array[i].context_id === id) {
                found = true;
                index = i;
            }
            i++;
        }
        return index;
    };
});

fmnApp.controller("ContextDetailsController", function ($scope, $stateParams, databaseService) {
    $scope.context = databaseService.getContext(parseInt($stateParams.contextId));
});
