const fs = require('fs');
const admZip = require('adm-zip');

/**
 *  写入文件内容
 * @param filePath 
 * @param content 
 * @returns 
 */
const writeFile = function (filePath: any, content: any) {
    return new Promise(function (resovle: any, reject: any) {

        fs.writeFile(filePath, content, function (err: any) {
            if (err) {
                //  console.log('写入文件失败')
                return reject(err);
            }
            resovle();
        });
    });
};
/**
 *  读取文件内容
 * @param filePath 
 * @returns 
 */
const readFile = function (filePath: any) {
    return new Promise(function (resovle, reject) {

        fs.readFile(filePath, function (err: any, data: any): any {
            if (err) {
                //  console.log('读取文件失败')
                return reject(err);
            }
            //  console.log('读取文件', data.toString())
            resovle(data.toString());
        });
    });
};

/**
 * 创建文件夹
 * @param filePath 
 * @returns 
 */
const createDir = function (filePath: any) {
    return new Promise(function (resovle: any, reject: any) {
        fs.exists(filePath, (exists: any) => {
            if (exists) {
                // console.log('存在')
                resovle(true);
            } else {
                fs.mkdir(filePath, function (err: any) {

                    if (err) {
                        console.error(err);
                        return resovle(false);
                    }
                    resovle(true);
                });
            }
        });
    });
};
/**
 *  生成压缩包
 * @param zipPath 
 * @param filePath 
 * @returns 
 */
const createZip = function (zipPath: any, filePath: any) {
    return new Promise(function (resovle: any, reject: any) {
        try {
            let zip = new admZip();
            zip.addLocalFolder(filePath);
            zip.writeZip(zipPath);
            resovle();
        } catch (e) {
            reject();
        }
    });
};

/**
 * 判断文件路径是否存在
 * @param filePath 
 * @returns 
 */
const checkFilePath = function (filePath: any) {
    return new Promise(function (resovle, reject) {
        fs.exists(filePath, (exists: any) => {
            if (exists) {
                resovle(true);
            } else {
                resovle(false);
            }
        });
    });
};
module.exports = {
    createDir,
    writeFile,
    readFile,
    createZip,
    checkFilePath,
};
