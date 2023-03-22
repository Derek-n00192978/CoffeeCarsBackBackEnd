var express = require('express'),http = require('http'), util = require('util'), crypto = require('crypto');
var S3Client =  require('../lib/S3Client');
var app = express();


app.configure(function() {
	app.set('port', process.env.PORT || 5000);
	app.use(express.bodyParser());
});

app.get('/', function(req, res){
	  res.send('Go to : <br/> <a href="/upload">Upload through Heroku</a><br/> <a href="/direct_upload">Direct upload from client</a><br/> <a href="/upload_stream">or stream upload through Heroku</a>');
	});


app.get('/upload', function(req, res){
	  res.send('<form method="post" enctype="multipart/form-data" id="uploadform" class="fileform">'
				 +'<p>File: <input type="file" name="image" id="fileinput" ></p>'
				 +'<p>Resource: <input type="text" name="resource" id="resource" ></p>'
				 +'<p><input type="submit" value="Upload"></p></form>');
	});
app.get('/uploadText', function(req, res){
	  res.send('<form method="post" id="uploadform" class="fileform">'
				 +'<p>Resource: <input type="text" name="resource" id="resource" ></p>'
				 +'<p>text for upload: <input type="text" name="text" id="text" ></p>'
				 +'<p><input type="submit" value="Upload"></p></form>');
	});
var secret = process.env.AWSSecretAccessKey;
var keyId = process.env.AWSAccessKeyId;
var bucket = process.env.AWSBucket;
var options = {
		'key' : keyId,
		'secret' : secret,
		'bucket' : bucket,
		'createmd5' : 'true'
};

var client = new S3Client(options);


app.post('/uploadtext', function(req, res, next){
	client.putText(req.body['text'],'test/'+req.body['resource'],  function(err,resp){
		if(resp){
		console.log('RESP FROM S3');
		if(resp.statusCode=== 200){
			res.send('reource : '+ req.body['resource']+" successfully created on S3");
		}else{
			res.send('<p>S3 returned status code : '+resp.statusCode+'</p>');
		}
		resp.on('data', function(chunk) {
			
			console.log('BODY: ' + chunk);
		});
		}else{
			console.log ('ERR: '+err);
		}
		
	});
		
});
app.post('/upload', function(req, res, next){
	
	console.log(util.inspect(req.files.image));

	var file = req.files.image;
	client.put(file.path,'test/'+file.name, file.type, file.size, function(err,resp){
		if(resp){
		console.log('RESP FROM S3');
		if(resp.statusCode=== 200){
			res.send('File : '+ file.name+" successfully sent to S3");
		}else{
			res.send('<p>S3 returned status code : '+resp.statusCode+'</p>');
		}
		resp.on('data', function(chunk) {
			
			console.log('BODY: ' + chunk);
		});
		}else{
			console.log ('ERR: '+err);
		}
		
	});
		
});
app.get('/s3', function(req,res){
	res.send('<form method="post" id="form" class="form">'
			 +'<p>query: <input type="text" name="query" id="query" /></p>'
			 +'<p><input type="submit" value="Submit"></p></form>');
});

app.post('/s3', function(req,res){
	var s3resp = '';
	client.get(req.body['query'],function(err,resp){
		console.log('RESP FROM S3');
		if(resp){
			if(resp.statusCode=== 200){
				res.set('Content-Type', 'text/xml');
			}else{
				res.send('<p>S3 returned status code : '+resp.statusCode+'</p>');
			}
			resp.on('data', function(chunk) {
				console.log('BODY: ' + chunk);
				//res.send(chunk);
				s3resp+=chunk;
			});
			resp.on('end', function(){
				res.send(s3resp);
			});
		}else{
			console.log(err);
		}
	});
});
app.get('/s3delete', function(req,res){
	res.send('<form method="post" id="form" class="form">'
			 +'<p>query: <input type="text" name="file" id="file" /></p>'
			 +'<p><input type="submit" value="Delete"></p></form>');
});

app.post('/s3delete', function(req,res){
	client.del(req.body['file'],function(err,resp){
		console.log('RESP FROM S3');
		if(resp.statusCode=== 200){
			res.set('Content-Type', 'text/xml');
		}else{
			res.send('<p>S3 returned status code : '+resp.statusCode+'</p>');
		}
		resp.on('data', function(chunk) {
			console.log('BODY: ' + chunk);
			res.send(chunk);
		});
		
	});
});
app.get('/direct_upload', function(req,res,next){
	var bucket = process.env.AWSBucket;
	var key = process.env.AWSSecretAccessKey;
	var keyId = process.env.AWSAccessKeyId;
	var policy = {"expiration": "",	"conditions": [ {"bucket": bucket}, {"acl": "public-read-write"}, ["starts-with", "$Content-Type", "image/"],["starts-with", "$key",""], {"x-amz-meta-uuid": "14365123651274"}, ["starts-with", "$x-amz-meta-tag", ""] ] };
	policy.expiration = new Date(Date.now()+1000*60*15).format("UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"); // 15 minutes
	var base64Policy = new Buffer(JSON.stringify(policy)).toString('base64');
	var signature = crypto.createHmac('sha1', key).update(base64Policy).digest(
				'base64');
	
	var form = new Array();
	form.push(util.format('<form method="post" enctype="multipart/form-data" id="uploadform" action="http://%s.s3.amazonaws.com" class="fileform">',bucket));
	form.push('<p>Key to upload: <input type="input" name="key" value="${filename}"></p>');
	form.push('<input type="hidden" name="acl" value="public-read-write">');
	form.push('<input type="hidden" name="x-amz-meta-uuid" value="14365123651274">');
	form.push('<input type="hidden" name="Content-Type" value="image/jpeg">');
	form.push(util.format('<input type="hidden" name="AWSAccessKeyId" value="%s">',keyId));
	form.push(util.format('<input type="hidden" name="Policy" value="%s">',base64Policy));
	form.push(util.format('<input type="hidden" name="Signature" value="%s">',signature));
	form.push('<p>Tags for File: <input type="input" name="x-amz-meta-tag" value=""></p>');
	form.push('<p>File: <input type="file" name="file" id="fileinput" multiple="false"></p>'); // only one file per request allowed
	form.push('<p><input type="submit" value="submit" id="uploadBtn"></p>');
	form.push('</form>');
	res.send(form.join(''));
	
	
});
/***********************************************************************/

http.createServer(app).listen(
	app.get('port'),
	function() {
		console.log("Express server listening on port " + app.get('port'));
		console.log('Express server listening on port %d, environment: %s',
				app.get('port'), app.settings.env);
		
	});

