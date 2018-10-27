// Bridging Classes for Drafts
class BridgeCredential {
	constructor() {
		this._bridgeObject = new Object()
	}
	
	static create(identifier, description) {
		this._bridgeObject = Credential.create(identifier, description);
		return this
	}
	
	addTextField(key, label) {
		this._bridgeObject.addTextField(key, label)
	}
	
	addPasswordField(key, label) {
		this._bridgeObject.addPasswordField(key, label)
	}
	
	authorize() {
		this._bridgeObject.authorize()
	}
	
	getValue(key) {
		this._bridgeObject.getValue(key)
	}
}

class BridgeHTTPResponse {
	constructor(response) {
		this._bridgeObject = response
	}
	
	get success() { return this._bridgeObject.success }
	get statusCode() { return this._bridgeObject.statusCode }
	get responseData() { return this._bridgeObject.responseData }
	get responseText() { return this._bridgeObject.responseText }
	get otherData() { return this._bridgeObject.otherData }
	get error() { return this._bridgeObject.error }
}

class BridgeHTTP {
	constructor() {
		this._bridgeObject = new Object()
	}
	
	static create(identifier, description) {
		this._bridgeObject = Credential.create(identifier, description);
		return this
	}
	
	request(settings) {
		let bridgeHTTPResponse = BridgeHTTPResponse(this._bridgeObject.request(settings));
		return bridgeHTTPResponse
	}
}

class BridgeApp {
	constructor() {
		this._bridgeObject = app
	}
	
	displayErrorMessage(message) {
		this._bridgeObject.displayErrorMessage(message)
	}
}

var bridgeApp = new BridgeApp()

class BridgePrompt {
	constructor() {
		this._bridgeObject = new Object()
	}
	
	static create() {
		this._bridgeObject = Prompt.create()
	}
	
	set title(value) { this._bridgeObject.title = value }
	get title() { return this._bridgeObject.title }
	
	set message(value) { this._bridgeObject.message = value }
	get message() { return this._bridgeObject.message }
	
	set isCancellable(value) { this._bridgeObject.isCancellable = value }
	get isCancellable() { return this._bridgeObject.isCancellable }
	
	get fieldValues() { return this._bridgeObject.fieldValues }
	
	get buttonPressed() { return this._bridgeObject.buttonPressed }
	
	addLabel(name, label, options) {
		this._bridgeObject.addLabel(name, label, options)
	}
	
	addTextField(name, label, initialText, options) {
		this._bridgeObject.addTextField(name, label, initialText, options)
	}
	
	addTextView(name, label, initialText, options) {
		this._bridgeObject.addTextView(name, label, initialText, options)
	}
	
	addPasswordField(name, label, initialValue) {
		this._bridgeObject.addPasswordField(name, label, initialValue)
	}
	
	addSwitch(name, label, initialValue{
		this._bridgeObject.addSwitch(name, label, initialValue)
	}
	
	addDatePicker(name, label, initialDate, options) {
		this._bridgeObject.addDatePicker(name, label, initialDate, options)
	}
	
	addPicker(name, label, columns, selectedRows) {
		this._bridgeObject.addPicker(name, label, columns, selectedRows)
	}
	
	addSelect(name, label, values, selectedValues, allowMultiple) {
		this._bridgeObject.addSelect(name, label, values, selectedValues, allowMultiple)
	}
	
	addButton(name, value) {
		this._bridgeObject.addButton(name, value)
	}
	
	show() { this._bridgeObject.show() }
}

class BridgeContext() {
	constructor() {
		this._bridgeObject = context
	}
	
	cancel(message) { this._bridgeObject.cancel(message) }
}

bridgeContext = new BridgeContext();

function bridgeAlert(message) {
	alert(message)
}


// Airtable Classes
class ATURL {
	constructor(baseURL) {
		this.baseURL = baseURL;
		this.parameters = {};
	}
	
	addParameter(key, value) {
		this.parameters[key] = value;
	}
	
