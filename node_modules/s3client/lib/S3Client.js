var http = require('http'), 
	util = require('util'),
	fs = require('fs'), 
	crypto = require('crypto'),
	S3Auth = require('./S3Auth');
	

var s3_hostname = 's3.amazonaws.com';


/**
 * Constructor for the S3Client
 * @api public
 * @param {opt} options object
 */
var S3Client = module.exports =exports = function S3Client(opt){
	this.options = opt;
};

S3Client.prototype.createHostname = function(bucket, awshost){
	if(bucket.indexOf('.',bucket.length-1)!==-1) return bucket+awshost;
	return bucket+'.'+awshost;
};
/**
 * Creates a request to S3 
 * @param cb callback
 * @returns the request object
 * @api private
 */
S3Client.prototype.createRequest = function(options, cb){
	
	this.awsAuth=new S3Auth(options).createAuth();
	var headers = options.headers;
	if(options.contentType) headers['content-type'] = options.contentType;
	if(options.contentLength) headers['content-length'] =  options.contentLength;
	if(options.md5) headers['content-MD5'] = options.md5;
	headers['Authorization'] = this.awsAuth;
	var request = this.getRequest(options,headers,cb);
	return request;
};
S3Client.prototype.getRequest = function (options,headers, cb) {
	var request = http.request({
		'hostname' : this.createHostname(options.bucket,s3_hostname),
		'method' : options.verb,
		'path' : '/'+options.resource,
		'headers' : headers
	});
	request.useChunkedEncodingByDefault = false;
	request.removeHeader('transfer-encoding');
	request.on('response', function(res) {
		if(cb) cb(null, res);
	});
	request.on('error', function(err) {
		if(cb) cb(err);
	});
	return request;
};

/**
 * Copy merge into to
 * @param to the opject to clone merge into
 * @param merge the object to add to 'to'
 * @returns to extended with merge
 */
S3Client.prototype.cloneOptions = function (to, merge){
		  var keys = Object.keys(merge);
		  for(var i in keys){
			  var k = keys[i];
			  to[k]= merge[k];
		  }
		  return to;
};
/**
 * Does a post to S3 with the provided file 
 * @param {filetosend} the file to send to S3
 * @param {resourceToCreate} the name on S3 to create the resource under
 * @param {mime} type of file for upload (image/jpg)
 * @param {filesize} size of file for upload
 * @param {cb} response callback
 * @api public
 */
S3Client.prototype.put = function(filetosend,resourceToCreate, mime, fileSize, cb){
	var localoptions = this.cloneOptions({verb : 'PUT', resource : resourceToCreate, contentType:mime, contentLength:fileSize}, this.options);
	

	var me = this;
	//TODO sucks refac
	if(localoptions.createmd5){
		var shasum = crypto.createHash('md5');
		var s = fs.ReadStream(filetosend);
		s.on('data', function(d) { shasum.update(d); });
		s.on('end', function() {
			localoptions.md5 = shasum.digest('base64');
		});
		s.on('close', function(){
			var req = me.createRequest(localoptions, cb);
			var readStream = fs.createReadStream(filetosend);
			readStream.pipe(req);
		});
	}else{
		var req = this.createRequest(localoptions, cb);
		var readStream = fs.createReadStream(filetosend);
		readStream.pipe(req);
	}

};
S3Client.prototype.putText = function(text,resourceToCreate, cb){
	if(!text) throw 'please provide a text to upload';
	if(!resourceToCreate) throw 'Please provide a resource name';
	var localoptions = this.cloneOptions({verb : 'PUT', resource : resourceToCreate, contentType:'text/xml', contentLength:Buffer.byteLength(text)}, this.options);
	
	//TODO sucks refac
	if(localoptions.createmd5){
		var shasum = crypto.createHash('md5');
		
		shasum.update(text);
		localoptions.md5 = shasum.digest('base64');
		
	}
	var req = this.createRequest(localoptions, cb);
	req.write(text);
	req.end();

};
/**
 * Does a get (delete, get) to S3 
 * @param {cb} a callback to recieve the response
 * @api public
 */
S3Client.prototype.get = function(resource, cb){
	var localoptions = this.cloneOptions({verb: 'GET', resource: resource}, this.options);
	
	
	this.createRequest(localoptions, cb).end();
};

/**
 * Sends a delete ( get) to S3 
 * @param {cb} a callback to recieve the response
 * @param {fileToDelete} the name of the file to delete 
 * @api public
 */
S3Client.prototype.del = function(fileToDelete, cb){
	var localoptions = this.cloneOptions({verb: 'DELETE', resource: fileToDelete}, this.options);
	this.createRequest(localoptions, cb).end();
	
};
/**
 * Sends a delete ( get) to S3 
 * @param {cb} a callback to recieve the response
 * @param {readStream} stream to pipe to S3
 * @param {fileToStreamTo} the name of the file to stream content to
 * @api public
 */
S3Client.prototype.stream = function(fileToStreamTo, readStream, cb){
	var localoptions = this.cloneOptions({verb : 'PUT', resource : fileToStreamTo}, this.options);
	var s3stream = this.createRequest(localoptions,cb);
	readStream.pipe(s3stream);
};
