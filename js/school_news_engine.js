/**
 * Aseta — School News Engine (Cổng Thông Tin & Thông Báo Trường THPT Trần Văn Giàu)
 * Cung cấp:
 * 1. Lịch công tác tuần (chi tiết phân công từng Thứ, trực ban BLĐ, địa điểm)
 * 2. Thực đơn bán trú (xem trực tiếp PDF, tải về, xem theo tuần)
 * 3. Thông báo chung & Kế hoạch năm học
 * 4. Cơ chế Smart Cache 5 phút + Làm mới tức thì (Low Latency)
 */

(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_school_news_cache';
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

    const SchoolNewsEngine = {
        data: null,
        activeTab: 'schedule', // 'schedule' | 'meals' | 'general'
        selectedWeekIdx: 0,
        selectedDayFilter: 'all', // 'all' | 'today' | 'Thứ Hai' | ...
        searchQuery: '',
        isLoading: false,

        init: function() {
            this.loadCachedData();
            this.bindGlobalKeys();
            // Pre-fetch in background if cache is stale
            setTimeout(() => {
                this.checkAndRefreshBackground();
            }, 1000);
        },

        loadCachedData: function() {
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.data) {
                        this.data = parsed.data;
                        this.lastFetched = parsed.timestamp;
                    }
                }
            } catch (e) {}
        },

        checkAndRefreshBackground: async function() {
            const now = Date.now();
            if (!this.data || !this.lastFetched || (now - this.lastFetched > CACHE_TTL_MS)) {
                await this.fetchNews(false);
            }
        },

        fetchNews: async function(force = false) {
            if (this.isLoading) return;
            this.isLoading = true;
            this.updateRefreshButtonState(true);

            try {
                // Fetch local bundled data with cache-buster
                const res = await fetch(`data/school_news.json?t=${Date.now()}`);
                if (!res.ok) throw new Error('Không thể tải file dữ liệu');
                const json = await res.json();
                this.data = json;
                this.lastFetched = Date.now();

                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: this.data,
                    timestamp: this.lastFetched
                }));

                if (force && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast('🔄 Đã đồng bộ thông báo mới nhất từ THPT Trần Văn Giàu!');
                }

                if (this.isModalOpen()) {
                    this.render();
                }
            } catch (err) {
                console.warn('[SchoolNewsEngine] Lỗi tải dữ liệu:', err);
                if (force && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast('⚠️ Không thể kết nối tới nguồn dữ liệu trường học. Đang dùng dữ liệu lưu tạm.');
                }
            } finally {
                this.isLoading = false;
                this.updateRefreshButtonState(false);
            }
        },

        updateRefreshButtonState: function(spinning) {
            const btnIcon = document.getElementById('schoolNewsRefreshIcon');
            if (btnIcon) {
                if (spinning) btnIcon.classList.add('animate-spin');
                else btnIcon.classList.remove('animate-spin');
            }
        },

        bindGlobalKeys: function() {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen()) {
                    this.closeModal();
                }
            });
        },

        isModalOpen: function() {
            const modal = document.getElementById('schoolNewsModal');
            return modal && !modal.classList.contains('hidden');
        },

        openModal: async function(defaultTab = 'schedule') {
            this.activeTab = defaultTab;
            const modal = document.getElementById('schoolNewsModal');
            if (!modal) return;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            if (!this.data) {
                await this.fetchNews(false);
            }

            this.render();
            if (window.AudioHelper && window.AudioHelper.playClick) {
                window.AudioHelper.playClick();
            }
        },

        closeModal: function() {
            const modal = document.getElementById('schoolNewsModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        },

        switchTab: function(tabName) {
            this.activeTab = tabName;
            this.selectedDayFilter = 'all';
            this.render();
            if (window.AudioHelper && window.AudioHelper.playTap) {
                window.AudioHelper.playTap();
            }
        },

        setWeekIdx: function(idx) {
            this.selectedWeekIdx = idx;
            this.render();
        },

        setDayFilter: function(filter) {
            this.selectedDayFilter = filter;
            this.renderTabSchedule();
        },

        getTodayDayName: function() {
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const today = new Date();
            return days[today.getDay()];
        },

        render: function() {
            const headerSyncText = document.getElementById('schoolNewsSyncTime');
            if (headerSyncText) {
                const timeText = this.data && this.data.lastUpdatedText ? this.data.lastUpdatedText : 'Vừa cập nhật';
                headerSyncText.textContent = `Đồng bộ: ${timeText}`;
            }

            // Update Tab Buttons Active State
            const tabs = ['schedule', 'meals', 'general'];
            tabs.forEach(t => {
                const btn = document.getElementById(`schoolNewsTabBtn_${t}`);
                if (btn) {
                    if (t === this.activeTab) {
                        btn.className = 'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5';
                    } else {
                        btn.className = 'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5';
                    }
                }
            });

            const contentContainer = document.getElementById('schoolNewsContentArea');
            if (!contentContainer) return;

            if (this.activeTab === 'schedule') {
                this.renderTabSchedule();
            } else if (this.activeTab === 'meals') {
                this.renderTabMeals();
            } else if (this.activeTab === 'general') {
                this.renderTabGeneral();
            }
        },

        renderTabSchedule: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const weeks = (this.data && this.data.scheduleWeeks) || [];
            if (weeks.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">📅</span>
                        <p class="mt-2 text-sm">Chưa có dữ liệu lịch công tác tuần. Vui lòng nhấn nút làm mới.</p>
                    </div>`;
                return;
            }

            const currentWeek = weeks[this.selectedWeekIdx] || weeks[0];
            const rows = currentWeek.tableRows || [];
            const todayName = this.getTodayDayName();

            // Week Selector Pills
            let weekSelectorHtml = '<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">';
            weeks.forEach((w, idx) => {
                const isActive = (idx === this.selectedWeekIdx);
                weekSelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setWeekIdx(${idx})"
                            class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}">
                        ${w.isLatest ? '🌟 ' : ''}Tuần ${w.weekNum} ${w.isLatest ? '(Mới Nhất)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            // Day Filter Pills
            const daysList = ['all', 'today', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
            let dayFilterHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-y border-white/5">';
            daysList.forEach(d => {
                const isSelected = (this.selectedDayFilter === d);
                let label = d;
                if (d === 'all') label = '📋 Tất cả ngày';
                else if (d === 'today') label = `⚡ Hôm nay (${todayName})`;

                dayFilterHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setDayFilter('${d}')"
                            class="shrink-0 px-2.5 py-1 rounded-md text-[11px] sm:text-xs transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}">
                        ${label}
                    </button>`;
            });
            dayFilterHtml += '</div>';

            // Filter rows based on day
            const filteredRows = rows.filter(r => {
                if (this.selectedDayFilter === 'all') return true;
                if (this.selectedDayFilter === 'today') {
                    return r.day && r.day.toLowerCase().includes(todayName.toLowerCase());
                }
                return r.day && r.day.toLowerCase().includes(this.selectedDayFilter.toLowerCase());
            });

            // Group by day for visual clarity
            let scheduleListHtml = '';
            if (filteredRows.length === 0) {
                scheduleListHtml = `
                    <div class="py-10 text-center text-slate-400">
                        <span class="text-3xl">☕</span>
                        <p class="mt-2 text-sm font-medium">Không có lịch công tác nào cho ngày này.</p>
                        <p class="text-xs text-slate-500 mt-1">Học sinh và giáo viên thực hiện công việc học tập theo thời khóa biểu chuẩn.</p>
                    </div>`;
            } else {
                scheduleListHtml = '<div class="space-y-3 mt-3">';
                let lastRenderedDay = '';

                filteredRows.forEach((r) => {
                    const isNewDayGroup = (r.day !== lastRenderedDay);
                    if (isNewDayGroup) {
                        lastRenderedDay = r.day;
                        const isToday = r.day && r.day.toLowerCase().includes(todayName.toLowerCase());
                        scheduleListHtml += `
                            <div class="pt-2 flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold ${isToday ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-sky-400 border border-sky-500/20'}">
                                        📅 ${r.day} ${isToday ? '• HÔM NAY ⭐' : ''}
                                    </span>
                                </div>
                                ${r.onDuty ? `<span class="text-[11px] text-amber-300/90 font-medium truncate">🛡️ Trực: ${r.onDuty}</span>` : ''}
                            </div>`;
                    }

                    if (r.content) {
                        scheduleListHtml += `
                            <div class="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2">
                                <div class="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                                    ${r.content}
                                </div>
                                <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                    ${r.assignee ? `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">👥 ${r.assignee}</span>` : ''}
                                    ${r.location ? `<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">📍 ${r.location}</span>` : ''}
                                </div>
                            </div>`;
                    }
                });
                scheduleListHtml += '</div>';
            }

            container.innerHTML = `
                <div class="space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <span>📅 ${currentWeek.title}</span>
                            </h3>
                            <p class="text-xs text-slate-400">Thời gian biểu & Phân công nhiệm vụ chi tiết tuần này</p>
                        </div>
                        <a href="${currentWeek.link}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium shrink-0">
                            <span>Mở bài gốc trường</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                    </div>
                    ${weekSelectorHtml}
                    ${dayFilterHtml}
                    ${scheduleListHtml}
                </div>`;
        },

        renderTabMeals: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const mealsWeeks = (this.data && this.data.mealsWeeks) || [];
            if (mealsWeeks.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">🍱</span>
                        <p class="mt-2 text-sm">Chưa có dữ liệu thực đơn bán trú. Vui lòng nhấn nút làm mới.</p>
                    </div>`;
                return;
            }

            const currentMeal = mealsWeeks[this.selectedWeekIdx] || mealsWeeks[0];

            // Week Selector
            let weekSelectorHtml = '<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">';
            mealsWeeks.forEach((w, idx) => {
                const isActive = (idx === this.selectedWeekIdx);
                weekSelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setWeekIdx(${idx})"
                            class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/25' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}">
                        ${w.isLatest ? '🌟 ' : ''}Tuần ${w.weekNum} ${w.isLatest ? '(Mới Nhất)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            container.innerHTML = `
                <div class="space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <span>🍱 ${currentMeal.title}</span>
                            </h3>
                            <p class="text-xs text-slate-400">Bảng thực đơn cơm trưa bán trú có chữ ký số của Ban Giám Hiệu</p>
                        </div>
                        <a href="${currentMeal.link}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium shrink-0">
                            <span>Mở bài gốc trường</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                    </div>

                    ${weekSelectorHtml}

                    <!-- Feature Card: Quick Actions -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900/80 to-amber-950/30 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center text-2xl shrink-0">
                                📄
                            </div>
                            <div>
                                <h4 class="text-sm sm:text-base font-bold text-white">${currentMeal.title}</h4>
                                <p class="text-xs text-slate-400 mt-0.5">Tệp PDF gốc từ bộ phận quản lý bán trú THPT Trần Văn Giàu</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            ${currentMeal.downloadUrl ? `
                            <a href="${currentMeal.downloadUrl}" target="_blank" download
                               class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>📥 Tải File PDF</span>
                            </a>` : ''}
                            ${currentMeal.viewerUrl ? `
                            <button type="button" onclick="SchoolNewsEngine.togglePdfViewer('${currentMeal.viewerUrl}')"
                                    class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>👁️ Xem Trực Tiếp</span>
                            </button>` : ''}
                        </div>
                    </div>

                    <!-- PDF Viewer Container (Collapsible) -->
                    <div id="schoolNewsPdfViewerBox" class="rounded-2xl overflow-hidden border border-white/10 bg-black/80 aspect-[4/3] sm:aspect-[16/10] w-full ${currentMeal.viewerUrl ? '' : 'hidden'}">
                        ${currentMeal.viewerUrl ? `
                        <iframe src="${currentMeal.viewerUrl}" class="w-full h-full border-0" title="Thực đơn bán trú" allowfullscreen></iframe>
                        ` : `
                        <div class="h-full flex items-center justify-center text-slate-400 text-sm">
                            Vui lòng nhấn nút tải PDF hoặc mở bài viết gốc trên trang web của trường.
                        </div>`}
                    </div>
                </div>`;
        },

        togglePdfViewer: function(url) {
            const box = document.getElementById('schoolNewsPdfViewerBox');
            if (box) {
                box.classList.remove('hidden');
                box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        },

        renderTabGeneral: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const notices = (this.data && this.data.generalNotices) || [];
            if (notices.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">📢</span>
                        <p class="mt-2 text-sm">Chưa có thông báo nào. Vui lòng bấm làm mới.</p>
                    </div>`;
                return;
            }

            let searchHtml = `
                <div class="relative mb-3">
                    <input type="text" id="schoolNewsSearchInput"
                           placeholder="Tìm kiếm thông báo, kiểm tra, thể thao..."
                           value="${this.searchQuery}"
                           oninput="SchoolNewsEngine.handleSearch(this.value)"
                           class="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors">
                    <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>`;

            const filteredNotices = notices.filter(n => {
                if (!this.searchQuery) return true;
                return n.title.toLowerCase().includes(this.searchQuery.toLowerCase());
            });

            let listHtml = '';
            if (filteredNotices.length === 0) {
                listHtml = `
                    <div class="py-8 text-center text-slate-400">
                        <p class="text-xs">Không tìm thấy thông báo phù hợp từ khóa "${this.searchQuery}".</p>
                    </div>`;
            } else {
                listHtml = '<div class="space-y-2.5">';
                filteredNotices.forEach((n, idx) => {
                    listHtml += `
                        <a href="${n.link}" target="_blank" rel="noopener noreferrer"
                           class="block p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-red-500/30 hover:bg-slate-800/60 transition-all group">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                                        ${n.isNew ? '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white tracking-wider">MỚI</span>' : ''}
                                        <span class="text-[11px] text-slate-400">Thông báo nhà trường</span>
                                    </div>
                                    <h4 class="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors leading-relaxed">
                                        ${n.title}
                                    </h4>
                                </div>
                                <span class="text-slate-500 group-hover:text-white transition-colors shrink-0 text-sm">↗</span>
                            </div>
                        </a>`;
                });
                listHtml += '</div>';
            }

            container.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <span>📢 Thông Báo & Kế Hoạch Năm Học</span>
                            </h3>
                            <p class="text-xs text-slate-400">Cập nhật tin tức học vụ, phong trào, kiểm tra đánh giá</p>
                        </div>
                    </div>
                    ${searchHtml}
                    ${listHtml}
                </div>`;
        },

        handleSearch: function(val) {
            this.searchQuery = val || '';
            const container = document.getElementById('schoolNewsContentArea');
            if (this.activeTab === 'general' && container) {
                this.renderTabGeneral();
                const inp = document.getElementById('schoolNewsSearchInput');
                if (inp) {
                    inp.focus();
                    inp.setSelectionRange(inp.value.length, inp.value.length);
                }
            }
        }
    };

    window.SchoolNewsEngine = SchoolNewsEngine;

    // Auto-init on page ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SchoolNewsEngine.init());
    } else {
        SchoolNewsEngine.init();
    }

})(window);
