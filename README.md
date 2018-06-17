# homebridge-mailbox
A plugin with GPIO support for Homebridge: https://github.com/nfarina/homebridge 

## Why this name?
I initially started this project to use it as notification system with my mailbox. In order to do that I used a wireless battery powered doorbell. I put the transmitter in my mailbox and connected it with button which noticed if someone open the lid. If this happens the transmitter sends a signal to the receiver which is connected to my raspberry pi.

## Installation

Install the plugin via npm:

```bash
npm install homebridge-mailbox -g
```

## Configuration
Example config.json:

    {
        "platforms": [
            {
                "platform": "MailboxPlatform",
                "name": "mailbox",
                "mailboxName" : "Mailbox",
                "gpioPort": 4,
                "timeBetween": 5000,
                "minimumSignals": 10,
                "maximumAmountBetweenSignals": 2000
            }
        ]
    }

### mailboxName
The name of the mailbox in the Home app

### gpioPort
The port of the Raspberry PI to listen

### timeBetween
The minimum time between to triggers of the motion sensor. (Minimum is set to 5 seconds)

### minimumSignals
The minimum of signals with is required to trigger the motion sensor. You can set the maximum amount between two signals with "maximumAmountBetweenSignals". After that period of time the counter starts again at zero.

### maximumAmountBetweenSignals
The maximum amount between two signals.