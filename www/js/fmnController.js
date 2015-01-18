fmnApp.controller('fmnController', function ($scope, $location, $state, userService, databaseService, $ionicPopover) {
    $scope.location = $location;
    $scope.tasksForToday = [];
    $scope.overdueTasks = [];
    $scope.showTasksForToday;
    $scope.showOverdueTasks;
    $scope.languages;
    $scope.selectedLanguage;
    $scope.user;
    $scope.contexts;

    $scope.isWelcomePage = function () {
        return $state.current.name === 'home' || $scope.isAppBeginning();
    };
    
    $scope.isAppBeginning = function() {
        return $state.current.name === "authentication" || $state.current.url === "^";
    };
    
    $scope.isUserAuthenticated = function() {
        return userService.loadUser() !== null;
    };
    
    $scope.saveSettings = function () {
        $scope.user.language_id = $scope.user.language_id.language_id;
        $scope.user.lastModification = Date.now();
        databaseService.updateUserSettings($scope.user).then(function() {
            console.log("settings saved");
        });
    };

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
        databaseService.getTasksByCondition("preciseDate", date, $scope.user.user_id)
            .then(function (result) {
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

        databaseService.getTasksByCondition("beforeDate", date, $scope.user.serveur_id)
            .then(function (result) {
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
   
           
    var init = function() {
        if($scope.isUserAuthenticated()) {
            $scope.user = userService.loadUser();
            $scope.contexts = userService.loadUserContexts();
            $scope.languages = userService.loadLanguages();
            initSelectedLanguage(); 
            getOverdueTasks();
            getTasksForToday();
        } else {
            $scope.location.path("/");
        }
    };
    
    if(!$scope.isAppBeginning()) {
        init();
    }
});

