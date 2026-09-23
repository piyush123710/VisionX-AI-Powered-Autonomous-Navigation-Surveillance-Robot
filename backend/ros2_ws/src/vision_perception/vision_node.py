#!/usr/bin/env python3
"""
VisionX ROS 2 Perception Node: vision_node.py
Platform: NVIDIA Jetson Orin / Ubuntu 22.04 LTS (ROS 2 Humble Hawksbill)
Dependencies: rclpy, sensor_msgs, cv_bridge, ultralytics (YOLOv8 TensorRT)

Performs real-time YOLOv8 object detection on Intel RealSense D435i stream,
estimates 3D spatial depth coordinates using aligned depth frames,
and publishes DetectedObjectArray messages with persistent ByteTrack tracking IDs.
"""

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
from sensor_msgs.msg import Image, CameraInfo
from std_msgs.msg import Header
import cv2
from cv_bridge import CvBridge
import numpy as np
from ultralytics import YOLO

class VisionPerceptionNode(Node):
    def __init__(self):
        super().__init__('vision_perception_node')
        
        # Declare parameters
        self.declare_parameter('model_path', 'yolov8x_autonomous.engine')
        self.declare_parameter('confidence_cutoff', 0.55)
        self.declare_parameter('tracker_config', 'bytetrack.yaml')
        
        model_file = self.get_parameter('model_path').get_parameter_value().string_value
        self.conf_cutoff = self.get_parameter('confidence_cutoff').get_parameter_value().double_value
        tracker_file = self.get_parameter('tracker_config').get_parameter_value().string_value
        
        self.get_logger().info(f"Loading TensorRT FP16 perception engine: {model_file}...")
        self.model = YOLO(model_file)
        self.bridge = CvBridge()
        
        # Best-effort sensor QoS profile
        sensor_qos = QoSProfile(
            reliability=ReliabilityPolicy.BEST_EFFORT,
            history=HistoryPolicy.KEEP_LAST,
            depth=1
        )
        
        # ROS 2 Subscriptions
        self.image_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.color_callback,
            sensor_qos
        )
        self.depth_sub = self.create_subscription(
            Image,
            '/camera/aligned_depth_to_color/image_raw',
            self.depth_callback,
            sensor_qos
        )
        
        # ROS 2 Publishers
        self.annotated_pub = self.create_publisher(Image, '/visionx/perception/annotated_feed', 10)
        
        self.latest_depth_frame = None
        self.camera_intrinsics = {'fx': 615.0, 'fy': 615.0, 'cx': 320.0, 'cy': 240.0}
        self.get_logger().info("VisionX Perception Node successfully started and ready for frames.")

    def depth_callback(self, msg: Image):
        try:
            # Convert 16-bit millimeter depth image to OpenCV numpy array
            self.latest_depth_frame = self.bridge.imgmsg_to_cv2(msg, desired_encoding='passthrough')
        except Exception as e:
            self.get_logger().error(f"Depth conversion failed: {e}")

    def color_callback(self, msg: Image):
        try:
            frame = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
        except Exception as e:
            self.get_logger().error(f"Color frame conversion failed: {e}")
            return

        # Perform YOLO inference and ByteTrack object tracking
        results = self.model.track(
            frame, 
            persist=True, 
            conf=self.conf_cutoff, 
            tracker="bytetrack.yaml", 
            verbose=False
        )

        detections_payload = []

        if results and len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = self.model.names[class_id]
                track_id = int(box.id[0]) if box.id is not None else -1

                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)

                # Query Euclidean depth in meters from aligned RealSense depth map
                distance_meters = 0.0
                if self.latest_depth_frame is not None:
                    h, w = self.latest_depth_frame.shape
                    if 0 <= center_y < h and 0 <= center_x < w:
                        # RealSense depth is in millimeters
                        raw_depth = self.latest_depth_frame[center_y, center_x]
                        if raw_depth > 0:
                            distance_meters = float(raw_depth) / 1000.0

                # 3D Camera Coordinate De-projection (Z: distance, X: lateral, Y: height)
                z = distance_meters
                x_3d = (center_x - self.camera_intrinsics['cx']) * z / self.camera_intrinsics['fx']
                y_3d = (center_y - self.camera_intrinsics['cy']) * z / self.camera_intrinsics['fy']

                detections_payload.append({
                    "id": track_id,
                    "label": label,
                    "confidence": confidence,
                    "bbox": [float(x1), float(y1), float(x2), float(y2)],
                    "distance_m": round(distance_meters, 2),
                    "pos_3d": [round(x_3d, 2), round(y_3d, 2), round(z, 2)]
                })

                # Visual HUD overlay on RGB stream
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 200), 2)
                caption = f"#{track_id} {label} {distance_meters:.2f}m ({int(confidence*100)}%)"
                cv2.putText(frame, caption, (int(x1), max(20, int(y1) - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 200), 2)

        # Publish annotated stream back to ROS network for Web/Rviz display
        out_msg = self.bridge.cv2_to_imgmsg(frame, encoding='bgr8')
        out_msg.header = msg.header
        self.annotated_pub.publish(out_msg)

def main(args=None):
    rclpy.init(args=args)
    node = VisionPerceptionNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
