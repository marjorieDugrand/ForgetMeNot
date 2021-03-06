fmnApp.controller("AddTaskController", function ($scope, $timeout, userService, databaseService, $location, $stateParams) {

    $scope.task = new Task();
    $scope.contexts = userService.loadUserContexts();
    $scope.showFooter = false;
    $scope.message = "";

    // Retrieve the task in the case of edition
    if ($stateParams.taskId) {
        databaseService.getTask(parseInt($stateParams.taskId), userService.loadUser().user_id).then(function (taskResult) {
            if (taskResult !== null) {
                $scope.task = taskResult;
                if ($scope.task.context_id !== '') {
                    console.log("get context");
                    databaseService.getContext($scope.task.context_id, userService.loadUser().user_id).then(function (contextResult) {
                        $scope.task.context_id = contextResult;
                        console.log($scope.task);
                    });
                }
            }
        });
    }

    $scope.saveTask = function () {
        if ($scope.task.name === '' || $scope.task.name === undefined) {
            console.log("your task should have a name");
            $scope.message = "Your task should have a name.";
            showFooter();
        }
        else {
            $scope.task.context_id = $scope.task.context_id.context_id;
            $scope.task.lastModification = Date.now();
            // If task modification
            if ($stateParams.taskId) {
                
                $scope.task.context_id = $scope.task.context_id.serveur_id;
                console.log("Update task");
                console.log($scope.task);
                databaseService.updateTask($scope.task);
                $location.path("/tasks/" + $scope.task.serveur_id);
            }
            // If task creation
            else {
                console.log("Save task");
                $scope.task.owner_id = userService.loadUser().serveur_id;
                
                databaseService.storeTask($scope.task).then(function (result) {
                    $scope.task.task_id = result;
                    $scope.task.serveur_id = result;
                    $location.path("/tasks/" + $scope.task.serveur_id);
                });
            }
        }
    };
    $scope.cancelTask = function () {
        $scope.task = new Task();
    };
    $scope.store_priority = function (level) {
        if (0 <= level && level <= 3) {
            $scope.task.priority = level;
        }
    };

    $scope.isContextNotSelected = function () {
        if ($scope.task.context_id !== "") {
            return false;
        }
        else
            return true;
    };

    $scope.isFooterShown = function () {
        return $scope.showFooter;
    };

    var showFooter = function () {
        $scope.showFooter = true;
        $timeout(hideFooter, 8000);
    };

    var hideFooter = function () {
        $scope.showFooter = false;
    };
});

