/* eslint-disable */
"use strict";

// import openTestTool from './web-test-tool/optmv-web-test-tool';
import optimoveCoreEvents from './sdk-events';

export const optimoveSDK = (function () {
	// ---- SDK constants ----
	const _version = '2.0.18';
	const _sdkDomain = "//sdk-cdn.optimove.net/";
	const _maxUserIdSize = 200;
	const _maxParamValueSize = 4000;

	// ---- Id's for local storage ---- custom event additional attributes ----
	const envKey = "990a6d8eb6cbb8ea44b73d21f1e473b43b9c74ea";
	const eventPlatformIDKey = "0b006d8eb623b8ea11b73d61f1e483b47b9d7422";
	const eventDeviceTypeIDKey = "4ba302311571f45d57f1aa75e428b9b78d59a7a2";
	const eventOSIDKey = "85bdeae0a9e0dad7fdd022d8f90da5d3a241b3d0";
	const eventNativeMobile = "d0df7f0a4c2724ff587c1cfb3e315b432e2d1f50";
	const visitorIDKey = "647a3d19ac2647f361068a43df3a4da1";
	const originalVisitorIDKey = "19a826c7f361268a43da3a46a12047f3";
	const clientCustomerIDKey = "215d26f4be2047f348066e44ee7fe3d6";
	const visitFirstDateKey = "511a26f4be2047a348064e4abe8ce2a9";
	const AdditionalAttributeMinId = 1000;
	const AdditionalAttributeMaxId = 1100;

	// ---- Core event keys ----
	const keySetPageVisitEvent = 'set_page_visit';
	const keySetUserIdEvent = 'set_user_id_event';
	const keySetEmailEvent = 'set_email_event';
	const keyCoreMetadataEvent = 'optimove_sdk_metadata';
	const keyWebPopupDisplayed = 'web_popup_displayed';

	// ---- Client's different variables ----
	let _env = 'prod';
	let _configFileUrl = "";
	let _hostname = "";
	let _configuration;
	let _coreEvents;
	let _userId = null;

	// ---------------------------------------
	// Function: logger
	// Args:
	// The main Logger Object
	// ---------------------------------------
	const logger = (() => {
		const _levels = {
			info: 1,
			warning: 2,
			error: 3,
			none: 4
		};
		let _loggerLevel = "none"; //  "none" | "info" | "warning" | "error"

		const _setLogLevel = function (logLevel) {
			_loggerLevel = logLevel;
		};

		const _log = function (level, message) {
			if (_env == 'prod') {
				return;
			}
			if (_levels[level] >= _levels[_loggerLevel]) {
				switch (_levels[level]) {
					case 1:
						console.info(message);
						break;
					case 2:
						console.warn(message);
						break;
					case 3:
						console.error(message);
						break;
					default:
						console.log(message);
				}
			}
		};

		return {
			setLevel: _setLogLevel,
			log: _log
		};
	})();

	const _SHA1 = {
		/**
		 *
		 *  Secure Hash Algorithm (SHA1)
		 *  http://www.webtoolkit.info/
		 *
		 **/
		SHA1: function (msg) {
			var rotate_left = function (n, s) {
				var t4 = (n << s) | (n >>> (32 - s));
				return t4;
			};

			var lsb_hex = function (val) {
				var str = "";
				var i;
				var vh;
				var vl;

				for (i = 0; i <= 6; i += 2) {
					vh = (val >>> (i * 4 + 4)) & 0x0f;
					vl = (val >>> (i * 4)) & 0x0f;
					str += vh.toString(16) + vl.toString(16);
				}
				return str;
			};

			var cvt_hex = function (val) {
				var str = "";
				var i;
				var v;
				for (i = 7; i >= 0; i--) {
					v = (val >>> (i * 4)) & 0x0f;
					str += v.toString(16);
				}
				return str;
			};

			var Utf8Encode = function (string) {
				string = string.replace(/\r\n/g, "\n");
				var utftext = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						utftext += String.fromCharCode(c);
					} else if ((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}
				}
				return utftext;
			};

			var blockstart;
			var i, j;
			var W = new Array(80);
			var H0 = 0x67452301;
			var H1 = 0xEFCDAB89;
			var H2 = 0x98BADCFE;
			var H3 = 0x10325476;
			var H4 = 0xC3D2E1F0;
			var A, B, C, D, E;
			var temp;

			msg = Utf8Encode(msg);
			var msg_len = msg.length;
			var word_array = new Array();
			for (i = 0; i < msg_len - 3; i += 4) {
				j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
					msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
				word_array.push(j);
			}

			switch (msg_len % 4) {
				case 0:
					i = 0x080000000;
					break;
				case 1:
					i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
					break;
				case 2:
					i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
					break;
				case 3:
					i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
					break;
			}

			word_array.push(i);
			while ((word_array.length % 16) != 14) word_array.push(0);
			word_array.push(msg_len >>> 29);
			word_array.push((msg_len << 3) & 0x0ffffffff);

			for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
				for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
				for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
				A = H0;
				B = H1;
				C = H2;
				D = H3;
				E = H4;
				for (i = 0; i <= 19; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}
				for (i = 20; i <= 39; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}
				for (i = 40; i <= 59; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}
				for (i = 60; i <= 79; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}
				H0 = (H0 + A) & 0x0ffffffff;
				H1 = (H1 + B) & 0x0ffffffff;
				H2 = (H2 + C) & 0x0ffffffff;
				H3 = (H3 + D) & 0x0ffffffff;
				H4 = (H4 + E) & 0x0ffffffff;
			}

			var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

			return temp.toLowerCase();
		}
	};

	const _Tools = {
		cleanUrl: (url) => {
			const URL_PREFIX = ['http://www.', 'http://', 'https://www.', 'https://', 'www.'];
			URL_PREFIX.forEach((str) => {
				url = url.startsWith(str) ? url.replace(str, '') : url;
			});
			return url;
		},
		validatePageURL: (customURL) => {
			const regexp = /(https?|http?|ftp):\/\/[^\s\/$.?#].[^\s]*$/;
			let test = regexp.test(customURL);
			return test;
		},
		validateUserIdLength: (userId) => {
			if (userId && userId.length > _maxUserIdSize) {
				return false;
			}
			return true;
		},
		validateUserId: (userId) => {
			if (userId &&
				(userId == ' ' ||
					userId.toLowerCase() == "null" ||
					userId.toLowerCase() == "none" ||
					userId.toLowerCase().includes("undefine"))
			) {
				return false;
			}

			return true;
		},
		validateEmail: (email) => {
			const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regexp.test(email);
		},
		getUrlParams: function (url) {

			// get query string from url (optional) or window
			var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

			// we'll store the parameters here
			var obj = {};

			// if query string exists
			if (queryString) {

				// stuff after # is not part of query string, so get rid of it
				queryString = queryString.split('#')[0];

				// split our query string into its component parts
				var arr = queryString.split('&');

				for (var i = 0; i < arr.length; i++) {
					// separate the keys and the values
					var a = arr[i].split('=');

					// set parameter name and value (use 'true' if empty)
					var paramName = a[0];
					var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

					// (optional) keep case consistent
					paramName = paramName.toLowerCase();
					if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

					// if the paramName ends with square brackets, e.g. colors[] or colors[2]
					if (paramName.match(/\[(\d+)?\]$/)) {

						// create key if it doesn't exist
						var key = paramName.replace(/\[(\d+)?\]/, '');
						if (!obj[key]) obj[key] = [];

						// if it's an indexed array e.g. colors[2]
						if (paramName.match(/\[\d+\]$/)) {
							// get the index value and add the entry at the appropriate position
							var index = /\[(\d+)\]/.exec(paramName)[1];
							obj[key][index] = paramValue;
						} else {
							// otherwise add the value to the end of the array
							obj[key].push(paramValue);
						}
					} else {
						// we're dealing with a string
						obj[paramName] = paramValue;
					}
				}
			}
			//convert arrays to string
			Object.keys(obj).forEach(key => {
				if (Array.isArray(obj[key])) obj[key] = _Tools.convertUTMArray(obj[key]);
			});
			return obj;
		},

		convertUTMArray: function (paramValue) {
			paramValue = paramValue.toString();
			paramValue = paramValue.replace(/,/g, "_");
			paramValue = paramValue.toLowerCase();
			return paramValue;
		},

		getUserLanguage: function () {
			var language = navigator.language.toLowerCase();
			if (language == 'chrome://global/locale/intl.properties') {
				language = null;
			}
			return language;
		},

		generateUUID: function () {
			let d = new Date().getTime();//Timestamp
			let d2 = (performance && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				let r = Math.random() * 16;//random number between 0 and 16
				if (d > 0) {//Use timestamp until depleted
					r = (d + r) % 16 | 0;
					d = Math.floor(d / 16);
				} else {//Use microseconds since page-load if supported
					r = (d2 + r) % 16 | 0;
					d2 = Math.floor(d2 / 16);
				}
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
		}
	};

	// ---------------------------------------
	// Function: init
	// Args: token, confversion, callback, logLevel
	// The SDK initialize function.
	// ---------------------------------------
	const init = (token, confversion = null, callback, logLevel) => {
		if (logLevel) {
			logger.setLevel(logLevel);
		}
		_env = getPersistedSDKLocalData(envKey) || _env;
		persistSDKLocalData(envKey, _env);

		_hostname = window.location.hostname;
		_coreEvents = optimoveCoreEvents;
		//load script
		confversion = _env == 'prod' ? 'web-configuration.1.0.0' : 'web-configuration.1.0.0-stg';
		_configuration = self.optimoveTenantConfiguration;
		if (!_configuration) {
			_configFileUrl = _sdkDomain + 'webconfig/' + token + '/' + confversion + '.js';
			loadScript(_configFileUrl, () => {
				logger.log('info', 'configuration loaded successfully');
				logger.log('info', 'core events loaded successfully');

				setConfiguration(() => {
					// set an identity
					generateVisitorId();

					// ### begin. Optimobile must be initialized before any usage!
					if (_configuration.enableWebPush) {
						logger.log('info', 'call initializeOptimobile');
						optimobileModule.initializeOptimobile();
					}
					// ### end

					if (_configuration.enableOptitrack) {
						logger.log('info', 'call initializeOptiTrack');
						optitrackModule.initializeOptiTrack(() => {
							optitrackModule.logMetadataCoreEvent().then(data => {
								if (callback && typeof callback === 'function') {
									callback();
								}
							});
						});
					}
					if (_configuration.enableRealtime) {
						logger.log('info', 'call initializeRealtime');
						realtimeModule.initializeRealtime();
					}

					if (optmvIsOpen()) {
						optimoveSDK.API.openWebTestTool();
					}
				});
			});
		} else {
			setConfiguration(() => {
				// set an identity
				generateVisitorId();
				// ### begin. Optimobile must be initialized before any usage!
				if (_configuration.enableWebPush) {
					logger.log('info', 'call initializeOptimobile');
					optimobileModule.initializeOptimobile();
				}
				// ### end

				if (_configuration.enableOptitrack) {
					logger.log('info', 'call initializeOptiTrack');
					optitrackModule.initializeOptiTrack(() => {
						optitrackModule.logMetadataCoreEvent().then(data => {
							if (callback && typeof callback === 'function') {
								callback();
							}
						});
					});
				}
				if (_configuration.enableRealtime) {
					logger.log('info', 'call initializeRealtime');
					realtimeModule.initializeRealtime();
				}


			});
		}
	};

	const setConfiguration = (callback) => {
		_configuration = self.optimoveTenantConfiguration;
		getPlaformInfoFromUserAgent(_configuration);
		if (callback && typeof callback === 'function') {
			callback();
		}
	};

	// ---------------------------------------
	// Function: loadScript
	// Args: url, callback
	// loading Scripts.
	// ---------------------------------------
	const loadScript = function (url, callback) {
		let script = document.createElement("script");
		script.type = "text/javascript";
		script.async = false;
		script.defer = false;
		script.src = url;
		document.head.appendChild(script);
		if (script.readyState) {
			//IE
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else {
			script.onload = function () {
				callback();
			};
		}

	};

	const eventsHandler = (() => {

		let events = [];

		/**
		 * Log event into array of events
		 * @param eventName
		 * @param parameters
		 * @param userInfo
		 */
		const logEvent = (eventName, parameters, userInfo) => {
			try {
				parameters = parameters || {};
				//let validations = validateEvent(eventName, parameters);
				let visitorValue;
				let customerValue;

				if (typeof parameters === 'object' && Object.keys(parameters).length > 0) {
					parameters = normalizeEventParameters(parameters);
				} else {
					parameters = {};
				}

				Object.assign(parameters, getAdditionalAttributesToEvent());

				if (userInfo && eventName != keySetUserIdEvent) {
					visitorValue = userInfo.updatedVisitorId;
					customerValue = userInfo.userId;
				} else if (eventName == keySetUserIdEvent) {
					visitorValue = parameters.updatedVisitorId;
					customerValue = parameters.userId;
				} else {
					visitorValue =  getVisitorId();
					customerValue = getUserId();
				}

				let payload = {
					tenant: _configuration.optitrackMetaData.siteId,
					category: getEventCategory(eventName),
					origin: 'sdk',
					event: eventName,
					context: parameters,
					timestamp: new Date().toISOString(),
					metadata: {
						firstVisitorDate: getFirstVisitDate(),
						eventId: _Tools.generateUUID(),
						sdk_platform: 'web',
						sdk_version: _version
					},
					visitor: visitorValue,
					customer: customerValue
				};
				events.push(payload);
			} catch (e) {
				logger.log('error', `could not log event: ${eventName} error log: ${e}`);
			}
		};

		/**
		 * validateEvent
		 * Validate the Events Data with the Event Configuratrion.
		 * The Event should have as minimum the mandatoric parameters
		 * @param eventName
		 * @param parameters
		 * @returns {boolean|[]}
		 */
		const validateEvent = (eventName, parameters) => {
			let validEvent = {};
			let eventConf = getEventConfiguration(eventName);
			let validations = [];
			validEvent.isMainRow = true;

			if (!eventConf) {
				logger.log('error', `event: ${eventName} does not exist`);
				if (optmvIsOpen()) {
					validEvent.errorMessage = 'Event name is unavailable. It has not been configured properly';
					//convertOptieventToTestToolevent(validEvent, false);
				}

				validations.push({
					status: 1010,
					message: `'${eventName}' is an undefined event`
				});

				return validations;
			}

			validEvent['userId'] = parameters && parameters.userId ? parameters.userId : getUserId();
			validEvent['visitorData'] = null;
			validEvent['eventName'] = eventName;
			validEvent['eventMetadata'] = eventConf;
			validEvent['parameters'] = parameters;
			validations = parameterValidation(eventName, parameters, eventConf);

			if (validations.length && optmvIsOpen()) {
				// For the use of the SDK Test Tool
				validEvent.errorMessage = validations[0].message;
				//convertOptieventToTestToolevent(validEvent, false);

				return validations;
			}


			if (optmvIsOpen()) {
				//convertOptieventToTestToolevent(validEvent, true);
			}

			return validations;
		};

		/**
		 * parameterValidation
		 * Validate the Events Parameters Data with the Event Configuratrion.
		 * The Event should have as minimum the mandatoric parameters.
		 * Handling the Scenario of receiving parameters = null.
		 * In this case  we check whether the Events parameters have a mandatoric parameters.
		 * @param eventName
		 * @param parameters
		 * @param eventConf
		 * @returns {[]}
		 */
		const parameterValidation = (eventName, parameters, eventConf) => {
			try {
				let paramMetadata;
				let validations = [];
				eventConf = eventConf || {};
				parameters = parameters || {};

				//Check if number of parameters not exceeding the maximum number of params allowed
				let paramsNumber = Object.keys(parameters).length;
				if (paramsNumber > _configuration.optitrackMetaData.maxActionCustomDimensions) {
					logger.log('warning', `event ${eventName} contains ${paramsNumber} parameters while the allowed number of parameters is ${_configuration.optitrackMetaData.maxActionCustomDimensions}. We removed some of them to process the event.`);
					validations.push({
						status: 1020,
						message: `event '${eventName}' contains ${paramsNumber} parameters while the allowed number of parameters is ${_configuration.optitrackMetaData.maxActionCustomDimensions}. Some parameters were removed to process the event.`
					});
				}

				//Check if all mandatory params are reported with the event
				if (eventConf.parameters != null) {
					let config_parameters_keys = Object.keys(eventConf.parameters);
					config_parameters_keys.forEach((param_name) => {
						if (eventConf.parameters[param_name].optional == false) {
							if (!parameters || (parameters && (typeof parameters[param_name] == 'undefined' || parameters[param_name] == null))) {
								logger.log('error', `event ${eventName} has mandatory parameter ${param_name} which is undefined or empty`);
								validations.push({
									status: 1040,
									message: `event ${eventName} has a mandatory parameter, '${param_name}', which is undefined or empty.`
								});
							}
						}
					});
				}

				//Check that the Object of parameters is legit and parameters' types as defined.
				if (parameters) {
					for (let parameterName in parameters) {
						if (parameters[parameterName] && typeof parameters[parameterName] == 'string' && parameters[parameterName].length > _maxParamValueSize) {
							logger.log('error', `parameter ${parameterName} has exceeded the limit of allowed number of characters (${_maxParamValueSize})`);
							validations.push({
								status: 1050,
								message: `'${parameterName}' has exceeded the limit of allowed number of characters. The character limit is ${_maxParamValueSize}.`
							});
						}
						paramMetadata = eventConf.parameters[parameterName];
						let parameterConfigurationCheck = checkForConfigurationMatch(parameterName, parameters[parameterName], paramMetadata);
						if (parameterConfigurationCheck.length > 0) {
							validations = validations.concat(parameterConfigurationCheck);
						}
					}
					switch (eventName) {
						case keySetUserIdEvent:
							if (!_Tools.validateUserIdLength(parameters.userId)) {
								logger.log('error', `userId, '${parameters.userId}', is too long, the userId limit is ${_maxUserIdSize}.`);
								validations.push({
									status: 1071,
									message: `userId, '${parameters.userId}', is too long, the userId limit is ${_maxUserIdSize}.`
								});
							}
							if (!_Tools.validateUserId(parameters.userId)) {
								logger.log('error', `userId, '${parameters.userId}', is invalid.`);
								validations.push({
									status: 1070,
									message: `userId, '${parameters.userId}', is invalid.`
								});
							}
							break;
						case keySetEmailEvent:
							if (!_Tools.validateEmail(parameters.email)) {
								logger.log('error', `Email, '${parameters.email}', is invalid.`);
								validations.push({
									status: 1080,
									message: `Email, '${parameters.email}', is invalid.`
								});
							}
							break;
						case keySetPageVisitEvent:
							if (!_Tools.validatePageURL(parameters.customURL)) {
								logger.log('error', `URL, '${parameters.customURL}', is invalid.`);
								validations.push({
									status: 1090,
									message: `URL, '${parameters.customURL}', is invalid.`
								});
							}
					}
				}

				return validations;
			} catch (e) {
				logger.log('error', `could not validate parameters for event ${eventName} error: ${e}`);
			}
		};

		/**
		 * checkForConfigurationMatch
		 * Go over the parameters trying to match their type to the configuration definition.
		 * @param parameterName
		 * @param parameterValue
		 * @param paramMetadata
		 * @returns {[]}
		 */
		const checkForConfigurationMatch = (parameterName, parameterValue, paramMetadata) => {
			let validations = [];

			if (parameterValue != undefined && !paramMetadata) {
				logger.log('warning', `parameter '${parameterName}' has not been configured for this event. It will not be tracked and cannot be used within a trigger.`);
				validations.push({
					status: 1030,
					message: `parameter '${parameterName}' has not been configured for this event. It will not be tracked and cannot be used within a trigger.`
				});
			}

			if (parameterValue != undefined && paramMetadata) {
				let message = '';
				if (paramMetadata.type === "String" && typeof parameterValue !== "string") {
					logger.log('error', `parameter '${parameterName}' should be of TYPE String.`);
					message = `parameter '${parameterName}' should be of TYPE String.`;
				} else if (paramMetadata.type === "Number" && typeof parameterValue != "number") {
					logger.log('error', `parameter '${parameterName}' should be of TYPE Number.`);
					message = `parameter '${parameterName}' should be of TYPE Number.`;
				} else if (paramMetadata.type === "Boolean" && typeof parameterValue !== "boolean") {
					logger.log('error', `parameter '${parameterName}' should be of TYPE Boolean.`);
					message = `parameter '${parameterName}' should be of TYPE Boolean.`;
				}
				if (message.length > 0) {
					validations.push({
						status: 1060,
						message: message
					});
				}
			}

			return validations;
		};

/*		/!**
		 * Get event configuration from the configuration global file or tenant's configuration
		 * @param eventName
		 * @returns {*}
		 *!/
		const getEventConfiguration = (eventName) => {
			let eventConf;

			if (_coreEvents.events.hasOwnProperty(eventName)) {
				eventConf = _coreEvents.events[eventName];
			} else {
				eventConf = _configuration.events[eventName] || null;
			}

			return eventConf;
		};*/

		/**
		 * Report event to endpoint provided with the payload provided
		 * @param endpoint
		 * @param payload
		 // * @returns {Promise<{response: any, event: *}>}
		 */
		const report = async (endpoint, payload) => {
			let events = [];
			payload.forEach((event) => {
				events.push(event.event);
			});
			return await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-Request-ID': _Tools.generateUUID()
				},
				body: JSON.stringify(payload)
			})
				.then(response => response.json())
				.then(data => {
					logger.log('info', `event${events.length > 1 ? 's' : ''} ${events.join(', ')} reported to ${endpoint} successfully`);
					return {
						payload: payload,
						response: data
					};
				})
				.catch(error => {
					logger.log('error', `event${events.length > 1 ? 's' : ''} ${events.join(', ')} not reported to ${endpoint} due to ${error}`)
					return {
						payload: payload,
						response: error
					};
				});
		};

		/**
		 * Dispatch the events in the array of events
		 * @returns {Promise<unknown[]>}
		 */
		const dispatch = async () => {
			let optitrackEvents = [];
			let realtimeEvents = [];

			if (!events.length) {
				return;
			}

			events.forEach((event) => {
				//let eventConf = getEventConfiguration(event.event);
				// Event should always be reported to OptiStream, even if not exist.
				optitrackEvents.push(event);
				realtimeEvents.push(event);
				// Event should be reported to Realtime only if has configuration and there are no validation issues (we send events with warnings but with no errors).
/*				if (eventConf && eventConf.supportedOnRealTime) {
					let shouldSendToRealTime = true;
					if ((event.metadata && event.metadata.validations) && Array.isArray(event.metadata.validations) && event.metadata.validations.length > 0) {
						//let validationArrayLength = event.metadata.validations.length;

						for (let i = 0; i < validationArrayLength; i++) {
							if (errorValidationNumbers.includes(event.metadata.validations[i].status)) {
								shouldSendToRealTime = false;
								break;
							}
						}
					}

					if (shouldSendToRealTime) {
						realtimeEvents.push(event);
					}
				}*/
			});

			// ### begin
            if (_configuration.enableWebPush) {
                optimobileModule.reportEventsToOptimobile(events);
            }
            // ### end

			events = [];
			let dispatchToTrack = _configuration.enableOptitrack && optitrackEvents.length > 0 ? await report(optitrackModule.getOptitrackEndpoint(), optitrackEvents) : await Promise.resolve();
			let dispatchToRealtime = _configuration.enableRealtime && realtimeEvents.length > 0 ? await report(realtimeModule.getRealtimeEndpoint(), realtimeEvents).then(data => {
				realtimeModule.postRealtimeEvent(data);
			}) : await Promise.resolve();

			return Promise.all([dispatchToTrack, dispatchToRealtime])
				.then(data => {
					return data;
				});
		};

		/**
		 * Get the category of the event by the event name.
		 * @param eventName
		 * @returns {string}
		 */
		const getEventCategory = (eventName) => {
			if (eventName == keyWebPopupDisplayed) {
				return 'popup';
			}
			return 'track';
		};

		return {
			logEvent: logEvent,
			dispatch: dispatch
		};
	})();

	/**
	 * Set data in Local Storage
	 * @param key
	 * @param updatedValue
	 */
	const persistSDKLocalData = (key, updatedValue) => {
		try {
			let currValue = localStorage.getItem(key);
			if (currValue == null || currValue != updatedValue) {
				localStorage.setItem(key, updatedValue);
			}
		} catch (error) {
			logger.log('error', `OptimoveSDK: persistSDKLocalData() Failed error = ${error}`);
		}
	};

	/**
	 * Get data from Local Storage
	 * @param key
	 * @returns {string|null}
	 */
	const getPersistedSDKLocalData = (key) => {
		try {
			let value = localStorage.getItem(key);
			if (value != null) {
				return value;
			}
		} catch (error) {
			logger.log('error', `OptimoveSDK: getPersistedSDKLocalDatas () Failed error = ${error}`);
			return null;
		}
	};

	/**
	 * Get Visitor ID
	 * If visitorId not exist in Local Storage, then return null
	 * @returns {{value: string, key: *}|null}
	 */
	const getVisitorId = () => {
		return getPersistedSDKLocalData(visitorIDKey) || null;
	};

	/**
	 * Set Visitor ID
	 * This reflects the updated visitorId
	 * @param visitorId
	 */
	const setVisitorId = (visitorId) => {
		persistSDKLocalData(visitorIDKey, visitorId);
	};

	/**
	 * Generates visitorId as UUID if not exist in Local Storage
	 * In case generating a new visitorId, persisting it in Local Storage
	 * @returns {{value: string, key: *}|null|undefined} the generated visitorId
	 */
	const generateVisitorId = () => {
		let visitorId = getPersistedSDKLocalData(visitorIDKey);
		let originalVisitorId = getPersistedSDKLocalData(originalVisitorIDKey);
		if (!visitorId) {
			visitorId = _Tools.generateUUID();
			persistSDKLocalData(visitorIDKey, visitorId);
		}
		if (!originalVisitorId) {
			// Backward Compatibility - get old Original Visitor Id from Piwik's cookie
			let cookieName = `_pk_id.${_configuration.optitrackMetaData.siteId}.`;
			let cookieOriginalVisitorIdString = document.cookie.match(new RegExp('(^| )' + cookieName + '.{1,}=([^;]+)'));
			let cookieOriginalVisitorId = Array.isArray(cookieOriginalVisitorIdString) && cookieOriginalVisitorIdString[2] != null ? cookieOriginalVisitorIdString[2].split('.')[0] : null;
			persistSDKLocalData(originalVisitorIDKey, cookieOriginalVisitorId || visitorId);
			persistSDKLocalData(visitFirstDateKey, new Date().toISOString());
		}
		return visitorId;
	};

	/**
	 * Get Original Visitor ID
	 * If originalVisitorId not exist in Local Storage, then return null
	 * @returns {{value: string, key: *}|null}
	 */
	const getOriginalVisitorId = () => {
		return getPersistedSDKLocalData(originalVisitorIDKey) || null;
	};

	/**
	 * Set Original Visitor ID
	 * This reflects the originalVisitorId
	 * @param visitorId
	 */
	const setOriginalVisitorId = (originalVisitorId) => {
		persistSDKLocalData(originalVisitorIDKey, originalVisitorId);
	};

	/**
	 * Get User ID.
	 * If userId not exist in Local Storage, then return null
	 * @returns {{value: string, key: *}|null}
	 */
	const getUserId = () => {
		return getPersistedSDKLocalData(clientCustomerIDKey);
	};

	/**
	 * Set User ID
	 * Store it in Local Storage
	 * @param userId
	 */
	const setUserId = (userId) => {
		persistSDKLocalData(clientCustomerIDKey, userId);
	};

	/**
	 * Get user info
	 * @returns {{userId: ({value: string, key: *}|null), originalVisitorId: *, updatedVisitorId: ({value: string, key: *}|null)}}
	 */
	const getUserInfo = () => {
		return {
			userId: getUserId(),
			originalVisitorId: getOriginalVisitorId(),
			updatedVisitorId: getVisitorId()
		};
	};

	/**
	 * Get first visit date for Realtime metadata
	 * @returns {string|null}
	 */
	const getFirstVisitDate = () => {
		return getPersistedSDKLocalData(visitFirstDateKey) || null;
	};

	/**
	 * Checks if the Web SDK Test Tool is open by checking what is in the session storage.
	 * @returns {boolean}
	 */
	const optmvIsOpen = () => {
		try {
			let a = window.sessionStorage.getItem('isSideBarShouldBeOpen');
			return a == 'true' ? true : false;
		} catch (error) {
		logger.log('error', `Web sdk test tool : session storage access has failed :  ${error}`);
	}
	};

	// ---------------------------------------
	// Function: normalizeEventParameters
	// Args: event_parameters
	// Normalizing the event parameters values
	// ---------------------------------------
	const normalizeEventParameters = (event_parameters) => {
		if (event_parameters == null) {
			logger.log('info', 'normalizeEventParameters: event parameter is null');
			return;
		}

		let parameterNames = Object.getOwnPropertyNames(event_parameters);
		let counter = 1;
		parameterNames.forEach((paramName) => {
			if (counter > _configuration.optitrackMetaData.maxActionCustomDimensions) {
				//in case the number of parameters is exceeding the allowed number, we remove some of them.
				delete (event_parameters[paramName]);
			} else {
				let currParamValue = event_parameters[paramName];
				if (typeof currParamValue == "string") {
					let normalizedValue = currParamValue.trim();
					//normalizedValue = normalizedValue; // removed toLowerCase on item 24296
					event_parameters[paramName] = normalizedValue;
				}
			}
			if (paramName == 'customURL') {
				//In case of URL parameter from set page visit event, the URL should be cleaned from the protocol (http/s)
				event_parameters[paramName] = _Tools.cleanUrl(event_parameters[paramName]).toLowerCase();
			}
			counter++;
		});
		return event_parameters;
	};

	// ---------------------------------------
	// Function: getPlaformInfoFromUserAgent
	// Args: null
	// Description: runs through the User-Agent
	// ---------------------------------------
	const getUAInfoAsync = (configuration, callback) => {

		var useragent = window.navigator.userAgent;
		var xmlhttp = new XMLHttpRequest();
		var url = configuration.sdkServicesEndPoint;
		var XMLHttpRequest_Done = 4;
		xmlhttp.open("GET", url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

		xmlhttp.onreadystatechange = function () {
			try {
				if (xmlhttp.readyState == XMLHttpRequest_Done && xmlhttp.status == 200) {
					var responseData = JSON.parse(xmlhttp.responseText);
					logger.log("info", responseData);
					if (callback) {
						callback(responseData);
					}
				}
			} catch (err) {
				logger.log("error", err);
			}
		};

		xmlhttp.send();
	};

	// ---------------------------------------
	// Function: UserAgentcallBackFunc
	// Args: null
	// Description: runs through the User-Agent
	// ---------------------------------------
	//userAgent Parts: window.navigator.userAgent
	// appCodeName/appVersion number
	// (Platform; Security; OS-or-CPU;Localization; rv: revision-version-number)
	//  product/productSub Application-Name Application-Name-version
	//{
	//   "ua": "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36",
	//   "browser": {
	//     "name": "Chrome WebView",
	//     "version": "43.0.2357.65",
	//     "major": "43"
	//   },
	//   "engine": {
	//     "name": "WebKit",
	//     "version": "537.36"
	//   },
	//   "os": {
	//     "name": "Android",
	//     "version": "5.1.1"
	//   },
	//   "device": {
	//     "vendor": "LG",
	//     "model": "Nexus 5",
	//     "type": "mobile"
	//   },
	//   "cpu": {}
	// }
	// ---------------------------------------
	const UserAgentcallBackFunc = (responseData) => {
		let deviceType = "desktop";
		let nativeMobile = "false";
		let platform = "windows";
		let deviceOS = "";
		if (typeof responseData != 'undefined') {
			let osName = responseData.os.name;
			let osVersion = responseData.os.version;
			platform = osName;
			deviceOS = osName + " " + osVersion;
			let deviceInfoKeys = Object.keys(responseData.device);
			if (deviceInfoKeys.length > 0) {
				if (typeof responseData.device.type != 'undefined') {
					deviceType = responseData.device.type;
					logger.log("info", "found deviceType=" + deviceType);
				}
			}

			persistSDKLocalData(eventPlatformIDKey, platform);
			persistSDKLocalData(eventDeviceTypeIDKey, deviceType);
			persistSDKLocalData(eventOSIDKey, deviceOS);
			persistSDKLocalData(eventNativeMobile, nativeMobile);
		}
	};

	// ---------------------------------------
	// Function: getPlaformInfoFromUserAgent
	// Args: null
	// Description: runs through the User-Agent
	// ---------------------------------------
	const getPlaformInfoFromUserAgent = (configuration) => {
		let platform = getPersistedSDKLocalData(eventPlatformIDKey);
		if (typeof platform == 'undefined') {
			getUAInfoAsync(configuration, UserAgentcallBackFunc);
		}

	};

	// ---------------------------------------
	// Function: getVisitorsInfoObj
	// Args: null
	// Description: Get Optitrack Visitor Info
	// ---------------------------------------
	const getVisitorsInfoObj = () => {
		let visitorsInfo = optitrackModule.getOptitrackVisitorInfo();
		let visitorInfoObject = new Object();

		if (visitorsInfo != undefined) {
			visitorInfoObject.visitorId = visitorsInfo[1];
			visitorInfoObject.visitCount = visitorsInfo[3];
		} else {
			logger.log("error", "in getVisitorsInfoObj Optitrack");
			visitorInfoObject = undefined;
		}

		return visitorInfoObject;
	};

	const getAdditionalAttributesToEvent = () => {
		return {
			event_platform: getPersistedSDKLocalData(eventPlatformIDKey),
			event_device_type: getPersistedSDKLocalData(eventDeviceTypeIDKey),
			event_os: getPersistedSDKLocalData(eventOSIDKey),
			event_native_mobile: getPersistedSDKLocalData(eventNativeMobile)
		};
	}

	const gamifyModule = (() => {
		let _overlay = null;

		const open = (widgetUrl, userId, token) => {
			if (_overlay) return;

			const overlay = document.createElement('div');
			overlay.id = 'optiGamifyOverlay';
			overlay.style.cssText =
				'position:fixed;top:0;left:0;width:100%;height:100%;' +
				'z-index:99999;background:#000;border:none;margin:0;padding:0;';

			const iframe = document.createElement('iframe');
			iframe.src = widgetUrl;
			iframe.style.cssText = 'width:100%;height:100%;border:none;';
			iframe.allow = 'fullscreen';

			overlay.appendChild(iframe);
			document.body.appendChild(overlay);
			_overlay = overlay;

			function _handleMessage(event) {
				try {
					const data = typeof event.data === 'string'
						? JSON.parse(event.data)
						: event.data;

					if (data && data.type === 'READY') {
						iframe.contentWindow.postMessage(
							JSON.stringify({ type: 'INIT', userId: userId || null, token: token || null }),
							'*'
						);
					} else if (data && data.type === 'CLOSE') {
						close();
					}
				} catch (e) {
					// Ignore non-JSON messages from other origins
				}
			}

			window.addEventListener('message', _handleMessage);
			_overlay._messageHandler = _handleMessage;
		};

		const close = () => {
			if (!_overlay) return;
			if (_overlay._messageHandler) {
				window.removeEventListener('message', _overlay._messageHandler);
			}
			document.body.removeChild(_overlay);
			_overlay = null;
		};

		return { open, close };
	})();

	const realtimeModule = (() => {
		let _popup;
		let _executionInProcess = false;
		let _rt_endpoint = '';

		const initializeRealtime = (callback) => {
			_rt_endpoint = getRealtimeEndpointFromConfig();
			if (callback && typeof callback === 'function') {
				callback();
			}
		};

		const closePopup = (element) => {
			if (element) {
				if (element === true || element.target == document.getElementById('optiRealPopupDimmer') || element.target.id == "optiRealclosePopupImage") {
					document.body.removeChild(_popup);
					document.removeEventListener('mousedown', closePopup);
				}
			}
		};

		const executePopup = (html) => {
			try {
				let popupDiv = document.createElement('div');
				let divHtml = '';
				let opacity = _configuration.realtimeMetaData.options.showDimmer ? 0.5 : 0;
				divHtml =
					"<div id='optiRealPopupDimmer' style='position: fixed;bottom: 0;right: 0;top: 0;left: 0;overflow: hidden;display: none; z-index:999999999;background: #000000;opacity : " +
					opacity +
					";display:block;width: auto;height: auto;'></div>";
				document.addEventListener("mousedown", closePopup);
				let poweredByHtml =
					"<div style='position: absolute;z-index:9999999999; clear:both;font-family : Arial;font-size : 9px;color : #CCCCCC;padding-top:6px;margin-left: 5px;'>Powered by Optimove</div>";
				divHtml +=
					"<div style='max-height:90%;max-width:90%;top: 50%;left: 50%;transform:translate(-50%, -50%);position: fixed;z-index:9999999999;'><div style=' clear:both;min-width: 100px;min-height: 100px;background-color:white; text-align:center;box-shadow:0 0 5px 0 rgba(0, 0, 0, 0.2);'><div style='position:absolute;right:-13px;top:-13px;cursor:pointer;z-index:99999999999; color:white' onclick='optimoveSDK.API.closeRealtimePopup();'><img id='optiRealclosePopupImage' src='https://d3qycynbsy5rsn.cloudfront.net/banner_pop_x.png' /></div><div>" +
					html +
					"</div></div>" +
					(_configuration.realtimeMetaData.options.showDimmer &&
					_configuration.realtimeMetaData.options.showWatermark ?
						poweredByHtml :
						"") +
					"</div>";
				popupDiv.innerHTML = divHtml;
				_popup = popupDiv;
				document.body.appendChild(popupDiv);
				let scriptTags = popupDiv.getElementsByTagName("script");
				if (scriptTags.length > 0) {
					window.eval(scriptTags[0].innerText);
				}
			} catch (err) {
				logger.log('error', `Error while executing popup ${err}`);
			}
		};

		/**
		 * Should execute checks if the popup should execute and display on the screen
		 * The local storage counter is valid only if the date in the local storage is valid => datetime has not passed.
		 * if it passed I should take the counter information from the response.
		 * @param visitorId
		 * @param campaignId
		 * @param recurrenceFrameStopTime
		 * @param recurrenceLeft
		 * @returns {boolean}
		 */
		const shouldExecute = (visitorId, campaignId, recurrenceFrameStopTime, recurrenceLeft) => {
			if (!campaignId || typeof (campaignId) == 'undefined' || campaignId == 0) {
				return false;
			}
			if (recurrenceLeft == null || recurrenceFrameStopTime == null) {
				return true;
			}
			let lsCampaign = localStorage.getItem('optimove_popup_' + campaignId + '_' + visitorId);
			let obj = {};
			if (lsCampaign) {
				lsCampaign = JSON.parse(lsCampaign);
				let d1 = new Date(lsCampaign.recurrenceFrameStopTime); // timeFrame we have in local storage
				let d2 = new Date(new Date().toISOString()); // Current time
				let minCounter;
				if (d1 > d2) {
					minCounter = Math.min(recurrenceLeft, lsCampaign.recurrenceLeft);
				} else {
					minCounter = recurrenceLeft;
					obj.recurrenceFrameStopTime = recurrenceFrameStopTime
				}
				recurrenceLeft = minCounter;
			}
			obj.recurrenceFrameStopTime = recurrenceFrameStopTime;
			obj.recurrenceLeft = recurrenceLeft - 1;
			localStorage.setItem('optimove_popup_' + campaignId + '_' + visitorId, JSON.stringify(obj));
			if (recurrenceLeft <= 0) {
				return false;
			}
			return true;
		};

		const postRealtimeEvent = async (data) => {
			try {
				let responseData = data.response;
				if (responseData.IsSuccess && responseData.Data && responseData.Metadata) {
					if (!responseData.Metadata.delayValue) {
						responseData.Metadata.delayValue = 0;
					}
					let campaignId = responseData.Metadata.campaignDetailId ? parseInt(responseData.Metadata.campaignDetailId) : 1;
					let templateId = responseData.Metadata.templateId ? parseInt(responseData.Metadata.templateId) : 0;
					let actionChannelId = responseData.Metadata.actionChannelId ? parseInt(responseData.Metadata.actionChannelId) : 0;
					let sendId = responseData.Metadata.sendId ? responseData.Metadata.sendId : null;

					if (!_executionInProcess) {
						_executionInProcess = true;
						setTimeout(() => {
							if (shouldExecute(data.visitorId, campaignId, responseData.Metadata.recurrenceFrameStopTime, responseData.Metadata.recurrenceLeft)) {
								if (_configuration.realtimeMetaData.options.popupCallback) {
									//In case the user sends their own popup html code with their own rendering function
									_configuration.realtimeMetaData.options.popupCallback(responseData);
								} else {
									//Optimove's implementation of rendering the popup template - created in Optimove
									executePopup(responseData.Data);
								}
								// report core event 1008
								let eventHandler = eventsHandler;
								eventHandler.logEvent(keyWebPopupDisplayed, {
									'campaign_detail_id': campaignId,
									'template_id': templateId,
									'action_channel_id': actionChannelId,
									'send_id': sendId
								});
								eventHandler.dispatch().then(data => {
									_executionInProcess = false;
									return data;
								});
							}
						}, responseData.Metadata.delayValue * 1000);
					}
				}
			} catch (err) {
				logger.log('error', err);
			}
		};

		const getRealtimeEndpointFromConfig = () => {
			return `${_configuration.realtimeMetaData.realtimeGateway}reportEvent`;
		};

		return {
			initializeRealtime: initializeRealtime,
			postRealtimeEvent: postRealtimeEvent,
			executePopup: executePopup,
			closePopup: closePopup,
			getRealtimeEndpoint: getRealtimeEndpointFromConfig
		};
	})();

	const optitrackModule = (() => {
		// ------------------------------ Event Const Values ------------------------------
		var SetUserIdEvent_name = "set_user_id_event";
		var SetEmailEvent_name = "set_email_event";
		var originalVisitorId_param_name = "originalVisitorId";
		var userId_param_name = "userId";
		var updatedVisitorId_param_name = "updatedVisitorId";

		var userAgentIDKey = "11602c8b76fe7626ca586081b94892e4";
		var liveRampIDKey = "4007d0a432ab6289711974163b25a06d";
		var datonicsIDKey = "75f8c5fdab43daca991a35c854a5a6d2";
		var googlCookieMatchIDKey = "634beb77779dc8025e7615cf95fce8f7";
		var isReportedCoreMetadata = "a5c127e180652c82e615be143677e248";

		// ------------------------------ Optitrack private variables ------------------------------
		let _ot_endpoint = null;
		let _pageVisitCount = 0;
		let _previousPageUrl = "";

		// ------------------------------ SDK public member functions ------------------------------

		// ---------------------------------------
		// Function: initialize
		// Args: logger - log object.
		// callback_ready - callba ckwhen initialization finished successfuly
		// Gets the Optimove SDK Verion
		// ---------------------------------------
		const initializeOptiTrack = (callback) => {
			_ot_endpoint = getOptiTrackEndpointFromConfig();
			if (callback && typeof callback === 'function') {
				callback();
			}
		};

		const reportOptitrackEvent = async (event, params) => {
			return reportEvent(event, params, _ot_endpoint);
		}

		// ---------------------------------------
		// Function: logUserEmail
		// Args: email
		// Log User email
		// ---------------------------------------
		const logUserEmail = function (email) {
			reportEvent(SetEmailEvent_name, {
				email: email
			}).catch((error) => {
				_logger.log("error", "OptiTrackModule:logOptitrackUserEmail Failed!!, error =  " + error);
			});
		};

		// ------------------------------ Optitrack Private member functions ------------------------------

		// ---------------------------------------
		// Function: getOptimoveStitchData
		// Args: URL
		// Gets the data from the URL which is used by
		// Optimove Stitch Flow.
		// return - JSON obj containng the optimovePublicCustomerId
		//  and the status.
		// ---------------------------------------
		const getOptimoveStitchData = function (currURL) {
			// We might have not Load the Piwik Yet
			var jsonData = {};
			jsonData["OptimoveStitchDataExist"] = false;
			var optimovePublicCustomerId = "OptimovePublicCustomerId";
			var optimoveVisitorId = "optimoveVisitorId";
			var optimoveStitchFlow = "OptimoveStitchFlow";
			var optimoveStitchDataExist = "OptimoveStitchDataExist";
			var isStitchFlow = false;
			try {
				var parts = currURL.split("&");
				if (parts.length > 0) {
					parts.forEach(function (item, index) {
						if (item.search(optimoveStitchFlow) > -1) {
							isStitchFlow =
								item.slice(optimoveStitchFlow.length + 1) == "true";
						} else {
							isStitchFlow = false;
						}

						if (isStitchFlow == true) {
							if (item.search(optimovePublicCustomerId) > -1) {
								var publicCustomerId = item.slice(
									optimovePublicCustomerId.length + 1
								);
								jsonData[optimovePublicCustomerId] = publicCustomerId;
							}
							if (item.search(optimoveVisitorId) > -1) {
								var vistorId = item.slice(optimoveVisitorId.length + 1);
								jsonData[optimoveVisitorId] = vistorId;
							}

							jsonData[optimoveStitchDataExist] = true;
						}
					});
				}
			} catch (error) {
				var errMsg =
					"OptiTrackModule:getOptimoveStitchData Failed!!, error =  " + error;
				_logger.log("error", errMsg);
			}
			return jsonData;
		};

		// ---------------------------------------
		// Function: logMetadataCoreEvent
		// Args:
		// Reports metadata core event to Optitrack in a session.
		// ---------------------------------------
		const logMetadataCoreEvent = async () => {
			// check if param "optitrackmetadatacoreevent" is true or (false or null)
			// if true, should return
			// if false, should report an event with metadata parameters
			// and then store in the session storage value true for this parameter.
			logger.log('info', 'OptiTrackModule: in logMetadataCoreEvent');

			let isReported = getPersistedSDKSessionData(isReportedCoreMetadata);
			if (isReported && isReported.value === 'true') {
				return;
			}

			let urlParams = _Tools.getUrlParams();

			let params = {
				sdk_platform: 'Web',
				sdk_version: _version,
				app_ns: _hostname,
				campaign_name: urlParams.utm_campaign ? urlParams.utm_campaign : null,
				campaign_keyword: urlParams.utm_term ? urlParams.utm_term : null,
				campaign_source: urlParams.utm_source ? urlParams.utm_source : null,
				campaign_medium: urlParams.utm_medium ? urlParams.utm_medium : null,
				campaign_content: urlParams.utm_content ? urlParams.utm_content : null,
				campaign_id: urlParams.utm_id ? urlParams.utm_id : null,
				language: _Tools.getUserLanguage()
			};

			if (_configFileUrl !== "")
			{
				params.config_file_url = _configFileUrl;
			}

			let eventHandler = eventsHandler;
			eventHandler.logEvent(keyCoreMetadataEvent, params);
			return eventHandler.dispatch()
				.then(data => {
					persistSDKSessionData(isReportedCoreMetadata, true);
					return data;
				})
				.catch(error => {
					logger.log('warning', `OptiTrackModule:logMetadataCoreEvent Failed!!, error = ${error}`);
				});

		};

		// ---------------------------------------
		// Function: getKeyId
		// Args: THIS
		// returns the User Info: including:
		// visitor_id, user_id, updatedVisitor_id.
		// updatedVisitor_id - is created after setUserId
		// ---------------------------------------
		var getKeyId = function (THIS, keyName) {
			try {
				var resultKeyId = null;
				switch (keyName) {
					case "datonics":
						resultKeyId = datonicsIDKey;
						break;
					case "liveRamp":
						resultKeyId = liveRampIDKey;
						break;
					case "googlCookieMatch":
						resultKeyId = googlCookieMatchIDKey;
						break;
					default:
						resultKeyId = null;
						break;
				}
				return resultKeyId;
			} catch (error) {
				var errMsg = "OptiTrackModule:getKeyId  Failed!!, error = " + error;
				_logger.log("error", errMsg);
			}
		};

		// ---------------------------------------
		// Function: logSetUserIdEvent
		// Args: THIS, origVisitorId, updatedUserId
		// Sets the in Optitrack Infrastructure User ID
		// ---------------------------------------
		const logSetUserIdEvent = function (origVisitorIdValue, updatedUserIdValue, updatedVisitorIdValue) {
			try {
				var eventConfig = getCustomEventConfigById(SetUserIdEvent_name);

				if (origVisitorIdValue == undefined || updatedUserIdValue == undefined) {
					logger.log("error", "OptiTrackModule:logSetUserIdEvent Failed!!, error = origVisitorIdValue == undefined || updatedUserIdValue == undefined ");
					return;
				}

				if (eventConfig != null) {
					var originalVisitorIdConfig = getCustomEventParamFromConfig(
						eventConfig,
						originalVisitorId_param_name
					);
					var updatedVisitorIdConfig = getCustomEventParamFromConfig(
						eventConfig,
						updatedVisitorId_param_name
					);
					var userIdParamConfig = getCustomEventParamFromConfig(
						eventConfig,
						userId_param_name
					);

					let event_parameters = {
						originalVisitorId: origVisitorIdValue,
						userId: getUserId(),
						updatedVisitorId: getVisitorId()
					};

					reportEvent(SetUserIdEvent_name, event_parameters).then(data => {

					});
				}
			} catch (error) {
				logger.log("error", "OptiTrackModule:logSetUserIdEvent Failed!!, error =  " + error);
			}
		};

		// ---------------------------------------
		// Function: getOptitrackVisitorInfo
		// Args: None
		// Sets the Optimove SDK Logging Mode
		// ---------------------------------------
		const getOptitrackVisitorInfo = function () {
			let visitorInfo = [];
			try {
				//TODO: implement get user info
			} catch (error) {
				_logger.log("error", "OptiTrackModule: getOptitrackVisitorInfo " + error);
			}
			return visitorInfo;
		};

		// ------------------------------ Optitrack Private Utility member functions ------------------------------
		// ---------------------------------------
		// Function: getCustomEventConfigById
		// Args: eventId
		// returns the event Configuration.
		// ---------------------------------------
		var getCustomEventConfigById = function (eventId) {
			var currEvent = _configuration.events[eventId];
			if (currEvent == undefined) {
				return null;
			}
			return currEvent;
		};

		// ---------------------------------------
		// Function: getCustomEventParamFromConfig
		// Args: eventConfig, paramName
		// returns the event Configuration.
		// ---------------------------------------
		var getCustomEventParamFromConfig = function (eventConfig, paramName) {
			var currParam = eventConfig.parameters[paramName];
			if (currParam == undefined) {
				return null;
			}
			return currParam;
		};


		// ---------------------------------------
		// Function: encodeURLComponents
		// Args: THIS, eventConfig, event_parameters
		// returns the validated changed parameters.
		// description:
		// using the following spec: https://www.w3schools.com/tags/ref_urlencode.asp
		// run on the parameters keys and check if it is String Type.
		// If String replace the different characters as follows:
		// "http://a.com/?q=query&n=10" would be converted to:
		// http%3A%2F%2Fa.com%2F%3Fq%3Dquery%26n%3D10"
		// "#" = %23
		// ":" = %3A
		// "/" = %2F
		// "&" = %26
		// "=" = %3D
		// " " = %20
		// ---------------------------------------
		var encodeURLComponents = function (THIS, eventConfig, event_parameters) {
			// run on the parameters keys and check if it is String Type.
			// If String replace the different characters as follows:
			if (eventConfig.parameters == null) {
				_logger.log("info", "Events Parameters is null !");
				return;
			}
			var parametersNames = Object.keys(event_parameters);
			parametersNames.forEach(function (paramName) {
				var currParam = eventConfig.parameters[paramName];
				if (currParam != undefined && currParam.type != "Number" && currParam.type != "Boolean") {
					var paramValue = event_parameters[paramName];

					paramValue = encodeURIComponent(paramValue);

					event_parameters[paramName] = paramValue.trim();
				}
			});
			return event_parameters;
		};

		// ---------------------------------------
		// Function: getDomain
		// Args: one
		// return the Domain without Sub Domain
		// ---------------------------------------
		var getDomain = function () {
			var hostname = window.location.hostname;
			var splitArray = hostname.split(".");
			var result = "";
			if (splitArray.length >= 3) {
				var postfix = splitArray[splitArray.length - 1];
				var main = splitArray[splitArray.length - 2];
				result = main + "." + postfix;
			} else if (splitArray.length == 2) {
				result = hostname;
			}
			return result;
		};

		// ---------------------------------------
		// Function: persistSDKSessionData
		// Args: key, updatedValue
		// persists the key, updatedValue in the sessionStorage for session TLV
		// ---------------------------------------
		const persistSDKSessionData = (key, updatedValue) => {
			try {
				if (_configuration.optitrackMetaData.useSessionStorage == true) {
					let currValue = sessionStorage.getItem(key);
					if (currValue == null || currValue != updatedValue) {
						sessionStorage.setItem(key, updatedValue);
					}
				} else {
					logger.log('info', 'Optitrack: persistSDKSessionData() Not Persisted');
				}
			} catch (error) {
				logger.log('error', `OptiTrackModule: persistSDKSessionData () Failed error = ${error}`);
			}
		};

		// ---------------------------------------
		// Function: getPersistedSDKSessionData
		// Args: key
		// persists the key, updatedValue in the sessionStorage for session TLV
		// ---------------------------------------
		const getPersistedSDKSessionData = function (key) {
			try {
				if (_configuration.optitrackMetaData.useSessionStorage == true) {
					let value = sessionStorage.getItem(key);
					if (value != null) {
						let resultObject = {
							key: key,
							value: value
						};
						return resultObject;
					}
				} else {
					logger.log('info', `Optitrack: persistSDKSessionData() key: ${key} Not Persisted`);
					return null;
				}
			} catch (error) {
				logger.log('error', `OptiTrackModule: getPersistedSDKSessionData () Failed error = ${error}`);
				return null;
			}
		};

		// ---------------------------------------
		// Function: getOptiTrackEndpointFromConfig
		// Args: SDKConfig
		// Get the Tracker Endpoint from the Config
		// ---------------------------------------
		const getOptiTrackEndpointFromConfig = () => {
			return _configuration.optitrackMetaData.optitrackEndpoint;
		};

		return {
			initializeOptiTrack: initializeOptiTrack,
			logSetUserId: logSetUserIdEvent,
			logUserEmail: logUserEmail,
			logMetadataCoreEvent: logMetadataCoreEvent,
			getOptitrackVisitorInfo: getOptitrackVisitorInfo,
			getUserId: getUserId,
			getKeyId: getKeyId,
			getOptitrackEndpoint: getOptiTrackEndpointFromConfig,
			reportOptitrackEvent: reportOptitrackEvent,
			getPersistedSDKSessionData: getPersistedSDKSessionData,
			persistSDKSessionData: persistSDKSessionData
		};
	})();

	// ### begin
    const optimobileModule = (() => {
		const onDOMReady = (fn) => {
			if (document.readyState !== "loading") {
				fn();
			} else {
				document.addEventListener("DOMContentLoaded", fn);
			}
		};

        const initializeOptimobile = () => {
            (function(w,p){w[p]=w[p]||function(){w[p].q=w[p].q||[];w[p].q.push(arguments)}})(window,"Kumulos");

			const kumulosMeta = _configuration.kumulosWebSdkMetaData;
			const originalVisitorId = getOriginalVisitorId();
			if (originalVisitorId === null){
				console.error('Optimobile cannot initialize: no originalVisitorId present');
				return;
			}

			const config = {
				apiKey: kumulosMeta.apiKey,
				secretKey: kumulosMeta.secretKey,
				vapidPublicKey: kumulosMeta.vapidPublicKey,
				region: kumulosMeta.region,
				originalVisitorId,
				sdkVersion: _version
            };

			const userId = getUserId();
			if (userId){
				config.customerId = userId;
			}

            Kumulos("init", config);
			onDOMReady(() => {
				const script = document.createElement('script');
				script.id = 'kumulos';
				script.src = 'https://static.app.delivery/sdks/web/optimove-web-bundle.js'
				script.async = true;
				document.body.append(script);
			});

        };
        const reportEventsToOptimobile = (events) => {
			events.forEach(function(event){
				logger.log('info', 'reporting to kumulos event ' + event.event);
				Kumulos('trackEvent', event.event, event.context);
			});
        };
        const pushRegister = () => {
            Kumulos('pushRegister');
        };
        return {
            initializeOptimobile,
            reportEventsToOptimobile,
            pushRegister
        };
    })();
    // ### end

	const liveRampModule = (function () {
		var updateLiveRampDataMatching = function () {
			// ---------------------------------------
			// Function: optimoveLiveRampDataMatching
			// Args:  LivRamp Tenant Token, TenantId. VisitorId
			// Sets the Optimove SDK Logging Mode
			// ---------------------------------------
			// liveRampBaseEndpoint = "https://id.rlcdn.com/[liveRampToken].gif?cparams="
			//<img src="id.rlcdn.com/<liveRampTenantToken>.gif?cparams=tenantToken_tenantId_visitorId]">
			var optimoveLiveRampDataMatching = function (srcUrl) {
				if (tenantToken != srcUrl) {
					var d = document;
					var g = d.createElement("img");
					var s = d.getElementsByTagName("script")[0];
					g.type = "text/javascript";
					g.async = true;
					g.defer = true;
					g.src = srcUrl;
					s.parentNode.insertBefore(g, s);
				}
			};

			var livRampId = optitrackModule.getKeyId(optitrackModule, "liveRamp");
			var liveRampOnSessionPersisted = optitrackModule.getPersistedSDKSessionData(
				optitrackModule,
				livRampId
			);
			var visitorId = undefined;
			var info = getVisitorsInfoObj();
			visitorId = info.visitorId;

			if (
				liveRampOnSessionPersisted == null ||
				liveRampOnSessionPersisted.value != visitorId
			) {
				if (
					typeof _configuration.LiveRampMetaData != "undefined" &&
					typeof _configuration.LiveRampMetaData.tenantToken != "undefined" &&
					typeof _configuration.LiveRampMetaData.baseEndpoint != "undefined"
				) {
					var tenantToken = _configuration.LiveRampMetaData.tenantToken;
					var liveRampTenantToken =
						_configuration.LiveRampMetaData.liveRampTenantToken;
					var liveRampTemplateEndpoint =
						_configuration.LiveRampMetaData.baseEndpoint;
					var tenantId = _configuration.optitrackMetaData.siteId;
					var reg = new RegExp("(\\[liveRampToken\\])", "g"); //  /(\[liveRampToken\\\])+/g;
					var liveRampBaseEndpoint = liveRampTemplateEndpoint.replace(
						reg,
						liveRampTenantToken
					);
					var srcUrl =
						liveRampBaseEndpoint +
						tenantToken +
						"_" +
						tenantId +
						"_" +
						visitorId;
					optimoveLiveRampDataMatching(srcUrl);

					optitrackModule.persistSDKSessionData(
						optitrackModule,
						livRampId,
						visitorId
					);
				}
			}
		};
		return {
			updateLiveRampDataMatching: updateLiveRampDataMatching
		};
	})();

	const datonicsModule = (function () {
		var updateDatonicsDataMatching = function () {
			// ---------------------------------------
			// Function: updateDatonics
			// Args: customer userId or null if visitor
			// Sets the Optimove SDK Logging Mode
			// ---------------------------------------
			//<img src="fei.pro-market.net/engine?du=97;csync=[optimove_Client_ID_Optimove_Cookie_ID];rnd=(RandomNumber)">

			var optimoveDataMatching = function (
				optimove_Cookie_ID,
				optimove_Client_ID
			) {
				if (optimove_Cookie_ID != null) {
					var baseEndpoint =
						_configuration.DatonicsCookieMatchingMetaData.baseEndpoint;
					var d = document;
					var g = d.createElement("img");
					var s = d.getElementsByTagName("script")[0];
					g.type = "text/javascript";
					g.async = true;
					g.defer = true;
					var random = Math.round(Math.random() * 10000000000000000);
					g.src =
						baseEndpoint +
						"csync=" +
						optimove_Client_ID +
						"_" +
						optimove_Cookie_ID +
						";rnd=(" +
						random +
						")";
					s.parentNode.insertBefore(g, s);
				}
			};
			var datonicsId = optitrackModule.getKeyId(optitrackModule, "datonics");
			var datonicsOnSessionPersisted = optitrackModule.getPersistedSDKSessionData(
				optitrackModule,
				datonicsId
			);
			var visitorId = undefined;
			var info = getVisitorsInfoObj();
			visitorId = info.visitorId;
			if (
				datonicsOnSessionPersisted == null ||
				datonicsOnSessionPersisted.value != visitorId
			) {
				var tenantId = _configuration.optitrackMetaData.siteId;
				optimoveDataMatching(visitorId, tenantId);
				optitrackModule.persistSDKSessionData(
					optitrackModule,
					datonicsId,
					visitorId
				);
			}
		};
		return {
			updateDatonicsDataMatching: updateDatonicsDataMatching
		};
	})();

	const cookieMatcherModule = (function () {
		// ---------------------------------------
		// Function: updateCookieMatcher
		// Args: customer userId or null if visitor
		// Sets the Optimove SDK Logging Mode
		// ---------------------------------------
		var updateCookieMatcher = function (userId) {
			var setOptimoveCookie = function (cookieMatcherUserId) {
				var setCookieUrl =
					"https://gcm.optimove.events/setCookie?optimove_id=" +
					cookieMatcherUserId;
				var setCookieNode = document.createElement("img");
				setCookieNode.style.display = "none";
				setCookieNode.setAttribute("src", setCookieUrl);
				document.body.appendChild(setCookieNode);
			};

			var matchCookie = function (tenantToken, optimoveCookieMatcherId) {
				//var url = "https://cm.g.doubleclick.net/pixel?google_nid=OptimoveCookieMatcherID&google_cm&tenant_id=TenantID";
				var url =
					"https://cm.g.doubleclick.net/pixel?google_nid=" +
					optimoveCookieMatcherId +
					"&google_cm&tenant_id=" +
					tenantToken;
				var node = document.createElement("img");
				node.style.display = "none";
				node.setAttribute("src", url);
				document.body.appendChild(node);
			};

			var googlCookieMatchId = optitrackModule.getKeyId(
				optitrackModule,
				"googlCookieMatch"
			);
			var googlCookieMatchOnSessionPersisted = optitrackModule.getPersistedSDKSessionData(
				optitrackModule,
				googlCookieMatchId
			);
			var visitorId = undefined;
			var info = getVisitorsInfoObj();
			visitorId = info.visitorId;
			var cookieMatcherUserId = null;
			if (typeof userId != "undefined" && userId != null) {
				cookieMatcherUserId = userId;
			} else {
				cookieMatcherUserId = visitorId;
			}

			if (
				googlCookieMatchOnSessionPersisted == null ||
				googlCookieMatchOnSessionPersisted.value != visitorId
			) {
				setOptimoveCookie(cookieMatcherUserId);

				var tenantToken = _configuration.cookieMatcherMetaData.tenantToken;
				matchCookie(
					tenantToken,
					_configuration.cookieMatcherMetaData.optimoveCookieMatcherId
				);
				optitrackModule.persistSDKSessionData(
					optitrackModule,
					googlCookieMatchId,
					visitorId
				);
			}
		};

		return {
			updateCookieMatcher: updateCookieMatcher
		};
	})();

/*	const setCustomConfiguration = function (obj) {
		_configuration = obj;
	};*/

	const setUserIdHandler = (updatedUserId) => {
		let userId = updatedUserId;
		let userInfo = getUserInfo();

		if (userInfo.userId && userInfo.userId === userId) {
			logger.log('info', 'setUserId: User ID is already set');
			return false;
		}
		let originalVisitorId = !userInfo.originalVisitorId ? generateVisitorId() : getOriginalVisitorId();
		// Need 16 first characters (following Piwik behaviour)
		return {
			userId: userId,
			originalVisitorId: originalVisitorId,
			updatedVisitorId: _SHA1.SHA1(updatedUserId || '').substring(0, 16)
		};
	};

	const _API = {
		getVersion: () => {
			return _version;
		},

		/*TEST-START*/
		getTest: () => {
			return 'test';
		},


		/*TEST-END*/
		getConfigurationVersion: () => {
			return _configuration.version;
		},
		getVisitorId: () => {
			return getVisitorId();
		},
		getUserId: () => {
			return getUserId();
		},
		setRealTimeOptions: (options) => {
			if (options.showDimmer != null) {
				_configuration.realtimeMetaData.options.showDimmer = options.showDimmer;
			}

			if (options.showWatermark != null) {
				_configuration.realtimeMetaData.options.showWatermark = options.showWatermark;
			}

			if (options.reportEventCallback != null) {
				_configuration.realtimeMetaData.options.popupCallback = options.reportEventCallback;
			}
		},
		setUserId: (userId, callback) => {
			let updatedUserId = userId || null;

			if (!updatedUserId && !callback) {
				console.error(`UserId is not defined ${updatedUserId}, no user ID had been set`);
				return;
			}

			let userInfo = setUserIdHandler(updatedUserId);

			if (userInfo) {
				let eventHandler = eventsHandler;
				eventHandler.logEvent(keySetUserIdEvent, userInfo);
				eventHandler.dispatch()
					.then(data => {
						if (_Tools.validateUserId(updatedUserId) && _Tools.validateUserIdLength(updatedUserId)) {
							setVisitorId(userInfo.updatedVisitorId);
							setUserId(updatedUserId);
							// ### begin
							if (_configuration.enableWebPush) {
								logger.log('info', 'kumulos associating user identifier: ' + userInfo.userId);
								Kumulos('associateUser', userInfo.userId);
							}
							// ### end
						}

						if (typeof callback === 'function') {
							callback();
						}
					})
					.catch(error => {
						logger.log('error', `setUserId error = ${error}`);
					});

				if (_configuration.supportCookieMatcher == true) {
					cookieMatcherModule.updateCookieMatcher(updatedUserId);
				}
			} else {
				if (typeof callback === 'function') {
					callback();
				}
			}
		},
		setUserEmail: (email, callback, userId) => {
			let updatedUserId = userId || null;
			let eventHandler = eventsHandler;
			let userInfo;
			if (!email) {
				logger.log('error', `setUserEmail: email is missing`);
				return;
			}
			let userEmail = email.trim();

			if (userEmail) {
				let params = {
					email: email
				};

				if (updatedUserId) {
					userInfo = setUserIdHandler(updatedUserId);
					if (userInfo) {
						eventHandler.logEvent(keySetUserIdEvent, userInfo);
						if (_configuration.supportCookieMatcher == true) {
							cookieMatcherModule.updateCookieMatcher(updatedUserId);
						}
					}
				}

				eventHandler.logEvent(keySetEmailEvent, params, userInfo);
				eventHandler.dispatch()
					.then(data => {
						if (userInfo) {
							if (_Tools.validateUserId(updatedUserId) && _Tools.validateUserIdLength(updatedUserId)) {
								setVisitorId(userInfo.updatedVisitorId);
								setUserId(updatedUserId);
								// ### begin
								if (_configuration.enableWebPush) {
									logger.log('info', 'kumulos associating user identifier: ' + userInfo.userId);
									Kumulos('associateUser', userInfo.userId);
								}
								// ### end
							}
						}
						if (callback && typeof callback === 'function') {
							callback();
						}
					})
					.catch(error => {
						logger.log('error', `setUserEmail error = ${error}`);
					});
			}
		},
		registerUser: (userId, email, eventName, parameters, callback) => {
			let updatedUserId = userId || null;
			if (!updatedUserId ) {
				console.error(`UserId is not defined ${updatedUserId}, no user ID had been set`);
				return;
			}
			let userInfo = setUserIdHandler(updatedUserId);
			if (userInfo) {
				let eventHandler = eventsHandler;
				eventHandler.logEvent(keySetUserIdEvent, userInfo);

				if (email) {
					eventHandler.logEvent(keySetEmailEvent, {
						email: email
					}, userInfo);
				}
				if (eventName) {
					eventHandler.logEvent(eventName, parameters, userInfo);
				}
				eventHandler.dispatch().then(() => {
					if (userInfo) {
						if (_Tools.validateUserId(updatedUserId) && _Tools.validateUserIdLength(updatedUserId)) {
							setVisitorId(userInfo.updatedVisitorId);
							setUserId(updatedUserId);
							// ### begin
							if (_configuration.enableWebPush) {
								logger.log('info', 'kumulos associating user identifier: ' + userInfo.userId);
								Kumulos('associateUser', userInfo.userId);
							}
							// ### end
						}
					}
					if (callback && typeof callback === 'function') {
						callback();
					}
				});
			} else if (callback && typeof callback === 'function') {
					callback();
			}
		},
		reportEvent: (eventName, parameters, callback, userId) => {
			let updatedUserId = userId || null;
			let eventHandler = eventsHandler;
			let userInfo;

			if (updatedUserId) {
				userInfo = setUserIdHandler(updatedUserId);
				if (userInfo) {
					eventHandler.logEvent(keySetUserIdEvent, userInfo);
					if (_configuration.supportCookieMatcher == true) {
						cookieMatcherModule.updateCookieMatcher(updatedUserId);
					}
				}
			}
			eventHandler.logEvent(eventName, parameters, userInfo);
			eventHandler.dispatch().then(data => {
				if (userInfo) {
					if (_Tools.validateUserId(updatedUserId) && _Tools.validateUserIdLength(updatedUserId)) {
						setVisitorId(userInfo.updatedVisitorId);
						setUserId(updatedUserId);
						// ### begin
						if (_configuration.enableWebPush) {
							logger.log('info', 'kumulos associating user identifier: ' + userInfo.userId);
							Kumulos('associateUser', userInfo.userId);
						}
						// ### end
					}
				}
				if (callback && typeof callback === 'function') {
					callback();
				}
			});
		},
		setPageVisit: (customURLIn, pageTitleIn, categoryIn, userId) => {
			let pageTitle = pageTitleIn ? pageTitleIn.trim() : null;
			let category = categoryIn != undefined ? categoryIn.trim() : null;
			let customURL = encodeURI(customURLIn);

			customURL = customURL.trim().toLowerCase();

			let params = {
				customURL: customURL,
				pageTitle: pageTitle,
				category: category
			};

			let updatedUserId = userId || null;
			let eventHandler = eventsHandler;
			let userInfo;

			if (updatedUserId) {
				userInfo = setUserIdHandler(updatedUserId);
				if (userInfo) {
					eventHandler.logEvent(keySetUserIdEvent, userInfo);
					if (_configuration.supportCookieMatcher == true) {
						cookieMatcherModule.updateCookieMatcher(updatedUserId);
					}
				}
			}
			eventHandler.logEvent(keySetPageVisitEvent, params, userInfo);
			eventHandler.dispatch()
				.then(data => {
					if (userInfo) {
						if (_Tools.validateUserId(updatedUserId) && _Tools.validateUserIdLength(updatedUserId)) {
							setVisitorId(userInfo.updatedVisitorId);
							setUserId(updatedUserId);
							// ### begin
							if (_configuration.enableWebPush) {
								logger.log('info', 'kumulos associating user identifier: ' + userInfo.userId);
								Kumulos('associateUser', userInfo.userId);
							}
							// ### end
						}
					}
				});

			if (typeof _configuration.supportDatonicsCookieMatching != "undefined" && _configuration.supportDatonicsCookieMatching == true) {
				logger.log('info', 'call setPageVisit support DatonicsCookieMatching');
				datonicsModule.updateDatonicsDataMatching();
			}

			if (typeof _configuration.supportCookieMatcher != "undefined" && _configuration.supportCookieMatcher == true) {
				if (_userId == null) {
					cookieMatcherModule.updateCookieMatcher(null);
				}
			}

			if (typeof _configuration.supportLiveRamp != "undefined" && _configuration.supportLiveRamp == true) {
				liveRampModule.updateLiveRampDataMatching();
			}

		},
		// ### begin
        pushRegister: () => {
            optimobileModule.pushRegister();
        },
        // ### end
		showRealtimePopup: realtimeModule.executePopup,
		closeRealtimePopup: realtimeModule.closePopup,
		gamifyWidgetOpen: (widgetUrl, userId, token) => gamifyModule.open(widgetUrl, userId, token),
		gamifyWidgetClose: () => gamifyModule.close(),
		openWebTestTool: () => {
			let webSDKToolElm = document.getElementById("optimoveSdkWebTool");

			if (!webSDKToolElm) {
				//openTestTool();
			}
		},
		closeWebTestTool: () => {
			let a = document.getElementById("optimoveSdkWebTool");
			if (a != undefined) {
				a.remove();
				try {
					window.sessionStorage.setItem("isSideBarShouldBeOpen", false);
				} catch (error) {
				logger.log('error', `Web sdk test tool : session storage access has failed :  ${error}`);
			}
			}
			document.body.classList.remove('optimoveSdkWebToolOpen');
			document.body.style.width = 'auto';
		},
		tools: () => {
			return _Tools;
		}
	};

	/* TEST-START */
	_API._test_ = Object.create(null);
	_API._test_.setConfigurationForTest = (confMockFile) => {
		_configuration = confMockFile;
	};
	//_API._test_.setCustomConfiguration = setCustomConfiguration;
	/* TEST-END */

	if (self.optimoveTenantConfiguration) {
		init(null,null,null, "info");
	}

	return {
		initialize: init,
		API: _API
	};

})();

/* TEST-START */
export default window.optimoveSDK;
/* TEST-END */
