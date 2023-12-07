import { defs, tiny } from "./examples/common.js";

import { GameManager, stringToMatrix, Level } from "./gameManager.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
} = tiny;

class Cube extends Shape {
  constructor() {
    super("position", "normal");
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    this.arrays.position = Vector3.cast(
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, -1],
      [-1, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, -1],
      [-1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1]
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.indices.push(
      0,
      1,
      2,
      1,
      3,
      2,
      4,
      5,
      6,
      5,
      7,
      6,
      8,
      9,
      10,
      9,
      11,
      10,
      12,
      13,
      14,
      13,
      15,
      14,
      16,
      17,
      18,
      17,
      19,
      18,
      20,
      21,
      22,
      21,
      23,
      22
    );
  }
}

class Cube_Outline extends Shape {
  constructor() {
    super("position", "color");
    //  TODO (Requirement 5).
    // When a set of lines is used in graphics, you should think of the list entries as
    // broken down into pairs; each pair of vertices will be drawn as a line segment.
    // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
  }
}

class Cube_Single_Strip extends Shape {
  constructor() {
    super("position", "normal");
    // TODO (Requirement 6)
  }
}

class Pane extends Shape {
  // **Square** demonstrates two triangles that share vertices.  On any planar surface, the
  // interior edges don't make any important seams.  In these cases there's no reason not
  // to re-use data of the common vertices between triangles.  This makes all the vertex
  // arrays (position, normals, etc) smaller and more cache friendly.
  constructor() {
    super("position", "normal", "texture_coord");
    // Specify the 4 square corner locations, and match those up with normal vectors:
    this.arrays.position = Vector3.cast(
      [-1, -1, 0],
      [1, -1, 0],
      [-1, 1, 0],
      [1, 1, 0]
    );
    this.arrays.normal = Vector3.cast(
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.arrays.texture_coord = Vector.cast([0, 0], [1, 0], [0, 1], [1, 1]);
    // Use two triangles this time, indexing into four distinct vertices:
    this.indices.push(0, 1, 2, 1, 3, 2);
  }
}

class Base_Scene extends Scene {
  /**
   *  **Base_scene** is a Scene that can be added to any display canvas.
   *  Setup the shapes, materials, camera, and lighting here.
   */
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();
    this.hover = this.swarm = false;
    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      cube: new Cube(),
      outline: new Cube_Outline(),
      pane: new Pane(),
      // sphere: new defs.Axis_Arrows(),
      sphere: new defs.Subdivision_Sphere(4),
      star: new defs.Subdivision_Sphere(1),
    };

