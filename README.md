![npm](https://img.shields.io/npm/v/mongo-copydb)
[![Build Status](https://travis-ci.org/proswdev/mongo-copydb.svg?branch=master)](https://travis-ci.org/proswdev/mongo-copydb)
[![Coverage Status](https://coveralls.io/repos/github/proswdev/mongo-copydb/badge.svg)](https://coveralls.io/github/proswdev/mongo-copydb)
![NPM](https://img.shields.io/npm/l/mongo-copydb)
![npm](https://img.shields.io/npm/dw/mongo-copydb)
# mongo-copydb #

The copydb command has been deprecated as of mongoDB version 4.0 and no longer available in versions >= 4.2. This plugin is designed to help compensate for this change in behavior. It copies a mongodb database from one mongod instance to the same instance or another using node.js. 

## Installation ##

```
$ npm install mongo-copydb
```
## Requirements ##
The plugin depends on `mongodump` and `mongorestore` to perform the copy command. Make sure these utilities are installed and included in the search path. They are incuded in the normal mongDB installation package and should be readily available if mongoDB is installed and functioning properly. 

## Usage ##
```
copydb(fromdb, todb, options)

fromdb:       Name of source database
todb:         Name of target database
options: {
  fromhost:   Hostname of the source mongod instance.
              Default = localhost:27017
  tohost:     Hostname of the target mongod instance
              Default = localhost:27017
  username:   The name of the user on the fromhost MongoDB instance
              Default = <none>
  password:   The password on the fromhost for authentication
              Default = <none>
}
```
## Example ##
```javascript
const copydb = require('mongo-copydb');

async function Sample() {
  // Create copy on same default mongod instance
  await copydb('mysource', 'mytarget');

  // Create copy from default to other mongod instance
  await copydb('mysource', 'mytarget', {
    tohost: 'mytargethost:27200' 
  });

  // Create copy between two mongod instances with user creds
  // Note: username and password are both required
  await copydb('mysource', 'mytarget', {
    username: 'sourceuser',
    password: 'sourcepwd',
    fromhost: 'mysourcehost:27100',
    tohost: 'mytargethost:27200' 
  });
}
```
