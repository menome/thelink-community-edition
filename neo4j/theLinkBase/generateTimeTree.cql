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


// connect articles to time tree:
MATCH (a:Article) where a.DatePublished is not null
WITH a, (toFloat(a.DatePublished)/10000) as dateYear
WITH a, dateYear, ((dateYear-(toInt(dateYear))) * 100) as dateMonth
WITH a, dateYear, dateMonth, ((dateMonth-(toInt(dateMonth)))*100) as dateDay
WITH a, toInt(dateYear) as dateYear, toInt(dateMonth) as dateMonth,round( dateDay) as dateDay

MATCH (y:Year {year:dateYear}),
    (y)-[:HasMonth]->(m:Month {month:dateMonth}),
    (m)-[:HasDay]->(d:Day {day:dateDay})
MERGE (d)<-[:PublishedOn]-(a);

// connect projects to time tree:
MATCH (a:Project) where a.StartDate is not null
WITH a, (toFloat(a.StartDate)/10000) as dateYear
WITH a, dateYear, ((dateYear-(toInt(dateYear))) * 100) as dateMonth
WITH a, dateYear, dateMonth, ((dateMonth-(toInt(dateMonth)))*100) as dateDay
WITH a, toInt(dateYear) as dateYear, toInt(dateMonth) as dateMonth,round( dateDay) as dateDay

MATCH (y:Year {year:dateYear}),
    (y)-[:HasMonth]->(m:Month {month:dateMonth}),
    (m)-[:HasDay]->(d:Day {day:dateDay})
MERGE (d)<-[:StartedOn]-(a);
