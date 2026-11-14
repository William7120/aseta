/**
 * Aseta — School News Engine (Cổng Thông Báo Trường THPT Trần Văn Giàu)
 * Cấu trúc 1 Màn Hình (Single Viewport Fit) + Sidebar Dọc Bên Trái:
 * 1. Sidebar dọc bên trái: Nút tab to rõ, có icon & mô tả phụ, trạng thái Active phát sáng viền.
 * 2. Tab ⚡ Hôm Nay: Bento Grid 1 màn hình chuẩn mẫu Hình 2, không cần cuộn trang.
 * 3. Tab 📅 Lịch Tuần: Accordion từng Thứ thu gọn, mở đóng mượt mà, hỗ trợ tìm kiếm & mở tất cả.
 * 4. Tab 🍱 Thực Đơn: Tỷ lệ ảnh chuẩn trong 1 khung hình, bấm phóng to toàn màn hình.
 * 5. Tab 📢 Thông Báo: Bento Grid văn bản chỉ đạo BGH.
 */

(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_school_news_cache_v8';
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
            // Pre-fetch in background
            setTimeout(() => {
                this.checkAndRefreshBackground();
            }, 300);
        },

        loadCachedData: function() {
            try {
                // Clear any legacy caches
                for (let i = 1; i <= 7; i++) {
                    localStorage.removeItem(`aseta_tvg_school_news_cache_v${i}`);
                }
                localStorage.removeItem('aseta_tvg_school_news_cache');

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
                    window.SecurityGuard.showSecurityToast('⚠️ Đang dùng dữ liệu lưu tạm của trường.');
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
            if (this.activeTab === tabName) return;
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

        render: function() {
            // Update Sync Time
            const headerSyncText = document.getElementById('schoolNewsSyncTime');
            if (headerSyncText) {
                const timeText = this.data && this.data.lastUpdatedText ? this.data.lastUpdatedText : 'Vừa cập nhật';
                headerSyncText.textContent = `Đồng bộ: ${timeText}`;
            }

            // Update Vertical Left Sidebar Buttons
            const tabMeta = {
                today: { icon: '⚡', title: 'Hôm Nay', desc: 'Tiêu điểm & Bán trú ngày' },
                schedule: { icon: '📅', title: 'Lịch Tuần', desc: 'Phân công theo từng Thứ' },
                meals: { icon: '🍱', title: 'Thực Đơn Bán Trú', desc: 'Ảnh thực đơn HD & Tải PDF' },
                general: { icon: '📢', title: 'Thông Báo Chung', desc: 'Văn bản chỉ đạo BGH' }
            };

            const tabs = ['today', 'schedule', 'meals', 'general'];
            tabs.forEach(t => {
                const btn = document.getElementById(`schoolNewsTabBtn_${t}`);
                if (btn) {
                    const isActive = (t === this.activeTab);
                    if (isActive) {
                        btn.className = 'schoolNewsSidebarBtn shrink-0 md:w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer bg-gradient-to-r from-red-600/30 via-amber-600/20 to-transparent text-white border-l-4 border-amber-500 shadow-md bg-white/5 font-black scale-[1.01]';
                    } else {
                        btn.className = 'schoolNewsSidebarBtn shrink-0 md:w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent font-medium';
                    }
                }
            });

            // Update Right Header Title & Icon
            const iconEl = document.getElementById('schoolNewsTabIcon');
            const titleEl = document.getElementById('schoolNewsTabTitle');
            if (iconEl && titleEl && tabMeta[this.activeTab]) {
                iconEl.textContent = tabMeta[this.activeTab].icon;
                titleEl.textContent = tabMeta[this.activeTab].title;
            }

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
        // TAB 1: BENTO SPOTLIGHT - 1 MÀN HÌNH KHÔNG CẦN CUỘN TRANG (HÌNH 2 STYLE)
        // =========================================================================
        renderTabToday: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const weeks = (this.data && this.data.scheduleWeeks) || [];
            const currentWeek = weeks[this.selectedWeekIdx] || weeks[0];
            const rows = currentWeek?.tableRows || [];
            const todayName = this.getTodayDayName();

            // Target day
            let targetDayQuery = todayName;
            if (this.todaySelectedDay !== 'today') {
                targetDayQuery = this.todaySelectedDay;
            }

            const targetRows = rows.filter(r => r.day && r.day.toLowerCase().includes(targetDayQuery.toLowerCase()));
            const targetDayTitle = (targetRows[0] && targetRows[0].day) ? targetRows[0].day : `${targetDayQuery} (Tuần ${currentWeek?.weekNum || 10})`;
            const dutyLeader = targetRows.find(r => r.onDuty && r.onDuty.trim())?.onDuty || 'Ban Lãnh Đạo / Trực Tuần BGH';

            // Meals data
            const mealsWeek = (this.data && this.data.mealsWeeks && this.data.mealsWeeks[0]) || null;
            const dailyDishes = mealsWeek?.dailyDishes || {};
            let dayMeal = null;
            for (const dKey in dailyDishes) {
                if (targetDayQuery.toLowerCase().includes(dKey.toLowerCase()) || dKey.toLowerCase().includes(targetDayQuery.toLowerCase())) {
                    dayMeal = dailyDishes[dKey];
                    break;
                }
            }

            // Latest notice
            const latestNotice = (this.data && this.data.generalNotices && this.data.generalNotices[0]) || {
                title: 'Kế hoạch năm học và thông báo nội bộ trường THPT Trần Văn Giàu',
                link: 'https://thpttranvangiau.hcm.edu.vn'
            };

            // Days picker chips (compact single line)
            const daysButtons = [
                { id: 'today', label: `⚡ Hôm Nay (${todayName})` },
                { id: 'Thứ Hai', label: 'T2' },
                { id: 'Thứ Ba', label: 'T3' },
                { id: 'Thứ Tư', label: 'T4' },
                { id: 'Thứ Năm', label: 'T5' },
                { id: 'Thứ Sáu', label: 'T6' },
                { id: 'Thứ Bảy', label: 'T7' },
                { id: 'Chủ Nhật', label: 'CN' }
            ];

            let daySelectorHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">';
            daysButtons.forEach(btn => {
                const isActive = (this.todaySelectedDay === btn.id);
                daySelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setTodaySelectedDay('${btn.id}')"
                            class="shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.03]' : 'bg-[#151722] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'}">
                        ${btn.label}
                    </button>`;
            });
            daySelectorHtml += '</div>';

            // Tasks HTML inside Hero Card (Fitted height with smooth scroll if > 3 items)
            let tasksListHtml = '';
            if (targetRows.length === 0) {
                tasksListHtml = `
                    <div class="py-8 text-center text-slate-400 flex flex-col items-center justify-center">
                        <span class="text-3xl">☕</span>
                        <p class="mt-2 text-xs font-bold text-slate-200">Không có công tác hoặc là ngày nghỉ</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Bấm các thứ khác ở trên để xem trước công tác</p>
                    </div>`;
            } else {
                tasksListHtml = '<div class="space-y-2 max-h-[190px] lg:max-h-[220px] overflow-y-auto pr-1 no-scrollbar">';
                targetRows.forEach((t, idx) => {
                    if (!t.content && !t.assignee) return;
                    const timeMatch = t.content ? t.content.match(/(\d{1,2}[gh:]\d{2})/i) : null;
                    const cleanContent = t.content ? t.content.replace(/^[-–—]\s*/, '').replace(/^\d{1,2}[gh:]\d{2}\s*[:\-–]\s*/i, '') : '';
                    const timeTag = timeMatch ? timeMatch[1] : `Mục ${idx + 1}`;

                    tasksListHtml += `
                        <div class="p-2.5 sm:p-3 rounded-xl bg-[#0e1018]/90 border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2 min-w-0">
                                <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-black text-[10px] shrink-0 mt-0.5">
                                    ⏰ ${timeTag}
                                </span>
                                <div class="text-xs text-slate-100 font-medium leading-relaxed truncate-2">
                                    ${cleanContent || t.content}
                                </div>
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                ${t.assignee ? `<span class="px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/20 font-semibold text-[10px] truncate max-w-[110px]">👥 ${t.assignee}</span>` : ''}
                            </div>
                        </div>`;
                });
                tasksListHtml += '</div>';
            }

            // Lunch section HTML (Compact 1-line or 5-box row)
            let lunchHtml = '';
            if (dayMeal) {
                lunchHtml = `
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2">
                        <div class="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <span class="text-[9px] font-black uppercase text-red-400">🍖 Món chính</span>
                            <p class="text-xs font-bold text-white mt-0.5 truncate">${dayMeal.main}</p>
                        </div>
                        <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <span class="text-[9px] font-black uppercase text-amber-400">🍳 Món phụ</span>
                            <p class="text-xs font-bold text-white mt-0.5 truncate">${dayMeal.side}</p>
                        </div>
                        <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <span class="text-[9px] font-black uppercase text-emerald-400">🥣 Canh</span>
                            <p class="text-xs font-bold text-white mt-0.5 truncate">${dayMeal.soup}</p>
                        </div>
                        <div class="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                            <span class="text-[9px] font-black uppercase text-sky-400">🥗 Rau xào</span>
                            <p class="text-xs font-bold text-white mt-0.5 truncate">${dayMeal.veggie}</p>
                        </div>
                        <div class="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 col-span-2 sm:col-span-1">
                            <span class="text-[9px] font-black uppercase text-purple-400">🍰 Tráng miệng</span>
                            <p class="text-xs font-bold text-white mt-0.5 truncate">${dayMeal.dessert}</p>
                        </div>
                    </div>`;
            } else {
                lunchHtml = `
                    <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2 mt-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">🌟</span>
                            <div>
                                <p class="text-xs font-bold text-white">Nghỉ bán trú (Cuối tuần)</p>
                                <p class="text-[10px] text-slate-400">Thực đơn tiếp theo bắt đầu Thứ Hai: Cá file chiên sốt cà, Chả lụa...</p>
                            </div>
                        </div>
                        <button type="button" onclick="SchoolNewsEngine.switchTab('meals')" class="text-[11px] text-amber-400 font-bold hover:underline shrink-0">
                            Xem ảnh tuần ↗
                        </button>
                    </div>`;
            }

            container.innerHTML = `
                <div class="h-full flex flex-col justify-between gap-3">
                    
                    <!-- Top Sub-bar: Day Switcher -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <h4 class="text-xs sm:text-sm font-bold text-white tracking-tight">
                                Tiêu điểm: <span class="text-amber-400">${targetDayTitle}</span>
                            </h4>
                        </div>
                        ${daySelectorHtml}
                    </div>

                    <!-- 1-SCREEN BENTO GRID -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
                        
                        <!-- LEFT COLUMN (7 COLS): HERO TASKS & LUNCH -->
                        <div class="lg:col-span-7 flex flex-col justify-between gap-3 min-h-0">
                            
                            <!-- 1. HERO SPOTLIGHT CARD -->
                            <div class="flex-1 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#161824] via-[#10121a] to-[#0c0d12] border border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden">
                                <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-white/5">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                            ● Công Tác Hôm Nay
                                        </span>
                                        <span class="text-xs text-slate-400 font-semibold">${targetRows.length} nhiệm vụ</span>
                                    </div>
                                    <button type="button" onclick="SchoolNewsEngine.switchTab('schedule')" class="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                                        <span>Lịch tuần ➔</span>
                                    </button>
                                </div>

                                <div class="my-2 min-h-0 flex-1">
                                    ${tasksListHtml}
                                </div>
                            </div>

                            <!-- 2. LUNCH CARD (COMPACT BOTTOM) -->
                            <div class="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-[#181522] to-[#0c0d12] border border-amber-500/20 shadow-xl shrink-0">
                                <div class="flex items-center justify-between gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">🍱</span>
                                        <h5 class="text-xs sm:text-sm font-bold text-white">Thực Đơn Cơm Trưa Bán Trú</h5>
                                    </div>
                                    <button type="button" onclick="SchoolNewsEngine.switchTab('meals')" class="text-[11px] text-sky-400 hover:text-sky-300 font-bold">
                                        Ảnh thực đơn HD ↗
                                    </button>
                                </div>
                                ${lunchHtml}
                            </div>

                        </div>

                        <!-- RIGHT COLUMN (5 COLS): STATS & DUTY & LATEST NOTICE -->
                        <div class="lg:col-span-5 flex flex-col justify-between gap-3 min-h-0">
                            
                            <!-- 3. WORKLOAD STATS & DUTY CARD -->
                            <div class="flex-1 p-4 sm:p-5 rounded-3xl bg-[#11131c] border border-white/10 shadow-xl flex flex-col justify-between">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Khối Lượng Công Tác</span>
                                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/5 text-amber-300 border border-white/10">Tuần ${currentWeek?.weekNum || 10}</span>
                                </div>

                                <div class="my-2 flex items-baseline gap-2">
                                    <span class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">${targetRows.length < 10 ? '0' + targetRows.length : targetRows.length}</span>
                                    <span class="text-xs text-slate-400 font-medium">nhiệm vụ phân công</span>
                                </div>

                                <!-- Mini Workload 7 Bars -->
                                <div class="my-2">
                                    <div class="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                                        <span>Mật độ công tác tuần này</span>
                                        <span class="text-emerald-400 font-semibold">T2 - CN</span>
                                    </div>
                                    <div class="flex items-end justify-between gap-1 h-12 pt-1">
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/80 rounded-t h-9"></div><span class="text-[8px] text-slate-500">T2</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/40 rounded-t h-4"></div><span class="text-[8px] text-slate-500">T3</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/50 rounded-t h-5"></div><span class="text-[8px] text-slate-500">T4</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/70 rounded-t h-8"></div><span class="text-[8px] text-slate-500">T5</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/50 rounded-t h-5"></div><span class="text-[8px] text-slate-500">T6</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-amber-400 shadow-md shadow-amber-400/30 rounded-t h-11"></div><span class="text-[8px] text-amber-300 font-black">T7</span></div>
                                        <div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-emerald-500/30 rounded-t h-3"></div><span class="text-[8px] text-slate-500">CN</span></div>
                                    </div>
                                </div>

                                <!-- Duty Leader Pill -->
                                <div class="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-[10px] shrink-0">BGH</div>
                                    <div class="min-w-0">
                                        <div class="text-[9px] text-amber-400 font-bold uppercase">Trực Ban Ngày</div>
                                        <div class="text-xs font-bold text-white truncate">${dutyLeader}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. LATEST NOTICE CAPSULE -->
                            <div class="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-[#161a24] to-[#12141d] border border-white/10 flex flex-col justify-between gap-2 shadow-xl shrink-0">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg text-lime-400">✨</span>
                                    <span class="text-[10px] font-black uppercase tracking-wider text-lime-400">Thông Báo Mới Nhất</span>
                                </div>
                                <h6 class="text-xs font-bold text-white hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                                    ${latestNotice.title}
                                </h6>
                                <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                                    <button type="button" onclick="SchoolNewsEngine.switchTab('general')" class="text-slate-400 hover:text-white font-semibold">Tất cả thông báo</button>
                                    <a href="${latestNotice.link}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 font-bold hover:underline flex items-center gap-0.5">
                                        <span>Đọc ngay</span>
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>`;
        },

        // =========================================================================
        // TAB 2: LỊCH TUẦN - ACCORDION TỪNG THỨ (1 MÀN HÌNH GỌN GÀNG)
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
            let weekSelectorHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">';
            weeks.forEach((w, idx) => {
                const isActive = (idx === this.selectedWeekIdx);
                weekSelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setWeekIdx(${idx})"
                            class="shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}">
                        ${w.isLatest ? '🌟 ' : ''}Tuần ${w.weekNum} ${w.isLatest ? '(Mới)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            // Group rows by Day
            const groupedDays = new Map();
            rows.forEach(r => {
                const dayName = r.day || 'Thông Tin Khác';
                if (!groupedDays.has(dayName)) {
                    groupedDays.set(dayName, []);
                }
                groupedDays.get(dayName).push(r);
            });

            // Accordion rows
            let accordionHtml = '<div class="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar">';
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
                const escapedDayKey = dayKey.replace(/'/g, "\\'");

                accordionHtml += `
                    <div class="rounded-2xl border transition-all overflow-hidden ${isToday ? 'border-amber-500/40 bg-[#12141e]/90 shadow-md shadow-amber-500/5' : 'border-white/10 bg-[#0e1017]/80 hover:border-white/20'}">
                        
                        <!-- ACCORDION HEADER BUTTON -->
                        <button type="button" onclick="SchoolNewsEngine.toggleDayAccordion('${escapedDayKey}')"
                                class="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer select-none ${isExpanded ? 'bg-white/[0.04]' : ''}">
                            <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
                                <span class="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                                    <span>📅</span> <span>${dayKey}</span>
                                </span>
                                ${isToday ? `
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Hôm Nay
                                    </span>` : ''}
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                                    ${tasks.length} việc
                                </span>
                                ${onDutyLeader ? `
                                    <span class="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/20">
                                        🛡️ Trực: ${onDutyLeader}
                                    </span>` : ''}
                            </div>

                            <!-- Arrow -->
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                                    ${isExpanded ? 'Thu gọn' : 'Chi tiết'}
                                </span>
                                <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-amber-500/20 text-amber-400' : ''}">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </button>

                        <!-- ACCORDION BODY (EXPANDABLE) -->
                        ${isExpanded ? `
                            <div class="px-3.5 py-2.5 sm:px-4 sm:py-3 pt-1 border-t border-white/5 space-y-2 animate-fadeIn bg-black/20">
                                ${onDutyLeader ? `
                                    <div class="md:hidden py-1 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                                        <span>🛡️</span> <span>Trực ban: ${onDutyLeader}</span>
                                    </div>` : ''}

                                <div class="grid grid-cols-1 gap-2">
                                    ${visibleTasks.map((t, tIdx) => {
                                        if (!t.content && !t.assignee) return '';
                                        const timeMatch = t.content ? t.content.match(/(\d{1,2}[gh:]\d{2})/i) : null;
                                        const cleanText = t.content ? t.content.replace(/^[-–—]\s*/, '').replace(/^\d{1,2}[gh:]\d{2}\s*[:\-–]\s*/i, '') : '';
                                        const timeLabel = timeMatch ? timeMatch[1] : `Mục ${tIdx + 1}`;

                                        return `
                                            <div class="p-2.5 rounded-xl bg-[#090a10] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-1.5">
                                                <div class="flex items-start gap-2">
                                                    <span class="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-black text-[10px] shrink-0 mt-0.5">
                                                        ⏰ ${timeLabel}
                                                    </span>
                                                    <div class="text-xs text-slate-100 font-medium leading-relaxed">
                                                        ${cleanText || t.content}
                                                    </div>
                                                </div>
                                                <div class="flex flex-wrap items-center gap-1.5 pl-7 text-[11px]">
                                                    ${t.assignee ? `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold text-[10px]">👥 ${t.assignee}</span>` : ''}
                                                    ${t.location ? `<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold text-[10px]">📍 ${t.location}</span>` : ''}
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
                        <p class="mt-2 text-xs font-semibold">Không tìm thấy công tác phù hợp với từ khóa "${this.searchQuery}"</p>
                    </div>`;
            }
            accordionHtml += '</div>';

            container.innerHTML = `
                <div class="h-full flex flex-col justify-between gap-2.5">
                    
                    <!-- Top Toolbar: Week Selector & Search & Expand/Collapse -->
                    <div class="p-2.5 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                        ${weekSelectorHtml}

                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <div class="relative flex-1 sm:w-56">
                                <span class="absolute inset-y-0 left-2.5 flex items-center text-slate-400 text-xs">🔍</span>
                                <input type="text" value="${this.searchQuery}" oninput="SchoolNewsEngine.setSearchQuery(this.value)"
                                       placeholder="Lọc công tác, giáo viên..."
                                       class="w-full pl-7 pr-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50">
                            </div>
                            <button type="button" onclick="SchoolNewsEngine.expandAllDays()"
                                    class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 transition-all shrink-0">
                                📂 Mở hết
                            </button>
                            <button type="button" onclick="SchoolNewsEngine.collapseAllDays()"
                                    class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 transition-all shrink-0">
                                📁 Thu gọn
                            </button>
                        </div>
                    </div>

                    <!-- Accordion Days List -->
                    ${accordionHtml}
                </div>`;
        },

        // =========================================================================
        // TAB 3: THỰC ĐƠN BÁN TRÚ - XEM ẢNH HD & TẢI FILE PDF (1 MÀN HÌNH)
        // =========================================================================
        renderTabMeals: function() {
            const container = document.getElementById('schoolNewsContentArea');
            if (!container) return;

            const mealsWeeks = (this.data && this.data.mealsWeeks) || [];
            if (mealsWeeks.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-slate-400">
                        <span class="text-4xl">🍱</span>
                        <p class="mt-2 text-sm">Chưa có dữ liệu thực đơn bán trú. Vui lòng bấm làm mới.</p>
                    </div>`;
                return;
            }

            const currentMeal = mealsWeeks[this.selectedWeekIdx] || mealsWeeks[0];
            const pdfFileUrl = currentMeal.localPdfUrl || 'data/pdf/thuc_don_latest.pdf';
            const imgUrl = currentMeal.imageUrl || `data/pdf/thuc_don_tuan_${currentMeal.weekNum}.png` || 'data/pdf/thuc_don_latest.png';
            const dailyDishes = currentMeal.dailyDishes || {};

            // Week Selector
            let weekSelectorHtml = '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">';
            mealsWeeks.forEach((w, idx) => {
                const isActive = (idx === this.selectedWeekIdx);
                weekSelectorHtml += `
                    <button type="button" onclick="SchoolNewsEngine.setWeekIdx(${idx})"
                            class="shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-red-500 text-white shadow-md shadow-red-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}">
                        Tuần ${w.weekNum} ${w.isLatest ? '(Mới)' : ''}
                    </button>`;
            });
            weekSelectorHtml += '</div>';

            container.innerHTML = `
                <div class="h-full flex flex-col justify-between gap-3">
                    
                    <!-- Action Header Bar -->
                    <div class="p-3 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                        <div class="flex items-center gap-2">
                            ${weekSelectorHtml}
                            <span class="text-xs text-slate-400 truncate hidden sm:inline">• Bán trú THPT Trần Văn Giàu</span>
                        </div>
                        <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                            <a href="${imgUrl}" target="_blank" rel="noopener noreferrer"
                               class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>🔍 Phóng To Ảnh ↗</span>
                            </a>
                            <a href="${pdfFileUrl}" download="Thuc_Don_Tuan_${currentMeal.weekNum}.pdf"
                                class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all">
                                <span>📥 Tải File PDF</span>
                            </a>
                        </div>
                    </div>

                    <!-- Menu Image Display (Fitted to viewport height) -->
                    <div class="flex-1 min-h-0 rounded-3xl overflow-hidden border border-white/10 bg-[#090a10] flex flex-col items-center justify-center p-2 sm:p-3 relative shadow-2xl">
                        <img src="${imgUrl}" 
                             alt="Thực đơn bán trú tuần ${currentMeal.weekNum}"
                             class="max-w-full max-h-[56vh] object-contain rounded-2xl shadow-2xl border border-white/10 cursor-pointer hover:brightness-105 transition-all"
                             onclick="window.open(this.src, '_blank')"
                             onerror="this.onerror=null; this.src='data/pdf/thuc_don_latest.png';"
                             title="Bấm vào ảnh để mở xem phóng to toàn màn hình">
                        <p class="text-[10px] text-slate-400 mt-2 flex items-center gap-1 shrink-0">
                            <span>💡</span> <span>Bấm vào ảnh để phóng to toàn màn hình rõ nét nhất</span>
                        </p>
                    </div>

                </div>`;
        },

        // =========================================================================
        // TAB 4: THÔNG BÁO CHUNG - BENTO GRID (1 MÀN HÌNH GỌN GÀNG)
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

            let cardsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar">';
            notices.forEach((n, idx) => {
                cardsHtml += `
                    <div class="p-3.5 rounded-2xl border bg-[#11131c] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-2">
                        <div>
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${n.isNew ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}">
                                    ${n.isNew ? '🔥 Mới cập nhật' : 'Văn bản BGH'}
                                </span>
                                <span class="text-[10px] text-slate-500 font-bold">#${idx + 1}</span>
                            </div>
                            <h5 class="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 hover:text-sky-300 transition-colors">
                                ${n.title}
                            </h5>
                        </div>
                        <div class="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                            <span class="text-slate-400">THPT Trần Văn Giàu</span>
                            <a href="${n.link}" target="_blank" rel="noopener noreferrer"
                               class="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-0.5 transition-colors">
                                <span>Đọc chi tiết</span>
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                        </div>
                    </div>`;
            });
            cardsHtml += '</div>';

            container.innerHTML = `
                <div class="h-full flex flex-col justify-between gap-2.5">
                    <div class="flex items-center justify-between pb-1 shrink-0">
                        <span class="text-xs text-slate-400">Danh sách các văn bản điều hành, kế hoạch năm học mới nhất</span>
                        <a href="https://thpttranvangiau.hcm.edu.vn/thong-bao/c/42154" target="_blank" rel="noopener noreferrer"
                           class="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                            <span>Mở trang gốc trường</span>
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
