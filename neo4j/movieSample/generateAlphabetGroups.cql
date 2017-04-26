
MATCH (n:AlphabetGroup) DELETE n;

//Each of these is a list of symbols that belong in a category.
WITH [['~'],
['#','1','2','3','4','5','6','7','8','9','0'],
['A','a'],
['B','b'],
['C','c'],
['D','d'],
['E','r'],
['F','f'],
['G','g'],
['H','h'],
['I','i'],
['J','j'],
['K','k'],
['L','l'],
['M','m'],
['N','n'],
['O','o'],
['P','p'],
['Q','q'],
['R','r'],
['S','s'],
['T','t'],
['U','u'],
['V','v'],
['W','w'],
['X','x'],
['Y','y'],
['Z','z']] as letters
FOREACH (letter in letters | CREATE (n:AlphabetGroup {Name: head(letter), Symbols: letter}));

MATCH (n) WHERE NOT (head(labels(n)) IN ['AlphabetGroup', 'Work', 'User', 'Role', 'Day', 'Month', 'Year'])
WITH n, (CASE WHEN n.Name IS NOT NULL THEN upper(left(n.Name,1))
              WHEN n.LastName IS NOT NULL THEN upper(left(n.LastName,1))
              ELSE '~' END) as letter
MATCH (ln:AlphabetGroup) WHERE letter in ln.Symbols
CREATE (n)-[:IsInAlphabetGroup]->(ln);

