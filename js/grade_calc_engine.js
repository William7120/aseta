/**
 * Aseta — Sổ Điểm Điện Tử & Tính Điểm THPT (Chuẩn Thông Tư 22/2021/TT-BGDĐT)
 * - Đầy đủ 4 cột ĐGTX (KTTX 1, 2, 3, 4 — hệ số 1) + ĐGGK (×2) + ĐGCK (×3)
 * - Hỗ trợ HK1, HK2 & Tổng Hợp Cả Năm ((ĐTB_HK1 + ĐTB_HK2 × 2) / 3)
 * - Thiết kế tối ưu nhập điểm siêu dễ trên Điện thoại (Thẻ lớn 48px, không cuộn ngang, không zoom iOS)
 *   và Bảng Editorial tinh gọn trên Máy tính, cập nhật xếp loại tức thì theo từng ký tự.
 */
(function(window) {
    'use strict';

    const STORAGE_PREFIX = 'aseta_grade_calc_tt22_v5_';

    const SUBJECT_TEMPLATES = [
        { id: 'math',   name: 'Toán',      icon: '📐', type: 'numeric', active: true },
        { id: 'lit',    name: 'Ngữ văn',   icon: '📖', type: 'numeric', active: true },
        { id: 'eng',    name: 'Tiếng Anh', icon: '🌐', type: 'numeric', active: true },
        { id: 'his',    name: 'Lịch sử',   icon: '🏛️', type: 'numeric', active: true },
        { id: 'geo',    name: 'Địa lí',    icon: '🌍', type: 'numeric', active: true },
        { id: 'it',     name: 'Tin học',   icon: '💻', type: 'numeric', active: true },
        { id: 'gdktpl', name: 'GDKT & PL', icon: '⚖️', type: 'numeric', active: true },
        { id: 'phy',    name: 'Vật lí',    icon: '⚡', type: 'numeric', active: true },
        { id: 'qpan',   name: 'GDQP-AN',   icon: '🎖️', type: 'numeric', active: true },
        { id: 'chem',   name: 'Hóa học',   icon: '🧪', type: 'numeric', active: false },
        { id: 'bio',    name: 'Sinh học',  icon: '🧬', type: 'numeric', active: false },
        { id: 'pe',     name: 'GDTC',      icon: '⚽', type: 'comment', active: true },
        { id: 'hdtn',   name: 'HĐTN',      icon: '🧭', type: 'comment', active: true },
        { id: 'gddp',   name: 'GD ĐP',     icon: '🏙️', type: 'comment', active: true }
    ];

    function buildFreshSemester() {
        return SUBJECT_TEMPLATES.map((tpl, idx) => {
            if (tpl.type === 'comment') {
                return {
                    id: tpl.id,
                    tt: idx + 1,
                    name: tpl.name,
                    icon: tpl.icon,
                    type: 'comment',
                    active: tpl.active,
                    result: 'Đạt'
                };
            }
            return {
                id: tpl.id,
                tt: idx + 1,
                name: tpl.name,
                icon: tpl.icon,
                type: 'numeric',
                active: tpl.active,
                tx1: '',
                tx2: '',
                tx3: '',
                tx4: '',
                gk: '',
                ck: ''
            };
        });
    }

    let state = {
        currentTab: 'hk1',   // 'hk1' | 'hk2' | 'canam'
        targetRank: 'gioi',  // 'xuatsac' | 'gioi' | 'kha' | 'dat'
        showConfig: false,   // toggle optional subjects bar
        hk1: buildFreshSemester(),
        hk2: buildFreshSemester()
    };

    function getCurrentAccountInfo() {
        try {
            if (window.AccountManager && typeof window.AccountManager.getCurrentAccount === 'function') {
                const acc = window.AccountManager.getCurrentAccount();
                if (acc && acc.id) return { id: acc.id, nickname: acc.nickname || acc.id, name: acc.name || acc.nickname || 'Học sinh' };
            }
            if (window.AccountManager && typeof window.AccountManager.getCurrentAccountId === 'function') {
                const id = window.AccountManager.getCurrentAccountId();
                if (id) return { id, nickname: id, name: 'Học sinh' };
            }
        } catch (_) {}
        return { id: 'default', nickname: 'default', name: 'Học sinh' };
    }

    function getStorageKey() {
        return STORAGE_PREFIX + getCurrentAccountInfo().id;
    }

    function normalizeSemesterList(list) {
        const fresh = buildFreshSemester();
        if (!Array.isArray(list) || list.length === 0) return fresh;
        return fresh.map(tpl => {
            const existing = list.find(item => item && item.id === tpl.id);
            if (!existing) return tpl;
            if (tpl.type === 'comment') {
                return {
                    ...tpl,
                    active: typeof existing.active === 'boolean' ? existing.active : tpl.active,
                    result: existing.result === 'Chưa Đạt' ? 'Chưa Đạt' : 'Đạt'
                };
            }
            return {
                ...tpl,
                active: typeof existing.active === 'boolean' ? existing.active : tpl.active,
                tx1: existing.tx1 ?? '',
                tx2: existing.tx2 ?? '',
                tx3: existing.tx3 ?? '',
                tx4: existing.tx4 ?? '',
                gk: existing.gk ?? '',
                ck: existing.ck ?? ''
            };
        });
    }

    let loadedAccountId = null;

    function loadState() {
        const currAccId = getCurrentAccountInfo().id;
        const accountSwitched = loadedAccountId !== null && loadedAccountId !== currAccId;
        loadedAccountId = currAccId;

        try {
            const raw = localStorage.getItem(getStorageKey());
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed) {
                    state.currentTab = parsed.currentTab || 'hk1';
                    state.targetRank = parsed.targetRank || 'gioi';
                    state.hk1 = normalizeSemesterList(parsed.hk1);
                    state.hk2 = normalizeSemesterList(parsed.hk2);
                    if (accountSwitched) state.showConfig = false;
                    return;
                }
            }
            // Strictly isolate fresh account state (zero leakage from previous account)
            state.currentTab = 'hk1';
            state.targetRank = 'gioi';
            state.showConfig = false;
            state.hk1 = buildFreshSemester();
            state.hk2 = buildFreshSemester();
        } catch (e) {
            console.warn('[GradeCalc] Load state warning:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify({
                currentTab: state.currentTab,
                targetRank: state.targetRank,
                hk1: state.hk1,
                hk2: state.hk2
            }));
        } catch (e) {
            console.warn('[GradeCalc] Save state warning:', e);
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

    function getTargetScoreNum() {
        if (state.targetRank === 'xuatsac') return 9.0;
        if (state.targetRank === 'gioi') return 8.0;
        if (state.targetRank === 'kha') return 6.5;
        return 5.0;
    }

    // TÍNH ĐTB MÔN (CHUẨN TT22 — ĐẦY ĐỦ 4 CỘT KTTX ×1, GK ×2, CK ×3)
    function calcSubjectRow(sub) {
        if (sub.type === 'comment') {
            const isPassed = sub.result !== 'Chưa Đạt';
            return {
                isComment: true,
                avgText: isPassed ? 'Đạt' : 'CĐ',
                avgVal: null,
                isPassed: isPassed,
                hasCk: true
            };
        }

        const txVals = [sub.tx1, sub.tx2, sub.tx3, sub.tx4].map(parseNum).filter(v => v !== null);
        const gk = parseNum(sub.gk);
        const ck = parseNum(sub.ck);

        let totalScore = 0;
        let totalCoeff = 0;

        txVals.forEach(v => { totalScore += v; totalCoeff += 1; });
        if (gk !== null) { totalScore += gk * 2; totalCoeff += 2; }
        if (ck !== null) { totalScore += ck * 3; totalCoeff += 3; }

        if (totalCoeff === 0) {
            return { isComment: false, avgText: '—', avgVal: null, hasCk: false };
        }

        const avg = Math.round((totalScore / totalCoeff) * 10) / 10;
        return {
            isComment: false,
            avgText: avg.toFixed(1),
            avgVal: avg,
            hasCk: ck !== null
        };
    }

    // TÍNH ĐIỂM CUỐI KỲ CẦN ĐẠT (HỖ TRỢ ĐỦ 4 CỘT KTTX)
    function calcNeededCK(sub, targetScore) {
        if (sub.type === 'comment') {
            return sub.result !== 'Chưa Đạt' ? { text: 'Đạt', tone: 'ok' } : { text: 'Chưa đạt', tone: 'warn' };
        }

        const txVals = [sub.tx1, sub.tx2, sub.tx3, sub.tx4].map(parseNum).filter(v => v !== null);
        const gk = parseNum(sub.gk);
        const ck = parseNum(sub.ck);

        if (ck !== null) {
            const cur = calcSubjectRow(sub).avgVal;
            if (cur !== null && cur >= targetScore) return { text: '✓ Đạt mục tiêu', tone: 'ok' };
            return { text: `Hiện tại ${cur !== null ? cur.toFixed(1) : '—'}`, tone: 'warn' };
        }

        const txSum = txVals.reduce((a, b) => a + b, 0);
        const txCount = txVals.length;
        if (txCount === 0 && gk === null) {
            return { text: `Cần ≥ ${targetScore.toFixed(1)}`, tone: 'neutral' };
        }

        const effectiveTxCount = Math.max(txCount, 1);
        let existing = txSum;
        if (gk !== null) {
            existing += gk * 2;
        } else {
            const avgTx = txCount > 0 ? (txSum / txCount) : targetScore;
            existing += avgTx * 2;
        }

        const totalCoeff = effectiveTxCount + 2 + 3;
        const needed = (targetScore * totalCoeff - existing) / 3;
        const rounded = Math.round(needed * 10) / 10;

        if (rounded <= 0) return { text: '✓ An toàn', tone: 'ok' };
        if (rounded > 10) return { text: `Cần ${rounded.toFixed(1)} (Khó)`, tone: 'warn' };
        return { text: `CK ≥ ${rounded.toFixed(1)}`, tone: 'amber' };
    }

    // TÍNH ĐTB CẢ NĂM TT22: (ĐTB_HK1 + ĐTB_HK2 × 2) / 3
    function calcYearAverage(sub1, sub2) {
        if (sub1.type === 'comment') {
            const passed2 = sub2.result !== 'Chưa Đạt';
            return {
                isComment: true,
                avgText: passed2 ? 'Đạt' : 'CĐ',
                avgVal: null,
                isPassed: passed2
            };
        }

        const avg1 = calcSubjectRow(sub1).avgVal;
        const avg2 = calcSubjectRow(sub2).avgVal;

        if (avg1 === null && avg2 === null) {
            return { isComment: false, avgText: '—', avgVal: null, status: 'empty' };
        }
        if (avg1 !== null && avg2 !== null) {
            const yearAvg = Math.round(((avg1 + avg2 * 2) / 3) * 10) / 10;
            return { isComment: false, avgText: yearAvg.toFixed(1), avgVal: yearAvg, status: 'official' };
        }
        const only = avg1 !== null ? avg1 : avg2;
        return { isComment: false, avgText: `${only.toFixed(1)}*`, avgVal: only, status: 'provisional' };
    }

    function calcNeededHK2(sub1, targetScore) {
        if (sub1.type === 'comment') return { text: 'Đạt', tone: 'ok' };
        const avg1 = calcSubjectRow(sub1).avgVal;
        if (avg1 === null) return { text: `HK2 ≥ ${targetScore.toFixed(1)}`, tone: 'neutral' };
        const needed = (3 * targetScore - avg1) / 2;
        const rounded = Math.round(needed * 10) / 10;
        if (rounded <= 0) return { text: '✓ An toàn', tone: 'ok' };
        if (rounded > 10) return { text: `Cần ${rounded.toFixed(1)} (Khó)`, tone: 'warn' };
        return { text: `HK2 ≥ ${rounded.toFixed(1)}`, tone: 'amber' };
    }

    // ĐÁNH GIÁ XẾP LOẠI TT22
    function evaluateCurrentTab() {
        let rows;
        if (state.currentTab === 'hk1') {
            rows = state.hk1.map(s => ({ active: s.active, type: s.type, ...calcSubjectRow(s) }));
        } else if (state.currentTab === 'hk2') {
            rows = state.hk2.map(s => ({ active: s.active, type: s.type, ...calcSubjectRow(s) }));
        } else {
            rows = state.hk1.map((s1, idx) => {
                const s2 = state.hk2[idx] || s1;
                return { active: s1.active, type: s1.type, ...calcYearAverage(s1, s2) };
            });
        }

        const activeNumeric = rows.filter(s => s.active && s.type === 'numeric');
        const activeComment = rows.filter(s => s.active && s.type === 'comment');
        const validScores = activeNumeric.map(s => s.avgVal).filter(v => v !== null && !isNaN(v));

        const countGte9 = validScores.filter(v => v >= 9.0).length;
        const countGte8 = validScores.filter(v => v >= 8.0).length;
        const countGte65 = validScores.filter(v => v >= 6.5).length;
        const countGte5 = validScores.filter(v => v >= 5.0).length;
        const countLt35 = validScores.filter(v => v < 3.5).length;
        const minScore = validScores.length > 0 ? Math.min(...validScores) : null;
        const overallAvg = validScores.length > 0
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
            : null;
        const allCommentsPassed = activeComment.every(s => s.isPassed);

        let rankTitle = 'Đang nhập điểm';
        let rankBadge = '📝';
        let detailNote = `Đã nhập ${validScores.length}/${activeNumeric.length} môn tính điểm • Cần ít nhất 6 môn để xếp loại.`;

        if (validScores.length >= 6) {
            if (countGte9 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rankTitle = 'Học Sinh Xuất Sắc';
                rankBadge = '🏆';
                detailNote = `${countGte9} môn ≥ 9.0 • Thấp nhất ${minScore.toFixed(1)}đ • Đạt toàn bộ môn nhận xét.`;
            } else if (countGte8 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rankTitle = 'Học Sinh Giỏi';
                rankBadge = '🥇';
                detailNote = `${countGte8} môn ≥ 8.0 • Thấp nhất ${minScore.toFixed(1)}đ • Cần thêm ${Math.max(0, 6 - countGte9)} môn ≥ 9.0 để Xuất Sắc.`;
            } else if (countGte65 >= 6 && minScore >= 5.0 && allCommentsPassed) {
                rankTitle = 'Học Sinh Khá';
                rankBadge = '🥈';
                detailNote = `${countGte65} môn ≥ 6.5 • Thấp nhất ${minScore.toFixed(1)}đ • Kéo thêm ${Math.max(0, 6 - countGte8)} môn lên ≥ 8.0 để Giỏi.`;
            } else if (countGte5 >= 6 && countLt35 === 0) {
                rankTitle = 'Mức Đạt';
                rankBadge = '🥉';
                detailNote = `${countGte5} môn ≥ 5.0 • Không có môn nào dưới 3.5.`;
            } else {
                rankTitle = 'Chưa Đạt';
                rankBadge = '⚠️';
                detailNote = !allCommentsPassed
                    ? 'Còn môn nhận xét Chưa Đạt.'
                    : `Có môn dưới chuẩn (thấp nhất ${minScore.toFixed(1)}đ).`;
            }
        }

        return {
            rankTitle,
            rankBadge,
            overallAvgText: overallAvg !== null ? overallAvg.toFixed(1) : '—',
            filledCount: validScores.length,
            totalNumeric: activeNumeric.length,
            detailNote
        };
    }

    function neededToneClass(tone) {
        if (tone === 'ok') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/25';
        if (tone === 'warn') return 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/25';
        if (tone === 'amber') return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/25';
        return 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-white/10';
    }

    function avgScoreColor(val) {
        if (val === null) return 'text-slate-400';
        if (val >= 8.0) return 'text-emerald-500 dark:text-emerald-400';
        if (val >= 6.5) return 'text-sky-500 dark:text-sky-400';
        if (val >= 5.0) return 'text-amber-500 dark:text-amber-400';
        return 'text-rose-500 dark:text-rose-400';
    }

    function copyHk1ToHk2() {
        state.hk2 = JSON.parse(JSON.stringify(state.hk1));
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    function clearCurrentSemesterData() {
        const semName = state.currentTab === 'hk2' ? 'Học Kì 2' : 'Học Kì 1';
        if (!confirm(`Xóa trắng toàn bộ điểm đã nhập trong ${semName}?`)) return;
        const list = state.currentTab === 'hk2' ? state.hk2 : state.hk1;
        list.forEach(s => {
            if (s.type === 'numeric') {
                s.tx1 = ''; s.tx2 = ''; s.tx3 = ''; s.tx4 = ''; s.gk = ''; s.ck = '';
            } else {
                s.result = 'Đạt';
            }
        });
        saveState();
        renderGradeCalculator();
    }

    function toggleSubjectActive(subId) {
        const s1 = state.hk1.find(s => s.id === subId);
        const s2 = state.hk2.find(s => s.id === subId);
        if (s1) s1.active = !s1.active;
        if (s2 && s1) s2.active = s1.active;
        saveState();
        renderGradeCalculator();
    }

    // =========================================================================
    // VIETSCHOOL-STYLE MOBILE REPORT CARD SHEET (ULTRA-COMPACT, 6+ SUBJECTS ON 1 SCREEN)
    // =========================================================================
    function renderMobileSemesterCards(subjects, semName, semKey, targetNum) {
        const activeSubs = subjects.filter(s => s.active);
        const numericSubs = activeSubs.filter(s => s.type === 'numeric');
        const commentSubs = activeSubs.filter(s => s.type === 'comment');

        return `
            <div class="lg:hidden rounded-2xl overflow-hidden border border-blue-600/30 dark:border-blue-400/20 bg-white dark:bg-[#0e1118] shadow-md">
                <!-- Authentic VietSchool Sticky Royal-Blue Header -->
                <div class="sticky top-0 z-20 bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1e3a8a] dark:to-[#172554] text-white">
                    <div class="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/15">
                        <span class="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <span>📊</span>
                            <span>Bảng Điểm ${semName}</span>
                        </span>
                        <span class="text-[10px] font-semibold text-blue-100/90">
                            Nhập 85 → 8.5 • Enter nhảy ô
                        </span>
                    </div>
                    <!-- 6-column aligned VietSchool column headers -->
                    <div class="grid grid-cols-6 divide-x divide-white/15 text-center text-[10px] font-black uppercase tracking-wide py-1.5 bg-black/15">
                        <div>TX 1</div>
                        <div>TX 2</div>
                        <div>TX 3</div>
                        <div>TX 4</div>
                        <div class="text-sky-200">GK ×2</div>
                        <div class="text-amber-200">CK ×3</div>
                    </div>
                </div>

                <!-- Numeric Subject Rows (Compact ~74px each, zero horizontal scroll!) -->
                <div class="divide-y divide-slate-200 dark:divide-white/10">
                    ${numericSubs.map((sub, idx) => {
                        const calc = calcSubjectRow(sub);
                        const needed = calcNeededCK(sub, targetNum);
                        const stripeCls = idx % 2 === 0
                            ? 'bg-blue-50/85 dark:bg-blue-950/35'
                            : 'bg-slate-100/90 dark:bg-white/[0.045]';

                        return `
                            <div data-sem="${semKey}" data-sub-card="${sub.id}" class="transition-colors">
                                <!-- VietSchool Subject Title Strip -->
                                <div class="px-3 py-1.5 flex items-center justify-between gap-2 ${stripeCls} border-b border-slate-200/80 dark:border-white/[0.07]">
                                    <div class="flex items-center gap-1.5 min-w-0">
                                        <span class="text-sm leading-none shrink-0">${sub.icon}</span>
                                        <span class="text-[13px] font-black text-slate-900 dark:text-white truncate">${sub.name}</span>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <span data-cell="needed" class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${neededToneClass(needed.tone)}">
                                            ${needed.text}
                                        </span>
                                        <div class="flex items-baseline gap-1 min-w-[54px] justify-end">
                                            <span class="text-[9px] font-bold uppercase text-slate-400">ĐTB</span>
                                            <span data-cell="avg" class="text-[15px] font-black font-mono leading-none ${avgScoreColor(calc.avgVal)}">${calc.avgText}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 6-Cell Aligned VietSchool Score Row -->
                                <div class="grid grid-cols-6 divide-x divide-slate-200/90 dark:divide-white/[0.08] bg-white dark:bg-[#0b0e14]">
                                    ${['tx1', 'tx2', 'tx3', 'tx4'].map(f => `
                                        <input type="text" inputmode="decimal" enterkeyhint="next" autocomplete="off"
                                               aria-label="${sub.name} ${f.toUpperCase()}"
                                               value="${sub[f] || ''}" placeholder="·"
                                               data-sem="${semKey}" data-sub-id="${sub.id}" data-field="${f}"
                                               class="grade-score-input w-full h-11 px-0.5 text-center text-[15px] font-black font-mono bg-transparent text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none transition-colors">
                                    `).join('')}
                                    <input type="text" inputmode="decimal" enterkeyhint="next" autocomplete="off"
                                           aria-label="${sub.name} Giữa kỳ"
                                           value="${sub.gk || ''}" placeholder="·"
                                           data-sem="${semKey}" data-sub-id="${sub.id}" data-field="gk"
                                           class="grade-score-input w-full h-11 px-0.5 text-center text-[15px] font-black font-mono bg-sky-50/75 dark:bg-sky-500/[0.08] text-sky-700 dark:text-sky-300 placeholder-sky-300/70 dark:placeholder-sky-700/70 focus:bg-sky-100/80 dark:focus:bg-sky-900/50 focus:ring-2 focus:ring-inset focus:ring-sky-500 outline-none transition-colors">
                                    <input type="text" inputmode="decimal" enterkeyhint="next" autocomplete="off"
                                           aria-label="${sub.name} Cuối kỳ"
                                           value="${sub.ck || ''}" placeholder="·"
                                           data-sem="${semKey}" data-sub-id="${sub.id}" data-field="ck"
                                           class="grade-score-input w-full h-11 px-0.5 text-center text-[15px] font-black font-mono bg-amber-50/75 dark:bg-amber-500/[0.09] text-amber-700 dark:text-amber-300 placeholder-amber-300/70 dark:placeholder-amber-700/70 focus:bg-amber-100/80 dark:focus:bg-amber-900/50 focus:ring-2 focus:ring-inset focus:ring-amber-500 outline-none transition-colors">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Comment Subjects Section (Đạt / Chưa Đạt) -->
                ${commentSubs.length > 0 ? `
                    <div class="border-t-2 border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] divide-y divide-slate-200/80 dark:divide-white/[0.07]">
                        <div class="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Môn đánh giá nhận xét
                        </div>
                        ${commentSubs.map(sub => {
                            const isPass = sub.result !== 'Chưa Đạt';
                            return `
                                <div class="px-3 py-2 flex items-center justify-between gap-2" data-mobile-card="${sub.id}">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="text-sm shrink-0">${sub.icon}</span>
                                        <span class="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate">${sub.name}</span>
                                    </div>
                                    <button type="button" data-sem="${semKey}" data-toggle-comment="${sub.id}"
                                            class="px-3.5 h-8 rounded-lg text-xs font-black border transition-all active:scale-95 cursor-pointer shrink-0 ${
                                                isPass
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/35'
                                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/35'
                                            }">
                                        ${isPass ? '✓ Đạt (Đ)' : '✕ Chưa Đạt (CĐ)'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // =========================================================================
    // DESKTOP VIETSCHOOL-STYLE TABLE (ALL 4 KTTX COLUMNS + GK + CK + ĐTB + CẦN CK)
    // =========================================================================
    function renderDesktopSemesterTable(subjects, semName, semKey, targetNum) {
        const activeSubs = subjects.filter(s => s.active);
        return `
            <div class="hidden lg:block rounded-2xl bg-white dark:bg-[#0e1118] border border-blue-600/25 dark:border-blue-400/20 shadow-md overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1e3a8a] dark:to-[#172554] text-white text-[11px] font-black uppercase tracking-wider text-center">
                            <th class="py-3 pl-5 pr-3 text-left w-[180px]">Môn học</th>
                            <th class="py-3 px-1.5 w-[74px] border-l border-white/15">TX 1</th>
                            <th class="py-3 px-1.5 w-[74px] border-l border-white/15">TX 2</th>
                            <th class="py-3 px-1.5 w-[74px] border-l border-white/15">TX 3</th>
                            <th class="py-3 px-1.5 w-[74px] border-l border-white/15">TX 4</th>
                            <th class="py-3 px-1.5 w-[84px] border-l border-white/15 text-sky-200">GK (×2)</th>
                            <th class="py-3 px-1.5 w-[84px] border-l border-white/15 text-amber-200">CK (×3)</th>
                            <th class="py-3 px-2 w-[82px] border-l border-white/15">ĐTB ${semName}</th>
                            <th class="py-3 pl-2 pr-5 text-right border-l border-white/15 min-w-[130px]">Mục tiêu CK</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200/80 dark:divide-white/[0.07] text-sm">
                        ${activeSubs.map((sub, idx) => {
                            const calc = calcSubjectRow(sub);
                            const needed = calcNeededCK(sub, targetNum);
                            const rowStripe = idx % 2 === 1 ? 'bg-slate-50/70 dark:bg-white/[0.015]' : '';

                            if (sub.type === 'comment') {
                                const isPass = sub.result !== 'Chưa Đạt';
                                return `
                                    <tr class="${rowStripe} hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                                        <td class="py-2.5 pl-5 pr-3">
                                            <div class="flex items-center gap-2.5">
                                                <span class="text-base">${sub.icon}</span>
                                                <span class="font-extrabold text-slate-900 dark:text-white">${sub.name}</span>
                                            </div>
                                        </td>
                                        <td colspan="6" class="py-2.5 px-2 text-center text-xs text-slate-400 border-l border-slate-200/70 dark:border-white/[0.06]">
                                            Môn đánh giá bằng nhận xét (Thông tư 22)
                                        </td>
                                        <td class="py-2.5 px-2 text-center border-l border-slate-200/70 dark:border-white/[0.06]">
                                            <button type="button" data-sem="${semKey}" data-toggle-comment="${sub.id}"
                                                    class="px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                                                        isPass
                                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                                                    }">
                                                ${isPass ? '✓ Đạt (Đ)' : '✕ CĐ'}
                                            </button>
                                        </td>
                                        <td class="py-2.5 pl-2 pr-5 text-right text-xs text-slate-400 font-semibold border-l border-slate-200/70 dark:border-white/[0.06]">
                                            ${isPass ? 'Đạt yêu cầu' : 'Cần đạt'}
                                        </td>
                                    </tr>
                                `;
                            }

                            return `
                                <tr class="${rowStripe} hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors" data-sem="${semKey}" data-sub-row="${sub.id}">
                                    <td class="py-2 pl-5 pr-3">
                                        <div class="flex items-center gap-2.5">
                                            <span class="text-base">${sub.icon}</span>
                                            <span class="font-extrabold text-slate-900 dark:text-white">${sub.name}</span>
                                        </div>
                                    </td>
                                    ${['tx1', 'tx2', 'tx3', 'tx4'].map(f => `
                                        <td class="p-1 border-l border-slate-200/70 dark:border-white/[0.06]">
                                            <input type="text" inputmode="decimal" autocomplete="off"
                                                   value="${sub[f] || ''}" placeholder="·"
                                                   data-sem="${semKey}" data-sub-id="${sub.id}" data-field="${f}"
                                                   class="grade-score-input w-full h-10 rounded-lg text-center text-sm font-black font-mono bg-transparent hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                        </td>
                                    `).join('')}
                                    <td class="p-1 border-l border-slate-200/70 dark:border-white/[0.06] bg-sky-50/60 dark:bg-sky-500/[0.06]">
                                        <input type="text" inputmode="decimal" autocomplete="off"
                                               value="${sub.gk || ''}" placeholder="·"
                                               data-sem="${semKey}" data-sub-id="${sub.id}" data-field="gk"
                                               class="grade-score-input w-full h-10 rounded-lg text-center text-sm font-black font-mono bg-transparent text-sky-700 dark:text-sky-300 placeholder-sky-300/70 dark:placeholder-sky-700 focus:bg-sky-100/80 dark:focus:bg-sky-900/50 focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                                    </td>
                                    <td class="p-1 border-l border-slate-200/70 dark:border-white/[0.06] bg-amber-50/60 dark:bg-amber-500/[0.07]">
                                        <input type="text" inputmode="decimal" autocomplete="off"
                                               value="${sub.ck || ''}" placeholder="·"
                                               data-sem="${semKey}" data-sub-id="${sub.id}" data-field="ck"
                                               class="grade-score-input w-full h-10 rounded-lg text-center text-sm font-black font-mono bg-transparent text-amber-700 dark:text-amber-300 placeholder-amber-300/70 dark:placeholder-amber-700 focus:bg-amber-100/80 dark:focus:bg-amber-900/50 focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                                    </td>
                                    <td class="py-2 px-2 text-center border-l border-slate-200/70 dark:border-white/[0.06]">
                                        <span data-cell="avg" class="text-base font-black font-mono ${avgScoreColor(calc.avgVal)}">${calc.avgText}</span>
                                    </td>
                                    <td class="py-2 pl-2 pr-5 text-right border-l border-slate-200/70 dark:border-white/[0.06]">
                                        <span data-cell="needed" class="inline-block px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${neededToneClass(needed.tone)}">
                                            ${needed.text}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // =========================================================================
    // TAB 3: TỔNG HỢP CẢ NĂM (VIETSCHOOL REPORT CARD TABLE ON BOTH MOBILE & PC)
    // =========================================================================
    function renderCombinedYearView(targetNum) {
        const activePairs = state.hk1
            .map((s1, idx) => ({ s1, s2: state.hk2[idx] || s1 }))
            .filter(p => p.s1.active);

        const mobileTable = `
            <div class="lg:hidden rounded-2xl overflow-hidden border border-blue-600/30 dark:border-blue-400/20 bg-white dark:bg-[#0e1118] shadow-md">
                <div class="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1e3a8a] dark:to-[#172554] text-white">
                    <div class="px-3 py-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wider border-b border-white/15">
                        <span>📊 Tổng Hợp Cả Năm</span>
                        <span class="text-[10px] font-normal text-blue-100">(HK1 + HK2×2)/3</span>
                    </div>
                    <div class="grid grid-cols-12 text-[10px] font-black uppercase py-1.5 bg-black/15 text-center">
                        <div class="col-span-5 text-left pl-3">Môn học</div>
                        <div class="col-span-2">HK1</div>
                        <div class="col-span-2 text-amber-200">HK2</div>
                        <div class="col-span-3 text-emerald-200">Cả Năm</div>
                    </div>
                </div>
                <div class="divide-y divide-slate-200/80 dark:divide-white/[0.07]">
                    ${activePairs.map(({ s1, s2 }, idx) => {
                        const a1 = calcSubjectRow(s1);
                        const a2 = calcSubjectRow(s2);
                        const yr = calcYearAverage(s1, s2);
                        const need2 = a2.hasCk && s1.type === 'numeric'
                            ? { text: '✓ Đủ 2 kì', tone: 'ok' }
                            : calcNeededHK2(s1, targetNum);

                        return `
                            <div class="grid grid-cols-12 items-center py-2.5 ${idx % 2 === 1 ? 'bg-slate-50/70 dark:bg-white/[0.02]' : ''}">
                                <div class="col-span-5 pl-3 pr-1 min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-xs shrink-0">${s1.icon}</span>
                                        <span class="text-xs font-black text-slate-900 dark:text-white truncate">${s1.name}</span>
                                    </div>
                                    <div class="mt-0.5">
                                        <span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${neededToneClass(need2.tone)}">${need2.text}</span>
                                    </div>
                                </div>
                                <div class="col-span-2 text-center font-mono text-xs font-bold text-slate-700 dark:text-slate-300">${a1.avgText}</div>
                                <div class="col-span-2 text-center font-mono text-xs font-bold text-amber-500">${a2.avgText}</div>
                                <div class="col-span-3 text-center font-mono text-sm font-black ${yr.isComment ? 'text-emerald-500' : avgScoreColor(yr.avgVal)}">${yr.avgText}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        const desktopTable = `
            <div class="hidden lg:block rounded-2xl bg-white dark:bg-[#0e1118] border border-blue-600/25 dark:border-blue-400/20 shadow-md overflow-hidden">
                <div class="px-5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Công thức Thông tư 22: <strong class="text-slate-900 dark:text-white">ĐTB Cả Năm = (ĐTB HK1 + ĐTB HK2 × 2) / 3</strong></span>
                    <span class="font-mono text-[11px]">(*) tạm tính khi chưa đủ 2 kì</span>
                </div>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1e3a8a] dark:to-[#172554] text-white text-[11px] font-black uppercase tracking-wider text-center">
                            <th class="py-3 pl-5 pr-3 text-left">Môn học</th>
                            <th class="py-3 px-3 border-l border-white/15">ĐTB HK1 (×1)</th>
                            <th class="py-3 px-3 border-l border-white/15 text-amber-200">ĐTB HK2 (×2)</th>
                            <th class="py-3 px-3 border-l border-white/15 text-emerald-200">ĐTB Cả Năm</th>
                            <th class="py-3 pl-3 pr-5 text-right border-l border-white/15">Dự báo HK2</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200/80 dark:divide-white/[0.07] text-sm">
                        ${activePairs.map(({ s1, s2 }, idx) => {
                            const a1 = calcSubjectRow(s1);
                            const a2 = calcSubjectRow(s2);
                            const yr = calcYearAverage(s1, s2);
                            const need2 = a2.hasCk && s1.type === 'numeric'
                                ? { text: '✓ Đủ 2 kì', tone: 'ok' }
                                : calcNeededHK2(s1, targetNum);

                            return `
                                <tr class="${idx % 2 === 1 ? 'bg-slate-50/70 dark:bg-white/[0.015]' : ''} hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                                    <td class="py-3 pl-5 pr-3">
                                        <div class="flex items-center gap-2.5">
                                            <span class="text-base">${s1.icon}</span>
                                            <span class="font-extrabold text-slate-900 dark:text-white">${s1.name}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-200 border-l border-slate-200/70 dark:border-white/[0.06]">${a1.avgText}</td>
                                    <td class="py-3 px-3 text-center font-mono font-bold text-amber-500 border-l border-slate-200/70 dark:border-white/[0.06]">${a2.avgText}</td>
                                    <td class="py-3 px-3 text-center font-mono text-base font-black border-l border-slate-200/70 dark:border-white/[0.06] ${yr.isComment ? 'text-emerald-500' : avgScoreColor(yr.avgVal)}">${yr.avgText}</td>
                                    <td class="py-3 pl-3 pr-5 text-right border-l border-slate-200/70 dark:border-white/[0.06]">
                                        <span class="inline-block px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${neededToneClass(need2.tone)}">${need2.text}</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        return mobileTable + desktopTable;
    }

    function updateSummaryLive(container) {
        const ev = evaluateCurrentTab();
        const badgeEl = container.querySelector('#gcSummaryBadge');
        const titleEl = container.querySelector('#gcSummaryRank');
        const noteEl = container.querySelector('#gcSummaryNote');
        const avgEl = container.querySelector('#gcSummaryAvg');
        const countEl = container.querySelector('#gcSummaryCount');
        if (badgeEl) badgeEl.textContent = ev.rankBadge;
        if (titleEl) titleEl.textContent = ev.rankTitle;
        if (noteEl) noteEl.textContent = ev.detailNote;
        if (avgEl) avgEl.textContent = ev.overallAvgText;
        if (countEl) countEl.textContent = `${ev.filledCount}/${ev.totalNumeric} môn có điểm`;
    }

    // =========================================================================
    // MAIN RENDER
    // =========================================================================
    function renderGradeCalculator(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        loadState();
        const currAcc = getCurrentAccountInfo();
        const targetNum = getTargetScoreNum();
        const ev = evaluateCurrentTab();
        const tabLabel = state.currentTab === 'hk1' ? 'Học Kì 1' : (state.currentTab === 'hk2' ? 'Học Kì 2' : 'Cả Năm');
        const targetPills = [
            { id: 'xuatsac', label: 'XS', score: '9.0' },
            { id: 'gioi',    label: 'Giỏi', score: '8.0' },
            { id: 'kha',     label: 'Khá', score: '6.5' },
            { id: 'dat',     label: 'Đạt', score: '5.0' }
        ];

        const configBar = state.showConfig ? `
            <div class="rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-4 space-y-2.5 bento-card-enter">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">Bật / Tắt môn học theo tổ hợp của bạn</span>
                    <button type="button" id="btnCloseConfig" class="text-xs font-bold text-sky-500 cursor-pointer">Xong ✓</button>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${state.hk1.map(s => `
                        <button type="button" data-toggle-active="${s.id}"
                                class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    s.active
                                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent'
                                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 border-slate-200 dark:border-white/10'
                                }">
                            <span>${s.icon}</span>
                            <span>${s.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-3 pb-8">
                <!-- 1. CLEAN TOP BAR + 3-TAB SWITCHER -->
                <div class="flex flex-wrap items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2.5 flex-wrap">
                        <button type="button" onclick="AzotaApp.goBack()"
                                class="h-11 px-4 sm:px-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 shadow-md text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                            <span>Quay Lại</span>
                        </button>
                        <div class="flex items-center gap-2">
                            <h2 class="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Sổ Điểm TT22
                            </h2>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/25 text-[10px] font-extrabold">
                                <span>🔒</span>
                                <span>@${currAcc.nickname}</span>
                            </span>
                        </div>
                    </div>

                    <div class="inline-flex p-1 rounded-2xl bg-white dark:bg-[#0e1118] border border-slate-200/80 dark:border-white/10">
                        <button type="button" data-switch-tab="hk1" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'hk1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                            HK1
                        </button>
                        <button type="button" data-switch-tab="hk2" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'hk2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                            HK2
                        </button>
                        <button type="button" data-switch-tab="canam" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${state.currentTab === 'canam' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                            Cả Năm
                        </button>
                    </div>
                </div>

                <!-- 2. COMPACT VIETSCHOOL SUMMARY + GOAL BAR (Fits in ~120px on mobile so grade table starts immediately!) -->
                <div class="rounded-2xl bg-white dark:bg-[#0e1118] border border-slate-200/85 dark:border-white/10 shadow-sm overflow-hidden">
                    <!-- Top Summary Row -->
                    <div class="px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06]">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <span id="gcSummaryBadge" class="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xl shrink-0">${ev.rankBadge}</span>
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">${tabLabel}</span>
                                    <span class="text-[10px] text-slate-400">•</span>
                                    <span id="gcSummaryCount" class="text-[10px] font-bold text-slate-500 dark:text-slate-400">${ev.filledCount}/${ev.totalNumeric} môn có điểm</span>
                                </div>
                                <div id="gcSummaryRank" class="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                                    ${ev.rankTitle}
                                </div>
                                <p id="gcSummaryNote" class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    ${ev.detailNote}
                                </p>
                            </div>
                        </div>

                        <div class="text-right shrink-0 pl-2 border-l border-slate-200/70 dark:border-white/10">
                            <div class="text-[9px] font-black uppercase tracking-wider text-slate-400">ĐTB Chung</div>
                            <div id="gcSummaryAvg" class="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                                ${ev.overallAvgText}
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Compact Controls: Goal Pills + Config/Copy/Clear -->
                    <div class="px-3 py-2 bg-slate-50/70 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 flex-1 min-w-[210px]">
                            <span class="text-[10px] font-black uppercase text-slate-400 shrink-0 hidden sm:inline">Mục tiêu:</span>
                            <div class="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-slate-200/70 dark:bg-white/[0.05] flex-1 max-w-[260px]">
                                ${targetPills.map(tp => {
                                    const isAct = state.targetRank === tp.id;
                                    return `
                                        <button type="button" data-select-target="${tp.id}"
                                                class="py-1 px-1 rounded-lg text-[11px] font-black transition-all cursor-pointer text-center leading-tight ${
                                                    isAct
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }">
                                            ${tp.label}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" id="btnToggleConfig"
                                    class="h-8 px-2.5 rounded-lg bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-extrabold transition-colors cursor-pointer">
                                ⚙️ Môn
                            </button>
                            ${state.currentTab === 'hk2' ? `
                                <button type="button" id="btnCopyHk1ToHk2"
                                        class="h-8 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/25 text-[11px] font-extrabold transition-colors cursor-pointer">
                                    📋 Chép HK1
                                </button>
                            ` : ''}
                            ${state.currentTab !== 'canam' ? `
                                <button type="button" id="btnClearSem"
                                        class="h-8 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-[11px] font-extrabold transition-colors cursor-pointer"
                                        title="Xóa điểm học kì hiện tại">
                                    🗑️
                                </button>
                            ` : `
                                <button type="button" data-switch-tab="hk2"
                                        class="h-8 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/25 text-[11px] font-extrabold transition-colors cursor-pointer">
                                    ✏️ Nhập HK2
                                </button>
                            `}
                        </div>
                    </div>
                </div>

                ${configBar}

                <!-- 3. VIETSCHOOL REPORT CARD SHEET (4 FULL KTTX + GK + CK + ĐTB) -->
                ${state.currentTab === 'hk1'
                    ? (renderMobileSemesterCards(state.hk1, 'HK1', 'hk1', targetNum) + renderDesktopSemesterTable(state.hk1, 'HK1', 'hk1', targetNum))
                    : (state.currentTab === 'hk2'
                        ? (renderMobileSemesterCards(state.hk2, 'HK2', 'hk2', targetNum) + renderDesktopSemesterTable(state.hk2, 'HK2', 'hk2', targetNum))
                        : renderCombinedYearView(targetNum)
                    )
                }
            </div>
        `;

        bindEvents(container);
    }

    function bindEvents(container) {
        // Tab switcher
        container.querySelectorAll('[data-switch-tab]').forEach(btn => {
            btn.onclick = () => {
                state.currentTab = btn.dataset.switchTab;
                saveState();
                renderGradeCalculator();
            };
        });

        // Target segmented pill buttons (clean, zero ugly OS select dropdown!)
        container.querySelectorAll('[data-select-target]').forEach(btn => {
            btn.onclick = () => {
                state.targetRank = btn.dataset.selectTarget;
                saveState();
                renderGradeCalculator();
            };
        });

        // Toggle optional subjects bar
        const btnCfg = container.querySelector('#btnToggleConfig');
        if (btnCfg) {
            btnCfg.onclick = () => {
                state.showConfig = !state.showConfig;
                renderGradeCalculator();
            };
        }
        const btnCloseCfg = container.querySelector('#btnCloseConfig');
        if (btnCloseCfg) {
            btnCloseCfg.onclick = () => {
                state.showConfig = false;
                renderGradeCalculator();
            };
        }
        container.querySelectorAll('[data-toggle-active]').forEach(btn => {
            btn.onclick = () => toggleSubjectActive(btn.dataset.toggleActive);
        });

        // Copy HK1 -> HK2
        const btnCopy = container.querySelector('#btnCopyHk1ToHk2');
        if (btnCopy) btnCopy.onclick = () => copyHk1ToHk2();

        // Clear current semester
        const btnClear = container.querySelector('#btnClearSem');
        if (btnClear) btnClear.onclick = () => clearCurrentSemesterData();

        // Comment subject toggle (1 tap)
        container.querySelectorAll('button[data-toggle-comment]').forEach(btn => {
            btn.onclick = () => {
                const semKey = btn.dataset.sem;
                const subId = btn.dataset.toggleComment;
                const list = semKey === 'hk2' ? state.hk2 : state.hk1;
                const sub = list.find(s => s.id === subId);
                if (sub) {
                    sub.result = sub.result === 'Chưa Đạt' ? 'Đạt' : 'Chưa Đạt';
                    saveState();
                    renderGradeCalculator();
                }
            };
        });

        // Score inputs (live sync between mobile card + desktop row + top summary)
        const allInputs = Array.from(container.querySelectorAll('.grade-score-input'));
        allInputs.forEach(inp => {
            inp.onfocus = () => {
                try { inp.select(); } catch (_) {}
            };

            inp.oninput = () => {
                const semKey = inp.dataset.sem;
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                // Keep only digits, dot, comma
                const cleaned = inp.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                if (cleaned !== inp.value) inp.value = cleaned;

                const list = semKey === 'hk2' ? state.hk2 : state.hk1;
                const sub = list.find(s => s.id === subId);
                if (!sub) return;

                sub[field] = cleaned;
                saveState();

                // Mirror value to matching hidden desktop/mobile input
                container.querySelectorAll(`.grade-score-input[data-sem="${semKey}"][data-sub-id="${subId}"][data-field="${field}"]`).forEach(other => {
                    if (other !== inp) other.value = cleaned;
                });

                const targetNum = getTargetScoreNum();
                const calc = calcSubjectRow(sub);
                const needed = calcNeededCK(sub, targetNum);

                // Update both mobile VietSchool row & desktop row live
                container.querySelectorAll(`[data-sub-card="${subId}"], [data-sub-row="${subId}"]`).forEach(host => {
                    const isMob = host.hasAttribute('data-sub-card');
                    const avgCell = host.querySelector('[data-cell="avg"]');
                    if (avgCell) {
                        avgCell.textContent = calc.avgText;
                        avgCell.className = `${isMob ? 'text-[15px] leading-none' : 'text-base'} font-black font-mono ${avgScoreColor(calc.avgVal)}`;
                    }
                    const needCell = host.querySelector('[data-cell="needed"]');
                    if (needCell) {
                        needCell.textContent = needed.text;
                        needCell.className = isMob
                            ? `px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${neededToneClass(needed.tone)}`
                            : `inline-block px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${neededToneClass(needed.tone)}`;
                    }
                });

                updateSummaryLive(container);
            };

            inp.onblur = () => {
                const semKey = inp.dataset.sem;
                const subId = inp.dataset.subId;
                const field = inp.dataset.field;
                const list = semKey === 'hk2' ? state.hk2 : state.hk1;
                const sub = list.find(s => s.id === subId);
                if (!sub) return;

                const raw = String(sub[field] || '').trim();
                if (!raw) return;

                // Smart mobile shorthand: typing "85" auto-formats to "8.5"!
                let n = parseNum(raw);
                if (n === null && /^\d{2}$/.test(raw) && raw !== '10') {
                    const candidate = parseFloat(raw[0] + '.' + raw[1]);
                    if (!isNaN(candidate) && candidate >= 0 && candidate <= 10) {
                        n = candidate;
                    }
                }
                if (n !== null) {
                    const formatted = n.toFixed(1);
                    sub[field] = formatted;
                    container.querySelectorAll(`.grade-score-input[data-sem="${semKey}"][data-sub-id="${subId}"][data-field="${field}"]`).forEach(el => {
                        el.value = formatted;
                    });
                    saveState();
                    // Recalculate after smart formatting
                    inp.dispatchEvent(new Event('input'));
                } else {
                    // Out-of-range value -> reset cleanly
                    sub[field] = '';
                    container.querySelectorAll(`.grade-score-input[data-sem="${semKey}"][data-sub-id="${subId}"][data-field="${field}"]`).forEach(el => {
                        el.value = '';
                    });
                    saveState();
                    inp.dispatchEvent(new Event('input'));
                }
            };

            inp.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const visibleInputs = allInputs.filter(el => el.offsetParent !== null);
                    const idx = visibleInputs.indexOf(inp);
                    if (idx >= 0 && idx < visibleInputs.length - 1) {
                        visibleInputs[idx + 1].focus();
                        visibleInputs[idx + 1].select();
                    } else {
                        inp.blur();
                    }
                }
            };
        });
    }

    window.GradeCalcEngine = {
        render: renderGradeCalculator,
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
