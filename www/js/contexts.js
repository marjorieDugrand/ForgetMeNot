fmnApp.controller("AddContextController", function ($scope, $timeout, userService, databaseService, mapService, $location) {
    $scope.contexts = userService.loadUserContexts();
    $scope.message = "";
    $scope.showFooter = false;

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

    $scope.showContextFooter = function () {
        return $scope.contextSaved;
    };

    $scope.saveContext = function () {
        if ($scope.context.name === '' || $scope.context.name === undefined) {
            // A afficher dans un footer ?
            console.log("your context should have a name");
            $scope.message = "Your context should have a name.";
            showFooter();
        }
        else {
            console.log("Save context");
            $scope.context.owner_id = userService.loadUser().serveur_id;
            $scope.context.addressUsed = $scope.useAddress;
            $scope.context.lastModification = Date.now();
            console.log($scope.context);
            databaseService.storeContext($scope.context).then(function (result) {
                $scope.context.context_id = result;
                $scope.context.serveur_id = result;
                $scope.contextSaved = true;
                $scope.location.path("/contexts/" + $scope.context.serveur_id);
            });
        }
    };

    $scope.cancelContext = function () {
        $scope.context = new Context();
    };

    $scope.checkGeolocation = function () {
        if (userService.loadUser().geolocation) {
            if (navigator.geolocation) {
                console.log("geolocation supported");
                mapService.locateUserOnMap($scope.context, "map-canvas");
            }
            else {
                $scope.message = "Geolocation is not supported by this browser.";
                showFooter();
            }
        } else {
            $scope.message = "Please modify your settings to accept geolocation.";
            showFooter();
        }
    };

    var showFooter = function () {
        $scope.showFooter = true;
        $timeout(hideFooter, 8000);
    };

    var hideFooter = function () {
        $scope.showFooter = false;
    };

    $scope.isFooterShown = function () {
        return $scope.showFooter;
    };
});

fmnApp.controller("ContextDetailsController", function ($scope, $stateParams, databaseService, userService, mapService) {

    $scope.context = null;
    $scope.showContext = false;
    $scope.position;

    databaseService.getContext(parseInt($stateParams.contextId),
            userService.loadUser().user_id)
            .then(function (result) {
                if (result !== null) {
                    $scope.showContext = true;
                    $scope.context = result;
                    mapService.locateContextOnMap($scope.context, userService.loadUser().geolocation, "map-canvas");
                }
            });

    $scope.hasAddress = function () {
        if ($scope.context) {
            return $scope.context.addressUsed;
        } else {
            return false;
        }
    };
});

fmnApp.controller("ContextController", function ($scope, userService, databaseService, $ionicPopup) {
    $scope.contexts = userService.loadUserContexts();
    $scope.message = "";
    $scope.showFooter = false;

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
                $scope.message = "The context '" + context.name + "' has been deleted.";
                showFooter();
            }
            else {
                console.log('You are not sure');
            }
        });
    };

    /* Supprime un contexte (de la BD + met à jour l'affichage) */
    var removeContext = function (context) {
        databaseService.removeContextFromDB(context.serveur_id);
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

    var showFooter = function () {
        $scope.showFooter = true;
        $timeout(hideFooter, 8000);
    };

    var hideFooter = function () {
        $scope.showFooter = false;
    };

    $scope.isFooterShown = function () {
        return $scope.showFooter;
    };
});
