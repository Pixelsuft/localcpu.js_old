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


def resize_screen(width, height):
    global screen
    screen = a.display.set_mode((width, height))


sock = socket.socket()
host_port = input(
    f'Enter host:port ({socket.gethostname()}:8124)\n').split(':')
sock.connect((host_port[0].strip(), int(host_port[1].strip())))
a.init()
a.font.init()
text_font = a.font.SysFont('Segoe UI', 15)
text_font.set_bold(True)
width, height = 720, 400
resize_screen(width, height)
is_graphic = False


while running:
    for event in a.event.get():
        if event.type == a.QUIT:
            running = False
    msg = {
        'from_python': True
    }
    sock.send(encode_msg(msg))
    recv_len = int(sock.recv(10).decode('utf-8').strip()) + 10
    #  msg = decode_msg(sock.recv(recv_len))
    #  needs = msg['needs']
    needs = decode_msg(sock.recv(recv_len))
    for i in needs:
        if i == 'clear_screen':
            screen.fill((0, 0, 0))
        elif i == 'resize_screen':
            width, height = needs[i][0], needs[i][1]
            resize_screen(width, height)
        elif i == 'is_graphic':
            is_graphic = needs[i]
        elif i == 'changed_text':
            for j in needs[i]:
                cur = needs[i][j]
                split = j.split('x')
                x = int(split[0]) * 9
                y = int(split[1]) * 16
                screen.blit(
                    text_font.render(cur[0], False, (cur[2][0], cur[2][1], cur[2][2])), (x, y)
                )
    a.display.flip()

running = False