    // *** Materials
    this.materials = {
      plastic: new Material(new defs.Textured_Phong(), {
        ambient: 0.2,
        diffusivity: 0.7,
        specularity: 0,
        color: hex_color("#ffffff"),
        texture: new Texture("assets/grid.png", "LINEAR_MIPMAP_LINEAR"),
      }),
    };
    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());

    // this.levels = [];
    // for (let i = 0; i < 20; i++) {
    //   let temp = [];
    //   for (let j = 0; j < 13; j++) {
    //     temp.push(Math.floor(Math.random() * 2));
    //   }
    //   this.levels.push(temp);
    // }

    //STARS
    this.stars_deque = [];
    for (let i = 0; i < 150; i++) {
      let star_trans = [
        (Math.random() * 20 + 5) * (Math.random() >= 0.5 ? 1 : -1),
        (Math.random() * 30 - 15) * (Math.random() >= 0.5 ? 1 : 1),
        -5 * (i % 10),
      ];
      star_trans.push(Math.random() * 0.1);
      this.stars_deque.push(star_trans);
    }
    for (let i = 0; i < 150; i++) {
      let star_trans = [
        Math.random() * 10 - 5,
        (Math.random() * 5 + 6) * (Math.random() >= 0.5 ? 1 : -1),
        -5 * (i % 10),
      ];
      star_trans.push(Math.random() * 0.1);
      this.stars_deque.push(star_trans);
    }

    this.panel_colors = [
      color(240 / 255, 77 / 255, 77 / 255, 0.8),
      color(250 / 255, 146 / 255, 42 / 255, 0.8),
      color(243 / 255, 255 / 255, 79 / 255, 0.8),
      color(0.1, 0.7, 0.5, 1),
      color(79 / 255, 176 / 255, 255 / 255, 0.8),
      color(153 / 255, 94 / 255, 247 / 255, 0.8),
      color(244 / 255, 94 / 255, 247 / 255, 0.8),
    ];

    this.reset_game({});
  }

  reset_game(program_state) {
    // const PANE_DEPTH = 3; // z-direction
    // const PANE_WIDTH = 1; // x-direction
    // const PANES_PER_SIDE = 3;
    // const NUM_SIDES = 6;
    // const ROTATION_ANGLE = (2 * Math.PI) / NUM_SIDES;
    // const TUNNEL_HEIGHT =
    //   (PANES_PER_SIDE * PANE_WIDTH) / Math.tan(Math.PI / NUM_SIDES);

    // this.PANE_DEPTH = PANE_DEPTH;
    // this.PANE_WIDTH = PANE_WIDTH;
    // this.PANES_PER_SIDE = PANES_PER_SIDE;
    // this.NUM_SIDES = NUM_SIDES;
    // this.ROTATION_ANGLE = ROTATION_ANGLE;

    // this.TUNNEL_HEIGHT = TUNNEL_HEIGHT;
    // this.SIDE_WIDTH = PANE_WIDTH * PANES_PER_SIDE;
    // this.BOTTOM_SIDE_Y = -TUNNEL_HEIGHT / 2;

    // this.PANE_START_X = -this.PANE_WIDTH * ((this.PANES_PER_SIDE - 1) / 2);
    // this.PANE_START_Y = -this.TUNNEL_HEIGHT / 2;

    this.SPHERE_RADIUS = 0.2;

    this.MAX_GAME_SPEED = 60;

    this.TEST_COLLISION_BASIS = false;

    this.EPSILON = 0.05; // min distance for contact

    this.intersecting = true;

    //Need globally stored program time for smooth ball transitions
    this.mili_t = 0;
    this.mark_begin = 0;
    this.mark_end = 0;

    this.key_shift = 10.0; // How much distance the ball should move on each keypress
    this.gradient_x = 50; //How fast the ball should move in its change of direction. Higher number is slower.
    this.delta_x = this.key_shift / this.gradient_x;
    this.rel_x = 0;

    this.left_pressed = false;
    this.right_pressed = false;

    this.bounds = 0; //Simple range from -13 to 13 for ball movement. Note: needs to be set by inspection.

    this.pane_below = true;

    //JUMP MOTION
    this.is_jumping = false;
    // this.jump_begin = 0;
    this.jump_end = 0;
    this.y_velocity = 0;
    this.y_acceleration = 0;
    this.gravity_acceleration = -28;
    this.jump_height = 3.0;
    this.jump_velocity = 18;

    this.gravity = 7000;

    this.jump_origin = Mat4.identity();

    //ROTATION
    this.side = 5;
    this.rotation_side = 0;
    this.next_rotation = 0;

    this.prev_pressed = -1;

    program_state.animation_time = 0;

    const levels = [];
    const configs = [];

    const starting_configs = [
      new Level(2, 6, this.panel_colors[0], 7, 1, 6, 0, 0.5),
      new Level(3, 5, this.panel_colors[1], 8, 1, 6, 1, 0.8),
    ];

    for (let i = 0; i < 2; i++) {
      let level = [];
      let config = starting_configs[i];
      for (let k = 0; k < 25; k++) {
        let row = [];
        for (let j = 0; j < config.NUM_SIDES * config.PANES_PER_SIDE; j++) {
          let r = Math.random();
          if (k < 6) row.push(1);
          else if (r < 0.5) row.push(1);
          else if (r < 0.7) row.push(3);
          else row.push(0);
        }
        level.push(row);
      }
      levels.push(level);
      configs.push(config);
    }
    this.current_config = configs[0];
    const game = new GameManager(levels, configs);
    game.update_row_size(
      this.current_config.PANES_PER_SIDE * this.current_config.NUM_SIDES
    );
    this.sphere_transform = Mat4.identity()
      .times(
        Mat4.translation(
          0,
          -this.current_config.TUNNEL_HEIGHT / 2 + this.SPHERE_RADIUS,
          2
        )
      )
      .times(
        Mat4.scale(this.SPHERE_RADIUS, this.SPHERE_RADIUS, this.SPHERE_RADIUS)
      );
    this.camera_location = this.rotation(this.rotation_side);
    this.manager = game;
    this.prev_t = -1;
  }

  reset_level(program_state) {
    this.SPHERE_RADIUS = 0.2;

    this.MAX_GAME_SPEED = 60;

    this.TEST_COLLISION_BASIS = false;

    this.EPSILON = 0.05; // min distance for contact

    this.intersecting = true;

    //Need globally stored program time for smooth ball transitions
    this.mili_t = 0;
    this.mark_begin = 0;
    this.mark_end = 0;

    this.key_shift = 10.0; // How much distance the ball should move on each keypress
    this.gradient_x = 50; //How fast the ball should move in its change of direction. Higher number is slower.
    this.delta_x = this.key_shift / this.gradient_x;
    this.rel_x = 0;

    this.left_pressed = false;
    this.right_pressed = false;

    this.bounds = 0; //Simple range from -13 to 13 for ball movement. Note: needs to be set by inspection.

    this.pane_below = true;

    //JUMP MOTION
    this.is_jumping = false;
    // this.jump_begin = 0;
    this.jump_end = 0;
    this.y_velocity = 0;
    this.y_acceleration = 0;
    this.gravity_acceleration = -22;
    this.jump_height = 3.0;
    this.jump_velocity = 18;

    this.gravity = 7000;

    this.jump_origin = Mat4.identity();

    //ROTATION
    this.side = 5;
    this.rotation_side = 0;
    this.next_rotation = 0;

    this.prev_pressed = -1;

    this.manager.reset_to_level(this.current_config.id);
    this.camera_location = this.rotation(this.rotation_side);
    this.prev_t = -1;
    this.sphere_transform = Mat4.identity()
      .times(
        Mat4.translation(
          0,
          -this.current_config.TUNNEL_HEIGHT / 2 + this.SPHERE_RADIUS,
          2
        )
      )
      .times(
        Mat4.scale(this.SPHERE_RADIUS, this.SPHERE_RADIUS, this.SPHERE_RADIUS)
      );
    program_state.animation_time = 0;
  }

  display(context, program_state) {
    // display():  Called once per frame of animation. Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      // this.camera_location = this.rotation(this.side)
      this.camera_location = Mat4.translation(
        0,
        this.current_config.TUNNEL_HEIGHT / 4,
        0
      );
      this.camera_origin = this.camera_location;
      // program_state.set_camera(this.camera_location);
      program_state.camera_inverse = this.camera_location.map((x, i) =>
        Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)
      );
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    // *** Lights: *** Values of vector or point lights.
    this.light_position = vec4(0, 0, 0.5, -0.15);
    // this.light_position = vec4(-0.1, -0.4, 1.2, Math.sin(program_state.animation_time/1000));
    // console.log(Math.sin(program_state.animation_time / 1000))
    program_state.lights = [
      new Light(this.light_position, color(1, 1, 1, 1), 9999),
      // new Light(Mat4.translation(0,0,-5).times(this.light_position), color(1, 0.2, 1, 1), 0.2),
    ];
  }

  arb_rotation(side, NUM_SIDES) {
    if (!this.rot_cache) {
      this.rot_cache = {};
    }
    if (!(NUM_SIDES in this.rot_cache)) this.rot_cache[NUM_SIDES] = {};
    if (side in this.rot_cache[NUM_SIDES])
      return this.rot_cache[NUM_SIDES][side];
    const rotated = Mat4.rotation((side * 2 * Math.PI) / NUM_SIDES, 0, 0, 1);
    return (this.rot_cache[NUM_SIDES][side] = rotated);
  }

  rotation(side) {
    // const center_translation = Mat4.translation(0, 0, 0);
    if (!this.rot_cache) {
      this.rot_cache = {};
    }
    if (!(this.current_config.NUM_SIDES in this.rot_cache))
      this.rot_cache[this.current_config.NUM_SIDES] = {};
    if (side in this.rot_cache[this.current_config.NUM_SIDES])
      return this.rot_cache[this.current_config.NUM_SIDES][side];
    const rotated = Mat4.rotation(
      side * this.current_config.ROTATION_ANGLE,
      0,
      0,
      1
    );
    // const camera_location = Mat4.translation(-1, -1.5, 0);
    // const sphere_ct = Mat4.translation(0.5, 0.2, -6, 0)
    // this.sphere_transform = this.sphere_transform.times(sphere_ct.times(Mat4.inverse(rotated)).times(Mat4.inverse(sphere_ct)))
    // console.log(this.sphere_transform)
    // console.log(Mat4.inverse(rotated))
    // this.sphere_transform = this.sphere_transform.times(Mat4.rotation(-side * (Math.PI / 3), 0, 0, 1))
    // console.log(this.sphere_transform)

    return (this.rot_cache[this.current_config.NUM_SIDES][side] = rotated);
  }
}

