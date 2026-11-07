// ========================================================
// AZOTA ESSAY STUDY ENGINE (CHẾ ĐỘ HỌC TỰ LUẬN SIÊU TỐC - MÔN ĐỊA)
// Includes:
// 1. 🗂️ 3D Flip Flashcards with Keywords Highlight
// 2. 🧩 Interactive Cloze Deletion (Che khuyết từ khóa - Active Recall)
// 3. ✍️ Smart AI Keyword Grader (Tự viết & Chấm điểm barem tự động)
// 4. 📊 Chart Identification Master Guide (Bí kíp nhận dạng biểu đồ)
// 5. 🔊 Vietnamese Text-to-Speech (Đọc to bằng giọng nói)
// 6. 🖨️ Clean Printable Cheat Sheet
// ========================================================

window.EssayEngine = (function() {

    let state = {
        exam: null,
        questions: [],
        currentIndex: 0,
        subMode: "flashcard", // 'flashcard' | 'cloze' | 'write' | 'chart'
        isFlipped: false,
        mastery: {}, // { [qId]: 'mastered' | 'review' }
        clozeRevealed: {}, // { [qId]: { [blankKey]: true/false } }
        userDrafts: {}, // { [qId]: text }
        gradingResults: {}, // { [qId]: resultObject }
        isSpeechPlaying: false
    };

    function init(examData) {
        if (!examData) {
            // Find dia-11-tu-luan in INITIAL_EXAMS or allExams
            const all = window.INITIAL_EXAMS || [];
            examData = all.find(e => e.id === "dia-11-tu-luan") || all[0];
        }

        state.exam = examData;
        state.questions = (examData && examData.questions) ? examData.questions : [];
        state.currentIndex = 0;
        state.subMode = "flashcard";
        state.isFlipped = false;

        loadMastery();
        render();
        setupShortcuts();
    }

    function loadMastery() {
        try {
            state.mastery = JSON.parse(localStorage.getItem("azota_essay_mastery") || "{}");
        } catch (e) {
            state.mastery = {};
        }
    }

    function saveMastery() {
        try {
            localStorage.setItem("azota_essay_mastery", JSON.stringify(state.mastery));
        } catch (e) {}
    }

    function setSubMode(mode) {
        state.subMode = mode;
        state.isFlipped = false;
        stopSpeech();
        if (window.AudioHelper) window.AudioHelper.playClick();
        render();
    }

    function goToQuestion(idx) {
        if (idx < 0 || idx >= state.questions.length) return;
        state.currentIndex = idx;
        state.isFlipped = false;
        stopSpeech();
        if (window.AudioHelper) window.AudioHelper.playClick();
        render();
    }

    function nextQuestion() {
        if (state.currentIndex < state.questions.length - 1) {
            goToQuestion(state.currentIndex + 1);
        } else {
            // Loop back to 0
            goToQuestion(0);
        }
    }

    function prevQuestion() {
        if (state.currentIndex > 0) {
            goToQuestion(state.currentIndex - 1);
        }
    }

    function toggleFlip() {
        state.isFlipped = !state.isFlipped;
        if (window.AudioHelper) window.AudioHelper.playClick();
        const inner = document.getElementById("essayCardInner");
        if (inner) {
            if (state.isFlipped) {
                inner.classList.add("flipped");
            } else {
                inner.classList.remove("flipped");
            }
        }
    }

    function markStatus(status) {
        const q = state.questions[state.currentIndex];
        if (!q) return;

        state.mastery[q.id] = status;
        saveMastery();

        if (status === 'mastered') {
            if (window.AudioHelper) window.AudioHelper.playCorrect();
            if (window.confetti) {
                window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
        } else {
            if (window.AudioHelper) window.AudioHelper.playIncorrect();
        }

        renderQuickNav();
        renderStatsPill();

        // Auto next after marking mastered
        if (status === 'mastered' && state.currentIndex < state.questions.length - 1) {
            setTimeout(() => {
                nextQuestion();
            }, 600);
        }
    }

    function setupShortcuts() {
        document.removeEventListener("keydown", handleKeyShortcuts);
        document.addEventListener("keydown", handleKeyShortcuts);
    }

    function handleKeyShortcuts(e) {
        const view = document.getElementById("essayView");
        if (!view || view.classList.contains("hidden")) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === "Space") {
            e.preventDefault();
            if (state.subMode === "flashcard") toggleFlip();
        } else if (e.key === "ArrowRight") {
            nextQuestion();
        } else if (e.key === "ArrowLeft") {
            prevQuestion();
        } else if (e.key === "1") {
            setSubMode("flashcard");
        } else if (e.key === "2") {
            setSubMode("cloze");
        } else if (e.key === "3") {
            setSubMode("write");
        } else if (e.key === "4") {
            setSubMode("chart");
        }
    }

    // ==========================================
    // TEXT TO SPEECH (VOICE ENGINE)
    // ==========================================
    function speakText(text) {
        if (!('speechSynthesis' in window)) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.");
            return;
        }

        if (state.isSpeechPlaying) {
            window.speechSynthesis.cancel();
            state.isSpeechPlaying = false;
            updateSpeechBtnUI(false);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any pending
        const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[-+*•]/g, ' ').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "vi-VN";
        utterance.rate = 0.95; // Clear and steady
        utterance.pitch = 1.0;

        // Try to find Vietnamese voice
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(v => v.lang.includes("vi") || v.lang.includes("VN"));
        if (viVoice) utterance.voice = viVoice;

        utterance.onstart = () => {
            state.isSpeechPlaying = true;
            updateSpeechBtnUI(true);
        };
        utterance.onend = () => {
            state.isSpeechPlaying = false;
            updateSpeechBtnUI(false);
        };
        utterance.onerror = () => {
            state.isSpeechPlaying = false;
            updateSpeechBtnUI(false);
        };

        window.speechSynthesis.speak(utterance);
    }

    function stopSpeech() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            state.isSpeechPlaying = false;
            updateSpeechBtnUI(false);
        }
    }

    function speakCurrent() {
        const q = state.questions[state.currentIndex];
        if (q && q.full_answer) {
            speakText(q.full_answer);
        }
    }

    function updateSpeechBtnUI(isPlaying) {
        const btn = document.getElementById("essaySpeakBtn");
        if (!btn) return;
        if (isPlaying) {
            btn.innerHTML = `<span>⏹️</span> <span class="hidden sm:inline">Dừng Đọc</span>`;
            btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500 text-white shadow-md cursor-pointer flex items-center gap-1.5 animate-pulse";
        } else {
            btn.innerHTML = `<span>🔊</span> <span class="hidden sm:inline">Nghe Đọc Bài</span>`;
            btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-sky-500 cursor-pointer flex items-center gap-1.5";
        }
    }

    // ==========================================
    // CLOZE ACTIVE RECALL ENGINE
    // ==========================================
    function toggleClozeBlank(qId, blankKey) {
        if (!state.clozeRevealed[qId]) state.clozeRevealed[qId] = {};
        state.clozeRevealed[qId][blankKey] = !state.clozeRevealed[qId][blankKey];
        if (window.AudioHelper) window.AudioHelper.playClick();
        renderSubModeContent();
    }

    function revealAllCloze(qId) {
        const q = state.questions.find(item => item.id === qId) || state.questions[state.currentIndex];
        if (!q || !q.cloze_items) return;
        if (!state.clozeRevealed[q.id]) state.clozeRevealed[q.id] = {};
        q.cloze_items.forEach((item, idx) => {
            state.clozeRevealed[q.id][`b_${idx}_1`] = true;
            if (item.blank2) state.clozeRevealed[q.id][`b_${idx}_2`] = true;
            if (item.blank3) state.clozeRevealed[q.id][`b_${idx}_3`] = true;
        });
        if (window.AudioHelper) window.AudioHelper.playClick();
        renderSubModeContent();
    }

    function hideAllCloze(qId) {
        const q = state.questions.find(item => item.id === qId) || state.questions[state.currentIndex];
        if (!q) return;
        state.clozeRevealed[q.id] = {};
        if (window.AudioHelper) window.AudioHelper.playClick();
        renderSubModeContent();
    }

    // ==========================================
    // SMART KEYWORD AI GRADER ENGINE
    // ==========================================
    function gradeUserEssay(qId) {
        const q = state.questions.find(item => item.id === qId) || state.questions[state.currentIndex];
        if (!q) return;

        const textarea = document.getElementById(`userEssayInput_${q.id}`);
        const text = (textarea ? textarea.value : (state.userDrafts[q.id] || '')).trim();
        state.userDrafts[q.id] = text;

        if (!text) {
            alert("Vui lòng gõ nội dung câu trả lời của bạn trước khi chấm điểm nhé!");
            return;
        }

        const normalizedInput = normalizeVietnameseText(text);

        // Grade each criteria
        let earnedPoints = 0;
        let totalPossible = 0;
        const criteriaResults = [];

        (q.criteria || []).forEach(crit => {
            totalPossible += crit.points || 2.0;
            // Check how many keywords matched
            const matchedKw = [];
            const missingKw = [];

            (crit.keywords || []).forEach(kw => {
                const normKw = normalizeVietnameseText(kw);
                if (normalizedInput.includes(normKw)) {
                    matchedKw.push(kw);
                } else {
                    missingKw.push(kw);
                }
            });

            const matchRatio = (crit.keywords && crit.keywords.length > 0) ? (matchedKw.length / crit.keywords.length) : 0;
            let status = "missing"; // 'passed' | 'partial' | 'missing'
            let critScore = 0;

            if (matchRatio >= 0.5) {
                status = "passed";
                critScore = crit.points || 2.0;
            } else if (matchRatio >= 0.25) {
                status = "partial";
                critScore = (crit.points || 2.0) * 0.5;
            } else {
                status = "missing";
                critScore = 0;
            }

            earnedPoints += critScore;
            criteriaResults.push({
                criterion: crit,
                status,
                score: critScore,
                maxScore: crit.points || 2.0,
                matchedKw,
                missingKw
            });
        });

        const finalScore = Math.min(10.0, Math.round((earnedPoints / (totalPossible || 10.0)) * 10 * 10) / 10);
        
        let feedback = "";
        if (finalScore >= 9.0) {
            feedback = "🎉 Xuất sắc! Bạn đã nắm trọn vẹn tất cả các ý chính và từ khóa cốt lõi của đề thi!";
            if (window.AudioHelper) window.AudioHelper.playSuccessFanfare();
            if (window.confetti) window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else if (finalScore >= 7.0) {
            feedback = "👍 Rất tốt! Bạn đã nhớ được đa số các ý quan trọng. Hãy bổ sung thêm những ý còn thiếu bên dưới để đạt điểm tuyệt đối nhé!";
            if (window.AudioHelper) window.AudioHelper.playCorrect();
        } else if (finalScore >= 5.0) {
            feedback = "⚠️ Khá tốt, bạn đã nhớ được một số ý chính. Cần ôn lại các từ khóa bị thiếu để bài làm chặt chẽ hơn.";
            if (window.AudioHelper) window.AudioHelper.playClick();
        } else {
            feedback = "💡 Hãy đọc lại phần 'Mẹo nhớ 10 giây' và thử thách 'Che khuyết từ khóa' để não bộ khắc sâu kiến thức nhé!";
            if (window.AudioHelper) window.AudioHelper.playIncorrect();
        }

        state.gradingResults[q.id] = {
            score: finalScore,
            totalPossible: 10.0,
            criteriaResults,
            feedback,
            evaluatedAt: new Date().toLocaleTimeString('vi-VN')
        };

        renderSubModeContent();
    }

    function normalizeVietnameseText(str) {
        if (!str) return "";
        return str
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    // ==========================================
    // MAIN RENDER CONTROLLER
    // ==========================================
    function render() {
        const view = document.getElementById("essayView");
        if (!view) return;

        renderQuickNav();
        renderStatsPill();
        renderSubModeContent();
    }

    function renderStatsPill() {
        const pill = document.getElementById("essayMasteryPill");
        if (!pill) return;

        const total = state.questions.length;
        const mastered = state.questions.filter(q => state.mastery[q.id] === 'mastered').length;
        const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

        pill.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xs font-black text-emerald-400">Đã thuộc ${mastered}/${total} câu</span>
                <div class="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                </div>
                <span class="text-[11px] font-bold text-slate-400">${percent}%</span>
            </div>
        `;
    }

    function renderQuickNav() {
        const navContainer = document.getElementById("essayQuickNav");
        if (!navContainer) return;

        navContainer.innerHTML = "";

        state.questions.forEach((q, idx) => {
            const isCurrent = (idx === state.currentIndex && state.subMode !== 'chart');
            const status = state.mastery[q.id] || 'unseen';

            let statusIcon = "⚪";
            let badgeClass = "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60";

            if (status === 'mastered') {
                statusIcon = "✔️";
                badgeClass = "border-emerald-500/50 bg-emerald-500/15 text-emerald-400";
            } else if (status === 'review') {
                statusIcon = "⚠️";
                badgeClass = "border-amber-500/50 bg-amber-500/15 text-amber-400";
            }

            if (isCurrent) {
                badgeClass += " ring-2 ring-emerald-400 font-black scale-105 shadow-md shadow-emerald-500/20";
            }

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${badgeClass}`;
            btn.innerHTML = `
                <span>${statusIcon}</span>
                <span>Câu ${idx + 1}</span>
            `;
            btn.onclick = () => {
                if (state.subMode === 'chart') state.subMode = 'flashcard';
                goToQuestion(idx);
            };
            navContainer.appendChild(btn);
        });

        // Add Chart guide button
        const chartBtn = document.createElement("button");
        chartBtn.type = "button";
        const isChart = (state.subMode === 'chart');
        chartBtn.className = `px-3.5 py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${isChart ? 'border-sky-500 bg-sky-500/20 text-sky-400 ring-2 ring-sky-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:text-sky-400'}`;
        chartBtn.innerHTML = `
            <span>📊</span>
            <span>Bí Kíp Nhận Dạng Biểu Đồ</span>
        `;
        chartBtn.onclick = () => setSubMode('chart');
        navContainer.appendChild(chartBtn);
    }

    function renderSubModeContent() {
        const area = document.getElementById("essaySubModeArea");
        if (!area) return;

        // Update tabs styling
        document.querySelectorAll("[id^='essay-tab-']").forEach(tab => {
            tab.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all cursor-pointer flex items-center gap-1.5";
        });
        const currentTab = document.getElementById(`essay-tab-${state.subMode}`);
        if (currentTab) {
            currentTab.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5";
        }

        if (state.subMode === "chart") {
            area.innerHTML = buildChartGuideHTML();
            return;
        }

        const q = state.questions[state.currentIndex];
        if (!q) {
            area.innerHTML = `<div class="p-8 text-center text-slate-400">Không tìm thấy câu hỏi tự luận.</div>`;
            return;
        }

        if (state.subMode === "flashcard") {
            area.innerHTML = buildFlashcardHTML(q);
        } else if (state.subMode === "cloze") {
            area.innerHTML = buildClozeHTML(q);
        } else if (state.subMode === "write") {
            area.innerHTML = buildWriteHTML(q);
        }
    }

    // ==========================================
    // 1. FLASHCARD 3D COMPONENT
    // ==========================================
    function buildFlashcardHTML(q) {
        const status = state.mastery[q.id] || 'unseen';
        const total = state.questions.length;
        const isFlippedClass = state.isFlipped ? "flipped" : "";

        return `
            <div class="space-y-4 max-w-4xl mx-auto">
                
                <!-- Flashcard Controls Top Bar -->
                <div class="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ${q.category || 'Tự Luận Trọng Tâm'}
                        </span>
                        <span>• Câu ${state.currentIndex + 1} / ${total}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="hidden sm:inline text-[11px]">Phím tắt:</span>
                        <kbd class="kbd-shortcut">Space</kbd> <span>Lật thẻ</span>
                        <kbd class="kbd-shortcut">← / →</kbd> <span>Đổi câu</span>
                    </div>
                </div>

                <!-- 3D Perspective Card Container -->
                <div class="perspective-1000 w-full min-h-[460px]">
                    <div id="essayCardInner" class="flip-card-inner relative w-full h-full min-h-[460px] rounded-3xl transition-transform duration-500 cursor-pointer ${isFlippedClass}" onclick="EssayEngine.toggleFlip()">
                        
                        <!-- ========================= -->
                        <!-- FRONT OF CARD (QUESTION)  -->
                        <!-- ========================= -->
                        <div class="flip-card-front absolute inset-0 w-full h-full glass-panel rounded-3xl p-6 sm:p-9 flex flex-col justify-between border-2 border-slate-200/80 dark:border-white/10 shadow-2xl bg-gradient-to-br from-white/95 to-slate-100/80 dark:from-slate-900/95 dark:to-slate-950/90">
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <span class="px-3 py-1 rounded-xl text-xs font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                        ❓ ĐỀ BÀI TỰ LUẬN
                                    </span>
                                    <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <span>🎯</span> Cần nêu đủ: <strong>${q.target_points || 4} ý chính</strong>
                                    </span>
                                </div>

                                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug mt-3">
                                    ${q.question}
                                </h2>

                                <div class="mt-6 p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
                                    <div class="font-black flex items-center gap-1.5 mb-1 text-amber-500">
                                        <span>⚡</span> MẸO GHI NHỚ SIÊU TỐC:
                                    </div>
                                    <p class="font-medium whitespace-pre-line">${q.mnemonic}</p>
                                </div>
                            </div>

                            <div class="pt-6 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div class="text-xs text-slate-400 flex items-center gap-1.5">
                                    <span class="animate-bounce">👆</span>
                                    <span>Nhấn vào thẻ hoặc bấm phím <strong>Space</strong> để lật xem đáp án chuẩn</span>
                                </div>

                                <button type="button" onclick="event.stopPropagation(); EssayEngine.toggleFlip();" class="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2">
                                    <span>🔄</span> Lật Thẻ Xem Đáp Án
                                </button>
                            </div>
                        </div>

                        <!-- ========================= -->
                        <!-- BACK OF CARD (ANSWER)     -->
                        <!-- ========================= -->
                        <div class="flip-card-back absolute inset-0 w-full h-full glass-panel rounded-3xl p-6 sm:p-9 flex flex-col justify-between border-2 border-emerald-500/40 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 overflow-y-auto" onclick="event.stopPropagation();">
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center gap-2">
                                        <span class="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            💡 ĐÁP ÁN CHUẨN & TỪ KHÓA ĂN ĐIỂM
                                        </span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button type="button" id="essaySpeakBtn" onclick="EssayEngine.speakCurrent()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-sky-500 cursor-pointer flex items-center gap-1.5">
                                            <span>🔊</span> <span class="hidden sm:inline">Nghe Đọc Bài</span>
                                        </button>
                                        <button type="button" onclick="EssayEngine.toggleFlip()" class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer" title="Lật lại câu hỏi">
                                            🔄
                                        </button>
                                    </div>
                                </div>

                                <h3 class="text-sm font-bold text-slate-400 mb-3">
                                    ${q.short_question || q.question}
                                </h3>

                                <!-- Rendered Full Answer with Neon Highlight -->
                                <div class="selectable-text p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 text-slate-100 text-sm sm:text-base leading-relaxed">
                                    ${q.full_answer_html || q.full_answer}
                                </div>
                            </div>

                            <!-- Mastery Feedback & Navigation -->
                            <div class="pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div class="flex items-center gap-2">
                                    <button type="button" onclick="EssayEngine.markStatus('review')" class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5">
                                        <span>❌</span> Chưa Thuộc (Ôn Lại)
                                    </button>
                                    <button type="button" onclick="EssayEngine.markStatus('mastered')" class="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5">
                                        <span>✔️</span> Đã Thuộc Bài!
                                    </button>
                                </div>

                                <div class="flex items-center gap-2 self-end sm:self-auto">
                                    <button type="button" onclick="EssayEngine.prevQuestion()" ${state.currentIndex === 0 ? 'disabled class="p-2.5 rounded-xl bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed"' : 'class="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"'} title="Câu trước">
                                        ◀
                                    </button>
                                    <button type="button" onclick="EssayEngine.nextQuestion()" class="px-4 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer flex items-center gap-1">
                                        <span>Câu Tiếp Theo</span> <span>▶</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <!-- Footer Quick Actions -->
                <div class="flex items-center justify-center gap-3 pt-2">
                    <button type="button" onclick="EssayEngine.setSubMode('cloze')" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5">
                        <span>🧩</span> Thử Thách Che Khuyết Từ Khóa (Active Recall) ➔
                    </button>
                    <button type="button" onclick="EssayEngine.setSubMode('write')" class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5">
                        <span>✍️</span> Tự Viết & Chấm Điểm AI ➔
                    </button>
                </div>

            </div>
        `;
    }

    // ==========================================
    // 2. CLOZE DELETION (ACTIVE RECALL) COMPONENT
    // ==========================================
    function buildClozeHTML(q) {
        const revealed = state.clozeRevealed[q.id] || {};
        const items = q.cloze_items || [];

        return `
            <div class="space-y-5 max-w-4xl mx-auto">
                <div class="p-6 rounded-3xl glass-panel border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-slate-950/80 space-y-4">
                    
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-white/10">
                        <div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🧩 ACTIVE RECALL MODE
                            </span>
                            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                                ${q.question}
                            </h3>
                            <p class="text-xs text-slate-400 mt-0.5">
                                Nhấp chuột vào các ô <strong>[ Bấm để mở ]</strong> để lật mở từng từ khóa sau khi nhẩm trong đầu.
                            </p>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" onclick="EssayEngine.revealAllCloze(${q.id})" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 cursor-pointer">
                                🔓 Mở Tất Cả
                            </button>
                            <button type="button" onclick="EssayEngine.hideAllCloze(${q.id})" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
                                🔒 Che Lại
                            </button>
                        </div>
                    </div>

                    <!-- Cloze Items List -->
                    <div class="space-y-3.5 pt-2">
                        ${items.map((item, idx) => {
                            const b1Key = `b_${idx}_1`;
                            const b2Key = `b_${idx}_2`;
                            const b3Key = `b_${idx}_3`;

                            const isRev1 = !!revealed[b1Key];
                            const isRev2 = !!revealed[b2Key];
                            const isRev3 = !!revealed[b3Key];

                            const blank1HTML = isRev1
                                ? `<span class="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold mx-1 animate-pulse">${item.blank}</span>`
                                : `<button type="button" onclick="EssayEngine.toggleClozeBlank(${q.id}, '${b1Key}')" class="cloze-btn inline-block px-2.5 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white border border-purple-400/40 text-xs font-black mx-1 cursor-pointer">🔒 [ Bấm để mở ]</button>`;

                            let blank2HTML = "";
                            if (item.blank2) {
                                blank2HTML = isRev2
                                    ? `<span class="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold mx-1 animate-pulse">${item.blank2}</span>`
                                    : `<button type="button" onclick="EssayEngine.toggleClozeBlank(${q.id}, '${b2Key}')" class="cloze-btn inline-block px-2.5 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white border border-purple-400/40 text-xs font-black mx-1 cursor-pointer">🔒 [ Bấm mở ]</button>`;
                            }

                            let blank3HTML = "";
                            if (item.blank3) {
                                blank3HTML = isRev3
                                    ? `<span class="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold mx-1 animate-pulse">${item.blank3}</span>`
                                    : `<button type="button" onclick="EssayEngine.toggleClozeBlank(${q.id}, '${b3Key}')" class="cloze-btn inline-block px-2.5 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white border border-purple-400/40 text-xs font-black mx-1 cursor-pointer">🔒 [ Bấm mở ]</button>`;
                            }

                            return `
                                <div class="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                                    <span class="text-purple-400 font-black">•</span>
                                    <div>
                                        <span>${item.before || ''}</span>
                                        ${blank1HTML}
                                        <span>${item.after || ''}</span>
                                        ${blank2HTML}
                                        <span>${item.after2 || ''}</span>
                                        ${blank3HTML}
                                        <span>${item.after3 || ''}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Bottom Nav -->
                    <div class="pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                        <button type="button" onclick="EssayEngine.setSubMode('flashcard')" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                            ← Quay lại Flashcard
                        </button>
                        <button type="button" onclick="EssayEngine.setSubMode('write')" class="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-white shadow-lg shadow-emerald-500/20 cursor-pointer">
                            ✍️ Tự Viết & Chấm Điểm Ngay ➔
                        </button>
                    </div>

                </div>
            </div>
        `;
    }

    // ==========================================
    // 3. SMART AI KEYWORD GRADER COMPONENT
    // ==========================================
    function buildWriteHTML(q) {
        const savedDraft = state.userDrafts[q.id] || "";
        const result = state.gradingResults[q.id];

        return `
            <div class="space-y-5 max-w-4xl mx-auto">
                <div class="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-950/15 via-slate-900/60 to-slate-950/80 space-y-4">
                    
                    <div class="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/50 dark:border-white/10">
                        <div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ✍️ LUYỆN VIẾT & CHẤM ĐIỂM BAREM
                            </span>
                            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                                ${q.question}
                            </h3>
                            <p class="text-xs text-slate-400 mt-0.5">
                                Hãy tự nhớ lại và gõ toàn bộ câu trả lời của bạn vào khung bên dưới, sau đó bấm nút <strong>"🚀 Chấm Điểm"</strong> để hệ thống tự động quét từ khóa và tính điểm.
                            </p>
                        </div>
                    </div>

                    <!-- Textarea for student answer -->
                    <div>
                        <textarea id="userEssayInput_${q.id}" rows="7" placeholder="Nhập câu trả lời theo trí nhớ của bạn ở đây... (Ví dụ: Các dòng hàng hóa, dịch vụ...)" class="w-full p-4 rounded-2xl bg-white/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans">${savedDraft}</textarea>
                    </div>

                    <div class="flex items-center justify-between gap-3">
                        <span class="text-xs text-slate-400">
                            🎯 Thang điểm: <strong>10.0 điểm</strong> (Chia đều cho các ý cốt lõi)
                        </span>

                        <button type="button" onclick="EssayEngine.gradeUserEssay(${q.id})" class="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-xl shadow-orange-500/25 transition-all cursor-pointer flex items-center gap-2">
                            <span>🚀</span> Chấm Điểm & Phân Tích Ý
                        </button>
                    </div>

                    <!-- Grading Result Box (If Graded) -->
                    ${result ? `
                        <div class="p-5 mt-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                                <div class="flex items-center gap-3">
                                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${result.score >= 8.0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : (result.score >= 5.0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40')}">
                                        ${result.score.toFixed(1)}
                                    </div>
                                    <div>
                                        <div class="text-xs font-black uppercase text-slate-400">Kết Quả Chấm Điểm</div>
                                        <div class="font-extrabold text-slate-200 text-sm">${result.feedback}</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-500 font-mono">Đánh giá lúc ${result.evaluatedAt}</span>
                            </div>

                            <!-- Criteria Breakdown -->
                            <div class="space-y-2.5">
                                <div class="text-xs font-black text-slate-400 uppercase">Chi Tiết Từng Ý Barem:</div>
                                ${result.criteriaResults.map((item, cIdx) => {
                                    const isPassed = (item.status === 'passed');
                                    const isPartial = (item.status === 'partial');
                                    let badgeColor = isPassed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : (isPartial ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-rose-500/20 text-rose-400 border-rose-500/40");
                                    let icon = isPassed ? "✔️ ĐẠT" : (isPartial ? "⚠️ THIẾU TỪ KHÓA" : "❌ CHƯA NÊU");

                                    return `
                                        <div class="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-xs">
                                            <div class="flex items-start justify-between gap-2">
                                                <span class="font-bold text-slate-200">Ý ${cIdx + 1}: ${item.criterion.text}</span>
                                                <span class="px-2 py-0.5 rounded-full font-black text-[10px] shrink-0 border ${badgeColor}">
                                                    ${icon} (+${item.score.toFixed(1)}đ)
                                                </span>
                                            </div>
                                            <div class="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                                                <span>Từ khóa tìm thấy:</span>
                                                ${item.matchedKw.length > 0 
                                                    ? item.matchedKw.map(kw => `<span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">${kw}</span>`).join('')
                                                    : '<span class="text-slate-500">Chưa có</span>'
                                                }
                                                ${item.missingKw.length > 0 ? `
                                                    <span class="ml-2 text-rose-400">Cần bổ sung:</span>
                                                    ${item.missingKw.map(kw => `<span class="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">${kw}</span>`).join('')}
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                </div>
            </div>
        `;
    }

    // ==========================================
    // 4. CHART IDENTIFICATION MASTER GUIDE
    // ==========================================
    function buildChartGuideHTML() {
        return `
            <div class="space-y-6 max-w-4xl mx-auto">
                
                <!-- Chart Guide Banner -->
                <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white shadow-2xl space-y-3">
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30">
                            📊 KỸ NĂNG ĐỊA LÍ 11
                        </span>
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-yellow-400 text-slate-950">
                            BÍ KÍP 10 GIÂY ĂN TRỌN ĐIỂM
                        </span>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-black">
                        Cẩm Nang Nhận Dạng 5 Loại Biểu Đồ Địa Lí Chuẩn Bộ GD&ĐT
                    </h2>
                    <p class="text-xs sm:text-sm text-sky-100 leading-relaxed">
                        Chỉ cần tìm <strong>"TỪ KHÓA VÀNG"</strong> trong câu hỏi và đếm số năm trên bảng số liệu là bạn sẽ chọn chính xác 100% dạng biểu đồ mà không sợ bị lừa!
                    </p>
                </div>

                <!-- 5 Chart Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <!-- Chart 1: Biểu đồ TRÒN -->
                    <div class="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">🥧</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                THỜI GIAN: 1 ĐẾN 3 NĂM
                            </span>
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-base">
                            1. Biểu Đồ TRÒN
                        </h4>
                        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div><strong class="text-emerald-500">Từ khóa vàng:</strong> <em>"Cơ cấu", "Tỉ trọng", "Quy mô và cơ cấu"</em>.</div>
                            <div><strong class="text-emerald-500">Dấu hiệu bảng số liệu:</strong> Đơn vị là <strong>%</strong> (hoặc số liệu tuyệt đối nhưng cộng lại thành 100%).</div>
                            <div><strong class="text-emerald-500">Lưu ý bán kính:</strong> Nếu đề yêu cầu cả <em>"Quy mô và cơ cấu"</em> trong 2-3 năm thì vẽ các hình tròn có bán kính $R$ khác nhau!</div>
                        </div>
                    </div>

                    <!-- Chart 2: Biểu đồ MIỀN -->
                    <div class="p-5 rounded-2xl glass-panel border border-purple-500/30 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">🏔️</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                THỜI GIAN: $\ge 4$ NĂM
                            </span>
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-base">
                            2. Biểu Đồ MIỀN
                        </h4>
                        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div><strong class="text-purple-400">Từ khóa vàng:</strong> <em>"Chuyển dịch cơ cấu", "Thay đổi cơ cấu"</em>.</div>
                            <div><strong class="text-purple-400">Dấu hiệu chuỗi thời gian:</strong> Bảng số liệu có từ <strong>4 mốc năm trở lên</strong> (ví dụ: 2000, 2005, 2010, 2015, 2021).</div>
                            <div><strong class="text-purple-400">Quy tắc nhớ:</strong> Cơ cấu $\le 3$ năm ➔ TRÒN; Cơ cấu $\ge 4$ năm ➔ MIỀN.</div>
                        </div>
                    </div>

                    <!-- Chart 3: Biểu đồ ĐƯỜNG (Đồ thị) -->
                    <div class="p-5 rounded-2xl glass-panel border border-sky-500/30 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">📈</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                TỐC ĐỘ / ĐƠN VỊ %
                            </span>
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-base">
                            3. Biểu Đồ ĐƯỜNG (Đồ Thị)
                        </h4>
                        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div><strong class="text-sky-400">Từ khóa vàng:</strong> <em>"Tốc độ tăng trưởng", "Tốc độ phát triển", "Chỉ số phát triển"</em>.</div>
                            <div><strong class="text-sky-400">Dấu hiệu mốc chuẩn:</strong> Thường có năm gốc lấy mốc là <strong>100%</strong>.</div>
                            <div><strong class="text-sky-400">Lưu ý:</strong> Cũng dùng khi thể hiện sự gia tăng dân số, biến động nhiệt độ qua 12 tháng.</div>
                        </div>
                    </div>

                    <!-- Chart 4: Biểu đồ CỘT -->
                    <div class="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">📊</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                QUY MÔ / SẢN LƯỢNG
                            </span>
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-base">
                            4. Biểu Đồ CỘT (Đơn, Đôi, Nhóm)
                        </h4>
                        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div><strong class="text-amber-500">Từ khóa vàng:</strong> <em>"Quy mô", "Sản lượng", "Số lượng", "Khối lượng", "So sánh"</em>.</div>
                            <div><strong class="text-amber-500">Đơn vị:</strong> Giá trị tuyệt đối như tấn, triệu người, tỉ USD, kWh, ha...</div>
                            <div><strong class="text-amber-500">Ứng dụng:</strong> So sánh quy mô giữa các quốc gia, vùng miền hoặc qua các năm.</div>
                        </div>
                    </div>

                    <!-- Chart 5: Biểu đồ KẾT HỢP (Cột + Đường) -->
                    <div class="p-5 rounded-2xl glass-panel border border-rose-500/30 space-y-2.5 md:col-span-2">
                        <div class="flex items-center justify-between">
                            <span class="text-2xl">📊 + 📈</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                CÓ 2 ĐƠN VỊ ĐO KHÁC NHAU
                            </span>
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-base">
                            5. Biểu Đồ KẾT HỢP (Cột và Đường - 2 Trục Tung)
                        </h4>
                        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div><strong class="text-rose-400">Từ khóa vàng:</strong> Thường gắn với 2 đại lượng tương quan, ví dụ: <em>Diện tích và Sản lượng; Sản lượng và Năng suất; Dân số và Tỉ lệ gia tăng</em>.</div>
                            <div><strong class="text-rose-400">Dấu hiệu nhận biết chắc chắn:</strong> Bảng số liệu có <strong>2 đơn vị đo hoàn toàn khác nhau</strong> (ví dụ: Nghìn ha và Nghìn tấn, hoặc Triệu người và %).</div>
                        </div>
                    </div>

                </div>

                <!-- Quick Practice Action -->
                <div class="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 class="font-extrabold text-slate-900 dark:text-white text-sm">
                            Sẵn sàng thử thách phản xạ nhận dạng biểu đồ?
                        </h4>
                        <p class="text-xs text-slate-400 mt-0.5">
                            Làm ngay bộ 10 câu trắc nghiệm thực chiến để kiểm tra khả năng chọn dạng biểu đồ chỉ trong 10 giây!
                        </p>
                    </div>

                    <button type="button" onclick="AzotaApp.startExam('dia-11-nhan-dang-bieu-do', 'practice')" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md hover:from-sky-500 hover:to-blue-600 transition-all cursor-pointer shrink-0">
                        🚀 Luyện Tập 10 Câu Biểu Đồ ➔
                    </button>
                </div>

            </div>
        `;
    }

    // ==========================================
    // 5. PRINT SHEET / EXPORT PDF
    // ==========================================
    function printCheatSheet() {
        window.print();
    }

    return {
        init: init,
        render: render,
        setSubMode: setSubMode,
        goToQuestion: goToQuestion,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        toggleFlip: toggleFlip,
        markStatus: markStatus,
        toggleClozeBlank: toggleClozeBlank,
        revealAllCloze: revealAllCloze,
        hideAllCloze: hideAllCloze,
        gradeUserEssay: gradeUserEssay,
        speakText: speakText,
        speakCurrent: speakCurrent,
        stopSpeech: stopSpeech,
        printCheatSheet: printCheatSheet
    };

})();
