/*
 * theLinkConfig.js
 * Copyright (C) 2016 konrad <konrad@serenity>
 *
 * Distributed under terms of the MIT license.
 */
var theLinkConfigFunction = function ($mdThemingProvider, $mdIconProvider) {
  $mdIconProvider
    .icon("menome", "./assets/svg/menome-logo-web.svg", 512);

  $mdThemingProvider.theme('default')
    .primaryPalette('blue', {
      'hue-2': '900'
    })

    .accentPalette('light-blue')
    .warnPalette('orange');
};