export class Assignment2 extends Base_Scene {
  /**
   * This Scene object can be added to any display canvas.
   * We isolate that code so it can be experimented with on its own.
   * This gives you a very small code sandbox for editing a simple scene, and for
   * experimenting with matrix transformations.
   */

  set_colors() {
    // TODO:  Create a class member variable to store your cube's colors.
    // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
    // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
  }

  make_control_panel() {
    this.key_triggered_button("Jump", ["k"], () => {
      if (this.is_jumping || !this.intersecting) {
        return;
      } else {
        this.jump_begin = this.mili_t;
        this.jump_end = this.jump_begin + this.gravity;
        this.is_jumping = true;
        this.jump_origin = this.sphere_transform;
        this.camera_origin = this.camera_location;
        this.y_velocity = this.jump_velocity;
        this.y_acceleration = this.gravity_acceleration;
        this.intersecting = 0;
      }
    });

    this.key_triggered_button(
      "Move Left",
      ["j"],
      () => {
        this.left_pressed = true;
        this.prev_pressed = 0;
        // console.log(this.sphere_transform);
      },
      undefined,
      () => (this.left_pressed = false)
    );

    this.key_triggered_button(
      "Move Right",
      ["l"],
      () => {
        this.right_pressed = true;
        this.prev_pressed = 1;
      },
      undefined,
      () => (this.right_pressed = false)
    );
  }

