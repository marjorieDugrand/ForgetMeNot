fmnApp.controller("AddTaskController", function ($scope, userService, databaseService) {

    $scope.task = new Task();
    $scope.contexts = userService.loadUserContexts();

    $scope.saveTask = function() {
        console.log("Save task");
        $scope.task.owner_id = userService.loadUser().user_id;
        $scope.task.lastModification = Date.now();
        $scope.task.context_id = $scope.task.context_id.context_id;
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

fmnApp.controller("TaskListsController", function($scope, databaseService) {
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

fmnApp.controller("TaskDetailsController", function($scope, $stateParams, databaseService) {
    $scope.task = databaseService.getTask(parseInt($stateParams.taskId));
});