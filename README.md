![alexa-tamu logo](/logo.png)
# alexa-tamu
Alexa Skill created to serve dynamic content to the students of **Texas A&M University** by the members of **A&M Alexa Development Team**..

Note that this project is being made to fulfill requirements of the team members (Joey Sapp, Jack Swink, Justin Bevolo, and Aaron Blasband) to complete their final senior design projec oft (*CSCE482*) which was given to them by the Information Technology department of **Texas A&M University**.

## Todo
| Task               | Goal                                                 | Assigned to               |
|--------------------|------------------------------------------------------|---------------------------|
| Intent ideation    | Compose a list of sites for dynamic content to serve | Aaron, Justin, Jack, Joey |
| Intent creation    | Translate ideas to functional Intents                | Joey, Jack                |
| Acceptance Testing | Ensure app performance prior to submission           | Aaron                     |
| Website            | Communicate list tamu-alexa's abilities/Intents      | Justin, Joey              |

## [Uploading code](https://blog.seanssmith.com/posts/alexa-s3-upload.html), ecosystem and developing
```
Create IAM account for user on console.aws.amazon.com
Install awscli, configure to above IAM account credentials
$ zip -r out.zip index.js data/ node_modules/ package-lock.json package.json  
$ aws s3 cp out.zip s3://alexa-tamu-code
```
It must be noted our skill (Lambda setup within AWS console) is specifically running off of the file named "out.zip" and is particular about how the file is zipped.

## Helpful Links 
```
https://console.aws.amazon.com/lambda/home
https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object
Authentication: https://developer.amazon.com/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html
```

## Notes
[Clickable URLS in cards/responses](https://forums.developer.amazon.com/questions/72895/how-to-include-clickable-urls-in-alexa-card-respon.html)
[Custom Slot Types](https://developer.amazon.com/docs/custom-skills/custom-interaction-model-reference.html#custom-slot-type-values)
Slot values are sent to your skill in written format. For example, both "fire h. d. 7" and "fire h. d. seven" would be sent to your skill as "Fire HD7". For better recognition, acronyms and other phrases involving spoken letters should either be all caps ("HD") or separated by periods and a space ("h. d. "). Using lowercase for initialisms may lead to unreliable recognition since the spoken form may not correctly be detected

## Potential Ideas
| Idea           | Example                                                                                            | URL                                                           |
|----------------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| School/Depts   | "Tell me about the school of architecture."                                                        | https://www.tamu.edu/about/departments.html                   |
| Bus Routes     | "Is my bus late?", "Where is bus 12?"                                                              | http://transport.tamu.edu/BusRoutes/                          |
| Garage Status  | "Is WCG full?"                                                                                     | http://transport.tamu.edu/parking/realtime.aspx               |
| Games          | "When's the next game?", "Buy tickets for the basketball game."                                    | https://www.12thmanfoundation.com/ticket-center/full-schedule |
| Locations      | "Where is the MSC?", "Where is my son's New Student Conference?", "How do I get to my math class?" | https://aggiemap.tamu.edu/directory/                          |
| Maroon Alerts  | Possible global opt-in Maroon Alert system                                                         | https://twitter.com/tamucodemaroon?lang=en                    |
| eCampus/Howdy  | "Sorry, we can't do that just yet!"                                                                | N/A                                                           |
| college:crm    | "Tell me about CSCE482!", "That class is super fun! Would you like me to read the description?"    | Public?                                                       |
| Parking Info   | "Where can I park on parent's weekend?", "What times can I park in Lot 100 today?"                 | http://transportmap.tamu.edu/parkingmap/                      |
| Student Health | "Is Beutel open today?", "Here's the Student Health Service URL!"                                  |                                                               |
| college:crm    | "Tell me about CSCE482!", "That class is super fun! Would you like me to read the description?"    | Public?                                                       |
| Event info.    | "Tell me events coming up", "Tell me if Craggies have any events soon!"                            | Custom website for insertion w/ curation                      |
| Campus food    | "Where can I eat?", "What food places are open right now?", "I'm hungry"                           | https://www.dineoncampus.com/tamu/                            |
| OAL            | "I need to print something", "Where can I use a computer?", "What labs are open currently?         | http://oal.tamu.edu/Lab-Locations                             |
| Academic Cal   | 'When's drop date this semester?', 'When's the next school holiday?', 'When's spring break?''      | https://registrar.tamu.edu/, downloadable calendar object     |

## Dependencies 
| Library      | Uses                                    | URL                                             |
|--------------|-----------------------------------------|-------------------------------------------------|
| alexa-sdk    | Alexa language model generation         | https://www.npmjs.com/package/alexa-sdk         |
| ssml-builder | SSML (Speech Synthesis Markup Language) | https://www.npmjs.com/package/ssml-builder      |
| string-sim   | Alexa slot resolution imitation         | https://www.npmjs.com/package/string-similarity |

[toPhonetics](https://tophonetics.com/)
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
