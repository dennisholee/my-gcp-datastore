var express = require('express')
var bodyParser = require('body-parser')

var environment = require('./environments')
var PropertiesReader = require('properties-reader')
var properties = new PropertiesReader(environment)

var port = properties.get('main.app.port')
var projectName = properties.get('gcp.projectName')

var app = express()
app.use(bodyParser.json())

app.get("/", (req, res) => {
  try {
    list(callback, (err, books, key) => {
	if(err) {
	  res.status(500).send(JSON.stringify(err))
	} else {
    	  res.status(200).send(JSON.stringify(books))
	}
    })
  } catch(err) {
    res.status(503).send(JSON.stringify(err))
  }
})

app.post("/create", (req, res) => {
  try {
    create(req.body, (err, apiResponse) => {
      console.log(`err: ${JSON.stringify(err)}`)
      res.status(200).send(JSON.stringify(apiResponse))
    })
  } catch(err) {
    res.status(503).send(JSON.stringify(err))
  }
})

console.log(`ProjectName: ${projectName}`)

app.listen(port, () => { console.log(`Listening on port ${port}`) })


var gdatastore = require('@google-cloud/datastore');

var datastore = gdatastore({
  projectId: projectName,
})

const create = (book, callback) => {
  var entity = {
      key: datastore.key('Book'),
      data: {
        title: book.title,
        author: book.author
      }
  }

  console.log(`entity: ${JSON.stringify(entity)}`)
  datastore.save(entity, callback);
}

const list = callback => {
  var query = datastore.createQuery(['Book']);
  datastore.runQuery(query, (err, books) => callback(err, books, datastore.KEY));

  callback()
}
