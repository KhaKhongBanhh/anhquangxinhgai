let allQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answered = false;
let timerInterval = null;
let currentCorrectOption = ''; // Lưu đáp án đúng sau khi đảo
let currentShuffledAnswers = []; // Lưu mảng đáp án đã đảo

// Lấy cài đặt
const questionCount = parseInt(localStorage.getItem('practice_question_count')) || 10;
const timeLimit = parseInt(localStorage.getItem('practice_time')) || 0;
const shuffleAnswers = localStorage.getItem('practice_shuffle') === 'true';

// Load câu hỏi
fetch('questions.json')
    .then(res => res.json())
    .then(questions => {
        allQuestions = questions.slice(0, questionCount);
        startPractice();
    });

function startPractice() {
    // Khởi động timer nếu có giới hạn thời gian
    if (timeLimit > 0) {
        let remainingSeconds = timeLimit * 60;
        updateTimerDisplay(remainingSeconds);
        
        timerInterval = setInterval(() => {
            remainingSeconds--;
            updateTimerDisplay(remainingSeconds);
            
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                endPractice();
            }
        }, 1000);
    } else {
        document.getElementById('timer-display').textContent = 'Không giới hạn thời gian';
    }
    
    renderQuestion();
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer-display').textContent = 
        `Thời gian: ${minutes}:${secs.toString().padStart(2, '0')}`;
}

function renderQuestion() {
    if (currentQuestionIndex >= allQuestions.length) {
        endPractice();
        return;
    }
    
    const q = allQuestions[currentQuestionIndex];
    let answers = [...q.answers];
    
    // Đảo đáp án nếu được chọn
    if (shuffleAnswers) {
        answers = shuffleArray(answers);
    }
    
    // Lưu mảng đáp án đã đảo để sử dụng khi hiển thị kết quả
    currentShuffledAnswers = answers;
    
    // Tìm vị trí mới của đáp án đúng sau khi đảo
    const correctIndex = answers.findIndex(ans => ans.option === q.correct);
    const displayOptions = ['A', 'B', 'C', 'D'];
    currentCorrectOption = displayOptions[correctIndex];
    
    // Cập nhật tiến độ
    document.getElementById('progress-display').textContent = 
        `Câu ${currentQuestionIndex + 1}/${allQuestions.length}`;
    
    // Render câu hỏi với ABCD theo thứ tự, mỗi đáp án trên một dòng
    let html = `<p style="font-weight:bold; margin-bottom:16px;">${q.question}</p>`;
    answers.forEach((ans, index) => {
        const displayOption = displayOptions[index];
        html += `
            <label class="answer-option" style="display:block; margin-bottom:8px; cursor:pointer;">
                <input type="radio" name="answer" value="${displayOption}" style="margin-right:8px;">
                <strong>${displayOption}.</strong> ${ans.text}
            </label>
        `;
    });
    
    document.getElementById('question-container').innerHTML = html;
    document.getElementById('feedback-container').style.display = 'none';
    answered = false;
    
    // Xử lý nút tiếp theo
    document.getElementById('next-btn').onclick = handleNext;
    
    // Xử lý nút làm lại từ đầu
    document.getElementById('restart-btn').onclick = handleRestart;
}

function handleNext() {
    const selected = document.querySelector('input[name="answer"]:checked');
    
    if (!selected) {
        alert('Vui lòng chọn đáp án!');
        return;
    }
    
    if (!answered) {
        // Kiểm tra đáp án lần đầu
        answered = true;
        const feedback = document.getElementById('feedback-container');
        
        // So sánh với đáp án đúng sau khi đảo
        if (selected.value === currentCorrectOption) {
            correctCount++;
            feedback.style.backgroundColor = '#d4edda';
            feedback.style.color = '#155724';
            feedback.textContent = '✓ Chính xác!';
            feedback.style.display = 'block';
            
            // Tự động chuyển câu sau 1 giây
            setTimeout(() => {
                currentQuestionIndex++;
                renderQuestion();
            }, 1000);
        } else {
            feedback.style.backgroundColor = '#f8d7da';
            feedback.style.color = '#721c24';
            
            // Lấy nội dung đáp án đúng từ mảng đã đảo
            const displayOptions = ['A', 'B', 'C', 'D'];
            const correctIndex = displayOptions.indexOf(currentCorrectOption);
            const correctAnswerText = currentShuffledAnswers[correctIndex].text;
            
            feedback.innerHTML = `✗ Sai rồi!<br>Đáp án đúng: <strong>${currentCorrectOption}. ${correctAnswerText}</strong>`;
            feedback.style.display = 'block';
            
            // Không tự động chuyển, đợi người dùng bấm
            document.getElementById('next-btn').textContent = 'Câu tiếp theo';
        }
    } else {
        // Đã trả lời rồi, chuyển câu tiếp
        currentQuestionIndex++;
        renderQuestion();
        document.getElementById('next-btn').textContent = 'Câu tiếp theo';
    }
}

function handleRestart() {
    if (confirm('Bạn có chắc chắn muốn làm lại từ đầu? Tiến trình hiện tại sẽ bị mất.')) {
        // Reset các biến
        currentQuestionIndex = 0;
        correctCount = 0;
        answered = false;
        currentShuffledAnswers = [];
        
        // Dừng timer cũ nếu có
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Khởi động lại
        startPractice();
    }
}

function endPractice() {
    if (timerInterval) clearInterval(timerInterval);
    
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div style="text-align:center; padding:32px;">
            <h2>Kết quả ôn tập</h2>
            <p style="font-size:24px; margin:24px 0;">
                <strong>${correctCount}/${allQuestions.length}</strong> câu đúng
            </p>
            <p style="font-size:20px; color:#4CAF50;">
                Tỷ lệ: ${((correctCount/allQuestions.length)*100).toFixed(1)}%
            </p>
        </div>
    `;
    
    document.getElementById('feedback-container').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('back-home-btn').style.display = 'inline-block';
    document.getElementById('back-home-btn').onclick = () => {
        window.location.href = 'index.html';
    };
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
