// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var fmnApp = angular.module('forget-me-not', ['ionic']);

/* Permet de définir la balise <tasks-list></tasks-list> */
fmnApp.directive('tasksList', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/tasksList.html'
    };
});

fmnApp.run(function ($ionicPlatform) {
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
});

fmnApp.config(function ($stateProvider, $urlRouterProvider) {
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
                controller: 'AddContextController'
            })
            .state('consult_tasks', {
                url: '/tasks',
                templateUrl: "templates/consultTasks.html",
                controller: 'TaskListsController'
            })
            .state('task_details', {
                url: '/tasks/:taskId',
                templateUrl: "templates/taskDetails.html",
                controller: 'TaskDetailsCTaskDetaiontroller'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: "templates/settings.html",
                controller: "fmnController"
            })
            .state('tasks', {
                url: '/lists',
                templateUrl: "templates/tasksList.html"

            })
            .state('consult_contexts', {
                url: '/contexts',
                templateUrl: "templates/consultContexts.html",
                controller: 'ContextController'
            })
            .state('context_details', {
                url: '/contexts/:contextId',
                templateUrl: "templates/contextDetails.html",
                controller: "ContextDetailsController"
            });
    $urlRouterProvider.otherwise('/');
});
