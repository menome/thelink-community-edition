// Generate baseline time tree - set year range as needed. Wireup relationships to events using csv
WITH range(1940, 2020) AS years, range(1,12) as months
FOREACH(year IN years |
  MERGE (y:Year {year: year})
  FOREACH(month IN months |
    CREATE (m:Month {month: month})
    MERGE (y)-[:HasMonth]->(m)
    FOREACH(day IN (CASE
                      WHEN month IN [1,3,5,7,8,10,12] THEN range(1,31)
                      WHEN month = 2 THEN
                        CASE
                          WHEN year % 4 <> 0 THEN range(1,28)
                          WHEN year % 100 <> 0 THEN range(1,29)
                          WHEN year % 400 <> 0 THEN range(1,29)
                          ELSE range(1,28)
                        END
                      ELSE range(1,30)
                    END) |
      CREATE (d:Day {day: day})
      MERGE (m)-[:HasDay]->(d))))
WITH *
MATCH (year:Year)-[:HasMonth]->(month)-[:HasDay]->(day)
WITH year,month,day
ORDER BY year.year, month.month, day.day
WITH collect(day) as days
FOREACH(i in RANGE(0, length(days)-2) |
    FOREACH(day1 in [days[i]] |
        FOREACH(day2 in [days[i+1]] |
            CREATE UNIQUE (day1)-[:Next]->(day2))));


// well finish date
// this call does a periodic transaction commit using batches of 10000, so is much more memory efficient
call apoc.periodic.commit("
MATCH (a:Well) where a.FDDate is not null and  NOT (a)-[:FinishedDrillingOn]->() 
WITH a limit {limit} 
WITH a,(toFloat(a.FDDate)/10000) as dateYear
WITH a, dateYear, ((dateYear-(toInt(dateYear))) * 100) as dateMonth
WITH a, dateYear, dateMonth, ((dateMonth-(toInt(dateMonth)))*100) as dateDay
WITH a, toInt(dateYear) as dateYear, toInt(dateMonth) as dateMonth,round( dateDay) as dateDay

MATCH (y:Year {year:dateYear}),
    (y)-[:HasMonth]->(m:Month {month:dateMonth}),
    (m)-[:HasDay]->(d:Day {day:dateDay})
MERGE (d)<-[:FinishedDrillingOn]-(a)
return count(*)
",{limit:10000});


// license date
// this call does a periodic transaction commit using batches of 10000, so is much more memory efficient
call apoc.periodic.commit("
MATCH (a:License) where a.LicenseDate is not null and  NOT (a)-[:LicencedOn]->() 
WITH a limit {limit} 
WITH a,(toFloat(a.LicenseDate)/10000) as dateYear
WITH a, dateYear, ((dateYear-(toInt(dateYear))) * 100) as dateMonth
WITH a, dateYear, dateMonth, ((dateMonth-(toInt(dateMonth)))*100) as dateDay
WITH a, toInt(dateYear) as dateYear, toInt(dateMonth) as dateMonth,round( dateDay) as dateDay

MATCH (y:Year {year:dateYear}),
    (y)-[:HasMonth]->(m:Month {month:dateMonth}),
    (m)-[:HasDay]->(d:Day {day:dateDay})
MERGE (d)<-[:LicensedOn]-(a)
return count(*)
",{limit:10000});

// Spill Incident Date
// this call does a periodic transaction commit using batches of 10000, so is much more memory efficient
call apoc.periodic.commit("
MATCH (a:Spill) where a.IncidentDate is not null and  NOT (a)-[:DateOfIncident]->() 
WITH a limit {limit} 
WITH a,(toFloat(a.IncidentDate)/10000) as dateYear
WITH a, dateYear, ((dateYear-(toInt(dateYear))) * 100) as dateMonth
WITH a, dateYear, dateMonth, ((dateMonth-(toInt(dateMonth)))*100) as dateDay
WITH a, toInt(dateYear) as dateYear, toInt(dateMonth) as dateMonth,round( dateDay) as dateDay

MATCH (y:Year {year:dateYear}),
    (y)-[:HasMonth]->(m:Month {month:dateMonth}),
    (m)-[:HasDay]->(d:Day {day:dateDay})
MERGE (d)<-[:DateOfIncident]-(a)
return count(*)
",{limit:10000});