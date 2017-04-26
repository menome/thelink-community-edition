/*
 * HelpTour.js
 * Copyright (C) 2016 Menome Technologies Inc
 *
 * Contains contextual help for theLink
 * Uses intro.js as foundation for display mechanism 
 */
function startIntro() {
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
        intro: "<center>Welcome to:</center> <p/><center><b>-->theLink<-- : KnowledgeWeb : </b></center><p/> The goal of <b>-->theLink<--</b> is to give you one place to go to find critical knowledge."
      },
      {
        element: '#homeButton',
        intro: "The <b>Home button</b> will clear the current search and return theLink to its starting state."
      },
      {
        element: '#listSearchButton',
        intro: "The <b>List Search</b> Button will display types of Index Cards on the left sidebar. Clicking on the name will initiate a search based on that type of card.",
        position: 'bottom'
      },
      {
        element: '#textSearchButton',
        intro: 'The <b>Text Search</b> Button will allow you to search on specific properties of Index Cards. ',
        position: 'bottom'
      },
      {
        element: '#mapSearchButton',
        intro: "The <b>Map Search</b> button will display a map. Browsing and zooming the map will display cards that are located in the window",
        position: 'bottom'
      },
      {
        element: '#fullTextSearch',
        intro: 'Typing words in the <b>Full Text Search</b> box will return <b>Index Cards</b> whose names match or closely match the text you enter, ranked by how closely they match.',
        position: 'bottom'
      },
      {
        element: '#listNavigation',
        intro: 'This is the <b>Index Card</b> Type List. <p>Clicking the drop-down arrow beside the card will show different search filters.',
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
        intro: 'The <b>Relationship Browser</b> shows you the currently selected <b>Index Card</b> and a list of Relationships that connect it to other Index Cards.<P> Clicking on the \
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
    ]
  });

  // handle the end or exit intro by closing sidebar
  intro.onexit(function () {
    // patch into angular to get right sidebar controller : Note this is a hack to close the right sidebar controller for the help process
    var self = angular.element(document.getElementById('theLinkBody')).scope();
    self.rightSidenavClose();
  });

  // start the intro process
  intro.start();
}