document.addEventListener('DOMContentLoaded', () => {
    const conversionData = [
        // { range: 1, c: 15.00, d: 17.00, a_thpt: 16.50, b_thpt: 19.80, a_dgnl: 504, b_dgnl: 595 },
        // { range: 2, c: 17.00, d: 19.00, a_thpt: 19.80, b_thpt: 21.80, a_dgnl: 595, b_dgnl: 701 },
        // { range: 3, c: 19.00, d: 22.60, a_thpt: 21.80, b_thpt: 25.50, a_dgnl: 701, b_dgnl: 872 },
        // { range: 4, c: 22.60, d: 25.50, a_thpt: 25.50, b_thpt: 27.50, a_dgnl: 872, b_dgnl: 969 },
        // { range: 5, c: 25.50, d: 28.50, a_thpt: 27.50, b_thpt: 28.50, a_dgnl: 969, b_dgnl: 1009 },
        // { range: 6, c: 28.50, d: 30.00, a_thpt: 28.50, b_thpt: 30.00, a_dgnl: 1009, b_dgnl: 1200 }

        // Dữ liệu từ bảng trong hình ảnh, đảm bảo độ chính xác
        { range: 1, c: 15.00, d: 17.00, a_thpt: 16.50, b_thpt: 19.80, a_dgnl: 504, b_dgnl: 595 },
        { range: 2, c: 17.00, d: 19.00, a_thpt: 19.80, b_thpt: 21.80, a_dgnl: 595, b_dgnl: 701 },
        { range: 3, c: 19.00, d: 22.60, a_thpt: 21.80, b_thpt: 25.50, a_dgnl: 701, b_dgnl: 872 },
        { range: 4, c: 22.60, d: 25.50, a_thpt: 25.50, b_thpt: 27.50, a_dgnl: 872, b_dgnl: 969 },
        { range: 5, c: 25.50, d: 28.50, a_thpt: 27.50, b_thpt: 28.50, a_dgnl: 969, b_dgnl: 1009 },
        { range: 6, c: 28.50, d: 30.00, a_thpt: 28.50, b_thpt: 30.00, a_dgnl: 1009, b_dgnl: 1200 }
    ];

    const tableBody = document.getElementById('conversionTableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const yourScoreInput = document.getElementById('yourScore');
    const scoreTypeSelect = document.getElementById('scoreType');
    const resultDiv = document.getElementById('result');

    // Hàm hiển thị bảng dữ liệu
    function renderTable() {
        tableBody.innerHTML = ''; // Xóa nội dung cũ
        conversionData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.range}</td>
                <td>${row.c.toFixed(2)}</td>
                <td>${row.d.toFixed(2)}</td>
                <td>${row.a_thpt.toFixed(2)}</td>
                <td>${row.b_thpt.toFixed(2)}</td>
                <td>${row.a_dgnl.toFixed(0)}</td>
                <td>${row.b_dgnl.toFixed(0)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Hàm tính toán điểm
    function calculateScore() {
        const x = parseFloat(yourScoreInput.value);
        const scoreType = scoreTypeSelect.value; // 'hocba' hoặc 'dgnl'

        if (isNaN(x) || x < 0) {
            resultDiv.innerHTML = 'Vui lòng nhập một số điểm hợp lệ.';
            resultDiv.classList.add('show');
            resultDiv.style.color = '#dc3545'; // Màu đỏ cho lỗi
            resultDiv.style.backgroundColor = '#f8d7da';
            resultDiv.style.borderColor = '#f5c6cb';
            return;
        }

        let foundRange = null;
        let a, b; // Biên của x
        let c, d; // Biên của y

        for (const row of conversionData) {
            if (scoreType === 'hocba') {
                a = row.a_thpt;
                b = row.b_thpt;
            } else { // dgnl
                a = row.a_dgnl;
                b = row.b_dgnl;
            }

            if (x >= a && x <= b) {
                foundRange = row;
                c = row.c;
                d = row.d;
                break;
            }
        }

        if (foundRange) {
            // Áp dụng công thức: y = c + ((x - a) / (b - a)) * (d - c)
            let y;
            if (b - a === 0) { // Trường hợp đặc biệt khi khoảng bằng 0 (a=b), tránh chia cho 0
                y = c; // Hoặc d, vì c và d sẽ bằng nhau trong trường hợp này
            } else {
                y = c + ((x - a) / (b - a)) * (d - c);
            }

            resultDiv.innerHTML = `Điểm quy đổi của bạn về thang THPT là: <strong>${y.toFixed(3)}</strong>`;
            resultDiv.classList.add('show');
            resultDiv.style.color = '#28a745'; // Màu xanh lá cho kết quả thành công
            resultDiv.style.backgroundColor = '#e9ffe9';
            resultDiv.style.borderColor = '#d4edda';
        } else {
            resultDiv.innerHTML = `Điểm ${x} của bạn nằm ngoài các khoảng quy đổi trong bảng. Vui lòng kiểm tra lại.`;
            resultDiv.classList.add('show');
            resultDiv.style.color = '#ffc107'; // Màu vàng cho cảnh báo
            resultDiv.style.backgroundColor = '#fff3cd';
            resultDiv.style.borderColor = '#ffeeba';
        }
    }

    // Gắn sự kiện cho nút tính toán
    calculateBtn.addEventListener('click', calculateScore);

    // Render bảng khi trang tải
    renderTable();
});