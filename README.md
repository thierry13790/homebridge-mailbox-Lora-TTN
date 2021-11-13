# homebridge-mailbox
A plugin with GPIO support for Homebridge: https://github.com/nfarina/homebridge 

## Why this name?
I initially started this project to use it as notification system with my mailbox. In order to do that I used a wireless battery powered doorbell. I put the transmitter in my mailbox and connected it with button which noticed if someone open the lid. If this happens the transmitter sends a signal to the receiver which is connected to my raspberry pi.

## Installation

Install the plugin via npm:

```bash
npm install homebridge-mailbox-Lora-TTN -g
```

## My Installation

### Hardware


### Steps:
#### Receiver:


### Sender:
Screw the sender apart and locate the "GND" and "+" pins of the button. Solder one cable on each pin. Now we want to have a closed power circuit if the lever is opend. So try out which to pins of lever achieve this behaviour. After that fix the level behind your mailbox lid. You can use for example adhesive. You need to pay attention if the button behind the lever is pressed when the mailbox lid is closed. If not the sender will send continuously a signal to the receiver.


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
                "maximumAmountBetweenSignals": 2000,
                "debug": false
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

### debug
If set to true you will see if the plugin detects a signal from the specified GPIO port.