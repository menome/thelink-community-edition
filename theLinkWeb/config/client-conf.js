/* Information for displaying any and all nodes.
 *
 * icon: The Font Awesome Icon name of the node
 * text: The name of the node, in plural form.
 * api: The api endpoint that gets the node type. eg. 'people' would query '/api/people'
 * getDisplayName(card): A function that takes a card of the given node type as a parameter,
 *                       and returns the title of that card. If omitted, will default to card.Name
 * getDisplaySummary(card): As above, but for the card's summary text. Defaults to the card's type.
 * canDelete: A boolean telling us if contributors are allowed to delete these cards.
 */

// Wraps display pairs in an object for easy display.
// Include URL if it should be a hyperlink
// Include card = true if you want it to be shown on the item's card
var displayPairWrapper = function (name, val, onCard, url, newtab) {
  var retobj = {
    displayName: name,
    displayVal: val,
    onCard: false,
    newtab: false,
  };
  if (typeof url !== 'undefined') retobj.url = url;
  if (typeof onCard !== 'undefined') retobj.onCard = onCard;
  if (typeof newtab !== 'undefined') retobj.newtab = newtab;
  return retobj;
};

var feedbackInfo = {
  email: 'hello@menome.com',
  subject: 'Feedback for theLink',
};

var nodeTypes = {
  Generic: {
    icon: "circle",
    text: "Generic Nodes"
  },

// HNI Community Edition List  
  Agent: {
    icon: "eye",
    text: "Agent",
    api: "agents",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
      ];
      return retObj;
    }
  },
    Edct: {
    icon: "check-square-o",
    text: "Edct",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
      getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Description', card.Description, true),
      ];
      if (card.extended) {
        
      }
      return retObj;
     }
    },
    Expertise: {
      icon: "university",
      text: "Expertise",
      api: "expertise",
      getDisplayName: function (card) {
        return card.Name;
      }
    },
    Facility: {
    icon: "industry",
    text: "Facility",
    api: "facilities",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
  getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Code', card.Code, true),
        displayPairWrapper('LSD', card.LSD, true),
      ];
      if (card.extended) {
         retObj.push(displayPairWrapper('Edct', card.extended.HasEdct, true));
         retObj.push(displayPairWrapper('Operator', card.extended.HasOperator, true));
      }
      return retObj;
    }
  },
  Field: {
    icon: "sliders",
    text: "Field",
    api: "fields",
    getDisplayName: function (card) {
      return  card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
       displayPairWrapper('Field Center', card.FieldCenter, true),
       displayPairWrapper('Code', card.Code, true),
      ];
      return retObj;
    }
  },
  FailureType: {
    icon: "frown-o",
    text: "Failure Type",
    api: "fields",
    getDisplayName: function (card) {
      return  card.Name;
    },
    getDisplaySummary: function (card) {
      return "";
    }
  },
  FieldCenter: {
    icon: "map-pin",
    text: "Fields",
    api: "fieldcenters",
    getDisplayName: function (card) {
      return  card.Name;
    },
    getDisplaySummary: function (card) {
      return "";
    }
  },
  IncidentType: {
    icon: "tag",
    text: "Incident Type",
    api: "IncdientTypes",
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Name', card.Name, false),
      ];
      if (card.extended) {
       
      }
      return retObj;
    }
  },
  Hni: {
    icon: "exclamation",
    text: "Hazard Identification",
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Status', card.Status, false),

      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('Person', card.extended.IsRelevantTo, true));
      }
      return retObj;
    }
  },
  License: {
    icon: "gavel",
    text: "License",
    api: "licenses",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Published', card.LicenseDate, true),
      ];
       if (card.extended) {
        retObj.push(displayPairWrapper('License Status', card.extended.HasStatus, true));
        retObj.push(displayPairWrapper('Well', card.extended.HasLicense, true));
        retObj.push(displayPairWrapper('Licensed To', card.extended.LicensedTo, true));
      }
      return retObj;
    }
  },
  Licensee: {
    icon: "certificate",
    text: "Licensee",
    api: "licensees",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Address;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Abbreviation', card.Abbreviation, true),
      ];
     
      return retObj;
    }
  },
  LicenseStatus: {
    icon: "gavel",
    text: "LicenseStatus",
    api: "licenseStatuses",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
 
      ];
      return retObj;
    }
  },
  Operator: {
    icon: "file",
    text: "Operator",
    api: "operators",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Published', card.DatePublished, true),
      ];
      return retObj;
    }
  },
