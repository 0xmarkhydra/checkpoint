require('dotenv').config(); // Thêm dòng này ở đầu file

const axios = require('axios');
const { exec } = require('child_process');
const { Telegraf } = require('telegraf');
const fs = require('fs'); // Thêm dòng này để sử dụng fs
const path = require('path'); // Thêm dòng này để sử dụng path



const TOKEN = process.env.TOKEN

const DEVICE = process.env.DEVICE

const DEVICE_MODEL = process.env.DEVICE_MODEL

const SESSION = process.env.SESSION;

let userCurlMap = {};
const dataFilePath = path.join(__dirname, 'data.json'); // Đường dẫn đến file data.json

// Đọc dữ liệu từ file data.json
if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    userCurlMap = JSON.parse(data); // Phân tích cú pháp dữ liệu từ file
} else {
    userCurlMap = {}; // Nếu file không tồn tại, khởi tạo là {}
}

// Hàm cập nhật userCurlMap vào file data.json
function updateUserCurlMap() {
    console.log('updateUserCurlMap');
    fs.writeFileSync(dataFilePath, JSON.stringify(userCurlMap, null, 2)); // Ghi dữ liệu vào file
}

// Gọi hàm mỗi phút để kiểm tra thời gian và cập nhật userCurlMap
setInterval(() => {
    updateUserCurlMap(); // Cập nhật userCurlMap vào file
}, 60 * 1000); // 1 phút = 60

const data = {
    method: '1',
    hash: '3a6f41b0a70e527b3bd6b79423bf4cd8'
}

async function diemDanh_cURL(cUrl, callback = () => { }) {
    cUrl = cUrl.replace(/--proxy\s+[^\s]+/, '');
    let status = false;

    // Chuyển exec thành một Promise để sử dụng await
    status = await new Promise((resolve) => {
        exec(cUrl, (error, stdout, stderr) => {
            if (error) {
                console.error('Lỗi khi gọi cURL:', error);
                resolve(false); // Trả về false nếu có lỗi
                return;
            }

            try {
                const jsonResponse = JSON.parse(stdout); // Phân tích cú pháp kết quả trả về
                console.log('Kết quả từ cURL (dưới dạng JSON):', jsonResponse);
                callback(jsonResponse);
                resolve(jsonResponse.success); // Trả về true nếu thành công
            } catch (parseError) {
                console.error('Lỗi khi phân tích cú pháp JSON:', parseError);
                console.log('Kết quả trả về:', stdout); // In ra kết quả nếu không phải JSON
                callback('ERROR');
                resolve(false); // Trả về false nếu có lỗi phân tích cú pháp
            }
        });
    });

    return status; // Trả về status
}

// Gọi hàm mỗi giờ
const diemDanhTimes = [
    ['12:00', '13:29', '19:00'],
];

const _callback = (ctx, txt = 'Đã cập nhật cURL. Đang thực hiện yêu cầu...') => {
    ctx.reply(JSON.stringify(txt, null, 2)); // Gửi JSON với định dạng đẹp
}

// Hàm kiểm tra thời gian hiện tại và gọi hàm điểm danh
let calledIndexMap = {}; // Đối tượng lưu trữ calledIndex cho từng chatId
let lastCalledDateMap = {}; // Đối tượng lưu trữ lastCalledDate cho từng chatId
let scheduleMap = {}; // Đối tượng lưu trữ schedule cho từng chatId

