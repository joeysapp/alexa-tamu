
![alexa-tamu logo](/logo.png)
# alexa-tamu
Extension of **Project Asset** to serve dynamic content to the students of **Texas A&M University**.

Note that this project is being made to fulfill requirements of the team members (Joey Sapp, Jack Swink, Justin Bevolo, and Aaron Swink) to complete the proposed *reach goals* of their final senior design project (*CSCE482*) which was given to them by the Information Technology department of **Texas A&M University**.

## [Uploading code](https://blog.seanssmith.com/posts/alexa-s3-upload.html), ecosystem and developing
```
Create IAM account for user on console.aws.amazon.com
Install awscli, configure to above IAM account credentials
$ zip -r out.zip index.js definitions.js node_modules/ package-lock.json package.json  
$ aws s3 cp out.zip s3://alexa-tamu-code
```
It must be noted our skill (Lambda setup within AWS console) is specifically running off of the file named "out.zip" and is particular about how the file is zipped.

## Helpful Links 
```
https://console.aws.amazon.com/lambda/home
https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object
Authentication: https://developer.amazon.com/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html
```

## Payment
TBD

## License
**MIT License**

Copyright (c) 2018 Joseph Sapp, Jack Swink, Justin Bevolo, Aaron Swink

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**
