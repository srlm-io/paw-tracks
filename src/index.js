// Connecting to ROS
var ROSLIB = require('roslib');

try {
    var ros = new ROSLIB.Ros({
        url: 'ws://paw-tracks:9090'
    });
} catch (err) {
    console.log('Error connecting to ROS. Exiting.');
    console.log(err);
    process.exit(3);
}

ros.on('connection', function() {
    console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
    process.exit(2);
});

ros.on('close', function() {
    console.log('Connection to websocket server closed.');
});

/*#TODO
#
#If you don't use GCS, but want to get data from rostopic then you need to enter the following command for setting the stream rate:
#
# rosservice call /mavros/set_stream_rate 0 10 1
*/

var imuListener = new ROSLIB.Topic({
    ros: ros,
    name: '/mavros/imu/data',
    messageType: 'sensor_msgs/Imu'
});

var positionListener = new ROSLIB.Topic({
    ros: ros,
    name: '/mavros/global_position/global',
    messageType: 'sensor_msgs/NavSatFix'
});

var velocityListener = new ROSLIB.Topic({
    ros: ros,
    name: '/mavros/local_position/velocity',
    messageType: 'geometry_msgs/TwistStamped'
});

var state = {
    time: null,
    latitude: null,
    longitude: null,
    altitude: null,
    orientation_x: null,
    orientation_y: null,
    orientation_z: null,
    orientation_w: null,
    acceleration_x: null,
    acceleration_y: null,
    acceleration_z: null,
    velocity_x: null,
    velocity_y: null,
    velocity_z: null
};

imuListener.subscribe(function(message) {
    state.time = message.header.stamp.secs + message.header.stamp.nsecs / 1000000000;
    state.orientation_x = message.orientation.x;
    state.orientation_y = message.orientation.y;
    state.orientation_z = message.orientation.z;
    state.orientation_w = message.orientation.w;

    state.acceleration_x = message.linear_acceleration.x;
    state.acceleration_y = message.linear_acceleration.y;
    state.acceleration_z = message.linear_acceleration.z;
});

positionListener.subscribe(function(message) {
    state.time = message.header.stamp.secs + message.header.stamp.nsecs / 1000000000;
    state.latitude = message.latitude;
    state.longitude = message.longitude;
    state.altitude = message.altitude;
});

velocityListener.subscribe(function(message) {
    // 1 mile = 1609.34 meters
    // 1 knot = 1.15078 mph
    state.time = message.header.stamp.secs + message.header.stamp.nsecs / 1000000000;
    state.velocity_x = message.twist.linear.x;
    state.velocity_y = message.twist.linear.y;
    state.velocity_z = message.twist.linear.z;
});

var logger = null;
const fs = require('fs');

function createLogger(timestamp) {
    console.log(`Creating log file /data/log-${timestamp}.csv`);
    return fs.createWriteStream(`/data/log-${timestamp}.csv`, {
        flags: 'a' // 'a' means appending (old data will be preserved)
    });
}

const sortedKeys = Object.keys(state).sort();

setInterval(function() {
    if (logger === null && state.time !== null) {
        logger = createLogger(state.time);
        logger.write(sortedKeys.join(', ') + '\n');
    }

    if (logger !== null) {
        var resultArray = [];
        for (let key of sortedKeys) {
            resultArray.push(state[key]);
        }
        logger.write(resultArray.join(', ') + '\n');
    }
}, 50);
