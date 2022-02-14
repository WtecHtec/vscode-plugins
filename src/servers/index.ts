import * as vscode from 'vscode';
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require("socket.io");
const config = require('../config');
const fileUtil = require('../ulits/filesUtil');

const beautify = require('js-beautify');
const codeFormat = { indent_size: 2, space_in_empty_paren: true };
// const path = require('path');
// 设置跨域
const io = new socketIo.Server(server, { cors: true });

export let getServer = server;
export let getIo = io;
// 开启服务
export function startServer(dataProvider: any): void {

    app.get('/', (req: any, res: any) => {
        res.send('<h1>服务启动</h1>');
    });

    io.on('connection', (socket: any) => {
        // console.log('a user connected', socket);
        // console.log('workFilePath====', config.workFilePath);
        if (!config.currentWorkPath || !config.dirName) {
            sendServerStatus(socket, 404, '没有选择工作区文件夹路径');
        }
        socket.on('client code', async (msg: string) => {
            if (!config.currentWorkPath || !config.dirName) {
                sendServerStatus(socket, 404, '没有选择工作区文件夹路径');
            } else {
                if (!config.workFilePath) {
                    config.workFilePath = config.currentWorkPath + '\\' + config.dirName;
                    console.log(config.workFilePath);
                    if (await fileUtil.createDir(config.workFilePath)) {
                        // sendServerStatus(socket, 405, '工作区文件夹路径创建');
                        writeFileByPsd(socket, config.workFilePath, msg);
                    } else {
                        sendServerStatus(socket, 405, '工作区文件夹路径创建失败');
                    }
                } else {
                    writeFileByPsd(socket, config.workFilePath, msg);
                }
                // if (await fileUtil.checkFilePath()) {
                // }
            }
            console.log('message: ' + msg);
        });
    });
    server.listen(3000, () => {
        console.log('listening on *:3000');
        config.runningStatus = true;
        vscode.window.createTreeView('ac_status', {
            treeDataProvider: new dataProvider('服务127.0.0.1:3000,已启动', 0),
        });
        vscode.window.showInformationMessage('服务启动: 127.0.0.1:3000');
    });
}

// 关闭服务
export function stopServer() {
    server.close();
}

function sendServerStatus(socket: any, code: number, msg: string) {
    socket.emit('server status', { code, msg, });
}

function writeFileByPsd(socket: any, filePath: string, content: string) {
    fileUtil.writeFile(filePath + '\\index.json', beautify.js(content, codeFormat)).then(() => {

    }).catch((err: any) => {
        sendServerStatus(socket, 500, '生成失败');
    });
}