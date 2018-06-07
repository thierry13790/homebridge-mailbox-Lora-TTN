# homebridge-mailbox
A plugin with GPIO support for Homebridge: https://github.com/nfarina/homebridge 

## Why this name?
I initially started this project to use it as notification system with my mailbox. In order to do that I used a wireless battery powered doorbell. I put the transmitter in my mailbox and connected it with button which noticed if someone open the lid. If this happens the transmitter sends a signal to the receiver which is connected to my raspberry pi.

## Configuration
Example config.json:

    {
        "platforms": [
            {
                "platform": "MailboxPlatform",
                "name": "mailbox",
                "mailboxName" : "Mailbox",
                "gpioPort": 4
            }
        ]
    }