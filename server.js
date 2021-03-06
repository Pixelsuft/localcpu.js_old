const V86Starter = require("./v86/libv86.js").V86Starter;
const {
  createCanvas,
  loadImage
} = require('canvas'); //npm install canvas
var graphic_screen = createCanvas(720, 400);
var graphic_context = graphic_screen.getContext('2d');


function resize_canvas(w, h) {
  graphic_screen = createCanvas(w, h);
  graphic_context = graphic_screen.getContext('2d');
}


var e;
var is_graphic = false;
var needs = {};
var changed_rows = new Int8Array(25),
  text_mode_data = new Int32Array(80 * 25 * 3),
  cursor_col = 0,
  cursor_row = 0,
  graphic_image_data = graphic_context.createImageData(720, 400),
  graphic_buffer = new Uint8Array(graphic_image_data.data.buffer),
  graphic_buffer32 = new Int32Array(graphic_image_data.data.buffer),
  graphical_mode_width = 720,
  graphical_mode_height = 400;
const text_mode_width = 80,
  text_mode_height = 25;


var charmap_high = new Uint16Array([
  0xC7, 0xFC, 0xE9, 0xE2, 0xE4, 0xE0, 0xE5, 0xE7,
  0xEA, 0xEB, 0xE8, 0xEF, 0xEE, 0xEC, 0xC4, 0xC5,
  0xC9, 0xE6, 0xC6, 0xF4, 0xF6, 0xF2, 0xFB, 0xF9,
  0xFF, 0xD6, 0xDC, 0xA2, 0xA3, 0xA5, 0x20A7, 0x192,
  0xE1, 0xED, 0xF3, 0xFA, 0xF1, 0xD1, 0xAA, 0xBA,
  0xBF, 0x2310, 0xAC, 0xBD, 0xBC, 0xA1, 0xAB, 0xBB,
  0x2591, 0x2592, 0x2593, 0x2502, 0x2524, 0x2561, 0x2562, 0x2556,
  0x2555, 0x2563, 0x2551, 0x2557, 0x255D, 0x255C, 0x255B, 0x2510,
  0x2514, 0x2534, 0x252C, 0x251C, 0x2500, 0x253C, 0x255E, 0x255F,
  0x255A, 0x2554, 0x2569, 0x2566, 0x2560, 0x2550, 0x256C, 0x2567,
  0x2568, 0x2564, 0x2565, 0x2559, 0x2558, 0x2552, 0x2553, 0x256B,
  0x256A, 0x2518, 0x250C, 0x2588, 0x2584, 0x258C, 0x2590, 0x2580,
  0x3B1, 0xDF, 0x393, 0x3C0, 0x3A3, 0x3C3, 0xB5, 0x3C4,
  0x3A6, 0x398, 0x3A9, 0x3B4, 0x221E, 0x3C6, 0x3B5, 0x2229,
  0x2261, 0xB1, 0x2265, 0x2264, 0x2320, 0x2321, 0xF7,
  0x2248, 0xB0, 0x2219, 0xB7, 0x221A, 0x207F, 0xB2, 0x25A0, 0xA0
]);


var charmap_low = new Uint16Array([
  0x20, 0x263A, 0x263B, 0x2665, 0x2666, 0x2663, 0x2660, 0x2022,
  0x25D8, 0x25CB, 0x25D9, 0x2642, 0x2640, 0x266A, 0x266B, 0x263C,
  0x25BA, 0x25C4, 0x2195, 0x203C, 0xB6, 0xA7, 0x25AC, 0x21A8,
  0x2191, 0x2193, 0x2192, 0x2190, 0x221F, 0x2194, 0x25B2, 0x25BC
]);


var skip_first = true;
const sens = 0.2;


var charmap = [],
  chr;

for (var i = 0; i < 256; i++) {
  if (i > 127) {
    chr = charmap_high[i - 0x80];
  } else if (i < 32) {
    chr = charmap_low[i];
  } else {
    chr = i;
  }
  charmap[i] = String.fromCharCode(chr);
}

