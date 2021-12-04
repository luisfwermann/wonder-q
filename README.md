## WONDER-Q DOCS

### CLI Commands
* **npm run start** - Run project locally on localhost:8000.
* **npm run test** - Run avaiable set of tests.

### API Endpoints

* **/produce**
	* *Method:* POST
	* *Description:* Produces a new message and add it to the queue.
	* *Body:* Content of message in plain text. Ex.: `MESSAGE CONTENT`.
	* *Response:* 
	```json
		{
		  "id": "163863555463591",
		  "msg": "MESSAGE CONTENT",
		  "timeout": null
		}
	```

* **/consume**
	* *Method:* POST
	* *Description:* Consumes the first message available on queue. This message will be available to consume again after timeout expires.
	* *Body:* No body is required.
	* *Response:* 
	```json
		{
		  "id": "163863555463591",
		  "msg": "MESSAGE CONTENT",
		  "timeout": "2021-12-04T16:33:28Z"
		}
	```

* **/confirm**
	* *Method:* POST
	* *Description:* Confirm that has consumed of a message. After confirming a message, it will be removed from the avaiable messages queue.
	* *Body:* Message ID in plain text. Ex.: `163863555463591`.
	* *Response:* 
	```json
		{
		  "id": "163863555463591",
		  "msg": "MESSAGE CONTENT",
		  "timeout": null
		}
	```