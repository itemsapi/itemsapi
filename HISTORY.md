# ItemsAPI Changelog

Jul 12 
- aggregation endpoint with pagination
- logging levels 

Jun 24
- fix search query (search response with 400 if query contain the /, &)

Jun 17
- generate aggregation number ranges

Jun 14
- mongodb additional storage for collections

Jun 1
- Array detection in data (for generating conf)

May 31
- generating configuration out of the box

May 15
- Simple collection validation i.e. check if unique

May 14
- enabled field - alpha version
- listing facets with values (rest endpoint)
- routes and controllers refactoring

May 12
- fix error with finding one item

May 3
- ignore non elasticsearch properties when adding mapping 

May 2
- improved sorting configuration

Apr 26
- pretty url slug for filters (optional with redis)
- update redis version

Apr 10
- aggregation response as ordered array

Apr 5
- native elasticsearch search requests (POST _search)

Mar 15
- elasticsearch async refactoring (uses bluebird)

Mar 14
- reindexing collection on fly (mapping and index)

Mar 13
- make elastic config compatible with elasticsearch package (like in official documentation)
- collection configuration refactoring - first step of abandon `project` and use `index` and `type`
- fix update mapping issue

Feb 27
- itemsapi can be run as a package now (npm install itemsapi) 

Jan 31
- find one item by key -> value

Jan 30
- similar-items (collaborative filtering)

Jan 16
- elasticsearch mapping management 
- normalize item data from user - i.e. split strings for array when neccessary

Dec 31, 2015
- conjunctive facets (aggregation)

Dec 31, 2015
- integration with nodemon (auto restarter)

Dec 30, 2015
- Create circle.yml - circleci testing automation 

Dec 17, 2015
- removing pagination limits 

Dec 12, 2015
- remove unnecessary packages
- heroku integration 

Dec 7, 2015
- clear collection by CLI 

Dec 4, 2015
- show elasticsearch statistics by CLI
- adding and removing collections
- import type from elasticsarch to local collections database by CLI
- findCollectionAsync argument list refactoring 
- change hardcoded "project" to configuration option
- export collection data to file by CLI

Dec 1, 2015
- created getElasticSchema() besides getSchema() for compatibility with elastic > 2.0

Nov 30, 2015
- clean unused code
- sorting and aggregations (facets) by geolocation
- search results exporting

Nov 27, 2015
- make limiter optional

Nov 26, 2015
- Collections refactoring - working in async / promises way
- collections ready to work with redis, mongo and other storages

Nov 25, 2015
- Aggregation range i.e. years 1950-1960, 1960-1970 etc

Nov 24, 2015
- configuration refactoring (NODE_ENV supports)

Nov 23, 2015
- api routes refactoring - /api/item for /api/v1

Nov 16, 2015
- routing refactoring
- simplifying configs
- created limiter for limiting requests
- callbacks to promises

Oct 31, 2015
- collection statistics (count)

Oct 30, 2015
- introduced promises (bluebird)
- add items in bulk (better adding performance)

Oct 22, 2015
- added projects (hardcoded) and make many real tests
- updated elasticsearch package version

Sep 21, 2015
- supported aggregations (basic terms and numbers range)

Jun 19, 2015
- search items
- wrote search converter which returns (meta, pagination, data.items)
- supported nodemon

Jun 18 2015
- wrote command line interface for managing project 
- elasticsearch abstraction layer for managing documents (items) and mapping
- importing collections in cli
- improved intendations 

Jun 17 
- elasticsearch connection 
- elasticsearch abstraction layer for adding documents, indices and types

Jun 7, 2015 first commit

