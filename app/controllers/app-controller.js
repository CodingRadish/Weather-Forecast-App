angular.module('myApp')
    .controller('appController', ['$scope', '$timeout', 'WeatherService', function($scope, $timeout, WeatherService) {
        $scope.city = 'Copenhagen';
        $scope.weatherData = {};
        $scope.searchText = '';

        $scope.cardIsExpanded = false;
        $scope.showDetails = false;
        $scope.buttonText = 'See details';
    
        // loading weather data
        $scope.loadWeatherData = function(searchText) {
            if (searchText) {
                WeatherService.getCoordinatesByCity(searchText)
                .then(function(response) {
                    var result = response.data.results[0];
                    $scope.city = result.name;
                    $scope.countryCode = result.country_code;
                    return WeatherService.getWeatherData(result.latitude, result.longitude); // how to handle if there is an error?
                })
                .then(function(response) {
                    $scope.weatherData = response.data;
                })
                .catch(function(error) {
                    console.error('Error fetching weather data', error);
                });
            }
            else {
                // Handle the case when the city field is empty
                console.log('Invalid city name entered.');
            }
        };
        
        // searching
        $scope.handleKeyPress = function(event) {
            if (event.keyCode === 13) { // 13 is the key code for Enter key
                $scope.loadWeatherData($scope.searchText);
                $scope.searchText = ''; // clear search text
            }
        };

        // viewing and hiding details
        $scope.expandCard = function() {
            // expanding
            if ($scope.cardIsExpanded == false) {
                $scope.cardIsExpanded = !$scope.cardIsExpanded;
                $scope.buttonText = 'Hide details';
                $timeout(function() { // timeout used to make new content appear only after the transition
                    $scope.showDetails = !$scope.showDetails;
                }, 300); // 300 ms = 0.3 s
            }
            // collapsing
            else {
                $scope.showDetails = !$scope.showDetails;
                $scope.cardIsExpanded = !$scope.cardIsExpanded;
                $scope.buttonText = 'See details';
            }
        };
    
        // Initial data load
        $scope.loadWeatherData($scope.city);
    }]);