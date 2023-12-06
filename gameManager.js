import { tiny } from "./examples/common.js";
const { color } = tiny;

export class Level {
  constructor(
    PANES_PER_SIDE,
    NUM_SIDES,
    COLOR,
    SPEED,
    PANE_WIDTH,
    PANE_DEPTH,
    id
  ) {
    this.LEVEL_COLOR = COLOR;
    this.LEVEL_SPEED = SPEED;
    this.ROTATION_ANGLE = (2 * Math.PI) / NUM_SIDES;
    this.TUNNEL_HEIGHT =
      (PANES_PER_SIDE * PANE_WIDTH) / Math.tan(Math.PI / NUM_SIDES);

    this.PANE_DEPTH = PANE_DEPTH;
    this.PANE_WIDTH = PANE_WIDTH;
    this.PANES_PER_SIDE = PANES_PER_SIDE;
    this.NUM_SIDES = NUM_SIDES;

    this.SIDE_WIDTH = this.PANE_WIDTH * this.PANES_PER_SIDE;
    this.BOTTOM_SIDE_Y = -this.TUNNEL_HEIGHT / 2;

    this.PANE_START_X = -this.PANE_WIDTH * ((this.PANES_PER_SIDE - 1) / 2);
    this.PANE_START_Y = -this.TUNNEL_HEIGHT / 2;
    this.id = id;
  }
}

export class GameManager {
  constructor(levels, configs) {
    // pane is square
    /*
        level: (example)
        101110
        111010
        010111
        111111
        */

    this.infinite = !levels; // procedurally generate or not
    this.levels = levels;
    this.configs = configs;
    this.num_levels = levels.length;
    this.level_size = levels.length;
    this.level_state = this.levels[0];
    // only for first level

    /* Constants */
    this.rows_to_render = 28;
    this.row_size = 18;

    /* Update during game */
    this.rows_deque = [];
    this.levels_deque = [];
    this.starting_transform = -1;
    this.current_row = 0; // within the current level
    this.current_level = 0;
    this.id = this.num_levels;

    /* Initialize structures */
    // Add spaces between levels
    this.levels[0].unshift(new Array(this.levels[0][0].length).fill(1));
    this.levels[0].unshift(new Array(this.levels[0][0].length).fill(1));
    for (let i = 0; i < this.num_levels; i++) {
      levels[i].push(new Array(this.levels[i][0].length).fill(1));
      levels[i].push(new Array(this.levels[i][0].length).fill(1));
      levels[i].push(new Array(this.levels[i][0].length).fill(0));
    }

    // initialize visible rows (assume there are always enough rows)
    let i = this.rows_to_render;
    for (let j = 0; j < this.num_levels; j++) {
      let take = Math.min(i, levels[j].length);
      i -= take;
      for (let k = 0; k < take; k++) {
        this.right_row = k;
        this.right_level = j;
        this.rows_deque.push(this.levels[j][k]);
        this.levels_deque.push(this.configs[j]);
      }
      if (i == 0) break;
    }

    this.possible_configs = [
      [2, 4, 2], // PANES_PER_SIDE, NUM_SIDES, PANE_WIDTH
      [1, 4, 3],
      [3, 6, 1],
      [2, 6, 1],
      [1, 15, 1],
      [1, 20, 0.8],
      [2, 8, 1],
      [3, 5, 1],
      [4, 4, 1],
      [1, 12, 1],
    ];

    this.panel_colors = [
      color(240 / 255, 77 / 255, 77 / 255, 0.8),
      color(250 / 255, 146 / 255, 42 / 255, 0.8),
      color(243 / 255, 255 / 255, 79 / 255, 0.8),
      color(0.1, 0.7, 0.5, 1),
      color(79 / 255, 176 / 255, 255 / 255, 0.8),
      color(153 / 255, 94 / 255, 247 / 255, 0.8),
      color(244 / 255, 94 / 255, 247 / 255, 0.8),
    ];

    // making new levels
  }

  get_levels() {
    return this.levels_deque;
  }

  get_rows_in_view() {
    return this.rows_deque;
  }

  get_initial_transform() {
    return this.starting_transform;
  }

  update_initial_tranform(new_starting_transform) {
    this.starting_transform = new_starting_transform;
  }

