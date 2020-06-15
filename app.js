/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

// Imports dependencies and set up http server
const express = require("express"),
  { urlencoded, json } = require("body-parser"),
  crypto = require("crypto"),
  path = require("path"),
  Receive = require("./services/receive"),
  Response = require("./services/response"),
  GraphAPi = require("./services/graph-api"),
  User = require("./services/user"),
  config = require("./services/config"),
  i18n = require("./i18n.config"),
  mySQL = require("mysql"),
  cron = require("cron").CronJob,
  create_job = require("./services/create_job"),
  auth = require("./services/auth"),
  app = express();

var users = {};

var db_username = process.env.DB_USERNAME
var db_password = process.env.DB_PASSWORD
var db_name = process.env.DB_NAME
var db_host = process.env.DB_HOST

var connection = mySQL.createConnection({
  host: db_host,
  user: db_username,
  database: db_name,
  password: db_password
});


connection.connect((err) => {
  if(err){
    console.log("Failed to connect to database", err);
    throw err;
  }
});


// Parse application/x-www-form-urlencoded
app.use(
  urlencoded({
    extended: true
  })
);


var job = new cron("0 0,30 * * * *", function() {
  console.log("running a task every 30 minutes");
  let time = new Date(Date.now());
  let hrs = time.getHours();
  let mins = time.getMinutes();
  if(mins < 30) mins = 0;
  else mins = 30;
  let alertTime = hrs + ':' + mins;
  let sqlQuery = `SELECT psid,alertString from alerts where time='${alertTime}'`;
  try{
    runSQLQuery(sqlQuery, function(response){
      let jsonResponses = JSON.parse(JSON.stringify(response));
      for(let resp of jsonResponses){
        console.log(resp);
        GraphAPi.callSendAPI({
          message : { text : "ohh hello my boy" },
          recipient : {
            id: resp.psid
          }
        });
      }
    });
  }
  catch(e){
    console.log(e.message);
  } 
  
});

job.start();

// Parse application/json. Verify that callback came from Facebook
app.use(json({ verify: verifyRequestSignature }));

// Serving static files in Express
app.use(express.static(path.join(path.resolve(), "public")));

// Set template engine in Express
app.set("view engine", "ejs");

// Respond with index file when a GET request is made to the homepage
app.get("/", function(_req, res) {
  res.render("index");
});

// Respond with index file when a GET request is made to the homepage
app.get("/google24c5d29bf30a1a2a.html", function(_req, res) {
  res.sendFile('google24c5d29bf30a1a2a.html', {
        root: __dirname
      });
});


// Serve the options path and set required headers
app.get('/create_job', (req, res, next) => {
    let data = {
      title:"dfbdf",
      descr:"desc",
      psid:"1234"
    };
    //create_job.runSample(data);
    let referer = req.get('Referer');
    let jobId = ""; let jobDescr = "";
    let jobTitle = ""; let pageId = "";
    let edit = 1; let pageName = "";

    if(req.query["jobId"]) jobId = req.query["jobId"];
    else edit = 0;
    if(req.query["title"]) jobTitle = req.query["title"];
    if(req.query["descr"]) jobDescr = req.query["descr"];
    if(req.query["page_id"]) pageId = req.query["page_id"];
    if(req.query["page_name"]) pageName = req.query["page_name"];
    
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
        }
        res.sendFile('public/create_job.html', {
          root: __dirname, 
          jobId: jobId, 
          jobTitle: jobTitle,
          jobDescr: jobDescr,
          pageId: pageId,
          pageName: pageName,
          edit: edit
        });
    }
});


