#!/usr/bin/env node

//
// Detects triangles and quadrilaterals
//

// sourced from: https://github.com/peterbraden/node-opencv/tree/master/examples

var colors = require("colors"),
  Spacebrew = require('./sb-1.3.0').Spacebrew,
  sb,
  config = require("./machine"),
  fs = require("fs");


var files_location = "files/";
var filepath = "./" + files_location;
var hosted_path = "http://api.sitetosite.co/modules/file-server/" + files_location;


/**
*
* Spacebrew setup
*
**/
sb = new Spacebrew.Client( config.server, config.name, config.description );  // create spacebrew client object


// create the spacebrew subscription channels
//sb.addPublish("config", "string", "");  // publish config for handshake
//sb.addSubscribe("config", "boolean"); // subscription for config handshake


sb.addSubscribe("file input", "binary");  // subscription for receiving image binary

sb.addPublish("url", "string", "");   // publish source image


//sb.onBooleanMessage = onBooleanMessage; 
sb.onCustomMessage = onCustomMessage;
sb.onOpen = onOpen;

// connect to spacbrew
sb.connect();  

/**
 * Function that is called when Spacebrew connection is established
 */
function onOpen(){
  console.log( "Connected through Spacebrew as: " + sb.name() + "." );
}


function onCustomMessage( name, value, type ){

  switch(type){
    case "binary":
      if(name == "file input"){
        console.log('file buffer received');

        //var b64_buf = new Buffer(value, 'base64').toString('binary');
        //var buf = new Buffer(b64_buf, 'binary');

        var b64_buf_str = new Buffer(value, 'base64').toString('utf8');
        var json_buf = JSON.parse( b64_buf_str );
        console.log(json_buf.filename);

        var b64_bin_buf = new Buffer(json_buf.binary, 'base64').toString('binary');
        var buf = new Buffer(b64_bin_buf, 'binary');

        setTimeout(function(){
          var timestamp_filename = new Date().getTime() + ".png";
          var filename = filepath + timestamp_filename;

          //TODO: add check for if filepath directory exists, if not create it

          fs.writeFile(filename, buf, 'binary', function(err){
            console.log(filename + ' written');

            console.log('sending url: ' + hosted_path + timestamp_filename);

            sb.send("url", "string", hosted_path + timestamp_filename);

          });
        }, 2000);

          

        
      }
  }
}

/**
 * onStringMessage Function that is called whenever new spacebrew string messages are received.
 *          It accepts two parameters:
 * @param  {String} name    Holds name of the subscription feed channel
 * @param  {String} value   Holds value received from the subscription feed
 */
function onBooleanMessage( name, value ){

  console.log("[onBooleanMessage] value: " + value + " name: " + name);

  switch(name){
    case "config":
      console.log([
          // Timestamp
          String(+new Date()).grey,
          // Message
          String("sending config").cyan
        ].join(" "));

      sb.send("config", "string", JSON.stringify( config ) );
      break;
  }
}


  

