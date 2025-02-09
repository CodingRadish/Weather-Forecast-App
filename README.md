# Weather Forecast App

This repository contains a very basic setup of an AngularJS app for viewing the weather forecast of a chosen city.

## Weather Forecast API

The data is obtained through the [Open-Meteo weather forecast API](https://open-meteo.com/en/docs).

## The App

The app has a very simple UI. The idea is to display all of the neccessary information as simply and concisely as possible.

<br>

### Weather card

Weather information for a chosen city are shown in a so-called weather card.

#### Main view

The main view displays all the essentials, so that the you get an overview at a glance.

<kbd>
  <img src="images/general.png" alt="General View">
</kbd>

<br><br>

#### Detailed view

The detailed view presents additional information for the 24-hour forecast with an interactive twist.

<kbd>
  <img src="images/details-today.png" alt="General View">
</kbd>

<br><br>

As well as a 7-day forecast after scrolling down.

<kbd>
  <img src="images/details-week.png" alt="General View">
</kbd>

<br><br>

### Weather icons

I am using [Meteocons](https://bas.dev/work/meteocons) designed by [Bas Milius](https://bas.dev/about) as my weather icons.

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

