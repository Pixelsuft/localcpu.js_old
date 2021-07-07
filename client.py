import socket
import json
import os
from io import BytesIO

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = 'True'

import pygame as a


running = True


def decode_msg(msg_bytes):
    return json.loads(msg_bytes.decode('utf-8'))


def encode_msg(msg_json):
    return json.dumps(msg_json).encode('utf-8')


def resize_screen(width1, height1):
    global half_w, half_h, width, height
    width = width1
    height = height1
    a.display.set_mode((width, height))
    half_w, half_h = int(width / 2), int(height / 2)


def fix_color(color):
    if color[0] == color[2] or color[1] == color[2]:
        return color
    if color[0] == color[1] and color[0] == 0 and color[2] > 85:
        return color
    return (color[0] + 85, color[1] + 85, color[2])


def to_keyboard_code(c):
    if c == a.K_a:
        return 0x1E
    elif c == a.K_b:
        return 0x30
    elif c == a.K_c:
        return 0x2E
    elif c == a.K_d:
        return 0x20
    elif c == a.K_e:
        return 0x12
    elif c == a.K_f:
        return 0x21
    elif c == a.K_g:
        return 0x22
    elif c == a.K_h:
        return 0x23
    elif c == a.K_i:
        return 0x17
    elif c == a.K_j:
        return 0x24
    elif c == a.K_k:
        return 0x25
    elif c == a.K_l:
        return 0x26
    elif c == a.K_m:
        return 0x32
    elif c == a.K_n:
        return 0x31
    elif c == a.K_o:
        return 0x18
    elif c == a.K_p:
        return 0x19
    elif c == a.K_q:
        return 0x10
    elif c == a.K_r:
        return 0x13
    elif c == a.K_s:
        return 0x1F
    elif c == a.K_t:
        return 0x14
    elif c == a.K_u:
        return 0x16
    elif c == a.K_v:
        return 0x2F
    elif c == a.K_w:
        return 0x11
    elif c == a.K_x:
        return 0x2D
    elif c == a.K_y:
        return 0x15
    elif c == a.K_z:
        return 0x2C
    elif c >= a.K_0 and c <= a.K_9:
        result = c - a.K_0
        if not result:
            result = 10
        return result
    elif c == a.K_EQUALS:
        return 0x0D
    elif c == a.K_RETURN:
        return 0x1C
    elif c == a.K_BACKSPACE:
        return 0x0E
    elif c == a.K_LEFT:
        return 0xE04B
    elif c == a.K_DOWN:
        return 0xE050
    elif c == a.K_RIGHT:
        return 0xE04D
    elif c == a.K_UP:
        return 0xE048
    elif c == a.K_SPACE:
        return 0x39
    elif c == a.K_PAGEUP:
        return 0xE04F
    elif c == a.K_PAGEDOWN:
        return 0xE051
    elif c == a.K_DELETE:
        return 0xE053
    elif c >= a.K_F1 and c <= a.K_F12:
        return 0x3B + (c - a.K_F1)
    elif c == a.K_SLASH:
        return 0x35
    elif c == a.K_LALT:
        return 0x38
    elif c == a.K_RALT:
        return 0xE038
    elif c == a.K_LCTRL:
        return 0x1D
    elif c == a.K_RCTRL:
        return 0xe01d
    elif c == a.K_LSHIFT:
        return 0x2A
    elif c == a.K_RSHIFT:
        return 0x36
    elif c == a.K_EQUALS:
        return 0x0D
    elif c == a.K_SEMICOLON:
        return 0x27
    elif c == a.K_BACKSLASH:
        return 0x28
    elif c == a.K_COMMA:
        return 0x33
    elif c == a.K_PERIOD:
        return 0x34
    elif c == a.K_MINUS:
        return 0x0C
    elif c == a.K_RIGHTBRACKET:
        return 0x1A
    elif c == a.K_LEFTBRACKET:
        return 0x1B
    elif c == a.K_QUOTE:
        return 0x28
    elif c == a.K_BACKQUOTE:
        return 0x29
    elif c == a.K_TAB:
        return 0x0F
    elif c == 311:  # Left WIN
        return 0xE05B
    elif c == 312:  # Right WIN
        return 0xE05B
    else:
        print('Unknown keyboard_code:', c)
    return None


sock = socket.socket()
host = socket.gethostname()
input_ = input(f'Enter host:port ({host}:8124)\n')
host_port = input_.split(':') if input_ else (host, '8124')
sock.connect((host_port[0].strip(), int(host_port[1].strip())))
a.init()
a.display.set_icon(a.image.load('icon.ico'))
a.display.set_caption('localcpu.js')
a.font.init()
text_font = a.font.Font('text_mode_font.ttf', 15)
text_font.set_bold(True)
width, height = 720, 400
half_w, half_h = 360, 200
cursor_x, cursor_y = 0, 0
screen = a.display.set_mode((width, height))
is_graphic = False
mouse_locked = False
cursor_x, cursor_y = 0, 0
cursor_bg, cursor_fg = (0, 0, 0), (255, 255, 255)
ldown, mdown, rdown = False, False, False
cursor = a.mouse.get_cursor()
empty_cursor = a.cursors.compile((
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
))