async function checkDiemDanh(chatId, cUrl) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    console.log(`--------------------[checkDiemDanh]-[${currentTime}]------------------`)

    // Kiểm tra xem ngày đã thay đổi chưa
    if (!lastCalledDateMap[chatId] || now.getDate() !== lastCalledDateMap[chatId]) {
        calledIndexMap[chatId] = -1; // Đặt lại chỉ số khi ngày thay đổi
        lastCalledDateMap[chatId] = now.getDate(); // Cập nhật ngày hiện tại
    }

    console.log('chatId: ', chatId);
    console.log('currentTime: ', currentTime);
    console.log('calledIndex: ', calledIndexMap[chatId]);
    console.log('lastCalledDate: ', lastCalledDateMap[chatId]);

    // Chọn ngẫu nhiên một mảng thời gian từ diemDanhTimes nếu chưa gọi trong ngày
    if (calledIndexMap[chatId] === -1) {
        calledIndexMap[chatId] = Math.floor(Math.random() * diemDanhTimes.length);
    }

    const randomTimes = diemDanhTimes[calledIndexMap[chatId]];
    console.log('randomTimes: ', randomTimes);

    if (randomTimes.includes(currentTime)) {
        const status = await diemDanh_cURL(cUrl); // Gọi hàm điểm danh
        
        if (randomTimes.includes('19:00')) {
            delete userCurlMap[chatId]; // Xóa cURL của người dùng
            bot.telegram.sendMessage(chatId, `Đã xóa cURL của bạn!`); // Gửi tin nhắn đến người dùng
            if (status) {
                bot.telegram.sendMessage(chatId, `Điểm danh thành công và đã xoá cURL: ${currentTime} \n ${JSON.stringify(randomTimes, null, 2)}`); // Gửi tin nhắn đến người dùng
            } else {
                bot.telegram.sendMessage(chatId, `không thành công: ${currentTime} \n[Token hết hạn]`); // Gửi tin nhắn đến người dùng
            }
        } else {
            if (status) {
                bot.telegram.sendMessage(chatId, `Điểm danh thành công: ${currentTime} \n ${JSON.stringify(randomTimes, null, 2)}`); // Gửi tin nhắn đến người dùng
            } else {
                bot.telegram.sendMessage(chatId, `không thành công: ${currentTime} \n[Token hết hạn]`); // Gửi tin nhắn đến người dùng
            }
        }
    }
}

async function callListCheckDiemDanh() {
    const arr = Object.keys(userCurlMap);
    for (let chatId of arr) {
        checkDiemDanh(chatId, userCurlMap[chatId]); // Gọi hàm điểm danh
    }
}

// Gọi hàm mỗi phút để kiểm tra thời gian
setInterval(callListCheckDiemDanh, 60 * 1000); // 1 phút = 60
callListCheckDiemDanh();


const bot = new Telegraf(process.env.BOT_TOKEN); // Thay thế BOT_TOKEN bằng token của bot Telegram của bạn

bot.on('text', (ctx) => {
    const userId = ctx.from.id; // Lấy userId của người dùng
    const userMessage = ctx.message.text; // Lấy tin nhắn từ người dùng

    if (ctx.message.text.startsWith('/checkin')) {
        if(!userCurlMap[userId]) {
            ctx.reply('Bạn chưa có data trong hệ thống.');
        }
        // Gọi hàm điểm danh
        checkDiemDanh(userId, userCurlMap[userId]); // Gọi hàm điểm danh
        diemDanh_cURL(userCurlMap[userId], (txt) => _callback(ctx, txt)); // Gọi hàm diemDanh_cURL và trả về JSON cho người dùng
    } else if (ctx.message.text.startsWith('curl')) {
        // Cập nhật cURL cho người dùng
        userCurlMap[userId] = userMessage;
        cUrl = ctx.message.text; // Cập nhật cURL với văn bản người dùng gửi
        if (userCurlMap[userId]) {
            ctx.reply('Đã cập nhật cURL. Đang thực đợi yêu cầu...');
        }
        // sau 1s sent
        setTimeout(() => {
            // ctx.reply('Menu: \n - /checkin: điểm danh \n - /delete: xóa đặt lịch \n - /schedule: tự đặt lịch'); // Phản hồi cho người dùng
            ctx.reply('Menu: \n - /checkin: điểm danh \n - /delete: xóa đặt lịch \n'); // Phản hồi cho người dùng
        }, 1000); // 1s
    } else if(ctx.message.text.startsWith('/delete')) {
        delete userCurlMap[userId]; // Xóa cURL của người dùng
        ctx.reply('Đã xóa cURL của bạn!'); // Phản hồi cho người dùng
    } else {
        ctx.reply('Menu: \n - /checkin: điểm danh \n - /delete: xóa đặt lịch'); // Phản hồi cho người dùng
    }
});

// Khởi động bot
bot.launch().then(() => {
    console.log('Bot đang chạy...');
});