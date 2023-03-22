S3Client
============

Simple client for integration to Amazon S3.


Description
-------------
This is a simple module for integration to amazon S3.  
It supports many of AWS S3 rest commands (see usage).  

If you use this together with a framework like express for storing user uploads, then please be aware that express (formidable) will accept the user upload and save this locally, wehere upon you can pass this on to S3Client for upload to S3. 
This might or might not be a problem dependent on your provider and the sizes of the files user upload to your site.   
I might add a feature later on for plugging in to express/formidable to do direct pass through streaming(no local copy).



Usage:
------

Usage is fairly simple:  

var S3Client = require('S3Client');  

###Options object:
    options = {
        'key' : aws S3 key,
        'secret' : secret,
        'bucket' : bucket,
        'md5' : file MD5, if this is set then a a md5 wont be calculated OPTIONAL,
        'calcmd5' : set if you want the program to calculate a md5 hash for PUT
        'date' : request time OPTIONAL the system will insert an x-amz-date 
        'headers' : {'x-amz-date' : new Date().toUTCString(),? } OPTIONAL
    };

The only options that are required are your credentials for Amazon S3 and the bucket name.  

###Upload:
To upload a file simply pass the file to be uploaded and the name to store it under to the client  

    var options = {
            'key' : keyId,
            'secret' : secret,
            'bucket' : bucket,
    };
    var client = new S3Client(options);
    
    client.put(filetosend,resourceToCreate, file.type, file.size, function(err,resp){
        // do something with response
    }

###Put text :
Upload of text to S3, as a file or as subresource(?acl) is done easily by passing the text (f.eks. json or xml or whatever) to putText.
The content will be put in the item defined in the resource parameter.  
     
    var options = {
            'key' : keyId,
            'secret' : secret,
            'bucket' : bucket,
    };
    var client = new S3Client(options);
    
    client.putText(text,resource,  function(err,resp){
        // do something with response
    }

For example adding acl subresource to esiting item:  
    
    client.putText(aclxml,'cutedog.jpg?acl',  function(err,resp){
        // do something with response
    }
    
Or just putting text to a file  
    
    client.putText(text,'chrismaswishlist.txt',  function(err,resp){
        // do something with response
    }
    
###Delete:
Deletion of a resource is done with client.del.
To delete the current bucket just pass an empty string.

    var options = {
            'key' : keyId,
            'secret' : secret,
            'bucket' : bucket,
            
    };
    var client = new S3Client(options);
    client.del(resourceToDelete, function(err,resp){
        // do something here
    }
    

###Get:
    var options = {
            'key' : keyId,
            'secret' : secret,
            'bucket' : bucket
    };
    var client = new S3Client(options);
    client.get(resourceToGetOrQuery, function(err,resp){
        // do something with response 
        resp.on('data', function(chunk) { // maybe bind to on data to get actual content
        });
        
    });
    
    ResourceToGetOrQuery can be many different things:  
    '' (empty string) : lists content of bucket  
    ?xxx : query subresouce xxx (ie. acl, cors,...), seperate with
    xxx?yyy : query subresource xxx with specefied yyy option (ie. ?max-keys=50&prefix=20)
    filename : get file 

###AWS specific operations
List content of bucket :
   Do a GET and set resource to empty string   
   If you want to limit a list, then provide the parameters as a normal query string (ie. ?max-keys=50&prefix=bob)
   to the get resource option    
       client.get('', function(err,resp){}); //list bucket content  
       or  
       client.get('?max-keys=50&prefix=bob', function(err,resp){}); // list bucket content but list only first 50 items starting with 'bob'  
   
    
To do specific subresource gets, append the subresource as normal to the resource for example ?acl   
    
     var options = {
            'key' : keyId,
            'secret' : secret,
            'bucket' : bucket,
    };
    client.get('?acl', function(err,resp){}); //get acl for bucket
    client.get('filename?acl', function(err,resp){}); //get acl for file item

For a list of operations, options and supresources that are usable in S3, see the S3 rest documentation : http://docs.amazonwebservices.com/AmazonS3/latest/API/APIRest.html   

Test
---------
There is some test in /test  
This is not nearly enough and will be expanded, when I have the time. 

TODO 
-----------
REFAC MD5 calculation  
multipart upload to S3  
test of S3Client  
Put bucket ? how?  

##NOTES
Remeber to set bucket policy to public read 
    {
      "Version":"2008-10-17",
      "Statement":[{
        "Sid":"AddPerm",
            "Effect":"Allow",
          "Principal": {
                "AWS": "*"
             },
          "Action":["s3:GetObject"],
          "Resource":["arn:aws:s3:::bucket/*"
          ]
        }
      ]
    }

Direct upload requires s3:putObjectACL for the user that signs the policy for the request   