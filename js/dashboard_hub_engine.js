/**
 * Aseta — Unified Expandable Dashboard Hub Engine
 * Trung tâm điều hành tất cả tiện ích, công cụ học tập & không gian mở rộng tính năng tương lai.
 */
(function(window) {
    'use strict';

    const DashboardHubEngine = {
        render: function(containerId = 'dashboardHubContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const daysInfo = window.ExamScheduleEngine
                ? window.ExamScheduleEngine.getDaysRemaining()
                : { days: 19, started: false };
            const countdownLabel = daysInfo.started ? 'Đang thi HK1' : `Còn ${daysInfo.days} ngày`;

            // User history count
            let attemptsCount = 0;
            try {
                const rawHist = localStorage.getItem('azota_exam_history_v1') || localStorage.getItem('azota_exam_history');
                if (rawHist) {
                    const arr = JSON.parse(rawHist);
                    if (Array.isArray(arr)) attemptsCount = arr.length;
                }
            } catch (_) {}

            // Today date label
            const now = new Date();
            const daysVN = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const todayText = `${daysVN[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

            const sections = [
                {
                    title: 'Trọng Tâm Thi Cử & Học Tập',
                    icon: '🎯',
                    cards: [
                        {
                            title: 'Lịch Thi & Đề Cương HK1',
                            desc: 'Đợt thi 14/12 – 22/12/2026 & 14 file đề cương chính thức THPT Trần Văn Giàu.',
                            icon: '🗓️',
                            badge: countdownLabel,
                            badgeId: 'dashboardHk1Countdown',
                            badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                            gradient: 'from-rose-600 via-orange-500 to-amber-500',
                            action: "AzotaApp.showView('examSchedule')"
                        },
                        {
                            title: 'Thời Khóa Biểu & Balo 11A7',
                            desc: 'Xem tiết học hôm nay, ngày mai và danh sách sách vở cần mang theo.',
                            icon: '📅',
                            badge: '11A7',
                            badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                            gradient: 'from-blue-600 to-indigo-600',
                            action: 'AzotaApp.openTimetable()'
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
                            title: 'Kho Lời Giải & Bài Mẫu',
                            desc: 'Thư viện hình ảnh lời giải chi tiết, bài mẫu theo từng thư mục môn.',
                            icon: '📸',
                            badge: 'Hình Ảnh',
                            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                            gradient: 'from-emerald-500 to-teal-600',
                            action: "AzotaApp.showView('solutions')"
                        },
                        {
                            title: 'Sổ Tay Câu Cần Ghi Nhớ',
                            desc: 'Ôn lại nhanh những câu hỏi khó và câu đã làm sai trong các bài thi.',
                            icon: '📖',
                            badge: 'Ôn Lỗi Sai',
                            badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                            gradient: 'from-pink-600 to-rose-600',
                            action: "AzotaApp.showView('notebook')"
                        }
                    ]
                },
                {
                    title: 'Công Cụ Đánh Giá & Trường Học',
                    icon: '⚡',
                    cards: [
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
                            title: 'Tính Điểm & Xếp Loại TT22',
                            desc: 'Tính điểm trung bình môn, học kỳ và dự báo danh hiệu Học sinh Giỏi / Xuất sắc.',
                            icon: '🧮',
                            badge: 'Thông Tư 22',
                            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                            gradient: 'from-amber-500 to-orange-600',
                            action: "AzotaApp.showView('gradeCalc')"
                        },
                        {
                            title: 'Thống Kê & Lịch Sử Khảo Thí',
                            desc: 'Theo dõi điểm số, tốc độ làm bài và tiến độ ôn tập qua từng lần thi.',
                            icon: '📊',
                            badge: `${attemptsCount} lượt thi`,
                            badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                            gradient: 'from-sky-500 to-indigo-600',
                            action: "AzotaApp.showView('history')"
                        },
                        {
                            title: 'Bảng Xếp Hạng & Đua Top',
                            desc: 'Vinh danh thành tích ôn luyện và bảng tổng sắp điểm cao nhất.',
                            icon: '🏆',
                            badge: 'BXH',
                            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                            gradient: 'from-yellow-500 to-red-500',
                            action: 'AzotaApp.openLeaderboard()'
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
                    <!-- DASHBOARD HERO BANNER -->
                    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1120] via-[#111936] to-[#1d1135] border border-white/10 p-5 sm:p-7 shadow-2xl text-white">
                        <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
                        <div class="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

                        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div class="space-y-2">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                                        🎛️ Aseta Dashboard Hub
                                    </span>
                                    <span class="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-semibold">
                                        📅 ${todayText}
                                    </span>
                                </div>
                                <h2 class="text-2xl sm:text-3xl font-black tracking-tight">
                                    Trung Tâm Tiện Ích & Điều Hành
                                </h2>
                                <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                    Tất cả công cụ học tập, lịch thi cuối HK1, thời khóa biểu 11A7 và cổng thông báo THPT Trần Văn Giàu được quy tụ gọn gàng tại một nơi duy nhất.
                                </p>
                            </div>

                            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                                <button type="button" onclick="AzotaApp.openFileExplorer('root')"
                                        class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-extrabold text-white transition-all cursor-pointer flex items-center gap-2">
                                    <span>🏠</span> <span>Về Kho Đề (Home)</span>
                                </button>
                                <button type="button" onclick="AzotaApp.showView('examSchedule')"
                                        class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center gap-2">
                                    <span>🗓️</span> <span>Lịch Thi HK1 (${countdownLabel})</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- MODULE SECTIONS -->
                    ${sectionsHtml}

                    <!-- FUTURE EXPANSION SLOT -->
                    <div class="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-white/[0.02] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
                                ✨
                            </div>
                            <div>
                                <h4 class="text-sm font-black text-slate-800 dark:text-white">Không Gian Mở Rộng Tương Lai</h4>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Cấu trúc Dashboard theo mô-đun sẵn sàng tích hợp thêm các tính năng mới (Gia sư AI, Phòng thi nhóm, Lịch thi HK2...) mà không làm rối thanh menu trái.
                                </p>
                            </div>
                        </div>
                        <span class="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20 text-[11px] font-extrabold shrink-0">
                            Sẵn sàng nâng cấp
                        </span>
                    </div>
                </div>
            `;
        }
    };

    window.DashboardHubEngine = DashboardHubEngine;
})(window);
