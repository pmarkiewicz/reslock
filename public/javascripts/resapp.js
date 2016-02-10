"use strict";

const app = angular.module('res-mgr', ['ngResource', 'ngRoute', 'ui.bootstrap']);

app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('HomeCtrl', 
    ['$scope', '$resource', 
    function ($scope, $resource) {
        const groups = $resource('/resources/groups'),
              resources = $resource('/resources');
        
        const socket = io.connect(location.protocol + '//' + location.host);
        socket.on('change', function (data) {
            console.log(data);
            
            $scope.$apply(function () {
                    let res = $scope.resources.find((r)=> r._id === data.id);
                    if (res) {
                        res.locked = data.locked;
                        res.lockedBy = data.lockedBy;
                        res.updatedAt = new Date();
                    }
            });
        });

        let resCompare = function (res1, res2) {
            if (res1.category < res2.category) {
                return -1;
            }
            if (res1.category > res2.category) {
                return 1;
            }
            
            if (res1.group < res2.group) {
                return -1;
            }
            if (res1.group > res2.group) {
                return 1;
            }
            
            if (res1.name < res2.name) {
                return -1;
            }
            if (res1.name > res2.name) {
                return 1;
            }
            
            return 0;
        };
        
        let resFilter = function (res) {
            if ($scope.selectedCategory && $scope.selectedCategory !== res.category) {
                return false;
            }
            
            if ($scope.selectedGroup && $scope.selectedGroup !== res.group) {
                return false;
            }
            
            return true;
        };
        
        $scope.selectedCategory = '';
        $scope.selectedGroup = "";
        $scope.currentGroup = [];
        $scope.loginName = null;
        $scope.loginComplete = false;

        $scope.login = function () {
            if ($scope.loginName && $scope.loginName.length > 0) {
                $scope.loginComplete = true;
            }
            console.log($scope.loginName);
        };

        $scope.logout = function () {
            $scope.loginName = null;
            $scope.loginComplete = false;
        };

        $scope.config = function () {
            console.log("config");
        }

        $scope.switch = function (id) {
            console.log('change ' + id);
            let res = $scope.resources.find((r)=> r._id === id);

            res.locked = !res.locked;
            res.lockedBy = $scope.loginName;

            socket.emit('change', { id: id, lockedBy: $scope.loginName, locked: res.locked });
        };

        $scope.categoryClick = function(id) {
            console.log(id);
            $scope.selectedCategory = id;
            $scope.selectedGroup = '';
            $scope.resources = $scope.allResources.filter(resFilter);

            if (id) {
                $scope.currentGroup = $scope.resources.reduce((prev, r) => {
                        prev[r.group] = r.group;
                        console.log(r.group);
                        return prev;
                    },  
                    { }
                );
            }
            else {
                $scope.currentGroup = [];
            }
        };

        $scope.groupClick = function (id) {
            console.log(id);
            $scope.selectedGroup = id;
            $scope.resources = $scope.allResources.filter(resFilter);
        };

        groups.query(function (gr) {
            $scope.groups = gr;
            console.log('groups');

            resources.query(function (resources) {
                $scope.resources = $scope.allResources = resources.sort(resCompare).map(r => { r.updatedAt = new Date(Date.parse(r.updatedAt)); return r });
                console.log('resources');
            });
        });
    }
]);

