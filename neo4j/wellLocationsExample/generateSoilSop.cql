
// clear Task tree
MATCH (n:Trail) OPTIONAL MATCH (n)-[r]-() WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;

// clear Task tree
MATCH (n:Task) OPTIONAL MATCH (n)-[r]-() WITH n,r
DELETE n,r
RETURN count(n) as deletedNodesCount;

CREATE (h:Trail {
    Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'Manual Soil Sampling Methods',
    Summary: 'These methods are used primarily to collect surface and shallow subsurface soil samples.
Surface soils are generally classified as soils between the ground surface and 6 to 12 inches
below ground surface',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Manual Soil Sampling Methods'
});

CREATE (h:Task {
    Uuid: '72d26e98-e4ff-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'General',
    Summary: 'These methods are used primarily to collect surface and shallow subsurface soil samples.
Surface soils are generally classified as soils between the ground surface and 6 to 12 inches
below ground surface',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'General',
   
MarkdownContent:
'# General
These methods are used primarily to collect surface and shallow subsurface soil samples.
Surface soils are generally classified as soils between the ground surface and 6 to 12 inches
below ground surface. The most common interval is 0 to 6 inches; however, the data
quality objectives of the investigation may dictate another interval, such as 0 to 3 inches
for risk assessment purposes. The shallow subsurface interval may be considered to extend
from approximately 12 inches below ground surface to a site-specific depth at which
sample collection using manual collection methods becomes impractical.

If a thick, matted root zone, gravel, concrete, etc. is present at or near the surface, it should
be removed before the sample is collected. The depth measurement for the sample begins
at the top of the soil horizon, immediately following any removed materials.

When compositing, make sure that each composite location (aliquot) consist of equal
volumes, i.e., same number of equal spoonfuls.
'
});

CREATE (h:Task {
    Uuid: '72d2703c-e4ff-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'Spoons',
    Summary: 'Stainless steel spoons may be used for surface soil sampling to depths of approximately 6
inches below ground surface where conditions are generally soft and non-indurated, and
there is no problematic vegetative layer to penetrate.',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Spoons',
   
MarkdownContent:
'# Spoons
Stainless steel spoons may be used for surface soil sampling to depths of approximately 6
inches below ground surface where conditions are generally soft and non-indurated, and
there is no problematic vegetative layer to penetrate.

#### 4.2.1 Special Considerations When Using Spoons
* When using stainless steel spoons, consideration must be given to the
procedure used to collect the volatile organic compound sample. If the
soil being sampled is cohesive and holds its in situ texture in the spoon,
the En Core® Sampler or syringe used to collect the sub-sample for
Method 5035 should be plugged directly from the spoon. If, however,
the soil is not cohesive and crumbles when removed from the ground
surface for sampling, consideration should be given to plugging the
sample for Method 5035 directly from the ground surface at a depth
appropriate for the investigation Data Quality Objectives.
'
});

CREATE (h:Task {
    Uuid: '72d2719a-e4ff-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'Hand Augers',
    Summary: 'Hand augers may be used to advance boreholes and collect soil samples in the surface and
shallow subsurface intervals. Typically, 4-inch stainless steel auger buckets with cutting
heads are used. The bucket is advanced by simultaneously pushing and turning using an
attached handle with extensions (if needed).',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Hand Augers',
   
MarkdownContent:
'## Hand Augers
Hand augers may be used to advance boreholes and collect soil samples in the surface and
shallow subsurface intervals. Typically, 4-inch stainless steel auger buckets with cutting
heads are used. The bucket is advanced by simultaneously pushing and turning using an
attached handle with extensions (if needed).

### 4.3.1 Surface Soil Sampling
When conducting surface soil sampling with hand augers, the auger buckets may
be used with a handle alone or with a handle and extensions. The bucket is
advanced to the appropriate depth and the contents are transferred to the
homogenization container for processing. Observe precautions for volatile organic
compound sample collection found in Section 3, Method 5035.

### 4.3.2 Subsurface Soil Sampling

Hand augers are the most common equipment used to collect shallow subsurface
soil samples. Auger holes are advanced one bucket at a time until the sample depth
is achieved. When the sample depth is reached, the bucket used to advance the hole
is removed and a clean bucket is attached. The clean auger bucket is then placed
in the hole and filled with soil to make up the sample and removed.

The practical depth of investigation using a hand auger depends upon the soil
properties and depth of investigation. In sand, augering is usually easily performed,
but the depth of collection is limited to the depth at which the sand begins to flow
or collapse. Hand augers may also be of limited use in tight clays or cemented
sands. In these soil types, the greater the depth attempted, the more difficult it is to
recover a sample due to increased friction and torqueing of the hand auger
extensions. At some point these problems become so severe that power equipment
must be used.

### 4.3.3 Special Considerations for Soil Sampling with the Hand Auger
* Because of the tendency for the auger bucket to scrape material from
the sides of the auger hole while being extracted, the top several inches
of soil in the auger bucket should be discarded prior to placing the
bucket contents in the homogenization container for processing.
* Observe precautions for volatile organic compound (VOC) sample
collection found in Section 3, Method 5035. Collect the VOC sample
directly from the auger bucket, if possible.

* Power augers, such as the Little Beaver and drill rigs may be used to
advance boreholes to depths for subsurface soil sampling with the hand
auger. They may not be used for sample collection. When power augers
are used to advance a borehole to depth for sampling, care must be taken
that exhaust fumes, gasoline and/or oil do not contaminate the borehole
or area in the immediate vicinity of sampling.

* When moving to a new sampling location, the entire hand auger
assembly must be replaced with a properly decontaminated hand auger
assembly.
 '

});

