// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const fs = require('fs');

const config = require('./config');
const server = require('./servers/index');

// const CODE_UNIT: String = 'test';

let statusList: Array<any> = [];
let filePathList: Array<any> = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('statusList', statusList);
    console.log('statusList', filePathList);
    // statusList = [];
    // filePathList = [];

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "hellovsplugin" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('hellovsplugin.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from helloVsplugin!');
    });
    context.subscriptions.push(disposable);

    const command = 'myExtension.startServer';
    const commandHandler = async () => {
        // 获取当前打开的文件夹
        let folderName = vscode.workspace.name;
        if (!folderName) {
            vscode.window.showErrorMessage('没有打开工作区');
            return;
        }
        // // 获取当前打开文件路径
        // let folderPath = vscode.workspace.rootPath;
        // console.log(folderPath);
        server.startServer(DataProvider);
        // 确认身份
        // let msg = await vscode.window.showInputBox(
        //     { // 这个对象中所有参数都是可选参数
        //         password: true, // 输入内容是否是密码
        //         ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
        //         placeHolder: '鉴权', // 在输入框内的提示信息
        //         prompt: '鉴权码', // 在输入框下方的提示信息
        //     });
        // console.log('用户输入' + msg);
        // if (msg !== CODE_UNIT) {
        //     vscode.window.showErrorMessage('鉴权码失效');
        // } else {
        //     vscode.window.showInformationMessage('鉴权码成功');
        //     startServer();
        // }
    };
    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));

    // 关闭服务
    const commandStop = 'myExtension.stopServer';
    const commandStopHandler = async () => {
        let status = await vscode.window.showInformationMessage('是否关闭服务', 'Yes', 'No');
        if (status === 'Yes') {
            server.getServer.close(() => {
                config.runningStatus = false;
                vscode.window.createTreeView('ac_status', {
                    treeDataProvider: new DataProvider('服务127.0.0.1:3000,已关闭', 0),
                });
                vscode.window.showInformationMessage('服务已关闭');
            });
        } else {
            vscode.window.showInformationMessage('服务继续工作');
        }
    };
    context.subscriptions.push(vscode.commands.registerCommand(commandStop, commandStopHandler));

    // 选择代码生成路径，并设置一个文件夹名称
    const commandSelect = 'myExtension.selectFilePath';
    const commandSelectHandler = async (uri: any) => {
        // console.log('77777777', runningStatus);
        if (!config.runningStatus) {
            vscode.window.showInformationMessage('服务未启动');
            return;
        }
        if (uri) {
            console.log('----', uri.fsPath);
            console.log(uri.path);
            try {
                let stat = fs.lstatSync(uri.fsPath);
                if (stat.isDirectory()) {
                    // vscode.window.showInformationMessage('选择工作文件夹');
                    config.currentWorkPath = uri.fsPath;
                    let name = await vscode.window.showInputBox(
                        { // 这个对象中所有参数都是可选参数
                            password: false, // 输入内容是否是密码
                            ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
                            placeHolder: '生成代码文件夹名', // 在输入框内的提示信息
                            prompt: '文件夹名', // 在输入框下方的提示信息
                            validateInput: function (text) { return /^[A-Za-z]+$/.test(text) ? '' : text; } // 只能以字母为文件夹名
                        });
                    if (name) {
                        config.dirName = name;
                        vscode.window.createTreeView('ac_filepath', {
                            treeDataProvider: new DataProvider("路径:" + config.currentWorkPath + '\\' + config.dirName, 1),
                        });
                        server.getIo.of("/").emit("server status", { code: 200, msg: "准备就绪" });
                    } else {
                        config.currentWorkPath = '';
                        config.dirName = '';
                    }
                } else {
                    vscode.window.showInformationMessage('选择工作文件夹');
                }
                // console.log(`当前文件(夹)路径是：${uri}， ${stat.isDirectory()}`);
            } catch (err) {
                console.log('=========',);
                console.log(err);
                vscode.window.showInformationMessage('选择工作文件夹报错', err);
            }
        } else {
            vscode.window.showInformationMessage(`当前文件(夹)路径是：空`);
        }
    };
    context.subscriptions.push(vscode.commands.registerCommand(commandSelect, commandSelectHandler));

}

class TreeViewItem extends vscode.TreeItem {
    constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }
}

class DataProvider implements vscode.TreeDataProvider<TreeViewItem> {
    label: string;
    dataType: number;
    constructor(msg: string, type: number) {
        this.label = msg;
        this.dataType = type;
    }
    getTreeItem(element: TreeViewItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: TreeViewItem): vscode.ProviderResult<TreeViewItem[]> {
        let treeViews: Array<any> = [];
        let fix = new Date().getHours()
            + ':' + (new Date().getMinutes() <= 9 ? ('0' + new Date().getMinutes()) : new Date().getMinutes())
            + ':' + (new Date().getSeconds() <= 9 ? ('0' + new Date().getSeconds()) : new Date().getSeconds());
        let label = `(${fix})${this.label}`;
        if (this.dataType === 0) {
            statusList.unshift(new TreeViewItem(label));
            treeViews = statusList;
        } else {
            filePathList.unshift(new TreeViewItem(label));
            treeViews = filePathList;
        }
        // return Promise.resolve([
        //     new TreeViewItem(this.label),
        //     // new TreeViewItem('TreeItem-02'),
        //     // new TreeViewItem('TreeItem-03'),
        // ]);
        return Promise.resolve(treeViews);
    }
}



// this method is called when your extension is deactivated
export function deactivate() {
    config.runningStatus = false;
    server.stopServer();
    statusList = [];
    filePathList = [];
}