  // panel_perspective_switch(method, jumping, ball_vcs, boundary) {
  //   if (method == "left") {
  //     if (ball_vcs[1] <= boundary) {
  //       this.is_jumping = false;
  //       this.rotation_side = this.rotation_side + 1;
  //       if (this.rotation_side > 5) {
  //         this.rotation_side = 0;
  //       }
  //       this.camera_location = this.rotation(this.rotation_side);
  //       console.log("left panel");
  //     }
  //   } else if (method == "right") {
  //     if (ball_vcs[1] <= boundary) {
  //       this.is_jumping = false;
  //       this.rotation_side = this.rotation_side - 1;
  //       if (this.rotation_side < 0) {
  //         this.rotation_side = 5;
  //       }
  //       this.camera_location = this.rotation(this.rotation_side);
  //       console.log("right panel");
  //     }
  //   }
  // }

  draw_ball(context, program_state, test_side = 0) {
    if (!this.intersecting || this.is_jumping)
      this.y_acceleration = this.TEST_COLLISION_BASIS
        ? 0
        : this.gravity_acceleration;
    else {
      if (this.intersecting == 2 && !this.is_falling)
        this.y_velocity =
          -this.current_config.FALLING_TILE_VELOCITY / this.SPHERE_RADIUS;
      else this.y_velocity = 0;
      this.y_acceleration = 0;
    }
    if (this.prev_t == -1) this.prev_t = 0;
    let dt = program_state.animation_time - this.prev_t * 1000;
    this.y_velocity += (this.y_acceleration * dt) / 1000;
    // console.log((this.y_velocity * dt) / 1000);

    let dy = (this.y_velocity * dt) / 1000;
    if (this.is_jumping) dy = Math.max(dy, 10 * this.EPSILON);
    this.is_falling = false;
    // if (
    //   this.sphere_transform.times(vec4(0, 0, 0, 1))[1] -
    //     this.SPHERE_RADIUS -
    //     this.EPSILON >
    //   this.BOTTOM_SIDE_Y
    // )
    this.is_jumping = false;

    // const rotated_spere = this.rotated_space(this.sphere_transform);

    // if (
    //   this.sphere_transform.times(vec4(0, 0, 0, 1))[1] +
    //     dy <= 0.2
    // ) {
    // if (
    //   this.pane_below &&
    //   this.sphere_transform.times(vec4(0, 0, 0, 1))[1] +
    //     dy -
    //     this.SPHERE_RADIUS -
    //     this.EPSILON <=
    //     this.BOTTOM_SIDE_Y
    // ) {
    //   this.y_velocity = 0;
    //   this.y_acceleration = 0;
    //   dy = -(
    //     this.sphere_transform.times(vec4(0, 0, 0, 1))[1] -
    //     this.SPHERE_RADIUS -
    //     this.BOTTOM_SIDE_Y
    //   );
    //   this.is_jumping = false;
    // }
    // }

    let grav_vector = this.rotation(this.rotation_side).times(vec4(0, 1, 0, 1));
    let left_vector = this.rotation(this.rotation_side).times(
      vec4(-1, 0, 0, 1)
    );
    let right_vector = this.rotation(this.rotation_side).times(
      vec4(1, 0, 0, 1)
    );

    this.sphere_transform = this.sphere_transform.times(
      Mat4.translation(grav_vector[0] * dy, grav_vector[1] * dy, 0)
    );
    // console.log(this.sphere_transform.times(vec4(0,0,0,1)))
    // if (this.is_jumping) {
    //   if (this.mili_t < this.jump_end) {
    //     // let vertex = this.gravity / 2;
    //     // let projectile_time = this.mili_t - this.jump_begin;
    //     // let a = (-1 * this.jump_height) / vertex ** 2;
    //     // let y = a * (projectile_time - vertex) ** 2 + this.jump_height;
    //     // console.log(y);

    //     // this.camera_location = this.camera_origin.times(Mat4.inverse(Mat4.translation(0, y*0.2, 0)));
    //     let pos_sphere = this.sphere_transform.times(vec4(0, 0, 0, 1));
    //     let eye_ball_coords = this.camera_location.times(pos_sphere);
    //     let hex_x_const_right = (eye_ball_coords[0] - 1.3) * Math.sqrt(3) - 1.3;
    //     let hex_x_const_left = (-1.3 - eye_ball_coords[0]) * Math.sqrt(3) - 1.3;

    //     if (eye_ball_coords[1] <= hex_x_const_right) {
    //       this.is_jumping = false;
    //       this.rotation_side = this.rotation_side - 1;
    //       if (this.rotation_side < 0) {
    //         this.rotation_side = 5;
    //       }
    //       this.camera_location = this.rotation(this.rotation_side);
    //       this.sphere_transform = this.sphere_transform.times(
    //         Mat4.rotation(Math.PI / 3, 0, 0, 1)
    //       );
    //       console.log("right panel");
    //     } else if (eye_ball_coords[1] <= hex_x_const_left) {
    //       this.is_jumping = false;
    //       this.rotation_side = this.rotation_side + 1;
    //       if (this.rotation_side > 5) {
    //         this.rotation_side = 0;
    //       }
    //       this.camera_location = this.rotation(this.rotation_side);
    //       this.sphere_transform = this.sphere_transform.times(
    //         Mat4.rotation(-(Math.PI / 3), 0, 0, 1)
    //       );

    //       console.log("left panel");
    //     }
    //     // this.panel_perspective_switch("left", eye_ball_coords, hex_x_const_left)
    //     // this.panel_perspective_switch("right", eye_ball_coords, hex_x_const_right)
    //   } else {
    //     console.log("Jump ended");
    //     // this.jump_origin = Mat4.identity();
    //     // this.is_jumping = false;
    //     // this.y_velocity = 0;
    //     // this.y_acceleration = 0;
    //     // this.camera_location = this.camera_origin
    //   }
    // }

    let pos_sphere = this.sphere_transform.times(vec4(0, 0, 0, 1));
    if (pos_sphere[0] * grav_vector[0] + pos_sphere[1] * grav_vector[1] < -5) {
      this.reset_level(program_state);
      return;
    }
    // console.log(pos_sphere[0], pos_sphere[1], pos_sphere[2])
    // let cam_inv = Mat4.inverse(this.camera_location);
    // let eye_ball_coords = this.camera_location.times(pos_sphere);
    // let hex_y_const = (eye_ball_coords[1] + 1.3) / Math.sqrt(3);
    // let hex_x_const_right = (eye_ball_coords[0] - 1.3) * Math.sqrt(3) - 1.2;
    // let hex_x_const_left = (-1.3 - eye_ball_coords[0]) * Math.sqrt(3) - 1.2;
    // console.log(pos_sphere)
    // console.log(this.sphere_transform)
    // console.log(this.camera_location.times(vec4(0,0,0,1)))
    // console.log(this.camera_origin.times(vec4(0,0,0,1)))
    // console.log(pos_sphere[1])

    if (this.left_pressed) {
      // if (eye_ball_coords[1] <= hex_x_const_left && !this.is_jumping) {
      //   this.rotation_side = this.rotation_side + 1;
      //   if (this.rotation_side > 5) {
      //     this.rotation_side = 0;
      //   }
      //   this.camera_location = this.rotation(this.rotation_side);
      //   this.sphere_transform = this.sphere_transform.times(
      //     Mat4.rotation(-(Math.PI / 3), 0, 0, 1)
      //   );
      //   console.log("left panel");
      // }
      this.sphere_transform = this.sphere_transform.times(
        Mat4.translation(
          this.delta_x * left_vector[0],
          this.delta_x * left_vector[1],
          0
        )
      );
      this.jump_origin = this.jump_origin.times(
        Mat4.translation(
          this.delta_x * left_vector[0],
          this.delta_x * left_vector[1],
          0
        )
      );
    }
    if (this.right_pressed) {
      // if (eye_ball_coords[1] <= hex_x_const_right && !this.is_jumping) {
      //   this.rotation_side = this.rotation_side - 1;
      //   if (this.rotation_side < 0) {
      //     this.rotation_side = 5;
      //   }
      //   this.camera_location = this.rotation(this.rotation_side);
      //   this.sphere_transform = this.sphere_transform.times(
      //     Mat4.rotation(Math.PI / 3, 0, 0, 1)
      //   );
      //   console.log("right panel");
      // }
      this.sphere_transform = this.sphere_transform.times(
        Mat4.translation(
          this.delta_x * right_vector[0],
          this.delta_x * right_vector[1],
          0
        )
      );
      this.jump_origin = this.jump_origin.times(
        Mat4.translation(
          this.delta_x * right_vector[0],
          this.delta_x * right_vector[1],
          0
        )
      );
    }
    let new_pos = this.sphere_transform.times(vec4(0, 0, 0, 1));
    let i = test_side;
    let j = 0;
    left_vector = this.rotation(i).times(vec4(-1, 0, 0, 1));

    let rotating_sphere = !this.TEST_COLLISION_BASIS
      ? this.sphere_transform.times(
          Mat4.rotation(
            -program_state.animation_time / 120,
            right_vector[0],
            right_vector[1],
            0
          )
        )
      : this.sphere_transform
          .times(
            Mat4.scale(
              1 / this.SPHERE_RADIUS,
              1 / this.SPHERE_RADIUS,
              1 / this.SPHERE_RADIUS
            )
          )
          .times(
            Mat4.inverse(
              Mat4.identity()

                .times(Mat4.translation(-new_pos[0], -new_pos[1], -new_pos[2]))
                .times(
                  this.rotation(i).times(
                    Mat4.translation(new_pos[0], new_pos[1], new_pos[2])
                  )
                )
                .times(
                  Mat4.translation(
                    j * this.current_config.PANE_WIDTH,
                    0, //  -j * this.PANE_WIDTH,
                    0
                  )
                )
            ).times(
              Mat4.scale(
                this.SPHERE_RADIUS,
                this.SPHERE_RADIUS,
                this.SPHERE_RADIUS
              )
            ) //.times(
            //   //  Mat4.rotation(-program_state.animation_time / 120, 1, 0, 0)
          );

    this.shapes.sphere.draw(
      context,
      program_state,
      rotating_sphere,
      this.materials.plastic.override({
        color: color(1, 1, 1, 1),
        ambient: 0.2,
      })
    );
  }

