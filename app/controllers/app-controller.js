angular.module('myApp')
    .controller('appController', ['$scope', '$timeout', 'WeatherService', function($scope, $timeout, WeatherService) {
        $scope.city = 'Copenhagen';
        $scope.weatherData = {};
        $scope.searchText = '';

        $scope.cardIsExpanded = false;
        $scope.showDetails = false;
        $scope.buttonText = 'See details';
    
        // Add chart instances
        let hourlyChart = null;
        let dailyChart = null;

        $scope.suggestions = [];
        $scope.selectedIndex = -1;
        let searchTimeout;

        function createHourlyChart(data) {
            const ctx = document.getElementById('hourlyChart');
            if (hourlyChart) {
                hourlyChart.destroy();
            }

            const hourlyData = data.hourly;
            const currentHour = new Date().getHours();
            
            // Update labels to show hours with leading zeros
            const labels = hourlyData.time
                .slice(currentHour, currentHour + 24)
                .map(time => {
                    const hour = new Date(time).getHours();
                    return [0, 6, 12, 18].includes(hour) ? 
                        hour.toString().padStart(2, '0') : '';  // Add leading zero
                });
            
            const temperatures = hourlyData.temperature_2m
                .slice(currentHour, currentHour + 24);

            // Calculate min and max for better scale
            const minTemp = Math.min(...temperatures);
            const maxTemp = Math.max(...temperatures);
            const padding = (maxTemp - minTemp) * 0.3; // Add 30% padding to the range

            // Create gradient
            const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(71, 140, 204, 0.4)');
            gradient.addColorStop(1, 'rgba(71, 140, 204, 0)');

            hourlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        data: temperatures,
                        borderColor: 'rgb(71, 140, 204)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        backgroundColor: gradient,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointHoverBackgroundColor: 'rgb(71, 140, 204)',
                        pointHoverBorderColor: 'white',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: function(context) {
                                let tooltipEl = document.getElementById('chartjs-tooltip');
                                if (!tooltipEl) {
                                    tooltipEl = document.createElement('div');
                                    tooltipEl.id = 'chartjs-tooltip';
                                    tooltipEl.style.position = 'absolute';
                                    tooltipEl.style.transform = 'translateX(-50%)';
                                    tooltipEl.style.pointerEvents = 'none';
                                    tooltipEl.style.display = 'flex';
                                    tooltipEl.style.flexDirection = 'column';
                                    tooltipEl.style.alignItems = 'center';
                                    tooltipEl.style.zIndex = '10';
                                    context.chart.canvas.parentNode.appendChild(tooltipEl);  // Append to chart container instead of body
                                }

                                const tooltipModel = context.tooltip;
                                const label = document.querySelector('.detials-data-label');

                                if (tooltipModel.opacity === 0) {
                                    tooltipEl.style.opacity = 0;
                                    label.style.opacity = 1;
                                    return;
                                }

                                label.style.opacity = 0;

                                if (tooltipModel.body) {
                                    const value = Math.round(tooltipModel.dataPoints[0].raw);
                                    const hour = new Date(hourlyData.time[currentHour + tooltipModel.dataPoints[0].dataIndex]).getHours();
                                    const formattedHour = hour.toString().padStart(2, '0');
                                    
                                    tooltipEl.innerHTML = `
                                        <div style="font-size: 12px; color: rgba(0, 0, 0, 0.6); margin-bottom: 2px;">
                                            ${formattedHour}:00
                                        </div>
                                        <div style="font-size: 20px; color: rgb(0, 0, 0);">
                                            ${value}°
                                        </div>
                                    `;
                                    tooltipEl.style.background = 'transparent';
                                    tooltipEl.style.textAlign = 'center';
                                }

                                const position = context.chart.canvas.getBoundingClientRect();
                                const chartArea = context.chart.chartArea;
                                
                                tooltipEl.style.opacity = 1;
                                tooltipEl.style.left = tooltipModel.caretX + 'px';  // Relative to container
                                tooltipEl.style.top = '-13px';  // Position at top of container
                            }
                        }
                    },
                    scales: {
                        y: {
                            min: Math.floor(minTemp - padding),
                            max: Math.ceil(maxTemp + padding),
                            display: true,
                            position: 'right',
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: 'rgba(0, 0, 0, 0.5)',
                                font: { size: 11 },
                                padding: 2,
                                callback: (value) => `${Math.round(value)}°`
                            }
                        },
                        x: {
                            grid: {
                                color: function(context) {
                                    const index = context.index;
                                    const hour = new Date(hourlyData.time[currentHour + index]).getHours();
                                    return [0, 6, 12, 18].includes(hour) 
                                        ? 'rgba(0, 0, 0, 0.1)' 
                                        : 'transparent';
                                },
                                lineWidth: 1,
                                drawBorder: false,
                                borderDash: [5, 5],  // Add dashed pattern
                            },
                            ticks: {
                                color: 'rgba(0, 0, 0, 0.5)',
                                font: { size: 11 },
                                maxRotation: 0,
                                padding: 2,
                                callback: function(value, index) {
                                    const hour = new Date(hourlyData.time[currentHour + index]).getHours();
                                    return [0, 6, 12, 18].includes(hour) ? 
                                        hour.toString().padStart(2, '0') : '';
                                }
                            }
                        }
                    },
                    layout: {
                        padding: {
                            top: 30,    // Slightly reduced top padding
                            bottom: 5,
                            right: 10,
                            left: 10
                        }
                    }
                },
                plugins: [{
                    afterDraw: function(chart) {
                        if (chart.tooltip._active && chart.tooltip._active.length) {
                            const activePoint = chart.tooltip._active[0];
                            const ctx = chart.ctx;
                            const x = activePoint.element.x;
                            const y = activePoint.element.y;
                            const topY = chart.scales.y.top;
                            const bottomY = chart.scales.y.bottom;

                            // Draw vertical line
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(x, topY);
                            ctx.lineTo(x, bottomY);
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = 'rgba(71, 140, 204, 0.5)';
                            ctx.stroke();

                            // Draw point
                            ctx.beginPath();
                            ctx.arc(x, y, 4, 0, 2 * Math.PI);
                            ctx.fillStyle = 'white';
                            ctx.fill();
                            ctx.strokeStyle = 'rgb(71, 140, 204)';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            
                            ctx.restore();
                        }
                    }
                }]
            });
        }

        function createDailyChart(data) {
            const ctx = document.getElementById('dailyChart');
            if (dailyChart) {
                dailyChart.destroy();
            }

            const dailyData = data.daily;
            const labels = dailyData.time.map(date => 
                new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
            );

            const maxGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
            maxGradient.addColorStop(0, 'rgba(255, 59, 48, 0.15)');
            maxGradient.addColorStop(1, 'rgba(255, 59, 48, 0)');

            const minGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
            minGradient.addColorStop(0, 'rgba(0, 122, 255, 0.15)');
            minGradient.addColorStop(1, 'rgba(0, 122, 255, 0)');

            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'High',
                            data: dailyData.temperature_2m_max,
                            borderColor: 'rgb(255, 59, 48)',
                            backgroundColor: maxGradient,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgb(255, 59, 48)',
                            pointBorderColor: 'transparent',
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(255, 59, 48)',
                            pointHoverBorderColor: 'white',
                            pointHoverBorderWidth: 2
                        },
                        {
                            label: 'Low',
                            data: dailyData.temperature_2m_min,
                            borderColor: 'rgb(0, 122, 255)',
                            backgroundColor: minGradient,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgb(0, 122, 255)',
                            pointBorderColor: 'transparent',
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgb(0, 122, 255)',
                            pointHoverBorderColor: 'white',
                            pointHoverBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: 'rgba(0, 0, 0, 0.7)',
                            bodyColor: 'rgb(0, 0, 0)',
                            bodyFont: { size: 14, weight: 'bold' },
                            padding: 12,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${Math.round(context.parsed.y)}°`
                            }
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            position: 'right',
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                            },
                            ticks: {
                                color: 'rgba(0, 0, 0, 0.5)',
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                            },
                            ticks: {
                                color: 'rgba(0, 0, 0, 0.5)',
                            }
                        }
                    },
                    layout: {
                        padding: {
                            top: 5,
                            bottom: 5,
                            right: 10
                        }
                    }
                }
            });
        }

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
                    if ($scope.showDetails && $scope.weatherData) {
                        $timeout(() => {
                            createHourlyChart($scope.weatherData);
                            createDailyChart($scope.weatherData);
                        });
                    }
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
                    if ($scope.showDetails && $scope.weatherData) {
                        $timeout(() => {
                            createHourlyChart($scope.weatherData);
                            createDailyChart($scope.weatherData);
                        }, 300);
                    }
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

        // Add new function to search cities
        $scope.searchCities = function() {
            if (searchTimeout) {
                $timeout.cancel(searchTimeout);
            }
            
            // Only search if there's text and it's at least 2 characters
            if ($scope.searchText && $scope.searchText.length >= 2) {
                searchTimeout = $timeout(function() {
                    WeatherService.getCoordinatesByCity($scope.searchText)
                        .then(function(response) {
                            $scope.suggestions = response.data.results || [];
                            $scope.selectedIndex = -1;
                        })
                        .catch(function(error) {
                            console.error('Error fetching city suggestions', error);
                            $scope.suggestions = [];
                        });
                }, 300); // Debounce by 300ms
            } else {
                $scope.suggestions = [];
            }
        };

        // Add function to handle suggestion selection
        $scope.selectCity = function(city) {
            $scope.searchText = '';
            $scope.suggestions = [];
            $scope.selectedIndex = -1;
            
            $scope.city = city.name;
            $scope.countryCode = city.country_code;
            WeatherService.getWeatherData(city.latitude, city.longitude)
                .then(function(response) {
                    $scope.weatherData = response.data;
                    if ($scope.showDetails && $scope.weatherData) {
                        $timeout(() => {
                            createHourlyChart($scope.weatherData);
                            createDailyChart($scope.weatherData);
                        });
                    }
                })
                .catch(function(error) {
                    console.error('Error fetching weather data', error);
                });
        };

        // Update handleKeyPress to handleKeyDown for better keyboard navigation
        $scope.handleKeyDown = function(event) {
            switch(event.keyCode) {
                case 40: // Down arrow
                    event.preventDefault();
                    if ($scope.selectedIndex < $scope.suggestions.length - 1) {
                        $scope.selectedIndex++;
                    }
                    break;
                    
                case 38: // Up arrow
                    event.preventDefault();
                    if ($scope.selectedIndex > 0) {
                        $scope.selectedIndex--;
                    }
                    break;
                    
                case 13: // Enter
                    event.preventDefault();
                    if ($scope.selectedIndex >= 0 && $scope.suggestions[$scope.selectedIndex]) {
                        $scope.selectCity($scope.suggestions[$scope.selectedIndex]);
                    }
                    break;
                    
                case 27: // Escape
                    event.preventDefault();
                    $scope.suggestions = [];
                    $scope.selectedIndex = -1;
                    break;
            }
        };

        // Add click handler to close suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.search-container')) {
                $scope.$apply(function() {
                    $scope.suggestions = [];
                    $scope.selectedIndex = -1;
                });
            }
        });

        // Add these helper functions to your controller
        $scope.getMaxTemp = function() {
            return Math.max(...$scope.weatherData.daily.temperature_2m_max);
        };

        $scope.getMinTemp = function() {
            return Math.min(...$scope.weatherData.daily.temperature_2m_min);
        };

        $scope.getWeatherIconName = function(code) {
            switch (true) {
                case code === 0:
                    return 'clear-day';
                case code === 1:
                case code === 2:
                    return 'partly-cloudy-day';
                case code === 3:
                    return 'cloudy';
                case code >= 45 && code <= 48:
                    return 'fog';
                case code >= 51 && code <= 55:
                    return 'drizzle';
                case code >= 56 && code <= 57:
                    return 'drizzle';
                case code >= 61 && code <= 65:
                    return 'rain';
                case code >= 66 && code <= 67:
                    return 'sleet';
                case code >= 71 && code <= 75:
                    return 'snow';
                case code === 77:
                    return 'snow';
                case code >= 80 && code <= 82:
                    return 'rain';
                case code >= 85 && code <= 86:
                    return 'snow';
                case code >= 95:
                    return 'thunderstorms';
                default:
                    return 'clear-day';
            }
        };
    }]);