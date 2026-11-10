// ========================================================
// AZOTA PREMIUM EXAM ENGINE (NO ANTI-CHEAT, HIGH PERFORMANCE)
// ========================================================
window.ExamEngine = (function() {

    let state = {
        exam: null,
        mode: "exam", // 'exam' (thi thử) | 'practice' (luyện tập)
        layout: "single", // 'single' (lướt từng câu) | 'list' (cuộn toàn bộ)
        currentIndex: 0,
        questions: [],
        userAnswers: {}, // { [qId]: answer }
        flags: {}, // { [qId]: true/false }
        timeRemaining: 0,
        totalDurationSeconds: 0,
        timerInterval: null,
        isSubmitted: false,
        startTime: null,
        endTime: null,
        shuffleQuestions: false,
        shuffleOptions: false
    };

    function startExam(examData, mode = "exam", customConfig = {}) {
        clearInterval(state.timerInterval);

        state.exam = JSON.parse(JSON.stringify(examData));
        state.mode = mode;
        state.layout = customConfig.layout || "single";
        state.currentIndex = 0;
        state.userAnswers = {};
        state.flags = {};
        state.isSubmitted = false;
        state.startTime = new Date();
        state.endTime = null;
        state.shuffleQuestions = !!customConfig.shuffleQuestions;
        state.shuffleOptions = !!customConfig.shuffleOptions;

        // Clone questions
        let qs = JSON.parse(JSON.stringify(state.exam.questions));

        // Shuffle questions if requested
        if (state.shuffleQuestions) {
            qs = shuffleArray(qs);
        }

        // Shuffle options if requested
        if (state.shuffleOptions) {
            qs.forEach(q => {
                if ((q.type === "mcq" || !q.type) && Array.isArray(q.options) && q.options.length >= 2) {
                    const letters = ["A", "B", "C", "D", "E", "F"];
                    let correctText = "";
                    if (typeof q.correct_index === "number" && q.options[q.correct_index] !== undefined) {
                        correctText = q.options[q.correct_index];
                    } else if (q.correct && letters.indexOf(q.correct) !== -1) {
                        correctText = q.options[letters.indexOf(q.correct)];
                    }
                    if (correctText) {
                        q.options = shuffleArray([...q.options]);
                        const newCorrectIdx = q.options.indexOf(correctText);
                        if (newCorrectIdx !== -1) {
                            q.correct_index = newCorrectIdx;
                            q.correct = letters[newCorrectIdx] || "A";
                        }
                    }
                }
            });
        }

        state.questions = qs;

        // Configure Duration
        const durationMin = customConfig.duration || state.exam.duration || 45;
        if (durationMin === -1 || customConfig.unlimitedTime) {
            state.totalDurationSeconds = 0;
            state.timeRemaining = 0;
        } else {
            state.totalDurationSeconds = durationMin * 60;
            state.timeRemaining = state.totalDurationSeconds;
            if (state.mode === "exam") {
                startTimer();
            }
        }

        renderExamView();
        setupKeyboardShortcuts();
        saveInProgress();
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function startTimer() {
        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            if (state.timeRemaining > 0) {
                state.timeRemaining--;
                updateTimerUI();
                if (state.timeRemaining % 10 === 0) {
                    saveInProgress();
                }
            } else {
                clearInterval(state.timerInterval);
                submitExam(true);
            }
        }, 1000);
        updateTimerUI();
    }

    function updateTimerUI() {
        const timerEl = document.getElementById("examTimer");
        if (!timerEl) return;

        if (state.totalDurationSeconds === 0) {
            timerEl.textContent = "∞ Không giới hạn";
            return;
        }

        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.textContent = formatted;

        if (state.timeRemaining <= 300) {
            timerEl.className = "font-mono font-black text-lg text-rose-500 animate-pulse";
        } else {
            timerEl.className = "font-mono font-black text-lg text-sky-500 dark:text-sky-400";
        }
    }

    function selectMCQAnswer(qId, selectedOption) {
        if (state.isSubmitted) return;

        state.userAnswers[qId] = selectedOption;
        window.AudioHelper.playClick();

        const q = state.questions.find(item => item.id === qId);

        if (state.mode === "practice" && q) {
            const isCorrect = (selectedOption === q.correct);
            if (isCorrect) {
                window.AudioHelper.playCorrect();
            } else {
                window.AudioHelper.playIncorrect();
            }
        }

        updateQuestionCardUI(qId);

        updatePaletteButton(qId);
        updateProgressUI();
        saveInProgress();
    }

    function selectTFAnswer(qId, subLetter, answerVal) {
        if (state.isSubmitted) return;

        if (!state.userAnswers[qId] || typeof state.userAnswers[qId] !== 'object') {
            state.userAnswers[qId] = {};
        }
        state.userAnswers[qId][subLetter] = answerVal;
        window.AudioHelper.playClick();

        updateTFCardUI(qId);

        updatePaletteButton(qId);
        updateProgressUI();
        saveInProgress();
    }

    function toggleFlag(qId) {
        state.flags[qId] = !state.flags[qId];
        window.AudioHelper.playClick();

        updateQuestionCardUI(qId);
        updatePaletteButton(qId);
    }

    function goToQuestion(index) {
        if (index < 0 || index >= state.questions.length) return;
        state.currentIndex = index;

        if (state.layout === "single") {
            renderSingleQuestion(true);
        } else {
            const target = document.getElementById(`q-card-${state.questions[index].id}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add("ring-2", "ring-sky-500");
                setTimeout(() => target.classList.remove("ring-2", "ring-sky-500"), 1200);
            }
        }
        updatePaletteActive();
        saveInProgress();
    }

    function updateQuestionCardUI(qId) {
        const card = document.getElementById(`q-card-${qId}`);
        if (!card) return;

        const q = state.questions.find(item => item.id === qId);
        if (!q) return;

        if (q.type === "mcq") {
            const selected = state.userAnswers[qId];
            const isPractice = (state.mode === "practice");
            const letters = ["A", "B", "C", "D"];

            card.querySelectorAll(".exam-opt-clean, .opt-button").forEach((btn, idx) => {
                const letter = letters[idx];
                const isUserChoice = (selected === letter);
                const isCorrect = (q.correct === letter);

                btn.classList.remove("selected", "practice-correct", "practice-wrong");
                if (isPractice && selected) {
                    if (isCorrect) {
                        btn.classList.add("practice-correct");
                    } else if (isUserChoice) {
                        btn.classList.add("practice-wrong");
                    }
                } else if (isUserChoice) {
                    btn.classList.add("selected");
                }
            });

            // If practice mode, reveal explanation smoothly without DOM recreation
            const explainBox = card.querySelector(`#explain-box-${qId}`);
            if (explainBox && isPractice && selected) {
                explainBox.classList.remove("hidden");
            }

            // Update flag button inside this card if present
            const flagBtn = card.querySelector(".card-flag-btn");
            if (flagBtn) {
                const isFlagged = !!state.flags[qId];
                flagBtn.innerHTML = `<span>${isFlagged ? '★' : '☆'}</span> <span>${isFlagged ? 'Đã gắn cờ' : 'Gắn cờ (F)'}</span>`;
                if (isFlagged) {
                    flagBtn.className = "card-flag-btn text-xs font-bold px-3 py-1.5 rounded-xl transition-all bg-amber-500/20 text-amber-400 border border-amber-500/40";
                } else {
                    flagBtn.className = "card-flag-btn text-xs font-bold px-3 py-1.5 rounded-xl transition-all bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10";
                }
            }
        }
    }

    function updateTFCardUI(qId) {
        const card = document.getElementById(`q-card-${qId}`);
        if (!card) return;
        const userTF = state.userAnswers[qId] || {};
        card.querySelectorAll("[data-sub-letter]").forEach(btn => {
            const sub = btn.getAttribute("data-sub-letter");
            const val = btn.getAttribute("data-tf-val");
            if (userTF[sub] === val) {
                btn.classList.add("ring-2", val === "Đ" ? "bg-sky-600" : "bg-rose-600", "text-white");
            } else {
                btn.classList.remove("ring-2", "bg-sky-600", "bg-rose-600", "text-white");
            }
        });
    }

    function nextQuestion() {
        if (state.currentIndex < state.questions.length - 1) {
            goToQuestion(state.currentIndex + 1);
        }
    }

    function prevQuestion() {
        if (state.currentIndex > 0) {
            goToQuestion(state.currentIndex - 1);
        }
    }

    function toggleLayout() {
        state.layout = (state.layout === "single") ? "list" : "single";
        renderExamView();
        window.AudioHelper.playClick();
    }

    function updatePaletteActive() {
        state.questions.forEach((q, idx) => {
            const btn = document.getElementById(`palette-btn-${q.id}`);
            if (!btn) return;
            if (idx === state.currentIndex) {
                btn.classList.add("current-q");
            } else {
                btn.classList.remove("current-q");
            }
        });
    }

    function updatePaletteButton(qId) {
        const btn = document.getElementById(`palette-btn-${qId}`);
        if (!btn) return;

        const isAnswered = isQuestionAnswered(qId);
        const isFlagged = !!state.flags[qId];
        const qIndex = state.questions.findIndex(item => item.id === qId);
        const isCurrent = (qIndex === state.currentIndex);

        btn.className = "palette-btn-v2";
        if (isAnswered) btn.classList.add("answered");
        if (isFlagged) btn.classList.add("flagged");
        if (isCurrent) btn.classList.add("current-q");
    }

    function isQuestionAnswered(qId) {
        const ans = state.userAnswers[qId];
        if (!ans) return false;
        if (typeof ans === "string") return ans.trim().length > 0;
        if (typeof ans === "object") {
            return Object.keys(ans).length > 0;
        }
        return false;
    }

    function inputEssayAnswer(qId, val) {
        if (state.isSubmitted) return;
        state.userAnswers[qId] = val;
        updatePaletteButton(qId);
        updateProgressUI();
        saveInProgress();
    }

    function updateProgressUI() {
        const answeredCount = state.questions.filter(q => isQuestionAnswered(q.id)).length;
        const total = state.questions.length;
        const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

        const countEl = document.getElementById("answeredCountText");
        const ratioEl = document.getElementById("answeredCountRatio");
        const barEl = document.getElementById("answeredProgressBar");
        if (countEl) countEl.textContent = `Đã làm ${answeredCount}/${total} câu (${percent}%)`;
        if (ratioEl) ratioEl.textContent = `${answeredCount} / ${total} (${percent}%)`;
        if (barEl) barEl.style.width = `${percent}%`;
    }

    function setupKeyboardShortcuts() {
        document.removeEventListener("keydown", handleKeydown);
        document.addEventListener("keydown", handleKeydown);
    }

    function handleKeydown(e) {
        if (state.isSubmitted || document.getElementById("examView").classList.contains("hidden")) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toUpperCase();
        const currentQ = state.questions[state.currentIndex];

        if (["A", "B", "C", "D"].includes(key) && currentQ && currentQ.type === "mcq") {
            selectMCQAnswer(currentQ.id, key);
        } else if (key === "F" && currentQ) {
            toggleFlag(currentQ.id);
        } else if (e.key === "ArrowRight") {
            nextQuestion();
        } else if (e.key === "ArrowLeft") {
            prevQuestion();
        }
    }

    function submitExam(force = false) {
        if (state.isSubmitted) return;

        if (!force) {
            const unanswered = state.questions.filter(q => !isQuestionAnswered(q.id)).length;
            if (unanswered > 0) {
                const confirmed = confirm(`Bạn còn ${unanswered} câu hỏi CHƯA LÀM! Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?`);
                if (!confirmed) return;
            } else {
                const confirmed = confirm("Bạn đã hoàn thành tất cả các câu hỏi. Bạn có chắc chắn muốn nộp bài?");
                if (!confirmed) return;
            }
        }

        clearInterval(state.timerInterval);
        state.isSubmitted = true;
        state.endTime = new Date();

        const result = gradeExam();
        // Mistakes are no longer automatically dumped into notebook; user manually reviews & bookmarks them
        saveAttemptToHistory(result);
        localStorage.removeItem("azota_in_progress");

        if (result.score >= 8.0) {
            window.AudioHelper.playSuccessFanfare();
            if (window.confetti) {
                window.confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
            }
        } else {
            window.AudioHelper.playClick();
        }

        window.AzotaApp.showResultView(result);
    }

    function gradeExam() {
        let totalScore = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        const totalQuestions = state.questions.length;
        const pointsPerQuestion = totalQuestions > 0 ? (10.0 / totalQuestions) : 0;
        const mistakeQuestions = [];
        const questionResults = [];

        state.questions.forEach((q) => {
            if (q.type === "mcq") {
                const userAns = state.userAnswers[q.id];
                if (!userAns) {
                    skippedCount++;
                    mistakeQuestions.push({ ...q, userAns: null, correctAns: q.correct });
                    questionResults.push({ id: q.id, status: "skipped", userAns: null, correctAns: q.correct, earned: 0 });
                } else if (userAns === q.correct) {
                    correctCount++;
                    totalScore += pointsPerQuestion;
                    questionResults.push({ id: q.id, status: "correct", userAns: userAns, correctAns: q.correct, earned: pointsPerQuestion });
                } else {
                    incorrectCount++;
                    mistakeQuestions.push({ ...q, userAns: userAns, correctAns: q.correct });
                    questionResults.push({ id: q.id, status: "incorrect", userAns: userAns, correctAns: q.correct, earned: 0 });
                }
            } else if (q.type === "true_false") {
                const userTF = state.userAnswers[q.id] || {};
                let correctSubCount = 0;
                let subTotal = (q.items || []).length;
                
                (q.items || []).forEach(sub => {
                    const ans = userTF[sub.sub];
                    if (ans && ans === sub.ans) {
                        correctSubCount++;
                    }
                });

                let ratio = 0;
                if (correctSubCount === 1) ratio = 0.1;
                else if (correctSubCount === 2) ratio = 0.25;
                else if (correctSubCount === 3) ratio = 0.5;
                else if (correctSubCount === 4) ratio = 1.0;

                const earnedPoints = pointsPerQuestion * ratio;
                totalScore += earnedPoints;

                if (correctSubCount === subTotal) {
                    correctCount++;
                    questionResults.push({ id: q.id, status: "correct", userAns: userTF, correctSubCount, earned: earnedPoints });
                } else {
                    incorrectCount++;
                    mistakeQuestions.push({ ...q, userAns: userTF, correctSubCount });
                    questionResults.push({ id: q.id, status: "partial", userAns: userTF, correctSubCount, earned: earnedPoints });
                }
            } else if (q.type === "essay") {
                const userAns = (state.userAnswers[q.id] || "").trim();
                if (!userAns) {
                    skippedCount++;
                    mistakeQuestions.push({ ...q, userAns: null });
                    questionResults.push({ id: q.id, status: "skipped", userAns: "", earned: 0 });
                } else {
                    const normAns = userAns.toLowerCase();
                    let matchedCount = 0;
                    (q.criteria || []).forEach(crit => {
                        const hasKw = (crit.keywords || []).some(kw => normAns.includes(kw.toLowerCase()));
                        if (hasKw) matchedCount++;
                    });
                    const ratio = (q.criteria && q.criteria.length > 0) ? (matchedCount / q.criteria.length) : (normAns.length > 25 ? 0.8 : 0.3);
                    const earned = pointsPerQuestion * ratio;
                    totalScore += earned;
                    if (ratio >= 0.7) {
                        correctCount++;
                        questionResults.push({ id: q.id, status: "correct", userAns: userAns, earned: earned });
                    } else {
                        incorrectCount++;
                        mistakeQuestions.push({ ...q, userAns: userAns });
                        questionResults.push({ id: q.id, status: "partial", userAns: userAns, earned: earned });
                    }
                }
            }
        });

        const finalScore = Math.min(10.0, Math.round(totalScore * 100) / 100);
        const timeSpentSec = Math.max(1, Math.round((new Date() - state.startTime) / 1000));

        return {
            examId: state.exam.id,
            examTitle: state.exam.title,
            subject: state.exam.subject,
            grade: state.exam.grade,
            mode: state.mode,
            score: finalScore,
            totalQuestions,
            correctCount,
            incorrectCount,
            skippedCount,
            timeSpentSeconds: timeSpentSec,
            date: new Date().toISOString(),
            mistakeQuestions,
            questionResults,
            examQuestions: state.questions,
            userAnswers: state.userAnswers
        };
    }

    function saveMistakesToNotebook(newMistakes) {
        if (!newMistakes || newMistakes.length === 0) return;
        let notebook = [];
        try {
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {
            notebook = [];
        }
        newMistakes.forEach(m => {
            const exists = notebook.some(item => item.id === m.id && item.subject === (m.subject || state.exam.subject));
            if (!exists) {
                notebook.unshift({
                    ...m,
                    examTitle: state.exam.title,
                    subject: state.exam.subject,
                    addedAt: new Date().toISOString()
                });
            }
        });
        localStorage.setItem("azota_mistake_notebook", JSON.stringify(notebook));
    }

    function saveAttemptToHistory(result) {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
        } catch (e) {
            history = [];
        }
        history.unshift(result);
        localStorage.setItem("azota_exam_history", JSON.stringify(history));
    }

    function saveInProgress() {
        if (state.isSubmitted || !state.exam) return;
        const payload = {
            exam: state.exam,
            mode: state.mode,
            layout: state.layout,
            currentIndex: state.currentIndex,
            questions: state.questions,
            userAnswers: state.userAnswers,
            flags: state.flags,
            timeRemaining: state.timeRemaining,
            totalDurationSeconds: state.totalDurationSeconds,
            startTime: state.startTime
        };
        localStorage.setItem("azota_in_progress", JSON.stringify(payload));
    }

    function restoreInProgress() {
        try {
            const raw = localStorage.getItem("azota_in_progress");
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function renderExamView() {
        const container = document.getElementById("examQuestionsList");
        const paletteContainer = document.getElementById("questionPalette");
        if (!container || !paletteContainer) return;

        container.innerHTML = "";
        paletteContainer.innerHTML = "";

        // Header info
        const titleEl = document.getElementById("examHeaderTitle");
        const badgeEl = document.getElementById("examHeaderBadge");
        const layoutBtn = document.getElementById("toggleLayoutBtn");

        if (titleEl) titleEl.textContent = state.exam.title;
        if (state.exam && state.exam.id === 'ta-unit4-vocab-40') {
            const existingCheatBtn = document.getElementById("examVocabCheatBtn");
            if (!existingCheatBtn && titleEl && titleEl.parentElement) {
                const btn = document.createElement("button");
                btn.id = "examVocabCheatBtn";
                btn.type = "button";
                btn.onclick = () => window.AzotaApp && window.AzotaApp.openUnit4VocabCheatSheet && window.AzotaApp.openUnit4VocabCheatSheet();
                btn.className = "px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/35 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95";
                btn.innerHTML = "<span>📖</span><span>Bảng 40 Từ Vựng Gốc</span>";
                titleEl.parentElement.appendChild(btn);
            }
        }
        if (badgeEl) {
            badgeEl.textContent = `${state.exam.subject} • ${state.mode === 'exam' ? 'Thi Thử' : 'Luyện Tập'}`;
            badgeEl.className = state.mode === 'exam' 
                ? "px-3 py-1 rounded-full text-xs font-black bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                : "px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
        }
        if (layoutBtn) {
            layoutBtn.innerHTML = state.layout === "single" 
                ? `<span>📜</span> <span class="hidden sm:inline">Toàn Bộ Đề</span>` 
                : `<span>👁️</span> <span class="hidden sm:inline">Lướt Từng Câu</span>`;
        }

        // Render palette buttons (support 100 questions cleanly)
        state.questions.forEach((q, idx) => {
            const pBtn = document.createElement("button");
            pBtn.id = `palette-btn-${q.id}`;
            pBtn.className = "palette-btn-v2";
            pBtn.textContent = idx + 1;
            pBtn.onclick = () => goToQuestion(idx);
            paletteContainer.appendChild(pBtn);
            updatePaletteButton(q.id);
        });

        if (state.layout === "single") {
            renderSingleQuestion(true);
        } else {
            renderFullListQuestions();
        }

        updatePaletteActive();
        updateProgressUI();
    }

    function renderSingleQuestion(animate = true) {
        const container = document.getElementById("examQuestionsList");
        if (!container) return;
        container.innerHTML = "";

        const q = state.questions[state.currentIndex];
        if (!q) return;

        const qNum = state.currentIndex + 1;
        const total = state.questions.length;

        const card = document.createElement("div");
        card.id = `q-card-${q.id}`;
        card.className = `exam-clean-card p-6 sm:p-8 relative transition-all duration-300 ${animate ? 'card-slide-in' : ''}`;

        let innerContent = "";
        if (q.type === "mcq") {
            innerContent = buildSingleMCQHTML(q, qNum, total);
        } else if (q.type === "true_false") {
            innerContent = buildSingleTFHTML(q, qNum, total);
        } else if (q.type === "essay") {
            innerContent = buildSingleEssayHTML(q, qNum, total);
        }

        card.innerHTML = innerContent;
        container.appendChild(card);

        if (window.renderMathInElement) {
            window.renderMathInElement(card, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    function buildSingleMCQHTML(q, qNum, total) {
        const letters = ["A", "B", "C", "D"];
        const selected = state.userAnswers[q.id];
        const isPractice = (state.mode === "practice");
        const isFlagged = !!state.flags[q.id];

        let stimulusHTML = "";
        if (q.stimulus) {
            stimulusHTML = `
                <div class="mb-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm leading-relaxed text-slate-200">
                    ${q.stimulus}
                </div>
            `;
        }

        let optionsHTML = "";
        letters.forEach((letter, idx) => {
            const optText = q.options[idx] || "";
            const isUserChoice = (selected === letter);
            const isCorrect = (q.correct === letter);

            let optClass = "exam-opt-clean";
            if (isPractice && selected) {
                if (isCorrect) {
                    optClass += " practice-correct";
                } else if (isUserChoice) {
                    optClass += " practice-wrong";
                }
            } else if (isUserChoice) {
                optClass += " selected";
            }

            optionsHTML += `
                <button type="button" onclick="ExamEngine.selectMCQAnswer(${q.id}, '${letter}')" class="${optClass} min-w-0">
                    <span class="exam-opt-letter shrink-0">${letter}</span>
                    <span class="flex-1 min-w-0 break-words font-medium leading-snug text-left">${optText}</span>
                    <span class="text-xs text-slate-500 font-mono hidden sm:inline shrink-0">[${letter}]</span>
                    <span class="exam-opt-check shrink-0">✓</span>
                </button>
            `;
        });

        const showExplain = isPractice && selected;

        return `
            <!-- Top Card Header (Exact reference Fig 2) -->
            <div class="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
                <div class="flex items-center gap-2.5">
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-400/30">
                        CÂU ${qNum} / ${total}
                    </span>
                    <span class="text-xs text-slate-400 hidden sm:inline-block">Nhấn phím [A] [B] [C] [D] hoặc click chọn</span>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="ExamEngine.toggleFlag(${q.id})" class="card-flag-btn text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${isFlagged ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}">
                        <span>${isFlagged ? '★' : '☆'}</span>
                        <span class="hidden sm:inline-block">${isFlagged ? 'Đã gắn cờ' : 'Gắn cờ'}</span>
                        <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">(F)</span>
                    </button>
                </div>
            </div>

            ${stimulusHTML}

            <!-- Question Text -->
            <div class="text-base sm:text-lg lg:text-xl text-white font-extrabold leading-relaxed mb-6">
                ${q.question}
            </div>

            <!-- 2x2 Options Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-7">
                ${optionsHTML}
            </div>

            <!-- Explanation box (Practice mode) -->
            ${isPractice ? `
                <div id="explain-box-${q.id}" class="${showExplain ? '' : 'hidden'} mt-4 p-4.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 text-xs sm:text-sm explain-box-anim">
                    <div class="font-black flex items-center gap-2 text-emerald-400 mb-1.5">
                        <span class="text-base">💡</span> <span>Phân Tích & Lời Giải Chi Tiết:</span>
                    </div>
                    <div class="leading-relaxed font-medium">${q.explain || 'Xem lại kiến thức trọng tâm bài học.'}</div>
                </div>
            ` : ''}

            <!-- Bottom Navigation buttons -->
            <div class="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-white/10">
                <button type="button" onclick="ExamEngine.prevQuestion()" ${state.currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-white/10"'} class="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white/5 text-slate-300 border border-white/10 transition-all flex items-center gap-2">
                    <span>←</span> Câu trước <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">(←)</span>
                </button>

                <div class="flex items-center gap-2.5">
                    ${qNum === total ? `
                        <button type="button" onclick="ExamEngine.submitExam()" class="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg transition-all cursor-pointer flex items-center gap-2">
                            <span>✓</span> Nộp bài thi
                        </button>
                    ` : `
                        <button type="button" onclick="ExamEngine.nextQuestion()" class="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer flex items-center gap-2">
                            <span>Câu tiếp theo</span> <span>→</span> <span class="text-[10px] text-sky-200 font-mono hidden sm:inline">(→)</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    function buildSingleTFHTML(q, qNum, total) {
        const items = q.items || [];
        const userTF = state.userAnswers[q.id] || {};
        const isFlagged = state.flags[q.id];

        let subHTML = "";
        items.forEach(sub => {
            const userChoice = userTF[sub.sub];
            subHTML += `
                <div class="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 flex-1">
                        <strong class="text-sky-500 font-black mr-2">${sub.sub})</strong> ${sub.text}
                    </div>
                    <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <button type="button" onclick="ExamEngine.selectTFAnswer(${q.id}, '${sub.sub}', 'Đ')" class="px-4 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${userChoice === 'Đ' ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'}">
                            ĐÚNG
                        </button>
                        <button type="button" onclick="ExamEngine.selectTFAnswer(${q.id}, '${sub.sub}', 'S')" class="px-4 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${userChoice === 'S' ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'}">
                            SAI
                        </button>
                    </div>
                </div>
            `;
        });

        return `
            <div class="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <span class="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    CÂU ${qNum} / ${total} (Đúng / Sai 4 ý)
                </span>
                <button type="button" onclick="ExamEngine.toggleFlag(${q.id})" class="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${isFlagged ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                    🚩 Đánh dấu xem lại
                </button>
            </div>
            <div class="text-lg sm:text-xl text-slate-900 dark:text-white font-bold mb-5">${q.question}</div>
            <div class="space-y-3 mb-6">${subHTML}</div>
            <div class="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button type="button" onclick="ExamEngine.prevQuestion()" ${state.currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="cursor-pointer"'} class="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    ← Câu trước
                </button>
                <button type="button" onclick="ExamEngine.nextQuestion()" class="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-sky-600 text-white">
                    Câu tiếp theo →
                </button>
            </div>
        `;
    }

    function buildSingleEssayHTML(q, qNum, total) {
        const userAns = state.userAnswers[q.id] || "";
        const isFlagged = state.flags[q.id];
        const isPractice = (state.mode === "practice");

        return `
            <div class="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <div class="flex items-center gap-2">
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        CÂU ${qNum} / ${total} (Tự Luận Trọng Tâm)
                    </span>
                    <span class="text-xs text-slate-400">Yêu cầu: ${q.target_points || 4} ý</span>
                </div>
                <button type="button" onclick="ExamEngine.toggleFlag(${q.id})" class="text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${isFlagged ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                    <span>🚩</span> ${isFlagged ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
                </button>
            </div>

            <div class="text-lg sm:text-xl text-slate-900 dark:text-white font-extrabold mb-4 leading-snug">
                ${q.question}
            </div>

            <div class="mb-4">
                <label class="block text-xs font-bold text-slate-400 mb-1.5">Bài làm tự luận của bạn:</label>
                <textarea oninput="ExamEngine.inputEssayAnswer(${q.id}, this.value)" rows="6" placeholder="Gõ câu trả lời của bạn vào đây..." class="w-full p-4 rounded-2xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans">${userAns}</textarea>
            </div>

            ${isPractice ? `
                <div class="p-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-slate-200 space-y-2 mb-4">
                    <div class="font-black text-emerald-400 flex items-center gap-1.5">
                        <span>💡</span> ĐÁP ÁN CHUẨN & BAREM ĐIỂM:
                    </div>
                    <div class="text-slate-300 leading-relaxed">${q.full_answer_html || q.full_answer}</div>
                    <div class="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 text-amber-300 text-xs font-medium">
                        ${q.mnemonic || ''}
                    </div>
                </div>
            ` : ''}

            <div class="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button type="button" onclick="ExamEngine.prevQuestion()" ${state.currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"'} class="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2">
                    <span>←</span> Câu trước
                </button>
                <div class="flex items-center gap-2">
                    ${qNum === total ? `
                        <button type="button" onclick="ExamEngine.submitExam()" class="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all cursor-pointer">
                            Nộp bài thi 📤
                        </button>
                    ` : `
                        <button type="button" onclick="ExamEngine.nextQuestion()" class="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/25 transition-all cursor-pointer flex items-center gap-2">
                            Câu tiếp theo <span>→</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    function renderFullListQuestions() {
        const container = document.getElementById("examQuestionsList");
        if (!container) return;
        container.innerHTML = "";

        state.questions.forEach((q, idx) => {
            const qNum = idx + 1;
            const card = document.createElement("div");
            card.id = `q-card-${q.id}`;
            card.className = "exam-clean-card p-6 sm:p-7 relative mb-5 transition-all";

            if (q.type === "mcq") {
                const letters = ["A", "B", "C", "D"];
                const selected = state.userAnswers[q.id];
                const isPractice = (state.mode === "practice");
                const isFlagged = !!state.flags[q.id];

                let optsHTML = "";
                letters.forEach((letter, i) => {
                    const isSelected = (selected === letter);
                    const isCorrect = (q.correct === letter);

                    let optClass = "exam-opt-clean";
                    if (isPractice && selected) {
                        if (isCorrect) optClass += " practice-correct";
                        else if (isSelected) optClass += " practice-wrong";
                    } else if (isSelected) {
                        optClass += " selected";
                    }

                    optsHTML += `
                        <button type="button" onclick="ExamEngine.selectMCQAnswer(${q.id}, '${letter}')" class="${optClass} min-w-0">
                            <span class="exam-opt-letter shrink-0">${letter}</span>
                            <span class="flex-1 min-w-0 break-words font-medium leading-snug text-left">${q.options[i]}</span>
                            <span class="text-xs text-slate-500 font-mono hidden sm:inline shrink-0">[${letter}]</span>
                            <span class="exam-opt-check shrink-0">✓</span>
                        </button>
                    `;
                });

                card.innerHTML = `
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-400/30">
                            CÂU ${qNum} / ${state.questions.length}
                        </span>
                        <button type="button" onclick="ExamEngine.toggleFlag(${q.id})" class="card-flag-btn text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${isFlagged ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40' : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'}">
                            <span>${isFlagged ? '★' : '☆'}</span> <span>${isFlagged ? 'Đã gắn cờ' : 'Gắn cờ (F)'}</span>
                        </button>
                    </div>
                    <div class="text-base sm:text-lg text-white font-extrabold mb-5">${q.question}</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">${optsHTML}</div>
                `;
            } else if (q.type === "true_false") {
                card.innerHTML = buildSingleTFHTML(q, qNum, state.questions.length);
            } else if (q.type === "essay") {
                card.innerHTML = buildSingleEssayHTML(q, qNum, state.questions.length);
            }

            container.appendChild(card);
        });

        if (window.renderMathInElement) {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    function resumeExam() {
        const inProgress = restoreInProgress();
        if (!inProgress || !inProgress.exam || !inProgress.questions || !inProgress.questions.length) {
            return false;
        }

        // Restore all active session properties exactly as user left off
        state.exam = inProgress.exam;
        state.mode = inProgress.mode || "exam";
        state.layout = inProgress.layout || "single";
        state.questions = inProgress.questions;
        state.userAnswers = inProgress.userAnswers || {};
        state.flags = inProgress.flags || {};
        state.totalDurationSeconds = inProgress.totalDurationSeconds || 900;
        state.timeRemaining = (typeof inProgress.timeRemaining === "number") ? inProgress.timeRemaining : state.totalDurationSeconds;
        state.startTime = inProgress.startTime || Date.now();
        state.isSubmitted = false;
        state.currentIndex = (typeof inProgress.currentIndex === "number" && inProgress.currentIndex >= 0 && inProgress.currentIndex < state.questions.length)
            ? inProgress.currentIndex
            : 0;

        renderExamHeader();
        renderExamView();

        // Direct restoration to the exact question user was on!
        goToQuestion(state.currentIndex);

        // Refresh all palette items (answered, flagged, current)
        state.questions.forEach((q) => {
            updatePaletteButton(q.id);
        });
        updatePaletteActive();

        // Restart ticking clock if time remains
        clearInterval(state.timerInterval);
        startTimer();

        // Hide resume banner
        const resumeBanner = document.getElementById("resumeExamBanner");
        if (resumeBanner) resumeBanner.classList.add("hidden");

        return true;
    }

    return {
        startExam: startExam,
        resumeExam: resumeExam,
        selectMCQAnswer: selectMCQAnswer,
        selectTFAnswer: selectTFAnswer,
        inputEssayAnswer: inputEssayAnswer,
        toggleFlag: toggleFlag,
        goToQuestion: goToQuestion,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        toggleLayout: toggleLayout,
        submitExam: submitExam,
        restoreInProgress: restoreInProgress,
        getState: () => state
    };
})();
