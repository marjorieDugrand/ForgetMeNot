var taskModule = angular.module('task',[]);

var Task = function (id,name,description,context,duration,priority,label,progression, lastModification, dueDate) {
this.id = id || '';
this.name = name || '';
this.description = description || '';
this.context = context || '';
this.duration = duration || '';
this.priority = priority || 0;
this.label = label || '';
this.progression = progression || 0;
this.lastModification = lastModification || '';
this.dueDate = dueDate || '';
};

var TaskService = function ($http, tasks) {
this.$http = $http;
this.tasks = tasks;
};

var tasks=[];

taskModule.service("TaskService", ["$http", function($http) {return new TaskService($http,tasks);}]);
taskModule.controller("AddTaskController", ["$scope", "TaskService", function ($scope, TaskService) {

$scope.task = new Task();

$scope.saveTask = function() {
	TaskService.tasks.push($scope.task);
};

$scope.cancelTask = function() {
	$scope.task = new Task();
}

$scope.store_priority = function(level) {
    if(0 <= level && level <= 3) {
        $scope.task.priority = level; 
    }
}
}]);

taskModule.controller("TaskDetailsController", ["$scope","TaskService", function($scope, TaskService) {


}]);