while running:
    msg = {
        'from_python': True
    }
    downs = []
    ups = []
    for e in a.event.get():
        if e.type == a.QUIT:
            if not mouse_locked:
                running = False
        elif e.type == a.MOUSEMOTION:
            if mouse_locked:
                x, y = a.mouse.get_pos()
                msg['move_x'] = x - half_w
                msg['move_y'] = y - half_h
                a.mouse.set_pos(half_w, half_h)
        elif e.type == a.MOUSEBUTTONDOWN:
            if mouse_locked:
                if e.button == 1:
                    ldown = True
                elif e.button == 2:
                    mdown = True
                elif e.button == 3:
                    rdown = True
                msg['mouse_downs'] = [ldown, mdown, rdown]
        elif e.type == a.MOUSEBUTTONUP:
            if mouse_locked:
                if e.button == 1:
                    ldown = False
                elif e.button == 2:
                    mdown = False
                elif e.button == 3:
                    rdown = False
                msg['mouse_downs'] = [ldown, mdown, rdown]
            elif e.button == 1:
                mouse_locked = True
                a.event.set_grab(True)
                a.display.set_caption('localcpu.js (Press ESCape to unlock your mouse)')
                a.mouse.set_cursor((8, 8), (0, 0), *empty_cursor)
        elif e.type == a.KEYDOWN:
            if mouse_locked:
                if e.key == a.K_ESCAPE:
                    mouse_locked = False
                    a.event.set_grab(False)
                    a.display.set_caption('localcpu.js')
                    a.mouse.set_cursor(a.SYSTEM_CURSOR_ARROW)
                    ldown, mdown, rdown = False, False, False
                    msg['mouse_downs'] = [False, False, False]
                else:
                    keyboard_code = to_keyboard_code(e.key)
                    if keyboard_code:
                        downs.append(keyboard_code)
            elif e.key == a.K_ESCAPE:
                downs.append(0x01)
        elif e.type == a.KEYUP:
            if mouse_locked and not e.key == a.K_ESCAPE:
                keyboard_code = to_keyboard_code(e.key)
                if keyboard_code:
                    ups.append(keyboard_code)
            elif e.key == a.K_ESCAPE:
                ups.append(0x01)
    if downs:
        msg['downs'] = downs
    if ups:
        msg['ups'] = ups
    sock.send(encode_msg(msg))
    recv_len = int(sock.recv(10).decode('utf-8').strip()) + 10
    sock_recv = b''
    try:
        sock_recv = sock.recv(recv_len)
        needs = decode_msg(sock_recv)
    except:
        needs = decode_msg(sock_recv + sock.recv(5000))
    if 'clear_screen' in needs:
        screen.fill((0, 0, 0))
    if 'resize_screen' in needs:
        width, height = needs['resize_screen'][0], needs['resize_screen'][1]
        resize_screen(width, height)
    if 'is_graphic' in needs:
        is_graphic = needs['is_graphic']
        if not is_graphic:
            resize_screen(720, 400)
    if 'cursor_x' in needs:
        cursor_x = needs['cursor_x']
    if 'cursor_y' in needs:
        cursor_y = needs['cursor_y']
    if is_graphic:
        if 'buffer' in needs:
            screen.blit(a.image.load(BytesIO(bytes(needs['buffer']['data']))), (0, 0))
    else:
        if 'changed_text' in needs:
            for j in needs['changed_text']:
                cur = needs['changed_text'][j]
                split = j.split('x')
                x = int(split[0]) * 9
                y = int(split[1]) * 16
                bg = fix_color(cur[1])
                fg = fix_color(cur[2])
                a.draw.rect(
                    screen, bg, [x, y, 9, 16], False
                )
                screen.blit(
                    text_font.render(cur[0], False, fg), (x, y)
                )
        a.draw.rect(
            screen, cursor_bg, [cursor_x * 9, cursor_y * 16 + 14, 9, 2], False
        )
        if 'cursor_x' in needs:
            cursor_x, cursor_y = needs['cursor_x'], needs['cursor_y']
            if 'cursor_bg' in needs:
                cursor_bg, cursor_fg = fix_color(needs['cursor_bg']), fix_color(needs['cursor_fg'])
        a.draw.rect(
            screen, cursor_fg, [cursor_x * 9, cursor_y * 16 + 14, 9, 2], False
        )
    a.display.flip()

running = False
