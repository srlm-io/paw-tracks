#!/bin/bash

source /opt/ros/indigo/setup.bash && rosrun mavros mavros_node _fcu_url:=udp://:14650@ _gcs_url:=udp://:14551@192.168.1.189:14550
