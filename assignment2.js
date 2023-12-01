import { defs, tiny } from "./examples/common.js";

import { GameManager, stringToMatrix } from "./gameManager.js";

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
  Texture
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
        texture: new Texture("assets/grid.png", "LINEAR_MIPMAP_LINEAR")
      }),
    };
    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());

    this.levels = [];
    for (let i = 0; i < 20; i++) {
      let temp = [];
      for (let j = 0; j < 13; j++) {
        temp.push(Math.floor(Math.random() * 2));
      }
      this.levels.push(temp);
    }
    this.sphere_transform = Mat4.identity().times(
      Mat4.translation(0.5, 0.2, -6).times(Mat4.scale(0.2, 0.2, 0.2))
    );

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

    //JUMP MOTION
    this.is_jumping = false;
    this.jump_begin = 0;
    this.jump_end = 0;

    this.jump_height = 4.0;
    this.gravity = 700;

    this.jump_origin = Mat4.identity();

    //ROTATION
    this.side = 5
    this.rotation_side = 0;

    //STARS
    this.stars_deque = [];
    for (let i = 0; i < 1000; i++) {
      let star_trans = [(Math.random() * 20 + 5) * (Math.random() >= 0.5 ? 1 : -1), (Math.random() * 30 - 15) * (Math.random() >= 0.5 ? 1 : 1), -5 * (i % 10)];
      star_trans.push(Math.random() * 0.1);
      this.stars_deque.push(star_trans);
    }
    for (let i = 0; i < 250; i++) {
      let star_trans = [Math.random() * 10 - 5, (Math.random() * 5 + 6) * (Math.random() >= 0.5 ? 1 : -1), -5 * ((i) % 10)];
      star_trans.push(Math.random() * 0.1);
      this.stars_deque.push(star_trans);
    }
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
      this.camera_location = this.rotation(this.rotation_side); 
      this.camera_origin = this.camera_location
      // program_state.set_camera(this.camera_location);
      program_state.camera_inverse = this.camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    // *** Lights: *** Values of vector or point lights.
    this.light_position = vec4(-0.1, -0.4, 1.2, -0.15);
    // this.light_position = vec4(-0.1, -0.4, 1.2, Math.sin(program_state.animation_time/1000));
    // console.log(Math.sin(program_state.animation_time / 1000))
    program_state.lights = [
      new Light(this.light_position, color(1, 1, 1, 1), 9999),
    ];
  }

  rotation(side) {
    const center_translation = Mat4.translation(0.5, 1.5 * Math.sqrt(3), 0);
    const rotated = Mat4.rotation(side * (Math.PI / 3), 0, 0, 1);
    const camera_location = Mat4.translation(-0.5, -1.5, 0);
    // const sphere_ct = Mat4.translation(0.5, 0.2, -6, 0)
    // this.sphere_transform = this.sphere_transform.times(sphere_ct.times(Mat4.inverse(rotated)).times(Mat4.inverse(sphere_ct)))
    // console.log(this.sphere_transform)
    // console.log(Mat4.inverse(rotated))
    // this.sphere_transform = this.sphere_transform.times(Mat4.rotation(-side * (Math.PI / 3), 0, 0, 1))
    // console.log(this.sphere_transform)


    return camera_location.times(center_translation.times(rotated).times(Mat4.inverse(center_translation)))
  }
}

export class Assignment2 extends Base_Scene {
  /**
   * This Scene object can be added to any display canvas.
   * We isolate that code so it can be experimented with on its own.
   * This gives you a very small code sandbox for editing a simple scene, and for
   * experimenting with matrix transformations.
   */
  constructor() {
    super();
    const levels = [
      `101010101110
      101010111010
      010111010101
      010100011100`,
      `100110101110
      110010011010
      010101000111
      010100011100`,
      `101010101110
      011010111010
      010101010111
      010100001100`,
    ];
    const game = new GameManager(levels.map((l) => stringToMatrix(l)));
    this.manager = game;
    this.prev_t = -1;
  }
  set_colors() {
    // TODO:  Create a class member variable to store your cube's colors.
    // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
    // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
  }

  make_control_panel() {
    this.key_triggered_button("Jump", ["k"], () => {
      if (this.is_jumping) {
        return;
      } else {
        this.jump_begin = this.mili_t;
        this.jump_end = this.jump_begin + this.gravity;
        this.is_jumping = true;
        this.jump_origin = this.sphere_transform;
        this.camera_origin = this.camera_location;
      }
    });

    this.key_triggered_button(
      "Move Left",
      ["j"],
      () => {
        this.left_pressed = true;
        // console.log(this.sphere_transform);
      },
      undefined,
      () => (this.left_pressed = false)
    );

    this.key_triggered_button(
      "Move Right",
      ["l"],
      () => {this.right_pressed = true},
      undefined,
      () => (this.right_pressed = false)
    );
  }