  do_rotation(side) {
    console.log("Rotating", side);
    this.rotation_side = side;
  }

  drawStars(context, program_state) {
    let sphere_pos = this.sphere_transform.times(vec4(0, 0, 0, 1));
    for (let i = 0; i < this.stars_deque.length; i++) {
      this.shapes.star.draw(
        context,
        program_state,
        Mat4.identity()
          .times(
            Mat4.translation(
              this.stars_deque[i][0],
              this.stars_deque[i][1],
              this.stars_deque[i][2]
            )
          )
          .times(
            Mat4.scale(
              this.stars_deque[i][3],
              this.stars_deque[i][3],
              this.stars_deque[i][3]
            )
          ),
        this.materials.plastic.override({
          color: color(1, 1, 1, 1),
          ambient: 1,
        })
      );
    }
  }

  // ball_is_above_pane(pane_transform) {
  //   let sphere_coords = this.camera_location
  //     .times(this.sphere_transform)
  //     .times(vec4(0, 0, 0, 1)); // center
  //   let pane_coords = this.camera_location
  //     .times(pane_transform)
  //     .times(vec4(0, 0, 0, 1)); // center
  //   const PANE_SIZE = 1;
  //   let p_xmin = pane_coords[0] - PANE_SIZE / 2;
  //   let p_xmax = p_xmin + PANE_SIZE;
  //   let p_zmin = pane_coords[2] - 5 / 2;
  //   let p_zmax = p_zmin + 5;

