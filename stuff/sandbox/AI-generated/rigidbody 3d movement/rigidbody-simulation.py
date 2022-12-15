from typing import Dict, Tuple
import numpy as np
import math

class Block:
  def __init__(self, thrustDir: Tuple[int, int, int], thrustForce: int, density: int, airResistance: int) -> None:
    self.thrustDir = thrustDir
    self.thrustForce = thrustForce
    self.density = density
    self.airResistance = airResistance

def simulate_rigidbody_movement(rigidbody: Dict[Tuple[int, int, int], Block], position: Tuple[int, int, int], rotation: Tuple[int, int, int, int]) -> Tuple[Tuple[int, int, int], Tuple[int, int, int, int]]:
  # Initialize the variables to store the net force and net torque applied to the rigidbody
  net_force = [0, 0, 0]
  net_torque = [0, 0, 0]

  # Loop over the voxels in the rigidbody and calculate the net force and net torque
  for coordinates, block in rigidbody.items():
    # Calculate the relative position of the voxel with respect to the center of the rigidbody
    rel_pos = (coordinates[0] - position[0], coordinates[1] - position[1], coordinates[2] - position[2])
    
    # Apply the thrust force in the direction specified by the thrustDir vector
    net_force[0] += block.thrustDir[0] * block.thrustForce
    net_force[1] += block.thrustDir[1] * block.thrustForce
    net_force[2] += block.thrustDir[2] * block.thrustForce
    
    # Calculate the torque applied by the thrust force using the cross product
    net_torque[0] += rel_pos[1] * block.thrustDir[2] * block.thrustForce - rel_pos[2] * block.thrustDir[1] * block.thrustForce
    net_torque[1] += rel_pos[2] * block.thrustDir[0] * block.thrustForce - rel_pos[0] * block.thrustDir[2] * block.thrustForce
    net_torque[2] += rel_pos[0] * block.thrustDir[1] * block.thrustForce - rel_pos[1] * block.thrustDir[0] * block.thrustForce
    
  # Calculate the linear and angular acceleration of the rigidbody based on the net force and torque
  mass = sum([block.density for block in rigidbody.values()])  # Calculate the total mass of the rigidbody
  lin_accel = [f / mass for f in net_force]  # Linear acceleration is the net force divided by mass
  ang_accel = [t / mass for t in net_torque]  # Angular acceleration is the net torque divided by mass

  # Update the position and rotation of the rigidbody using the linear and angular acceleration and the fixed simulation tick time
  position = (position[0] + lin_accel[0] * SIM_TICK, position[1] + lin_accel[1] * SIM_TICK, position[2] + lin_accel[2] * SIM_TICK)
  rotation = update_rotation(rotation, ang_accel, SIM_TICK)

  return position, rotation

def magnitude(q: Tuple[int, int, int, int]) -> float:
  # Extract the components of the quaternion
  a, b, c, d = q

  # Calculate the magnitude of the quaternion using the formula above
  mag = math.sqrt(a**2 + b**2 + c**2 + d**2)

  return mag

def quaternion_conjugate(q: Tuple[int, int, int, int]) -> Tuple[int, int, int, int]:
  return (q[0], -q[1], -q[2], -q[3])

def quaternion_multiply(q1: Tuple[int, int, int, int], q2: Tuple[int, int, int, int]) -> Tuple[int, int, int, int]:
  # Extract the components of the quaternions
  a1, b1, c1, d1 = q1
  a2, b2, c2, d2 = q2

  # Calculate the components of the product quaternion using the formula above
  a = a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2
  b = a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2
  c = a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2
  d = a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2

  return (a, b, c, d)

def update_rotation(rotation: Tuple[int, int, int, int], ang_accel: list[int], sim_tick: int) -> Tuple[int, int, int, int]:
  # Convert the angular acceleration to a quaternion
  ang_accel_quat = (0, ang_accel[0], ang_accel[1], ang_accel[2])
  
  # Calculate the derivative of the current rotation
  rot_derivative = quaternion_multiply(rotation, ang_accel_quat)
  
  # Calculate the updated rotation using the derivative and the fixed simulation tick time
  updated_rot = (rotation[0] + rot_derivative[0] * sim_tick, rotation[1] + rot_derivative[1] * sim_tick, rotation[2] + rot_derivative[2] * sim_tick, rotation[3] + rot_derivative[3] * sim_tick)
  
  # Calculate the magnitude of the updated rotation
  mag = magnitude(updated_rot)

  # Normalize the updated rotation using the formula above
  updated_rot = (updated_rot[0] / mag, updated_rot[1] / mag, updated_rot[2] / mag, updated_rot[3] / mag)


  return updated_rot


# CREATE RIGIDBODY

# Import the Block class
# from block import Block

# Initialize the rigidbody as a dict
rigidbody = {}

