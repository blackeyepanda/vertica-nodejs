'use strict'
var bluebird = require('bluebird')
var helper = require('../test-helper')
var vertica = helper.vertica

process.on('unhandledRejection', function (e) {
  console.error(e, e.stack)
  process.exit(1)
})

const suite = new helper.Suite()

suite.test('promise API', (cb) => {
  const pool = new vertica.Pool()
  pool.connect().then((client) => {
    client
      .query('SELECT ?::varchar as name', ['foo'])
      .then(function (result) {
        assert.equal(result.rows[0].name, 'foo')
        return client
      })
      .then(function (client) {
        client.query('ALKJSDF').catch(function (e) {
          assert(e instanceof Error)
          client.query('SELECT 1 as num').then(function (result) {
            assert.equal(result.rows[0].num, 1)
            client.release()
            pool.end(cb)
          })
        })
      })
  })
})

// Disabling test for now since async functions always return default Promises.
// May remove later, since we might not want to support this use case.
/*
suite.test('promise API with configurable promise type', (cb) => {
  const client = new vertica.Client({ Promise: bluebird })
  const connectPromise = client.connect()
  assert(connectPromise instanceof bluebird, 'Client connect() returns configured promise')

  connectPromise
    .then(() => {
      const queryPromise = client.query('SELECT 1')
      assert(queryPromise instanceof bluebird, 'Client query() returns configured promise')

      return queryPromise.then(() => {
        client.end(cb)
      })
    })
    .catch((error) => {
      process.nextTick(() => {
        throw error
      })
    })
})
*/