	constructURL() {
		let parametersArray = new Array();
		
		for (let parameterName in this.parameters) {
			let encodedParameter = encodeURIComponent(this.parameters[parameterName]);
			parametersArray.push(parameterName + "=" + encodedParameter);
		}
		
		if (parametersArray.length == 0) {
			return this.baseURL;
		} else {
			return this.baseURL + "?" + parametersArray.join("&");
		}
	}
	
}

class ATHTTPRequest {
	constructor(table) {
		this.table = table;
		this.responseData = undefined;
		this.error = undefined;
		this.success = undefined;
	}
	
	static _createPostData(record) {
		let data = new Object();
		data.id = record.id;
		data.fields = record._fields;
		return data;
	}
	
	static _createPatchData(record) {
		let data = new Object();
		data.fields = record._changedFields;
		return data;
	}
	
	static _errorMessage(response) {
		if (response.error) {
			return response.error
		} else {
			switch(response.statusCode) {
				case 400:
					return "400: Bad Request";
					break;
				case 401:
					return "401: Unauthorized";
					break;
				case 402:
					return "402: Payment Required";
					break;
				case 403:
					return "403: Forbidden";
					break;
				case 404:
					return "404: Not Found";
					break;
				case 413:
					return "413: Request Entity Too Large";
					break;
				case 422:
					return "422: Invalid Request";
					break;
				case 500:
					return "500: Internal Server Error";
					break;
				case 502:
					return "502: Bad Gateway";
					break;
				case 503:
					return "503: Service Unavailable";
					break;
			}
		}
	}
	
	get(options = {}) {
		let http = BridgeHTTP.create();
		let url = new ATURL("https://api.airtable.com/v0/" + this.table.base._endpoint + "/" + encodeURIComponent(this.table.name));
		url.parameters = options;
		let response = http.request({
			"url": url.constructURL(),
			"method": "GET",
			"headers": {"Authorization": "Bearer " + this.table.base._apiKey}
		});
		
		if (response.success) {
			this.responseData = JSON.parse(response.responseText);
			this.success = true;
		} else {
			this.success = false;
			this.error = ATHTTPRequest._errorMessage(response);
			this.table.lastError = this.error;
			bridgeApp.displayErrorMessage(this.error);
		}
		
		return this.success;
	}
	
	post(record) {
		let http = BridgeHTTP.create();
		let url = new ATURL("https://api.airtable.com/v0/" + this.table.base._endpoint + "/" + encodeURIComponent(this.table.name));
		let response = http.request({
			"url": url.constructURL(),
			"method": "POST",
			"data": ATHTTPRequest._createPostData(record),
			"headers": {"Authorization": "Bearer " + this.table.base._apiKey, "Content-type": "application/json"}
		});
		
		if (response.success) {
			this.responseData = JSON.parse(response.responseText);
			this.success = true;
		} else {
			this.success = false;
			this.error = ATHTTPRequest._errorMessage(response);
			this.table.lastError = this.error;
			bridgeApp.displayErrorMessage(this.error);
		}
		
		return this.success;
	}
	
	patch(record) {
		let http = BridgeHTTP.create();
		let url = new ATURL("https://api.airtable.com/v0/" + this.table.base._endpoint + "/" + encodeURIComponent(this.table.name) + "/" + record.id);
		let response = http.request({
			"url": url.constructURL(),
			"method": "PATCH",
			"data": ATHTTPRequest._createPatchData(record),
			"headers": {"Authorization": "Bearer " + this.table.base._apiKey, "Content-type": "application/json"}
		});
		
		if (response.success) {
			this.responseData = JSON.parse(response.responseText);
			this.success = true;
		} else {
			this.success = false;
			this.error = ATHTTPRequest._errorMessage(response);
			this.table.lastError = this.error;
			bridgeApp.displayErrorMessage(this.error);
		}
		
		return this.success;
	}
}

class ATRecord {
	
	constructor() {
		this._id = undefined;
		this._table = undefined;
		this._createdTimed = undefined;
		this._fields = new Object();
		this._changedFields = new Object();
		this._isLocalOnly = true;
	}
	
