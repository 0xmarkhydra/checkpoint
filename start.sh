#!/bin/bash

# Khởi động ứng dụng index.js với pm2
pm2 start index.js --name diem-danh

# Thiết lập PM2 để tự khởi động các ứng dụng khi máy tính khởi động lại
pm2 startup