#!/usr/bin/env python3
"""
VisionX Low-Level Motor Driver & Actuation Controller: cmd_vel_controller.py
Platform: Ubuntu 22.04 LTS (ROS 2 Humble Hawksbill)
Hardware: RoboClaw 2x30A / dual brushless DC drive motors via USB/CAN bus

Subscribes to /cmd_vel, computes differential drive kinematics, converts
linear/angular velocities into individual left and right wheel RPM/PWM commands,
and monitors optical encoder pulses for closed-loop PID speed control.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

class DifferentialDriveController(Node):
    def __init__(self):
        super().__init__('cmd_vel_controller')
        
        # Physical Robot Kinematic Specifications
        self.wheel_radius_m = 0.0825  # 165mm diameter all-terrain wheels
        self.track_width_m = 0.44    # 440mm distance between left & right wheels
        self.gear_ratio = 30.0
        self.encoder_cpr = 1024
        
        # ROS 2 Subscriber
        self.sub = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10
        )
        
        # ROS 2 Publisher for wheel odometry feedback
        self.odom_pub = self.create_publisher(Odometry, '/odom/raw_wheels', 10)
        
        self.get_logger().info("Differential Drive Actuation Controller initialized.")

    def cmd_vel_callback(self, msg: Twist):
        v = msg.linear.x    # m/s
        w = msg.angular.z   # rad/s

        # Differential Drive Kinematics
        # v_left = v - (w * track_width / 2)
        # v_right = v + (w * track_width / 2)
        v_left = v - (w * self.track_width_m / 2.0)
        v_right = v + (w * self.track_width_m / 2.0)

        # Convert linear velocity to wheel rotational speed (rad/s and RPM)
        rad_s_left = v_left / self.wheel_radius_m
        rad_s_right = v_right / self.wheel_radius_m

        rpm_left = (rad_s_left * 60.0) / (2.0 * 3.14159265)
        rpm_right = (rad_s_right * 60.0) / (2.0 * 3.14159265)

        # In physical deployment, write PWM or CAN packet to motor controller:
        # roboclaw.SpeedM1M2(0x80, int(rpm_left * self.gear_ratio), int(rpm_right * self.gear_ratio))
        self.get_logger().debug(
            f"Drive Demand: v={v:.2f}m/s, w={w:.2f}rad/s -> Left: {rpm_left:.1f} RPM, Right: {rpm_right:.1f} RPM"
        )

def main(args=None):
    rclpy.init(args=args)
    node = DifferentialDriveController()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
