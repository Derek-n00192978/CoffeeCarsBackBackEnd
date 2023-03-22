var crypto = require('crypto'), url = require('url');

var S3_SUB_RESOURCES = ['acl', 'lifecycle', 'location', 'logging', 'notification', 'partNumber', 'policy', 'requestPayment', 
                        'torrent','tagging', 'uploadId', 'uploads', 'versionId', 'versioning', 'versions', 'website','cors'];

var S3Auth = module.exports = exports = function(options){
	if(!options) throw 'You must provide an options object with minimum aws id, secret and bucket';
	if(!options.key) throw 'Please supply a AWS key';
	if(!options.secret) throw 'Please supply a AWS Secret Access Key';
	if(!options.bucket) throw 'Please supply bucket name';
	this.options = options;
	if(!this.options.date) this.options.date = ''; // prefer x-amz-date
	if(!this.options.headers) this.options.headers = {'x-amz-date' : this.options.date || new Date().toUTCString()};
	if(!this.options.headers['x-amz-date']) this.options.headers['x-amz-date'] =  this.options.date || new Date().toUTCString();
};

/**
 * 
 * @returns {String} signed authentication string
 */
S3Auth.prototype.createAuth = function(){
  return 'AWS ' + this.options.key + ':' + this.sign(this.options);
};

/**
 * convert URI resource identifier to canonialized resource
 * 	extract path
 * 	identify subresource (query paramters)s
 *  sort 	
 * 	append subresources 
 *  
 * @param {message} the message to sign
 * @param {options} the options object containing the secret key
 * @return {String}
 * @api private 
 */
S3Auth.prototype.hmacSha1 = function(message, options){
	  return crypto.createHmac('sha1', options.secret).update(message).digest('base64');
};
/**
 * StringToSign = HTTP-Verb + "\ n" + Content-MD5 + "\ n" + Content-Type + "\ n" +
 * Date + "\ n" + CanonicalizedAmzHeaders + CanonicalizedResource;
 * CanonicalizedResource = [ "/" + Bucket ] + < HTTP-Request-URI, from the
 * protocol name up to the query string >  + [ sub-resource, if
 * present. For example "? acl", "? location", "? logging", or "? torrent"];
 * @return {String}
 * @api private 
 */
S3Auth.prototype.sign = function(options){
	var stringToSign = this.stringToSign(options);
	var canonicalizedAmzHeaders = this.constructCanonicalizedAmzHeaders(options.headers);
	var canonicalizedResource = this.constructCanonicalizedResource(options.resource);
	stringToSign += canonicalizedAmzHeaders+'\n'; // +CanonicalizedAmzHeaders
	stringToSign += canonicalizedResource; // + CanonicalizedResource
	return this.hmacSha1(stringToSign, options);
};
/**
 * 
 *StringToSign = HTTP-Verb + "\ n" + Content-MD5 + "\ n" + Content-Type + "\ n" +
* Date + "\ n" + CanonicalizedAmzHeaders + CanonicalizedResource;
* @return {String}
* @api private  
*/
S3Auth.prototype.stringToSign = function(options){
	  return [
	      options.verb 
	    , options.md5 || ''
	    , options.contentType || ''
	    ,  options.headers['x-amz-date'] ? '' : (options.date.toUTCString ? options.date.toUTCString() : options.date)
	  ].join('\n')+'\n';
};

/**
 *  convert each header name to lowercase
 *  sort by header name
 *  combine fields with same name into comma seperated list // todo
 *  Unfold long headers into one line 
 *  trim whitespace
 *  append newline to each header
 * @param {Object} amzHeaders
 * @return {String}
 * @api private
 */
S3Auth.prototype.constructCanonicalizedAmzHeaders = function(amzHeaders){
	var headers = [];
	for(var header in amzHeaders){
		var val = amzHeaders[header].toString();
		val = val.replace(' \n', ' ');//Unfold long headers into one line
		val = val.trim(); // trim whitespace
		var amzHeader = header.toLowerCase(); // convert each header name to lowercase
		headers.push(amzHeader+':'+val);
	}
	return headers.sort().join('\n'); // sort and append newline
};

/**
 * convert URI resource identifier to canonialized resource
 * 	extract path
 * 	identify subresource (query paramters)s
 *  sort 	
 * 	append subresources 
 *  
 * @param resouce
 * @return {String}
 * @api private 
 */
S3Auth.prototype.constructCanonicalizedResource = function(resource){
	if(!resource) resource = '';
	var awsurl = url.parse(resource);
	var subresources = [], canonializedResource = this.createPath(this.options.bucket,awsurl.pathname || '');
	if(awsurl.query){
		awsurl.query.split('&').forEach(function(param){
			var keyval = param.split('=');
			if(S3_SUB_RESOURCES.indexOf(keyval[0]) > -1 ){
				if(keyval.length > 1){
					subresources.push(keyval[0]+':'+keyval[1]);
				}else{
					subresources.push(keyval[0]);
				}
			}
		});	
	}
	if(subresources.length>0){
		canonializedResource += '?'+subresources.sort().join('&');
	}
	return canonializedResource;
};

S3Auth.prototype.createPath = function(bucket, pathname){
	var path ='';
	if(bucket.indexOf('/') !==0){
		path = '/';
	}
	path+=bucket;
	if(bucket.indexOf('/', bucket.length-1) === -1 && pathname.indexOf('/') !=0){
		path+='/';
	}
	return path+pathname;
}; 