  //   let x_in_bound = p_xmin <= sphere_coords[0] && sphere_coords[0] <= p_xmax;
  //   let z_in_bound = p_zmin <= sphere_coords[2] && sphere_coords[2] <= p_zmax;
  //   let y_in_bound = sphere_coords[1] - 0.2 >= pane_coords[1];

  //   return x_in_bound && y_in_bound && z_in_bound;
  // }

  is_colliding(
    model_transform,
    pane_transform,
    config,
    fall_mat,
    i,
    j,
    print = false
  ) {
    let z = model_transform
      .times(Mat4.scale(config.PANE_WIDTH / 2, 1, config.PANE_DEPTH / 2))
      .times(vec4(0, 0, 0, 1))[2];
    const paneCoords = vec4(config.PANE_START_X, config.PANE_START_Y, z, 1);
    const angle = i * config.ROTATION_ANGLE;
    const new_pos = this.sphere_transform
      // .times(
      //   Mat4.scale(
      //     1 / this.SPHERE_RADIUS,
      //     1 / this.SPHERE_RADIUS,
      //     1 / this.SPHERE_RADIUS
      //   )
      // )
      .times(vec4(0, 0, 0, 1));

    let basis = Mat4.identity()
      .times(fall_mat)
      .times(Mat4.translation(-new_pos[0], -new_pos[1], 0))
      .times(
        this.arb_rotation(i, config.NUM_SIDES).times(
          Mat4.translation(new_pos[0], new_pos[1], 0)
        )
      )
      .times(Mat4.translation(j * config.PANE_WIDTH, 0, 0));

    // console.log(left_vector)
    const sphereCoords = this.sphere_transform
      .times(
        Mat4.scale(
          1 / this.SPHERE_RADIUS,
          1 / this.SPHERE_RADIUS,
          1 / this.SPHERE_RADIUS
        )
      )
      // .times(Mat4.scale(config.PANE_WIDTH, 1, config.PANE_DEPTH))

      .times(Mat4.inverse(basis))
      .times(
        Mat4.scale(this.SPHERE_RADIUS, this.SPHERE_RADIUS, this.SPHERE_RADIUS)
      )

      // .times(
      //   Mat4.translation(
      //     (-1 / this.SPHERE_RADIUS) * new_pos[0],
      //     (-1 / this.SPHERE_RADIUS) * new_pos[1],
      //     0
      //   )
      // )
      // .times(this.rotation((this.NUM_SIDES - i) % this.NUM_SIDES))
      // .times(
      //   Mat4.translation(
      //     (1 / this.SPHERE_RADIUS) * new_pos[0],
      //     (1 / this.SPHERE_RADIUS) * new_pos[1],
      //     0
      //   )
      // )
      // // .times(Mat4.translation(-this.PANE_START_X, -this.PANE_START_Y, 0))
      // .times(
      //   Mat4.translation((-1 / this.SPHERE_RADIUS) * j * this.PANE_WIDTH, 0, 0)
      // )
      .times(vec4(0, 0, 0, 1));
    const xmin = paneCoords[0] - config.PANE_WIDTH / 2;
    const xmax = xmin + config.PANE_WIDTH;
    const zmin = paneCoords[2] - config.PANE_DEPTH / 2;
    const zmax = zmin + config.PANE_DEPTH;
    const dist = sphereCoords[1] - this.SPHERE_RADIUS - paneCoords[1];
    let intersect =
      xmin <= sphereCoords[0] &&
      sphereCoords[0] <= xmax &&
      zmin <= sphereCoords[2] &&
      sphereCoords[2] <= zmax &&
      Math.abs(dist) <= this.EPSILON;
    return intersect;
  }

