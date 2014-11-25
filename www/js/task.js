var taskModule = angular.module('task',[]);

taskModule.controller("AddTaskController", function ($scope, userService, databaseService) {

    $scope.task = new Task();

    $scope.saveTask = function() {

        $scope.task.owner = userService.loadUser().username;
        $scope.task.lastModification = Date.now();
	databaseService.storeTask($scope.task); 
    };

    $scope.cancelTask = function() {
	$scope.task = new Task();
    };

    $scope.store_priority = function(level) {
        if(0 <= level && level <= 3) {
            $scope.task.priority = level; 
        }
    };
});

taskModule.controller("TaskListsController", function($scope, databaseService) {
    $scope.tasks;
    $scope.show = false;
    $scope.list ="";
    $scope.showList = function(list) {
        if($scope.list !== list) {
           // databaseService
                $scope.tasks = TaskService.tasks;
                $scope.show = true;
                $scope.list = list;
                //TODO : modify so it looks for the proper list in local storage
            } else {
                $scope.show = false;
                $scope.list = "";
            }   
        };
        $scope.showListDetails = function() {
            return $scope.show;
        };
});

taskModule.controller("TaskDetailsController", function($scope, $stateParams, databaseService) {
    $scope.task = databaseService.getTask(parseInt($stateParams.taskId));
});