  generate_new_row(size) {
    // const seed = Math.floor(Math.random() * (1 << size));
    let row = new Array(size);
    for (let i = 0; i < size; i++) {
      row[i] = Math.random() < 0.7;
    }
    return row;
  }

  generate_new_level() {
    const MAX_SPEED = 15;
    const shape =
      this.possible_configs[
        Math.floor(Math.random() * this.possible_configs.length)
      ];
    const take = Math.floor(Math.random() * (this.panel_colors.length - 1))
    const color = this.panel_colors[take];
    this.panel_colors[take] = this.panel_colors[this.panel_colors.length - 1]
    this.panel_colors[this.panel_colors.length - 1] = color
    
    const config = new Level(
      shape[0],
      shape[1],
      color,
      Math.min(MAX_SPEED, 7 + this.id),
      shape[2],
      3,
      this.id
    );
    this.id++;
    const level = [];
    const level_prob = 0.3 + Math.random() * 0.4
    const LEVEL_LENGTH = Math.min(MAX_SPEED, 7 + this.id) * 3;
    for (let k = 0; k < LEVEL_LENGTH; k++) {
      let row = [];
      for (let j = 0; j < config.NUM_SIDES * config.PANES_PER_SIDE; j++) {
        if (k < 6) row.push(1);
        else row.push(Math.random() < level_prob);
      }
      level.push(row);
    }
    level.push(new Array(config.NUM_SIDES * config.PANES_PER_SIDE).fill(1));
    level.push(new Array(config.NUM_SIDES * config.PANES_PER_SIDE).fill(1));
    level.push(new Array(config.NUM_SIDES * config.PANES_PER_SIDE).fill(0));
    return [level, config];
  }

  update_row_size(n) {
    this.row_size = n;
  }

  update_row_window(new_starting_transform) {
    this.starting_transform = new_starting_transform;
    let at_end = false;
    if (this.right_row < this.levels[this.right_level].length - 1) {
      this.right_row++;
    } else if (this.right_level < this.levels.length - 1) {
      this.right_row = 0;
      this.right_level++;
    } else {
      at_end = true;
    }

    if (this.right_level == this.levels.length - 1) {
      const [level, config] = this.generate_new_level();
      this.levels.push(level);
      this.configs.push(config);
    }

    this.rows_deque.push(this.levels[this.right_level][this.right_row]);
    this.levels_deque.push(this.configs[this.right_level]);
    // else
    //   this.rows_deque.push(this.generate_new_row(this.row_size));
    this.rows_deque.shift();
    this.levels_deque.shift();
  }

  update_level_window() {
    // when reaching a new level
    this.levels.shift();
    this.configs.shift();
    this.right_level -= 1;
  }

  reset_to_level(id) {
    this.rows_deque = [];
    this.levels_deque = [];

    let i = this.rows_to_render;
    let start_j = 0;
    for (let config of this.configs) {
      if (config.id == id) break;
      start_j += 1;
    }
    for (let j = start_j; j < this.levels.length; j++) {
      let take = Math.min(i, this.levels[j].length);
      i -= take;
      for (let k = 0; k < take; k++) {
        this.right_row = k;
        this.right_level = j;
        this.rows_deque.push(this.levels[j][k]);
        this.levels_deque.push(this.configs[j]);
      }
      if (i == 0) break;
    }

    this.starting_transform = -1;
  }

  get_current_level() {
    return this.level_state[this.current_level];
  }

  game_is_done() {
    return this.rows_deque.length <= 2;
  }
}

export function stringToMatrix(s) {
  const res = s
    .trim()
    .split("\n")
    .map((r) =>
      r
        .trim()
        .split("")
        .map((c) => parseInt(c))
    )
    .reverse();

  return res;
}

function testGameManager() {
  const levels = [
    `101110101110111111
     111010111010111111
     010111010111111111
     011100011100111111`,
    `101110101110111111
     111010111010111111
     010111010111111111
     011100011100111111`,
    `101110101110111111
     111010111010111111
     010111010111111111
     011100011100111111`,
  ];
  const game = new GameManager(levels.map((l) => stringToMatrix(l)));
  //   console.log(game.levels);
  console.log(game.rows_deque);
  console.log();

  while (!game.game_is_done()) {
    game.update_row_window();

    console.log(game.rows_deque);
    console.log("-------------------------------");
  }
}

// testGameManager();
