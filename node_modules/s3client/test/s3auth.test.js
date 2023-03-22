var assert = require("assert");
var S3Auth = require("../lib/S3Auth");
//var util = require('util');



describe('S3Auth', function(){
	before(function(){
		
	});
	
	describe('new', function(){
		it('should throw error on missing AWS key', function(){
			assert.throws(function(){new S3Auth({secret: 'bla', bucket:'test'});});
		});
		it('should throw error on missing AWS secret', function(){
			assert.throws(function(){new S3Auth({key: 'bla', bucket:'test'});});
		});
		it('should throw error on missing bucket', function(){
			assert.throws(function(){new S3Auth({key: 'bla', secret:'test'});});
		});
		it('should not throw error if all options set', function(){
			assert.doesNotThrow(function(){new S3Auth({key: 'bla', bucket:'test', secret:'secret'});});
		});
		it('should construct default headers', function(){
			assert.ok(new S3Auth({key: 'bla', bucket:'test', secret:'secret'}).options.headers);
		});
		it('should construct default headers with x-amz-date', function(){
			assert.ok(new S3Auth({key: 'bla', bucket:'test', secret:'secret'}).options.headers['x-amz-date']);
		});

	});
	
	describe('createPath', function(){
		var s3 = new S3Auth({key: 'bla', bucket:'test', secret:'secret'});
		it('should construct correct bucket path', function(){
			var path = s3.createPath('bucket', 'resource');
			assert.strictEqual(path, '/bucket/resource');
			path = s3.createPath('bucket', '/resource');
			assert.strictEqual(path, '/bucket/resource');
			path = s3.createPath('bucket', 'resource/');
			assert.strictEqual(path, '/bucket/resource/');
			path = s3.createPath('/bucket', 'resource/');
			assert.strictEqual(path, '/bucket/resource/');
			path = s3.createPath('/bucket/', 'resource');
			assert.strictEqual(path, '/bucket/resource');
		});
	});
	
	describe('constructCanonicalizedResource', function(){
		var S3_SUB_RESOURCES = ['torrent','tagging', 'acl', 'lifecycle', 'location', 'logging', 'notification', 'partNumber', 'policy', 'requestPayment', 
		                        'uploadId', 'uploads', 'versionId', 'versioning', 'versions', 'website','cors'].sort();
		it('should exclude all query parameters not on aws subresource list', function (){
			var s3 = new S3Auth({key: 'bla', bucket:'bucket', secret:'secret'});
			var resource = s3.constructCanonicalizedResource('?q=5&fluff=te&t&websites&corss');
			assert.strictEqual(resource, '/bucket/');
		});
		
		it('should include all query parameters aws subresource list and it shuld be sorted lex', function (){
			var s3 = new S3Auth({key: 'bla', bucket:'bucket', secret:'secret'});
			var query = S3_SUB_RESOURCES.join('&');
			var resource = s3.constructCanonicalizedResource('?q=5&fluff=te&t&'+query);
			var index=0;
			for(var i in S3_SUB_RESOURCES.sort()){
				var sub = S3_SUB_RESOURCES[i];
				assert.ok(resource.indexOf(sub, index)!=-1);
				index = resource.indexOf(sub, index);
			}
			
		});
		it('should extract path', function(){
			var s3 = new S3Auth({key: 'bla', bucket:'bucket', secret:'secret'});
			var resource = s3.constructCanonicalizedResource('/path/image.bla?q=5&fluff=te&t');
			assert.strictEqual(resource, '/bucket/path/image.bla');
		});
	});
	describe('constructCanonicalizedAmzHeaders', function(){
		var s3 = new S3Auth({key: 'bla', bucket:'bucket', secret:'secret'});
		it('should convert each header name to lowercase', function(){
			var headers = s3.constructCanonicalizedAmzHeaders({'x-amz-oPT1':25,'OPT2' : 'test'});
			assert.strictEqual(headers,'opt2:test\nx-amz-opt1:25');
		});
        it('should sort by header name', function(){
        	var headers = s3.constructCanonicalizedAmzHeaders({'x-amz-oPT2':25,'x-amz-oPT1' : 'test', 'x-amz-jPT2' : 'test', 'a-amz-oPT2' : 'test'});
			assert.strictEqual(headers,'a-amz-opt2:test\nx-amz-jpt2:test\nx-amz-opt1:test\nx-amz-opt2:25');
        	
        });
        it('should combine fields with same name into comma seperated list //todo', function(){});
        it('should unfold long headers into one line', function(){
        	var headers = s3.constructCanonicalizedAmzHeaders({'x-amz-oPT1':25,'OPT2' : 'test \nwith newline'});
			assert.strictEqual(headers,'opt2:test with newline\nx-amz-opt1:25');
        }); 
        it('should trim whitespace', function(){
        	var headers = s3.constructCanonicalizedAmzHeaders({'x-amz-oPT1':'white ','OPT2' : ' test '});
			assert.strictEqual(headers,'opt2:test\nx-amz-opt1:white');
        });
        it('should append newline to each header', function(){
        	var headers = s3.constructCanonicalizedAmzHeaders({'x-amz-oPT1':'white ','OPT2' : ' test '});
			assert.strictEqual(headers,'opt2:test\nx-amz-opt1:white');
        });
		
	});
	
	describe('stringToSign', function(){
		var options = {key: 'bla', bucket:'bucket', secret:'secret', verb:'PUT', md5:'sdfwer3', contentType:'text/xml', date:'date'};
		var s3 = new S3Auth(options);
		
		it('should include verb, md5, contenttype', function(){
			//stringToSign = HTTP-Verb + "\ n" + Content-MD5 + "\ n" + Content-Type + "\ n" +
			//* Date + "\ n" + CanonicalizedAmzHeaders + CanonicalizedResource;
			var stringtosign = s3.stringToSign(options);
			assert.ok(stringtosign.indexOf('PUT')!=-1);
			assert.ok(stringtosign.indexOf('text/xml')!=-1);
			assert.ok(stringtosign.indexOf('sdfwer3')!=-1);
		//	assert.ok(stringtosign.indexOf('date')!=-1);		
		});
		it('should use x-amz-date over date header',function(){
			var stringtosign = s3.stringToSign(options);
			assert.ok(stringtosign.indexOf('date')===-1);
			assert.ok(s3.options.headers['x-amz-date'] === 'date');
		});
	});
		
});