fmnApp.controller("TaskListsController", function ($scope, databaseService, $ionicModal, userService, $ionicPopup, $timeout
        ) {
    $scope.showFooter = false;
    $scope.message = "";
    $scope.tasks = [];
    $scope.keyword;
    // Indique la liste qui est actuellement affichée
    // null: aucune liste n'est affichée
    // 0: today
    // 1: tonight
    // 2: tomorrow
    // 3: within the next 7 days
    // 4: within the next 30 days
    // 5: someday
    // 6: for a specific date
    // 7: by context/by keyword/by priority
    $scope.show = null;
    /* Déclarations des fenêtres modales */

    $ionicModal.fromTemplateUrl('templates/dateSelectionModal.html', {
        scope: $scope
    }).then(function (dateModal) {
        $scope.dateModal = dateModal;
        $scope.date = {selectedDate: ""};
    });

    $ionicModal.fromTemplateUrl('templates/contextSelectionModal.html', {
        scope: $scope
    }).then(function (contextModal) {
        $scope.contextModal = contextModal;
    });

    $ionicModal.fromTemplateUrl('templates/prioritySelectionModal.html', {
        scope: $scope
    }).then(function (priorityModal) {
        $scope.priorityModal = priorityModal;
    });

    /* Affichage des tâches par date d'échéance */
    $scope.toggleList = function (condition) {
        var precise = false;
        // On réinitialise les taches
        $scope.tasks = [];
        // On récupère la date du jour
        var today = new Date();
        // Date a comparer
        var date;
        // On affiche le bon groupe 
        if ($scope.isListShown(condition)) {
            $scope.show = null;
        }
        else {
            $scope.show = condition;
        }

        console.log("list shown: " + $scope.show);
        switch (condition) {
            case 0: /***** TASKS FOR TODAY *****/
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                month = getMonthInProperFormat(month);
                day = getDayInProperFormat(day);
                date = year + '-' + month + '-' + day;
                console.log("Get tasks for today: " + date);
                $scope.message = "You do not have tasks for today.";
                break;

            case 1: /***** TASKS FOR TONIGHT *****/
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                month = getMonthInProperFormat(month);
                day = getDayInProperFormat(day);
                date = year + '-' + month + '-' + day;
                console.log("Get tasks for tonight: " + date);
                $scope.message = "You do not have tasks for tonight.";
                break;

            case 2: /***** TASKS FOR TOMORROW *****/
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                var tomorrow;
                // Si on est le 31, demain sera le 1er et on change de mois
                if (day === 31) {
                    tomorrow = 1;
                    // Si on est en décembre, on passe en janvier et on change d'année
                    if (month === 12) {
                        month = 1;
                        year += 1;
                    }
                    else {
                        month++;
                    }
                }
                // Si on est dans un mois à 30 jours, on change de mois et demain sera le 1er
                else if (day === 30) {
                    if ((month === 4) || (month === 6) || (month === 9) || (month === 11)) {
                        tomorrow = 1;
                        month++;
                    }
                    else {
                        tomorrow = day + 1;
                    }
                }
                // Si on est le 28 février, demain sera le 1er mars
                else if ((day === 28) && (month === 2)) {
                    tomorrow = 1;
                    month++;
                }
                // Sinon, on incrémente juste le jour
                else {
                    tomorrow = day + 1;
                }

                // Important : le mois et le jour doivent etre au bon format
                month = getMonthInProperFormat(month);
                tomorrow = getDayInProperFormat(tomorrow);
                date = year + '-' + month + '-' + tomorrow;
                console.log("Get tasks for tomorrow: " + date);
                $scope.message = "You do not have tasks for tomorrow.";
                break;

            case 3: /***** TASKS FOR NEXT WEEK *****/
                var nextWeek;
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                // Si on est dans les 23 premiers jours du mois, on incrémente la date de 7 jours
                if (day <= 23) {
                    nextWeek = today.getDate() + 7;
                }
                // Sinon, on retourne au début du mois
                else {
                    nextWeek = Math.abs(30 - day - 7);
                    // Il faut changer de mois
                    // Si on est en décembre, il faut aussi changer d'année
                    if (month === 12) {
                        month = 1;
                        year++;
                    }
                    else {
                        month++;
                    }
                }

                // Important : le mois et le jour doivent etre au bon format
                month = getMonthInProperFormat(month);
                nextWeek = getDayInProperFormat(nextWeek);
                date = year + '-' + month + '-' + nextWeek;
                console.log("Get tasks for next week: " + date);
                $scope.message = "You do not have tasks within the 7 next days.";
                break;

            case 4: /***** TASKS FOR NEXT MONTH *****/
                var month = today.getMonth() + 1;
                var nextMonth;
                var year = today.getFullYear();
                // Si on est en décembre, le mois prochain sera janvier et on change d'année
                if (month === 12) {
                    nextMonth = 1;
                    year++;
                }
                // Sinon, on incrémente le mois
                else {
                    nextMonth = month + 1;
                }

                // Important : le mois et le jour doivent etre au bon format
                nextMonth = getMonthInProperFormat(nextMonth);
                var day = getDayInProperFormat(today.getDate());

                date = year + '-' + nextMonth + '-' + day;
                console.log("Get tasks for next month: " + date);
                $scope.message = "You do not have tasks within the next 30 days.";
                break;

            case 5: /***** TASKS FOR SOMEDAY *****/
                date = '';
                $scope.message = "You do not have tasks for someday.";
                break;

            case 6: /***** TASKS FOR A SPECIFIC DATE *****/
                console.log("selected date: " + $scope.date.selectedDate);
                precise = true;
                //date = new Date($scope.date.selectedDate);
                date = $scope.date.selectedDate;
                $scope.dateModal.hide();
                $scope.message = "You do not have tasks for " + date + ".";
                break;

            default:
                console.log("Unknown condition");
        }

        if (precise) {
            databaseService.getTasksByCondition("preciseDate", date, userService.loadUser().user_id)
                    .then(function (result) {
                        $scope.tasks = result;
                        console.log("length: " + $scope.tasks.length);
                        /*for (var i = 0; i < $scope.tasks.length; i++) {
                         console.log($scope.tasks[i].name);
                         }*/
                        showFooterIfEmptyTasksArray();
                    });
        }
        else {
            databaseService.getTasksByCondition("forDate", date, userService.loadUser().user_id)
                    .then(function (result) {
                        $scope.tasks = result;
                        console.log("length: " + $scope.tasks.length);
                        /*for (var i = 0; i < $scope.tasks.length; i++) {
                         console.log($scope.tasks[i].name);
                         }*/
                        showFooterIfEmptyTasksArray();
                    });
        }
    };

    /* Renvoie vrai si la liste actuellement affichée est celle passée en paramètre, faux sinon */
    $scope.isListShown = function (list) {
        return $scope.show === list;
    };

    /* Affichage de la fenêtre modale pour les contextes */
    $scope.showContextsModal = function () {
        $scope.contextModal.show();
        $scope.contexts = userService.loadUserContexts();
        $scope.context = {selectedContext: ""};
    };

    /* Affichage de la fenêtre modale pour les priorités */
    $scope.showPrioritiesModal = function () {
        $scope.priorityModal.show();
        $scope.priority = {selectedPriority: ""};
        // Associe une valeur à chaque priorité
        $scope.priorities = [{"name": "No priority", "value": "0"},
            {"name": "Low priority", "value": "1"},
            {"name": "Medium priority", "value": "2"},
            {"name": "High priority", "value": "3"}];
    };

    /* Affichage des tâches par mot-clé */
    $scope.searchByKeyword = function () {
        // On affiche le bon groupe 
        $scope.show = 7;
        console.log("keyword: " + $scope.keyword);
        databaseService.getTasksByCondition("keyword", $scope.keyword, userService.loadUser().user_id)
                .then(function (result) {
                    $scope.tasks = result;
                    console.log("length: " + $scope.tasks.length);
                    console.log("tasks: ");
                    for (var i = 0; i < $scope.tasks.length; i++) {
                        console.log($scope.tasks[i].name);
                    }

                    if ($scope.keyword !== "") {
                        $scope.message = "You do not have tasks related to the keyword '" + $scope.keyword + "'.";
                        showFooterIfEmptyTasksArray();
                    }
                });
    };

    /* Affichage des tâches par contexte */
    $scope.getTasksByContext = function () {
        $scope.contextModal.hide();
        // On affiche le bon groupe 
        $scope.show = 7;
        databaseService.getTasksByCondition("context",
                                            $scope.context.selectedContext.serveur_id,
                                            userService.loadUser().serveur_id)
            .then(function (result) {
            $scope.tasks = result;
            console.log("length: " + $scope.tasks.length);
            $scope.message = "You do not have tasks related to the context '" + $scope.context.selectedContext.name + "'.";
            showFooterIfEmptyTasksArray();
        });
    };

    /* Affichage des tâches par priorité */
    $scope.getTasksByPriority = function () {
        $scope.priorityModal.hide();
        // On affiche le bon groupe 
        $scope.show = 7;
        console.log("selected priority: " + $scope.priority.selectedPriority.value);
        databaseService.getTasksByCondition("priority",
                                            $scope.priority.selectedPriority.value,
                                            userService.loadUser().serveur_id)
            .then(function (result) {
            console.log(result);
            $scope.tasks = result;
            console.log("length: " + $scope.tasks.length);
            console.log($scope.priority.selectedPriority.value);
            switch ($scope.priority.selectedPriority.value) {
                case '1':
                    $scope.message = "You do not have tasks with low priority.";
                    break;
                case '2':
                    $scope.message = "You do not have tasks with medium priority.";
                    break;
                case '3':
                    $scope.message = "You do not have tasks with high priority.";
                    break;
                default:
                    $scope.message = "You do not have tasks with no priority.";
            }
            showFooterIfEmptyTasksArray();
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

    $scope.showConfirm = function (task) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Remove a task',
            template: 'Are you sure you want to remove the task "' + task.name + '"?',
            okType: 'button-energized',
            cancelType: 'button-energized'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('You are sure');
                $scope.removeTask(task);
                $scope.message = "The task '" + task.name + "' has been deleted.";
                showFooter();
            }
            else {
                console.log('You are not sure');
            }
        });
    };

    /* Supprime une tâche (de la BD + met à jour l'affichage) */
    $scope.removeTask = function (task) {
        databaseService.removeTaskFromDB(task.serveur_id);
        arrayUnset($scope.tasks, task.task_id);
        console.log("length: " + $scope.tasks.length);
    };

    $scope.finishTask = function (task) {
        console.log("congratulations, you have finished a task!");
        databaseService.removeTaskFromDB(task.task_id);
        arrayUnset($scope.tasks, task.task_id);
        $scope.message = "Congratulations, you have one less task to do!";
        showFooter();
    };

    var showFooterIfEmptyTasksArray = function () {
        if ($scope.tasks.length === 0) {
            console.log("yo, y'a 0 tâches !");
            showFooter();
        }
    };

    var showFooter = function () {
        $scope.showFooter = true;
        console.log("normalement, c'est le moment où le footer apparaît");
        $timeout(hideFooter, 8000);
    };

    var hideFooter = function () {
        $scope.showFooter = false;
        console.log("normalement, c'est le moment où le footer disparaît");
    };

    /* Supprime un élément donné d'un tableau */
    var arrayUnset = function (array, val) {
        var index = getIndex(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    /* Renvoie l'index de l'élément d'un tableau correspondant à l'id de tâche passé en paramètre*/
    var getIndex = function (array, id) {
        var found = false;
        var i = 0;
        var index = -1;
        while (!found && i < array.length) {
            if (array[i].task_id === id) {
                found = true;
                index = i;
            }
            i++;
        }
        return index;
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

    $scope.isFooterShown = function () {
        return $scope.showFooter;
    };
});

fmnApp.controller("TaskDetailsController", function ($scope, $stateParams, databaseService, userService) {
    $scope.task;
    $scope.taskOwner = userService.loadUser();
    $scope.taskContext;
    $scope.showTask = false;
    $scope.authorizeTaskDisplay = function () {
        return showTask;
    };
    
    databaseService.getTask(parseInt($stateParams.taskId), $scope.taskOwner.serveur_id)
        .then(function (taskResult) {
        if(taskResult !== null) {
            $scope.showTask = true;
            $scope.task = taskResult;       
            if ($scope.task.context_id !== '') {
                databaseService.getContext($scope.task.context_id, $scope.taskOwner.serveur_id)
                .then(function (contextResult) {
                    $scope.taskContext = contextResult;
                });
            }
        }
    });
});
