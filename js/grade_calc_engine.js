/**
 * Sổ Điểm Điện Tử & Tính Điểm Học Sinh THPT (Chuẩn Thông Tư 22/2021/TT-BGDĐT)
 * Giao diện bảng nhập điểm đơn giản, trực quan y hệt VnEdu
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'aseta_grade_calc_vnedu_v3';

    // Danh sách môn học chuẩn theo đúng ảnh chụp VnEdu
    const INITIAL_SUBJECTS = [
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

    let state = {
        subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
        targetRank: 'gioi' // 'xuatsac', 'gioi', 'kha', 'dat'
    };

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

    // Chuyển chuỗi sang số hợp lệ (ví dụ "7.0", "7,5", "10")
    function parseNum(val) {
        if (val === null || val === undefined) return null;
        const str = String(val).trim().replace(',', '.');
        if (str === '') return null;
        const n = parseFloat(str);
        if (isNaN(n) || n < 0 || n > 10) return null;
        return n;
    }

    // TÍNH ĐIỂM TRUNG BÌNH MÔN (Hệ số: TX x1, GK x2, CK x3)
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

    // TÍNH ĐIỂM THI CUỐI KÌ CẦN ĐẠT ĐỂ ĐẠT MỤC TIÊU
    function calcNeededCK(sub, targetScore) {
        if (sub.type === 'comment') return '✅ Đạt';

        const t1 = parseNum(sub.tx1);
        const t2 = parseNum(sub.tx2);
        const gk = parseNum(sub.gk);
        const ck = parseNum(sub.ck);

        // Nếu đã có điểm CK rồi
        if (ck !== null) {
            const currentAvg = calcSubjectRow(sub).avgVal;
            if (currentAvg >= targetScore) {
                return '✅ Đã đạt mục tiêu';
            } else {
                return `Đã thi: ${currentAvg.toFixed(1)}`;
            }
        }

        let existingScore = 0;
        let txCount = 0;
        if (t1 !== null) { existingScore += t1 * 1; txCount++; }
        if (t2 !== null) { existingScore += t2 * 1; txCount++; }

        if (txCount === 0 && gk === null) {
            return `Cần ≥ ${targetScore.toFixed(1)}`;
        }

        const effectiveTxCount = Math.max(txCount, 1);
        if (gk !== null) {
            existingScore += gk * 2;
        } else {
            const avgTx = txCount > 0 ? (existingScore / txCount) : targetScore;
            existingScore += avgTx * 2;
        }

        const totalCoeff = effectiveTxCount + 2 + 3; // TX + GK(2) + CK(3)
        const needed = (targetScore * totalCoeff - existingScore) / 3;
        const rounded = Math.round(needed * 10) / 10;

        if (rounded <= 0) return '✅ An toàn (≥ 0đ)';
        if (rounded > 10.0) return `⚠️ Cần > 10đ (Khó)`;
        return `Cần ≥ ${rounded.toFixed(1)}`;
    }

    // ĐÁNH GIÁ XẾP LOẠI THEO THÔNG TƯ 22
    function evaluateClassification() {
        const activeNumeric = state.subjects.filter(s => s.active && s.type === 'numeric');
        const activeComment = state.subjects.filter(s => s.active && s.type === 'comment');

        const rows = activeNumeric.map(sub => {
            const calc = calcSubjectRow(sub);
            return {
                id: sub.id,
                name: sub.name,
                avg: calc.avgVal,
                hasCk: calc.hasCk
            };
        });

        const validScores = rows.filter(r => r.avg !== null).map(r => r.avg);
        const countGte9 = validScores.filter(s => s >= 9.0).length;
        const countGte8 = validScores.filter(s => s >= 8.0).length;
        const countGte65 = validScores.filter(s => s >= 6.5).length;
        const countGte5 = validScores.filter(s => s >= 5.0).length;
        const countLt35 = validScores.filter(s => s < 3.5).length;
        const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

        const overallAvg = validScores.length > 0 
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
            : 0;

        const notPassedComments = activeComment.filter(s => s.result !== 'Đạt').length;
        const allCommentsPassed = notPassedComments === 0;

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
            } else if (countGte5 >= 6 && countLt35 === 0 && notPassedComments <= 1) {
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
            adviceNote: adviceNote,
            countGte8: countGte8,
            countGte9: countGte9,
            minScore: minScore
        };
    }

    // Nạp lại bộ điểm đúng như hình ảnh VnEdu
    function loadPhotoData() {
        state.subjects = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
        state.targetRank = 'gioi';
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    // Xóa toàn bộ điểm để người dùng tự nhập từ đầu
    function clearAllData() {
        if (!confirm('Bạn có muốn xóa trắng bảng điểm để tự nhập lại từ đầu không?')) return;
        state.subjects.forEach(s => {
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

    // RENDER BẢNG ĐIỂM ĐƠN GIẢN, GỌN GÀNG, ĐÚNG Y HỆT HÌNH
    function renderGradeCalculator(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        loadState();
        const evalRes = evaluateClassification();
        const targetNum = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));

        container.innerHTML = `
            <div class="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans text-slate-100 animate-fadeIn">
                
                <!-- THANH TIÊU ĐỀ GỌN GÀNG (Y HỆT THANH XEM ĐIỂM) -->
                <div class="flex items-center justify-between flex-wrap gap-3 px-2">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            <span>Điểm chi tiết từng môn</span>
                        </h2>
                        <p class="text-xs text-slate-400">Nhập điểm vào các ô • Cột ĐTB và điểm thi Cuối kì cần đạt sẽ tự tính tự động</p>
                    </div>

                    <!-- Các nút tiện ích đơn giản -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                            <span class="text-slate-400 font-bold">Mục tiêu:</span>
                            <select id="vneduTargetSelect" class="bg-transparent text-amber-300 font-black focus:outline-none cursor-pointer">
                                <option value="xuatsac" ${state.targetRank === 'xuatsac' ? 'selected' : ''}>Xuất Sắc (≥ 9.0)</option>
                                <option value="gioi" ${state.targetRank === 'gioi' ? 'selected' : ''}>Học Sinh Giỏi (≥ 8.0)</option>
                                <option value="kha" ${state.targetRank === 'kha' ? 'selected' : ''}>Học Sinh Khá (≥ 6.5)</option>
                                <option value="dat" ${state.targetRank === 'dat' ? 'selected' : ''}>Mức Đạt (≥ 5.0)</option>
                            </select>
                        </div>
                        <button type="button" id="vneduPhotoDataBtn" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-md">
                            📸 Nạp điểm theo ảnh
                        </button>
                        <button type="button" id="vneduClearBtn" class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer">
                            🔄 Xóa trắng
                        </button>
                    </div>
                </div>

                <!-- BẢNG NHẬP ĐIỂM Y TRANG NHƯ TRONG HÌNH ẢNH (VNEDU TABLE) -->
                <div class="rounded-2xl border border-teal-600/60 overflow-hidden shadow-2xl bg-slate-900">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse min-w-[620px]">
                            <!-- Header màu xanh Teal y hệt ảnh -->
                            <thead>
                                <tr class="bg-[#149b9b] text-white text-xs font-bold uppercase tracking-wider text-center">
                                    <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-12">TT</th>
                                    <th rowspan="2" class="py-2.5 px-3 border-r border-teal-500/40 text-left min-w-[120px]">Môn</th>
                                    <th colspan="2" class="py-1 px-2 border-r border-teal-500/40 border-b border-teal-500/40">ĐGTX</th>
                                    <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-16">ĐGGK</th>
                                    <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-16 bg-teal-700/60">ĐGCK<br><span class="text-[9px] font-normal lowercase">(Thi HK)</span></th>
                                    <th rowspan="2" class="py-2.5 px-2 border-r border-teal-500/40 w-20 bg-teal-800/80">ĐTB<br><span class="text-[9px] font-normal lowercase text-emerald-200">★ Tự tính</span></th>
                                    <th rowspan="2" class="py-2.5 px-3 min-w-[130px] bg-slate-950/40 text-amber-200">Cần Thi CK<br><span class="text-[9px] font-normal lowercase text-slate-200">Để đạt mục tiêu</span></th>
                                </tr>
                                <tr class="bg-[#128a8a] text-teal-100 text-[11px] font-bold text-center">
                                    <th class="py-1 px-1 border-r border-teal-500/40 w-14">1</th>
                                    <th class="py-1 px-1 border-r border-teal-500/40 w-14">2</th>
                                </tr>
                            </thead>
                            <!-- Các hàng môn học -->
                            <tbody class="divide-y divide-slate-800 text-xs sm:text-sm text-slate-100">
                                ${state.subjects.map((sub, idx) => {
                                    const calc = calcSubjectRow(sub);
                                    const neededCK = calcNeededCK(sub, targetNum);
                                    const isRowEven = idx % 2 === 0;
                                    const rowBg = isRowEven ? 'bg-slate-900' : 'bg-slate-850/60';

                                    if (sub.type === 'numeric') {
                                        return `
                                            <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}" data-row-id="${sub.id}">
                                                <!-- TT -->
                                                <td class="py-2 px-1 text-center font-bold text-slate-400 border-r border-slate-800">
                                                    ${sub.tt || idx + 1}
                                                </td>

                                                <!-- Môn -->
                                                <td class="py-2 px-3 border-r border-slate-800 font-bold text-white">
                                                    ${sub.name}
                                                </td>

                                                <!-- ĐGTX 1 -->
                                                <td class="p-1 border-r border-slate-800 text-center">
                                                    <input type="text" inputmode="decimal" 
                                                           value="${sub.tx1 || ''}" 
                                                           placeholder=""
                                                           data-sub-id="${sub.id}" data-field="tx1"
                                                           class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-slate-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-white rounded outline-none transition-all">
                                                </td>

                                                <!-- ĐGTX 2 -->
                                                <td class="p-1 border-r border-slate-800 text-center">
                                                    <input type="text" inputmode="decimal" 
                                                           value="${sub.tx2 || ''}" 
                                                           placeholder=""
                                                           data-sub-id="${sub.id}" data-field="tx2"
                                                           class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-slate-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-white rounded outline-none transition-all">
                                                </td>

                                                <!-- ĐGGK (Giữa kì) -->
                                                <td class="p-1 border-r border-slate-800 text-center bg-teal-950/10">
                                                    <input type="text" inputmode="decimal" 
                                                           value="${sub.gk || ''}" 
                                                           placeholder=""
                                                           data-sub-id="${sub.id}" data-field="gk"
                                                           class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-teal-700 focus:border-teal-400 focus:bg-slate-950 font-bold text-teal-300 rounded outline-none transition-all">
                                                </td>

                                                <!-- ĐGCK (Cuối kì) -->
                                                <td class="p-1 border-r border-slate-800 text-center bg-amber-950/10">
                                                    <input type="text" inputmode="decimal" 
                                                           value="${sub.ck || ''}" 
                                                           placeholder=""
                                                           title="Điểm thi học kì cuối kì (hệ số 3). Để trống nếu chưa thi để xem điểm cần đạt!"
                                                           data-sub-id="${sub.id}" data-field="ck"
                                                           class="vnedu-input w-full h-8 text-center bg-transparent border border-transparent hover:border-amber-700 focus:border-amber-400 focus:bg-slate-950 font-bold text-amber-300 rounded outline-none transition-all">
                                                </td>

                                                <!-- ĐTB MÔN (TỰ TÍNH) -->
                                                <td class="py-2 px-1 border-r border-slate-800 text-center font-black text-sm text-emerald-400 bg-slate-950/40" data-cell="avg">
                                                    ${calc.avgText}
                                                </td>

                                                <!-- CẦN THI CK (DỰ BÁO) -->
                                                <td class="py-2 px-2 text-center font-bold text-xs ${neededCK.includes('⚠️') ? 'text-rose-400' : 'text-amber-300'}" data-cell="needed">
                                                    ${neededCK}
                                                </td>
                                            </tr>
                                        `;
                                    } else {
                                        // MÔN NHẬN XÉT: GDTC, HĐTN2, GD ĐP (Chỉ có Đ / CĐ)
                                        return `
                                            <tr class="hover:bg-teal-950/20 transition-colors ${rowBg}" data-row-id="${sub.id}">
                                                <!-- TT -->
                                                <td class="py-2 px-1 text-center font-bold text-slate-400 border-r border-slate-800">
                                                    ${sub.tt || idx + 1}
                                                </td>

                                                <!-- Môn -->
                                                <td class="py-2 px-3 border-r border-slate-800 font-bold text-white">
                                                    ${sub.name}
                                                </td>

                                                <!-- ĐGTX 1 -->
                                                <td class="p-1 border-r border-slate-800 text-center">
                                                    <button type="button" data-toggle-comment="${sub.id}" data-field="tx1" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                        ${sub.tx1 || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- ĐGTX 2 -->
                                                <td class="p-1 border-r border-slate-800 text-center text-slate-600 font-mono">
                                                    —
                                                </td>

                                                <!-- ĐGGK -->
                                                <td class="p-1 border-r border-slate-800 text-center bg-teal-950/10">
                                                    <button type="button" data-toggle-comment="${sub.id}" data-field="gk" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                        ${sub.gk || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- ĐGCK -->
                                                <td class="p-1 border-r border-slate-800 text-center bg-amber-950/10">
                                                    <button type="button" data-toggle-comment="${sub.id}" data-field="ck" class="w-8 h-7 rounded font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                        ${sub.ck || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- ĐTB MÔN -->
                                                <td class="py-2 px-1 border-r border-slate-800 text-center font-bold text-emerald-400 bg-slate-950/40">
                                                    Đạt
                                                </td>

                                                <!-- CẦN THI CK -->
                                                <td class="py-2 px-2 text-center text-xs text-slate-400">
                                                    ✅ Đạt yêu cầu
                                                </td>
                                            </tr>
                                        `;
                                    }
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- HỘP TỔNG KẾT XẾP LOẠI SIÊU GỌN VÀ DỄ HIỂU (NGAY BÊN DƯỚI BẢNG) -->
                <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl space-y-2.5">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2.5">
                            <span class="text-3xl">${evalRes.rankBadge}</span>
                            <div>
                                <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">Dự Báo Xếp Loại Học Sinh:</span>
                                <div class="text-lg sm:text-xl font-black ${evalRes.rankColor}">
                                    ${evalRes.rankTitle}
                                </div>
                            </div>
                        </div>

                        <!-- Điểm trung bình chung -->
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block font-bold">Điểm TB Chung:</span>
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

    // GẮN SỰ KIỆN GÕ ĐIỂM TỨC THÌ
    function bindEvents(container) {
        // Nút nạp theo ảnh
        const photoBtn = container.querySelector('#vneduPhotoDataBtn');
        if (photoBtn) photoBtn.onclick = () => loadPhotoData();

        // Nút xóa trắng
        const clearBtn = container.querySelector('#vneduClearBtn');
        if (clearBtn) clearBtn.onclick = () => clearAllData();

        // Dropdown mục tiêu
        const sel = container.querySelector('#vneduTargetSelect');
        if (sel) {
            sel.onchange = (e) => {
                state.targetRank = e.target.value;
                saveState();
                renderGradeCalculator();
            };
        }

        // Toggle môn nhận xét
        container.querySelectorAll('button[data-toggle-comment]').forEach(btn => {
            btn.onclick = () => {
                const subId = btn.dataset.toggleComment;
                const field = btn.dataset.field;
                const sub = state.subjects.find(s => s.id === subId);
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
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                const val = inp.value.trim();

                const sub = state.subjects.find(s => s.id === subId);
                if (sub) {
                    sub[field] = val;
                    saveState();

                    // Cập nhật ngay ô ĐTB và ô Cần Thi CK của hàng đó
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

            // Khi rời ô, format lại số (vd nhập 7 -> 7.0, hoặc giữ nguyên nếu trống)
            inp.onblur = () => {
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                const sub = state.subjects.find(s => s.id === subId);
                if (sub && sub[field]) {
                    const n = parseNum(sub[field]);
                    if (n !== null) {
                        sub[field] = n.toFixed(1);
                        inp.value = sub[field];
                        saveState();
                    }
                }
                // Cập nhật lại tổng kết xếp loại bên dưới
                const evalRes = evaluateClassification();
                const rankTitle = container.querySelector('.text-lg.sm\\:text-xl.font-black');
                if (rankTitle) {
                    rankTitle.innerText = evalRes.rankTitle;
                    rankTitle.className = `text-lg sm:text-xl font-black ${evalRes.rankColor}`;
                }
                const overallAvg = container.querySelector('.text-2xl.font-black.text-emerald-400');
                if (overallAvg) overallAvg.innerText = evalRes.overallAvg.toFixed(1);
            };

            // Phím Enter nhảy sang ô tiếp theo
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
        loadPhotoData: loadPhotoData,
        clearAllData: clearAllData,
        getState: () => state,
        evaluate: evaluateClassification
    };

})(window);
