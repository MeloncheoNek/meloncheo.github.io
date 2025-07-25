document.addEventListener('DOMContentLoaded', () => {
    // --- Elements for Complex Calculator (New) ---
    const monChinhInput = document.getElementById('monChinh');
    const monPhu1Input = document.getElementById('monPhu1');
    const monPhu2Input = document.getElementById('monPhu2');
    const priorityAreaRadios = document.querySelectorAll('input[name="priorityArea"]');
    const schoolBonusCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const isEnglishMajorCheckbox = document.getElementById('isEnglishMajor');
    const ieltsScoreContainer = document.getElementById('ieltsScoreContainer');
    const ieltsScoreInput = document.getElementById('ieltsScore');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultBox = document.getElementById('resultBox');

    // --- Elements for Simple Converter (Old) ---
    const simpleScoreTypeSelect = document.getElementById('simpleScoreType');
    const simpleYourScoreInput = document.getElementById('simpleYourScore');
    const simpleCalculateBtn = document.getElementById('simpleCalculateBtn');
    const simpleResultBox = document.getElementById('simpleResultBox'); // Corrected ID
    const conversionTableBody = document.getElementById('conversionTableBody');

    // --- Data for Simple Converter Table ---
    const conversionData = [
        { range: 1, c: 15.00, d: 17.00, a_thpt: 16.50, b_thpt: 19.80, a_dgnl: 504, b_dgnl: 595 },
        { range: 2, c: 17.00, d: 19.00, a_thpt: 19.80, b_thpt: 21.80, a_dgnl: 595, b_dgnl: 701 },
        { range: 3, c: 19.00, d: 22.60, a_thpt: 21.80, b_thpt: 25.50, a_dgnl: 701, b_dgnl: 872 },
        { range: 4, c: 22.60, d: 25.50, a_thpt: 25.50, b_thpt: 27.50, a_dgnl: 872, b_dgnl: 969 },
        { range: 5, c: 25.50, d: 28.50, a_thpt: 27.50, b_thpt: 28.50, a_dgnl: 969, b_dgnl: 1009 },
        { range: 6, c: 28.50, d: 30.00, a_thpt: 28.50, b_thpt: 30.00, a_dgnl: 1009, b_dgnl: 1200 }
    ];

    // --- Functions for Complex Calculator ---

    // Initial state: hide IELTS input if checkbox is not checked
    if (!isEnglishMajorCheckbox.checked) {
        ieltsScoreContainer.classList.remove('show');
        ieltsScoreInput.removeAttribute('required');
    }

    // Event listener for English major checkbox to show/hide IELTS input
    isEnglishMajorCheckbox.addEventListener('change', () => {
        if (isEnglishMajorCheckbox.checked) {
            ieltsScoreContainer.classList.add('show');
            ieltsScoreInput.setAttribute('required', 'true');
        } else {
            ieltsScoreContainer.classList.remove('show');
            ieltsScoreInput.removeAttribute('required');
            ieltsScoreInput.value = ''; // Clear IELTS score when unchecked
        }
    });

    // Main calculation function for complex calculator
    function calculateTotalScore() {
        // Reset result box styling
        resultBox.classList.remove('show', 'error', 'warning');
        resultBox.innerHTML = '';

        // 1. Get subject scores and validate
        const monChinh = parseFloat(monChinhInput.value);
        const monPhu1 = parseFloat(monPhu1Input.value);
        const monPhu2 = parseFloat(monPhu2Input.value);

        if (isNaN(monChinh) || isNaN(monPhu1) || isNaN(monPhu2) ||
            monChinh < 0 || monChinh > 10 ||
            monPhu1 < 0 || monPhu1 > 10 ||
            monPhu2 < 0 || monPhu2 > 10) {
            resultBox.innerHTML = 'Vui lòng nhập điểm môn học hợp lệ (từ 0 đến 10).';
            resultBox.classList.add('show', 'error');
            return;
        }

        // Calculate base score (điểm học bạ)
        const baseScore = (monChinh * 2) + monPhu1 + monPhu2; // This is the sum of (main * 2 + sub1 + sub2)

        // 2. Calculate priority score (điểm ưu tiên)
        let diemUuTien = 0;
        let priorityFactor = 0;

        for (const radio of priorityAreaRadios) {
            if (radio.checked) {
                switch (radio.value) {
                    case 'khuVuc2':
                        priorityFactor = 0.25;
                        break;
                    case 'khuVuc1':
                        priorityFactor = 0.75;
                        break;
                    case 'khuVuc2NongThon':
                        priorityFactor = 0.5;
                        break;
                }
                break;
            }
        }

        // Apply priority score formula based on baseScore (sum of main*2 + sub1 + sub2)
        // The formula provided was: (30 - điểm bạn đó đã từ 22,5 trở lên) * khu vực / 7,5
        // "điểm bạn đó đã từ 22,5 trở lên" refers to the total score before adding priority/bonus.
        // Assuming "điểm bạn đó đã từ 22,5 trở lên" refers to the baseScore * 0.75
        const scoreBeforePriorityAdjustment = baseScore * 0.75;

        if (scoreBeforePriorityAdjustment < 22.5) {
            diemUuTien = priorityFactor;
        } else {
            diemUuTien = (30 - scoreBeforePriorityAdjustment) * priorityFactor / 7.5;
            // Ensure priority score doesn't become negative
            diemUuTien = Math.max(0, diemUuTien); // Use Math.max to ensure it's not negative
        }

        // 3. Calculate school bonus points (điểm cộng trường)
        let diemCongTruong = 0;
        const schoolBonusMap = {
            'truongChuyenNangKhieu': 1.0,
            'truongUuTien': 0.8,
            'giaiHSGQuocGiaNhatNhiBa': 1.2,
            'giaiHSGQuocGiaKhuyenKhich': 1.0,
            'giaiKHKTQuocGiaGiaiTu': 1.0,
            'giaiHSGTinhNhat': 0.8,
            'giaiHSGTinhNhi': 0.7,
            'giaiHSGTinhBa': 0.6,
            'giaiKHKTTinhNhat': 0.7,
            'giaiKHKTTinhNhi': 0.6,
            'giaiKHKTTinhBa': 0.5
        };

        for (const checkbox of schoolBonusCheckboxes) {
            if (checkbox.checked && schoolBonusMap[checkbox.id]) {
                diemCongTruong += schoolBonusMap[checkbox.id];
            }
        }

        // 4. Calculate IELTS bonus points (điểm cộng IELTS)
        let diemCongIELTS = 0;
        if (isEnglishMajorCheckbox.checked) {
            const ieltsScore = parseFloat(ieltsScoreInput.value);

            if (isNaN(ieltsScore) || ieltsScore < 0 || ieltsScore > 9) {
                resultBox.innerHTML = 'Vui lòng nhập điểm IELTS hợp lệ (từ 0 đến 9).';
                resultBox.classList.add('show', 'error');
                return;
            }

            // Mapping IELTS to bonus points based on TOEFL iBT table provided
            if (ieltsScore >= 7.0) {
                diemCongIELTS = 1.0;
            } else if (ieltsScore >= 6.5) {
                diemCongIELTS = 0.9;
            } else if (ieltsScore >= 6.0) {
                diemCongIELTS = 0.8;
            } else if (ieltsScore >= 5.5) {
                diemCongIELTS = 0.7;
            } else if (ieltsScore >= 5.0) {
                diemCongIELTS = 0.6;
            } else if (ieltsScore >= 4.5) {
                diemCongIELTS = 0.5;
            } else {
                diemCongIELTS = 0; // Below 4.5, no bonus
            }
        }

        // 5. Calculate final score
        // Công thức: (môn chính x2 + môn phụ 1 + môn phụ 2) * 0,75 + điểm ưu tiên + điểm trường cộng + điểm cộng IELTS
        const finalScore = (baseScore * 0.75) + diemUuTien + diemCongTruong + diemCongIELTS;

        // Display result
        resultBox.innerHTML = `Điểm của bạn sau khi tính theo công thức của trường là: <strong>${finalScore.toFixed(3)}</strong>`;
        resultBox.classList.add('show');
    }

    // Attach event listener to the calculate button for complex calculator
    calculateBtn.addEventListener('click', calculateTotalScore);


    // --- Functions for Simple Converter ---

    // Function to render the conversion table
    function renderConversionTable() {
        conversionTableBody.innerHTML = ''; // Clear old content
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
            conversionTableBody.appendChild(tr);
        });
    }

    // Function to calculate simple conversion
    function calculateSimpleConversion() {
        simpleResultBox.classList.remove('show', 'error', 'warning');
        simpleResultBox.innerHTML = '';

        const x = parseFloat(simpleYourScoreInput.value);
        const scoreType = simpleScoreTypeSelect.value; // 'hocba' hoặc 'dgnl'

        if (isNaN(x) || x < 0) {
            simpleResultBox.innerHTML = 'Vui lòng nhập một số điểm hợp lệ.';
            simpleResultBox.classList.add('show', 'error');
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

            simpleResultBox.innerHTML = `Điểm quy đổi của bạn về thang THPT là: <strong>${y.toFixed(3)}</strong>`;
            simpleResultBox.classList.add('show');
            simpleResultBox.style.color = '#28a745'; // Màu xanh lá cho kết quả thành công
            simpleResultBox.style.backgroundColor = '#e9ffe9';
            simpleResultBox.style.borderColor = '#d4edda';
        } else {
            simpleResultBox.innerHTML = `Điểm ${x} của bạn nằm ngoài các khoảng quy đổi trong bảng. Vui lòng kiểm tra lại.`;
            simpleResultBox.classList.add('show', 'warning');
            simpleResultBox.style.color = '#856404'; // Màu vàng cho cảnh báo
            simpleResultBox.style.backgroundColor = '#fff3cd';
            simpleResultBox.style.borderColor = '#ffeeba';
        }
    }

    // Attach event listener to the calculate button for simple converter
    simpleCalculateBtn.addEventListener('click', calculateSimpleConversion);

    // Render the conversion table when the page loads
    renderConversionTable();
});