Person: {
    icon: "user",
    text: "People",
    api: "people",
    getDisplayName: function (card) {
      return card.FirstName + ' ' + card.LastName;
    },
    getDisplaySummary: function (card) {
      return card.Title;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Email', card.Email, true, "mailto://" + card.Email, false),
        displayPairWrapper('Phone', card.Phone, true, "tel:" + card.Phone, false),
        displayPairWrapper('Status', card.Status, true),
        displayPairWrapper('Percentage of hours worked with', card.Percent, true),
        displayPairWrapper('Hours worked on project', card.HoursWorked, true),
      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('Team', card.extended.MemberOfTeam, true));
        retObj.push(displayPairWrapper('Degree', card.extended.HasEducationIn, true));
      }
      return retObj;
    }
  },
 Pool: {
    icon: "angle-up",
    text: "Pool",
    api: "pools",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Published', card.DatePublished, true),
      ];
      return retObj;
    }
  },
 Project: {
    icon: "list-ol",
    text: "Projects",
    api: "projects",
    getDisplayName: function (card) {
      return card.Code + ":" + card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Status', card.Status, true),
        displayPairWrapper('Start Date', card.StartDate, false),
        displayPairWrapper('End Date', card.EndDate, false),
        displayPairWrapper('Cost', card.Cost, true),
        displayPairWrapper('Location', card.City, true),
        displayPairWrapper('Description', card.Description, false),
        displayPairWrapper('Hours worked on project', card.HoursWorked, true),
      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('Client', card.extended.IsFor, true));
      }
      return retObj;
    }
  },
 Well: {
    icon: "tint",
    text: "Well",
    api: "wells",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      if(card.LicenseeName)
              return 'Well licensed to: ' + card.LicenseeName;
        else
          return card.Uwi;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('LSD', card.LSD, true),
        displayPairWrapper('Total Depth', card.TotalDepth, true),
        displayPairWrapper('Start Date', card.WellStat, true),
        displayPairWrapper('Drilling Finish Date', card.FDDate, true),
        displayPairWrapper('Keylist', card.Keylist, true),
      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('License', card.extended.HasLicense, true));
      }
      return retObj;
    }
  },
  Site: {
    icon: "map-marker",
    text: "Work Sites",
    api: "sites",
    getDisplayName: function (card) {
      return card.Code
    },
    getDisplaySummary: function (card) {
      return card.Name;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('LSD', card.LSD, true),
        displayPairWrapper('Address', card.Address, true),
      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('Project', card.extended.IsAt, true));
      }
      return retObj;
    }
  },
  SubstanceReleased: {
    icon: "map-marker",
    text: "Substance Released",
    api: "substancedreleases",
    getDisplayName: function (card) {
      return card.Code
    },
    getDisplaySummary: function (card) {
      return card.Name;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Volume Released', card.VolumeReleased + ' ' + card.Units, true),
        displayPairWrapper('Volume Recovered', card.VolumeRecovered + ' ' + card.Units, true),
        displayPairWrapper('Volume Recovered', card.VolumeRecovered + ' ' + card.Units, true),
      ];
      if (card.extended) {
        
      }
      return retObj;
    }
  },
  Spill: {
    icon: "sun-o",
    text: "Spill Incidents",
    api: "spills",
    getDisplayName: function (card) {
      return "Spill Incident Code: " + card.Code;
    },
    getDisplaySummary: function (card) {
      return card.Name;
    },
    getDisplayPairs: function (card) {
      var retObj = [
        displayPairWrapper('Fatality Count', card.FatalityCound, true),
        displayPairWrapper('Incident Completed Date', card.IncidentCompleteDate, true),
        displayPairWrapper('Sensive Area', card.SensitveArea, true),
        displayPairWrapper('Incident Date', card.NoIncidentDate, true),
        displayPairWrapper('Wildlife Livestock Affected', card.WildlifeLivestockAffected, true),
        displayPairWrapper('Environment Affected', card.EnvironmentAffected, true),
        displayPairWrapper('Source', card.Source, true),
        displayPairWrapper('Release Offsite', card.ReleaseOffsite, true),
        displayPairWrapper('Injury Count', card.InjuryCount, true),
        displayPairWrapper('Strike Area', card.StrikeArea, false),
        displayPairWrapper('Strike Area', card.StrikeArea, false), 
        displayPairWrapper('Release CleanupDate', card.ReleaseCleanupDate, false), 
        displayPairWrapper('LSD', card.LSD, false), 
      ];
      if (card.extended) {
        retObj.push(displayPairWrapper('Licensee', card.extended.LicensedTo, true));
        retObj.push(displayPairWrapper('Substance Released', card.extended.ReleasedSubstance, true));
        retObj.push(displayPairWrapper('Incident Type', card.extended.IncidentTypeOf, false));
        retObj.push(displayPairWrapper('Field Center', card.extended.IsInFieldCenter, false));
      }
      return retObj;
    }
  },
  SubType: {
    icon: "tags",
    text: "SubTypes",
    api: "subtypes",
     getDisplayName: function (card) {
      return card.Code
    },
    getDisplaySummary: function (card) {
      return card.Name;
    },
  },
  Task: {
    icon: "check-square-o",
    text: "Tasks",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
  },
  Help: {
    icon: "question-circle-o",
    text: "Help",
    getDisplayName: function (card) {
      return card.Name;
    },
    getDisplaySummary: function (card) {
      return card.Summary;
    },
  },
  City: {
    icon: "map-signs",
    text: "City",
    api: "cities"
  },
  Region: {
    icon: "map-signs",
    text: "Region",
    api: "regions"
  },
  Country: {
    icon: "map-signs",
    text: "Country",
    api: "countries"
  },
  Topic: {
    icon: "tags",
    text: "Topics",
    api: "topics"
  },
    
};