var http = require('http');
const Gpio = require('onoff').Gpio;
var Accessory, Service, Characteristic, UUIDGen, motion = false, pushButton;

module.exports = function (homebridge) {
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-mailbox", "MailboxPlatform", MailboxPlatform, true);
}

function MailboxPlatform(log, config, api) {
    // log("MailboxPlatform Init");
    this.log = log;
    this.config = config;
    this.accessories = [];

    this.requestServer = http.createServer(function (request, response) {
        if (request.url == "/trigger") {
            this.triggerMotion();
            response.writeHead(204);
            response.end();
        }
    }.bind(this));

    this.requestServer.listen(18081, function () {
        // this.log("Server Listening...");
    });

    if (api) {
        this.api = api;

        this.api.on('didFinishLaunching', function () {
            // this.log("DidFinishLaunching");
            if (this.accessories.length === 0) {
                this.addAccessory(this.config.mailboxName || 'Mailbox');
            }

            pushButton = new Gpio(this.config.gpioPort || 4, 'in', 'both');
            pushButton.watch(function (err, value) {
                if (err) {
                    console.error('There was an error', err);
                    return;
                }
                console.log('Received signal');
                this.triggerMotion();
            });

            process.on('SIGINT', this.unexportOnClose);
        }.bind(this));
    }
}

MailboxPlatform.prototype.unexportOnClose = function () {
    pushButton.unexport();
}

MailboxPlatform.prototype.configureAccessory = function (accessory) {
    // this.log(accessory.displayName, "Configure Accessory");
    accessory.reachable = true;

    accessory.on('identify', function (paired, callback) {
        callback();
    });

    accessory
        .getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, "Mailbox Inc.")
        .setCharacteristic(Characteristic.Model, "Type B")
        .setCharacteristic(Characteristic.SerialNumber, "MB-853AF1");

    if (!accessory.getService(Service.MotionSensor)) {
        accessory.addService(Service.MotionSensor);
    }

    accessory.getService(Service.MotionSensor)
        .getCharacteristic(Characteristic.MotionDetected)
        .on('get', function (callback) {
            callback(null, Boolean(motion));
        });

    this.accessories.push(accessory);
}

MailboxPlatform.prototype.addAccessory = function (accessoryName) {
    // this.log("Add Accessory");
    var uuid = UUIDGen.generate(accessoryName);

    var newAccessory = new Accessory(accessoryName, uuid);
    this.configureAccessory(newAccessory);
    this.api.registerPlatformAccessories("homebridge-mailbox", "MailboxPlatform", [newAccessory]);
}

MailboxPlatform.prototype.updateAccessoriesReachability = function () {
    this.log("Update Reachability");
    for (var index in this.accessories) {
        var accessory = this.accessories[index];
        accessory.updateReachability(true);
    }
}

MailboxPlatform.prototype.triggerMotion = function () {
    // this.log("Trigger");
    for (var index in this.accessories) {
        var accessory = this.accessories[index];
        motion = true;
        accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, true);
        setTimeout(() => {
            motion = false;
            accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, false);
        }, 3000);
    }
}

MailboxPlatform.prototype.removeAccessory = function () {
    // this.log("Remove Accessory");
    this.api.unregisterPlatformAccessories("homebridge-mailbox", "MailboxPlatform", this.accessories);

    this.accessories = [];
}