var assert = require("assert"), should = require('should');

var S3Client = require("../lib/S3Client");

var MockStream = function(){
	
};

MockStream.prototype.write = function(string){
	
};
MockStream.prototype.end = function(string){
	
};


S3Client.prototype.getRequest = function (options,headers, cb) {
	return new MockStream();
};

describe('S3Client', function(){
	before(function(){
		
	});

	describe('createRequest', function(){
		it('should map headers correctly', function(){
			var client = new S3Client({key: 'bla', bucket:'test', secret:'secret'});
			var options = {contentType: 'image/jpeg', contentLength : 1024, md5 : 'wecdfrfvcx==',key: 'bla', bucket:'test', secret:'secret'};
			client.createRequest(options);
			should.exist(options.headers);
			var headers =options.headers;
			headers.should.have.property('content-type','image/jpeg');
			headers.should.have.property('content-length',1024);
			headers.should.have.property('content-MD5','wecdfrfvcx==');
		});
		
		it('should have aws auth information', function(){
			var client = new S3Client({key: 'bla', bucket:'test', secret:'secret'});
			var options = {contentType: 'image/jpeg', contentLength : 1024, md5 : 'wecdfrfvcx==',key: 'bla', bucket:'test', secret:'secret'};
			client.createRequest(options);
			should.exist(options.headers);
			var headers =options.headers;
			headers.should.have.property('Authorization');
		});
		
		it('should return valid request', function(){
			var client = new S3Client({key: 'bla', bucket:'test', secret:'secret'});
			var options = {contentType: 'image/jpeg', contentLength : 1024, md5 : 'wecdfrfvcx==',key: 'bla', bucket:'test', secret:'secret'};
			var req = client.createRequest(options);
			should.exist(req);
		});
	});
	
	describe('get', function(){
		
		it('should throw error on missing AWS key', function(){
			assert.throws(function(){new S3Client({secret: 'bla', bucket:'test'}).get();});
		});
		it('should throw error on missing AWS secret', function(){
			assert.throws(function(){new S3Client({key: 'bla', bucket:'test'}).get();});
		});
		it('should throw error on missing bucket', function(){
			assert.throws(function(){new S3Client({key: 'bla', secret:'test'}).get();});
		});
		it('should not throw error if all options set', function(){
			assert.doesNotThrow(function(){new S3Client({key: 'bla', bucket:'test', secret:'secret'}).get();});
		});
	});
});