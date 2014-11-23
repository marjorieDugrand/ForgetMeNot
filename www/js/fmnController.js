/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
fmnApp.controller('fmnController',function($scope, $state, databaseService) {
                $scope.isWelcomePage  = function() {
                    return $state.current.name === 'home';
                }; 
                
                $scope.languages = databaseService.getLanguages();
                $scope.user = databaseService.getUser('Rajon');
                
            })