	get id() {
		return this._id;
	}
	
	set id(value) {
		bridgeApp.displayErrorMessage("The id property of ATRecord is read only");
		bridgeContex.cancel();
	}
	
	get table() {
		return this._table;
	}
	
	set table(value) {
		("The table property of ATRecord is read only");
		bridgeContex.cancel();
	}
	
	get createdTime() {
		return this._createdTime;
	}
	
	set createdTime(value) {
		("The createdTime property of ATRecord is read only");
		bridgeContex.cancel();
	}
	
	static create() {
		return new ATRecord();
	}
	
	static _createFromData(data, table) {
		let record = new ATRecord();
		record._id = data.id;
		record._createdTimed = new Date(data._createdTimed);
		record._fields = data.fields;
		record._table = table;
		record._isLocalOnly = false;
		return record;
	}
	
	getFieldValue(field) {
		if (this._fields.hasOwnProperty(field)) {
			return this._fields[field];
		} else {
			return undefined;
		}
	}
	
	setFieldValue(field, value) {
		this._fields[field] = value;
		this._changedFields[field] = value;
	}
	
	getLinkedRecords(field) {
		return this._fields[field].map(id => this._table.base.getRecordWithID(id));
	}
	
	linkRecord(field, record) {
		if (!this._fields.hasOwnProperty(field)) {
			this._fields[field] = new Array();
		}
		
		this._fields[field].push(record.id);
		this._changedFields[field] = this._fields[field]; 
	}
	
	_pushToTable() {
		let httpRequest = new ATHTTPRequest(this.table);
		httpRequest.post(this);
		this._changedFields = {};
		this._id = httpRequest.responseData.id;
		this._fields = httpRequest.responseData.fields;
		this._createdTimed = new Date(httpRequest.responseData.createdTime);
		return httpRequest;
	}
	
	update() {
		if (this._table && this._id) {
			let httpRequest = new ATHTTPRequest(this._table);
			let success = httpRequest.patch(this);
			
			if (success) {
				this._changedFields = {};
				this._fields = httpRequest.responseData.fields;
				return true;
			} else {
				return false;
			}
			
		} else if (this._table) {
			bridgeAlert("ERROR: table must be updated before record can be updated");
		} else {
			bridgeAlert("ERROR: record not yet added to table");
			return false;
		}
	}
	
	static isoDate(date, includeTime = false) {
		if (includeTime) {
			return date.toISOString();
		} else {
			return date.toISOString().split("T")[0];
		}
	}
	
	static selectRecords(records, field, options = {}) {
		let title = options.title || "Select Records";
		let message = options.message || "";
		let type = options.type || "selectMultiple";
		let filter = options.filter || function () { return true };

		if (typeof field == "string") {
			var promptLabel = function(record) {
				return record._fields[field];
			}
		} else if (typeof field == "function") {
			var promptLabel = function(record) {
				return field(record);
			}
		}
		
		let prompt = BridgePrompt.create();
		prompt.title = title;
		prompt.message = message;
		switch (type) {
			case "selectMultiple":
			case "selectOne":
				let labelToRecordMap = {};

				records.forEach(function(record) {
					labelToRecordMap[promptLabel(record)] = record; 
				});
				
				let recordFields = records.filter(filter).map(promptLabel).sort((a, b) => a.localeCompare(b));
				prompt.addSelect("selectedRecords", "", recordFields, [], type == "selectMultiple");
				prompt.addButton("OK");
				let selected = prompt.show();
				if (selected) {
					return prompt.fieldValues["selectedRecords"].map(label => labelToRecordMap[label]);
				} else {
					bridgeContex.cancel();
				}
				break;
			case "selectButtons":
				let idToRecordMap = {};
				records.forEach(record => { idToRecordMap[record._id] = record });
				records.filter(filter).sort((a, b) => promptLabel(a).localeCompare(promptLabel(b))).forEach(record => { prompt.addButton(promptLabel(record), record._id) });
				let selected2 = prompt.show();
				if (selected2) {
					return [idToRecordMap[prompt.buttonPressed]];
				} else {
					bridgeContex.cancel();
				}
				break;
		}
	}
}
	
class ATTable {
	constructor(name, base) {
		this._name = name;
		this._base = base;
		this._pulledRecords = new Array();
		this._unPushedRecords = new Array();
		this.lastError = undefined;
		this._idToRecordMap = new Object();
		base._tables.push(this);
		this._pullData();
		this._mapIDsToRecords()
	}
	
