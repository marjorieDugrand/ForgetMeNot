/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
fmnApp.service('userService', function (databaseService, $q) {
    var appUser = null;
    var appLanguages;
    this.initialized = false;
    this.serviceInit = function () {
        var servicePromise = $q.defer();
        if (this.initialized) {
            servicePromise.resolve();
        } else {
            this.initialized = true;
            /*databaseService.rmDB().then(function() {
             console.log("RM DB"); 
             });*/
            databaseService.initDB().then(function () {
                appLanguages = databaseService.getLanguages();
                databaseService.getUser('Rajon').then(function (result) {
                    appUser = result;
                    servicePromise.resolve();
                });
            });
        }
        return servicePromise.promise;
    };
    this.loadUser = function () {
        return appUser;
    };
    this.loadLanguages = function () {
        return appLanguages;
    };

    this.loadUserContexts = function () {
        if (appUser !== null) {
            return databaseService.getUserContexts(appUser.user_id);
        }
    };

});

fmnApp.controller('fmnController', function ($scope, $state, userService, databaseService, $ionicPopover) {
    $scope.tasksForToday = [];
    $scope.overdueTasks = [];
    $scope.showTasksForToday;
    $scope.showOverdueTasks;

    $scope.isWelcomePage = function () {
        return $state.current.name === 'home';
    };

    $scope.languages;
    $scope.selectedLanguage;
    $scope.user;
    
    $scope.saveSettings = function () {
        console.log("Save settings");
        console.log("selected language : " + $scope.selectedLanguage);
        $scope.user.language_id = $scope.user.language_id.language_id;
        $scope.user.lastModification = Date.now();
        databaseService.updateUserSettings($scope.user).then(function() {
            console.log("settings saved");
        });
    };
        
    userService.serviceInit().then(function () {
        getOverdueTasks();
        getTasksForToday();
        $scope.languages = userService.loadLanguages();
        $scope.user = userService.loadUser();
        $scope.contexts = userService.loadUserContexts();
        initSelectedLanguage();    
    });

    var initSelectedLanguage = function () {
            var i;
            var found = false;
            for (i = 0; i < $scope.languages.length && !found; i++) {
                if ($scope.languages[i].language_id === $scope.user.language_id) {
                    $scope.user.language_id = $scope.languages[i];
                    found = true;
                }
            }
        };
    $ionicPopover.fromTemplateUrl('templates/notificationsPopover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });

    $scope.isTasksForTodayShown = function (condition) {
        return ($scope.showTasksForToday === condition);
    };

    $scope.isOverdueTasksShown = function (condition) {
        return ($scope.showOverdueTasks === condition);
    };

    $scope.showPopover = function ($event) {
        $scope.popover.show($event);
        console.log("show popover");
        getTasksForToday();
        getOverdueTasks();
    };

    var getTasksForToday = function () {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        month = getMonthInProperFormat(month);
        day = getDayInProperFormat(day);
        date = year + '-' + month + '-' + day;
        databaseService.getTasksByCondition("preciseDate", date).then(function (result) {
            $scope.tasksForToday = result;
            console.log("tasks for today: " + $scope.tasksForToday.length);
            // Sélectionne le message à afficher en fonction du nombre de tâches
            switch ($scope.tasksForToday.length) {
                case 0:
                    $scope.showTasksForToday = 0;
                    break;
                case 1:
                    $scope.showTasksForToday = 1;
                    break;
                default:
                    $scope.showTasksForToday = 2;
            }
        });
    };

    var getOverdueTasks = function () {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        month = getMonthInProperFormat(month);
        day = getDayInProperFormat(day);
        date = year + '-' + month + '-' + day;

        databaseService.getTasksByCondition("beforeDate", date).then(function (result) {
            $scope.overdueTasks = result;
            console.log("overdue tasks: " + $scope.overdueTasks.length);
            // Sélectionne le message à afficher en fonction du nombre de tâches
            switch ($scope.overdueTasks.length) {
                case 0:
                    $scope.showOverdueTasks = 0;
                    break;
                case 1:
                    $scope.showOverdueTasks = 1;
                    break;
                default:
                    $scope.showOverdueTasks = 2;
            }
        });
    };

    /* Renvoie la couleur associée à la priorité de la tâche */
    $scope.getPriorityClass = function (priority) {
        var color;

        switch (priority) {
            case 1:
                color = "balanced";
                break;
            case 2:
                color = "energized";
                break;
            case 3:
                color = "assertive";
                break;
            default:
                color = "stable";
        }
        return color;
    };

    var getMonthInProperFormat = function (month) {
        if (month < 10) {
            month = "0" + month;
        }
        return month;
    };

    var getDayInProperFormat = function (day) {
        if (day < 10) {
            day = "0" + day;
        }
        return day;
    };
   
});