CREATE (h:Task {
    Uuid: '72d27384-e4ff-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'Direct Push Soil Sampling Methods',
    Summary: 'These methods are used primarily to collect shallow and deep subsurface soil samples.
Three samplers are available for use within the Division’s direct push tooling inventory.
All of the sampling tools involve the collection and retrieval of the soil sample within a
thin-walled liner. The following sections describe each of the specific sampling methods
that can be accomplished using direct push techniques, along with details specific to each
method. While SESD currently uses the sample tooling described, tooling of similar design
and materials is acceptable.',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Direct Push Soil Sampling Methods',
   
MarkdownContent:'
#### Direct Push Soil Sampling Methods

These methods are used primarily to collect shallow and deep subsurface soil samples.
Three samplers are available for use within the Division’s direct push tooling inventory.
All of the sampling tools involve the collection and retrieval of the soil sample within a
thin-walled liner. The following sections describe each of the specific sampling methods
that can be accomplished using direct push techniques, along with details specific to each
method. While SESD currently uses the sample tooling described, tooling of similar design
and materials is acceptable.

These methods are used primarily to collect shallow and deep subsurface soil samples.
Three samplers are available for use within the Division’s direct push tooling inventory.
All of the sampling tools involve the collection and retrieval of the soil sample within a
thin-walled liner. The following sections describe each of the specific sampling methods
that can be accomplished using direct push techniques, along with details specific to each
method. While SESD currently uses the sample tooling described, tooling of similar design
and materials is acceptable.

If gravel, concrete, etc. is present at or near the surface, it should be removed before the
sample is collected. The depth measurement for the sample begins at the top of the soil
horizon, immediately following any removed materials. Turf grass is not typically removed
prior to sampling with these devices.
'
});

CREATE (h:Task {
    Uuid: '80aa321c-e504-11e6-bf01-fe55135034f3',
    DatePublished: '20170110',
    Name: 'Large Bore Soil Sampler',
    Summary: 'The Link Explorer Tools allow you to find cards linked to the currently selected card',
    ImageUrl: 'http://www.menome.com',
    Status: 'Active',
    TableOfContents: 'Large Bore Soil Sampler',
   
MarkdownContent:'
#### The Large Bore (LB) sampler is a solid barrel direct push sampler equipped with a pistonrod
point assembly used primarily for collection of depth-discrete subsurface soil samples.
The sample barrel is approximately 30-inches (762 mm) long and has a 1.5-inch (38 mm)
outside diameter. The LB® sampler is capable of recovering a discrete sample core 22
inches x 1.0 inch (559 mm x 25 mm) contained inside a removable liner. The resultant
sample volume is a maximum of 283 mL.

After the LB sample barrel is equipped with the cutting shoe and liner, the piston-rod
point assembly is inserted, along with the drive head and piston stop assembly. The
assembled sampler is driven to the desired sampling depth, at which time the piston stop
pin is removed, freeing the push point. The LB® sampler is then pushed into the soil a
distance equal to the length of the LB® sample barrel. The probe rod string, with the LB®
sampler attached, is then removed from the subsurface. After retrieval, the LB® sampler
is then removed from the probe rod string. The drive head is then removed to allow
removal of the liner and soil sample.

'
});

MATCH (a:Trail { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'})
MATCH (c:Task {Uuid: '72d26e98-e4ff-11e6-bf01-fe55135034f3' })
CREATE (a)-[:LinksTo { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'}]->(c);

MATCH (a:Task { Uuid: '72d26e98-e4ff-11e6-bf01-fe55135034f3'})
MATCH (c:Task {Uuid: '72d2703c-e4ff-11e6-bf01-fe55135034f3' })
CREATE (a)-[:LinksTo { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'}]->(c);


MATCH (a:Task { Uuid: '72d2703c-e4ff-11e6-bf01-fe55135034f3'})
MATCH (c:Task {Uuid: '72d2719a-e4ff-11e6-bf01-fe55135034f3' })
CREATE (a)-[:LinksTo { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'}]->(c);

MATCH (a:Task { Uuid: '72d2719a-e4ff-11e6-bf01-fe55135034f3'})
MATCH (c:Task {Uuid: '72d27384-e4ff-11e6-bf01-fe55135034f3' })
CREATE (a)-[:LinksTo { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'}]->(c);

MATCH (a:Task { Uuid: '72d27384-e4ff-11e6-bf01-fe55135034f3'})
MATCH (c:Task {Uuid: '80aa321c-e504-11e6-bf01-fe55135034f3' })
CREATE (a)-[:LinksTo { Uuid: '72d26b96-e4ff-11e6-bf01-fe55135034f3'}]->(c);


CALL apoc.index.addAllNodes('Sop',{ Trail: ["Name"], Task: ["Name", "Summary","MarkdownContent"] }); 
