# homebridge-mailbox-LoRa-TTN
A plugin with LoRaWan TTN support for Homebridge: https://github.com/nfarina/homebridge 
Thanks Alex for the excellent job done on the initial project that i forked

## Why this name?


## Installation

Install the plugin via npm:

```bash
npm install homebridge-mailbox-Lora-TTN -g
```

## My Installation

### Hardware


### Steps:
#### Receiver:



## Configuration
Example config.json:

    {
        "platforms": [
            {
                "platform": "MailboxPlatform",
                "name": "mailbox",
                "mailboxName" : "Mailbox",
                "timeBetween": 5000,
                "minimumSignals": 10,
                "maximumAmountBetweenSignals": 2000,
                "debug": false
            }
        ]
    }

### mailboxName
The name of the mailbox in the Home app

### timeBetween
The minimum time between to triggers of the motion sensor. (Minimum is set to 5 seconds)

### minimumSignals
The minimum of signals with is required to trigger the motion sensor. You can set the maximum amount between two signals with "maximumAmountBetweenSignals". After that period of time the counter starts again at zero.

### maximumAmountBetweenSignals
The maximum amount between two signals.

### debug
If set to true you will see if the plugin detects a signal from the specified GPIO port.