  panel_perspective_switch(method, jumping, ball_vcs, boundary) {
    if(method == "left") {
      if(ball_vcs[1] <= boundary) {
        this.is_jumping = false;
        this.rotation_side = (this.rotation_side + 1);
        if(this.rotation_side > 5) {
          this.rotation_side = 0
        }
        this.camera_location = this.rotation(this.rotation_side);
        console.log("left panel")
      }
    } else if (method == "right") {
      if(ball_vcs[1] <= boundary) {
        this.is_jumping = false;
        this.rotation_side = (this.rotation_side - 1);
        if(this.rotation_side < 0) {
          this.rotation_side = 5
        }
        this.camera_location = this.rotation(this.rotation_side);
        console.log("right panel")
      } 
    }
  }

  draw_ball(context, program_state) {
    if (this.is_jumping) {
        if (this.mili_t < this.jump_end) {
            let vertex = this.gravity / 2;
            let projectile_time = this.mili_t - this.jump_begin;
            let a = (-1 * this.jump_height) / vertex ** 2;
            let y = a * (projectile_time - vertex) ** 2 + this.jump_height;
            // console.log(y);

            this.sphere_transform = this.jump_origin.times(Mat4.translation(0, y, 0));
            // this.camera_location = this.camera_origin.times(Mat4.inverse(Mat4.translation(0, y*0.2, 0)));
            let pos_sphere = this.sphere_transform.times(vec4(0,0,0,1));
            let eye_ball_coords = this.camera_location.times(pos_sphere)
            let hex_x_const_right = (eye_ball_coords[0] - 1.3) * Math.sqrt(3) -1.3
            let hex_x_const_left = (-1.3 - eye_ball_coords[0]) * Math.sqrt(3) -1.3

            if(eye_ball_coords[1] <= hex_x_const_right) {
                this.is_jumping = false;
                this.rotation_side = (this.rotation_side - 1);
                if(this.rotation_side < 0) {
                  this.rotation_side = 5
                }
                this.camera_location = this.rotation(this.rotation_side);
                this.sphere_transform = this.sphere_transform.times(Mat4.rotation((Math.PI / 3), 0, 0, 1))
                console.log("right panel")
            } 
            else if(eye_ball_coords[1] <= hex_x_const_left) {
                this.is_jumping = false;
                this.rotation_side = (this.rotation_side + 1);
                if(this.rotation_side > 5) {
                  this.rotation_side = 0
                }
                this.camera_location = this.rotation(this.rotation_side);
                this.sphere_transform = this.sphere_transform.times(Mat4.rotation(-(Math.PI / 3), 0, 0, 1))

                console.log("left panel")
            }
            // this.panel_perspective_switch("left", eye_ball_coords, hex_x_const_left)
            // this.panel_perspective_switch("right", eye_ball_coords, hex_x_const_right)
        } else {
            console.log("Jump ended")
            // this.jump_origin = Mat4.identity();
            this.is_jumping = false;
            // this.camera_location = this.camera_origin
        }
    }


    

    let pos_sphere = this.sphere_transform.times(vec4(0,0,0,1));
    // console.log(pos_sphere[0], pos_sphere[1], pos_sphere[2])
    let cam_inv = Mat4.inverse(this.camera_location)
    let eye_ball_coords = this.camera_location.times(pos_sphere)
    let hex_y_const = (eye_ball_coords[1] +1.3) / Math.sqrt(3)
    let hex_x_const_right = (eye_ball_coords[0] - 1.3) * Math.sqrt(3) -1.2
    let hex_x_const_left = (-1.3 - eye_ball_coords[0]) * Math.sqrt(3) -1.2
    // console.log(pos_sphere)
    // console.log(this.sphere_transform)
    // console.log(this.camera_location.times(vec4(0,0,0,1)))
    // console.log(this.camera_origin.times(vec4(0,0,0,1)))
    // console.log(pos_sphere[1])

    if (this.left_pressed && eye_ball_coords[0] >= -1.3 - hex_y_const) {
      if(eye_ball_coords[1] <= hex_x_const_left && !this.is_jumping) {
        this.rotation_side = (this.rotation_side + 1);
        if(this.rotation_side > 5) {
          this.rotation_side = 0
        }
        this.camera_location = this.rotation(this.rotation_side);
        this.sphere_transform = this.sphere_transform.times(Mat4.rotation(-(Math.PI / 3), 0, 0, 1))
        console.log("left panel")
      }
      this.sphere_transform = this.sphere_transform.times(Mat4.translation(-this.delta_x , 0 , 0));  
      this.jump_origin = this.jump_origin.times(Mat4.translation(-this.delta_x , 0 , 0));
    }
    if (this.right_pressed && eye_ball_coords[0] <= 1.3 + hex_y_const) {
      if(eye_ball_coords[1] <= hex_x_const_right && !this.is_jumping) {
        this.rotation_side = (this.rotation_side - 1);
        if(this.rotation_side < 0) {
          this.rotation_side = 5
        }
        this.camera_location = this.rotation(this.rotation_side);
        this.sphere_transform = this.sphere_transform.times(Mat4.rotation((Math.PI / 3), 0, 0, 1))
        console.log("right panel")
      }
      this.sphere_transform = this.sphere_transform.times(Mat4.translation(this.delta_x , 0 , 0));    
      this.jump_origin = this.jump_origin.times(Mat4.translation(this.delta_x , 0 , 0));
    }
    let rotating_sphere = this.sphere_transform.times(
      Mat4.rotation(-program_state.animation_time / 120, 1, 0, 0)
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

  drawStars(context, program_state) {
    let sphere_pos = this.sphere_transform.times(vec4(0, 0, 0, 1));
    for (let i = 0; i < this.stars_deque.length; i++) {
      this.shapes.star.draw(
        context,
        program_state,
        Mat4.identity().times(Mat4.translation(this.stars_deque[i][0], this.stars_deque[i][1], this.stars_deque[i][2])).times(Mat4.scale(this.stars_deque[i][3], this.stars_deque[i][3], this.stars_deque[i][3])),
        this.materials.plastic.override({
          color: color(1, 1, 1, 1),
          ambient: 1,
        })
      )
    }
  }

  generateFaces(
    num_sides,
    panes_per_side,
    context,
    program_state,
    model_transform,
    ring_color,
    row
  ) {
    const blue = color(
      255 * Math.random(),
      255 * Math.random(),
      255 * Math.random(),
      1
    );
    let rotation_angle = (2 * Math.PI) / num_sides;
    for (let i = 0; i < num_sides; i++) {
      for (let j = 0; j < panes_per_side; j++) {
        if (row[i * panes_per_side + j]) {
          this.shapes.pane.draw(
            context,
            program_state,
            model_transform
              .times(Mat4.scale(1, 10, 5))
              .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)),
            // this.materials.plastic.override({ color: color(0.1*(i+1),0.1*(i+1),0.1*(i+1),1) })
              this.materials.plastic.override({ color:ring_color })
          );
        }
        model_transform = model_transform.times(Mat4.translation(1, 0, 0));
      }
      model_transform = model_transform.times(
        Mat4.rotation(rotation_angle, 0, 0, 1)
      );
      model_transform = model_transform.times(Mat4.translation(1, 0, 0));
    }
  }

