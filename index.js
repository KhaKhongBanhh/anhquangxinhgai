document.getElementById('start-exam-btn').onclick = function() {
    fetch('questions.json')
        .then(res => res.json())
        .then(questions => {
            // Hiện modal
            const modal = document.getElementById('exam-modal');
            const countInput = document.getElementById('question-count');
            const timeInput = document.getElementById('exam-time');
            modal.style.display = 'flex';
            countInput.value = questions.length;
            countInput.max = questions.length;
            timeInput.value = 15; // mặc định 15 phút

            // Bắt đầu thi
            document.getElementById('exam-ok-btn').onclick = function() {
                let n = parseInt(countInput.value);
                let t = parseInt(timeInput.value);
                if (isNaN(n) || n < 1 || n > questions.length) {
                    alert('Số lượng câu hỏi không hợp lệ!');
                    return;
                }
                if (isNaN(t) || t < 1) {
                    alert('Thời gian không hợp lệ!');
                    return;
                }
                localStorage.setItem('exam_question_count', n);
                localStorage.setItem('exam_time', t);
                modal.style.display = 'none';
                window.location.href = 'exam.html';
            };

            // Hủy modal
            document.getElementById('exam-cancel-btn').onclick = function() {
                modal.style.display = 'none';
            };
        });
};

// Xử lý nút ôn tập
document.getElementById('start-practice-btn').onclick = function() {
    fetch('questions.json')
        .then(res => res.json())
        .then(questions => {
            const modal = document.getElementById('practice-modal');
            const countInput = document.getElementById('practice-question-count');
            const timeInput = document.getElementById('practice-time');
            const shuffleCheck = document.getElementById('practice-shuffle');
            
            modal.style.display = 'flex';
            countInput.value = questions.length;
            countInput.max = questions.length;

            document.getElementById('practice-ok-btn').onclick = function() {
                let n = parseInt(countInput.value);
                let t = parseInt(timeInput.value);
                let shuffle = shuffleCheck.checked;
                
                if (isNaN(n) || n < 1 || n > questions.length) {
                    alert('Số lượng câu hỏi không hợp lệ!');
                    return;
                }
                if (isNaN(t) || t < 0) {
                    alert('Thời gian không hợp lệ!');
                    return;
                }
                
                localStorage.setItem('practice_question_count', n);
                localStorage.setItem('practice_time', t);
                localStorage.setItem('practice_shuffle', shuffle);
                modal.style.display = 'none';
                window.location.href = 'practice.html';
            };

            document.getElementById('practice-cancel-btn').onclick = function() {
                modal.style.display = 'none';
            };
        });
};