  generateFaces(
    num_sides,
    panes_per_side,
    config,
    context,
    program_state,
    model_transform,
    ring_color,
    row,
    row_i
  ) {
    const blue = color(
      255 * Math.random(),
      255 * Math.random(),
      255 * Math.random(),
      1
    );
    let curr_transform = Mat4.identity();
    for (let i = 0; i < num_sides; i++) {
      const grav_vector = this.arb_rotation(i, num_sides).times(
        vec4(0, 1, 0, 1)
      );
      for (let j = 0; j < panes_per_side; j++) {
        // if (i == 1 && j == 0 && this.prev_t == 0) {
        //   this.is_colliding(model_transform, curr_transform);
        // }
        let off_t = row[i * panes_per_side + j] - 3;

        let offset =
          off_t <= 0 || program_state.animation_time / 1000 - off_t <= 0
            ? 0
            : -config.FALLING_TILE_VELOCITY *
              (program_state.animation_time / 1000 - off_t);

        // if (row[i * panes_per_side + j] > 3) console.log(off_t);

        const fall_mat = Mat4.translation(
          offset * grav_vector[0],
          offset * grav_vector[1],
          0
        );

        if (row[i * panes_per_side + j]) {
          this.shapes.pane.draw(
            context,
            program_state,
            model_transform
              .times(fall_mat)
              .times(curr_transform)
              .times(
                Mat4.scale(config.PANE_WIDTH / 2, 1, config.PANE_DEPTH / 2)
              )
              .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)),

            // this.materials.plastic.override({ color: color(0.1*(i+1),0.1*(i+1),0.1*(i+1),1) })
            this.materials.plastic.override({
              color:
                row[i * panes_per_side + j] >= 3
                  ? this.panel_colors[1]
                  : ring_color,
            })
          );

          let intersecting_pane = this.is_colliding(
            model_transform,
            curr_transform,
            config,
            fall_mat,
            i,
            j,
            true
          );
          // if (row[i * panes_per_side + j] > 3)
          //   this.manager.trigger_falling_pane(
          //     row_i,
          //     i * panes_per_side + j,
          //     program_state.animation_time / 1000 - this.prev_t
          //   );
          if (intersecting_pane) {
            // console.log("intersect", i, j);
            if (row[i * panes_per_side + j] == 3) {
              this.manager.trigger_falling_pane(
                row_i,
                i * panes_per_side + j,
                program_state.animation_time / 1000
              );
              this.is_falling = true;
            }
            // else if (row[i * panes_per_side + j] > 3) {
            //   this.manager.fall_pane(i, j, program_state.animation_time / 1000 - this.prev_t);
            // }

            if (this.current_config.id != config.id) {
              this.next_rotation = i;
              this.next_config = config;
            } else {
              // check all right and left rotations
              if (!this.intersecting || this.prev_pressed == 1) {
                for (let k = 1; k < num_sides / 2; k++) {
                  if (i == (this.rotation_side + k) % num_sides)
                    this.next_rotation = i;
                }
              }
              if (!this.intersecting || this.prev_pressed == 0) {
                for (let k = 1; k < num_sides / 2; k++) {
                  if (i == (this.rotation_side - k + num_sides) % num_sides) {
                    this.next_rotation = i;
                  }
                }
              }
            }
            this.intersecting =
              this.intersecting == 1
                ? 1
                : row[i * panes_per_side + j] >= 3
                ? 2
                : 1;
            // if (i != this.rotation_side) {
            //   if (this.prev_pressed == 1 && i > this.rotation_side)
            //     this.next_rotation = i;
            //   else if (this.prev_pressed == 0 && i < this.rotation_side)
            //     this.next_rotation = i
            // }
          }
          // if (i == 0 && j == 1) {
          //   console.log();
          // }

          // let above_pane = this.ball_is_above_pane(
          //   model_transform
          //     .times(curr_transform)
          //     .times(
          //       Mat4.scale(
          //         this.PANE_WIDTH / 2,
          //         this.PANE_WIDTH / 2,
          //         this.PANE_DEPTH / 2
          //       )
          //     )
          //     .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
          // );
          // if (above_pane) {
          //   this.pane_below = true;
          // }
        }
        curr_transform = curr_transform.times(
          Mat4.translation(config.PANE_WIDTH, 0, 0)
        );
      }
      curr_transform = curr_transform
        .times(Mat4.translation(-config.PANE_WIDTH / 2, 0, 0))
        .times(this.arb_rotation(1, config.NUM_SIDES))
        .times(Mat4.translation(config.PANE_WIDTH / 2, 0, 0));

