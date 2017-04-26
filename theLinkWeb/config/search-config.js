/*
 * search-config.js
 * Copyright (C) 2016 Menome Technologies Inc
 *
 * Contains the configuration for search display in the UI
 * The Master branch config has all potential nodes and options available. 
 */

module.exports = {
  //These are the searches that are executed really without any parameters. Just a node type.

  simpleSearchList: ["LicenseStatus","Operator","Edct","SubType","FailureType"],

  //Big list of all the stuff the UI can search by via text params or selection menus
  searchList: [
    { //Facility
      name: "Facilities",
      nodeType: "Facility",
      api: "facility",
      dateSearchable: false,
      locationSearchable: false,
      simpleSearch: false,
      listChildren: [
         {name: "Edct", NodeType: "Edct", rel: "HasEdct"},
        // {name: "Sub Type", NodeType: "SubType", rel: "IsSubType"},
      ],
          textChildren: [
        {
          name: "name",
          displayName: "Facility Name"
        },
        {
          name: "code",
          displayName: "Code"
        },
        {
          name: "lsd",
          displayName: "LSD"
        },
      ]
    },
    
    { //Wells
      name: "Wells",
      nodeType: "Well",
      api: "wells",
      simpleSearch: false, //Makes it behave like a simpleSearch. (Just search by alphabet. No submenu. Defaults false.)
      dateSearchable: true,
       listChildren: [
       // {name: "License Status", NodeType: "LicenseStatus", rel: "HasStatus"},
      ],
      textChildren: [
        {
          name: "name",
          displayName: "Well Name"
        },
        {
          name: "uwi",
          displayName: "UWI"
        },
        {
          name: "lsd",
          displayName: "LSD"
        },
        {
          name: "licensestatus",
          displayName: "License Status"
        },
        {
          name: "keylist",
          displayName: "Keylist"
        },
      ]
    },
      { //Licensee
      name: "Licensees",
      nodeType: "Licensee",
      api: "licensees",
      dateSearchable: false,
      locationSearchable: false,
      simpleSearch: true,
      listChildren: [
        //{name: "City", NodeType: "City", rel: "bycity"},
      ],
          textChildren: [{
          name: "name",
          displayName: "Licensee Name"
        },
        {
          name: "code",
          displayName: "Code"
        },
        {
          name: "address",
          displayName: "Address"
        },
      ]
    },
    { //License
      name: "Licenses",
      nodeType: "License",
      api: "licenses",
      dateSearchable: true,
      locationSearchable: false,
      simpleSearch: false,
      listChildren: [
       // {name: "License Status", NodeType: "LicenseStatus", rel: "HasStatus"},
      ],
      textChildren: [{
        name: "name",
        displayName: "License Name"
      }, ]
    },
    { //Field
      name: "Fields",
      nodeType: "Field",
      api: "fields",
      dateSearchable: false,
      locationSearchable: false,
      simpleSearch: true,
      listChildren: [
       
      ],
      textChildren: [ 
        {
          name: "name",
          displayName: "Field Name"
        },
        {
          name: "code",
          displayName: "Field Code"
        },
         {
          name: "fieldcenter",
          displayName: "Field Center"
        },
         ]
    },
       { //Spill
      name: "Spills",
      nodeType: "Spill",
      api: "spills",
      dateSearchable: true,
      locationSearchable: false,
      simpleSearch: false,
      listChildren: [
       
      ],
      textChildren: [ 
        {
          name: "name",
          displayName: "Spill Name"
        },
        {
          name: "code",
          displayName: "Field Code"
        },
         {
          name: "lsd",
          displayName: "LSD"
         },
         {
          name: "fieldcenter",
          displayName: "Field Center"
        },
         ]
    },
  ]
};