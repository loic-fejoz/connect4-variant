// Mock webxdc.js for local browser development (outside of webxdc-dev)
window.webxdc = {
    selfAddr: 'device_owner',
    selfName: 'Device Owner',
    setUpdateListener: (cb) => {
        console.log('webxdc.setUpdateListener called');
        // Mock initial state
        cb({
            payload: null,
            serial: 0,
            info: undefined
        });
    },
    sendUpdate: (update, description) => {
        console.log('webxdc.sendUpdate called', update, description);
    }
};
