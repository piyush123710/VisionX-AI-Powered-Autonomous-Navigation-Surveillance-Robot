cmake_minimum_required(VERSION 3.8)
project(visionx_robotics)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(ament_cmake_python REQUIRED)
find_package(rclpy REQUIRED)

# Install Python ROS 2 nodes
install(PROGRAMS
  src/vision_perception/vision_node.py
  src/navigation/nav2_commander.py
  src/telemetry_bridge/mqtt_bridge.py
  src/motor_driver/cmd_vel_controller.py
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()