# Set the length, width, and depth of the bar
length = 20
width = 1
depth = 1

# Set the thrust direction and thrust force for each voxel
thrust_dir = (1, 0, 0)
thrust_force = 2

# Set the density and air resistance for each voxel
density = 1
air_resistance = 0.1

# Loop over the x, y, and z coordinates of the voxels in the bar
for x in range(-5, length):
  for y in range(width):
    for z in range(depth):
      # Create a Block object for the voxel at these coordinates
      block = Block(thrust_dir, thrust_force if x < 0 else 0, density, air_resistance)

      # Add the voxel to the rigidbody
      rigidbody[(x, y, z)] = block



# VISUALIZATION



# Import the necessary modules
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Create a 3D figure
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Loop over the voxels in the rigidbody and plot them
for coordinates, block in rigidbody.items():
  # Extract the x, y, and z coordinates of the voxel
  x, y, z = coordinates

  # Plot the voxel using the x, y, and z coordinates and the density of the voxel
  ax.scatter(x, y, z, c=block.density, marker='o')

# Show the figure
plt.show()

# Create a 3D figure
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Loop over the voxels in the rigidbody and plot the thrust forces
for coordinates, block in rigidbody.items():
  # Extract the x, y, and z coordinates of the voxel
  x, y, z = coordinates

  # Calculate the endpoints of the thrust vector
  x_end = x + block.thrustDir[0] * block.thrustForce
  y_end = y + block.thrustDir[1] * block.thrustForce
  z_end = z + block.thrustDir[2] * block.thrustForce

  # Plot the thrust vector using the x, y, and z coordinates and the endpoints of the vector
  ax.quiver(x, y, z, x_end, y_end, z_end, color='r')

# Show the figure
plt.show()



# SIMULATE



# Set the position and rotation of the rigidbody
position = (0, 0, 0)
rotation = (1, 0, 0, 0)  # Quaternion representation of the identity rotation

# Set the simulation tick speed
SIM_TICK = 1

# Loop over the simulation ticks
for i in range(10):
  # Simulate the movement of the rigidbody
  position, rotation = simulate_rigidbody_movement(rigidbody, position, rotation)

  # Print the position and rotation of the rigidbody
  print(f'Tick {i}: position = {position}, rotation = {rotation}')




# VISUALIZE MOVEMENT IN MATPLOTLIB

# # Define the rotate_vector function
# def rotate_vector(vec: Tuple[int, int, int], quat: Tuple[int, int, int, int]) -> Tuple[int, int, int]:
#   # Calculate the rotated vector using the quaternion multiplication formula
#   rotated_vec = quaternion_multiply(quat, quaternion_multiply((0, vec[0], vec[1], vec[2]), quaternion_conjugate(quat)))

#   # Return the x, y, and z components of the rotated vector
#   return rotated_vec[1], rotated_vec[2], rotated_vec[3]

# # Create a 3D scatter plot of the voxels in the rigidbody
# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')

# # Get the coordinates of the voxels in the rigidbody
# voxel_coords = list(rigidbody.keys())

# # Plot the voxels in the scatter plot
# ax.scatter3D(*zip(*voxel_coords))

# Set the initial position and rotation of the rigidbody
position = (0, 0, 0)
rotation = orientation = (1, 0, 0, 0)  # Quaternion representation of the identity rotation

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Create the 3D scatter plot
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Initialize the plot with the initial position and orientation of the rigid body
ax.scatter(x, y, z, c='r')

# Define a function to update the plot at each simulation tick
def update(i):
  # Simulate the movement of the rigid body for one tick
  position, orientation = simulate_rigidbody_movement(rigidbody, position, orientation)

  # Update the scatter plot with the new position of the rigid body
  ax.scatter(x, y, z, c='r')

# Create the FuncAnimation object to update the plot at each tick
animation = FuncAnimation(fig, update, frames=np.arange(0, 10), interval=100)
plt.show()

# # Set the simulation tick speed
# SIM_TICK = 1

# # Loop over the simulation ticks
# for i in range(10):
#   # Simulate the movement of the rigidbody
#   position, rotation = simulate_rigidbody_movement(rigidbody, position, rotation)

#   # Update the positions of the voxels in the rigidbody
#   for coords, block in rigidbody.items():
#     # Calculate the updated position of the voxel using the position and rotation of the rigidbody
#     updated_pos = rotate_vector(coords, rotation) + position

#     # Update the coordinates of the voxel in the rigidbody
#     rigidbody[coords] = updated_pos

#   # Get the updated coordinates of the voxels in the rigidbody
#   updated_voxel_coords = list(rigidbody.values())

#   # Update the scatter plot with the new positions of the voxels
#   ax.scatter3D(*zip(*updated_voxel_coords))

#   # Update the plot to show the changes
#   plt.draw()
#   plt.pause(0.001)