	get name() {
		return this._name;
	}
	
	set name(value) {
		("The name property of ATTable is read only");
		bridgeContex.cancel();
	}
	
	get base() {
		return this._base;
	}
	
	set base(value) {
		bridgeApp.displayErrorMessage("The base property of ATTable is read only");
		bridgeContex.cancel();
	}
	
	static create(name, base){
		return new ATTable(name, base);
	}
	
	get records() {
		return this._pulledRecords.concat(this._unPushedRecords);
	}
	
	set records(value) {
		bridgeApp.displayErrorMessage("The records property of ATTable is read only");
		bridgeContex.cancel();
	}
	
	get fields() {
		if (this._pulledRecords.length > 0) {
			return Object.keys(this._pulledRecords[0]._fields);
		} else {
			return undefined;
		}
	}
	
	set fields(value) {
		bridgeApp.displayErrorMessage("The fields property of ATTable is read only");
		bridgeContex.cancel();
	}
	
	_pullData() {
		let httpRequest = new ATHTTPRequest(this);
		let success = httpRequest.get();
		
		if (success) {
			let rawData = httpRequest.responseData.records;
			this._pulledRecords = rawData.map(rec => ATRecord._createFromData(rec, this));
			
			while (httpRequest.responseData.hasOwnProperty("offset")) {
				let offset = httpRequest.responseData.offset;
				let success = httpRequest.get({"offset": offset});
				
				if (success) {
					let moreRawData = httpRequest.responseData.records;
					this._pulledRecords = this._pulledRecords.concat(moreRawData.map(rec => ATRecord._createFromData(rec, this)));
				} else {
					this.lastError = httpRequest.error;
					this.lastStatusCode = httpRequest.statusCode;
					break;
				}
			}
		} else {
			return false;
		}
	}
	
	_mapIDsToRecords() {
		for (let record of this._pulledRecords) {
			this._idToRecordMap[record.id] = record;
		}
	}
	
	addRecord(record) {
		this._unPushedRecords.push(record);
		record._table = this;
	}
	
	selectRecords(field, options) {
		return ATRecord.selectRecords(this._pulledRecords, field, options);
	}
	
	update() {
		
		for (let record of this._unPushedRecords) {
			let response = record._pushToTable(this);
			if (!response.success) {
				return false;
			} else {
				record._isLocalOnly = false;
				record._changedFields = {};
			}
		}
		
		let success = this._pullData();
		this._unPushedRecords = [];
		this._mapIDsToRecords();
		
		return success;
	}
}

class ATBase {
	constructor(name) {
		this._name = name;
		this._tables = new Array();
		this._authorize();
	}
	
	get tables() {
		return this._tables;
	}
	
	set tables(value) {
		bridgeApp.displayErrorMessage("The tables property of ATBase is read only");
		bridgeContex.cancel();
	}
	
	static create(name) {
		return new ATBase(name);
	}
	
	_authorize() {
		let credential = BridgeCredential.create("Airtable (" + this._name + ")", "Enter base info");
		credential.addTextField("endpoint", "Endpoint");
		credential.addPasswordField("apiKey", "API key");
		credential.authorize();
		this._endpoint = credential.getValue("endpoint").replace("https://api.airtable.com/v0/", "").replace("/", "").trim();
		this._apiKey = credential.getValue("apiKey");
	}
	
	getRecordWithID(id) {
		let _idToRecordMap = Object.assign({}, ...this._tables.map(table => table._idToRecordMap));
		return _idToRecordMap[id];
	} 
	
}