if (true) {
  charmap[128] = '??';
  charmap[129] = '??';
  charmap[130] = '??';
  charmap[131] = '??';
  charmap[132] = '??';
  charmap[133] = '??';
  charmap[134] = '??';
  charmap[135] = '??';
  charmap[136] = '??';
  charmap[137] = '??';
  charmap[138] = '??';
  charmap[139] = '??';
  charmap[140] = '??';
  charmap[141] = '??';
  charmap[142] = '??';
  charmap[143] = '??';
  charmap[144] = '??';
  charmap[145] = '??';
  charmap[146] = '??';
  charmap[147] = '??';
  charmap[148] = '??';
  charmap[149] = '??';
  charmap[150] = '??';
  charmap[151] = '??';
  charmap[152] = '??';
  charmap[153] = '??';
  charmap[154] = '??';
  charmap[155] = '??';
  charmap[156] = '??';
  charmap[157] = '??';
  charmap[158] = '??';
  charmap[159] = '??';
  charmap[160] = '??';
  charmap[161] = '??';
  charmap[162] = '??';
  charmap[163] = '??';
  charmap[164] = '??';
  charmap[165] = '??';
  charmap[166] = '??';
  charmap[167] = '??';
  charmap[168] = '??';
  charmap[169] = '??';
  charmap[170] = '??';
  charmap[171] = '??';
  charmap[172] = '??';
  charmap[173] = '??';
  charmap[174] = '??';
  charmap[175] = '??';
  charmap[224] = '??';
  charmap[225] = '??';
  charmap[226] = '??';
  charmap[227] = '??';
  charmap[228] = '??';
  charmap[229] = '??';
  charmap[230] = '??';
  charmap[231] = '??';
  charmap[232] = '??';
  charmap[233] = '??';
  charmap[234] = '??';
  charmap[235] = '??';
  charmap[236] = '??';
  charmap[237] = '??';
  charmap[238] = '??';
  charmap[239] = '??';
  charmap[240] = '??';
  charmap[241] = '??';
}

const hex_to_rgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
  .substring(1).match(/.{2}/g)
  .map(x => parseInt(x, 16));

function number_as_color(n) {
  n = n.toString(16);
  return hex_to_rgb("#" + Array(7 - n.length).join("0") + n);
}

function mousemove_handler(delta_x, delta_y) {
  delta_x = delta_x * sens;
  delta_y = delta_y * -sens;

  e.bus.send("mouse-delta", [delta_x, delta_y]);
}

var space_count = 0;

function text_update_row(row) {
  if (is_graphic)
    return false;
  if (typeof needs.changed_text == 'undefined')
    needs.changed_text = {};
  var offset = 3 * row * text_mode_width,
    bg_color,
    fg_color;

  for (var i = 0; i < text_mode_width;) {
    bg_color = text_mode_data[offset + 1];
    fg_color = text_mode_data[offset + 2];
    while (i < text_mode_width &&
      text_mode_data[offset + 1] === bg_color &&
      text_mode_data[offset + 2] === fg_color) {
      const ascii = text_mode_data[offset];
      if (skip_first) {
        if (charmap[ascii] == 'S') { // (S)ea bios
          skip_first = false;
        } else {
          i++;
          offset += 3;
          continue;
        }
      }
      if (row == 0) {
        space_count = 0;
      } else {
        if (charmap[ascii] == ' ') {
          space_count += 1;
        } else space_count = 0;
      }
      if (space_count > 80) {
        i++;
        offset += 3;
        continue;
      }
      const bg = number_as_color(bg_color);
      const fg = number_as_color(fg_color);
      needs.changed_text[i + 'x' + row] = [
        charmap[ascii],
        bg,
        fg
      ];
      i++;
      offset += 3;

      if (row === cursor_row) {
        if (i === cursor_col) {
          break;
        } else if (i === cursor_col + 1) {
          needs.cursor_bg = bg;
          needs.cursor_fg = fg;
          needs.cursor_x = cursor_col;
          needs.cursor_y = cursor_row;
          break;
        }
      }
    }
  }
  last_row = row;
};

function send_to_controller(code) {
  e.bus.send("keyboard-code", code);
}