      // model_transform = model_transform.times(Mat4.translation(1, 0, 0));
    }
  }

  /*
  Make center of tunnel the origin (so rotations don't care about individual element's pos)
  - do math to determine location of first rendered panel
  Keep a rotation matrix that all objects are multiplied by
  When contacting a panel, rotate to that panel's side
  - Edge case: If contacting multiple, rotate to the one not on the current rotation, or the rightmost one if both at once
  If not contacting, fall (gravity is always down)
  Eye matrix is just fixed behind ball
  
  */

  display(context, program_state) {
    // console.log(this.pane_below);
    // if (this.is_jumping)
    //   console.log(this.sphere_transform.times(vec4(0, 0, 0, 1)));
    super.display(context, program_state);
    this.next_config = -1;
    // program_state.set_camera(this.camera_location);
    // if (this.prev_t < 5)

    this.mili_t = program_state.animation_time;
    let t = program_state.animation_time / 1000;
    // if (this.rotation_side != 1 && t >= 2) {
    //   this.do_rotation(1);
    //   console.log("rotate");
    // }

    if (this.prev_t == -1) {
      program_state.camera_inverse = Mat4.inverse(
        this.sphere_transform
          .times(this.rotation(this.rotation_side))
          .times(Mat4.scale(4, 4, 2))
          .times(Mat4.translation(0, this.current_config.TUNNEL_HEIGHT / 4, 6))
      );
    } else {
      program_state.camera_inverse = Mat4.inverse(
        this.sphere_transform
          .times(this.rotation(this.rotation_side))
          .times(Mat4.scale(4, 4, 4))
          .times(Mat4.translation(0, this.current_config.TUNNEL_HEIGHT / 4, 6))
      ).map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.2));
    }

    let model_transform = this.manager.get_initial_transform();
    let level = Math.floor(t / 20) + 1;
    let game_speed = this.current_config.LEVEL_SPEED;
    if (model_transform == -1) {
      model_transform = Mat4.identity().times(
        Mat4.translation(
          this.current_config.PANE_START_X,
          this.current_config.PANE_START_Y,
          t * game_speed
        )
      );
    } else {
      model_transform = model_transform.times(
        Mat4.translation(0, 0, (t - this.prev_t) * game_speed)
      );
    }

    // model_transform = model_transform.times(this.rotation(this.rotation_side));
    // console.log(game_speed);
    // model_transform = model_transform.times(this.sphere_transform)
    const rows = this.manager.get_rows_in_view();
    const configs = this.manager.get_levels();
    // console.log(rows);

    let rows_behind_camera = 0;
    let new_initial_transform = model_transform;
    let next_model_transform = -1;
    model_transform = model_transform;
    this.drawStars(context, program_state);
    this.pane_below = false;
    this.intersecting = false;
    let i = 0;
    let prev_config = configs[0];
    for (let row of rows) {
      this.generateFaces(
        configs[i].NUM_SIDES,
        configs[i].PANES_PER_SIDE,
        configs[i],
        context,
        program_state,
        model_transform,
        configs[i].LEVEL_COLOR,
        row,
        i
      );
      prev_config = configs[i];
      if (i < rows.length - 1) {
        if (configs[i + 1].id != prev_config.id) {
          model_transform = model_transform
            .times(
              Mat4.translation(
                -prev_config.PANE_START_X,
                -prev_config.PANE_START_Y,
                0
              )
            )
            .times(
              Mat4.translation(
                configs[i + 1].PANE_START_X,
                configs[i + 1].PANE_START_Y,
                0
              )
            );
        }
      }
      next_model_transform = model_transform.times(
        Mat4.translation(0, 0, -configs[i].PANE_DEPTH)
      );
      if (model_transform[2][3] >= 10) {
        // console.log(rows_behind_camera)
        rows_behind_camera++;
        new_initial_transform = next_model_transform;
      }
      model_transform = next_model_transform;
      i++;
    }
    for (let i = 0; i < rows_behind_camera; i++) {
      this.manager.update_row_window(new_initial_transform);
    }
    if (rows_behind_camera == 0)
      this.manager.update_initial_tranform(new_initial_transform);
    if (this.next_rotation != this.rotation_side) {
      this.do_rotation(this.next_rotation);
    }
    if (this.next_config != -1) {
      this.current_config = this.next_config;
      this.manager.update_level_window();
      // update level here
    }
    // console.log(this.intersecting);
    this.draw_ball(context, program_state, 0);
    if (this.TEST_COLLISION_BASIS) {
      this.draw_ball(context, program_state, 1);
      this.draw_ball(context, program_state, 2);
      this.draw_ball(context, program_state, 3);
      this.draw_ball(context, program_state, 4);
    }
    // this.draw_ball(context, program_state, 5);

    this.prev_t = t;
    // if (t > 3) this.side = 1
  }
}