// Serve the options path and set required headers
app.get('/show_jobs', (req, res, next) => {
  let referer = req.get('Referer');
  if (referer) {
      if (referer.indexOf('www.messenger.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
      } else if (referer.indexOf('www.facebook.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
      }
      //let sqlQuery = `SELECT * jobs (psid,title,descr) VALUES ('${body.psid}', '${body.title}', '${body.descr}')`;
      res.sendFile('public/show_jobs.html', {root: __dirname});
  }
});

// Serve the options path and set required headers
app.get('/get_jobs', (req, res, next) => {
  let psid = req.query["psid"];

  let sqlQuery = `SELECT * FROM jobs WHERE psid='${psid}' 
    OR title=(SELECT alertString from alerts where psid='${psid}')`;
    
  try{
    runSQLQuery(sqlQuery, function(response){
      return res.status(200).send(JSON.parse(JSON.stringify(response)));
    });
  }
  catch(e){
    let response = {}; 
    console.log(e.message);
    res.status(500).send(JSON.parse(JSON.stringify(response)));
  } 
});

app.get('/get_alerts', (req, res, next) => {
  let psid = req.query["psid"];
  let sqlQuery = `SELECT * FROM alerts WHERE psid='${psid}'`;
  try{
    runSQLQuery(sqlQuery, function(response){
      return res.status(200).send(JSON.parse(JSON.stringify(response)));
    });
  }
  catch(e){
    let response = {}; 
    console.log(e.message);
    res.status(500).send(JSON.parse(JSON.stringify(response)));
  } 
});


app.get('/create_alert', (req, res, next) => {
  let psid = req.query["psid"];
  let alertString = req.query["alertString"];

  let sqlQuery = `INSERT INTO alerts (psid, alertString) VALUES('${psid}', '${alertString}') ON DUPLICATE KEY UPDATE    
    alertString='${alertString}'`;

  try{
    runSQLQuery(sqlQuery, function(response){
      return res.status(200).send(JSON.parse(JSON.stringify(response)));
    });
  }
  catch(e){
    let response = {}; 
    console.log(e.message);
    res.status(500).send(JSON.parse(JSON.stringify(response)));
  } 
});

app.get('/delete_alert', (req, res, next) => {
  let psid = req.query["psid"];
  let alertString = req.query["alertString"];

  let sqlQuery = `DELETE FROM alerts WHERE psid = '${psid}' AND alertString = '${alertString}'`;

  try{
    runSQLQuery(sqlQuery, function(response){
      return res.status(200).send(JSON.parse(JSON.stringify(response)));
    });
  }
  catch(e){
    let response = {}; 
    console.log(e.message);
    res.status(500).send(JSON.parse(JSON.stringify(response)));
  } 
});

// Handle postback from webview
app.post('/create_job_postback', (req, res) => {
    let body = req.body;
    let responseText = "Failed to add a job. Error:";
    let page_name = body.page.split('_')[0];
    let page_id = body.page.split('_')[1];

    let sqlQuery = `INSERT INTO jobs (psid,title,descr,page_id,page_name) VALUES ('${body.psid}', '${body.title}', '${body.descr}', '${page_id}', '${page_name}')`;
    console.log(sqlQuery);

    try{
      
      runSQLQuery(sqlQuery,function(result){
        responseText = `Created a job posting with title as ${body.title}`;
        let response = {
          recipient: {
            id: body.psid
          },
          message : Response.genText(responseText)
        };

        res.status(200).send('Please close this window to return to the conversation thread.');
        GraphAPi.callSendAPI(response);
      
      });         
    }
    catch(e){
      console.log(e.message);
    } 
});



// Handle postback from webview
app.post('/delete_job_postback', (req, res) => {
    let body = req.body;
    let responseText = "Failed to delete a job";
    let sqlQuery = `DELETE FROM jobs WHERE psid='${body.psid}' AND id='${body.jobId}'`;
    console.log(sqlQuery);
    try{
      runSQLQuery(sqlQuery,function(result){
        responseText = `Deleted a job posting with id ${body.jobId}`;
        let response = {
          recipient: {
            id: body.psid
          },
          message : Response.genText(responseText)
        };

        res.status(200).send('Deleted job');
        GraphAPi.callSendAPI(response);
      });
    }
    catch(e){
      console.log(e.message);
      res.status(500).send(responseText);
    } 

});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === config.verifyToken) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    console.log("zvsdvsdvs1");
    res.status(200).send("EVENT_RECEIVED");

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      if ("changes" in entry) {
        // Handle Page Changes event
        let receiveMessage = new Receive();
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
              return receiveMessage.handlePrivateReply(
                "post_id",
                change.post_id
              );
              break;
            case "comment":
              return receiveMessage.handlePrivateReply(
                "commentgity _id",
                change.comment_id
              );
              break;
            default:
              console.log('Unsupported feed change type.');
              return;
          }
        }
      }

      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;

      if (!(senderPsid in users)) {
        let user = new User(senderPsid);

        GraphAPi.getUserProfile(senderPsid)
          .then(userProfile => {
            user.setProfile(userProfile);
          })
          .catch(error => {
            // The profile is unavailable
            console.log("Profile is unavailable:", error);
          })
          .finally(() => {
            users[senderPsid] = user;
            i18n.setLocale(user.locale);
            console.log(
              "New Profile PSID:",
              senderPsid,
              "with locale:",
              i18n.getLocale()
            );
            let receiveMessage = new Receive(users[senderPsid], webhookEvent);
            return receiveMessage.handleMessage();
          });
      } else {
        i18n.setLocale(users[senderPsid].locale);
        console.log(
          "Profile already exists PSID:",
          senderPsid,
          "with locale:",
          i18n.getLocale()
        );
        let receiveMessage = new Receive(users[senderPsid], webhookEvent);
        return receiveMessage.handleMessage();
      }
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Set up your App's Messenger Profile
app.get("/profile", (req, res) => {
  let token = req.query["verify_token"];
  let mode = req.query["mode"];

  if (!config.webhookUrl.startsWith("https://")) {
    res.status(200).send("ERROR - Need a proper API_URL in the .env file");
  }
  var Profile = require("./services/profile.js");
  Profile = new Profile();

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    if (token === config.verifyToken) {
      if (mode == "webhook" || mode == "all") {
        Profile.setWebhook();
        res.write(
          `<p>Set app ${config.appId} call to ${config.webhookUrl}</p>`
        );
      }
      if (mode == "profile" || mode == "all") {
        Profile.setThread();
        res.write(`<p>Set Messenger Profile of Page ${config.pageId}</p>`);
      }
      if (mode == "personas" || mode == "all") {
        Profile.setPersonas();
        res.write(`<p>Set Personas for ${config.appId}</p>`);
        res.write(
          "<p>To persist the personas, add the following variables \
          to your environment variables:</p>"
        );
        res.write("<ul>");
        res.write(`<li>PERSONA_BILLING = ${config.personaBilling.id}</li>`);
        res.write(`<li>PERSONA_CARE = ${config.personaCare.id}</li>`);
        res.write(`<li>PERSONA_ORDER = ${config.personaOrder.id}</li>`);
        res.write(`<li>PERSONA_SALES = ${config.personaSales.id}</li>`);
        res.write("</ul>");
      }
      if (mode == "nlp" || mode == "all") {
        GraphAPi.callNLPConfigsAPI();
        res.write(`<p>Enable Built-in NLP for Page ${config.pageId}</p>`);
      }
      if (mode == "domains" || mode == "all") {
        Profile.setWhitelistedDomains();
        res.write(`<p>Whitelisting domains: ${config.whitelistedDomains}</p>`);
      }
      if (mode == "private-reply") {
        Profile.setPageFeedWebhook();
        res.write(`<p>Set Page Feed Webhook for Private Replies.</p>`);
      }
      res.status(200).end();
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Returns a '404 Not Found' if mode or token are missing
    res.sendStatus(404);
  }
});


// Run SQL Query
function runSQLQuery(sqlQuery,callback){
  let results;
  connection.query(sqlQuery,function(err, result){
    if(err) {
      console.log(err.message);
      throw new Error("Failed to run query");
    }
    return callback(result);
  });
}

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.log("Couldn't validate the signature.");
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = crypto
      .createHmac("sha1", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

// Check if all environment variables are set
config.checkEnvVariables();

// listen for requests :)
var listener = app.listen(config.port, function() {
  console.log("Your app is listening on port " + listener.address().port);

  if (
    Object.keys(config.personas).length == 0 &&
    config.appUrl &&
    config.verifyToken
  ) {
    console.log(
      "Is this the first time running?\n" +
        "Make sure to set the both the Messenger profile, persona " +
        "and webhook by visiting:\n" +
        config.appUrl +
        "/profile?mode=all&verify_token=" +
        config.verifyToken
    );
  }

  if (config.pageId) {
    console.log("Test your app by messaging:");
    console.log("https://m.me/" + config.pageId);
  }
});
