var Gpio = require('onoff').Gpio;
var pushButton = new Gpio(4, 'in', 'both');

pushButton.watch(function (err, value) {
    if (err) {
        console.error('There was an error', err);
        return;
    }
    console.log('Received signal');
});

function unexportOnClose() {
    pushButton.unexport();
};

process.on('SIGINT', unexportOnClose);