# Weather Forecast App

This repository contains a very basic setup of an AngularJS app for viewing the weather forecast of a chosen city.

## Weather data

The weather information is obtained via [Open-Meteo weather forecast API](https://open-meteo.com/en/docs).

## App design

The app has a very simple UI. The idea is to display all of the neccessary information as simply and concisely as possible in a card format.

### Weather card

The weather card displays all the essentials for a city, so that the you get an overview at a glance.

<kbd>
  <img src="images/general.png" alt="General View">
</kbd>

<br>

#### Detailed view

The detailed card view presents additional information for the 24-hour forecast with an interactive twist.

<kbd>
  <img src="images/details-today.png" alt="General View">
</kbd>

<br><br>

As well as a 7-day forecast.

<kbd>
  <img src="images/details-week.png" alt="General View">
</kbd>

<br>

## Weather icons

This project uses [Meteocons](https://bas.dev/work/meteocons) designed by [Bas Milius](https://bas.dev/about).

## Getting Started

To get you started simply clone the repository and install the dependencies:

```
npm install
```

Once you have installed the dependencies you can start the local development environment with: 

```
npm start
```

Once started navigate to the app at [`http://localhost:8000`](http://localhost:8000).
