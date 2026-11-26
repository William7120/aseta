/**
 * Aseta — Animated StatsBento Dashboard & Dedicated Utilities Hub Engine
 * 1. Dashboard (Dynamic 6-col Bento Grid with Live Motion):
 *    - Primary Card (col-span-3 row-span-2): Tên tài khoản + Tổng EXP count-up + Shimmer LV bar + Drifting Hatched Mask
 *    - BIG Day Streak Card (col-span-3): Nổi bật chuỗi ngày học (🔥 animated flame), lịch 7 ngày T2–CN tương tác, kỷ lục cá nhân
 *    - Analytics Card (col-span-2): Phân tích độ chính xác + 11 cột sparkline nảy lên & hover hiển thị số liệu động
 *    - Rank Card (col-span-1): Ngôi sao ★ xoay nhẹ + Hạng hiện tại & Điểm TB
 *    - Bottom Bento Row: Bảng Xếp Hạng EXP có thanh tiến độ nền (col-span-4) + Đồng hồ đếm ngược HK1 chạy từng giây & Tin TVG (col-span-2)
 * 2. Chức Năng (Utilities Hub): Quy tụ gọn gàng tất cả các công cụ & tính năng mở rộng.
 */
(function(window) {
    'use strict';

    const STREAK_KEY_PREFIX = 'aseta_daily_streak_v2_';

    const DashboardHubEngine = {
        lbSearch: '',
        lbFilter: 'all', // 'all' | 'active' | 'aroundMe'
        cachedNotices: null,
        _hk1TickTimer: null,

        getCurrentAccountIdSafe: function() {
            try {
                if (window.AccountManager && typeof window.AccountManager.getCurrentAccountId === 'function') {
                    return window.AccountManager.getCurrentAccountId();
                }
            } catch (_) {}
            return 'acc_ngocbinh';
        },

        getTodayKey: function() {
            if (window.AsetaProgressCloud && typeof window.AsetaProgressCloud.getVietnamDateKey === 'function') {
                return window.AsetaProgressCloud.getVietnamDateKey();
            }
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        // 100% REAL DAY STREAK — Never fake/auto-incremented on page load!
        // Only lights up when the account completes a genuine study action (Exam, Vocab, Essay, Solution Upload).
        getRealStreak: function() {
            const accId = this.getCurrentAccountIdSafe();
            if (window.AsetaProgressCloud && typeof window.AsetaProgressCloud.getStreakInfo === 'function') {
                return window.AsetaProgressCloud.getStreakInfo(accId);
            }
            return {
                count: 0,
                best: 0,
                didStudyToday: false,
                atRisk: false,
                status: 'inactive',
                today: this.getTodayKey(),
                history: []
            };
        },

        getWeekDaysStrip: function(streakState) {
            const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            const todayKey = (streakState && streakState.today) || this.getTodayKey();
            const [ty, tm, td] = todayKey.split('-').map(Number);
            const nowUtc = new Date(Date.UTC(ty, tm - 1, td));
            const jsDay = nowUtc.getUTCDay(); // 0=Sun, 1=Mon...
            const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
            const histSet = new Set((streakState && streakState.history) || []);

            const mondayUtc = new Date(nowUtc);
            mondayUtc.setUTCDate(nowUtc.getUTCDate() - todayIdx);

            return labels.map((lbl, idx) => {
                const d = new Date(mondayUtc);
                d.setUTCDate(mondayUtc.getUTCDate() + idx);
                const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                const isToday = idx === todayIdx;
                // STRICT REAL CHECK: today only lights up if the user actually studied today!
                const isActive = histSet.has(key);
                const isPast = idx < todayIdx;
                return { label: lbl, key, isToday, isActive, isPast, dateNum: d.getUTCDate() };
            });
        },

        getAnalyticsBars: function() {
            const currAccId = this.getCurrentAccountIdSafe();
            let myExams = [];

            // Prefer REAL cloud-synced exams for this account (works seamlessly across phone & laptop!)
            if (window.AsetaProgressCloud && typeof window.AsetaProgressCloud.getAccountProgress === 'function') {
                const prog = window.AsetaProgressCloud.getAccountProgress(currAccId);
                if (prog && Array.isArray(prog.recentExams) && prog.recentExams.length > 0) {
                    myExams = prog.recentExams;
                }
            }

            // Fallback to localStorage history strictly filtered by this account
            if (myExams.length === 0) {
                let examHistory = [];
                try {
                    examHistory = JSON.parse(localStorage.getItem('azota_exam_history') || '[]');
                    if (!Array.isArray(examHistory)) examHistory = [];
                } catch (_) {
                    examHistory = [];
                }
                let currNick = '';
                try {
                    const currAcc = window.AccountManager && window.AccountManager.getCurrentAccount ? window.AccountManager.getCurrentAccount() : null;
                    currNick = currAcc && currAcc.nickname ? currAcc.nickname.toLowerCase() : '';
                } catch (_) {}

                myExams = examHistory.filter(h => {
                    if (!h) return false;
                    if (h.accountId) return h.accountId === currAccId;
                    if (h.nickname && currNick) return h.nickname.toLowerCase() === currNick;
                    return false;
                });
            }

            if (myExams.length === 0) {
                return [];
            }

            // Oldest -> newest for left-to-right chart progression (up to 11 recent real attempts)
            const recent = myExams.slice(0, 11).reverse();
            return recent.map((h, i) => {
                const s = Number(h.score);
                const safeScore = isNaN(s) ? 0 : s;
                const pct = Math.max(14, Math.min(100, Math.round(safeScore * 10)));
                const title = (h.examTitle || `Đề #${i + 1}`).slice(0, 22);
                return { h: pct, score: safeScore, label: `${title}: ${safeScore}đ` };
            });
        },

        getLevelInfo: function(exp) {
            const safeExp = Math.max(0, Number(exp) || 0);
            const xpPerLevel = 500;
            const level = Math.floor(safeExp / xpPerLevel) + 1;
            const currentInLevel = safeExp % xpPerLevel;
            const pct = Math.min(100, Math.round((currentInLevel / xpPerLevel) * 100));
            const titles = [
                'Tân Binh Học Thuật',
                'Học Giả Tập Sự',
                'Chiến Binh Tri Thức',
                'Học Bá Aseta',
                'Cao Thủ Khảo Thí',
                'Huyền Thoại 11A7'
            ];
            const title = titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))];
            return { level, currentInLevel, xpPerLevel, pct, title };
        },

        animateCountUp: function(el, targetValue, duration = 650, formatFn = (v) => v.toLocaleString('vi-VN')) {
            if (!el) return;
            const target = Number(targetValue) || 0;
            if (target <= 0 || document.hidden) {
                el.textContent = formatFn(target);
                return;
            }
            const start = performance.now();
            let finished = false;
            const step = (now) => {
                if (finished) return;
                const p = Math.min(1, (now - start) / duration);
                const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
                const val = Math.round(target * eased);
                el.textContent = formatFn(val);
                if (p < 1) {
                    requestAnimationFrame(step);
                } else {
                    finished = true;
                    el.textContent = formatFn(target);
                }
            };
            requestAnimationFrame(step);
            // Failsafe: guarantee exact target value even if rAF is throttled in background/low-power mode
            setTimeout(() => {
                finished = true;
                el.textContent = formatFn(target);
            }, duration + 60);
        },

        attachBentoSpotlight: function(rootEl) {
            if (!rootEl) return;
            const supportsHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            rootEl.querySelectorAll('.bento-interactive').forEach(card => {
                if (supportsHover) {
                    card.addEventListener('mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
                    }, { passive: true });
                } else {
                    // Lightweight 60fps touch spotlight flash on tap (zero scroll jank)
                    card.addEventListener('touchstart', (e) => {
                        const t = e.touches && e.touches[0];
                        if (!t) return;
                        const rect = card.getBoundingClientRect();
                        card.style.setProperty('--mx', `${t.clientX - rect.left}px`);
                        card.style.setProperty('--my', `${t.clientY - rect.top}px`);
                        card.classList.add('bento-touch-active');
                        clearTimeout(card._touchGlowTimer);
                        card._touchGlowTimer = setTimeout(() => card.classList.remove('bento-touch-active'), 420);
                    }, { passive: true });
                }
            });
        },

        startDashboardHk1Ticker: function() {
            if (this._hk1TickTimer) clearInterval(this._hk1TickTimer);
            const tick = () => {
                const slot = document.getElementById('dashHk1LiveClock');
                if (!slot) return;
                const c = window.ExamScheduleEngine
                    ? window.ExamScheduleEngine.getDaysRemaining()
                    : { days: 18, hours: 0, mins: 0, secs: 0, started: false };
                if (c.started) {
                    slot.textContent = 'ĐANG TRONG ĐỢT THI HK1';
                } else {
                    slot.textContent = `${String(c.days).padStart(2, '0')}d : ${String(c.hours).padStart(2, '0')}h : ${String(c.mins).padStart(2, '0')}m : ${String(c.secs).padStart(2, '0')}s`;
                }
            };
            tick();
            this._hk1TickTimer = setInterval(tick, 1000);
        },

        hoverSparkBar: function(label) {
            const readEl = document.getElementById('dashSparkReadout');
            if (readEl) readEl.textContent = label;
        },

        resetSparkBar: function(defaultLabel) {
            const readEl = document.getElementById('dashSparkReadout');
            if (readEl) readEl.textContent = defaultLabel;
        },

        setLeaderboardSearch: function(val) {
            this.lbSearch = (val || '').trim();
            this.renderLeaderboardRowsOnly();
        },

        setLeaderboardFilter: function(mode) {
            this.lbFilter = mode || 'all';
            document.querySelectorAll('.dash-lb-filter-btn').forEach(b => {
                const isAct = b.getAttribute('data-mode') === this.lbFilter;
                b.className = `dash-lb-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    isAct
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`;
            });
            this.renderLeaderboardRowsOnly();
        },

        getLiveDashboardPayload: function() {
            if (window.AzotaApp && typeof window.AzotaApp.getDashboardData === 'function') {
                return window.AzotaApp.getDashboardData();
            }
            return {
                user: { id: 'acc_ngocbinh', name: 'Ngọc Bình', nickname: 'NgocBinh', avatar: '🌟', grade: 'Lớp 11', role: '🎓 Học Sinh' },
                exp: 0,
                doneCount: 0,
                gpa: 0,
                accuracy: 0,
                rank: 1,
                leaderboard: []
            };
        },

        ensureNoticesLoaded: async function() {
            if (window.SchoolNewsEngine && window.SchoolNewsEngine.data && window.SchoolNewsEngine.data.generalNotices) {
                this.cachedNotices = window.SchoolNewsEngine.data.generalNotices.slice(0, 4);
                return this.cachedNotices;
            }
            if (this.cachedNotices) return this.cachedNotices;
            try {
                const res = await fetch(`data/school_news.json?_t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const j = await res.json();
                    this.cachedNotices = (j.generalNotices || []).slice(0, 4);
                    this.renderNoticesSlotOnly();
                    return this.cachedNotices;
                }
            } catch (_) {}
            return [];
        },

        renderNoticesSlotOnly: function() {
            const slot = document.getElementById('dashboardNoticesList');
            if (!slot) return;
            const list = this.cachedNotices || (window.SchoolNewsEngine?.data?.generalNotices || []).slice(0, 4);
            if (!list || list.length === 0) {
                slot.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Đang đồng bộ thông báo từ THPT Trần Văn Giàu...</p>`;
                return;
            }
            slot.innerHTML = list.map((n, idx) => `
                <a href="${n.link}" target="_blank" rel="noopener noreferrer"
                   class="group flex items-start gap-2.5 p-2.5 rounded-2xl bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-slate-200/70 dark:border-white/5 hover:translate-x-1 transition-all duration-200">
                    <span class="w-5 h-5 rounded-lg ${idx === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300'} flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        ${idx + 1}
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 line-clamp-2 leading-snug transition-colors">
                            ${n.title}
                        </p>
                        ${idx === 0 ? '<span class="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Mới nhất</span>' : ''}
                    </div>
                </a>
            `).join('');
        },

        renderLeaderboardRowsOnly: function() {
            const listEl = document.getElementById('dashboardLeaderboardList');
            if (!listEl) return;

            const payload = this.getLiveDashboardPayload();
            const allRows = payload.leaderboard || [];
            const maxExp = allRows.length > 0 ? Math.max(1, allRows[0].points || 1) : 1;
            const q = this.lbSearch.toLowerCase();

            let rows = allRows.filter(s =>
                !q ||
                (s.name || '').toLowerCase().includes(q) ||
                (s.nickname || '').toLowerCase().includes(q) ||
                (s.grade || '').toLowerCase().includes(q)
            );

            if (!q && this.lbFilter === 'active') {
                rows = rows.filter(s => (s.doneCount || 0) > 0 || (s.points || 0) > 0);
            } else if (!q && this.lbFilter === 'aroundMe') {
                const myIdx = rows.findIndex(s => s.isCurrentUser);
                if (myIdx !== -1) {
                    rows = rows.slice(Math.max(0, myIdx - 2), Math.min(rows.length, myIdx + 3));
                }
            }

            if (rows.length === 0) {
                const emptyMsg = this.lbFilter === 'active'
                    ? 'Chưa có tài khoản nào hoàn thành đề thi. Vào Kho Đề để ghi điểm đầu tiên!'
                    : `Không tìm thấy "${this.lbSearch}" trên bảng xếp hạng.`;
                listEl.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">${emptyMsg}</div>`;
                return;
            }

            listEl.innerHTML = rows.map((st, idx) => {
                const rank = st.rank || (idx + 1);
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const relPct = (st.points || 0) > 0
                    ? Math.max(10, Math.min(100, Math.round(((st.points || 0) / maxExp) * 100)))
                    : 0;
                const rowCls = st.isCurrentUser
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-lg'
                    : 'bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.07] border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-white';
                const subTextCls = st.isCurrentUser
                    ? 'text-slate-300 dark:text-slate-600'
                    : 'text-slate-500 dark:text-slate-400';
                const expTextCls = st.isCurrentUser
                    ? 'text-amber-300 dark:text-slate-950'
                    : 'text-slate-900 dark:text-white';
                const barFillCls = st.isCurrentUser
                    ? 'bg-white/10 dark:bg-slate-950/10'
                    : 'bg-sky-500/[0.06] dark:bg-white/[0.03]';
                const adminPill = st.isAdmin
                    ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-400/30">Admin</span>'
                    : '';
                const statSummary = (st.doneCount || 0) > 0
                    ? `TB ${st.gpa}đ • ${st.accuracy}%`
                    : ((st.points || 0) > 0 ? 'Luyện tập tích cực' : 'Chưa có hoạt động');
                const streakBadge = (st.streak || 0) > 0
                    ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${st.isCurrentUser ? 'bg-orange-500/25 text-orange-300 dark:bg-orange-500/15 dark:text-orange-600' : 'bg-orange-500/15 text-orange-500 dark:text-amber-300'} border border-orange-500/25">🔥 ${st.streak}</span>`
                    : '';

                return `
                    <div style="animation-delay: ${Math.min(idx * 22, 180)}ms"
                         class="bento-card-enter relative overflow-hidden flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border hover:translate-x-1 transition-all duration-200 ${rowCls}">
                        <!-- Proportional subtle EXP progress fill -->
                        <div class="absolute inset-y-0 left-0 pointer-events-none transition-all duration-700 ${barFillCls}" style="width: ${relPct}%"></div>

                        <div class="relative z-10 flex items-center gap-3 min-w-0">
                            <span class="w-7 text-center font-black text-xs shrink-0">${medal}</span>
                            <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-base shrink-0">
                                ${st.avatar || '🎓'}
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="text-xs sm:text-sm font-black truncate">${st.name}</span>
                                    ${adminPill}
                                    ${st.isCurrentUser ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500 text-white">Bạn</span>' : ''}
                                    ${streakBadge}
                                </div>
                                <div class="text-[11px] truncate ${subTextCls}">
                                    @${st.nickname || 'hocsinh'} • ${st.grade || 'Lớp 11'} • ${st.doneCount || 0} đề
                                </div>
                            </div>
                        </div>
                        <div class="relative z-10 text-right shrink-0">
                            <div class="text-xs sm:text-sm font-black font-mono ${expTextCls}">
                                ${(st.points || 0).toLocaleString('vi-VN')} EXP
                            </div>
                            <div class="text-[10px] font-semibold ${subTextCls}">
                                ${statSummary}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },

        refreshLiveMetrics: function() {
            const container = document.getElementById('dashboardHubContainer');
            if (!container || !document.getElementById('dashboardLeaderboardList')) return;
            const payload = this.getLiveDashboardPayload();
            const lv = this.getLevelInfo(payload.exp);
            const streak = this.getRealStreak();

            const expEl = document.getElementById('dashAnimatedExp');
            if (expEl) expEl.textContent = (payload.exp || 0).toLocaleString('vi-VN');
            const barEl = document.getElementById('dashExpBarFill');
            if (barEl) barEl.style.width = `${Math.max(payload.exp > 0 ? 6 : 0, lv.pct)}%`;
            const streakEl = document.getElementById('dashAnimatedStreak');
            if (streakEl) streakEl.textContent = String(streak.count || 0);
            const rankEl = document.getElementById('dashLiveRankNum');
            if (rankEl) rankEl.textContent = `#${payload.rank || 1}`;
            this.renderLeaderboardRowsOnly();
        },

        // =========================================================================
        // VIEW 1: ANIMATED STATSBENTO DASHBOARD (REAL CLOUD EXP + REAL DAY STREAK)
        // =========================================================================
        renderDashboard: function(containerId = 'dashboardHubContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const payload = this.getLiveDashboardPayload();
            const u = payload.user;
            const lv = this.getLevelInfo(payload.exp);
            const streak = this.getRealStreak();
            const weekDays = this.getWeekDaysStrip(streak);
            const bars = this.getAnalyticsBars();
            const hasRealExams = bars.length > 0;
            const defaultSparkText = hasRealExams
                ? `Dữ liệu thật từ ${bars.length} bài thi gần nhất`
                : 'Chưa có bài làm • Vào Kho Đề để bắt đầu';
            const primaryDescHtml = (payload.doneCount || 0) > 0
                ? `Tài khoản <strong class="opacity-100">@${u.nickname || 'NgocBinh'}</strong> (${u.grade || 'Lớp 11'}) đang đứng <strong>Hạng #${payload.rank}</strong> với <strong>${payload.doneCount} đề</strong> đã làm và điểm TB <strong>${payload.gpa}đ</strong>.`
                : ((payload.exp || 0) > 0
                    ? `Tài khoản <strong class="opacity-100">@${u.nickname || 'NgocBinh'}</strong> đang đứng <strong>Hạng #${payload.rank}</strong> với <strong>${payload.exp} EXP</strong> thật đồng bộ đám mây!`
                    : `Tài khoản <strong class="opacity-100">@${u.nickname || 'NgocBinh'}</strong> (${u.grade || 'Lớp 11'}) đang ở <strong>Hạng #${payload.rank}</strong>. Hoàn thành đề thi, từ vựng hoặc tự luận để tích lũy EXP thật!`);
            const analyticsBarsHtml = hasRealExams
                ? bars.map((b, i) => `
                    <div class="bento-spark-bar flex-1 max-w-[26px] rounded-full cursor-pointer ${i === bars.length - 1 ? 'bg-sky-500 dark:bg-sky-400' : 'bg-slate-800/75 dark:bg-white/75 hover:bg-sky-400'}"
                         style="height: ${b.h}%; animation-delay: ${180 + i * 42}ms"
                         onmouseenter="DashboardHubEngine.hoverSparkBar('${b.label.replace(/'/g, '')}')"
                         title="${b.label}"></div>
                  `).join('')
                : `
                    <div class="w-full h-full rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02] flex items-center justify-between px-3 gap-2">
                        <span class="text-[11px] font-semibold text-slate-400 truncate">Chưa có dữ liệu điểm</span>
                        <button type="button" onclick="AzotaApp.openFileExplorer('root')"
                                class="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 dark:text-sky-300 text-[10px] font-black transition-colors cursor-pointer shrink-0">
                            Kho Đề ➔
                        </button>
                    </div>
                  `;

            const streakStatusText = streak.didStudyToday
                ? 'Đã giữ chuỗi hôm nay ✓'
                : (streak.atRisk
                    ? 'Làm 1 bài hôm nay để giữ chuỗi!'
                    : 'Chưa học hôm nay • Làm 1 bài để thắp lửa!');
            const streakStatusCls = streak.didStudyToday
                ? 'text-emerald-500 dark:text-emerald-400'
                : (streak.atRisk ? 'text-amber-500 dark:text-amber-300 animate-pulse' : 'text-slate-400');
            const flameBoxCls = streak.didStudyToday
                ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 shadow-lg shadow-orange-500/35'
                : (streak.atRisk
                    ? 'bg-gradient-to-br from-amber-500/80 to-orange-600/80 shadow-md shadow-amber-500/20'
                    : 'bg-slate-200 dark:bg-white/10 grayscale opacity-75');

            const weekStripHtml = weekDays.map(d => {
                let pillCls = 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 border border-slate-200/70 dark:border-white/5 font-bold';
                let iconGlyph = '·';
                if (d.isActive && d.isToday) {
                    pillCls = 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/35 ring-2 ring-amber-300/80 scale-105';
                    iconGlyph = '🔥';
                } else if (d.isActive) {
                    pillCls = 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/40 font-extrabold';
                    iconGlyph = '🔥';
                } else if (d.isToday) {
                    pillCls = 'bg-orange-500/10 text-orange-500 dark:text-amber-300 border border-dashed border-orange-400/70 font-black';
                    iconGlyph = '○';
                }
                return `
                    <div class="flex flex-col items-center gap-1 flex-1 min-w-0" title="${d.label} (${d.dateNum}) ${d.isActive ? '• Đã hoàn thành học tập 🔥' : (d.isToday ? '• Hôm nay chưa học' : '• Chưa có hoạt động')}">
                        <div class="w-full py-1.5 rounded-xl text-[10px] text-center transition-all ${pillCls}">
                            <div>${d.label}</div>
                            <div class="text-[11px] mt-0.5 leading-none">${iconGlyph}</div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="max-w-7xl mx-auto space-y-4">
                    <!-- TOP STATSBENTO 6-COLUMN ANIMATED GRID (Mobile: 3-col balanced so Analytics + Rank sit side-by-side) -->
                    <div class="grid grid-cols-3 md:grid-cols-6 md:grid-rows-2 gap-3 sm:gap-4">

                        <!-- 1. PRIMARY STAT (col-span-3 row-span-2): High-Contrast Editorial EXP + Account -->
                        <div style="animation-delay: 0ms"
                             class="bento-card-enter bento-interactive bento-interactive-light col-span-3 md:row-span-2 bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 rounded-3xl p-6 sm:p-9 flex flex-col justify-between relative shadow-xl border border-slate-800 dark:border-white/40 min-h-[250px] sm:min-h-[290px]">
                            <div class="bento-hatch-overlay"></div>

                            <div class="relative z-10 flex items-center justify-between gap-2.5 flex-wrap">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-slate-950/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/85 dark:text-slate-950/75">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Tổng EXP Học Tập • LV.${lv.level}</span>
                                </span>
                                <button type="button" onclick="AzotaApp.handleProfileClick()"
                                        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-950/10 dark:hover:bg-slate-950/15 transition-all hover:scale-105 cursor-pointer">
                                    <span class="text-sm leading-none">${u.avatar || '👦'}</span>
                                    <span class="text-xs font-extrabold truncate max-w-[140px]">${u.name || 'Học Sinh Aseta'}</span>
                                    <span class="text-[10px] opacity-60">✏️</span>
                                </button>
                            </div>

                            <div class="relative z-10 my-4 sm:my-5">
                                <div class="flex items-baseline gap-2.5 flex-wrap">
                                    <h3 id="dashAnimatedExp" class="text-5xl sm:text-6xl font-black tracking-tighter font-mono leading-none">
                                        ${(payload.exp || 0).toLocaleString('vi-VN')}
                                    </h3>
                                    <span class="text-sm sm:text-base font-black uppercase tracking-widest opacity-55">EXP</span>
                                </div>
                                <div class="mt-4 max-w-sm space-y-1.5">
                                    <div class="bento-shimmer-track w-full h-2.5 rounded-full bg-white/15 dark:bg-slate-950/10 overflow-hidden">
                                        <div id="dashExpBarFill" class="h-full rounded-full bg-white dark:bg-slate-950 transition-all duration-1000 ease-out" style="width: 0%"></div>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] font-bold opacity-70">
                                        <span>${lv.title}</span>
                                        <span>${lv.currentInLevel} / ${lv.xpPerLevel} EXP → LV.${lv.level + 1}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="relative z-10 text-xs sm:text-sm opacity-65 max-w-md leading-relaxed">
                                ${primaryDescHtml}
                            </p>
                        </div>

                        <!-- 2. BIG PROMINENT DAY STREAK CARD (col-span-3 — To, Rõ, Động 60fps!) -->
                        <div style="animation-delay: 80ms"
                             class="bento-card-enter bento-interactive col-span-3 bg-gradient-to-br from-orange-500/10 via-white to-amber-500/5 dark:from-[#1b1411] dark:via-[#14151d] dark:to-[#181316] rounded-3xl p-5 sm:p-7 border border-orange-500/25 dark:border-amber-500/25 flex flex-col justify-between gap-4 shadow-md relative">
                            <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 92% 10%, rgba(249,115,22,0.18), transparent 48%);"></div>

                            <div class="relative z-10 flex items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${flameBoxCls} flex items-center justify-center text-2xl sm:text-3xl shrink-0 transition-all">
                                        <span class="${streak.didStudyToday ? 'bento-flame-live' : ''}">🔥</span>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-black uppercase tracking-widest text-orange-500 dark:text-amber-400">
                                            Day Streak • Thực Tế
                                        </p>
                                        <div class="flex items-baseline gap-1.5 mt-0.5">
                                            <span id="dashAnimatedStreak" class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                                ${streak.count}
                                            </span>
                                            <span class="text-xs sm:text-sm font-extrabold text-slate-500 dark:text-slate-300">
                                                ngày liên tiếp
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-right shrink-0">
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black">
                                        <span>🏆</span> <span>Kỷ lục: ${streak.best || streak.count}</span>
                                    </span>
                                    <p class="text-[10px] mt-1 font-bold ${streakStatusCls}">${streakStatusText}</p>
                                </div>
                            </div>

                            <!-- 7-Day Interactive Calendar Streak Strip -->
                            <div class="relative z-10 flex items-center gap-1.5 sm:gap-2">
                                ${weekStripHtml}
                            </div>
                        </div>

                        <!-- 3. ANALYTICS & INTERACTIVE SPARKLINE (col-span-2 — sits right next to Rank on Mobile too!) -->
                        <div style="animation-delay: 150ms"
                             class="bento-card-enter bento-interactive col-span-2 bg-white dark:bg-[#14161f] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-2 shadow-sm">
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Phân Tích
                                    </p>
                                    <div class="flex items-baseline gap-1.5 mt-0.5">
                                        <p id="dashAnimatedAcc" class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                                            ${hasRealExams ? `${payload.accuracy}%` : '—'}
                                        </p>
                                        <span class="text-[11px] font-extrabold ${hasRealExams ? 'text-emerald-500' : 'text-slate-400'}">
                                            ${hasRealExams ? `TB ${payload.gpa}đ` : '0 đề'}
                                        </span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-lg ${hasRealExams ? 'bg-sky-500/15 text-sky-500 dark:text-sky-300' : 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400'} text-[9px] font-black uppercase">
                                    ${hasRealExams ? `${bars.length} bài` : 'Thực tế'}
                                </span>
                            </div>

                            <div class="flex gap-1.5 items-end h-9 w-full" onmouseleave="DashboardHubEngine.resetSparkBar('${defaultSparkText}')">
                                ${analyticsBarsHtml}
                            </div>

                            <p id="dashSparkReadout" class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                ${defaultSparkText}
                            </p>
                        </div>

                        <!-- 4. RANK & RATING STAR TILE (col-span-1) -->
                        <div style="animation-delay: 210ms"
                             class="bento-card-enter bento-interactive col-span-1 bg-white dark:bg-[#0e1017] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                            <div class="w-10 h-10 text-lg rounded-full bg-slate-950 text-amber-400 dark:bg-white/10 border border-white/10 flex items-center justify-center shadow-sm">
                                <span class="bento-star-live">★</span>
                            </div>
                            <p id="dashLiveRankNum" class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-none mt-1">
                                #${payload.rank}
                            </p>
                            <p class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Hạng Lớp
                            </p>
                        </div>
                    </div>

                    <!-- BOTTOM BENTO ROW: LEADERBOARD (col-span-4) + LIVE HK1 COUNTDOWN & NOTICES (col-span-2) -->
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">

                        <!-- BẢNG XẾP HẠNG (col-span-4) -->
                        <div style="animation-delay: 300ms"
                             class="bento-card-enter bento-interactive md:col-span-4 bg-white dark:bg-[#0e1017] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Leaderboard • Thời Gian Thực
                                        </p>
                                        <span data-progress-sync-badge class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span>Cloud Live</span>
                                        </span>
                                        <button type="button" onclick="window.AsetaProgressCloud && window.AsetaProgressCloud.manualSync()"
                                                class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                                title="Đồng bộ EXP & BXH mới nhất từ đám mây">
                                            🔄
                                        </button>
                                    </div>
                                    <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
                                        <span>🏆</span> <span>Bảng Xếp Hạng Học Tập</span>
                                    </h3>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <div class="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                                        <button type="button" data-mode="all" onclick="DashboardHubEngine.setLeaderboardFilter('all')" class="dash-lb-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs">Tất cả (${(payload.leaderboard || []).length})</button>
                                        <button type="button" data-mode="active" onclick="DashboardHubEngine.setLeaderboardFilter('active')" class="dash-lb-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer text-slate-500 dark:text-slate-400">Đã làm đề</button>
                                        <button type="button" data-mode="aroundMe" onclick="DashboardHubEngine.setLeaderboardFilter('aroundMe')" class="dash-lb-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer text-slate-500 dark:text-slate-400">Gần tôi</button>
                                    </div>
                                    <div class="relative w-full sm:w-44">
                                        <input type="text"
                                               value="${this.lbSearch}"
                                               oninput="DashboardHubEngine.setLeaderboardSearch(this.value)"
                                               placeholder="Tìm bạn..."
                                               class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-sky-500/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none">
                                        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                                    </div>
                                </div>
                            </div>

                            <div id="dashboardLeaderboardList" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
                        </div>

                        <!-- THÔNG BÁO & ĐỒNG HỒ ĐẾM NGƯỢC HK1 ĐỘNG (col-span-2) -->
                        <div class="md:col-span-2 flex flex-col gap-4">
                            <!-- Live Ticking Exam Countdown Tile -->
                            <button type="button" onclick="AzotaApp.showView('examSchedule')"
                                    style="animation-delay: 360ms"
                                    class="bento-card-enter bento-interactive group text-left bg-white dark:bg-[#14161f] hover:border-amber-500/50 rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm cursor-pointer space-y-2">
                                <div class="flex items-center justify-between">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                        <span>🗓️ Cuối Học Kỳ I</span>
                                    </p>
                                    <span class="text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">➔</span>
                                </div>
                                <p id="dashHk1LiveClock" class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                                    18d : 09h : 00m : 00s
                                </p>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    14/12 – 22/12 • 14 đề cương TVG
                                </p>
                            </button>

                            <!-- Live School Notices Feed Tile -->
                            <div style="animation-delay: 420ms"
                                 class="bento-card-enter bento-interactive flex-1 bg-white dark:bg-[#0e1017] rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3">
                                <div class="relative z-10 space-y-3">
                                    <div class="flex items-center justify-between gap-2">
                                        <div>
                                            <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                <span>Thông Báo TVG</span>
                                            </p>
                                            <h4 class="text-sm font-black text-slate-900 dark:text-white mt-0.5">Tin Mới Từ Trường</h4>
                                        </div>
                                        <button type="button" onclick="window.SchoolNewsEngine && window.SchoolNewsEngine.openModal()"
                                                class="text-[11px] font-bold text-sky-500 hover:text-sky-400 cursor-pointer shrink-0">
                                            Xem hết ↗
                                        </button>
                                    </div>
                                    <div id="dashboardNoticesList" class="space-y-2"></div>
                                </div>

                                <button type="button" onclick="AzotaApp.showView('utilities')"
                                        class="relative z-10 w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-between">
                                    <span>🧩 Mở Kho Chức Năng</span>
                                    <span>➔</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            this.renderLeaderboardRowsOnly();
            this.renderNoticesSlotOnly();
            this.ensureNoticesLoaded();
            this.attachBentoSpotlight(container);
            this.startDashboardHk1Ticker();
            if (window.AsetaProgressCloud && typeof window.AsetaProgressCloud.syncFromCloud === 'function') {
                window.AsetaProgressCloud.syncFromCloud(true);
            }

            // Trigger smooth live animations after paint (STRICTLY 0 when streak.count === 0!)
            requestAnimationFrame(() => {
                this.animateCountUp(document.getElementById('dashAnimatedExp'), payload.exp || 0, 900);
                if (hasRealExams) {
                    this.animateCountUp(document.getElementById('dashAnimatedAcc'), payload.accuracy || 0, 800, (v) => `${v}%`);
                }
                const realStreakCount = Number(streak.count) || 0;
                if (realStreakCount > 0) {
                    this.animateCountUp(document.getElementById('dashAnimatedStreak'), realStreakCount, 650, (v) => String(v));
                } else {
                    const stEl = document.getElementById('dashAnimatedStreak');
                    if (stEl) stEl.textContent = '0';
                }
                const barFill = document.getElementById('dashExpBarFill');
                if (barFill) {
                    setTimeout(() => { barFill.style.width = `${lv.pct}%`; }, 80);
                }
            });
        },

        // =========================================================================
        // VIEW 2: KHO CHỨC NĂNG & TIỆN ÍCH (TÁCH RIÊNG KHỎI DASHBOARD)
        // =========================================================================
        renderUtilities: function(containerId = 'utilitiesHubContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const daysInfo = window.ExamScheduleEngine
                ? window.ExamScheduleEngine.getDaysRemaining()
                : { days: 18, started: false };
            const countdownLabel = daysInfo.started ? 'Đang thi HK1' : `Còn ${daysInfo.days} ngày`;

            let attemptsCount = 0;
            try {
                const arr = JSON.parse(localStorage.getItem('azota_exam_history') || '[]');
                if (Array.isArray(arr)) attemptsCount = arr.length;
            } catch (_) {}

            const sections = [
                {
                    title: 'Thi Cử & Trường THPT Trần Văn Giàu',
                    icon: '🏫',
                    cards: [
                        {
                            title: 'Lịch Thi & Đề Cương HK1',
                            desc: 'Đợt kiểm tra 14/12 – 22/12/2026 & trọn bộ 14 file đề cương chính thức THPT TVG.',
                            icon: '🗓️',
                            badge: countdownLabel,
                            badgeId: 'dashboardHk1Countdown',
                            badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                            gradient: 'from-rose-600 via-orange-500 to-amber-500',
                            action: "AzotaApp.showView('examSchedule')"
                        },
                        {
                            title: 'Cổng Thông Báo THPT TVG',
                            desc: 'Lịch công tác tuần, thực đơn bán trú HD & văn bản BGH đồng bộ trực tiếp.',
                            icon: '📢',
                            badge: 'Live Sync',
                            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                            gradient: 'from-red-600 to-orange-600',
                            action: "window.SchoolNewsEngine ? window.SchoolNewsEngine.openModal() : AzotaApp.openSchoolNews()"
                        },
                        {
                            title: 'Thời Khóa Biểu & Balo 11A7',
                            desc: 'Xem tiết học hôm nay, ngày mai và danh sách sách vở cần soạn cặp.',
                            icon: '📅',
                            badge: '11A7',
                            badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                            gradient: 'from-blue-600 to-indigo-600',
                            action: 'AzotaApp.openTimetable()'
                        }
                    ]
                },
                {
                    title: 'Công Cụ Học Tập & Tiện Ích',
                    icon: '🧩',
                    cards: [
                        {
                            title: 'Tính Điểm & Xếp Loại TT22',
                            desc: 'Tính điểm trung bình môn, học kỳ và dự báo danh hiệu Học sinh Giỏi / Xuất sắc.',
                            icon: '🧮',
                            badge: 'Thông Tư 22',
                            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                            gradient: 'from-amber-500 to-orange-600',
                            action: "AzotaApp.showView('gradeCalc')"
                        },
                        {
                            title: 'Kho Lời Giải & Bài Mẫu',
                            desc: 'Thư viện hình ảnh lời giải chi tiết, bài mẫu theo từng môn học.',
                            icon: '📸',
                            badge: 'Hình Ảnh',
                            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                            gradient: 'from-emerald-500 to-teal-600',
                            action: "AzotaApp.showView('solutions')"
                        },
                        {
                            title: 'Học Tự Luận Siêu Tốc',
                            desc: 'Luyện ghi nhớ từ khóa trọng tâm & phương pháp trả lời tự luận chuẩn.',
                            icon: '📝',
                            badge: 'Tự Luận',
                            badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                            gradient: 'from-cyan-500 to-blue-600',
                            action: "AzotaApp.openFileExplorer('Hoc_Tu_Luan')"
                        },
                        {
                            title: 'Sổ Tay Câu Cần Ghi Nhớ',
                            desc: 'Ôn lại nhanh những câu hỏi khó và câu đã lưu trong quá trình làm bài.',
                            icon: '📖',
                            badge: 'Ôn Lỗi Sai',
                            badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                            gradient: 'from-pink-600 to-rose-600',
                            action: "AzotaApp.showView('notebook')"
                        },
                        {
                            title: 'Lịch Sử Các Lần Làm Bài',
                            desc: 'Xem lại chi tiết điểm số, thời gian và đáp án các bài thi đã làm.',
                            icon: '📜',
                            badge: `${attemptsCount} lượt thi`,
                            badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                            gradient: 'from-sky-500 to-indigo-600',
                            action: "AzotaApp.showView('history')"
                        },
                        {
                            title: 'Kỷ Niệm A7 — Sổ Lưu Bút',
                            desc: 'Album ảnh & thước phim thanh xuân lớp 10A7 – 11A7 kèm nhạc nền.',
                            icon: '🎞️',
                            badge: '11A7',
                            badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
                            gradient: 'from-pink-500 via-purple-500 to-amber-500',
                            action: "window.Class11A7JournalEngine ? window.Class11A7JournalEngine.openModal() : AzotaApp.open11A7Journal()"
                        }
                    ]
                }
            ];

            const sectionsHtml = sections.map((sec, sIdx) => `
                <div class="space-y-3.5">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>${sec.icon}</span>
                            <span>${sec.title}</span>
                        </h3>
                        <span class="text-[11px] font-semibold text-slate-400">${sec.cards.length} chức năng</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${sec.cards.map((c, cIdx) => `
                            <button type="button" onclick="${c.action}"
                                    style="animation-delay: ${(sIdx * 120) + (cIdx * 55)}ms"
                                    class="bento-card-enter bento-interactive group text-left p-5 rounded-3xl bg-white/80 dark:bg-[#0f111a]/90 hover:bg-white dark:hover:bg-[#151827] border border-slate-200/80 dark:border-white/10 hover:border-sky-500/40 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between gap-4 cursor-pointer active:scale-[0.985]">
                                <div class="relative z-10 flex items-start justify-between gap-3 w-full">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform shrink-0 border border-white/15">
                                        ${c.icon}
                                    </div>
                                    <span ${c.badgeId ? `id="${c.badgeId}"` : ''} class="px-2.5 py-1 rounded-full text-[10px] font-black border ${c.badgeClass} shrink-0">
                                        ${c.badge}
                                    </span>
                                </div>
                                <div class="relative z-10">
                                    <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                                        ${c.title}
                                    </h4>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        ${c.desc}
                                    </p>
                                </div>
                                <div class="relative z-10 flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-white/5 w-full text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                    <span>Mở chức năng</span>
                                    <span class="group-hover:translate-x-1 transition-transform">➔</span>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="space-y-7">
                    <div class="bento-card-enter bento-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#131b35] to-[#1e1035] border border-white/10 text-white shadow-xl">
                        <div class="relative z-10 space-y-1">
                            <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                                🧩 Kho Chức Năng & Tiện Ích
                            </span>
                            <h2 class="text-xl sm:text-2xl font-black tracking-tight">Tất Cả Chức Năng & Công Cụ</h2>
                            <p class="text-xs text-slate-300">Tập trung toàn bộ tiện ích học tập & trường học tại đây, giữ thanh menu bên trái luôn tối giản.</p>
                        </div>
                        <button type="button" onclick="AzotaApp.openFileExplorer('root')"
                                class="relative z-10 shrink-0 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-extrabold text-white transition-all cursor-pointer flex items-center gap-1.5">
                            <span>←</span> <span>Về Trang Chủ</span>
                        </button>
                    </div>

                    ${sectionsHtml}
                </div>
            `;
            this.attachBentoSpotlight(container);
        },

        render: function(containerId = 'dashboardHubContainer') {
            this.renderDashboard(containerId);
        }
    };

    window.DashboardHubEngine = DashboardHubEngine;
})(window);
