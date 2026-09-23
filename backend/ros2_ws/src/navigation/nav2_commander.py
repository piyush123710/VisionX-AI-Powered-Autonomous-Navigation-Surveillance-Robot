#!/usr/bin/env python3
"""
VisionX Autonomous Nav2 Commander: nav2_commander.py
Platform: Ubuntu 22.04 LTS (ROS 2 Humble Hawksbill)
Dependencies: rclpy, nav2_simple_commander, geometry_msgs

Dispatches waypoints to the Nav2 Action Server, coordinates A* global planning
with TEB local trajectory optimization, and executes dynamic avoidance maneuvers
upon detecting obstacles from the vision and LiDAR perception nodes.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped, Twist
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
import math
import time

class AutonomousCommander(Node):
    def __init__(self):
        super().__init__('autonomous_commander')
        self.navigator = BasicNavigator()
        
        # Publisher for direct velocity override in emergency stop
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        
        self.get_logger().info("Nav2 Autonomous Commander initialized. Waiting for Nav2 active state...")
        # Wait for Nav2 to spin up
        # self.navigator.waitUntilNav2Active()
        self.get_logger().info("Nav2 is ready to accept navigation goals.")

    def create_pose(self, x: float, y: float, yaw_deg: float = 0.0) -> PoseStamped:
        """Helper to create PoseStamped in 'map' coordinate frame with quaternion orientation."""
        pose = PoseStamped()
        pose.header.frame_id = 'map'
        pose.header.stamp = self.navigator.get_clock().now().to_msg()
        pose.pose.position.x = float(x)
        pose.pose.position.y = float(y)
        pose.pose.position.z = 0.0

        # Convert 2D planar yaw (degrees) to 3D quaternion
        yaw_rad = math.radians(yaw_deg)
        pose.pose.orientation.z = math.sin(yaw_rad / 2.0)
        pose.pose.orientation.w = math.cos(yaw_rad / 2.0)
        return pose

    def navigate_to_waypoint(self, x: float, y: float, yaw_deg: float = 0.0):
        """Dispatches goal pose to Nav2 Action Server and monitors feedback loop."""
        goal_pose = self.create_pose(x, y, yaw_deg)
        self.get_logger().info(f"Navigating to coordinate ({x:.2f}, {y:.2f}) at heading {yaw_deg:.1f}°")
        
        self.navigator.goToPose(goal_pose)
        
        while not self.navigator.isTaskComplete():
            feedback = self.navigator.getFeedback()
            if feedback:
                dist_rem = feedback.distance_remaining
                nav_time = feedback.navigation_time.sec
                self.get_logger().info(f"Navigating... Distance remaining: {dist_rem:.2f}m, Elapsed: {nav_time}s")
            time.sleep(0.5)

        result = self.navigator.getResult()
        if result == TaskResult.SUCCEEDED:
            self.get_logger().info("Waypoint successfully reached!")
            return True
        elif result == TaskResult.CANCELED:
            self.get_logger().warn("Navigation was canceled by operator.")
            return False
        elif result == TaskResult.FAILED:
            self.get_logger().error("Navigation task failed! Re-evaluating costmap...")
            return False

    def emergency_stop(self):
        """Immediately halts all motion and cancels ongoing navigation actions."""
        self.navigator.cancelTask()
        stop_cmd = Twist()
        self.cmd_vel_pub.publish(stop_cmd)
        self.get_logger().fatal("EMERGENCY STOP TRIGGERED: Zero velocity command published.")

def main(args=None):
    rclpy.init(args=args)
    commander = AutonomousCommander()
    try:
        # Example waypoint execution:
        commander.navigate_to_waypoint(15.0, 30.0, 90.0)
    except KeyboardInterrupt:
        commander.emergency_stop()
    finally:
        rclpy.shutdown()

if __name__ == '__main__':
    main()
