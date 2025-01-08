
```bash
npm init -y
```

### Bước 2: Chạy ứng dụng bằng PM2

1. Cài đặt `pm2` toàn cầu:

```bash
npm install pm2 -g
```

2. Chạy ứng dụng của bạn bằng `pm2`:

```bash
pm2 start index.js --name diem-danh
```

3. Đảm bảo rằng script của bạn sẽ tự động chạy lại khi hệ thống khởi động:

```bash
pm2 startup
pm2 save
```

### Bước 3: Giám sát script

Bạn có thể theo dõi log để kiểm tra trạng thái của script bằng cách chạy lệnh:

```bash
pm2 logs diem-danh
```

Khi bạn cần cập nhật mã nguồn cho ứng dụng Node.js đang chạy bằng PM2, bạn có thể thực hiện các bước sau để áp dụng thay đổi mà không cần dừng ứng dụng lâu:

### Các bước để cập nhật mã nguồn với PM2

1. **Chỉnh sửa mã nguồn**: Bạn có thể cập nhật các thay đổi vào tệp `index.js` hoặc các tệp khác trong dự án của bạn.

2. **Tải lại ứng dụng**: Sau khi bạn đã chỉnh sửa mã nguồn, hãy sử dụng lệnh sau để tải lại ứng dụng mà không làm gián đoạn dịch vụ:

```bash
pm2 reload diem-danh
```

Lệnh này sẽ tải lại ứng dụng mà không dừng nó hoàn toàn, đảm bảo uptime cao nhất có thể.

3. **Xem lại log**: Sau khi tải lại ứng dụng, bạn có thể kiểm tra log để xem ứng dụng hoạt động bình thường hay không:

```bash
pm2 logs diem-danh
```

4. **Lưu trạng thái PM2 (tùy chọn)**: Nếu bạn đã thay đổi cấu hình PM2 (ví dụ thêm hoặc xoá các ứng dụng), hãy lưu lại trạng thái để PM2 có thể tự động khôi phục sau khi hệ thống khởi động lại:

```bash
pm2 save
```

### Trong trường hợp cần khởi động lại hoàn toàn:

Nếu bạn cần khởi động lại ứng dụng từ đầu (ví dụ khi có thay đổi quan trọng hoặc cần làm sạch bộ nhớ), bạn có thể sử dụng lệnh sau:

```bash
pm2 restart diem-danh
```

Lệnh này sẽ khởi động lại ứng dụng của bạn hoàn toàn.

```bash
 chmod +x *.sh
```
Cấp quyền cho các lệnh sh