/*
 * HelpTour.js
 * Copyright (C) 2016 Menome Technologies Inc
 *
 * Contains contextual help for theLink
 * Uses intro.js as foundation for display mechanism 
 */
function startIntro(callback) {
  var intro = introJs();

  // patch into angular to get right sidebar controller : Note this is a hack to open the right sidebar controller for the help process
  var self = angular.element(document.getElementById('theLinkBody')).scope();
  self.rightSidenavOpen();

  // set positioning to adapt automatically 
  intro.setOption('tooltipPosition', 'auto');
  intro.setOption('positionPrecedence', ['left', 'right', 'bottom', 'top']);
  intro.setOption('showProgress', true);
  intro.setOptions({
    steps: [{
        intro: "<center>Welcome to:</center> <p/><center><b>-->theLink<--</b></center><p/>Here is a quick tour of features!"
      },
      {
        element: '#homeButton',
        intro: "The <b>Home button</b> will clear the current search and return theLink to its starting state."
      },
      {
        element: '#listSearchButton',
        intro: "The <b>Card Explorer: List</b> Button will display types of Index Cards on the left sidebar. Clicking on the name will help you find cards based on their name, location, date or tag card.",
        position: 'bottom'
      },
      {
        element: '#textSearchButton',
        intro: 'The <b>Card Explorer:Text</b> Button will allow you to find cards using specific properties of Index Cards. ',
        position: 'bottom'
      },
      {
        element: '#mapSearchButton',
        intro: "The <b>Card Explorer: Map</b> button will display a map. Browsing and zooming the map will display cards that are located in bounds o fthe map window",
        position: 'bottom'
      },
      {
        element: '#fullTextSearch',
        intro: 'Typing words in the <b>Card Finder</b> box will return <b>Index Cards</b> whose names match or closely match the text you enter, ranked by how closely they match.',
        position: 'bottom'
      },
      {
        element: '#listNavigation',
        intro: 'This is the <b>Card Explorer/b> List. <p>Clicking the drop-down arrow beside the card will let you find cards based on the criteria.',
        position: 'right'
      },
      {
        element: '#resultsArea',
        intro: 'Index Card results will be displayed here.'
      },
      {
        element: '#filterBar',
        intro: 'Typing text into the Search Results Filter will filter the Index Cards whose name contains the text you enter.'
      },
      {
        element: '#relationshipBrowser',
        intro: 'The <b>Relationship Explorer</b> shows you the currently selected <b>Index Card</b> and a list of Relationships that connect it to other Index Cards.<P> Clicking on the \
        <b>Relationship</b> will show the cards related to the currently selected card.'

      },
      {
        element: '#relationshipBrowser',
        intro: 'Clicking on <b>Questions</b> will display questions that can be answered about the currently selected Index Card.'
      },
      {
        element: '#relationshipBrowser',
        intro: 'Clicking on <b>Info</b> will display detailed information about the currently selected Index Card, or links to other systems that know about this Index Card.'
      },
      {
        element: '#detailedHelp',
        intro: 'For more detailed help, use the Detailed Help Button'
      },
    ]
  });

  // handle the end or exit intro by closing sidebar
  intro.onexit(function () {
    // patch into angular to get right sidebar controller : Note this is a hack to close the right sidebar controller for the help process
    var self = angular.element(document.getElementById('theLinkBody')).scope();
    self.rightSidenavClose();
    if (callback) callback();
  });

  // start the intro process
  intro.start();
}