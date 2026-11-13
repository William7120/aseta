/**
 * Grade Calculator & Predictive Rank Engine (Thông tư 22/2021/TT-BGDĐT)
 * Hệ thống Tính Điểm Trung Bình & Dự Báo Xếp Loại Học Lực THPT
 * Aseta Exam Suite - Chuẩn Chương Trình GDPT 2018 Mới Nhất
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'aseta_grade_calculator_v1';

    // Danh mục môn học mặc định THPT (Lớp 11)
    const DEFAULT_SUBJECTS = [
        { id: 'math', name: 'Toán Học', short: 'Toán', icon: '📐', group: 'core', type: 'numeric', active: true, tx: [8.5, 8.0], gk: 8.0, ck: null, target: 8.0 },
        { id: 'lit', name: 'Ngữ Văn', short: 'Văn', icon: '📚', group: 'core', type: 'numeric', active: true, tx: [7.5, 8.0], gk: 7.5, ck: null, target: 8.0 },
        { id: 'eng', name: 'Tiếng Anh', short: 'Anh', icon: '🇬🇧', group: 'core', type: 'numeric', active: true, tx: [9.0, 9.5], gk: 9.0, ck: null, target: 9.0 },
        { id: 'his', name: 'Lịch Sử', short: 'Sử', icon: '🏛️', group: 'social', type: 'numeric', active: true, tx: [8.5, 9.0], gk: 8.5, ck: null, target: 8.0 },
        { id: 'phy', name: 'Vật Lí', short: 'Lí', icon: '⚡', group: 'natural', type: 'numeric', active: true, tx: [7.0, 7.5], gk: 7.0, ck: null, target: 6.5 },
        { id: 'chem', name: 'Hóa Học', short: 'Hóa', icon: '🧪', group: 'natural', type: 'numeric', active: true, tx: [6.5, 7.0], gk: 6.5, ck: null, target: 6.5 },
        { id: 'bio', name: 'Sinh Học', short: 'Sinh', icon: '🧬', group: 'natural', type: 'numeric', active: true, tx: [7.5, 8.0], gk: 7.5, ck: null, target: 6.5 },
        { id: 'geo', name: 'Địa Lí', short: 'Địa', icon: '🌍', group: 'social', type: 'numeric', active: true, tx: [8.0, 8.5], gk: 8.0, ck: null, target: 8.0 },
        { id: 'gdktpl', name: 'GDKT & Pháp Luật', short: 'GDKTPL', icon: '⚖️', group: 'social', type: 'numeric', active: true, tx: [8.5, 9.0], gk: 8.5, ck: null, target: 8.0 },
        { id: 'it', name: 'Tin Học', short: 'Tin', icon: '💻', group: 'applied', type: 'numeric', active: true, tx: [9.0, 9.5], gk: 9.0, ck: null, target: 9.0 },
        { id: 'tech', name: 'Công Nghệ', short: 'CN', icon: '⚙️', group: 'applied', type: 'numeric', active: false, tx: [8.0], gk: 8.0, ck: null, target: 6.5 },
        { id: 'qpan', name: 'GD Quốc Phòng - AN', short: 'QP-AN', icon: '🎖️', group: 'applied', type: 'numeric', active: true, tx: [8.5, 9.0], gk: 8.5, ck: null, target: 8.0 },
        // Các môn đánh giá bằng nhận xét
        { id: 'pe', name: 'Giáo Dục Thể Chất', short: 'Thể Dục', icon: '🏃', group: 'comment', type: 'comment', active: true, result: 'Đạt' },
        { id: 'hdtn', name: 'Hoạt Động Trải Nghiệm', short: 'HĐTN', icon: '🌟', group: 'comment', type: 'comment', active: true, result: 'Đạt' },
        { id: 'gddp', name: 'Giáo Dục Địa Phương', short: 'GDĐP', icon: '🏮', group: 'comment', type: 'comment', active: true, result: 'Đạt' }
    ];

    let state = {
        subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
        targetRank: 'gioi', // 'xuatsac', 'gioi', 'kha', 'dat'
        semester: 'hk1', // 'hk1', 'hk2', 'canam'
        inputMode: 'detailed' // 'detailed' (tx, gk, ck) hoặc 'quick' (nhập thẳng ĐTB môn)
    };

    // Load state
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.subjects)) {
                    state = Object.assign(state, parsed);
                }
            }
        } catch(e) {
            console.warn('[GradeCalc] Load state failed:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch(e) {
            console.warn('[GradeCalc] Save state failed:', e);
        }
    }

    // TÍNH ĐIỂM TRUNG BÌNH MÔN (Hệ số TT22: tx x 1, gk x 2, ck x 3)
    function calcSubjectAverage(sub) {
        if (sub.type === 'comment') {
            return { isComment: true, result: sub.result || 'Đạt' };
        }

        // Nếu ở chế độ quick và có đtb nhập thẳng
        if (state.inputMode === 'quick' && typeof sub.directAverage === 'number' && !isNaN(sub.directAverage)) {
            return {
                isComment: false,
                average: Math.round(sub.directAverage * 10) / 10,
                isCompleted: true,
                hasCk: true
            };
        }

        const txList = Array.isArray(sub.tx) ? sub.tx.filter(v => typeof v === 'number' && !isNaN(v) && v >= 0 && v <= 10) : [];
        const hasGk = typeof sub.gk === 'number' && !isNaN(sub.gk) && sub.gk >= 0 && sub.gk <= 10;
        const hasCk = typeof sub.ck === 'number' && !isNaN(sub.ck) && sub.ck >= 0 && sub.ck <= 10;

        let totalScore = 0;
        let totalCoeff = 0;

        // Điểm thường xuyên (Hệ số 1)
        txList.forEach(score => {
            totalScore += score * 1;
            totalCoeff += 1;
        });

        // Điểm giữa kì (Hệ số 2)
        if (hasGk) {
            totalScore += sub.gk * 2;
            totalCoeff += 2;
        }

        // Điểm cuối kì (Hệ số 3)
        if (hasCk) {
            totalScore += sub.ck * 3;
            totalCoeff += 3;
        }

        if (totalCoeff === 0) {
            return { isComment: false, average: null, isCompleted: false, hasCk: false };
        }

        const avg = Math.round((totalScore / totalCoeff) * 10) / 10;
        return {
            isComment: false,
            average: avg,
            isCompleted: hasCk,
            hasCk: hasCk,
            currentCoeff: totalCoeff,
            currentScore: totalScore
        };
    }

    // TÍNH ĐIỂM THI CUỐI KÌ CẦN ĐẠT ĐỂ CÁN MỐC MỤC TIÊU (ƯỚC LƯỢNG NGƯỢC)
    function calcNeededExamScore(sub, targetScore) {
        if (sub.type === 'comment') return null;

        const txList = Array.isArray(sub.tx) ? sub.tx.filter(v => typeof v === 'number' && !isNaN(v)) : [];
        const hasGk = typeof sub.gk === 'number' && !isNaN(sub.gk);

        // Giả định chuẩn gồm các cột tx + 1 cột gk (hs 2) + 1 cột ck (hs 3)
        const txCount = Math.max(txList.length, 2); // Tối thiểu 2 cột tx
        const totalCoeff = txCount + 2 + 3; // Tổng hệ số hoàn chỉnh

        let existingScore = 0;
        txList.forEach(s => existingScore += s * 1);
        if (hasGk) {
            existingScore += sub.gk * 2;
        } else {
            // Nếu chưa có gk, giả định gk đạt bằng điểm tx trung bình
            const avgTx = txList.length > 0 ? (existingScore / txList.length) : targetScore;
            existingScore += avgTx * 2;
        }

        // Công thức giải ngược: (Target * TotalCoeff - ExistingScore) / 3
        const needed = (targetScore * totalCoeff - existingScore) / 3;
        const rounded = Math.round(needed * 10) / 10;

        return {
            neededScore: rounded,
            isSafe: rounded <= 0,
            isFeasible: rounded <= 10.0,
            targetScore: targetScore,
            difficulty: rounded <= 5.0 ? 'easy' : (rounded <= 8.0 ? 'medium' : (rounded <= 10.0 ? 'hard' : 'impossible'))
        };
    }

    // ĐÁNH GIÁ VÀ XẾP LOẠI HỌC LỰC THEO THÔNG TƯ 22/2021/TT-BGDĐT
    function evaluateClassification(subjects) {
        const activeNumeric = subjects.filter(s => s.active && s.type === 'numeric');
        const activeComment = subjects.filter(s => s.active && s.type === 'comment');

        const averages = activeNumeric.map(sub => {
            const res = calcSubjectAverage(sub);
            return {
                id: sub.id,
                name: sub.name,
                short: sub.short,
                icon: sub.icon,
                avg: res.average,
                hasCk: res.hasCk
            };
        });

        // Đếm các mốc điểm
        const validScores = averages.filter(a => a.avg !== null).map(a => a.avg);
        const countGte9 = validScores.filter(s => s >= 9.0).length;
        const countGte8 = validScores.filter(s => s >= 8.0).length;
        const countGte65 = validScores.filter(s => s >= 6.5).length;
        const countGte5 = validScores.filter(s => s >= 5.0).length;
        const countLt35 = validScores.filter(s => s < 3.5).length;
        const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

        // Điểm TB chung tất cả các môn
        const overallAvg = validScores.length > 0 
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
            : 0;

        // Kiểm tra môn nhận xét
        const notPassedComments = activeComment.filter(s => s.result !== 'Đạt').length;
        const allCommentsPassed = notPassedComments === 0;

        let rank = 'chuadat';
        let rankTitle = 'Chưa Đạt';
        let rankColor = 'rose';
        let rankBadge = '⚠️';
        let rankDescription = 'Chưa hoàn thành đủ tiêu chuẩn rèn luyện học tập';
        let missingReason = [];

        if (validScores.length >= 6) {
            // 1. XUẤT SẮC: Tối thiểu 6 môn >= 9.0, tất cả các môn còn lại >= 6.5, môn nhận xét Đạt
            if (countGte9 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rank = 'xuatsac';
                rankTitle = 'Học Sinh Xuất Sắc';
                rankColor = 'amber';
                rankBadge = '🏆';
                rankDescription = 'Đạt danh hiệu Học sinh Xuất sắc (Ít nhất 6 môn ≥ 9.0, các môn còn lại ≥ 6.5)';
            }
            // 2. GIỎI (TỐT): Tối thiểu 6 môn >= 8.0, tất cả các môn còn lại >= 6.5, môn nhận xét Đạt
            else if (countGte8 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rank = 'gioi';
                rankTitle = 'Học Sinh Giỏi';
                rankColor = 'emerald';
                rankBadge = '🥇';
                rankDescription = 'Đạt kết quả học tập mức Tốt / Giỏi (Ít nhất 6 môn ≥ 8.0, các môn còn lại ≥ 6.5)';
            }
            // 3. KHÁ: Tối thiểu 6 môn >= 6.5, tất cả các môn còn lại >= 5.0, môn nhận xét Đạt
            else if (countGte65 >= 6 && minScore >= 5.0 && allCommentsPassed) {
                rank = 'kha';
                rankTitle = 'Học Sinh Khá';
                rankColor = 'sky';
                rankBadge = '🥈';
                rankDescription = 'Đạt kết quả học tập mức Khá (Ít nhất 6 môn ≥ 6.5, các môn còn lại ≥ 5.0)';
            }
            // 4. ĐẠT (TRUNG BÌNH): Tối thiểu 6 môn >= 5.0, không môn nào < 3.5, tối đa 1 môn nhận xét Chưa đạt
            else if (countGte5 >= 6 && countLt35 === 0 && notPassedComments <= 1) {
                rank = 'dat';
                rankTitle = 'Mức Đạt';
                rankColor = 'teal';
                rankBadge = '🥉';
                rankDescription = 'Đạt kết quả học tập mức Đạt (Ít nhất 6 môn ≥ 5.0, không có môn dưới 3.5)';
            } else {
                rank = 'chuadat';
                rankTitle = 'Chưa Đạt';
                rankColor = 'rose';
                rankBadge = '⚠️';
                rankDescription = 'Có môn học dưới 3.5 điểm hoặc chưa đủ số môn theo quy định';
            }
        } else {
            rankTitle = 'Đang Nhập Liệu';
            rankColor = 'slate';
            rankBadge = '📝';
            rankDescription = `Đã nhập ${validScores.length}/6 môn tối thiểu để bắt đầu xếp loại`;
        }

        // TẠO LỜI KHUYÊN & CHIẾN LƯỢC CẢI THIỆN
        const recommendations = [];

        // Gợi ý cho mục tiêu Giỏi
        if (rank !== 'xuatsac' && rank !== 'gioi') {
            const needed8 = 6 - countGte8;
            if (needed8 > 0) {
                // Tìm các môn gần 8.0 nhất để đề xuất kéo điểm
                const candidates = averages
                    .filter(a => a.avg !== null && a.avg < 8.0)
                    .sort((a, b) => b.avg - a.avg)
                    .slice(0, needed8);
                
                const names = candidates.map(c => `${c.short} (hiện ${c.avg})`).join(', ');
                recommendations.push(`🎯 <strong>Mục tiêu Học Sinh Giỏi:</strong> Cần thêm <strong>${needed8} môn</strong> nữa đạt ≥ 8.0. Hãy tập trung kéo các môn gần mốc nhất: <strong>${names}</strong>.`);
            }

            // Kiểm tra các môn khống chế bị dưới 6.5
            const below65 = averages.filter(a => a.avg !== null && a.avg < 6.5);
            if (below65.length > 0) {
                const names = below65.map(c => `<strong>${c.short}</strong> (${c.avg})`).join(', ');
                recommendations.push(`⚠️ <strong>Cảnh báo môn khống chế:</strong> Môn ${names} đang bị dưới 6.5! Phải thi cuối kì để kéo lên ≥ 6.5, nếu không sẽ bị hạ loại dù đủ 6 môn trên 8.0!`);
            }
        }

        // Gợi ý cho mục tiêu Xuất Sắc
        if (rank === 'gioi') {
            const needed9 = 6 - countGte9;
            const candidates = averages
                .filter(a => a.avg !== null && a.avg < 9.0)
                .sort((a, b) => b.avg - a.avg)
                .slice(0, needed9);
            const names = candidates.map(c => `${c.short} (hiện ${c.avg})`).join(', ');
            recommendations.push(`✨ <strong>Chỉ còn một bước để đạt Xuất Sắc:</strong> Cần thêm <strong>${needed9} môn</strong> đạt ≥ 9.0. Các môn sáng giá nhất để bứt phá: <strong>${names}</strong>!`);
        }

        return {
            rank,
            rankTitle,
            rankColor,
            rankBadge,
            rankDescription,
            overallAvg,
            countGte9,
            countGte8,
            countGte65,
            countGte5,
            countLt35,
            minScore,
            allCommentsPassed,
            averages,
            recommendations,
            totalActive: activeNumeric.length
        };
    }

    // GIAO DIỆN CHÍNH
    function renderGradeCalculator(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        loadState();
        const evalResult = evaluateClassification(state.subjects);

        container.innerHTML = `
            <div class="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
                
                <!-- 1. HEADER & HERO BANNER -->
                <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                    <div class="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                                    <span>⚖️</span> <span>Chuẩn Thông Tư 22/2021/TT-BGDĐT</span>
                                </span>
                                <span class="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    THPT Lớp 11
                                </span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                                <span>🧮</span> <span>Tính Điểm &amp; Dự Báo Xếp Loại Học Sinh</span>
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                Nhập điểm kiểm tra thường xuyên, giữa kì và cuối kì. Hệ thống tự động phân tích điểm khống chế và ước lượng chính xác điểm thi cuối kì cần đạt để bạn chinh phục danh hiệu <strong class="text-amber-300">Xuất Sắc</strong> hoặc <strong class="text-emerald-300">Học Sinh Giỏi</strong>!
                            </p>
                        </div>

                        <!-- Action Bar Buttons -->
                        <div class="flex items-center gap-2.5 flex-wrap">
                            <button type="button" id="gradeCalcDemoBtn" class="px-4 py-2.5 rounded-2xl text-xs font-black bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                                <span>🎲</span> <span>Nạp Điểm Mẫu (11A7)</span>
                            </button>
                            <button type="button" id="gradeCalcResetBtn" class="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/80 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                <span>🔄</span> <span>Đặt lại</span>
                            </button>
                        </div>
                    </div>

                    <!-- 2. SUMMARY RANK & PREDICTION CARD -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                        
                        <!-- Cột 1: Xếp Loại Hiện Tại -->
                        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 shadow-inner">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0 shadow-lg">
                                ${evalResult.rankBadge}
                            </div>
                            <div class="min-w-0">
                                <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dự báo Xếp Loại</div>
                                <div class="text-lg sm:text-xl font-black text-white truncate">${evalResult.rankTitle}</div>
                                <div class="text-[11px] text-slate-400 truncate">${evalResult.rankDescription}</div>
                            </div>
                        </div>

                        <!-- Cột 2: Điểm Trung Bình Chung & Thống kê mốc -->
                        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                            <div>
                                <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ĐTB Chung Tích Lũy</div>
                                <div class="text-2xl font-black text-emerald-400">${evalResult.overallAvg.toFixed(1)}</div>
                                <div class="text-[11px] text-slate-400">Từ ${evalResult.totalActive} môn tính điểm</div>
                            </div>
                            <div class="flex flex-col gap-1 text-[11px] font-mono text-right">
                                <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                                    ${evalResult.countGte9} môn ≥ 9.0
                                </span>
                                <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                                    ${evalResult.countGte8} môn ≥ 8.0
                                </span>
                                <span class="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold">
                                    ${evalResult.countGte65} môn ≥ 6.5
                                </span>
                            </div>
                        </div>

                        <!-- Cột 3: Trạng thái môn khống chế -->
                        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
                            <div class="flex items-center justify-between text-[11px] font-bold">
                                <span class="text-slate-400 uppercase">Môn Thấp Nhất (Khống Chế)</span>
                                <span class="font-mono ${evalResult.minScore >= 6.5 ? 'text-emerald-400' : 'text-rose-400 font-bold'}">
                                    Min: ${evalResult.minScore.toFixed(1)}
                                </span>
                            </div>
                            <div class="text-xs ${evalResult.minScore >= 6.5 ? 'text-emerald-300' : 'text-rose-300'} font-semibold">
                                ${evalResult.minScore >= 6.5 
                                    ? '✅ An toàn: Tất cả các môn đều ≥ 6.5 (đạt điều kiện giữ loại Giỏi / Xuất Sắc)' 
                                    : '⚠️ Cảnh báo: Có môn < 6.5, cần kéo điểm thi để không bị hạ xếp loại!'}
                            </div>
                            <div class="text-[10px] text-slate-500">
                                Môn nhận xét (Thể dục, HĐTN, GDĐP): <strong class="${evalResult.allCommentsPassed ? 'text-emerald-400' : 'text-rose-400'}">${evalResult.allCommentsPassed ? 'Đạt' : 'Chưa Đạt'}</strong>
                            </div>
                        </div>

                    </div>

                    <!-- Chiến lược & Đề xuất AI -->
                    ${evalResult.recommendations.length > 0 ? `
                        <div class="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 space-y-1.5 text-xs text-indigo-200">
                            <div class="font-black text-indigo-300 flex items-center gap-1.5">
                                <span>💡</span> <span>Chiến Lược Tối Ưu Điểm Thi (Gợi Ý Tự Động):</span>
                            </div>
                            <ul class="space-y-1 pl-4 list-disc">
                                ${evalResult.recommendations.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                </div>

                <!-- 3. BẢNG NHẬP ĐIỂM & DỰ BÁO TỪNG MÔN -->
                <div class="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                    
                    <div class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                                📊
                            </span>
                            <div>
                                <h3 class="text-base sm:text-lg font-black text-white">Bảng Điểm Chi Tiết &amp; Dự Báo Cuối Kì</h3>
                                <p class="text-xs text-slate-400">Hệ số tính điểm: Thường xuyên (x1), Giữa kì (x2), Cuối kì (x3)</p>
                            </div>
                        </div>

                        <!-- Mục tiêu chọn -->
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-400 font-bold hidden sm:inline">Mục tiêu phấn đấu:</span>
                            <select id="gradeCalcTargetSelect" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400 transition-all cursor-pointer">
                                <option value="xuatsac" ${state.targetRank === 'xuatsac' ? 'selected' : ''}>🏆 Học Sinh Xuất Sắc (≥ 9.0)</option>
                                <option value="gioi" ${state.targetRank === 'gioi' ? 'selected' : ''}>🥇 Học Sinh Giỏi (≥ 8.0)</option>
                                <option value="kha" ${state.targetRank === 'kha' ? 'selected' : ''}>🥈 Học Sinh Khá (≥ 6.5)</option>
                                <option value="dat" ${state.targetRank === 'dat' ? 'selected' : ''}>🥉 Mức Đạt (≥ 5.0)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Danh sách các môn tính điểm số -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${state.subjects.filter(s => s.type === 'numeric').map(sub => {
                            const subAvg = calcSubjectAverage(sub);
                            const targetVal = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));
                            const needed = calcNeededExamScore(sub, targetVal);

                            return `
                                <div class="p-4 rounded-2xl bg-slate-950/70 border ${sub.active ? 'border-slate-800 hover:border-slate-700' : 'border-slate-900 opacity-50'} transition-all flex flex-col justify-between gap-3 shadow-md">
                                    
                                    <!-- Header môn -->
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-2.5">
                                            <input type="checkbox" data-sub-id="${sub.id}" class="sub-active-checkbox w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer" ${sub.active ? 'checked' : ''} title="Bật/Tắt môn này trong bảng tính">
                                            <span class="text-xl">${sub.icon}</span>
                                            <div>
                                                <span class="font-black text-sm text-white">${sub.name}</span>
                                                <span class="text-[10px] text-slate-400 block">${sub.short}</span>
                                            </div>
                                        </div>

                                        <!-- Điểm TB môn hiện tại -->
                                        <div class="text-right">
                                            <span class="text-[11px] text-slate-400 block">ĐTB Môn:</span>
                                            <span class="text-lg font-black ${
                                                subAvg.average === null ? 'text-slate-500' :
                                                (subAvg.average >= 8.0 ? 'text-emerald-400' : (subAvg.average >= 6.5 ? 'text-sky-400' : 'text-amber-400'))
                                            }">
                                                ${subAvg.average !== null ? subAvg.average.toFixed(1) : '--'}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Cột nhập điểm -->
                                    <div class="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <label class="block text-[10px] text-slate-400 font-bold mb-1">Th.Xuyên (x1)</label>
                                            <input type="text" data-sub-id="${sub.id}" data-col="tx" 
                                                   value="${Array.isArray(sub.tx) ? sub.tx.join(', ') : ''}" 
                                                   placeholder="vd: 8, 8.5"
                                                   class="sub-score-input w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-all text-center">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] text-slate-400 font-bold mb-1">Giữa Kì (x2)</label>
                                            <input type="number" step="0.1" min="0" max="10" data-sub-id="${sub.id}" data-col="gk" 
                                                   value="${sub.gk !== null && sub.gk !== undefined ? sub.gk : ''}" 
                                                   placeholder="Điểm GK"
                                                   class="sub-score-input w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-all text-center">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] text-rose-300 font-bold mb-1">Cuối Kì (x3)</label>
                                            <input type="number" step="0.1" min="0" max="10" data-sub-id="${sub.id}" data-col="ck" 
                                                   value="${sub.ck !== null && sub.ck !== undefined ? sub.ck : ''}" 
                                                   placeholder="Chưa thi"
                                                   class="sub-score-input w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border-2 border-rose-500/40 text-white font-mono text-xs focus:outline-none focus:border-rose-400 transition-all text-center font-bold">
                                        </div>
                                    </div>

                                    <!-- Thẻ dự báo điểm cần đạt -->
                                    <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-1.5 truncate">
                                            <span>🎯</span>
                                            <span class="text-slate-300 truncate">Thi CK để đạt ≥ ${targetVal.toFixed(1)}:</span>
                                        </div>
                                        <div class="shrink-0 font-bold">
                                            ${sub.ck !== null ? `
                                                <span class="text-emerald-400">Đã thi (${sub.ck})</span>
                                            ` : (
                                                needed.isSafe ? `
                                                    <span class="text-emerald-400 font-bold">An toàn (0đ vẫn đạt)</span>
                                                ` : (
                                                    needed.isFeasible ? `
                                                        <span class="${needed.difficulty === 'easy' ? 'text-emerald-400' : (needed.difficulty === 'medium' ? 'text-sky-300' : 'text-amber-300')} font-black font-mono">
                                                            Cần ≥ ${needed.neededScore.toFixed(1)} điểm
                                                        </span>
                                                    ` : `
                                                        <span class="text-rose-400 font-bold">Cần > 10đ (Khó)</span>
                                                    `
                                                )
                                            )}
                                        </div>
                                    </div>

                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Các môn nhận xét -->
                    <div class="pt-4 border-t border-white/10 space-y-3">
                        <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <span>📝</span> <span>Các Môn Đánh Giá Bằng Nhận Xét (Thể Dục, HĐTN, GDĐP):</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            ${state.subjects.filter(s => s.type === 'comment').map(sub => `
                                <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                                    <div class="flex items-center gap-2">
                                        <input type="checkbox" data-sub-id="${sub.id}" class="sub-active-checkbox w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer" ${sub.active ? 'checked' : ''}>
                                        <span class="text-lg">${sub.icon}</span>
                                        <span class="text-xs font-bold text-white">${sub.name}</span>
                                    </div>
                                    <select data-sub-id="${sub.id}" class="sub-comment-select px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold ${sub.result === 'Đạt' ? 'text-emerald-400' : 'text-rose-400'} cursor-pointer">
                                        <option value="Đạt" ${sub.result === 'Đạt' ? 'selected' : ''}>Đạt</option>
                                        <option value="Chưa đạt" ${sub.result === 'Chưa đạt' ? 'selected' : ''}>Chưa đạt</option>
                                    </select>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                </div>

            </div>
        `;

        // BIND EVENT LISTENERS
        bindEvents(containerId);
    }

    function bindEvents(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        // 1. Checkbox active
        container.querySelectorAll('.sub-active-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const subId = cb.getAttribute('data-sub-id');
                const sub = state.subjects.find(s => s.id === subId);
                if (sub) {
                    sub.active = cb.checked;
                    saveState();
                    renderGradeCalculator(containerId);
                }
            });
        });

        // 2. Điểm số input
        container.querySelectorAll('.sub-score-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const subId = input.getAttribute('data-sub-id');
                const col = input.getAttribute('data-col');
                const sub = state.subjects.find(s => s.id === subId);
                if (!sub) return;

                if (col === 'tx') {
                    const raw = input.value;
                    const parsed = raw.split(/[,;\s]+/)
                        .map(s => parseFloat(s.trim()))
                        .filter(v => !isNaN(v) && v >= 0 && v <= 10);
                    sub.tx = parsed;
                } else if (col === 'gk') {
                    const val = parseFloat(input.value);
                    sub.gk = (!isNaN(val) && val >= 0 && val <= 10) ? val : null;
                } else if (col === 'ck') {
                    const val = parseFloat(input.value);
                    sub.ck = (!isNaN(val) && val >= 0 && val <= 10) ? val : null;
                }

                saveState();
                renderGradeCalculator(containerId);
            });
        });

        // 3. Nhận xét select
        container.querySelectorAll('.sub-comment-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const subId = sel.getAttribute('data-sub-id');
                const sub = state.subjects.find(s => s.id === subId);
                if (sub) {
                    sub.result = sel.value;
                    saveState();
                    renderGradeCalculator(containerId);
                }
            });
        });

        // 4. Target rank select
        const targetSel = container.querySelector('#gradeCalcTargetSelect');
        if (targetSel) {
            targetSel.addEventListener('change', (e) => {
                state.targetRank = targetSel.value;
                saveState();
                renderGradeCalculator(containerId);
            });
        }

        // 5. Nạp điểm mẫu Demo
        const demoBtn = container.querySelector('#gradeCalcDemoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                state.subjects = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
                saveState();
                renderGradeCalculator(containerId);
                if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
            });
        }

        // 6. Reset
        const resetBtn = container.querySelector('#gradeCalcResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Em có chắc chắn muốn xóa tất cả điểm đã nhập để nhập lại từ đầu không?')) {
                    state.subjects.forEach(s => {
                        if (s.type === 'numeric') {
                            s.tx = [];
                            s.gk = null;
                            s.ck = null;
                        } else {
                            s.result = 'Đạt';
                        }
                    });
                    saveState();
                    renderGradeCalculator(containerId);
                }
            });
        }
    }

    // EXPOSE GLOBAL API
    window.GradeCalcEngine = {
        render: renderGradeCalculator,
        evaluate: evaluateClassification,
        getState: () => state,
        setState: (newState) => {
            state = Object.assign(state, newState);
            saveState();
        }
    };

})(window);
