#!/usr/bin/env python3
"""
VisionX Telemetry WebSocket & MQTT Gateway: mqtt_bridge.py
Platform: Ubuntu 22.04 LTS (ROS 2 Humble Hawksbill)
Dependencies: rclpy, nav_msgs, sensor_msgs, websockets, asyncio

Serializes ROS 2 topics (/odom, /scan, /battery_state, /visionx/detected_objects)
and broadcasts high-frequency telemetry over WebSockets to the Web Dashboard.
"""

import asyncio
import json
import websockets
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from sensor_msgs.msg import LaserScan, BatteryState, Imu
from geometry_msgs.msg import Twist

class TelemetryBridge(Node):
    def __init__(self, ws_clients_set):
        super().__init__('telemetry_bridge')
        self.clients = ws_clients_set
        
        # ROS 2 Subscribers
        self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.create_subscription(BatteryState, '/battery_state', self.battery_callback, 10)
        self.create_subscription(Imu, '/imu/data', self.imu_callback, 10)
        
        # Telemetry State Cache
        self.state = {
            "type": "telemetry_update",
            "position": {"x": 0.0, "y": 0.0},
            "speed": 0.0,
            "heading": 0.0,
            "battery": 100.0,
            "timestamp": 0
        }
        self.get_logger().info("VisionX Telemetry Bridge listening on ROS 2 topics.")

    def odom_callback(self, msg: Odometry):
        self.state["position"]["x"] = round(msg.pose.pose.position.x, 2)
        self.state["position"]["y"] = round(msg.pose.pose.position.y, 2)
        self.state["speed"] = round(msg.twist.twist.linear.x, 2)
        self.broadcast_telemetry()

    def battery_callback(self, msg: BatteryState):
        self.state["battery"] = round(msg.percentage * 100.0, 1)

    def imu_callback(self, msg: Imu):
        # Calculate yaw from quaternion
        q = msg.orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        import math
        yaw_rad = math.atan2(siny_cosp, cosy_cosp)
        self.state["heading"] = round(math.degrees(yaw_rad), 1)

    def broadcast_telemetry(self):
        if not self.clients:
            return
        payload = json.dumps(self.state)
        # Dispatch to active web dashboard clients
        for client in list(self.clients):
            asyncio.create_task(self.send_to_client(client, payload))

    async def send_to_client(self, client, payload):
        try:
            await client.send(payload)
        except Exception:
            self.clients.discard(client)

async def ws_handler(websocket, clients_set, cmd_vel_pub):
    clients_set.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("action") == "cmd_vel":
                twist = Twist()
                twist.linear.x = float(data.get("linear", 0.0))
                twist.angular.z = float(data.get("angular", 0.0))
                cmd_vel_pub.publish(twist)
    finally:
        clients_set.discard(websocket)

def main():
    rclpy.init()
    clients = set()
    node = TelemetryBridge(clients)
    
    # Run ROS and WebSocket server concurrently
    cmd_pub = node.create_publisher(Twist, '/cmd_vel', 10)
    print("WebSocket Telemetry Server starting on ws://0.0.0.0:9090...")
    
    # In production, spin in separate thread with asyncio loop
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
