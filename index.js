const { Gpio } = require('onoff');

const pluginName = 'homebridge-mailbox';
const platformName = 'MailboxPlatform';


let Accessory;
let Service;
let Characteristic;
let UUIDGen;

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
    platform.log(`Could not find config for mailbox plugin.${' '
      }Please take a look in your config.json`);
    return;
  }

  platform.config.mailboxName = platform.config.mailboxName || 'Mailbox';
  platform.config.gpioPort = platform.config.gpioPort || 4;
  platform.config.minimumSignals = platform.config.minimumSignals || 10;
  platform.config.maximumAmountBetweenSignals =
    platform.config.maximumAmountBetweenSignals || 2000;
  platform.config.debug = platform.config.debug || false;

  if (platform.config.timeBetween && platform.config.timeBetween >= 5000) {
    platform.log(`Using ${platform.config.timeBetween
      }ms as time between triggers.`);
  } else {
    platform.config.timeBetween = 5000;
    platform.log('Using 5000ms as time between triggers.');
  }

  if (api) {
    platform.api = api;

    platform.api.on('didFinishLaunching', () => {
      if (platform.accessories.length === 0) {
        platform.addAccessory(platform.config.mailboxName || 'Mailbox');
      }

      platform.pushButton = new Gpio(platform.config.gpioPort, 'in', 'both');
      platform.pushButton.watch((err) => {
        if (err) {
          platform.log('There was an error', err);
          return;
        }

        if (platform.timer
          && platform.counter >= platform.config.minimumSignals) {
          return;
        }

        if (platform.timer) {
          clearTimeout(platform.timer);
        }

        platform.counter += 1;
        platform.timer = setTimeout(() => {
          if (platform.lastTrigger + platform.config.timeBetween < Date.now()
            && platform.counter >= platform.config.minimumSignals) {
            platform.lastTrigger = Date.now();
            platform.log('Received signal from GPIO port.');
            platform.triggerMotion();
          }

          if (platform.config.debug) {
            platform.log(`Counted ${platform.counter} signals.`);
          }
          platform.counter = 0;
          platform.timer = null;
        }, platform.config.maximumAmountBetweenSignals);
      });

      platform.api.on('shutdown', platform.unexportOnClose);
    });
  }
}

module.exports = (homebridge) => {
  Accessory = homebridge.platformAccessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform(pluginName, platformName, MailboxPlatform, true);
};

MailboxPlatform.prototype.unexportOnClose = function unexportOnClose() {
  const platform = this;
  if (platform.pushButton) {
    platform.pushButton.unexport();
  }
};

/* eslint max-len: ["error", { "ignoreComments": true }] no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["accessory"] }] */
MailboxPlatform.prototype.configureAccessory =
  function configureAccessory(accessory) {
    const platform = this;
    accessory.reachable = true;

    accessory.on('identify', (paired, callback) => {
      callback();
    });

    accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'Mailbox Inc.')
      .setCharacteristic(Characteristic.Model, 'Type B')
      .setCharacteristic(Characteristic.SerialNumber, 'MB-853AF1');

    if (!accessory.getService(Service.MotionSensor)) {
      accessory.addService(Service.MotionSensor);
    }

    accessory.getService(Service.MotionSensor)
      .getCharacteristic(Characteristic.MotionDetected)
      .on('get', callback => callback(null, Boolean(platform.motion)));

    platform.accessories.push(accessory);
  };

MailboxPlatform.prototype.addAccessory = function addAccessory(accessoryName) {
  const platform = this;
  const uuid = UUIDGen.generate(accessoryName);

  const newAccessory = new Accessory(accessoryName, uuid);
  platform.configureAccessory(newAccessory);
  platform.api.registerPlatformAccessories(
    pluginName, platformName, [newAccessory]);
};

MailboxPlatform.prototype.updateAccessoriesReachability =
  function updateAccessoriesReachability() {
    const platform = this;
    for (const index of platform.accessories) {
      platform.accessories[index].updateReachability(true);
    }
  };

MailboxPlatform.prototype.triggerMotion = function triggerMotion() {
  const platform = this;
  for (const index of platform.accessories) {
    const accessory = platform.accessories[index];
    platform.motion = true;
    accessory.getService(Service.MotionSensor)
      .setCharacteristic(Characteristic.MotionDetected, true);
  }

  setTimeout(() => {
    for (const index of platform.accessories) {
      const accessory = platform.accessories[index];
      platform.motion = false;
      accessory.getService(Service.MotionSensor)
        .setCharacteristic(Characteristic.MotionDetected, false);
    }
  }, platform.config.timeBetween - 1000);
};

MailboxPlatform.prototype.removeAccessory = function removeAccessory() {
  const platform = this;
  platform.api.unregisterPlatformAccessories(
    pluginName, platformName, platform.accessories);

  platform.accessories = [];
};
