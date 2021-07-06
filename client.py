import socket
import json
import time
import os

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = 'True'

import pygame as a


running = True


def decode_msg(msg_bytes):
    return json.loads(msg_bytes.decode('utf-8'))


def encode_msg(msg_json):
    return json.dumps(msg_json).encode('utf-8')


def resize_screen(width1, height1):
    global screen, half_w, half_h, width, height
    width = width1
    height = height1
    screen = a.display.set_mode((width, height))
    half_w, half_h = int(width / 2), int(height / 2)


sock = socket.socket()
host_port = input(
    f'Enter host:port ({socket.gethostname()}:8124)\n').split(':')
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
mouse_x, mouse_y = 360, 200
mouse_locked = False
cursor_x, cursor_y = 0, 0
cursor_bg, cursor_fg = (0, 0, 0), (255, 255, 255)
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
        'from_python': True,
        'move_x': 0,
        'move_y': 0
    }
    for e in a.event.get():
        if e.type == a.QUIT:
            if not mouse_locked:
                running = False
        elif e.type == a.MOUSEMOTION:
            if mouse_locked:
                x, y = a.mouse.get_pos()
                msg['move_x'] = x - mouse_x
                msg['move_y'] = y - mouse_y
                mouse_x, mouse_y = half_w, half_h
                a.mouse.set_pos(half_w, half_h)
        elif e.type == a.MOUSEBUTTONUP:
            if mouse_locked:
                pass
            elif e.button == 1:
                mouse_locked = True
                a.event.set_grab(True)
                a.display.set_caption('localcpu.js (Press ESCape to unlock your mouse)')
                a.mouse.set_cursor((8, 8), (0, 0), *empty_cursor)
        elif e.type == a.KEYDOWN:
            if e.key == a.K_ESCAPE:
                if mouse_locked:
                    mouse_locked = False
                    a.event.set_grab(False)
                    a.display.set_caption('localcpu.js')
                    a.mouse.set_cursor(a.SYSTEM_CURSOR_ARROW)
        else:
            print(e.type, dir(e))
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
        if is_graphic:
            pass
        else:
            resize_screen(720, 400)
    if 'cursor_x' in needs:
        cursor_x = needs['cursor_x']
    if 'cursor_y' in needs:
        cursor_y = needs['cursor_y']
    if 'changed_text' in needs:
        for j in needs['changed_text']:
            cur = needs['changed_text'][j]
            split = j.split('x')
            x = int(split[0]) * 9
            y = int(split[1]) * 16
            a.draw.rect(
                screen, (cur[1][0], cur[1][1], cur[1][2]), [x, y, 9, 16], False
            )
            screen.blit(
                text_font.render(cur[0], False, (cur[2][0], cur[2][1], cur[2][2])), (x, y)
            )
    if 'cursor_x' in needs:
        x, y = needs['cursor_x'], needs['cursor_y']
        if 'cursor_bg' in needs:
            bg, fg = needs['cursor_bg'], needs['cursor_fg']
        a.draw.rect(
            screen, cursor_bg, [cursor_x * 9, cursor_y * 16 + 14, 9, 2], False
        )
        cursor_x, cursor_y = x, y
        if 'cursor_bg' in needs:
            cursor_bg, cursor_fg = bg, fg
        a.draw.rect(
            screen, cursor_fg, [cursor_x * 9, cursor_y * 16 + 14, 9, 2], False
        )
    a.display.flip()

running = False
