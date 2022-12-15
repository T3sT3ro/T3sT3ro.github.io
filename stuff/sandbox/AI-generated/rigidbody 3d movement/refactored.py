import numpy as np



class Block:
  def __init__(self, thrustDir: tuple[int, int, int], thrustForce: int, density: int, airResistance: int) -> None:
    self.thrustDir = thrustDir
    self.thrustForce = thrustForce
    self.density = density
    self.airResistance = airResistance






def magnitude(q: tuple[int, int, int, int]) -> float:
  # Convert the quaternion to a numpy array
  q = np.array(q)

  # Calculate the magnitude of the quaternion using the numpy norm function
  mag = np.linalg.norm(q)

  return mag

def quaternion_conjugate(q: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
  # Convert the quaternion to a numpy array
  q = np.array(q)

  # Calculate the conjugate of the quaternion using the numpy negative function
  conj = -q

  return tuple(conj)

def quaternion_multiply(q1: tuple[int, int, int, int], q2: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
  # Convert the quaternions to numpy arrays
  q1 = np.array(q1)
  q2 = np.array(q2)

  # Calculate the product of the quaternions using the numpy cross and dot functions
  prod = np.cross(q1, q2) + q1[0] * q2 + q2[0] * q1

  return tuple(prod)







def simulate_rigidbody_movement(rigidbody: dict[tuple[int, int, int], Block], position: tuple[int, int, int], rotation: tuple[int, int, int, int]) -> tuple[tuple[int, int, int], tuple[int, int, int, int]]:
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

  # Convert the orientation quaternion to a numpy array
  rot = np.array(rotation)

  # Calculate the angular velocity of the rigid body in quaternion form
  ang_vel = 0.5 * quaternion_multiply(rot, (0, ang_accel[0], ang_accel[1], ang_accel[2]))

  # Calculate the new orientation of the rigid body by integrating the angular velocity over the simulation tick time
  rot += ang_vel * SIM_TICK

  # Normalize the orientation quaternion to ensure it remains a valid quaternion
  rot /= magnitude(rot)

  # Convert the orientation quaternion back to a tuple
  rotation = tuple(rot)

  return position, rotation







# INITIALIZATION

# Define the length of the rigid body in each direction
length_x = 7
length_y = 1
length_z = 1

# Define the initial position of the rigid body
position = (0, 0, 0)

# Define the thrust force applied to one end of the rigid body
thrust_force = 10

# Create a dictionary to store the voxels of the rigid body
rigidbody = {}

# Loop over the x, y, and z coordinates of the voxels in the rigid body
for x in range(-length_x // 2, length_x // 2 + 1):
  for y in range(-length_y // 2, length_y // 2 + 1):
    for z in range(-length_z // 2, length_z // 2 + 1):
      # Set the thrust direction to be perpendicular to the x-axis
      thrust_dir = (0, 1, 0)

      # Set the density and air resistance of the voxel
      density = 1
      air_resistance = 0

      # Add the voxel to the dictionary of voxels in the rigid body
      rigidbody[(x, y, z)] = Block(thrust_dir, thrust_force, density, air_resistance)

      # If the voxel is at one end of the rigid body, apply the thrust force in the opposite direction
      if x == -length_x // 2:
        rigidbody[(x, y, z)].thrust_dir = (-1, 0, 0)






# Define the simulation tick time
SIM_TICK = 0.1

# Define the initial position and orientation of the rigid body
position = (0, 0, 0)
rotation = (1, 0, 0, 0)

# Define the voxels in the rigid body
rigidbody = {
  (0, 0, 0): Block((1, 0, 0), 1, 1, 0),
  (1, 0, 0): Block((1, 0, 0), 1, 1, 0),
  (2, 0, 0): Block((1, 0, 0), 1, 1, 0),
  (3, 0, 0): Block((1, 0, 0), 1, 1, 0),
  (4, 0, 0): Block((1, 0, 0), 1, 1, 0),
}

# Simulate the movement of the rigid body for 10 ticks
for i in range(10):
  position, rotation = simulate_rigidbody_movement(rigidbody, position, rotation)
  print(f'Tick {i}: position = {position}, rotation = {rotation}')