const mqtt = require('mqtt');

const options = {
  username: 'letter-box-1@ttn',
  password: 'NNSXS.JCOLLLKQ4WP6VO2RXJHOEONHHCG22ZIG5HHEBNY.7PQITYF4KEJNP6FAMEZCYC52KRP2NCZRGT6TF3ML2VHX2OLJ4O2Q',
}

const client  = mqtt.connect('mqtt://eu1.cloud.thethings.network:1883',options)

var Accessory, Service, Characteristic, UUIDGen;

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
    platform.config = config || {};
    platform.accessories = [];

    platform.counter = 0;
    platform.timeBetween = 0;
    platform.timer = null;
    platform.lastTrigger = 0;
    platform.motion = false;

    if (!platform.config) {
        platform.log('Could not find config for mailbox plugin. Please take a look in your config.json');
        return;
    }

    platform.config.mailboxName = platform.config.mailboxName || 'Mailbox';
    platform.config.gpioPort = platform.config.gpioPort || 4;
    platform.config.minimumSignals = platform.config.minimumSignals || 10;
    platform.config.maximumAmountBetweenSignals = platform.config.maximumAmountBetweenSignals || 2000;
    platform.config.debug = platform.config.debug || false;

    if (platform.config.timeBetween && platform.config.timeBetween >= 5000) {
        platform.log(`Using ${platform.config.timeBetween}ms as time between triggers.`);
    } else {
        platform.config.timeBetween = 5000;
        platform.log('Using 5000ms as time between triggers.');
    }

    if (api) {
        platform.api = api;

        platform.api.on('didFinishLaunching', function () {
            if (platform.accessories.length === 0) {
                platform.addAccessory(platform.config.mailboxName || 'Mailbox');
            }
        client.on('connect', function () {
			console.log('Connected')
			client.subscribe('v3/letter-box-1@ttn/devices/eui-70b3d57ed0046e5a/up', function (err) {
		    if (!err) {
				console.log('Subscribe OK')     
			}
			else
				console.log("Error Subscribe");
	  
			})
  
		})

		client.on('message', function (topic, message) {
			// message is Buffer
			console.log(message.toString())
			client.end()
		})

        platform.api.on('shutdown', platform.unexportOnClose);
        }.bind(this));
    }
}

MailboxPlatform.prototype.unexportOnClose = function () {
    const platform = this;
}

MailboxPlatform.prototype.configureAccessory = function (accessory) {
    const platform = this;
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
            callback(null, Boolean(platform.motion));
        });

    platform.accessories.push(accessory);
}

MailboxPlatform.prototype.addAccessory = function (accessoryName) {
    const platform = this;
    var uuid = UUIDGen.generate(accessoryName);

    var newAccessory = new Accessory(accessoryName, uuid);
    platform.configureAccessory(newAccessory);
    platform.api.registerPlatformAccessories("homebridge-mailbox", "MailboxPlatform", [newAccessory]);
}

MailboxPlatform.prototype.updateAccessoriesReachability = function () {
    const platform = this;
    for (var index in platform.accessories) {
        var accessory = platform.accessories[index];
        accessory.updateReachability(true);
    }
}

MailboxPlatform.prototype.triggerMotion = function () {
    const platform = this;
    for (var index in platform.accessories) {
        var accessory = platform.accessories[index];
        platform.motion = true;
        accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, true);
        setTimeout(() => {
            platform.motion = false;
            accessory.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, false);
        }, platform.config.timeBetween - 1000);
    }
}

MailboxPlatform.prototype.removeAccessory = function () {
    const platform = this;
    platform.api.unregisterPlatformAccessories("homebridge-mailbox", "MailboxPlatform", platform.accessories);

    platform.accessories = [];
}
