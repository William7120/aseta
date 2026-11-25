/**
 * Aseta — Dashboard (Account + Study EXP + Leaderboard) & Dedicated Utilities Hub Engine
 * 1. Dashboard: Chỉ hiển thị Tên Tài Khoản, Số EXP Học Tập & Cấp Độ, và Bảng Xếp Hạng.
 * 2. Chức Năng (Utilities Hub): Quy tụ gọn gàng tất cả các công cụ & tính năng mở rộng.
 */
(function(window) {
    'use strict';

    const DashboardHubEngine = {
        lbSearch: '',

        getLevelInfo: function(exp) {
            const safeExp = Math.max(0, Number(exp) || 0);
            const xpPerLevel = 500;
            const level = Math.floor(safeExp / xpPerLevel) + 1;
            const currentInLevel = safeExp % xpPerLevel;
            const pct = Math.min(100, Math.round((currentInLevel / xpPerLevel) * 100));
            const nextLevelExp = level * xpPerLevel;
            const titles = [
                'Tân Binh Học Thuật',
                'Học Giả Tập Sự',
                'Chiến Binh Tri Thức',
                'Học Bá Aseta',
                'Cao Thủ Khảo Thí',
                'Huyền Thoại 11A7'
            ];
            const title = titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))];
            return { level, currentInLevel, xpPerLevel, pct, nextLevelExp, title };
        },

        setLeaderboardSearch: function(val) {
            this.lbSearch = (val || '').trim();
            this.renderLeaderboardRowsOnly();
        },

        getLiveDashboardPayload: function() {
            if (window.AzotaApp && typeof window.AzotaApp.getDashboardData === 'function') {
                return window.AzotaApp.getDashboardData();
            }
            // Safe fallback
            return {
                user: { name: 'Học Sinh Aseta', nickname: 'hocsinh11', avatar: '👦', grade: 'Lớp 11', role: '🎓 Học Sinh' },
                exp: 2240,
                doneCount: 0,
                gpa: 0,
                accuracy: 0,
                rank: 1,
                leaderboard: []
            };
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
                listEl.innerHTML = `
                    <div class="py-10 text-center text-slate-400 text-xs">
                        Không tìm thấy tài khoản phù hợp với "${this.lbSearch}"
                    </div>`;
                return;
            }

            listEl.innerHTML = rows.map((st, idx) => {
                const rank = st.rank || (idx + 1);
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const rankBadgeCls =
                    rank === 1 ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' :
                    rank === 2 ? 'bg-slate-300/20 text-slate-200 border-slate-300/40' :
                    rank === 3 ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                    'bg-white/5 text-slate-400 border-white/10';
                const rowHighlight = st.isCurrentUser
                    ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/15 border-sky-400/50 shadow-lg shadow-sky-500/10'
                    : 'bg-white/[0.025] hover:bg-white/[0.05] border-white/10';

                return `
                    <div class="flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${rowHighlight}">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${rankBadgeCls}">
                                ${medal}
                            </div>
                            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-lg shrink-0 border border-white/15">
                                ${st.avatar || '🎓'}
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="text-xs sm:text-sm font-black text-white truncate">${st.name}</span>
                                    ${st.isCurrentUser ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-sky-500 text-white uppercase">Bạn</span>' : ''}
                                </div>
                                <div class="text-[11px] text-slate-400 truncate">
                                    @${st.nickname || 'hocsinh'} • ${st.grade || 'Lớp 11'} • ${st.doneCount || 0} đề
                                </div>
                            </div>
                        </div>

                        <div class="text-right shrink-0">
                            <div class="text-sm sm:text-base font-black text-amber-400 font-mono">
                                ${(st.points || 0).toLocaleString('vi-VN')} <span class="text-[10px] font-bold text-amber-300/80">EXP</span>
                            </div>
                            <div class="text-[10px] font-bold text-emerald-400">
                                TB: ${st.gpa ?? '—'}đ • ${st.accuracy ?? 0}%
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },

        // =========================================================================
        // VIEW 1: PERSONAL DASHBOARD (CHỈ TÊN TÀI KHOẢN + SỐ EXP HỌC + BXH)
        // =========================================================================
        renderDashboard: function(containerId = 'dashboardHubContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const payload = this.getLiveDashboardPayload();
            const u = payload.user;
            const lv = this.getLevelInfo(payload.exp);
            const top3 = (payload.leaderboard || []).slice(0, 3);

            const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
            const podiumHtml = top3.length >= 3 ? `
                <div class="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-2">
                    ${podiumOrder.map((st) => {
                        const isFirst = st.rank === 1;
                        const isSecond = st.rank === 2;
                        const crown = isFirst ? '👑' : isSecond ? '🥈' : '🥉';
                        const cardBg = isFirst
                            ? 'from-amber-500/25 via-yellow-500/15 to-orange-500/10 border-amber-400/50 py-5'
                            : isSecond
                                ? 'from-slate-400/20 to-slate-800/40 border-slate-300/30 py-4'
                                : 'from-orange-600/20 to-slate-800/40 border-orange-400/30 py-3.5';
                        return `
                            <div class="rounded-2xl bg-gradient-to-b ${cardBg} border text-center px-2 sm:px-3 flex flex-col items-center gap-1.5 shadow-lg">
                                <span class="text-lg sm:text-xl leading-none">${crown}</span>
                                <div class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xl sm:text-2xl border-2 ${isFirst ? 'border-amber-300' : 'border-white/20'} shadow-md">
                                    ${st.avatar || '🎓'}
                                </div>
                                <div class="text-xs sm:text-sm font-black text-white truncate w-full">${st.name}</div>
                                <div class="text-[11px] font-black text-amber-400 font-mono">${(st.points || 0).toLocaleString('vi-VN')} EXP</div>
                                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-slate-300">Hạng #${st.rank}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '';

            container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-6">
                    <!-- 1. THẺ TÊN TÀI KHOẢN & SỐ EXP HỌC TẬP -->
                    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1120] via-[#121a35] to-[#1e1038] border border-sky-500/25 p-5 sm:p-7 shadow-2xl text-white">
                        <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>
                        <div class="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

                        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <!-- Account Identity -->
                            <div class="flex items-center gap-4 min-w-0">
                                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-indigo-500/30 border-2 border-white/20 shrink-0">
                                    ${u.avatar || '👦'}
                                </div>
                                <div class="min-w-0 space-y-1">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                                            LV.${lv.level} • ${lv.title}
                                        </span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                                            ${u.grade || 'Lớp 11'}
                                        </span>
                                    </div>
                                    <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                                        ${u.name || 'Học Sinh Aseta'}
                                    </h2>
                                    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                        <span class="font-mono text-sky-400 font-bold">@${u.nickname || 'hocsinh11'}</span>
                                        <button type="button" onclick="AzotaApp.handleProfileClick()"
                                                class="text-[11px] font-bold text-slate-300 hover:text-white underline decoration-slate-500 hover:decoration-white cursor-pointer">
                                            ✏️ Đổi tên / hồ sơ
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Study EXP Hero Box -->
                            <div class="shrink-0 p-4 sm:p-5 rounded-2xl bg-black/45 border border-amber-400/25 backdrop-blur-xl min-w-[260px] space-y-2.5">
                                <div class="flex items-center justify-between gap-3">
                                    <span class="text-[10px] font-black uppercase tracking-widest text-amber-400">⚡ Tổng EXP Học Tập</span>
                                    <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                                        Hạng #${payload.rank}
                                    </span>
                                </div>
                                <div class="flex items-baseline gap-2">
                                    <span class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-mono">
                                        ${(payload.exp || 0).toLocaleString('vi-VN')}
                                    </span>
                                    <span class="text-xs font-black text-amber-300/80">EXP</span>
                                </div>
                                <div class="space-y-1">
                                    <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div class="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 transition-all duration-500" style="width: ${lv.pct}%"></div>
                                    </div>
                                    <div class="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                                        <span>Tiến độ LV.${lv.level + 1}</span>
                                        <span>${lv.currentInLevel} / ${lv.xpPerLevel} EXP (${lv.pct}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Compact EXP Stats Strip -->
                        <div class="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-white/10">
                            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                                <div class="text-[10px] font-bold text-slate-400 uppercase">Thứ Hạng</div>
                                <div class="text-lg sm:text-xl font-black text-amber-400 mt-0.5">#${payload.rank}</div>
                            </div>
                            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                                <div class="text-[10px] font-bold text-slate-400 uppercase">Đề Đã Làm</div>
                                <div class="text-lg sm:text-xl font-black text-sky-400 mt-0.5">${payload.doneCount} đề</div>
                            </div>
                            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                                <div class="text-[10px] font-bold text-slate-400 uppercase">Điểm Trung Bình</div>
                                <div class="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">${payload.gpa} đ</div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. BẢNG XẾP HẠNG (LEADERBOARD) -->
                    <div class="rounded-3xl bg-slate-900/75 dark:bg-[#0e1018] border border-white/10 p-5 sm:p-6 shadow-xl space-y-5">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-center gap-2.5">
                                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-md">
                                    🏆
                                </div>
                                <div>
                                    <h3 class="text-base sm:text-lg font-black text-white tracking-tight">Bảng Xếp Hạng EXP Học Tập</h3>
                                    <p class="text-[11px] text-slate-400">Làm bài tập & đề thi để tích lũy EXP và leo hạng cùng lớp</p>
                                </div>
                            </div>
                            <div class="relative w-full sm:w-60">
                                <input type="text"
                                       value="${this.lbSearch}"
                                       oninput="DashboardHubEngine.setLeaderboardSearch(this.value)"
                                       placeholder="Tìm tên trên BXH..."
                                       class="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-amber-500/50 text-xs text-white placeholder-slate-400 outline-none">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                            </div>
                        </div>

                        ${podiumHtml}

                        <div id="dashboardLeaderboardList" class="space-y-2.5"></div>
                    </div>
                </div>
            `;

            this.renderLeaderboardRowsOnly();
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

        // Keep backwards-compatible alias
        render: function(containerId = 'dashboardHubContainer') {
            this.renderDashboard(containerId);
        }
    };

    window.DashboardHubEngine = DashboardHubEngine;
})(window);
