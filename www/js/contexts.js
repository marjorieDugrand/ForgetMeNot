/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.controller("ContextController", function ($scope, userService, databaseService) {
    
    $scope.context = new Context();
    
    $scope.useAddress = false;
    $scope.useGeolocation = false;
    
    $scope.addressChoiceChange = function() {
        $scope.useAddress = !($scope.useAddress);
        $scope.useGeolocation = false;
    };
    
    $scope.geolocationChoiceChange = function() {
        $scope.useGeolocation = !($scope.useGeolocation);
        $scope.useAddress = false;
        if($scope.useGeolocation) {
            $scope.checkGeolocation();
        }
    };
    
    $scope.addressUsed = function() {
        return $scope.useAddress && !($scope.useGeolocation);
    };
    
    $scope.geolocationUsed = function() {
        return !($scope.useAddress) && $scope.useGeolocation;
    };
    
    $scope.saveContext = function() {

        $scope.context.owner = userService.loadUser().user_id;
        //$scope.context.lastModification = Date.now();
	databaseService.storeContext($scope.context); 
    };

    $scope.cancelContext = function() {
	$scope.context = new Context();
    };
    
    $scope.geolocationMessage = '';
    
    $scope.checkGeolocation = function() {
      if(userService.loadUser().geolocalization) {
         /* ANAIS TODO
          *  if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition($scope.context.location);
              $scope.geolocationMessage = 'Your location: ' + $scope.context.location;
          } else {
              $scope.geolocationMessage = "Geolocation is not supported by this browser.";
          }*/
      } else {
          $scope.geolocationMessage = "Please modify your settings to accept geolocation.";
      }  
    };
    
    $scope.getGeolocationMessage = function() {
        return $scope.geolocationMessage;
    };
 
});
