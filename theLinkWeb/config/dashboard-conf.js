module.exports = {
  // Add queries for metrics here. Queries should return an item called 'res'.
  // The name is the name of the metric, the query is a cypher query that returns the relevant value as 'res'
  quickMetrics: [
    {
      name: 'Available Wells',
      query: "MATCH (w:Well)  RETURN count(w) as res",
    }, 
    {
      name: 'Available Facilities',
      query: "MATCH (f:Facility)  RETURN count(f) as res",
    }, 
  ],

  // The graphs we will be returning. Includes their type and size and whatever. Also includes the query we use to grab their data.
  // The query is a cypher query that returns an array of labels as 'labels' and an array of data as 'data'.
  // TODO: Add support for multi-series graphs. Each row of the result will be a different data series.
  // The title is the graph's title, and the chartType is one of the chart types found here: https://jtblin.github.io/angular-chart.js/ (in camelcase)
  graphMetrics: [
   
   {
       query: "MATCH (y:Year)-[:HasMonth]->(m:Month)-[:HasDay]->(d:Day)<-[:FinishedDrillingOn]-(a:Well) where y.year > 1970 WITH y, count(a) as wells order by y.year descending RETURN collect(y.year) as labels, collect(wells) as data",
       chartType: "line",
       title: "Wells by Year",
       question: "wellsByYear"
    },
     {
       query: "MATCH (w:Well)-[:HasLicense]->(l:License)-[:HasStatus]-(ls:LicenseStatus) WITH ls, count(w) as count order by count descending RETURN collect(ls.Name) as labels, collect(count) as data",
       chartType: "pie",
       title: "Wells By Status",
       question: "wellsByStatus"
     },
     {
       query: "MATCH (f:Facility)-[:IsSubType]->(s:SubType) WITH s, count(f) as count  order by count descending where count > 500 return collect(s.Name) as labels,collect(count) as data",
       chartType: "horizontalBar",
       title: "Facilities by SubType",
       question: "facilitiesBySubType"
     },
  ]
};