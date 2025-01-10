const squaresContainer = document.getElementById("squaresContainer");
const logContainer = document.getElementById("logContainer"); // Khu vực log kết quả

// Lấy phần tử modal và nút đóng
const popup = document.getElementById("popup");
const closePopupButton = document.getElementById("close-popup");
const popupMessage = document.getElementById("popup-message");

// Hàm để hiển thị modal popup
function showPopup(message) {
    popupMessage.textContent = message;  // Cập nhật thông điệp trong popup
    popup.style.display = "block";  // Hiển thị modal
}

// Hàm để đóng modal khi người dùng nhấn nút đóng
closePopupButton.addEventListener("click", function () {
    popup.style.display = "none";  // Ẩn modal
});

// Lấy dữ liệu từ API (MongoDB)
fetch('https://thadaco1.onrender.com/api/get_data')  // Đảm bảo backend của bạn có API này
    .then(response => response.json())
    .then(data => {
        let items = data.items || [];  // Gán dữ liệu items từ API

        // Kiểm tra xem có dữ liệu không
        if (items.length === 0) {
            squaresContainer.innerHTML = "<p>Không có dữ liệu. Quay lại trang trước để thêm item!</p>";
        } else {
            // Tạo danh sách các phần tử dựa trên count
            const randomOrder = [];
            items.forEach(item => {
                for (let i = 0; i < item.count; i++) {
                    randomOrder.push(item);
                }
            });

            // Xáo trộn thứ tự ban đầu để tăng tính ngẫu nhiên
            randomOrder.sort(() => Math.random() - 0.5);

            // Hiển thị các ô vuông
            items.forEach(item => {
                const square = document.createElement("div");
                square.classList.add("square");
                square.id = `item_${item.id}`;
                square.textContent = item.value;
                squaresContainer.appendChild(square);
            });

            // Tạo danh sách các phần tử đã xuất hiện
            const pickedItems = {};
            let isSpinning = false; // Biến trạng thái theo dõi vòng quay
            let spinCount = 0; // Đếm số lần xoay
            const totalSpins = randomOrder.length;

            // Mảng các màu sắc ngẫu nhiên
            const colors = ["red", "blue", "green", "orange", "purple"];

            // Tạo đối tượng âm thanh
            const randomSound = new Audio('sound/random.mp3');
            const winnerSound = new Audio('sound/winner.mp3');
            window.spinWheel = function () {
                console.log("Bắt đầu quay");

                // Nếu đang quay thì không cho quay nữa
                if (isSpinning) {
                    console.log("Đang quay...");
                    showPopup("Đang quay, vui lòng chờ...");
                    return;
                }

                if (spinCount >= totalSpins) {
                    console.log("Đã xoay đủ lượt");
                    showPopup("Đã xoay đủ lượt!");
                    return;
                }

                // Reset âm thanh trước khi quay
                randomSound.loop = true;  // Đảm bảo âm thanh lặp lại
                randomSound.currentTime = 0;  // Đặt lại thời gian phát âm thanh về 0
                randomSound.play();  // Phát âm thanh quay

                isSpinning = true; // Đánh dấu trạng thái đang quay
                const lights = document.querySelectorAll(".square");
                let currentIndex = 0;

                // Lựa chọn ngẫu nhiên từ các phần tử chưa hết số lần
                const availableItems = randomOrder.filter(item => {
                    pickedItems[item.id] = pickedItems[item.id] || 0;
                    return pickedItems[item.id] < item.count;
                });

                // Nếu không còn mục tiêu nào hợp lệ
                if (availableItems.length === 0) {
                    console.log("Không còn mục tiêu hợp lệ");
                    showPopup("Đã xoay đủ lượt!");
                    return;
                }

                // Xáo trộn lại các phần tử khả dụng để đảm bảo ngẫu nhiên
                const targetItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                pickedItems[targetItem.id]++;

                const targetId = `item_${targetItem.id}`;
                let rounds = 0;

                const interval = setInterval(() => {
                    // Reset màu tất cả các ô
                    lights.forEach(light => light.style.backgroundColor = "");

                    // Gán màu ngẫu nhiên cho ô hiện tại
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    lights[currentIndex].style.backgroundColor = randomColor;

                    // Kiểm tra nếu dừng đúng vị trí
                    if (rounds >= 4 && lights[currentIndex].id === targetId) {
                        clearInterval(interval);
                        spinCount++;

                        // Đợi 1 giây rồi hiển thị thông báo "Đã quay trúng"
                        setTimeout(() => {
                            // Phát âm thanh thông báo người trúng giải
                            winnerSound.play();
                            showPopup(`Chúc mừng! Trúng "${targetItem.value}"`);
                        }, 1000); // 1s delay

                        // Sau 500ms nữa, log kết quả vào bảng xếp hạng
                        setTimeout(() => {
                            const logEntry = document.createElement("p");
                            logEntry.textContent = `Lần ${spinCount}: Trúng "${targetItem.value}"`;
                            logContainer.appendChild(logEntry);
                        }, 1500); // 1.5s delay tính từ lúc quay dừng

                        // Dừng âm thanh quay sau khi kết thúc
                        randomSound.loop = false;  // Dừng vòng lặp âm thanh
                        randomSound.pause();  // Tạm dừng âm thanh quay

                        isSpinning = false; // Đặt trạng thái thành đã hoàn tất

                        // Kết thúc trò chơi nếu đủ lượt
                        if (spinCount === totalSpins) {
                            console.log("Kết thúc trò chơi");
                            setTimeout(() => {
                                showPopup("Kết thúc trò chơi!");
                            }, 2000); // Hiển thị sau một khoảng ngắn để đảm bảo đèn dừng hẳn
                        }
                    } else {
                        // Di chuyển sang ô tiếp theo
                        currentIndex = (currentIndex + 1) % lights.length;

                        // Khi vòng lặp hoàn tất
                        if (currentIndex === 0) {
                            rounds++;
                        }
                    }
                }, 200);
            };
        }
    })
    .catch(error => {
        console.error('Lỗi khi lấy dữ liệu:', error);
    });
