// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var fmnApp = angular.module('forget-me-not', ['ionic', 'task']);

fmnApp.controller('popupController', function ($scope, $ionicPopup) {
            $scope.showConfirm = function () {
                //TODO? afficher le nom de la tâche prête à être supprimée
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Supprimer une tâche',
                    template: 'Etes-vous sûr de vouloir supprimer cette tâche ?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        console.log('You are sure');
                        //TODO: supprimer la tâche, afficher un message de confirmation
                    }
                    else {
                        console.log('You are not sure');
                    }
                });
            };
        })
/*
        .controller('mapController', function ($scope) {
            $scope.showPosition = function (position) {
                var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
                $scope.model.map.setCenter(latlng);
            };

            $scope.getLocation = function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition($scope.showPosition);
                }
                else {
                    console.log("Geolocation is not supported by this browser.");
                }
            };

            $scope.getLocation();
        })
*/
        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // // for form inputs)
                // if (window.cordova && window.cordova.plugins.Keyboard) {
                //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                //}
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('home', {
                        url: '/',
                        templateUrl: "templates/home.html"
                    })
                    .state('new_task', {
                        url: '/new_task',
                        templateUrl: "templates/addTask.html",
                        controller: 'AddTaskController'
                    })
                    .state('new_context', {
                        url: '/new_context',
                        templateUrl: "templates/addContext.html",
                        controller: 'ContextController'
                    })
                    .state('consult_tasks', {
                        url: '/tasks',
                        templateUrl: "templates/consultTasks.html",
                        controller: 'TaskDetailsController'
                    })
                    .state('settings', {
                        url: '/settings',
                        templateUrl: "templates/settings.html",
                        controller:"fmnController"
                    })
                    .state('tasks', {
                        url: '/lists',
                        templateUrl: "templates/tasksList.html"
                        
                    });
            $urlRouterProvider.otherwise('/');
        });
