/**
 * Sổ Điểm Điện Tử & Tính Điểm Học Sinh THPT (Chuẩn Thông Tư 22/2021/TT-BGDĐT)
 * Hỗ trợ riêng biệt: Học Kì 1, Học Kì 2 và Tổng Hợp Cả Năm (Gộp 2 học kì)
 * Giao diện bảng chuẩn VnEdu đơn giản, trực quan, tự động tính toán 100%
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'aseta_grade_calc_vnedu_v4';

    // Danh sách 14 môn học chuẩn theo đúng ảnh chụp VnEdu
    const TEMPLATE_SUBJECTS = [
        { id: 'math', tt: 1, name: 'Toán', type: 'numeric', active: true, target: 8.0 },
        { id: 'phy', tt: 2, name: 'Vật lý', type: 'numeric', active: true, target: 8.0 },
        { id: 'it', tt: 3, name: 'Tin học', type: 'numeric', active: true, target: 8.0 },
        { id: 'lit', tt: 4, name: 'Ngữ văn', type: 'numeric', active: true, target: 8.0 },
        { id: 'his', tt: 5, name: 'Lịch Sử', type: 'numeric', active: true, target: 8.0 },
        { id: 'geo', tt: 6, name: 'Địa Lý', type: 'numeric', active: true, target: 8.0 },
        { id: 'eng', tt: 7, name: 'Ngoại ngữ', type: 'numeric', active: true, target: 8.0 },
        { id: 'qpan', tt: 8, name: 'GD QP-AN', type: 'numeric', active: true, target: 8.0 },
        { id: 'pe', tt: 9, name: 'GDTC', type: 'comment', active: true, result: 'Đạt' },
        { id: 'hdtn', tt: 10, name: 'HĐTN2', type: 'comment', active: true, result: 'Đạt' },
        { id: 'chem', tt: 11, name: 'Hóa học', type: 'numeric', active: false, target: 8.0 },
        { id: 'gdktpl', tt: 12, name: 'GDKTPL', type: 'numeric', active: true, target: 8.0 },
        { id: 'gddp', tt: 13, name: 'GD ĐP', type: 'comment', active: true, result: 'Đạt' },
        { id: 'bio', tt: 14, name: 'Sinh học', type: 'numeric', active: false, target: 8.0 }
    ];

    // Điểm mẫu HK1 y hệt ảnh chụp VnEdu của bạn
    const DEFAULT_HK1 = [
        { id: 'math', tt: 1, name: 'Toán', type: 'numeric', active: true, tx1: '7.0', tx2: '', gk: '9.5', ck: '', target: 8.0 },
        { id: 'phy', tt: 2, name: 'Vật lý', type: 'numeric', active: true, tx1: '8.0', tx2: '', gk: '8.0', ck: '', target: 8.0 },
        { id: 'it', tt: 3, name: 'Tin học', type: 'numeric', active: true, tx1: '8.0', tx2: '', gk: '8.8', ck: '', target: 8.0 },
        { id: 'lit', tt: 4, name: 'Ngữ văn', type: 'numeric', active: true, tx1: '7.0', tx2: '8.0', gk: '7.0', ck: '', target: 8.0 },
        { id: 'his', tt: 5, name: 'Lịch Sử', type: 'numeric', active: true, tx1: '9.5', tx2: '', gk: '10', ck: '', target: 8.0 },
        { id: 'geo', tt: 6, name: 'Địa Lý', type: 'numeric', active: true, tx1: '9.3', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'eng', tt: 7, name: 'Ngoại ngữ', type: 'numeric', active: true, tx1: '6.8', tx2: '', gk: '8.5', ck: '', target: 8.0 },
        { id: 'qpan', tt: 8, name: 'GD QP-AN', type: 'numeric', active: true, tx1: '7.5', tx2: '', gk: '8.5', ck: '', target: 8.0 },
        { id: 'pe', tt: 9, name: 'GDTC', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'hdtn', tt: 10, name: 'HĐTN2', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'chem', tt: 11, name: 'Hóa học', type: 'numeric', active: false, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'gdktpl', tt: 12, name: 'GDKTPL', type: 'numeric', active: true, tx1: '8.5', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'gddp', tt: 13, name: 'GD ĐP', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'bio', tt: 14, name: 'Sinh học', type: 'numeric', active: false, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 }
    ];

    // Mặc định HK2 (ô trống để học sinh tự nhập dần)
    const DEFAULT_HK2 = [
        { id: 'math', tt: 1, name: 'Toán', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'phy', tt: 2, name: 'Vật lý', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'it', tt: 3, name: 'Tin học', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'lit', tt: 4, name: 'Ngữ văn', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'his', tt: 5, name: 'Lịch Sử', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'geo', tt: 6, name: 'Địa Lý', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'eng', tt: 7, name: 'Ngoại ngữ', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'qpan', tt: 8, name: 'GD QP-AN', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'pe', tt: 9, name: 'GDTC', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'hdtn', tt: 10, name: 'HĐTN2', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'chem', tt: 11, name: 'Hóa học', type: 'numeric', active: false, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'gdktpl', tt: 12, name: 'GDKTPL', type: 'numeric', active: true, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 },
        { id: 'gddp', tt: 13, name: 'GD ĐP', type: 'comment', active: true, tx1: 'Đ', tx2: '', gk: 'Đ', ck: 'Đ', result: 'Đạt' },
        { id: 'bio', tt: 14, name: 'Sinh học', type: 'numeric', active: false, tx1: '', tx2: '', gk: '', ck: '', target: 8.0 }
    ];

    let state = {
        currentTab: 'hk1', // 'hk1', 'hk2', 'canam'
        targetRank: 'gioi', // 'xuatsac', 'gioi', 'kha', 'dat'
        hk1: JSON.parse(JSON.stringify(DEFAULT_HK1)),
        hk2: JSON.parse(JSON.stringify(DEFAULT_HK2))
    };

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.hk1) && Array.isArray(parsed.hk2)) {
                    state = Object.assign(state, parsed);
                }
            } else {
                // Tương thích ngược từ v3 nếu có
                const oldRaw = localStorage.getItem('aseta_grade_calc_vnedu_v3');
                if (oldRaw) {
                    const oldParsed = JSON.parse(oldRaw);
                    if (oldParsed && Array.isArray(oldParsed.subjects)) {
                        state.hk1 = oldParsed.subjects;
                    }
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

    function parseNum(val) {
        if (val === null || val === undefined) return null;
        const str = String(val).trim().replace(',', '.');
        if (str === '') return null;
        const n = parseFloat(str);
        if (isNaN(n) || n < 0 || n > 10) return null;
        return n;
    }

    // TÍNH ĐIỂM TRUNG BÌNH MÔN TRONG 1 HỌC KÌ
    function calcSubjectRow(sub) {
        if (sub.type === 'comment') {
            const isPassed = (sub.result === 'Đạt' || sub.tx1 === 'Đ' || sub.gk === 'Đ');
            return {
                isComment: true,
                avgText: isPassed ? 'Đạt' : 'Chưa Đạt',
                avgVal: null,
                isPassed: isPassed,
                hasCk: true
            };
        }

        const t1 = parseNum(sub.tx1);
        const t2 = parseNum(sub.tx2);
        const gk = parseNum(sub.gk);
        const ck = parseNum(sub.ck);

        let totalScore = 0;
        let totalCoeff = 0;

        if (t1 !== null) { totalScore += t1 * 1; totalCoeff += 1; }
        if (t2 !== null) { totalScore += t2 * 1; totalCoeff += 1; }
        if (gk !== null) { totalScore += gk * 2; totalCoeff += 2; }
        if (ck !== null) { totalScore += ck * 3; totalCoeff += 3; }

        if (totalCoeff === 0) {
            return { isComment: false, avgText: '—', avgVal: null, hasCk: false };
        }

        const avg = Math.round((totalScore / totalCoeff) * 10) / 10;
        const hasCk = ck !== null;
        return {
            isComment: false,
            avgText: avg.toFixed(1),
            avgVal: avg,
            hasCk: hasCk
        };
    }

    // TÍNH ĐIỂM THI CUỐI KÌ CẦN ĐẠT TRONG 1 HỌC KÌ
    function calcNeededCK(sub, targetScore) {
        if (sub.type === 'comment') return '✅ Đạt';

        const t1 = parseNum(sub.tx1);
        const t2 = parseNum(sub.tx2);
        const gk = parseNum(sub.gk);
        const ck = parseNum(sub.ck);

        if (ck !== null) {
            const currentAvg = calcSubjectRow(sub).avgVal;
            if (currentAvg >= targetScore) return '✅ Đã đạt mục tiêu';
            return `Đã thi: ${currentAvg.toFixed(1)}`;
        }

        let existingScore = 0;
        let txCount = 0;
        if (t1 !== null) { existingScore += t1 * 1; txCount++; }
        if (t2 !== null) { existingScore += t2 * 1; txCount++; }

        if (txCount === 0 && gk === null) return `Cần ≥ ${targetScore.toFixed(1)}`;

        const effectiveTxCount = Math.max(txCount, 1);
        if (gk !== null) {
            existingScore += gk * 2;
        } else {
            const avgTx = txCount > 0 ? (existingScore / txCount) : targetScore;
            existingScore += avgTx * 2;
        }

        const totalCoeff = effectiveTxCount + 2 + 3;
        const needed = (targetScore * totalCoeff - existingScore) / 3;
        const rounded = Math.round(needed * 10) / 10;

        if (rounded <= 0) return '✅ An toàn (≥ 0đ)';
        if (rounded > 10.0) return `⚠️ Cần > 10đ (Khó)`;
        return `Cần ≥ ${rounded.toFixed(1)}`;
    }

    // TÍNH ĐIỂM TRUNG BÌNH MÔN CẢ NĂM (THÔNG TƯ 22: (ĐTB_HK1 + ĐTB_HK2 x 2) / 3)
    function calcYearAverage(sub1, sub2) {
        if (sub1.type === 'comment') {
            const passed1 = (sub1.result === 'Đạt' || sub1.tx1 === 'Đ' || sub1.gk === 'Đ');
            const passed2 = (sub2.result === 'Đạt' || sub2.tx1 === 'Đ' || sub2.gk === 'Đ');
            // TT22: Cả năm Đạt nếu HK2 Đạt
            const isYearPassed = passed2 || (passed1 && passed2);
            return {
                isComment: true,
                avgText: isYearPassed ? 'Đạt' : 'Chưa Đạt',
                avgVal: null,
                isPassed: isYearPassed
            };
        }

        const avg1 = calcSubjectRow(sub1).avgVal;
        const avg2 = calcSubjectRow(sub2).avgVal;

        if (avg1 === null && avg2 === null) {
            return { isComment: false, avgText: '—', avgVal: null, status: 'empty' };
        }

        if (avg1 !== null && avg2 !== null) {
            // Cả 2 học kì đều có điểm: công thức chuẩn TT22 (HK1 + HK2 x 2) / 3
            const yearAvg = Math.round(((avg1 + avg2 * 2) / 3) * 10) / 10;
            return {
                isComment: false,
                avgText: yearAvg.toFixed(1),
                avgVal: yearAvg,
                status: 'official'
            };
        }

        if (avg1 !== null && avg2 === null) {
            // Mới có HK1, chưa có HK2
            return {
                isComment: false,
                avgText: `${avg1.toFixed(1)}*`,
                avgVal: avg1,
                status: 'provisional'
            };
        }

        return {
            isComment: false,
            avgText: `${avg2.toFixed(1)}*`,
            avgVal: avg2,
            status: 'provisional'
        };
    }

    // TÍNH ĐTB HK2 CẦN ĐẠT ĐỂ CẢ NĂM ĐẠT MỤC TIÊU (ƯỚC LƯỢNG NGƯỢC CẢ NĂM)
    function calcNeededHK2(sub1, targetScore) {
        if (sub1.type === 'comment') return '✅ Đạt';
        const avg1 = calcSubjectRow(sub1).avgVal;
        if (avg1 === null) return `Cần HK2 ≥ ${targetScore.toFixed(1)}`;

        // (avg1 + 2 * avg2) / 3 >= target => avg2 >= (3 * target - avg1) / 2
        const needed = (3 * targetScore - avg1) / 2;
        const rounded = Math.round(needed * 10) / 10;

        if (rounded <= 0) return '✅ An toàn (≥ 0đ)';
        if (rounded > 10.0) return `⚠️ Cần HK2 > 10đ (Khó)`;
        return `Cần HK2 ≥ ${rounded.toFixed(1)}`;
    }

    // ĐÁNH GIÁ VÀ XẾP LOẠI (HỌC KÌ HOẶC CẢ NĂM) THEO THÔNG TƯ 22
    function evaluateClassification(subjectsOrCombined) {
        const activeNumeric = subjectsOrCombined.filter(s => s.active && s.type === 'numeric');
        const activeComment = subjectsOrCombined.filter(s => s.active && s.type === 'comment');

        const validScores = activeNumeric.map(s => s.avgVal).filter(v => v !== null && !isNaN(v));
        const countGte9 = validScores.filter(s => s >= 9.0).length;
        const countGte8 = validScores.filter(s => s >= 8.0).length;
        const countGte65 = validScores.filter(s => s >= 6.5).length;
        const countGte5 = validScores.filter(s => s >= 5.0).length;
        const countLt35 = validScores.filter(s => s < 3.5).length;
        const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

        const overallAvg = validScores.length > 0 
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
            : 0;

        const allCommentsPassed = activeComment.every(s => s.isPassed);

        let rankTitle = 'Chưa Đạt';
        let rankBadge = '⚠️';
        let rankColor = 'text-rose-400';
        let detailNote = '';
        let adviceNote = '';

        if (validScores.length >= 6) {
            if (countGte9 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rankTitle = 'Học Sinh Xuất Sắc';
                rankBadge = '🏆';
                rankColor = 'text-amber-400';
                detailNote = `Đạt tiêu chuẩn Xuất Sắc: Có ${countGte9} môn ≥ 9.0 (quy định ≥ 6 môn), môn thấp nhất là ${minScore.toFixed(1)} (quy định ≥ 6.5).`;
            } else if (countGte8 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rankTitle = 'Học Sinh Giỏi';
                rankBadge = '🥇';
                rankColor = 'text-emerald-400';
                detailNote = `Đạt tiêu chuẩn Giỏi: Có ${countGte8} môn ≥ 8.0 (quy định ≥ 6 môn), môn thấp nhất là ${minScore.toFixed(1)} (quy định ≥ 6.5).`;
                const needed9 = 6 - countGte9;
                adviceNote = `💡 Để lên Xuất Sắc: Cần thêm ${needed9} môn đạt ≥ 9.0 nữa.`;
            } else if (countGte65 >= 6 && minScore >= 5.0 && allCommentsPassed) {
                rankTitle = 'Học Sinh Khá';
                rankBadge = '🥈';
                rankColor = 'text-sky-400';
                detailNote = `Đạt tiêu chuẩn Khá: Có ${countGte65} môn ≥ 6.5 (quy định ≥ 6 môn), môn thấp nhất là ${minScore.toFixed(1)} (quy định ≥ 5.0).`;
                const needed8 = 6 - countGte8;
                adviceNote = `🎯 Để lên Giỏi: Cần kéo thêm ${needed8} môn lên ≥ 8.0 và đảm bảo mọi môn ≥ 6.5.`;
            } else if (countGte5 >= 6 && countLt35 === 0) {
                rankTitle = 'Mức Đạt';
                rankBadge = '🥉';
                rankColor = 'text-teal-400';
                detailNote = `Đạt mức Đạt: Có ${countGte5} môn ≥ 5.0, không có môn nào dưới 3.5.`;
            } else {
                rankTitle = 'Chưa Đạt';
                rankBadge = '⚠️';
                rankColor = 'text-rose-400';
                detailNote = `Có môn dưới 3.5 hoặc chưa đủ điều kiện xếp loại.`;
            }
        } else {
            rankTitle = 'Đang Nhập Điểm';
            rankBadge = '📝';
            rankColor = 'text-slate-300';
            detailNote = `Hãy nhập điểm ít nhất 6 môn để hệ thống tự xếp loại.`;
        }

        return {
            rankTitle: rankTitle,
            rankBadge: rankBadge,
            rankColor: rankColor,
            overallAvg: overallAvg,
            detailNote: detailNote,
            adviceNote: adviceNote
        };
    }

    // SAO CHÉP ĐIỂM HK1 SANG HK2 ĐỂ THỬ NGHIỆM TỔNG HỢP CẢ NĂM
    function copyHk1ToHk2() {
        state.hk2 = JSON.parse(JSON.stringify(state.hk1));
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    // NẠP LẠI BỘ ĐIỂM GỐC THEO ẢNH CHỤP VNEDU (HK1)
    function loadHk1PhotoData() {
        state.hk1 = JSON.parse(JSON.stringify(DEFAULT_HK1));
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    // XÓA ĐIỂM HỌC KÌ ĐANG CHỌN
    function clearCurrentSemesterData() {
        const targetList = (state.currentTab === 'hk2') ? state.hk2 : state.hk1;
        const name = (state.currentTab === 'hk2') ? 'Học Kì 2' : 'Học Kì 1';
        if (!confirm(`Bạn có muốn xóa trắng bảng điểm của ${name} để tự nhập lại từ đầu không?`)) return;

        targetList.forEach(s => {
            if (s.type === 'numeric') {
                s.tx1 = '';
                s.tx2 = '';
                s.gk = '';
                s.ck = '';
            } else {
                s.tx1 = 'Đ';
                s.tx2 = '';
                s.gk = 'Đ';
                s.ck = 'Đ';
                s.result = 'Đạt';
            }
        });
        saveState();
        renderGradeCalculator();
    }

    // RENDER BẢNG CHO 1 HỌC KÌ (HK1 HOẶC HK2)
    function renderSemesterTable(subjects, semName, semKey, targetNum) {
        return `
            <div class="rounded-2xl border border-teal-600/60 overflow-hidden shadow-2xl bg-slate-900">
                <div class="overflow-x-auto no-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[620px]">
                        <thead>
                            <tr class="bg-[#149b9b] text-white text-xs font-bold uppercase tracking-wider text-center">
                                <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-12">TT</th>
                                <th rowspan="2" class="py-2.5 px-3 border-r border-teal-500/40 text-left min-w-[120px]">Môn</th>
                                <th colspan="2" class="py-1 px-2 border-r border-teal-500/40 border-b border-teal-500/40">ĐGTX</th>
                                <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-16">ĐGGK</th>
                                <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-16 bg-teal-700/60">ĐGCK<br><span class="text-[9px] font-normal lowercase">(Thi HK)</span></th>
                                <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-20 bg-teal-800/80">ĐTB ${semName}<br><span class="text-[9px] font-normal lowercase text-emerald-200">★ Tự tính</span></th>
                                <th rowspan="2" class="py-2.5 px-3 min-w-[130px] bg-slate-950/40 text-amber-200">Cần Thi CK<br><span class="text-[9px] font-normal lowercase text-slate-200">Để đạt mục tiêu</span></th>
                            </tr>
                            <tr class="bg-[#128a8a] text-teal-100 text-[11px] font-bold text-center">
                                <th class="py-1 px-1 border-r border-teal-500/40 w-14">1</th>
                                <th class="py-1 px-1 border-r border-teal-500/40 w-14">2</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 text-xs sm:text-sm text-slate-100">
                            ${subjects.map((sub, idx) => {
                                const calc = calcSubjectRow(sub);
                                const neededCK = calcNeededCK(sub, targetNum);
                                const rowBg = idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850/60';

                                if (sub.type === 'numeric') {
                                    return `
                                        <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}" data-sem="${semKey}" data-sub-id="${sub.id}">
                                            <td class="py-2 px-1 text-center font-bold text-slate-400 border-r border-slate-800">${sub.tt || idx + 1}</td>
                                            <td class="py-2 px-3 border-r border-slate-800 font-bold text-white">${sub.name}</td>
                                            
                                            <!-- ĐGTX 1 -->
                                            <td class="p-1 border-r border-slate-800 text-center">
                                                <input type="text" inputmode="decimal" value="${sub.tx1 || ''}" 
                                                       data-sem="${semKey}" data-sub-id="${sub.id}" data-field="tx1"
                                                       class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-slate-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-white rounded outline-none transition-all">
                                            </td>

                                            <!-- ĐGTX 2 -->
                                            <td class="p-1 border-r border-slate-800 text-center">
                                                <input type="text" inputmode="decimal" value="${sub.tx2 || ''}" 
                                                       data-sem="${semKey}" data-sub-id="${sub.id}" data-field="tx2"
                                                       class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-slate-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-white rounded outline-none transition-all">
                                            </td>

                                            <!-- ĐGGK -->
                                            <td class="p-1 border-r border-slate-800 text-center bg-teal-950/10">
                                                <input type="text" inputmode="decimal" value="${sub.gk || ''}" 
                                                       data-sem="${semKey}" data-sub-id="${sub.id}" data-field="gk"
                                                       class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-teal-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-teal-300 rounded outline-none transition-all">
                                            </td>

                                            <!-- ĐGCK -->
                                            <td class="p-1 border-r border-slate-800 text-center bg-amber-950/10">
                                                <input type="text" inputmode="decimal" value="${sub.ck || ''}" 
                                                       placeholder=""
                                                       title="Điểm thi học kì (hệ số 3). Để trống nếu chưa thi!"
                                                       data-sem="${semKey}" data-sub-id="${sub.id}" data-field="ck"
                                                       class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-amber-700 focus:border-amber-400 focus:bg-slate-950 font-bold text-amber-300 rounded outline-none transition-all">
                                            </td>

                                            <!-- ĐTB MÔN -->
                                            <td class="py-2 px-1 border-r border-slate-800 text-center font-black text-sm text-emerald-400 bg-slate-950/40" data-cell="avg">
                                                ${calc.avgText}
                                            </td>

                                            <!-- CẦN THI CK -->
                                            <td class="py-2 px-2 text-center font-bold text-xs ${neededCK.includes('⚠️') ? 'text-rose-400' : 'text-amber-300'}" data-cell="needed">
                                                ${neededCK}
                                            </td>
                                        </tr>
                                    `;
                                } else {
                                    // MÔN NHẬN XÉT: GDTC, HĐTN2, GD ĐP
                                    return `
                                        <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}" data-sem="${semKey}" data-sub-id="${sub.id}">
                                            <td class="py-2 px-1 text-center font-bold text-slate-400 border-r border-slate-800">${sub.tt || idx + 1}</td>
                                            <td class="py-2 px-3 border-r border-slate-800 font-bold text-white">${sub.name}</td>
                                            <td class="p-1 border-r border-slate-800 text-center">
                                                <button type="button" data-sem="${semKey}" data-toggle-comment="${sub.id}" data-field="tx1" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                    ${sub.tx1 || 'Đ'}
                                                </button>
                                            </td>
                                            <td class="p-1 border-r border-slate-800 text-center text-slate-600 font-mono">—</td>
                                            <td class="p-1 border-r border-slate-800 text-center bg-teal-950/10">
                                                <button type="button" data-sem="${semKey}" data-toggle-comment="${sub.id}" data-field="gk" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                    ${sub.gk || 'Đ'}
                                                </button>
                                            </td>
                                            <td class="p-1 border-r border-slate-800 text-center bg-amber-950/10">
                                                <button type="button" data-sem="${semKey}" data-toggle-comment="${sub.id}" data-field="ck" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                    ${sub.ck || 'Đ'}
                                                </button>
                                            </td>
                                            <td class="py-2 px-1 border-r border-slate-800 text-center font-bold text-emerald-400 bg-slate-950/40">Đạt</td>
                                            <td class="py-2 px-2 text-center text-xs text-slate-400">✅ Đạt yêu cầu</td>
                                        </tr>
                                    `;
                                }
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // RENDER BẢNG TỔNG HỢP CẢ NĂM (GỘP 2 HỌC KÌ LẠI THEO CHUẨN THÔNG TƯ 22)
    function renderCombinedYearTable(targetNum) {
        return `
            <div class="rounded-2xl border border-teal-600/60 overflow-hidden shadow-2xl bg-slate-900">
                <div class="p-3 bg-teal-950/40 border-b border-teal-800/40 flex items-center justify-between text-xs text-teal-200">
                    <span>📌 <strong>Công thức Thông tư 22:</strong> ĐTB Cả Năm = (ĐTB HK1 + ĐTB HK2 × 2) / 3 (Học kì 2 tính hệ số 2)</span>
                    <span class="text-slate-400 font-mono">Dấu (*) là điểm tạm tính khi chưa đủ 2 kì</span>
                </div>
                <div class="overflow-x-auto no-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[620px]">
                        <thead>
                            <tr class="bg-gradient-to-r from-teal-700 via-[#149b9b] to-emerald-700 text-white text-xs font-bold uppercase tracking-wider text-center">
                                <th class="py-2.5 px-2 border-r border-teal-500/40 w-12">TT</th>
                                <th class="py-2.5 px-3 border-r border-teal-500/40 text-left min-w-[130px]">Môn</th>
                                <th class="py-2.5 px-2.5 border-r border-teal-500/40 w-24">ĐTB HK1<br><span class="text-[9px] font-normal lowercase">(hệ số 1)</span></th>
                                <th class="py-2.5 px-2.5 border-r border-teal-500/40 w-24">ĐTB HK2<br><span class="text-[9px] font-normal lowercase text-amber-200">(hệ số 2)</span></th>
                                <th class="py-2.5 px-2.5 border-r border-teal-500/40 w-28 bg-teal-800/90">ĐTB Cả Năm<br><span class="text-[9px] font-normal lowercase text-emerald-300">★ Tự tính</span></th>
                                <th class="py-2.5 px-3 border-r border-teal-500/40 text-center w-28">Đánh Giá</th>
                                <th class="py-2.5 px-3 text-center min-w-[140px] bg-slate-950/40 text-amber-200">Dự Báo HK2 Cần Đạt<br><span class="text-[9px] font-normal lowercase text-slate-200">Để cả năm đạt mục tiêu</span></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 text-xs sm:text-sm text-slate-100">
                            ${state.hk1.map((sub1, idx) => {
                                const sub2 = state.hk2[idx] || sub1;
                                const avg1 = calcSubjectRow(sub1);
                                const avg2 = calcSubjectRow(sub2);
                                const yearRes = calcYearAverage(sub1, sub2);
                                const neededHK2 = calcNeededHK2(sub1, targetNum);
                                const rowBg = idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850/60';

                                if (sub1.type === 'numeric') {
                                    let badgeColor = 'text-emerald-400';
                                    if (yearRes.avgVal !== null) {
                                        if (yearRes.avgVal >= 8.0) badgeColor = 'text-emerald-400 font-black';
                                        else if (yearRes.avgVal >= 6.5) badgeColor = 'text-sky-300 font-bold';
                                        else badgeColor = 'text-amber-300 font-bold';
                                    }

                                    return `
                                        <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}">
                                            <td class="py-2.5 px-1 text-center font-bold text-slate-400 border-r border-slate-800">${sub1.tt || idx + 1}</td>
                                            <td class="py-2.5 px-3 border-r border-slate-800 font-bold text-white">${sub1.name}</td>
                                            
                                            <!-- ĐTB HK1 -->
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-mono font-bold text-slate-200">
                                                ${avg1.avgText}
                                            </td>

                                            <!-- ĐTB HK2 -->
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-mono font-bold text-amber-300">
                                                ${avg2.avgText}
                                            </td>

                                            <!-- ĐTB CẢ NĂM -->
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-mono text-base ${badgeColor} bg-slate-950/50">
                                                ${yearRes.avgText}
                                            </td>

                                            <!-- ĐÁNH GIÁ MÔN -->
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-bold text-xs">
                                                ${yearRes.avgVal !== null 
                                                    ? (yearRes.avgVal >= 8.0 ? '<span class="text-emerald-400">Giỏi / Tốt</span>' : (yearRes.avgVal >= 6.5 ? '<span class="text-sky-300">Khá</span>' : '<span class="text-amber-300">Đạt</span>'))
                                                    : '—'}
                                            </td>

                                            <!-- DỰ BÁO HK2 CẦN ĐẠT -->
                                            <td class="py-2.5 px-2 text-center font-bold text-xs ${neededHK2.includes('⚠️') ? 'text-rose-400' : 'text-amber-300'}">
                                                ${avg2.hasCk ? '✅ Đã hoàn thành cả năm' : neededHK2}
                                            </td>
                                        </tr>
                                    `;
                                } else {
                                    // MÔN NHẬN XÉT: GDTC, HĐTN2, GD ĐP
                                    return `
                                        <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}">
                                            <td class="py-2.5 px-1 text-center font-bold text-slate-400 border-r border-slate-800">${sub1.tt || idx + 1}</td>
                                            <td class="py-2.5 px-3 border-r border-slate-800 font-bold text-white">${sub1.name}</td>
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-bold text-emerald-400">Đạt</td>
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-bold text-emerald-400">Đạt</td>
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-bold text-emerald-400 bg-slate-950/50">Đạt</td>
                                            <td class="py-2.5 px-2 text-center border-r border-slate-800 font-bold text-xs text-emerald-400">✅ Đạt</td>
                                            <td class="py-2.5 px-2 text-center text-xs text-slate-400">✅ Đạt yêu cầu</td>
                                        </tr>
                                    `;
                                }
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // RENDER GIAO DIỆN CHÍNH
    function renderGradeCalculator(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        loadState();
        const targetNum = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));

        // Tính kết quả xếp loại tùy theo tab đang chọn
        let evalRes;
        let tabHeading = '';

        if (state.currentTab === 'hk1') {
            const subsCalc = state.hk1.map(s => {
                const c = calcSubjectRow(s);
                return { active: s.active, type: s.type, avgVal: c.avgVal, isPassed: c.isPassed };
            });
            evalRes = evaluateClassification(subsCalc);
            tabHeading = 'Học Kì 1';
        } else if (state.currentTab === 'hk2') {
            const subsCalc = state.hk2.map(s => {
                const c = calcSubjectRow(s);
                return { active: s.active, type: s.type, avgVal: c.avgVal, isPassed: c.isPassed };
            });
            evalRes = evaluateClassification(subsCalc);
            tabHeading = 'Học Kì 2';
        } else {
            // Cả năm
            const subsYear = state.hk1.map((s1, idx) => {
                const s2 = state.hk2[idx] || s1;
                const c = calcYearAverage(s1, s2);
                return { active: s1.active, type: s1.type, avgVal: c.avgVal, isPassed: c.isPassed };
            });
            evalRes = evaluateClassification(subsYear);
            tabHeading = 'Tổng Kết Cả Năm';
        }

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans text-slate-100 animate-fadeIn">
                
                <!-- 1. THANH CHUYỂN TAB 3 HỌC KÌ: HK1 • HK2 • CẢ NĂM (GỘP) -->
                <div class="flex items-center justify-between flex-wrap gap-3 px-1">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            <span>Sổ Điểm Điện Tử THPT</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                ${tabHeading}
                            </span>
                        </h2>
                        <p class="text-xs text-slate-400">Chọn học kì để nhập điểm • Tab Cả Năm sẽ tự động gộp và nhân hệ số HK2</p>
                    </div>

                    <!-- Segmented Tabs chọn Học Kì -->
                    <div class="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                        <button type="button" data-switch-tab="hk1" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'hk1' ? 'bg-[#149b9b] text-white shadow-md' : 'text-slate-400 hover:text-white'}">
                            📘 Học Kì 1
                        </button>
                        <button type="button" data-switch-tab="hk2" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'hk2' ? 'bg-[#149b9b] text-white shadow-md' : 'text-slate-400 hover:text-white'}">
                            📙 Học Kì 2
                        </button>
                        <button type="button" data-switch-tab="canam" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'canam' ? 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
                            🏆 Cả Năm (Gộp)
                        </button>
                    </div>
                </div>

                <!-- 2. THANH TIỆN ÍCH DÀNH RIÊNG CHO TỪNG TAB -->
                <div class="flex items-center justify-between flex-wrap gap-2 px-1">
                    <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
                        <span class="text-slate-400 font-bold">Mục tiêu phấn đấu:</span>
                        <select id="vneduTargetSelect" class="bg-transparent text-amber-300 font-black focus:outline-none cursor-pointer">
                            <option value="xuatsac" ${state.targetRank === 'xuatsac' ? 'selected' : ''}>🏆 Xuất Sắc (≥ 9.0)</option>
                            <option value="gioi" ${state.targetRank === 'gioi' ? 'selected' : ''}>🥇 Học Sinh Giỏi (≥ 8.0)</option>
                            <option value="kha" ${state.targetRank === 'kha' ? 'selected' : ''}>🥈 Học Sinh Khá (≥ 6.5)</option>
                            <option value="dat" ${state.targetRank === 'dat' ? 'selected' : ''}>🥉 Mức Đạt (≥ 5.0)</option>
                        </select>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap">
                        ${state.currentTab === 'hk1' ? `
                            <button type="button" id="btnHk1Photo" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-md">
                                📸 Nạp điểm theo ảnh VnEdu
                            </button>
                            <button type="button" id="btnClearSem" class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer">
                                🔄 Xóa trắng HK1
                            </button>
                        ` : (state.currentTab === 'hk2' ? `
                            <button type="button" id="btnCopyHk1ToHk2" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow-md" title="Lấy điểm HK1 làm giả định cho HK2 để xem thử xếp loại Cả Năm">
                                📋 Lấy điểm HK1 làm giả định
                            </button>
                            <button type="button" id="btnClearSem" class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer">
                                🔄 Xóa trắng HK2
                            </button>
                        ` : `
                            <button type="button" data-switch-tab="hk2" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white transition-all cursor-pointer shadow-md">
                                ✏️ Sang HK2 để chỉnh điểm
                            </button>
                        `)}
                    </div>
                </div>

                <!-- 3. HIỂN THỊ BẢNG ĐIỂM THEO TAB -->
                ${state.currentTab === 'hk1' 
                    ? renderSemesterTable(state.hk1, 'HK1', 'hk1', targetNum)
                    : (state.currentTab === 'hk2'
                        ? renderSemesterTable(state.hk2, 'HK2', 'hk2', targetNum)
                        : renderCombinedYearTable(targetNum)
                    )
                }

                <!-- 4. HỘP TỔNG KẾT XẾP LOẠI DƯỚI BẢNG (THEO ĐÚNG HỌC KÌ ĐANG CHỌN) -->
                <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl space-y-2.5">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2.5">
                            <span class="text-3xl">${evalRes.rankBadge}</span>
                            <div>
                                <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    ${state.currentTab === 'canam' ? 'Dự Báo Xếp Loại Cả Năm:' : `Dự Báo Xếp Loại ${tabHeading}:`}
                                </span>
                                <div class="text-lg sm:text-xl font-black ${evalRes.rankColor}">
                                    ${evalRes.rankTitle}
                                </div>
                            </div>
                        </div>

                        <!-- Điểm trung bình chung -->
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block font-bold">
                                ${state.currentTab === 'canam' ? 'ĐTB Chung Cả Năm:' : `ĐTB Chung ${tabHeading}:`}
                            </span>
                            <span class="text-2xl font-black text-emerald-400">${evalRes.overallAvg.toFixed(1)}</span>
                        </div>
                    </div>

                    <div class="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                        ${evalRes.detailNote}
                        ${evalRes.adviceNote ? `<div class="text-amber-300 font-bold mt-1">${evalRes.adviceNote}</div>` : ''}
                    </div>
                </div>

            </div>
        `;

        bindEvents(container);
    }

    // GẮN SỰ KIỆN TƯƠNG TÁC
    function bindEvents(container) {
        // Chuyển Tab (HK1, HK2, Cả Năm)
        container.querySelectorAll('[data-switch-tab]').forEach(btn => {
            btn.onclick = () => {
                state.currentTab = btn.dataset.switchTab;
                saveState();
                renderGradeCalculator();
            };
        });

        // Dropdown mục tiêu
        const sel = container.querySelector('#vneduTargetSelect');
        if (sel) {
            sel.onchange = (e) => {
                state.targetRank = e.target.value;
                saveState();
                renderGradeCalculator();
            };
        }

        // Nút nạp ảnh HK1
        const btnPhoto = container.querySelector('#btnHk1Photo');
        if (btnPhoto) btnPhoto.onclick = () => loadHk1PhotoData();

        // Nút sao chép HK1 sang HK2
        const btnCopy = container.querySelector('#btnCopyHk1ToHk2');
        if (btnCopy) btnCopy.onclick = () => copyHk1ToHk2();

        // Nút xóa trắng học kì hiện tại
        const btnClear = container.querySelector('#btnClearSem');
        if (btnClear) btnClear.onclick = () => clearCurrentSemesterData();

        // Toggle môn nhận xét
        container.querySelectorAll('button[data-toggle-comment]').forEach(btn => {
            btn.onclick = () => {
                const semKey = btn.dataset.sem;
                const subId = btn.dataset.toggleComment;
                const field = btn.dataset.field;
                const targetList = (semKey === 'hk2') ? state.hk2 : state.hk1;
                const sub = targetList.find(s => s.id === subId);
                if (sub) {
                    sub[field] = (sub[field] === 'Đ') ? 'CĐ' : 'Đ';
                    sub.result = (sub.tx1 === 'CĐ' || sub.gk === 'CĐ' || sub.ck === 'CĐ') ? 'Chưa Đạt' : 'Đạt';
                    saveState();
                    renderGradeCalculator();
                }
            };
        });

        // Gõ điểm số trong ô input
        container.querySelectorAll('.vnedu-input').forEach(inp => {
            inp.oninput = (e) => {
                const semKey = inp.dataset.sem;
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                const val = inp.value.trim();

                const targetList = (semKey === 'hk2') ? state.hk2 : state.hk1;
                const sub = targetList.find(s => s.id === subId);
                if (sub) {
                    sub[field] = val;
                    saveState();

                    // Cập nhật cell ĐTB và Cần Thi CK của hàng đó ngay lập tức
                    const row = inp.closest('tr');
                    if (row) {
                        const targetNum = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));
                        const calc = calcSubjectRow(sub);
                        const needed = calcNeededCK(sub, targetNum);

                        const avgCell = row.querySelector('[data-cell="avg"]');
                        if (avgCell) avgCell.innerText = calc.avgText;

                        const neededCell = row.querySelector('[data-cell="needed"]');
                        if (neededCell) {
                            neededCell.innerText = needed;
                            neededCell.className = `py-2 px-2 text-center font-bold text-xs ${needed.includes('⚠️') ? 'text-rose-400' : 'text-amber-300'}`;
                        }
                    }
                }
            };

            inp.onblur = () => {
                const semKey = inp.dataset.sem;
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                const targetList = (semKey === 'hk2') ? state.hk2 : state.hk1;
                const sub = targetList.find(s => s.id === subId);
                if (sub && sub[field]) {
                    const n = parseNum(sub[field]);
                    if (n !== null) {
                        sub[field] = n.toFixed(1);
                        inp.value = sub[field];
                        saveState();
                    }
                }
                // Cập nhật lại tổng kết xếp loại bên dưới
                const subsCalc = targetList.map(s => {
                    const c = calcSubjectRow(s);
                    return { active: s.active, type: s.type, avgVal: c.avgVal, isPassed: c.isPassed };
                });
                const evalRes = evaluateClassification(subsCalc);
                const rankTitle = container.querySelector('.text-lg.sm\\:text-xl.font-black');
                if (rankTitle) {
                    rankTitle.innerText = evalRes.rankTitle;
                    rankTitle.className = `text-lg sm:text-xl font-black ${evalRes.rankColor}`;
                }
                const overallAvg = container.querySelector('.text-2xl.font-black.text-emerald-400');
                if (overallAvg) overallAvg.innerText = evalRes.overallAvg.toFixed(1);
            };

            inp.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const allInputs = Array.from(container.querySelectorAll('.vnedu-input'));
                    const curIndex = allInputs.indexOf(inp);
                    if (curIndex >= 0 && curIndex < allInputs.length - 1) {
                        allInputs[curIndex + 1].focus();
                        allInputs[curIndex + 1].select();
                    }
                }
            };
        });
    }

    // EXPOSE GLOBAL API
    window.GradeCalcEngine = {
        render: renderGradeCalculator,
        loadHk1PhotoData: loadHk1PhotoData,
        copyHk1ToHk2: copyHk1ToHk2,
        clearCurrentSemesterData: clearCurrentSemesterData,
        switchTab: (tab) => {
            state.currentTab = tab;
            saveState();
            renderGradeCalculator();
        },
        getState: () => state
    };

})(window);
