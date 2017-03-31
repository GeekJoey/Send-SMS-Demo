'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var http        = require('http');
var JWT         = require('./lib/jwtDecoder');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
// var activityCreate   = require('./routes/activityCreate');
// var activityUpdate   = require('./routes/activityUpdate');
// var activityUtils    = require('./routes/activityUtils');
var pkgjson = require( './package.json' );

var app = express();

// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config


var APIKeys = {
    appId           : 'c82f95c5-28ec-4d14-aef7-cbf9889815d3',
    clientId        : 'a30pxv9men08w8q7xxnrvv5q',
    clientSecret    : 'ywJWBsQdoaIULNbS8ulbDjNP',
    appSignature    : 'eyfjiuq2zjdvv1njre32tw1fhgavds0ldusj05apawnflqcsk4gme5uhafka3pfmcodbsp3ex5bcckl03oditc4uf45ype2yvcl440c54zasgxe0whqvgzkquf3cit1vqfpj0boco4itdkruyl0wqkmxofhck5nxnp4omm3wfntwhhogorypccq3spzrpzya0i5fj1hrpvpvfkpwykj2fsygluu1x1tkzxyiwowagrc3ge3q0zjccoyozn5w4ha',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1'
};


// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});
    
    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );

    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
    req.session.token = jwtData.token;
    next();
}

// Use the cookie-based session  middleware
app.use(express.cookieParser());


// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', tokenFromJWT, routes.login );
app.post('/logout', routes.logout );

app.get('/clearList', function( req, res ) {
    // // The client makes this request to get the data
    // activityUtils.logExecuteData = [];
    // res.send( 200 );
});


// Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
    // // The client makes this request to get the data
    // if( !activityUtils.logExecuteData.length ) {
    //     res.send( 200, {data: null} );
    // } else {
    //     res.send( 200, {data: activityUtils.logExecuteData} );
    // }
});

app.get( '/version', function( req, res ) {
    res.setHeader( 'content-type', 'application/json' );
    res.send(200, JSON.stringify( {
        version: pkgjson.version
    } ) );
} );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});