  display(context, program_state) {
    super.display(context, program_state);
    // program_state.set_camera(this.camera_location);
    program_state.camera_inverse = this.camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));

    this.mili_t = program_state.animation_time;
    let t = program_state.animation_time / 1000;
    let model_transform = this.manager.get_initial_transform();
    let game_speed = 5 * (Math.floor(t / 10) + 1);
    if (model_transform == -1) {
      model_transform = Mat4.identity().times(Mat4.translation(0, 0, t * game_speed));
    } else {
      model_transform = model_transform.times(
        Mat4.translation(0, 0, (t - this.prev_t) * game_speed)
      );
    }
    console.log(game_speed);
    // model_transform = model_transform.times(this.sphere_transform)
    const rows = this.manager.get_rows_in_view();
    // console.log(rows);

    let rows_behind_camera = 0;
    let new_initial_transform = model_transform;
    let next_model_transform = -1;
    model_transform = model_transform;
    this.drawStars(context, program_state);
    for (let row of rows) {
      this.generateFaces(
        6,
        2,
        context,
        program_state,
        model_transform,
        color(0.1, 0.7, 0.5, 1),
        row
      );
      next_model_transform = model_transform.times(Mat4.translation(0, 0, -10));
      if (model_transform[2][3] >= 10) {
        // console.log(rows_behind_camera)
        rows_behind_camera++;
        new_initial_transform = next_model_transform;
      }
      model_transform = next_model_transform;
    }
    for (let i = 0; i < rows_behind_camera; i++) {
      this.manager.update_row_window(new_initial_transform);
    }
    if (rows_behind_camera == 0)
      this.manager.update_initial_tranform(new_initial_transform);
    this.prev_t = t;
    this.draw_ball(context, program_state);
    // if (t > 3) this.side = 1
  }
}
