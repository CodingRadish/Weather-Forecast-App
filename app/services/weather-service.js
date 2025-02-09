angular.module('myApp')
    .service('WeatherService', ['$http', function($http) {
        var baseUrl = 'https://api.open-meteo.com/v1/forecast?';
    
        this.getWeatherData = function(latitude, longitude) {
        var url = baseUrl +
            'latitude=' + latitude +
            '&longitude=' + longitude +
            '&hourly=temperature_2m' +
            '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,precipitation_probability_max' +
            '&timezone=auto' +
            '&current_weather=true';
        return $http.get(url);
        };
        // Example for Copenhagen: https://api.open-meteo.com/v1/forecast?latitude=55.6759&longitude=12.5655&hourly=temperature_2m,relativehumidity_1000hPa&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto
    
        this.getCoordinatesByCity = function(cityName) {
        const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=en&format=json`;
        return $http.get(apiUrl);
        };
    }]);