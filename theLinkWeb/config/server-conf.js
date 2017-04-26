//List of all node types we can return.
var nodeTypeList = [
  "Task",
  "User",
  "AlphabetGroup",
  "Day",
  "Month",
  "Year",
  "City",
  "Region",
  "Country",
  "Trail",
  "Help",
  "Person",
  "Topic",
  "Article",
  "Report",
  "Expertise",
  // HNI Nodes
  "Agent",
  "Field",
  "License",
  "LicenseStatus",
  "Licensee",
  "Operator",
  "Pool",
  "Well",
  "Facility",
  "Edct",
  "Hni",
  "SubType",
  "FailureType",
  "FieldCenter",
  "IncidentType",
  "Spill",
  "SubstanceReleased",
];

//Relationship names for extended properties of nodes.
var extendedProperties = {
  Help: ["LinksTo"],
  Task: ["LinksTo"],
  Project: ["IsFor", "IsInDiscipline", "IsInOffice", "PartOf", "IsAt"],
  Person: ["LocatedInOffice", "WorksFor",  "IsAuthorOf", "ProjectManagerOf", "PartnerInChargeOf", "SalesLeadOf", "StartedOn", "WorkedOn", "IsInDiscipline", "HasEducationIn", "HasExpertiseIn"],
  Site: ["IsAt", "PartOf", "IsIn"],
  // HNI properties
  Agent: ["HasAgent"],
  Field: ["IsInField"],
  License: ["LicensedTo","HasStatus"],
  Licensee: ["LicensedTo"],
  Operator: ["HasOperator"],
  Pool: ["IsInPool"],
  Well: ["HasLicense","IsInField"],
  Facility: ["HasOperator","HasEdct","IsSubType"],
  Edct: ["HasEdct"],
  Hni: ["IsRelevantTo"],
  Spill: ["ReleasedSubstance","IsInFieldCenter","HasFailureType","IncidentTypeOf","LicensedTo"],
};

//Relationship names for dates of nodes.
var dateRels = {
  Project: "StartedOn",
  Article: "PublishedOn",

  // HNI
  License: "LicensedOn",
  Well: "FinishedDrillingOn",
  Hni: "DateReported",
  Spill: "DateOfIncident",
};