function data_func(msg) {
  if (msg.move_x) {
    mousemove_handler(msg.move_x, msg.move_y);
  }
  if (msg.mouse_downs) {
    e.bus.send("mouse-click", [msg.mouse_downs[0], msg.mouse_downs[1], msg.mouse_downs[2]]);
  }
  if (msg.downs) {
    for (var i = 0; i < msg.downs.length; i++) {
      if (msg.downs[i] > 0xFF) {
        send_to_controller(msg.downs[i] >> 8);
        send_to_controller(msg.downs[i] & 0xFF);
      } else {
        send_to_controller(msg.downs[i]);
      }
    }
  }
  if (msg.ups) {
    for (var i = 0; i < msg.ups.length; i++) {
      msg.ups[i] |= 0x80;
      if (msg.ups[i] > 0xFF) {
        send_to_controller(msg.ups[i] >> 8);
        send_to_controller(msg.ups[i] & 0xFF);
      } else {
        send_to_controller(msg.ups[i]);
      }
    }
  }
  return needs;
}

function init() {
  e = new V86Starter({
    wasm_path: "./v86/v86.wasm",
    memory_size: 64 * 1024 * 1024,
    vga_memory_size: 4 * 1024 * 1024,
    bios: {
      url: "./v86/seabios.bin"
    },
    vga_bios: {
      url: "./v86/vgabios.bin"
    },
    /*fda: {
      url: "d:/images/boot.img"
    },*/
    /*hda: {
      url: "./test_images/msdos.img"
    },*/
    /*hda: {
      url: "./test_images/dos.img"
    },*/
    /*hda: {
      url: "./test_images/win31.img"
    },*/
    fda: {
      url: "./test_images/windows1.img"
    },
    autostart: true
  });

  var inter;

  e.add_listener('screen-set-mode', function(data) {
    needs.is_graphic = data;
    is_graphic = data;
    if (is_graphic) {
      inter = setInterval(update_graphical, 1000 / 60);
    } else {
      if (inter)
        clearInterval(inter);
    }
  });
  e.add_listener('screen-clear', function() {
    needs.clear_screen = true;
  });

  function update_graphical() {
    if (is_graphic) {
      e.bus.send("screen-fill-buffer");
    }
  }

  e.add_listener('screen-set-size-graphical', function(data) {
    resize_canvas(data[0], data[1]);
    needs.resize_screen = [data[0], data[1]];
    graphic_image_data = graphic_context.createImageData(data[2], data[3]);
    graphic_buffer = new Uint8Array(graphic_image_data.data.buffer);
    graphic_buffer32 = new Int32Array(graphic_image_data.data.buffer);

    graphical_mode_width = data[0];
    graphical_mode_height = data[1];
    e.bus.send("screen-tell-buffer", [graphic_buffer32], [graphic_buffer32.buffer]);
  });

  e.add_listener('screen-fill-buffer-end', function(data) {
    data.forEach((layer) => {
      graphic_context.putImageData(
        graphic_image_data,
        layer.screen_x - layer.buffer_x,
        layer.screen_y - layer.buffer_y,
        layer.buffer_x,
        layer.buffer_y,
        layer.buffer_width,
        layer.buffer_height
      );
    });
	needs.buffer = graphic_screen.toDataURL().slice(22);
    //needs.buffer = graphic_screen.toBuffer();
  });

  e.add_listener('screen-put-char', function(data) {
    if (data[0] < text_mode_height && data[1] < text_mode_width) {
      var p = 3 * (data[0] * text_mode_width + data[1]);

      text_mode_data[p] = data[2];
      text_mode_data[p + 1] = data[3];
      text_mode_data[p + 2] = data[4];

      text_update_row(data[0]);
    }
  });
  e.add_listener("screen-update-cursor", function(data) {
    if (data[0] !== cursor_row || data[1] !== cursor_col) {
      const older = cursor_row;
      cursor_row = data[0];
      cursor_col = data[1];
      needs.cursor_x = data[1];
      needs.cursor_y = data[0];
      text_update_row(data[0]);
      text_update_row(older);
    }
  });
}

function close() {

}

const server = require('net').createServer((c) => {
  c.on('end', () => {
    close();
  });
  c.on('data', (msg) => {
    const stringed = JSON.stringify(data_func(JSON.parse(msg.toString())))
    c.write((stringed.length + '         ').slice(0, 10) + stringed);
    needs = {};
  });
  init();
});

server.on('error', (err) => {
  throw err;
});

server.listen(8124, () => {
  console.log('server bound');
});
