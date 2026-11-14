/**
 * Aseta — School News Engine (Cổng Thông Báo Trường THPT Trần Văn Giàu)
 * Thiết kế Bento Grid Cao Cấp (Apple / Linear / Dark SaaS UI):
 * 1. Tab ⚡ Hôm Nay: Spotlight Bento Dashboard tổng hợp đầy đủ sự kiện, mốc giờ, trực ban, thực đơn cơm trưa ngày hôm đó.
 * 2. Tab 📅 Lịch Tuần: Danh sách công tác bó gọn theo từng Thứ với Accordion mũi tên đóng/mở siêu gọn, kèm tìm kiếm & lọc nhanh.
 * 3. Tab 🍱 Thực Đơn Bán Trú: Ảnh thực đơn HD chính thức, tải file PDF gốc & tra cứu món ăn từng thứ.
 * 4. Tab 📢 Thông Báo Chung: Bento grid các văn bản chỉ đạo, thông báo điều hành.
 */

(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_school_news_cache_v7';
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

    const SchoolNewsEngine = {
        data: null,
        activeTab: 'today', // 'today' | 'schedule' | 'meals' | 'general'
        selectedWeekIdx: 0,
        todaySelectedDay: 'today', // 'today' | 'Thứ Hai' | 'Thứ Ba' ...
        selectedDayFilter: 'all', // 'all' | 'today' | 'Thứ Hai' ...
        expandedDays: new Set(),
        searchQuery: '',
        selectedMealDay: 'Thứ Hai',
        isLoading: false,
        lastFetched: null,

        init: function() {
            this.loadCachedData();
            this.bindGlobalKeys();
            // Pre-fetch in background if cache is stale or missing dailyDishes
            setTimeout(() => {
                this.checkAndRefreshBackground();
            }, 400);
        },

        loadCachedData: function() {
            try {
                // Clear legacy caches to ensure latest Bento Grid & image data
                ['aseta_tvg_school_news_cache', 'aseta_tvg_school_news_cache_v3', 'aseta_tvg_school_news_cache_v4', 'aseta_tvg_school_news_cache_v5', 'aseta_tvg_school_news_cache_v6'].forEach(k => {
                    localStorage.removeItem(k);
                });

                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.data && parsed.data.mealsWeeks && parsed.data.mealsWeeks[0]) {
                        this.data = parsed.data;
                        this.lastFetched = parsed.timestamp;
                        this.initDefaultExpandedDay();
                    }
                }
            } catch (e) {}
        },

        initDefaultExpandedDay: function() {
            if (this.expandedDays.size === 0 && this.data && this.data.scheduleWeeks && this.data.scheduleWeeks[0]) {
                const todayName = this.getTodayDayName();
                const rows = this.data.scheduleWeeks[this.selectedWeekIdx]?.tableRows || [];
                const foundToday = rows.find(r => r.day && r.day.toLowerCase().includes(todayName.toLowerCase()));
                if (foundToday) {
                    this.expandedDays.add(foundToday.day);
                } else if (rows[0] && rows[0].day) {
                    this.expandedDays.add(rows[0].day);
                }
            }
        },

        checkAndRefreshBackground: async function() {
            const now = Date.now();
            const hasDishes = this.data && this.data.mealsWeeks && this.data.mealsWeeks[0] && this.data.mealsWeeks[0].dailyDishes;
            if (!this.data || !hasDishes || !this.lastFetched || (now - this.lastFetched > CACHE_TTL_MS)) {
                await this.fetchNews(false);
            }
        },

        fetchNews: async function(force = false) {
            if (this.isLoading) return;
            this.isLoading = true;
            this.updateRefreshButtonState(true);

            try {
                const res = await fetch(`data/school_news.json?t=${Date.now()}`);
                if (!res.ok) throw new Error('Không thể tải file dữ liệu');
                const json = await res.json();
                this.data = json;
                this.lastFetched = Date.now();
                this.initDefaultExpandedDay();

                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: this.data,
                    timestamp: this.lastFetched
                }));

                if (force && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast('🔄 Đã đồng bộ thông tin mới nhất từ THPT Trần Văn Giàu!');
                }

                if (this.isModalOpen()) {
                    this.render();
                }
            } catch (err) {
                console.warn('[SchoolNewsEngine] Lỗi tải dữ liệu:', err);
                if (force && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast('⚠️ Không thể kết nối tới nguồn dữ liệu trường. Đang dùng bản lưu tạm.');
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

        openModal: async function(defaultTab = 'today') {
            this.activeTab = defaultTab;
            const modal = document.getElementById('schoolNewsModal');
            if (!modal) return;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            if (!this.data) {
                await this.fetchNews(false);
            } else {
                this.initDefaultExpandedDay();
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
            this.render();
            if (window.AudioHelper && window.AudioHelper.playTap) {
                window.AudioHelper.playTap();
            }
        },

        setWeekIdx: function(idx) {
            this.selectedWeekIdx = idx;
            this.expandedDays.clear();
            this.initDefaultExpandedDay();
            this.render();
        },

        setTodaySelectedDay: function(dayName) {
            this.todaySelectedDay = dayName;
            this.renderTabToday();
            if (window.AudioHelper && window.AudioHelper.playTap) {
                window.AudioHelper.playTap();
            }
        },

        setDayFilter: function(filter) {
            this.selectedDayFilter = filter;
            this.renderTabSchedule();
        },

        toggleDayAccordion: function(dayKey) {
            if (this.expandedDays.has(dayKey)) {
                this.expandedDays.delete(dayKey);
            } else {
                this.expandedDays.add(dayKey);
            }
            this.renderTabSchedule();
            if (window.AudioHelper && window.AudioHelper.playTap) {
                window.AudioHelper.playTap();
            }
        },

        expandAllDays: function() {
            const weeks = (this.data && this.data.scheduleWeeks) || [];
            const currentWeek = weeks[this.selectedWeekIdx] || weeks[0];
            const rows = currentWeek?.tableRows || [];
            rows.forEach(r => {
                if (r.day) this.expandedDays.add(r.day);
            });
            this.renderTabSchedule();
        },

        collapseAllDays: function() {
            this.expandedDays.clear();
            this.renderTabSchedule();
        },

        setSearchQuery: function(q) {
            this.searchQuery = (q || '').trim().toLowerCase();
            this.renderTabSchedule();
        },

        setSelectedMealDay: function(dayName) {
            this.selectedMealDay = dayName;
            this.renderTabMeals();
        },

        getTodayDayName: function() {
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const today = new Date();
            return days[today.getDay()];
        },

        getTodayFormattedDate: function() {
            const now = new Date();
            return new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(now);
        },

        render: function() {
            const headerSyncText = document.getElementById('schoolNewsSyncTime');
            if (headerSyncText) {
                const timeText = this.data && this.data.lastUpdatedText ? this.data.lastUpdatedText : 'Vừa cập nhật';
                headerSyncText.textContent = `Đồng bộ: ${timeText}`;
            }

            // Update Tab Buttons Active State (Bento Style)
            const tabs = ['today', 'schedule', 'meals', 'general'];
            tabs.forEach(t => {
                const btn = document.getElementById(`schoolNewsTabBtn_${t}`);
                if (btn) {
                    if (t === this.activeTab) {
                        btn.className = 'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white shadow-lg shadow-red-500/25 border border-white/20 transition-all flex items-center gap-1.5 shrink-0 scale-[1.02]';
                    } else {
                        btn.className = 'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 shrink-0';
                    }
                }
            });

            const contentContainer = document.getElementById('schoolNewsContentArea');
            if (!contentContainer) return;

            if (this.activeTab === 'today') {
                this.renderTabToday();
            } else if (this.activeTab === 'schedule') {
                this.renderTabSchedule();
            } else if (this.activeTab === 'meals') {
                this.renderTabMeals();
            } else if (this.activeTab === 'general') {
                this.renderTabGeneral();
            }
        },

        // =========================================================================
        // TAB 1: BENTO SPOTLIGHT - TỔNG HỢP NGÀY HÔM ĐÓ (THEO MẪU HÌNH 2)
        // =========================================================================
        renderTabToday: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const weeks = (this.data && this.data.scheduleWeeks) || [];
            const currentWeek = weeks[this.selectedWeekIdx] || weeks[0];
            const rows = currentWeek?.tableRows || [];
            const todayName = this.getTodayDayName();

            // Determine which day to show in Spotlight
            let targetDayQuery = todayName;
            if (this.todaySelectedDay !== 'today') {
                targetDayQuery = this.todaySelectedDay;
            }

            // Find rows matching this day
            const targetRows = rows.filter(r => r.day && r.day.toLowerCase().includes(targetDayQuery.toLowerCase()));
            const targetDayTitle = (targetRows[0] && targetRows[0].day) ? targetRows[0].day : `${targetDayQuery} (Tuần ${currentWeek?.weekNum || 10})`;
            const dutyLeader = targetRows.find(r => r.onDuty && r.onDuty.trim())?.onDuty || 'Ban Lãnh Đạo / Trực Tuần BGH';

            // Meals data for today
            const mealsWeek = (this.data && this.data.mealsWeeks && this.data.mealsWeeks[0]) || null;
            const dailyDishes = mealsWeek?.dailyDishes || {};
            // Match dishes by day name (Thứ Hai -> Thứ Sáu)
            let dayMeal = null;
            for (const dKey in dailyDishes) {
                if (targetDayQuery.toLowerCase().includes(dKey.toLowerCase()) || dKey.toLowerCase().includes(targetDayQuery.toLowerCase())) {
                    dayMeal = dailyDishes[dKey];
                    break;
                }
            }

            // Latest general notice
            const latestNotice = (this.data && this.data.generalNotices && this.data.generalNotices[0]) || {
                title: 'Kế hoạch năm học và thông báo nội bộ trường THPT Trần Văn Giàu',
                link: 'https://thpttranvangiau.hcm.edu.vn'
            };

            // Days picker list
            const daysButtons = [
                { id: 'today', label: `⚡ Hôm Nay (${todayName})` },
                { id: 'Thứ Hai', label: 'Thứ 2' },
                { id: 'Thứ Ba', label: 'Thứ 3' },
                { id: 'Thứ Tư', label: 'Thứ 4' },
                { id: 'Thứ Năm', label: 'Thứ 5' },
                { id: 'Thứ Sáu', label: 'Thứ 6' },
                { id: 'Thứ Bảy', label: 'Thứ 7' },
                { id: 'Chủ Nhật', label: 'CN' }
            ];

            let daySelectorHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">';
            daysButtons.forEach(btn => {
                const isActive = (this.todaySelectedDay === btn.id);
                daySelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setTodaySelectedDay('${btn.id}')"
                            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.03]' : 'bg-[#151722] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'}">
                        ${btn.label}
                    </button>`;
            });
            daySelectorHtml += '</div>';

            // Tasks HTML for Hero Card
            let tasksListHtml = '';
            if (targetRows.length === 0) {
                tasksListHtml = `
                    <div class="py-6 sm:py-8 text-center text-slate-400 flex flex-col items-center justify-center">
                        <span class="text-3xl sm:text-4xl">☕</span>
                        <p class="mt-2 text-xs sm:text-sm font-semibold text-slate-200">Không có công tác hoặc là ngày nghỉ</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Bạn có thể chọn Thứ khác ở thanh trên để xem trước công tác</p>
                    </div>`;
            } else {
                tasksListHtml = '<div class="space-y-2.5 mt-3">';
                targetRows.slice(0, 5).forEach((t, idx) => {
                    if (!t.content && !t.assignee) return;
                    // Extract time like "07g00", "08g30", "17g00"
                    const timeMatch = t.content ? t.content.match(/(\d{1,2}[gh:]\d{2})/i) : null;
                    const cleanContent = t.content ? t.content.replace(/^[-–—]\s*/, '').replace(/^\d{1,2}[gh:]\d{2}\s*[:\-–]\s*/i, '') : '';
                    const timeTag = timeMatch ? timeMatch[1] : `Mục ${idx + 1}`;

                    tasksListHtml += `
                        <div class="p-3 sm:p-3.5 rounded-2xl bg-[#0f111a]/80 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div class="flex items-start gap-2.5 min-w-0">
                                <span class="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 font-black text-[11px] shrink-0 tracking-wider">
                                    ⏰ ${timeTag}
                                </span>
                                <div class="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                                    ${cleanContent || t.content}
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                                ${t.assignee ? `<span class="px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/25 font-semibold text-[11px]">👥 ${t.assignee}</span>` : ''}
                                ${t.location ? `<span class="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 font-semibold text-[11px]">📍 ${t.location}</span>` : ''}
                            </div>
                        </div>`;
                });

                if (targetRows.length > 5) {
                    tasksListHtml += `
                        <div class="pt-1 text-center">
                            <button type="button" onclick="SchoolNewsEngine.switchTab('schedule')"
                                    class="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1 mx-auto transition-colors">
                                <span>Xem thêm ${targetRows.length - 5} công tác khác trong Lịch Tuần ➔</span>
                            </button>
                        </div>`;
                }
                tasksListHtml += '</div>';
            }

            // Lunch section inside Bento
            let lunchHtml = '';
            if (dayMeal) {
                lunchHtml = `
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        <div class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                            <span class="text-[10px] font-black uppercase tracking-wider text-red-400">🍖 Món chính</span>
                            <p class="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">${dayMeal.main}</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">🍳 Món phụ</span>
                            <p class="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">${dayMeal.side}</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-400">🥣 Canh</span>
                            <p class="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">${dayMeal.soup}</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                            <span class="text-[10px] font-black uppercase tracking-wider text-sky-400">🥗 Rau xào / luộc</span>
                            <p class="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">${dayMeal.veggie}</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 col-span-2 sm:col-span-1">
                            <span class="text-[10px] font-black uppercase tracking-wider text-purple-400">🍰 Tráng miệng</span>
                            <p class="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">${dayMeal.dessert}</p>
                        </div>
                    </div>`;
            } else {
                lunchHtml = `
                    <div class="mt-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                        <span class="text-2xl">🌟</span>
                        <div>
                            <p class="text-xs sm:text-sm font-bold text-white">Hôm nay không tổ chức ăn bán trú (Cuối tuần)</p>
                            <p class="text-[11px] text-slate-400 mt-0.5">Thực đơn tiếp theo bắt đầu Thứ Hai với: Cá file chiên sốt cà, Chả lụa kho tiêu, Canh cải thảo...</p>
                        </div>
                    </div>`;
            }

            // Render Bento Grid Container
            container.innerHTML = `
                <div class="space-y-4">
                    <!-- Day Switcher Pills Bar -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>⚡ Trung Tâm Điều Hành & Tiêu Điểm Trong Ngày</span>
                            </h3>
                            <p class="text-xs text-slate-400">Thông tin tổng hợp thời gian thực theo cấu trúc Bento Grid</p>
                        </div>
                        ${daySelectorHtml}
                    </div>

                    <!-- BENTO GRID (HÌNH 2 INSPIRATION) -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
                        
                        <!-- 1. HERO SPOTLIGHT CARD (Wide 8-columns) -->
                        <div class="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#161824] via-[#10121a] to-[#0c0d12] border border-white/10 shadow-2xl relative overflow-hidden group">
                            <!-- Subtle Ambient Glow -->
                            <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div class="flex flex-wrap items-center justify-between gap-2 pb-1">
                                <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Tiêu Điểm Trong Ngày
                                </span>
                                <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <span>📅</span> ${targetDayTitle}
                                </span>
                            </div>

                            <div class="mt-2.5">
                                <h4 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    Công Tác & Nhiệm Vụ Hôm Nay
                                </h4>
                                <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                                    Lịch làm việc phân công chi tiết của cán bộ, giáo viên và học sinh trường THPT Trần Văn Giàu.
                                </p>
                            </div>

                            ${tasksListHtml}
                        </div>

                        <!-- 2. METRICS & INTENSITY CARD (4-columns - Style 67K Activity in Fig 2) -->
                        <div class="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#11131c] border border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden">
                            <div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-black uppercase tracking-wider text-slate-400">Khối Lượng Công Tác</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/5 text-amber-300 border border-white/10">Tuần ${currentWeek?.weekNum || 10}</span>
                                </div>
                                <div class="mt-3 flex items-baseline gap-2">
                                    <span class="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">${targetRows.length < 10 ? '0' + targetRows.length : targetRows.length}</span>
                                    <span class="text-xs text-slate-400 font-semibold">nhiệm vụ trong ngày</span>
                                </div>
                            </div>

                            <!-- Workload Weekly Bar Graph (Direct homage to Fig 2 green bars) -->
                            <div class="my-5">
                                <div class="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                                    <span>Mật độ công tác tuần này</span>
                                    <span class="text-emerald-400 font-bold">7 ngày</span>
                                </div>
                                <div class="flex items-end justify-between gap-1.5 h-16 pt-2">
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/80 rounded-t-md h-12"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">T2</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/40 rounded-t-md h-5"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">T3</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/50 rounded-t-md h-6"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">T4</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/70 rounded-t-md h-10"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">T5</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/50 rounded-t-md h-6"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">T6</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-amber-400 shadow-lg shadow-amber-400/40 rounded-t-md h-14"></div>
                                        <span class="text-[9px] text-amber-300 font-black">T7</span>
                                    </div>
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <div class="w-full bg-emerald-500/30 rounded-t-md h-4"></div>
                                        <span class="text-[9px] text-slate-500 font-bold">CN</span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                                <span>Học kỳ 1 (2026-2027)</span>
                                <span class="text-emerald-400 font-black flex items-center gap-1">● Đồng bộ trực tiếp</span>
                            </div>
                        </div>

                        <!-- 3. BENTO CARD: LUNCH / THỰC ĐƠN BÁN TRÚ (7-columns) -->
                        <div class="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#181522] via-[#12131d] to-[#0c0d12] border border-amber-500/20 shadow-xl relative">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg">
                                        🍱
                                    </div>
                                    <div>
                                        <h4 class="text-sm sm:text-base font-bold text-white">Thực Đơn Cơm Trưa Bán Trú</h4>
                                        <p class="text-[11px] text-slate-400">Các món ăn dinh dưỡng trong ngày</p>
                                    </div>
                                </div>
                                <button type="button" onclick="SchoolNewsEngine.switchTab('meals')"
                                        class="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/25 text-xs font-bold transition-all flex items-center gap-1">
                                    <span>Ảnh Thực Đơn ↗</span>
                                </button>
                            </div>

                            ${lunchHtml}
                        </div>

                        <!-- 4. BENTO CARD: TRỰC BAN & CHỈ ĐẠO (5-columns) -->
                        <div class="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#11131c] border border-white/10 shadow-xl flex flex-col justify-between">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center text-lg">
                                    🛡️
                                </div>
                                <div>
                                    <h4 class="text-sm sm:text-base font-bold text-white">Trực Ban Trường Học</h4>
                                    <p class="text-[11px] text-slate-400">Cán bộ phụ trách giám sát ngày</p>
                                </div>
                            </div>

                            <div class="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                                    BGH
                                </div>
                                <div class="min-w-0">
                                    <div class="text-[10px] text-amber-400 font-black uppercase tracking-wider">Lãnh Đạo Trực Tuần</div>
                                    <div class="text-xs sm:text-sm font-bold text-white truncate">${dutyLeader}</div>
                                </div>
                            </div>

                            <p class="text-[11px] text-slate-400 leading-relaxed">
                                Lưu ý: Học sinh cần hỗ trợ học vụ hoặc nề nếp kỷ luật liên hệ trực tiếp phòng Quản lý học sinh hoặc Thầy/Cô trực ban.
                            </p>
                        </div>

                        <!-- 5. CAPSULE BANNER: ALWAYS SOMETHING NEW (Full 12-columns - Fig 2 inspiration) -->
                        <div class="lg:col-span-12 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#161a24] via-[#12141d] to-[#161a24] border border-white/10 hover:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl transition-all">
                            <div class="flex items-center gap-3 min-w-0">
                                <span class="text-2xl text-lime-400 shrink-0">✨</span>
                                <div class="min-w-0">
                                    <div class="text-[10px] font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                                        <span>Thông Báo Mới Nhất</span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping"></span>
                                    </div>
                                    <div class="text-xs sm:text-sm font-bold text-white hover:text-sky-300 transition-colors truncate mt-0.5">
                                        ${latestNotice.title}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                <button type="button" onclick="SchoolNewsEngine.switchTab('general')"
                                        class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 transition-all">
                                    Tất cả thông báo
                                </button>
                                <a href="${latestNotice.link}" target="_blank" rel="noopener noreferrer"
                                   class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1">
                                    <span>Đọc chi tiết ↗</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>`;
        },

        // =========================================================================
        // TAB 2: LỊCH TUẦN - ACCORDION BÓ GỌN THEO THỨ (THEO YÊU CẦU CỦA USER)
        // =========================================================================
        renderTabSchedule: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const weeks = (this.data && this.data.scheduleWeeks) || [];
            if (weeks.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">📅</span>
                        <p class="mt-2 text-sm">Chưa có dữ liệu lịch công tác tuần. Vui lòng bấm làm mới.</p>
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
                            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}">
                        ${w.isLatest ? '🌟 ' : ''}Tuần ${w.weekNum} ${w.isLatest ? '(Mới Nhất)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            // Day Filter Pills (Tất cả, Hôm nay, T2 -> CN)
            const daysList = ['all', 'today', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
            let dayFilterHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">';
            daysList.forEach(d => {
                const isSelected = (this.selectedDayFilter === d);
                let label = d;
                if (d === 'all') label = '📋 Tất cả ngày';
                else if (d === 'today') label = `⚡ Hôm nay (${todayName})`;

                dayFilterHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setDayFilter('${d}')"
                            class="shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}">
                        ${label}
                    </button>`;
            });
            dayFilterHtml += '</div>';

            // Group rows strictly by Day!
            const groupedDays = new Map();
            rows.forEach(r => {
                const dayName = r.day || 'Thông Tin Khác';
                if (!groupedDays.has(dayName)) {
                    groupedDays.set(dayName, []);
                }
                groupedDays.get(dayName).push(r);
            });

            // Filter days based on dayFilter and search query
            let accordionHtml = '<div class="space-y-3 pt-1">';
            let renderedDayCount = 0;

            groupedDays.forEach((tasks, dayKey) => {
                // Filter by day
                if (this.selectedDayFilter !== 'all') {
                    if (this.selectedDayFilter === 'today') {
                        if (!dayKey.toLowerCase().includes(todayName.toLowerCase())) return;
                    } else {
                        if (!dayKey.toLowerCase().includes(this.selectedDayFilter.toLowerCase())) return;
                    }
                }

                // Filter by search query
                let visibleTasks = tasks;
                if (this.searchQuery) {
                    visibleTasks = tasks.filter(t => {
                        return (t.content && t.content.toLowerCase().includes(this.searchQuery)) ||
                               (t.assignee && t.assignee.toLowerCase().includes(this.searchQuery)) ||
                               (t.location && t.location.toLowerCase().includes(this.searchQuery)) ||
                               (t.onDuty && t.onDuty.toLowerCase().includes(this.searchQuery)) ||
                               dayKey.toLowerCase().includes(this.searchQuery);
                    });
                    if (visibleTasks.length === 0) return;
                }

                renderedDayCount++;
                const isExpanded = this.expandedDays.has(dayKey);
                const isToday = dayKey.toLowerCase().includes(todayName.toLowerCase());
                const onDutyLeader = tasks.find(t => t.onDuty && t.onDuty.trim())?.onDuty || '';

                // Escape dayKey for onclick
                const escapedDayKey = dayKey.replace(/'/g, "\\'");

                accordionHtml += `
                    <div class="rounded-2xl border transition-all overflow-hidden ${isToday ? 'border-amber-500/40 bg-[#12141e]/90 shadow-lg shadow-amber-500/5' : 'border-white/10 bg-[#0e1017]/80 hover:border-white/20'}">
                        <!-- ACCORDION HEADER (CLICK TO EXPAND / COLLAPSE) -->
                        <button type="button" onclick="SchoolNewsEngine.toggleDayAccordion('${escapedDayKey}')"
                                class="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${isExpanded ? 'bg-white/[0.03]' : ''}">
                            <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
                                <span class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                                    <span>📅</span> <span>${dayKey}</span>
                                </span>
                                ${isToday ? `
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Hôm Nay
                                    </span>` : ''}
                                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                                    ${tasks.length} công tác
                                </span>
                                ${onDutyLeader ? `
                                    <span class="hidden md:inline-flex px-2 py-0.5 rounded-lg text-[11px] font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/20">
                                        🛡️ Trực: ${onDutyLeader}
                                    </span>` : ''}
                            </div>

                            <!-- Animated Chevron Arrow -->
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                                    ${isExpanded ? 'Thu gọn' : 'Bấm xem chi tiết'}
                                </span>
                                <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-amber-500/15 text-amber-400' : ''}">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </button>

                        <!-- ACCORDION BODY (EXPANDABLE CONTENT) -->
                        ${isExpanded ? `
                            <div class="p-3.5 sm:p-4 pt-1 border-t border-white/5 space-y-2.5 animate-fadeIn">
                                ${onDutyLeader ? `
                                    <div class="md:hidden py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                                        <span>🛡️</span> <span>Trực ban: ${onDutyLeader}</span>
                                    </div>` : ''}

                                <div class="grid grid-cols-1 gap-2.5">
                                    ${visibleTasks.map((t, tIdx) => {
                                        if (!t.content && !t.assignee) return '';
                                        const timeMatch = t.content ? t.content.match(/(\d{1,2}[gh:]\d{2})/i) : null;
                                        const cleanText = t.content ? t.content.replace(/^[-–—]\s*/, '').replace(/^\d{1,2}[gh:]\d{2}\s*[:\-–]\s*/i, '') : '';
                                        const timeLabel = timeMatch ? timeMatch[1] : `Mục ${tIdx + 1}`;

                                        return `
                                            <div class="p-3 sm:p-3.5 rounded-xl bg-[#090a10]/80 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2">
                                                <div class="flex items-start gap-2.5">
                                                    <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-black text-[11px] shrink-0 mt-0.5">
                                                        ⏰ ${timeLabel}
                                                    </span>
                                                    <div class="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                                                        ${cleanText || t.content}
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap items-center gap-2 pl-9 text-xs">
                                                    ${t.assignee ? `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold text-[11px]">👥 ${t.assignee}</span>` : ''}
                                                    ${t.location ? `<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold text-[11px]">📍 ${t.location}</span>` : ''}
                                                </div>
                                            </div>`;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>`;
            });

            if (renderedDayCount === 0) {
                accordionHtml += `
                    <div class="py-10 text-center text-slate-400">
                        <span class="text-3xl">🔍</span>
                        <p class="mt-2 text-sm font-semibold">Không tìm thấy công tác phù hợp với từ khóa "${this.searchQuery}"</p>
                    </div>`;
            }
            accordionHtml += '</div>';

            container.innerHTML = `
                <div class="space-y-3.5">
                    <!-- Title & School Post Link -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>📅 ${currentWeek.title}</span>
                            </h3>
                            <p class="text-xs text-slate-400">Danh sách công tác được nhóm gọn theo từng Thứ (bấm mũi tên để mở xem)</p>
                        </div>
                        <a href="${currentWeek.link}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-semibold shrink-0">
                            <span>Mở bài gốc trường</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                    </div>

                    ${weekSelectorHtml}

                    <!-- Search & Expand All / Collapse All Controls -->
                    <div class="p-3 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div class="relative w-full sm:w-72">
                            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">🔍</span>
                            <input type="text" value="${this.searchQuery}" oninput="SchoolNewsEngine.setSearchQuery(this.value)"
                                   placeholder="Tìm công tác, giáo viên, phòng ban..."
                                   class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50">
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button type="button" onclick="SchoolNewsEngine.expandAllDays()"
                                    class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition-all flex items-center gap-1">
                                <span>📂 Mở tất cả</span>
                            </button>
                            <button type="button" onclick="SchoolNewsEngine.collapseAllDays()"
                                    class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition-all flex items-center gap-1">
                                <span>📁 Thu gọn tất cả</span>
                            </button>
                        </div>
                    </div>

                    ${dayFilterHtml}
                    ${accordionHtml}
                </div>`;
        },

        // =========================================================================
        // TAB 3: THỰC ĐƠN BÁN TRÚ - XEM ẢNH HD & TẢI FILE PDF GỐC
        // =========================================================================
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
            const pdfFileUrl = currentMeal.localPdfUrl || 'data/pdf/thuc_don_latest.pdf';
            const imgUrl = currentMeal.imageUrl || `data/pdf/thuc_don_tuan_${currentMeal.weekNum}.png` || 'data/pdf/thuc_don_latest.png';
            const dailyDishes = currentMeal.dailyDishes || {};

            // Week Selector
            let weekSelectorHtml = '<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">';
            mealsWeeks.forEach((w, idx) => {
                const isActive = (idx === this.selectedWeekIdx);
                weekSelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setWeekIdx(${idx})"
                            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-red-500 text-white shadow-md shadow-red-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}">
                        ${w.isLatest ? '🌟 ' : ''}Tuần ${w.weekNum} ${w.isLatest ? '(Mới Nhất)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            // Daily meal breakdown chips
            const availableDays = Object.keys(dailyDishes);
            let dayBreakdownHtml = '';
            if (availableDays.length > 0) {
                const currentDayDish = dailyDishes[this.selectedMealDay] || dailyDishes['Thứ Hai'];
                let dayChips = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">';
                availableDays.forEach(d => {
                    const isSel = (d === this.selectedMealDay);
                    dayChips += `
                        <button type="button" onclick="SchoolNewsEngine.setSelectedMealDay('${d}')"
                                class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSel ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}">
                            ${d} (${dailyDishes[d].date || ''})
                        </button>`;
                });
                dayChips += '</div>';

                dayBreakdownHtml = `
                    <div class="p-4 rounded-3xl bg-[#11131c] border border-white/10 space-y-3">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-black uppercase tracking-wider text-amber-400">Món Ăn Chi Tiết Từng Ngày</span>
                            ${dayChips}
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                            <div class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                <span class="text-[10px] font-black uppercase text-red-400">🍖 Món chính</span>
                                <p class="text-xs sm:text-sm font-bold text-white mt-1">${currentDayDish.main}</p>
                            </div>
                            <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <span class="text-[10px] font-black uppercase text-amber-400">🍳 Món phụ</span>
                                <p class="text-xs sm:text-sm font-bold text-white mt-1">${currentDayDish.side}</p>
                            </div>
                            <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span class="text-[10px] font-black uppercase text-emerald-400">🥣 Canh</span>
                                <p class="text-xs sm:text-sm font-bold text-white mt-1">${currentDayDish.soup}</p>
                            </div>
                            <div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                                <span class="text-[10px] font-black uppercase text-sky-400">🥗 Rau xào / Luộc</span>
                                <p class="text-xs sm:text-sm font-bold text-white mt-1">${currentDayDish.veggie}</p>
                            </div>
                            <div class="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 col-span-2 sm:col-span-1">
                                <span class="text-[10px] font-black uppercase text-purple-400">🍰 Tráng miệng</span>
                                <p class="text-xs sm:text-sm font-bold text-white mt-1">${currentDayDish.dessert}</p>
                            </div>
                        </div>
                    </div>`;
            }

            container.innerHTML = `
                <div class="space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>🍱 ${currentMeal.title}</span>
                            </h3>
                            <p class="text-xs text-slate-400">Bảng thực đơn cơm trưa bán trú có chữ ký số của Ban Giám Hiệu</p>
                        </div>
                        <a href="${currentMeal.link}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-semibold shrink-0">
                            <span>Mở bài gốc trường</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                    </div>

                    ${weekSelectorHtml}

                    <!-- Action Bar: View Fullscreen & Download Buttons -->
                    <div class="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-red-950/40 via-[#11131c] to-[#0c0d12] border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
                                📄
                            </div>
                            <div class="min-w-0">
                                <h4 class="text-xs sm:text-sm font-bold text-white truncate">${currentMeal.title}</h4>
                                <p class="text-[11px] text-slate-400">Tệp gốc bộ phận bán trú THPT Trần Văn Giàu</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                            <a href="${imgUrl}" target="_blank" rel="noopener noreferrer"
                               class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>🔍 Phóng To Ảnh ↗</span>
                            </a>
                            <a href="${pdfFileUrl}" download="Thuc_Don_Tuan_${currentMeal.weekNum}.pdf"
                                class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>📥 Tải File PDF</span>
                            </a>
                        </div>
                    </div>

                    ${dayBreakdownHtml}

                    <!-- Menu Image Display (High Res PNG) -->
                    <div class="rounded-3xl overflow-hidden border border-white/10 bg-[#090a10] w-full flex flex-col shadow-2xl">
                        <div class="px-4 py-3 bg-[#11131c] border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
                            <span class="flex items-center gap-2 font-black text-amber-300 text-xs sm:text-sm">
                                <span>🍱</span> Bảng Thực Đơn Tuần ${currentMeal.weekNum} (Chính Thức)
                            </span>
                            <a href="${imgUrl}" target="_blank" rel="noopener noreferrer" 
                               class="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold transition-all flex items-center gap-1 cursor-pointer text-xs">
                                <span>Phóng to ảnh ↗</span>
                            </a>
                        </div>
                        <div class="w-full bg-[#06070a] p-2 sm:p-4 flex flex-col items-center justify-center">
                            <img src="${imgUrl}" 
                                 alt="Thực đơn bán trú tuần ${currentMeal.weekNum}"
                                 class="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 cursor-pointer hover:brightness-105 transition-all"
                                 onclick="window.open(this.src, '_blank')"
                                 onerror="this.onerror=null; this.src='data/pdf/thuc_don_latest.png';"
                                 title="Bấm vào ảnh để mở xem phóng to toàn màn hình">
                            <p class="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1">
                                <span>💡</span> <span>Chạm hoặc bấm vào ảnh để phóng to toàn màn hình rõ nét nhất</span>
                            </p>
                        </div>
                    </div>
                </div>`;
        },

        // =========================================================================
        // TAB 4: THÔNG BÁO CHUNG - BENTO GRID VĂN BẢN ĐIỀU HÀNH
        // =========================================================================
        renderTabGeneral: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const notices = (this.data && this.data.generalNotices) || [];
            if (notices.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">📢</span>
                        <p class="mt-2 text-sm">Chưa có thông báo chung nào. Vui lòng bấm làm mới.</p>
                    </div>`;
                return;
            }

            let cardsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">';
            notices.forEach((n, idx) => {
                const isFeatured = (idx === 0);
                cardsHtml += `
                    <div class="p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${isFeatured ? 'md:col-span-2 bg-gradient-to-br from-[#161824] via-[#10121a] to-[#0c0d12] border-amber-500/30 shadow-xl' : 'bg-[#11131c] border-white/10 hover:border-white/20'}">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${n.isNew ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}">
                                    ${n.isNew ? '🔥 Mới cập nhật' : 'Văn bản điều hành'}
                                </span>
                                <span class="text-[11px] text-slate-500 font-bold">#${idx + 1}</span>
                            </div>
                            <h4 class="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 hover:text-sky-300 transition-colors">
                                ${n.title}
                            </h4>
                        </div>
                        <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                            <span class="text-slate-400">Trường THPT Trần Văn Giàu</span>
                            <a href="${n.link}" target="_blank" rel="noopener noreferrer"
                               class="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors">
                                <span>Đọc chi tiết</span>
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                        </div>
                    </div>`;
            });
            cardsHtml += '</div>';

            container.innerHTML = `
                <div class="space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>📢 Thông Báo & Kế Hoạch Năm Học</span>
                            </h3>
                            <p class="text-xs text-slate-400">Các văn bản hướng dẫn và quyết định chính thức từ Ban Giám Hiệu</p>
                        </div>
                        <a href="https://thpttranvangiau.hcm.edu.vn/thong-bao/c/42154" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-semibold shrink-0">
                            <span>Mở chuyên mục gốc</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                    </div>

                    ${cardsHtml}
                </div>`;
        }
    };

    window.SchoolNewsEngine = SchoolNewsEngine;

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SchoolNewsEngine.init());
    } else {
        SchoolNewsEngine.init();
    }

})(window);
