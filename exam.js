let timerInterval;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

document.addEventListener('DOMContentLoaded', function () {
    let examMinutes = parseInt(localStorage.getItem('exam_time') || '15');
    let totalSeconds = examMinutes * 60;

    // Xử lý lưu thời điểm bắt đầu
    if (!localStorage.getItem('exam_start_time')) {
        localStorage.setItem('exam_start_time', Date.now());
    }
    const startTime = parseInt(localStorage.getItem('exam_start_time'));
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    totalSeconds = Math.max(totalSeconds - elapsed, 0);

    const timerDiv = document.getElementById('countdown-timer');

    function updateTimer() {
        let m = Math.floor(totalSeconds / 60);
        let s = totalSeconds % 60;
        timerDiv.textContent = `Thời gian còn lại: ${m}:${s.toString().padStart(2, '0')}`;
    }

    let questionsData = [];

    function showResult(score, total, wrongList) {
        let modal = document.createElement('div');
        modal.style = "display:flex;position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;align-items:center;justify-content:center;";
        modal.innerHTML = `
            <div style="background:#fff;padding:24px 32px;border-radius:8px;box-shadow:0 2px 8px #0002;text-align:center;min-width:260px;">
                <p style="font-size:20px;margin-bottom:16px;">Bạn đúng ${score} / ${total} câu!</p>
                <button id="view-wrong-btn" style="padding:8px 24px;margin-bottom:12px;background:#ff9800;color:#fff;border:none;border-radius:4px;font-size:16px;cursor:pointer;">Xem câu sai</button>
                <p id="countdown-text" style="font-size:16px;"></p>
            </div>
        `;
        document.body.appendChild(modal);

        // Nút xem câu sai
        modal.querySelector('#view-wrong-btn').onclick = function() {
            localStorage.setItem('wrong_questions', JSON.stringify(wrongList));
            window.open('wrong.html', '_blank');
        };

        let countdown = 5;
        const countdownText = modal.querySelector('#countdown-text');
        countdownText.textContent = `Quay về trang chủ sau ${countdown} giây...`;
        const timer = setInterval(() => {
            countdown--;
            countdownText.textContent = `Quay về trang chủ sau ${countdown} giây...`;
            if (countdown === 0) {
                clearInterval(timer);
                window.location.href = 'index.html';
            }
        }, 1000);

        localStorage.removeItem('exam_start_time');
    }

    // Sửa autoSubmitAndShowScore để truyền danh sách câu sai
    function autoSubmitAndShowScore() {
        let score = 0;
        let wrongList = [];
        for (let i = 1; i <= questionsData.length; i++) {
            const selected = document.querySelector(`input[name="answer${i}"]:checked`);
            const q = questionsData[i - 1];
            // So sánh trực tiếp value với q.correct
            if (selected && selected.value === q.correct) {
                score++;
            } else {
                wrongList.push({
                    index: i,
                    question: q.question,
                    answers: q.answers,
                    correct: q.correct,
                    selected: selected ? selected.value : null
                });
            }
        }
        showResult(score, questionsData.length, wrongList);
    }

    updateTimer();
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateTimer();
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerDiv.textContent = "Hết giờ!";
            autoSubmitAndShowScore();
        }
    }, 1000);

    fetch('questions.json')
        .then(res => res.json())
        .then(questions => {
            let n = parseInt(localStorage.getItem('exam_question_count') || questions.length);
            if (n > questions.length) n = questions.length;

            shuffleArray(questions);
            questions = questions.slice(0, n);
            questions.forEach(q => shuffleArray(q.answers));
            questionsData = questions;

            const container = document.getElementById('questions-container');
            container.innerHTML = questions.map((q, idx) => {
                const optionLabels = ['A', 'B', 'C', 'D'];
                return `
                    <div id="question${idx + 1}">
                        <p><strong>Câu ${idx + 1}:</strong> ${q.question}</p>
                        ${q.answers.map((ans, i) => `
                            <label>
                                <input type="radio" name="answer${idx + 1}" value="${ans.option}"> ${optionLabels[i]}. ${ans.text}
                            </label><br>
                        `).join('')}
                        <span class="flag-link" data-flag="${idx + 1}" style="">
                            🚩 Đánh dấu câu này
                        </span>
                    </div>
                `;
            }).join('');

            const btnsDiv = document.getElementById('question-buttons');
            btnsDiv.innerHTML = '';
            for (let i = 1; i <= questions.length; i++) {
                const btn = document.createElement('button');
                btn.className = 'question-btn';
                btn.id = `btn${i}`;
                btn.textContent = `Câu ${i}`;
                btnsDiv.appendChild(btn);
            }

            setupEvents(questions.length);
        });

    // Nút nộp bài + modal xác nhận
    const submitBtn = document.getElementById('submit-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    if (submitBtn && confirmModal && confirmYes && confirmNo) {
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            confirmModal.style.display = 'flex';
        });

        confirmYes.addEventListener('click', function () {
            confirmModal.style.display = 'none';
            clearInterval(timerInterval);
            autoSubmitAndShowScore();
        });

        confirmNo.addEventListener('click', function () {
            confirmModal.style.display = 'none';
        });
    }
});

function setupEvents(totalQuestions) {
    function updateProgress() {
        let answered = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            if (document.querySelector(`input[name="answer${i}"]:checked`)) {
                answered++;
            }
        }
        document.getElementById('progress-text').textContent = `${answered} / ${totalQuestions} câu đã làm`;
        document.getElementById('progress-bar').style.width = `${(answered / totalQuestions) * 100}%`;
    }

    for (let i = 1; i <= totalQuestions; i++) {
        const radios = document.querySelectorAll(`input[name="answer${i}"]`);
        const btn = document.getElementById(`btn${i}`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                const selected = document.querySelector(`input[name="answer${i}"]:checked`);
                if (selected) {
                    btn.classList.add('answered');
                    btn.classList.remove('flagged');
                } else {
                    btn.classList.remove('answered');
                }
                updateProgress();
            });
        });

        btn.addEventListener('click', function () {
            const questionDiv = document.getElementById(`question${i}`);
            if (questionDiv) {
                questionDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    document.querySelectorAll('.flag-link').forEach(flag => {
        flag.addEventListener('click', function () {
            const idx = this.getAttribute('data-flag');
            const btn = document.getElementById(`btn${idx}`);
            btn.classList.add('flagged');
            btn.classList.remove('answered');
            updateProgress();
        });
    });

    updateProgress();
}
