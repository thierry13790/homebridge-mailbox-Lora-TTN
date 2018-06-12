const Gpio = require('onoff').Gpio;
var Accessory, Service, Characteristic, UUIDGen, motion = false, pushButton, lastTrigger, timeBetween;

module.exports = function (homebridge) {
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-mailbox", "MailboxPlatform", MailboxPlatform, true);
}

function MailboxPlatform(log, config, api) {
    const platform = this;
    platform.log = log;
    platform.config = config;
    platform.accessories = [];

    if (api) {
        platform.api = api;

        platform.api.on('didFinishLaunching', function () {
            if (platform.accessories.length === 0) {
                platform.addAccessory(platform.config.mailboxName || 'Mailbox');
            }

            if (platform.config.timeBetween) {
                if (platform.config.timeBetween < 5000) {
                    timeBetween = 5000;
                    platform.log('Using 5000ms as time between triggers.');
                } else {
                    timeBetween = platform.config.timeBetween;
                    platform.log(`Using ${timeBetween}ms as time between triggers.`);
                }
            }

            pushButton = new Gpio(platform.config.gpioPort || 4, 'in', 'both');
            pushButton.watch(function (err, value) {
                if (err) {
                    platform.log('There was an error', err);
                    return;
                }

                if (lastTrigger + timeBetween < Date.now()) {
                    lastTrigger = Date.now();
                    platform.log('Received signal from GPIO port.');
                    platform.triggerMotion();
                }
            });

            process.on('SIGINT', platform.unexportOnClose);
        }.bind(this));
    }
}

MailboxPlatform.prototype.unexportOnClose = function () {
    pushButton.unexport();
}

MailboxPlatform.prototype.configureAccessory = function (accessory) {
    const platform = this;
    // platform.log(accessory.displayName, "Configure Accessory");
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

    platform.accessories.push(accessory);
}

MailboxPlatform.prototype.addAccessory = function (accessoryName) {
    const platform = this;
    // platform.log("Add Accessory");
    var uuid = UUIDGen.generate(accessoryName);

    var newAccessory = new Accessory(accessoryName, uuid);
    platform.configureAccessory(newAccessory);
    platform.api.registerPlatformAccessories("homebridge-mailbox", "MailboxPlatform", [newAccessory]);
}

MailboxPlatform.prototype.updateAccessoriesReachability = function () {
    const platform = this;
    platform.log("Update Reachability");
    for (var index in platform.accessories) {
        var accessory = platform.accessories[index];
        accessory.updateReachability(true);
    }
}

MailboxPlatform.prototype.triggerMotion = function () {
    const platform = this;
    // platform.log("Trigger");
    for (var index in platform.accessories) {
        var accessory = platform.accessories[index];
        motion = true;
        accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, true);
        setTimeout(() => {
            motion = false;
            accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, false);
        }, 3000);
    }
}

MailboxPlatform.prototype.removeAccessory = function () {
    const platform = this;
    // platform.log("Remove Accessory");
    platform.api.unregisterPlatformAccessories("homebridge-mailbox", "MailboxPlatform", platform.accessories);

    platform.accessories = [];
}