const { MongoClient } = require('mongodb');
const copydb = require('../index');
const should = require('should');
const Promise = require('bluebird');

const url = 'mongodb://localhost:27017';
const prefix = 'copydb-test-'
let client, fromDb, toDb;

let docs1 = [
  { field1a1: 'value1a1', field1a2: 123 },
  { field1b1: 'value1b1'},
  { field1c1: 456 }
];
let docs2 = [
  { field2a1: 'value2a1', field2a2: 321 },
  { field2b1: 654, field2b2: [ 10, 20, 30] },
  { field2c1: 'value2c1'},
];
let docs3 = [
  { field3a1: 'value3a1', field1a2: 234 },
  { field3b1: 'value3b1'},
  { field3c1: 567 }
];
let dbcols = {
  dbcol1: docs1,
  dbcol2: docs2,
  dbcol3: docs3
};

async function createTestDb(name, username, password) {
  let db = client.db(name);
  await db.dropDatabase();
  if (username) {
    try {
      await db.removeUser(username);
    } catch(err) {
      // Ignore error if user doesn't exist
    }
    await db.addUser(username, password, {
      roles: [ { role: 'read', db: name }]
    });
  }
  await Promise.map(Object.entries(dbcols), async dbcol => {
    let [name, data] = dbcol;
    await db.collection(name).insertMany(data);
  });
}

async function verifyDb(db) {
  let list = await db.listCollections({}, {nameOnly: true}).toArray();
  list.length.should.equal(Object.keys(dbcols).length);
  await Promise.map(list, async col => {
    let data = await db.collection(col.name).find().toArray();
    data.should.eql(dbcols[col.name]);
  });
}

describe("copydb", () => {

  before(async () => {
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let db = client.db(prefix);
    let admin = db.admin({nameOnly: true});
    let list = (await admin.listDatabases()).databases;
    let regex = RegExp(`^${prefix}\\d*$`);

    // Remove any lingering copydb databases used for testing purposes
    // WARNING: will remove any database with name matching pattern {prefix}{number}
    await Promise.map(list, db => {
      if (regex.test(db.name)) {
        return client.db(db.name).dropDatabase();
      }
    });

    let dbnr;
    for (dbnr = 1; list.findIndex(db => db.name === prefix + dbnr) >= 0; dbnr++ ) {}
    fromDb = prefix + dbnr;
    for (dbnr++; list.findIndex(db => db.name === prefix + dbnr) >= 0; dbnr++ ) {}
    toDb = prefix + dbnr;
  });

  it ('should create identical copy of a database without a user', async () => {
    await createTestDb(fromDb);
    await copydb(fromDb, toDb, { username: 'eric', password: 'test' });
    let db = client.db(toDb);
    await verifyDb(db);
  });

  it ('should create identical copy of a database with a user', async () => {
    await createTestDb(fromDb, 'testuser', 'testpwd' );
    await copydb(fromDb, toDb, { username: 'testuser', password: 'testpwd' });
    let db = client.db(toDb);
    await verifyDb(db);
  });

  it ('should reject creating copy when password is missing', async() => {
    await createTestDb(fromDb, 'testuser', 'testpwd' );
    should(() => copydb(fromDb, toDb, { username: 'testuser' })).throw('Username requires a password');
  });

  it ('should reject creating copy when username is missing', async() => {
    await createTestDb(fromDb, 'testuser', 'testpwd' );
    should(() => copydb(fromDb, toDb, { password: 'testpwd' })).throw('Password requires a username');
  });

  afterEach(async () => {
    await client.db(fromDb).dropDatabase();
    await client.db(toDb).dropDatabase();
  });

  after(() => {
    client.close();
  });

});

