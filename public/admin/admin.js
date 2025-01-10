const itemList = document.getElementById("itemList");
const itemCountInput = document.getElementById("itemCount");
const generateItemsButton = document.getElementById("generateItems");
const saveButton = document.getElementById("saveToDatabase");

let items = [];

// Hàm lấy dữ liệu từ MongoDB và hiển thị
function loadItemsFromDatabase() {
    fetch('https://thadaco1.onrender.com/api/get_data')
        .then(response => response.json())
        .then(data => {
            items = data.items || [];
            itemList.innerHTML = ""; // Xóa danh sách hiện tại

            // Hiển thị các item từ cơ sở dữ liệu
            items.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                itemDiv.innerHTML = `
                    <label>ID: ${item.id}</label>
                    <input type="text" value="${item.value}" id="value_${item.id}" class="input" />
                    <input type="number" value="${item.count}" id="count_${item.id}" min="0" class="input" />
                `;
                itemList.appendChild(itemDiv);
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu từ MongoDB:', error);
        });
}

// Hàm tạo danh sách item mới
generateItemsButton.addEventListener("click", () => {
    const count = parseInt(itemCountInput.value);

    if (isNaN(count) || count <= 0) {
        alert("Vui lòng nhập số lượng item hợp lệ!");
        return;
    }

    // Reset danh sách items
    items = [];
    itemList.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        itemDiv.innerHTML = `
            <label>ID: ${i}</label>
            <input type="text" placeholder="Nhập giá trị item" id="value_${i}" class="input" />
            <input type="number" placeholder="Count" id="count_${i}" min="0" value="0" class="input" />
        `;
        itemList.appendChild(itemDiv);

        items.push({ id: i, value: "", count: 0 });
    }
});

// Hàm lưu vào MongoDB
saveButton.addEventListener("click", () => {
    items = items.map((item) => {
        const valueInput = document.getElementById(`value_${item.id}`);
        const countInput = document.getElementById(`count_${item.id}`);

        return {
            id: item.id,
            value: valueInput.value || "",
            count: parseInt(countInput.value) || 0,
        };
    });

    fetch('https://thadaco1.onrender.com/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: items }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dữ liệu đã được lưu vào MongoDB:', data.message);
            alert(data.message);
        })
        .catch(error => {
            console.error('Lỗi khi gửi dữ liệu:', error);
        });
});

// Gọi hàm loadItemsFromDatabase khi tải trang
document.addEventListener("DOMContentLoaded", loadItemsFromDatabase);