// Contains human readable strings for relationship names.
// In the future, this may be stored elsewhere.
// Attributes prefixed with f are when the relationship is going forward.
//                          r when the relationship is viewed in reverse.
// TODO: Get rid of all the "this {itemName}" stuff. It's a little ugly to read.
var knownRelationships = {
    IsInFieldCenter: {
    fSingName: "Field Center this {itemName} is located in",
    fPluralName: "Field Center this {itemName} are located in",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
  HasFailureType: {
    fSingName: "Failure Type for this {itemName} ",
    fPluralName: "Failure Types this {itemName} has",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    Spilled: {
    fSingName: "Spill incident for {itemName} ",
    fPluralName: "Spill incidents for {itemName} has",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
  IncidentTypeOf: {
    fSingName: "Type of incident for {itemName} ",
    fPluralName: "Type of incidents for {itemName} has",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    ReleasedSubstance: {
    fSingName: "Substance released by this {itemName} ",
    fPluralName: "Substance released by this {itemName} ",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    IsSubType: {
    fSingName: "sub type this {itemName} has",
    fPluralName: "sub type this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    ClassifiedAsTopic: {
    fSingName: "topic this {itemName} is categorized under",
    fPluralName: "topics this {itemName} is categorized under",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
  HasEducationIn: {
    fSingName: "qualification belonging to this {itemName}",
    fPluralName: "qualifications belonging to this {itemName}",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    IsAuthorOf: {
    fSingName: "item written by this {itemName}",
    fPluralName: "items written by this {itemName}",
    rSingName: "author for this {itemName}",
    rPluralName: "authors for this {itemName}"
  },
  ProjectManagerOf: {
    fSingName: "project this {itemName} is managing",
    fPluralName: "projects this {itemName} is managing",
    rSingName: "person managing this {itemName}",
    rPluralName: "people managing this {itemName}"
  },
  HasAgent: {
    fSingName: "Agent this {itemName} has",
    fPluralName: "Agents this {itemName} have",
    rSingName: "agent with this {itemName}",
    rPluralName: "agents with this {itemName}"
  },
    HasLicense: {
    fSingName: "A license this {itemName} has",
    fPluralName: "Licenses this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
  HasOperator: {
    fSingName: "An operator this {itemName} has",
    fPluralName: "Operators this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    HasStatus: {
    fSingName: "An status this {itemName} has",
    fPluralName: "Statuses this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
   IsInPool: {
    fSingName: "A pool this {itemName} has",
    fPluralName: "Pools this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
   IsInField: {
    fSingName: "A field this {itemName} has",
    fPluralName: "Fields this {itemName} have",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    LicensedTo: {
    fSingName: "This {itemName} is licensed to",
    fPluralName: "These {itemName} are licensed to",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    HasOperator: {
    fSingName: "This {itemName} is operated by",
    fPluralName: "These {itemName} are operated by",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
    HasEdct: {
    fSingName: "This {itemName} has this Edct",
    fPluralName: "These {itemName} have these Edct",
    rSingName: "item with this {itemName}",
    rPluralName: "items with this {itemName}"
  },
};

// A list of canned queries/questions
// Contains a readable name and an input item type.
// TODO: These might balloon in size. Might be client specific. Should maybe find another place for them.
var knownQuestions = {
  'getTrail': {
    'FriendlyName': 'Find trail?',
    'NodeType': 'Trail',
    'Query': 'MATCH path=(t:Trail)-[r:LinksTo* {Uuid: {NodeId}}]-(h:Help) where t.Uuid={NodeId} \
             WITH h, length(path) as PageNumber return h, PageNumber order by PageNumber ASC',
    'Dashboard': false
  },
    'getWellsForLicensee': {
    'FriendlyName': 'What wells does this licensee own?',
    'NodeType': 'Licensee',
    'Query': 'MATCH (l:Licensee)<-[:LicensedTo]-(li:License)<-[:HasLicense]-(w:Well) where l.Uuid={NodeId} return w, l.Name as LicenseeName',
    'Dashboard': false
  },
    'getWellsAndSpillsForLicensee': {
    'FriendlyName': 'What wells and spills are associated with this licensee?',
    'NodeType': 'Licensee',
    'Query': 'MATCH (l:Licensee)<-[:LicensedTo]-(li:License)<-[:HasLicense]-(w:Well) \
              WITH l,w \
              OPTIONAL MATCH (l)-[:Spilled]->(s:Spill)  where l.Uuid={NodeId} return w,s,l.Name as LicenseeName',
    'Dashboard': false
  },
  // Dashboard
    'wellsByStatus': {
    'FriendlyName': 'Get Wells By status?',
    'NodeType': 'Well',
    'Query': 'MATCH (w:Well)-[:HasLicense]->(l:License)-[:HasStatus]-(ls:LicenseStatus) WHERE toLower(ls.Name)=toLower({Label}) return w  order by w.Name desc limit 1000',
    'Dashboard': true
  },
    'wellsByYear': {
    'FriendlyName': 'Get Wells By status?',
    'NodeType': 'Well',
    'Query': 'MATCH (y:Year)-[:HasMonth]->(m:Month)-[:HasDay]->(d:Day)<-[:FinishedDrillingOn]-(a:Well) WHERE toLower(y.Year)=toLower({Label}) return w  order by w.Name desc limit 1000',
    'Dashboard': true
  },
    'facilitiesBySubType': {
    'FriendlyName': 'Get facilities By subtype?',
    'NodeType': 'Facility',
    'Query': 'MATCH (f:Facility)-[:IsSubType]->(s:SubType) WHERE toLower(s.Name)=toLower({Label}) return f  order by f.Name desc limit 1000',
    'Dashboard': true
  },

};

/////////////////////////////////////
// Content Endpoint Search Parameters

// Just so we don't have to re-define these repeatedly.
var generalParams = {
  name: {
    whereClause: "node.Name =~ {name}",
  },
  summary: {
    whereClause: "node.Summary =~ {summary}",
  },
  description: {
    whereClause: "node.Description =~ {description}",
  },
  address: {
    whereClause: "node.Address =~ {address}",
  },
  status: {
    whereClause: "node.Status =~ {status}",
  },
  code: {
    whereClause: "node.Code =~ {code}",
  },
  lsd: {
    whereClause: "node.LSD =~ {lsd}",
  },
  uwi: {
    whereClause: "node.Uwi =~ {uwi}",
  },
};

// For the action of query parameters.
var searchParams = {
  Person: {
    office: {
      matchClause: "(node)-[:LocatedInOffice]-(o:Office)",
      whereClause: "o.Name =~ {office}",
    },
    team: {
      matchClause: "(node)-[:MemberOfTeam]-(t:Team)",
      whereClause: "t.Name =~ {team}",
    },
    firstname: {
      whereClause: "node.FirstName =~ {firstname}",
    },
    lastname: {
      whereClause: "node.LastName =~ {lastname}",
    },
  },
    Spill: {
    substancereleased:{
      matchClause: "(node)-[:ReleasedSubstance]-(s:SubstanceReleased)",
      whereClause: "s.Name =~ {substancereleased}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
  },
  Well: {
    licensestatus:{
      matchClause: "(node)-[:HasLicense]-(l:License)-[:HasStatus]-(s:LicenseStatus)",
      whereClause: "s.Name =~ {licensestatus}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
    uwi: {
      whereClause: "node.Uwi =~ {uwi}",
    },
    keylist: {
      whereClause: "node.KeyList =~ {keylist}",
    },
    totaldepth: {
      whereClause: "node.TotalDepth =~ {totaldepth}",
    },
  },
   Facility: {
    edct:{
      matchClause: "(node)-[:HasEdct]-(s:Edct)",
      whereClause: "s.Name =~ {edct}",
    },
    subtype:{
      matchClause: "(node)-[:IsSubType]-(s:SubType)",
      whereClause: "s.Name =~ {subtype}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
  },
  Article: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  Certification: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  Company: {
    name: generalParams.name,
    address: generalParams.address,
  },
  Contact: {
    name: generalParams.name,
    address: generalParams.address,
  },
  Document: {
    name: generalParams.name,
  },
  Expertise: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  Office: {
    name: generalParams.name,
    address: generalParams.address,
  },
  Project: {
    name: generalParams.name,
    status: generalParams.status,
    description: generalParams.description,
    address: generalParams.address,
    code: generalParams.code,
  },
  Report: {
    name: generalParams.name,
  },
  Site: {
    name: generalParams.name,
    code: generalParams.code,
  },
  // HNI 
  Well: {
    name: generalParams.name,
    summary: generalParams.summary,
    uwi: generalParams.uwi,
    lsd: generalParams.lsd,
  },
  Facility: {
    name: generalParams.name,
    lsd: generalParams.lsd,
    code: generalParams.code,
  },
    Edct: {
    name: generalParams.name,
    lsd: generalParams.lsd,
  },
  SubType: {
    name: generalParams.name,
    code: generalParams.code,
  },
   Agent: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  Field: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  License: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  LicenseStaus: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
    Licensee: {
    name: generalParams.name,
    summary: generalParams.summary,
    address: generalParams.address,
    code: generalParams.code
  },
  Operator: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  Pool: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
    Spill: {
    name: generalParams.name,
    summary: generalParams.summary,
    lsd: generalParams.lsd,
  },
  FailureType: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  FieldCenter: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  IncidentType: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  SubstanceReleased: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
};


/////////////////////////////////////
// Content Endpoint Search Parameters

// Just so we don't have to re-define these repeatedly.
var generalParams = {
  name: {
    whereClause: "node.Name =~ {name}",
  },
  summary: {
    whereClause: "node.Summary =~ {summary}",
  },
  description: {
    whereClause: "node.Description =~ {description}",
  },
  address: {
    whereClause: "node.Address =~ {address}",
  },
  status: {
    whereClause: "node.Status =~ {status}",
  },
  code: {
    whereClause: "node.Code =~ {code}",
  },
  lsd: {
    whereClause: "node.LSD =~ {lsd}",
  },
  uwi: {
    whereClause: "node.Uwi =~ {uwi}",
  },
};

// For the action of query parameters.
var searchParams = {
  Person: {
    office: {
      matchClause: "(node)-[:LocatedInOffice]-(o:Office)",
      whereClause: "o.Name =~ {office}",
    },
    team: {
      matchClause: "(node)-[:MemberOfTeam]-(t:Team)",
      whereClause: "t.Name =~ {team}",
    },
    firstname: {
      whereClause: "node.FirstName =~ {firstname}",
    },
    lastname: {
      whereClause: "node.LastName =~ {lastname}",
    },
  },
  Well: {
    licensestatus:{
      matchClause: "(node)-[:HasLicense]-(l:License)-[:HasStatus]-(s:Status)",
      whereClause: "s.Name =~ {licensestatus}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
    uwi: {
      whereClause: "node.Uwi =~ {uwi}",
    },
    keylist: {
      whereClause: "node.KeyList =~ {keylist}",
    },
    totaldepth: {
      whereClause: "node.TotalDepth =~ {totaldepth}",
    },
  },
   Facility: {
    licensestatus:{
      matchClause: "(node)-[:HasEdct]-(s:edct)",
      whereClause: "s.Name =~ {edct}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
    uwi: {
      whereClause: "node.Uwi =~ {uwi}",
    },
    keylist: {
      whereClause: "node.KeyList =~ {keylist}",
    },
    totaldepth: {
      whereClause: "node.TotalDepth =~ {totaldepth}",
    },
    subtype:{
      matchClause: "(node)-[:IsSubType]-(s:SubType)",
      whereClause: "s.Name =~ {subtype}",
    },
  },
  Spill: {
    substancereleased:{
      matchClause: "(node)-[:ReleasedSubstance]-(s:SubstanceReleased)",
      whereClause: "s.Name =~ {substancereleased}",
    },
    lsd: {
      whereClause: "node.LSD =~ {lsd}",
    },
  },
  Agent: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Field: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Edct: {
    name: generalParams.name,
    code: generalParams.code,
  },
   SubType: {
    name: generalParams.name,
    code: generalParams.code,
  },
  License: {
    name: generalParams.name,
    code: generalParams.code,
  },
  LicenseStatus: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Licensee: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Operator: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Pool: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Facility: {
    name: generalParams.name,
    code: generalParams.code,
  },
  Well: {
    name: generalParams.name,
    code: generalParams.code,
    lsd: generalParams.lsd,
  },
   Spill: {
    name: generalParams.name,
    summary: generalParams.summary,
    lsd: generalParams.lsd,
  },
  FailureType: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  FieldCenter: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  IncidentType: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
  SubstanceReleased: {
    name: generalParams.name,
    summary: generalParams.summary,
  },
};


module.exports = {
  searchParams: searchParams,
  nodeTypes: nodeTypeList,
  extendedProperties: extendedProperties,
  relationships: knownRelationships,
  questions: knownQuestions,
  dateRels: dateRels,
  unpivotableNodes: [ //Nodes that we shouldn't be able to pivot to.
    "AlphabetGroup",
    "Day",
    "Month",
    "Year",
    "User",
    "Role",
    "Card"
  ],
};