// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('forget-me-not', ['ionic', 'task'])

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
                    .state('consult_tasks', {
                        url: '/lists',
                        templateUrl: "templates/consultTasks.html"
                    })
                    .state('settings', {
                        url: '/settings',
                        templateUrl: "templates/settings.html"
                    })
                    .state('tasks', {
                        url: '/tasks',
                        templateUrl: "templates/tasksList.html"
                    });

            $urlRouterProvider.otherwise('/');
        });
