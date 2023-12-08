# Run174

## Theme of Animation

‘Run174’ is a spin on the classic flash game series ‘Run’, which chronicles the fate of a running alien as they attempt to navigate through a hole-filled tunnel. Our project will attempt to recreate the behavior of the game, implementing the movement of the main player, taking user input to rotate the reference frame of the camera (as the original game does), and implementing collision detection to track when a player’s run finally comes to an end. In addition, we add more variation in the levels. As you progress through the game, not only will the speed at which you travel through the tunnel increase, but you may encounter new terrain. While easier levels may include polygons with larger number of sides providing more surface area to land on, the harder levels towards the end may consist of squares with one pane per side. Attached are images from the original flash game, meant to give a basis for our TinyGL recreation. 

## Topics Learnt in Course

The topics used in the course which will be most heavily referenced are the change of basis of the camera matrix, as the camera position changes relative to the worldspace. The camera, which stays behind the third-person player at all times, will rotate on its z-axis. As the camera rotates, the surrounding tunnel will rotate as well. This gives the player navigation ability through the tunnel, filled with traps and obstacles leading to an abyss. A multitude of matrix transformations will be implemented to simulate this shifting of perspective, as well as controlling the movement of the main player. Other topics in the course include collision detection and lighting placement.

## Interactivity

We will incorporate interactivity into our game by taking user input throughout the run. The character has the ability to jump, allowing it to overcome obstacles in its way, and this movement is triggered by the user pressing a certain keybinding that we will decide later. The game forces interactivity from the user, as otherwise, due to the randomness of the missing panels, you will soon fall off of the map. Another way we encourage interactivity with the game is by displaying the current level you are on. As you progress through the game, you will encounter new tunnels based on different polygons, and you will also be traveling at a faster rate. This adds not only a competitive aspect, but also makes the user pay closer attention in order to have more accurate keystrokes.

## Keybinds

There are 3 main keybinds in order to play the game. The “j” key allows you to strafe left, while the “l” key allows you to strafe right. You may notice in the images that you can encounter barriers on either side. We implement collision detection where, if the player collides with a pane on a given side, we will rotate the tunnel such that the pane you collide with is now beneath the player. Lastly, the “k” key allows you to jump over missing panes in the tunnel.

## Advanced Features

There will be 2 advanced features manifested in our game: collision detection and physics simulations. For collision detection, the game must recognize when the main player is on top of a “hole” in the surrounding tunnel. At this point, the run of the player is deemed to be over. This will require collision detection algorithms between each of the floor pieces, being represented as a 2D-pane, and the main player, which will be seen as a simple ball figure. Another implementation of collision detection is our “falling” panes: once the player rolls over a falling pane, all falling panes that are four-directionally-connected to it will slowly fall out of the map, revealing more holes that the player must navigate through.
The second advanced feature is the implementation of a classical physics principle: projectile motion. Our game aims to implement the jumping motion of the main character as seen in the original flash game. This will require calculating the initial velocity of the player, which will increase as time in the run increases, and the end position of the player’s jump on the tunnel. The particular challenge with this feature lies in the graphical motion of the object, which must appear smooth and accurate. 

## Authors

Bach Ngo, Pranav Puranam, Jeff Cheng, Anish Pal