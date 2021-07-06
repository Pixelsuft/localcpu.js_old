const V86Starter = require("./v86/libv86.js").V86Starter;

var e;
var is_graphic = false;
var needs = {};
var changed_rows = new Int8Array(25),
  text_mode_data = new Int32Array(80 * 25 * 3);
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


var skip_first = false;


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

const hex_to_rgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
  .substring(1).match(/.{2}/g)
  .map(x => parseInt(x, 16));

function number_as_color(n) {
  n = n.toString(16);
  return hex_to_rgb("#" + Array(7 - n.length).join("0") + n);
}

function text_update_row(row) {
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
      if (charmap[ascii] !== ' ') {
        needs.changed_text[i + 'x' + row] = [
          charmap[ascii],
          number_as_color(bg_color),
          number_as_color(fg_color)
        ];
      }
      i++;
      offset += 3;
    }
  }
};

function data_func(msg) {
  return needs;
}

function init() {
  e = new V86Starter({
    wasm_path: "./v86/v86.wasm",
    memory_size: 4 * 1024 * 1024,
    vga_memory_size: 1 * 1024 * 1024,
    bios: {
      url: "./v86/seabios.bin",
    },
    vga_bios: {
      url: "./v86/vgabios.bin",
    },
    hda: {
      url: "./test_images/msdos.img",
    },
    autostart: true
  });
  e.add_listener('screen-set-mode', function(data) {
    needs.is_graphic = data;
    is_graphic = data;
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
    needs.resize_screen = [data[0], data[1]];
    /*graphic_image_data = graphic_context.createImageData(data[2], data[3]);
    graphic_buffer = new Uint8Array(graphic_image_data.data.buffer);
    graphic_buffer32 = new Int32Array(graphic_image_data.data.buffer);

    graphical_mode_width = data[0];
    graphical_mode_height = data[1];
    e.bus.send("screen-tell-buffer", [graphic_buffer32], [graphic_buffer32.buffer]);*/
  });

  e.add_listener('screen-fill-buffer-end', function(data) {
    /*data[0].forEach((layer) => {
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
    dataurl_to_file(graphic_screen.toDataURL(), 'screenshot.png');*/
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
