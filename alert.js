(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        throw new Error("Cannot find module '" + o + "'")
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, f, f.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  "serial_connect.js": [function(require, module, exports) {

    require('serial_connect_utils.js')();
    var SerialPortLib = require('construct_serial_port.js');
    var SerialPort = SerialPortLib.SerialPort;

    document.addEventListener('DOMContentLoaded', function() {
    console.log("Jewel Time App is ready");
    // If next button is clicked
    var nextButton = document.getElementById("next");
    nextButton.onclick = function() {
      clearPortsList();
      this.disabled = true;
      console.log("Next Button is clicked");


      // This function will be called on load.
      SerialPortLib.list(function(err, ports) {
        console.log('List Serial Ports');
        var portsPath = document.getElementById("portPath");

        if (err) {
          console.log("Error listing ports", err);
          portsPath.options[0] = new Option(err, "ERROR:" + err);
          portsPath.options[0].selected = true;
          return;
        } else {
          console.log("Ports: "+ ports.length);
          for (var i = 0; i < ports.length; i++) {
            //console.log("Port Path "+ ports[i].comName.path);
            portsPath.options[i] = new Option(ports[i].comName.path, ports[i].comName.path);

            if (ports[i].comName.path.toLowerCase().indexOf("usb") !== -1) {
              portsPath.options[i].selected = true;
            }
          }

          document.getElementById("settings").style.display = "none";
          document.getElementById("connect-settings").style.display = "block";
          document.getElementById("main-container").style.height = "180";
          document.getElementById("serialProgressBar").style.display = "block";

          //Old next button click code locaction

          // If connect button is clicked
          var connectButton = document.getElementById("connect");
          connectButton.onclick = function() {
            this.disabled = true;

            resetStatusBar();
            var port = portsPath.options[portsPath.selectedIndex].value;
            connect(port);
            console.log("Connection is Opened.");
          };
        }
      });




    };

    });


    //To clear dropdown list of ports
    function clearPortsList() {
      var portsPath = document.getElementById("portPath");
      if (portsPath == null) return;
    	if (portsPath.options == null) return;
    	while (portsPath.options.length > 0) {
    		portsPath.remove(0);
    	}
    }

    // Connect to serial port
    function connect(port) {

      sp = new SerialPort(port, {
        baudrate: 1200,
        buffersize: 1
      }, true);

      console.log("Connect button is clicked");
      console.log(serialJSON);

      sp.on("open", function() {
        console.log("Serial Port Opened...");
        serialJSON = '{"';
        cmd = "";
        cmd = "S?";
        send();
        setTimeout(function() {
          cmd = "F?";
          send();
        }, 500);
        setTimeout(function() {
          cmd = "A1?";
          send();
        }, 1000);
        setTimeout(function() {
          cmd = "A2?";
          send();
        }, 1500);
        setTimeout(function() {
          cmd = "A3?";
          send();
        }, 2000);
        setTimeout(function() {
          cmd = "A4?";
          send();
        }, 2500);
        setTimeout(function() {
          cmd = "A5?";
          send();
        }, 3000);
        setTimeout(function() {
          cmd = "A6?";
          send();
        }, 3500);
        setTimeout(function() {
          cmd = "A7?";
          send();
        }, 4000);
        setTimeout(function() {
          cmd = "A8?";
          send();
        }, 4500);
        setTimeout(function() {
          cmd = "T?";
          send();
        }, 5000);
        setTimeout(function() {
          console.log("Last read timeout");
          console.log("Before: " + serialJSON);
          serialJSON += 'last_action" : "read"}';
          console.log("After: " + serialJSON);
          //afterReadOperation();

          console.log("Start afterReadOperation");
          console.log(serialJSON);
          try {
            readSerialJSON = JSON.parse(serialJSON);
          } catch (error) {
            console.log(serialJSON);
            console.log("Error occurred while parsing json response.");
          }

          console.log(JSON.stringify(readSerialJSON, null, 4));

          var keyCount = updateForm();
          moveStatusBar(0, 100);
          if (keyCount > 1) {
            document.getElementById("connect-settings").style.display = "none";
            document.getElementById("main-container").style.height = "1480px";
            document.getElementById("alert-container").style.display = "block";

            //register onchange event for all select fields i.e. hours, minutes, am/pm and on/off
            for (var index = 1; index <= 8; index++) {
              var select_hours = document.getElementById("select_hours_" + index);
              var select_minutes = document.getElementById("select_minutes_" + index);
              var select_ampm = document.getElementById("select_ampm_" + index);
              var select_on_off = document.getElementById("select_on_off_" + index);
              select_hours.onchange = changeOnOff;
              select_minutes.onchange = changeOnOff;
              select_ampm.onchange = changeOnOff;
              select_on_off.onchange = changeOnOff;
            }

            resetStatusBar();
          } else {
            var error = document.getElementById("error");
            error.innerHTML = "Error connecting to device, please check that it is connected and awake and try again.";
            moveStatusBar(0, 100, true);


            // reload extention barafter 10 secs
            setTimeout(function() {
              chrome.runtime.reload();
            }, 10 * 1000);
          }
        }, 5500);

      });

      sp.on("error", function(string) {
        //output.textContent += "\nError: " + string + "\n";
      });

      //Submit button
      var alert_submit = document.getElementById("alert_submit");
      alert_submit.onclick = submitForm;

    }

  }, {

  }],
  "construct_serial_port.js": [function(require, module, exports) {
    "use strict";

    function SerialPort(path, options, openImmediately) {
      console.log("SerialPort constructed.");
      this.comName = path;
      if (options) {
        for (var key in this.options) {
          if (options[key] != undefined) {
            this.options[key] = options[key];
          }
        }
      }

      if (typeof chrome != "undefined" && chrome.serial) {
        var self = this;

        if (openImmediately != false) {
          this.open();
        }

      } else {
        throw "No access to serial ports. Try loading as a Chrome Application.";
      }
    }

    SerialPort.prototype.options = {
      baudrate: 1200,
      buffersize: 1
    };

    SerialPort.prototype.connectionId = -1;
    SerialPort.prototype.comName = "";
    SerialPort.prototype.eventListeners = {};
    SerialPort.prototype.resp = "";

    SerialPort.prototype.open = function(callback) {
      console.log("Opening ", this.comName);
      chrome.serial.connect(this.comName, {
        bitrate: parseInt(this.options.baudrate)
      }, this.proxy('onOpen', callback));
    };

    SerialPort.prototype.onOpen = function(callback, openInfo) {
      this.connectionId = openInfo.connectionId;
      if (this.connectionId == -1) {
        this.publishEvent("error", "Could not open port.");
        return;
      }
      if(this.connectionId != -1){
        this.publishEvent("open", openInfo);
      }

      console.log('Connected to port.', this.connectionId);
      typeof callback == "function" && callback(openInfo);
      chrome.serial.onReceive.addListener(this.proxy('onRead'));

    };

    // Below function will be called on data read from serial device
    SerialPort.prototype.onRead = function(readInfo) {
      if (readInfo && this.connectionId == readInfo.connectionId) {
        var uint8View = new Uint8Array(readInfo.data);
        var string = String.fromCharCode(uint8View[0]);

        //Maybe this should be a Buffer()
        this.publishEvent("data", uint8View);
        this.publishEvent("dataString", string);
      }
    }

    // Write cmd on serial device
    SerialPort.prototype.write = function(buffer, callback) {
      if (typeof callback != "function") {
        callback = function() {};
      }

      //Make sure its not a browserify faux Buffer.
      if (buffer instanceof ArrayBuffer == false) {
        buffer = buffer2ArrayBuffer(buffer);
      }

      chrome.serial.send(this.connectionId, buffer, callback);
    };

    SerialPort.prototype.writeString = function(string, callback) {
      //console.log("In writeString: "+ string);
      this.write(str2ab(string), callback);
    };

    SerialPort.prototype.close = function(callback) {
      console.log(this);
      console.log(this.connectionId);
      if(this.connectionId != -1){
        chrome.serial.disconnect(this.connectionId, this.proxy('onClose', callback));
      }
    };

    SerialPort.prototype.onClose = function(callback) {
      this.connectionId = -1;
      console.log(this);
      console.log("Closed port", arguments);
      this.publishEvent("close");
      typeof callback == "function" && callback(openInfo);
    };

    SerialPort.prototype.flush = function(callback) {

    };

    //Expecting: data, error
    SerialPort.prototype.on = function(eventName, callback) {
      if (this.eventListeners[eventName] == undefined) {
        this.eventListeners[eventName] = [];
      }
      if (typeof callback == "function") {
        this.eventListeners[eventName].push(callback);
      } else {
        throw "can not subscribe with a non function callback";
      }
    }

    SerialPort.prototype.publishEvent = function(eventName, data) {
      if (this.eventListeners[eventName] != undefined) {
        for (var i = 0; i < this.eventListeners[eventName].length; i++) {
          this.eventListeners[eventName][i](data);
        }
      }
    }

    SerialPort.prototype.proxy = function() {
      var self = this;
      var proxyArgs = [];

      //arguments isnt actually an array.
      for (var i = 0; i < arguments.length; i++) {
        proxyArgs[i] = arguments[i];
      }

      var functionName = proxyArgs.splice(0, 1)[0];

      var func = function() {
        var funcArgs = [];
        for (var i = 0; i < arguments.length; i++) {
          funcArgs[i] = arguments[i];
        }
        var allArgs = proxyArgs.concat(funcArgs);

        self[functionName].apply(self, allArgs);
      }

      return func;
    }

    function SerialPortList(callback) {
      console.log("Inside SerialPortList");
      if (typeof chrome != "undefined" && chrome.serial) {
        chrome.serial.getDevices(function(ports) {
          var portObjects = Array(ports.length);
          for (var i = 0; i < ports.length; i++) {
            portObjects[i] = new SerialPort(ports[i], null, false);
          }
          console.log("Ports");
          console.log(portObjects);
          callback(null, portObjects);
        });
      } else {
        callback("No access to serial ports. Try loading as a Chrome Application.", null);
      }
    };

    var ab2str = function(buf) {
      var bufView = new Uint8Array(buf);
      var encodedString = String.fromCharCode.apply(null, bufView);
      return decodeURIComponent(escape(encodedString));
    };

    // Convert string to ArrayBuffer
    function str2ab(str) {
      var buf = new ArrayBuffer(str.length);
      var bufView = new Uint8Array(buf);
      for (var i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    // Convert buffer to ArrayBuffer
    function buffer2ArrayBuffer(buffer) {
      var buf = new ArrayBuffer(buffer.length);
      var bufView = new Uint8Array(buf);
      for (var i = 0; i < buffer.length; i++) {
        bufView[i] = buffer[i];
      }
      return buf;
    }

    module.exports = {
      SerialPort: SerialPort,
      list: SerialPortList,
      used: [] //TODO: Populate this somewhere.
    };

  }, {}],
  "serial_connect_utils.js": [function(require, module, exports) {
    module.exports = function() {

      //Global variable
      readSerialJSON = {};
      writeSerialJSON = {};
      serialJSON = {};
      formJSON = {};
      sp = "";
      cmd = "";

      // Move status bar
      // increment is pass how much percent we should increment it.
      // percent: to change progress bar set to specific percentage
      // isError: true means change progress bar color to red.
      this.moveStatusBar = function(increment, percent, isError) {
        //console.log("Start moveStatusBar");
        var elem = document.getElementById("progressBar");
        var width = elem.style.width;

        if (increment == null) {
          increment = 10;
        }
        if (percent != null && percent >= 0) {
          width = percent;
        } else {
          width = width.replace(/[^-\d.]/g, '');
          width = (width === "") ? 10 : parseInt(width) + increment;
          if (width > 100) {
            width = 100;
          }
        }

        if (isError) {
          elem.style.backgroundColor = '#FF0000'; // Red color
        } else {
          elem.style.backgroundColor = '#4CAF50'; // Default Green
        }
        elem.style.width = width + '%';
      }

      //Get selected value by passing id of select element
      this.getSelectionValueById = function(id) {
        var iterm_id = document.getElementById(id);
        var value = null;
        if (iterm_id) {
          value = iterm_id.options[iterm_id.selectedIndex].value;
        }
        return value;
      }

      // To change alarm on/off based on hour/minutes value selected
      this.changeOnOff = function() {
        var key = this.id;
        var index = key.replace(/[^-\d.]/g, '');
        var value = "";
        if (this) {
          value = this.options[this.selectedIndex].value;
        }
        if (value === "off") {
          var select_hours = document.getElementById("select_hours_" + index);
          var select_minutes = document.getElementById("select_minutes_" + index);
          var select_ampm = document.getElementById("select_ampm_" + index);
          select_hours.value = "00";
          select_minutes.value = "00";
          select_ampm.value = "AM";
        } else if (this.id.indexOf("select_on_off") == -1 && getSelectionValueById("select_on_off_" + index) === "off") {
          var select_on_off = document.getElementById("select_on_off_" + index);
          select_on_off.value = "on";
        }
        console.log("Value:" + value);
      }

      //reset status bar immediately
      this.resetStatusBar = function() {
        moveStatusBar(0, 0, false);
        var error = document.getElementById("error");
        error.innerHTML = "";
      }

      //Get updated value by passing alarm index
      this.getNewAlarmValueByIndex = function(i) {
        var hours = getSelectionValueById("select_hours_" + i);
        var minutes = getSelectionValueById("select_minutes_" + i);
        var ampm = getSelectionValueById("select_ampm_" + i);
        var description = document.getElementById("description_" + i).value;
        var on_off = getSelectionValueById("select_on_off_" + i);
        var newAlarmValue = "";
        if (on_off === "on") {
          if (ampm === "PM") {
            hours = parseInt(hours);
            hours = hours < 12 ? hours + 12 : hours;
          }
          newAlarmValue = hours + ":" + minutes;
        }
        return newAlarmValue;
      }

      // This function will return current date in below format
      // Format: "yyyy/mm/dd HH:MM:SS"
      this.getFormattedDate = function() {
        var date = new Date();
        var dt = date.getDate();
        var year = date.getFullYear();
        var mo = date.getMonth() + 1;
        var hr = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        dt = (dt <= 9 ? '0' : '') + dt;
        mo = (mo <= 9 ? '0' : '') + mo;
        hr = (hr <= 9 ? '0' : '') + hr;
        min = (min <= 9 ? '0' : '') + min;
        sec = (sec <= 9 ? '0' : '') + sec;
        return year + '/' + mo + '/' + dt + ' ' + hr + ':' + min + ':' + sec;
      }

      //Fill serial data on form based on readSerialJson data
      this.updateForm = function() {
        var keyCount = 0;
        console.log("Inside updateForm");
        console.log(readSerialJSON);
        for (var key in readSerialJSON) {
          keyCount++;
          var value = readSerialJSON[key];
          if (key == "F") {
            var fvalue = document.getElementById("firmware");
            fvalue.textContent = value;
          } else if (key == "S") {
            var svalue = document.getElementById("serial_number");
            svalue.textContent = value;
          } else if (key == "T") {
            var device_time = document.getElementById("device_time");
            device_time.textContent = value;
          } else if (key.indexOf("A") == 0) {
            var alarmIndex = key.replace(/[^-\d.]/g, '');

            if (value != "") {
              var match = value.split(":", 2);
              var hr = match[0];
              var min = match[1];
              var am_pm = "PM";
              if (hr < 12) {
                am_pm = "AM";
              }

              if (hr > 12) {
                hr = hr % 12;
                hr = (hr <= 9 ? '0' : '') + hr;
              }

              var select_hours = document.getElementById("select_hours_" + alarmIndex);
              select_hours.value = hr;
              var select_minutes = document.getElementById("select_minutes_" + alarmIndex);
              select_minutes.value = min;
              var select_ampm = document.getElementById("select_ampm_" + alarmIndex);
              select_ampm.value = am_pm;
              var description = document.getElementById("description_" + alarmIndex);
              description.textContent = "Alert hours is set to " + " " + value;
              var select_on_off = document.getElementById("select_on_off_" + alarmIndex);
              select_on_off.value = "on";

            }
          }
        }
        return keyCount;
      }

      //This function will be called after sending all commands on click of connect button
      this.afterReadOperation = function() {
        moveStatusBar(0, 100);
        console.log("Start afterReadOperation");
        console.log(serialJSON);

        try {
          readSerialJSON = JSON.parse(serialJSON);
        } catch (error) {
          console.log(serialJSON);
          console.log("Error occurred while parsing json response.");
          readSerialJSON = {
            last_action: "read"
          };
        }

        console.log(JSON.stringify(readSerialJSON, null, 4));

        var keyCount = updateForm();
        if (keyCount > 1) {
          document.getElementById("connect-settings").style.display = "none";
          document.getElementById("main-container").style.height = "1480px";
          document.getElementById("alert-container").style.display = "block";

          //register onchange event for all select fields i.e. hours, minutes, am/pm and on/off
          for (var index = 1; index <= 8; index++) {
            var select_hours = document.getElementById("select_hours_" + index);
            var select_minutes = document.getElementById("select_minutes_" + index);
            var select_ampm = document.getElementById("select_ampm_" + index);
            var select_on_off = document.getElementById("select_on_off_" + index);
            select_hours.onchange = changeOnOff;
            select_minutes.onchange = changeOnOff;
            select_ampm.onchange = changeOnOff;
            select_on_off.onchange = changeOnOff;
          }

          resetStatusBar();
        } else {
          var error = document.getElementById("error");
          error.innerHTML = "Error connecting to device, please check that it is connected and awake and try again.";
          moveStatusBar(0, 100, true);


          // reload extention barafter 10 secs
          setTimeout(function() {
            chrome.runtime.reload();
          }, 10 * 1000);

        }

      }

      //send command to device.
      this.send = function() {
        var line = cmd;
        var endOfLine = false;

        //listen dataString event
        sp.on("dataString", function(string) {
          if (string.charCodeAt(0) == 13) {
            if (endOfLine == false) {
              serialJSON += '","';
            }
            endOfLine = true;
          }

          if (endOfLine == false) {
            if (string == "=") {
              serialJSON += '": "';
            } else {
              serialJSON += string;
            }
          }
        });

        sp.writeString(line + "\r\n");
        moveStatusBar(8);
      }

      //Submit new alarm value
      //Timeout is used here to wait till previous command output will comeback
      function submitFieldValueWithTimeout(i, s, newAlarmValue) {
        setTimeout(function() {
          if (i == 9) {
            cmd = "T=" + newAlarmValue;
          } else {
            cmd = "A" + i + "=" + newAlarmValue;
          }

          console.log("Sending command: " + cmd);
          send();
        }, s * 500);

      }

      //Submit Form data on submit button click
      this.submitForm = function() {
        console.log("Submit button is clicked");
        var alert_submit = document.getElementById("alert_submit");
        alert_submit.disabled = true;
        var s = 0;
        formJSON = {};
        serialJSON = '{"';

        for (var i = 1; i <= 9; i++) {
          if (i == 9) {
            var device_new_time = document.getElementById("device_new_time");
            if (device_new_time.checked) {
              var curTime = getFormattedDate();
              formJSON['T'] = curTime;
              if (curTime !== readSerialJSON["T"]) {
                submitFieldValueWithTimeout(i, s, curTime);
                s++;
              }
            }
          } else {
            var newAlarmValue = getNewAlarmValueByIndex(i);
            formJSON["A" + i] = newAlarmValue;
            var isAlarmValueChanged = false;
            if (newAlarmValue !== readSerialJSON["A" + i]) {
              isAlarmValueChanged = true;
              submitFieldValueWithTimeout(i, s, newAlarmValue);
              s++;
            } else {
              moveStatusBar(10);
            }
          }
          console.log("newAlarmValue :" + newAlarmValue + " isAlarmValueChanged: " + isAlarmValueChanged);
        }

        setTimeout(function() {
          //console.log("Inside...write timeout");

          serialJSON += 'last_action" : "write"}';
          try {
            writeSerialJSON = JSON.parse(serialJSON);
          } catch (error) {
            console.log(serialJSON);
            console.log("Error occurred while parsing writeSerialJSON response.");
            writeSerialJSON = {
              last_action: "write"
            };
          }

          console.log(JSON.stringify(writeSerialJSON, null, 4));

          var isErrorInSave = false;
          for (var key in formJSON) {

            if (formJSON[key] !== readSerialJSON[key]) {
              console.log("checking form key:" + key + " return value:" + writeSerialJSON[key]);
              if (writeSerialJSON[key] === null || formJSON[key] !== writeSerialJSON[key]) {
                isErrorInSave = true;
              } else {
                readSerialJSON[key] = formJSON[key];
              }

            }
          }
          moveStatusBar(0, 100, isErrorInSave);
          var error = document.getElementById("error");
          if (isErrorInSave) {
            error.innerHTML = "Error connecting to device, please check that it is connected and awake and try again.";
            setTimeout(function() { // reload extention barafter 10 secs
              chrome.runtime.reload();
            }, 10 * 1000);
          } else {
            updateForm();
            error.innerHTML = "Form data is saved successfully.";
            setTimeout(function() { // reset status barafter 10 secs
              resetStatusBar();
              alert_submit.disabled = false;
            }, 10 * 1000);
          }
        }, (s + 1) * 500);

      }

    }

  }, {}],

}, {}, ["serial_connect.js"])
