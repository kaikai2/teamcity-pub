TeamCity-Pub
============

A small library help to access artifacts of TeamCity and ease the publish routine.

## Installation

  npm install teamcity-pub --save

## Usage

  var pub = require('teamcity-pub'),
      TeamCityPub = pub.TeamCityPub;

  var thePub = new TeamCityPub('localhost', 8111);
  
  thePub.list();
  
  console.log('html', html, 'escaped', escaped, 'unescaped', unescaped);

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release