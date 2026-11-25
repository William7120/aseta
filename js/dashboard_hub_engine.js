/**
 * Aseta — StatsBento Dashboard & Dedicated Utilities Hub Engine
 * 1. Dashboard (StatsBento 6-col Editorial Grid):
 *    - Primary Stat (col-span-3 row-span-2): Tên tài khoản + Tổng EXP học tập + Level + Hatched Mask
 *    - Secondary Stat A (col-span-3): Phân tích học tập & biểu đồ cột mini sparkline
 *    - Tertiary Stat B (col-span-1): Day Streak thực tế (chuỗi ngày học liên tiếp)
 *    - Tertiary Stat C (col-span-2): Thứ hạng & Điểm TB (★ pill card)
 *    - Bottom Bento Row: Bảng Xếp Hạng EXP (col-span-4) + Thông Báo TVG & Lịch Thi HK1 (col-span-2)
 * 2. Chức Năng (Utilities Hub): Quy tụ gọn gàng tất cả các công cụ & tính năng mở rộng.
 */
(function(window) {
    'use strict';

    const STREAK_KEY = 'aseta_daily_streak_v1';

    const DashboardHubEngine = {
        lbSearch: '',
        cachedNotices: null,

        getTodayKey: function() {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        getAndUpdateStreak: function() {
            const today = this.getTodayKey();
            let state = { count: 1, lastDate: today, history: [today] };
            try {
                const raw = localStorage.getItem(STREAK_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.lastDate) {
                        const last = new Date(parsed.lastDate + 'T00:00:00');
                        const curr = new Date(today + 'T00:00:00');
                        const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
                        const hist = Array.isArray(parsed.history) ? parsed.history : [parsed.lastDate];

                        if (diffDays === 0) {
                            state = { count: Math.max(1, parsed.count || 1), lastDate: today, history: hist };
                        } else if (diffDays === 1) {
                            const nextHist = [...new Set([...hist, today])].slice(-14);
                            state = { count: (parsed.count || 1) + 1, lastDate: today, history: nextHist };
                        } else if (diffDays > 1) {
                            state = { count: 1, lastDate: today, history: [today] };
                        }
                    }
                }
                localStorage.setItem(STREAK_KEY, JSON.stringify(state));
            } catch (_) {}
            return state;
        },

        getAnalyticsBars: function() {
            let examHistory = [];
            try {
                examHistory = JSON.parse(localStorage.getItem('azota_exam_history') || '[]');
            } catch (_) {
                examHistory = [];
            }

            // Build 11 sleek vertical bars (like StatsBento sparkline) from real exam scores or clean baseline curve
            if (examHistory.length >= 3) {
                const recent = examHistory.slice(-11);
                const bars = recent.map(h => {
                    const s = Number(h.score);
                    const pct = isNaN(s) ? 65 : Math.max(18, Math.min(100, Math.round(s * 10)));
                    return { h: pct, label: `${h.examTitle || 'Đề thi'}: ${s || 0}đ` };
                });
                while (bars.length < 11) {
                    bars.unshift({ h: 20 + (bars.length * 4), label: 'Chưa có dữ liệu' });
                }
                return bars;
            }
            const baseline = [22, 34, 48, 40, 62, 54, 76, 68, 86, 94, 100];
            return baseline.map((h, i) => ({ h, label: `Phiên ôn #${i + 1}: ${h}%` }));
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

        setLeaderboardSearch: function(val) {
            this.lbSearch = (val || '').trim();
            this.renderLeaderboardRowsOnly();
        },

        getLiveDashboardPayload: function() {
            if (window.AzotaApp && typeof window.AzotaApp.getDashboardData === 'function') {
                return window.AzotaApp.getDashboardData();
            }
            return {
                user: { name: 'Học Sinh Aseta', nickname: 'hocsinh11', avatar: '👦', grade: 'Lớp 11', role: '🎓 Học Sinh' },
                exp: 2240,
                doneCount: 0,
                gpa: 9.35,
                accuracy: 92,
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
                   class="group flex items-start gap-2.5 p-2.5 rounded-2xl bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.07] border border-slate-200/70 dark:border-white/5 transition-all">
                    <span class="w-5 h-5 rounded-lg ${idx === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300'} flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        ${idx + 1}
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 line-clamp-2 leading-snug transition-colors">
                            ${n.title}
                        </p>
                        ${idx === 0 ? '<span class="inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">● Mới nhất</span>' : ''}
                    </div>
                </a>
            `).join('');
        },

        renderLeaderboardRowsOnly: function() {
            const listEl = document.getElementById('dashboardLeaderboardList');
            if (!listEl) return;

            const payload = this.getLiveDashboardPayload();
            const q = this.lbSearch.toLowerCase();
            const rows = (payload.leaderboard || []).filter(s =>
                !q ||
                (s.name || '').toLowerCase().includes(q) ||
                (s.nickname || '').toLowerCase().includes(q) ||
                (s.grade || '').toLowerCase().includes(q)
            );

            if (rows.length === 0) {
                listEl.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">Không tìm thấy "${this.lbSearch}" trên bảng xếp hạng.</div>`;
                return;
            }

            listEl.innerHTML = rows.map((st, idx) => {
                const rank = st.rank || (idx + 1);
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const rowCls = st.isCurrentUser
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                    : 'bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-white';
                const subTextCls = st.isCurrentUser
                    ? 'text-slate-300 dark:text-slate-600'
                    : 'text-slate-500 dark:text-slate-400';
                const expTextCls = st.isCurrentUser
                    ? 'text-amber-300 dark:text-slate-950'
                    : 'text-slate-900 dark:text-white';

                return `
                    <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border transition-all ${rowCls}">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 text-center font-black text-xs shrink-0">${medal}</span>
                            <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-base shrink-0">
                                ${st.avatar || '🎓'}
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs sm:text-sm font-black truncate">${st.name}</span>
                                    ${st.isCurrentUser ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500 text-white">Bạn</span>' : ''}
                                </div>
                                <div class="text-[11px] truncate ${subTextCls}">
                                    @${st.nickname || 'hocsinh'} • ${st.grade || 'Lớp 11'} • ${st.doneCount || 0} đề
                                </div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-xs sm:text-sm font-black font-mono ${expTextCls}">
                                ${(st.points || 0).toLocaleString('vi-VN')} EXP
                            </div>
                            <div class="text-[10px] font-semibold ${subTextCls}">
                                TB ${st.gpa ?? '—'} • ${st.accuracy ?? 0}%
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },

        // =========================================================================
        // VIEW 1: STATSBENTO PERSONAL DASHBOARD (EXP + PHÂN TÍCH + STREAK + BXH + THÔNG BÁO)
        // =========================================================================
        renderDashboard: function(containerId = 'dashboardHubContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const payload = this.getLiveDashboardPayload();
            const u = payload.user;
            const lv = this.getLevelInfo(payload.exp);
            const streak = this.getAndUpdateStreak();
            const bars = this.getAnalyticsBars();
            const daysInfo = window.ExamScheduleEngine
                ? window.ExamScheduleEngine.getDaysRemaining()
                : { days: 18, started: false };

            // Build 7-day mini streak dots
            const streakDotsHtml = Array.from({ length: 7 }, (_, i) => {
                const active = i < Math.min(7, streak.count);
                return `<span class="w-2 h-2 rounded-full ${active ? 'bg-amber-400 shadow-xs shadow-amber-400/60' : 'bg-slate-300 dark:bg-white/15'}"></span>`;
            }).join('');

            container.innerHTML = `
                <div class="max-w-7xl mx-auto space-y-4">
                    <!-- TOP STATSBENTO 6-COLUMN GRID -->
                    <div class="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4">

                        <!-- PRIMARY STAT (col-span-3 row-span-2): High-Contrast Editorial EXP + Account Card -->
                        <div class="md:col-span-3 md:row-span-2 bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 rounded-3xl p-7 sm:p-9 flex flex-col justify-between overflow-hidden relative shadow-xl border border-slate-800 dark:border-white/40 min-h-[270px]">
                            <div class="bento-hatch-overlay"></div>

                            <div class="relative z-10 flex items-center justify-between gap-3 flex-wrap">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-slate-950/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 dark:text-slate-950/70">
                                    <span>⚡</span>
                                    <span>Tổng EXP Học Tập • LV.${lv.level}</span>
                                </span>
                                <button type="button" onclick="AzotaApp.handleProfileClick()"
                                        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-950/10 dark:hover:bg-slate-950/15 transition-colors cursor-pointer">
                                    <span class="text-sm leading-none">${u.avatar || '👦'}</span>
                                    <span class="text-xs font-extrabold truncate max-w-[140px]">${u.name || 'Học Sinh Aseta'}</span>
                                    <span class="text-[10px] opacity-60">✏️</span>
                                </button>
                            </div>

                            <div class="relative z-10 my-5">
                                <div class="flex items-baseline gap-2.5 flex-wrap">
                                    <h3 class="text-5xl sm:text-6xl font-black tracking-tighter font-mono leading-none">
                                        ${(payload.exp || 0).toLocaleString('vi-VN')}
                                    </h3>
                                    <span class="text-sm sm:text-base font-black uppercase tracking-widest opacity-55">EXP</span>
                                </div>
                                <div class="mt-4 max-w-sm space-y-1.5">
                                    <div class="w-full h-2 rounded-full bg-white/15 dark:bg-slate-950/10 overflow-hidden">
                                        <div class="h-full rounded-full bg-white dark:bg-slate-950 transition-all duration-500" style="width: ${lv.pct}%"></div>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] font-bold opacity-65">
                                        <span>${lv.title}</span>
                                        <span>${lv.currentInLevel} / ${lv.xpPerLevel} EXP → LV.${lv.level + 1}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="relative z-10 text-xs sm:text-sm opacity-65 max-w-md leading-relaxed">
                                Tài khoản <strong class="opacity-100">@${u.nickname || 'hocsinh11'}</strong> (${u.grade || 'Lớp 11'}) đang hoàn thành <strong>${payload.doneCount} đề</strong> với tỷ lệ đạt chuẩn <strong>${payload.accuracy}%</strong>.
                            </p>
                        </div>

                        <!-- SECONDARY STAT A (col-span-3): Learning Analytics + Vertical Pill Sparkline -->
                        <div class="md:col-span-3 bg-white dark:bg-[#14161f] rounded-3xl p-7 sm:p-8 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4 shadow-sm">
                            <div>
                                <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                                    Phân Tích Học Tập
                                </p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                                        ${payload.accuracy}%
                                    </p>
                                    <span class="text-xs font-extrabold text-emerald-500">
                                        +${payload.gpa}đ TB
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                    Phong độ 11 phiên ôn gần nhất • ${payload.doneCount} bài đã lưu
                                </p>
                            </div>
                            <div class="flex gap-1.5 items-end h-14 shrink-0" title="Biểu đồ phong độ học tập">
                                ${bars.map((b, i) => `
                                    <div class="w-1.5 sm:w-2 rounded-full transition-all duration-300 ${i >= bars.length - 2 ? 'bg-sky-500 dark:bg-white' : 'bg-slate-800/80 dark:bg-white/75'}"
                                         style="height: ${b.h}%"
                                         title="${b.label}"></div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- TERTIARY STAT B (col-span-1): Day Streak -->
                        <div class="md:col-span-1 bg-white dark:bg-[#0e1017] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                            <div class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                <span>🔥</span>
                                <span class="font-mono">${streak.count}</span>
                            </div>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Day Streak
                            </p>
                            <div class="flex items-center justify-center gap-1 mt-1" title="Chuỗi hoạt động 7 ngày">
                                ${streakDotsHtml}
                            </div>
                        </div>

                        <!-- TERTIARY STAT C (col-span-2): Current Rank & Rating Star Card -->
                        <div class="md:col-span-2 bg-white dark:bg-[#14161f] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 flex items-center gap-4 shadow-sm">
                            <div class="w-11 h-11 text-xl rounded-full bg-slate-950 text-white dark:bg-[#090a0f] dark:text-amber-400 border border-white/10 flex items-center justify-center shrink-0 shadow-sm font-semibold">
                                ★
                            </div>
                            <div class="min-w-0">
                                <p class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight font-mono">
                                    Hạng #${payload.rank} <span class="text-xs font-bold text-slate-400">• ${payload.gpa}/10</span>
                                </p>
                                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                                    Xếp hạng toàn lớp • ${u.grade || 'Lớp 11'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- BOTTOM BENTO ROW: LEADERBOARD (col-span-4) + NOTICES & HK1 COUNTDOWN (col-span-2) -->
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">

                        <!-- BẢNG XẾP HẠNG (col-span-4) -->
                        <div class="md:col-span-4 bg-white dark:bg-[#0e1017] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Leaderboard • Live EXP
                                    </p>
                                    <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
                                        <span>🏆</span> <span>Bảng Xếp Hạng Học Tập</span>
                                    </h3>
                                </div>
                                <div class="relative w-full sm:w-56">
                                    <input type="text"
                                           value="${this.lbSearch}"
                                           oninput="DashboardHubEngine.setLeaderboardSearch(this.value)"
                                           placeholder="Tìm bạn trên BXH..."
                                           class="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-sky-500/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none">
                                    <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                                </div>
                            </div>

                            <div id="dashboardLeaderboardList" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
                        </div>

                        <!-- THÔNG BÁO & LỊCH THI NHANH (col-span-2) -->
                        <div class="md:col-span-2 flex flex-col gap-4">
                            <!-- Mini Exam Countdown Tile -->
                            <button type="button" onclick="AzotaApp.showView('examSchedule')"
                                    class="group text-left bg-white dark:bg-[#14161f] hover:border-amber-500/40 rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                        🗓️ Cuối Học Kỳ I
                                    </p>
                                    <p class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                                        ${daysInfo.started ? 'Đang thi' : `Còn ${daysInfo.days} ngày`}
                                    </p>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                        14/12 – 22/12 • 14 đề cương TVG
                                    </p>
                                </div>
                                <span class="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black group-hover:translate-x-0.5 transition-transform shrink-0">
                                    ➔
                                </span>
                            </button>

                            <!-- Live School Notices Feed Tile -->
                            <div class="flex-1 bg-white dark:bg-[#0e1017] rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3">
                                <div class="space-y-3">
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
                                        class="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-between">
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

            const sectionsHtml = sections.map(sec => `
                <div class="space-y-3.5">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>${sec.icon}</span>
                            <span>${sec.title}</span>
                        </h3>
                        <span class="text-[11px] font-semibold text-slate-400">${sec.cards.length} chức năng</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${sec.cards.map(c => `
                            <button type="button" onclick="${c.action}"
                                    class="group text-left p-5 rounded-3xl bg-white/80 dark:bg-[#0f111a]/90 hover:bg-white dark:hover:bg-[#151827] border border-slate-200/80 dark:border-white/10 hover:border-sky-500/40 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer active:scale-[0.985]">
                                <div class="flex items-start justify-between gap-3 w-full">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform shrink-0 border border-white/15">
                                        ${c.icon}
                                    </div>
                                    <span ${c.badgeId ? `id="${c.badgeId}"` : ''} class="px-2.5 py-1 rounded-full text-[10px] font-black border ${c.badgeClass} shrink-0">
                                        ${c.badge}
                                    </span>
                                </div>
                                <div>
                                    <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                                        ${c.title}
                                    </h4>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        ${c.desc}
                                    </p>
                                </div>
                                <div class="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-white/5 w-full text-[11px] font-bold text-sky-600 dark:text-sky-400">
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
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#131b35] to-[#1e1035] border border-white/10 text-white shadow-xl">
                        <div class="space-y-1">
                            <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                                🧩 Kho Chức Năng & Tiện Ích
                            </span>
                            <h2 class="text-xl sm:text-2xl font-black tracking-tight">Tất Cả Chức Năng & Công Cụ</h2>
                            <p class="text-xs text-slate-300">Tập trung toàn bộ tiện ích học tập & trường học tại đây, giữ thanh menu bên trái luôn tối giản.</p>
                        </div>
                        <button type="button" onclick="AzotaApp.openFileExplorer('root')"
                                class="shrink-0 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-extrabold text-white transition-all cursor-pointer flex items-center gap-1.5">
                            <span>←</span> <span>Về Trang Chủ</span>
                        </button>
                    </div>

                    ${sectionsHtml}
                </div>
            `;
        },

        render: function(containerId = 'dashboardHubContainer') {
            this.renderDashboard(containerId);
        }
    };

    window.DashboardHubEngine = DashboardHubEngine;
})(window);
