/**
 * Aseta — Final HK1 Exam Schedule & Syllabus Engine (THPT Trần Văn Giàu)
 * Giao diện tối giản kiểu Editorial Bento — 2 Tab rõ ràng:
 *   1. Đề Cương & Giới Hạn (14 môn — danh sách gọn gàng, bấm để mở rộng chi tiết)
 *   2. Lịch Ca Thi & Lộ Trình (Timeline dọc tinh gọn + đồng bộ file lịch thi chính thức)
 */
(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_exam_hk1_cache_v1';

    const ExamScheduleEngine = {
        data: null,
        activeTab: 'syllabus', // 'syllabus' | 'timeline'
        selectedGrade: '11',   // '11' | '10' | '12'
        selectedGroup: 'all',  // 'all' | 'Cốt lõi' | 'Tự nhiên' | 'Xã hội' | 'Thực hành'
        searchQuery: '',
        expandedSubjectId: null,
        countdownTimer: null,
        isLoading: false,

        init: function() {
            this.loadCache();
            setTimeout(() => this.fetchData(false), 250);
            if (this._pollTimer) clearInterval(this._pollTimer);
            this._pollTimer = setInterval(() => this.fetchData(false), 120 * 1000);
        },

        loadCache: function() {
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.data) this.data = parsed.data;
                }
            } catch (_) {}
        },

        fetchData: async function(force = false) {
            if (this.isLoading) return;
            this.isLoading = true;
            this.updateSyncUI(true);
            try {
                const t = Date.now();
                let json = null;
                try {
                    const res = await fetch(`data/exam_hk1_schedule.json?_t=${t}`, {
                        cache: 'no-store',
                        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
                    });
                    if (res.ok) json = await res.json();
                } catch (_) {}

                if (force || !json || window.location.hostname.includes('github.io')) {
                    try {
                        const ghRes = await fetch(`https://raw.githubusercontent.com/William7120/aseta/main/data/exam_hk1_schedule.json?_t=${t}`, { cache: 'no-store' });
                        if (ghRes.ok) {
                            const ghJson = await ghRes.json();
                            if (!json || (ghJson.lastUpdated && (!json.lastUpdated || new Date(ghJson.lastUpdated) > new Date(json.lastUpdated)))) {
                                json = ghJson;
                            }
                        }
                    } catch (_) {}
                }

                if (json) {
                    this.data = json;
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: json, ts: Date.now() }));
                    if (force && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                        window.SecurityGuard.showSecurityToast('🔄 Đã đồng bộ Lịch Thi & Đề Cương HK1 mới nhất!');
                    }
                    const container = document.getElementById('examScheduleContainer');
                    if (container && !document.getElementById('examScheduleView')?.classList.contains('hidden')) {
                        this.render('examScheduleContainer');
                    }
                    this.updateDashboardBadge();
                }
            } catch (e) {
                console.warn('[ExamScheduleEngine] Fetch warning:', e);
            } finally {
                this.isLoading = false;
                this.updateSyncUI(false);
            }
        },

        updateSyncUI: function(spinning) {
            const ic = document.getElementById('hk1RefreshIcon');
            if (ic) {
                if (spinning) ic.classList.add('animate-spin');
                else ic.classList.remove('animate-spin');
            }
        },

        getDaysRemaining: function() {
            const startStr = this.data?.examWindow?.startDate || '2026-12-14';
            const target = new Date(`${startStr}T07:30:00+07:00`).getTime();
            const now = Date.now();
            const diff = target - now;
            if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, started: true };
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);
            return { days, hours, mins, secs, started: false };
        },

        updateDashboardBadge: function() {
            const el = document.getElementById('dashboardHk1Countdown');
            if (!el) return;
            const c = this.getDaysRemaining();
            el.textContent = c.started ? 'Đang trong đợt thi HK1' : `Còn ${c.days} ngày`;
        },

        startLiveCountdown: function() {
            if (this.countdownTimer) clearInterval(this.countdownTimer);
            const tick = () => {
                const c = this.getDaysRemaining();
                const clockEl = document.getElementById('hk1LiveClockText');
                if (clockEl) {
                    clockEl.textContent = c.started
                        ? 'ĐANG TRONG ĐỢT THI'
                        : `${String(c.days).padStart(2, '0')}d : ${String(c.hours).padStart(2, '0')}h : ${String(c.mins).padStart(2, '0')}m : ${String(c.secs).padStart(2, '0')}s`;
                }
            };
            tick();
            this.countdownTimer = setInterval(tick, 1000);
        },

        setTab: function(tab) {
            this.activeTab = tab === 'timeline' ? 'timeline' : 'syllabus';
            this.render('examScheduleContainer');
        },

        setGrade: function(g) {
            this.selectedGrade = g;
            this.expandedSubjectId = null;
            this.render('examScheduleContainer');
        },

        setGroup: function(grp) {
            this.selectedGroup = grp;
            this.render('examScheduleContainer');
        },

        setSearch: function(val) {
            this.searchQuery = (val || '').trim();
            this.renderSubjectsListOnly();
        },

        toggleExpandSubject: function(id) {
            this.expandedSubjectId = (this.expandedSubjectId === id) ? null : id;
            this.renderSubjectsListOnly();
        },

        getSubjectLinkForGrade: function(subj, grade) {
            const links = subj.links || {};
            if (links[grade]) return links[grade];
            if (links.all) return links.all;
            const firstKey = Object.keys(links)[0];
            return firstKey ? links[firstKey] : null;
        },

        renderSubjectsListOnly: function() {
            const listEl = document.getElementById('hk1SubjectsGrid');
            const countEl = document.getElementById('hk1MatchCount');
            if (!listEl || !this.data) return;

            const q = this.searchQuery.toLowerCase();
            const list = (this.data.subjects || []).filter(s => {
                const matchGroup = this.selectedGroup === 'all' || (s.group || '').toLowerCase().includes(this.selectedGroup.toLowerCase());
                const matchQ = !q
                    || (s.name || '').toLowerCase().includes(q)
                    || (s.format || '').toLowerCase().includes(q)
                    || (s.grade11Scope || []).some(line => line.toLowerCase().includes(q));
                return matchGroup && matchQ;
            });

            if (countEl) countEl.textContent = `${list.length} môn`;

            if (list.length === 0) {
                listEl.innerHTML = `
                    <div class="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 text-slate-400">
                        <p class="text-sm font-bold">Không tìm thấy môn phù hợp với "${this.searchQuery}"</p>
                    </div>`;
                return;
            }

            listEl.innerHTML = list.map(s => {
                const link = this.getSubjectLinkForGrade(s, this.selectedGrade);
                const isExpanded = this.expandedSubjectId === s.id;
                const hasScope = this.selectedGrade === '11' && Array.isArray(s.grade11Scope) && s.grade11Scope.length > 0;
                const scopeItems = hasScope
                    ? s.grade11Scope.map(item => `
                        <li class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                            <span>${item}</span>
                        </li>
                      `).join('')
                    : `<li class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Tài liệu giới hạn ôn tập chính thức Khối ${this.selectedGrade} môn ${s.name} (${this.data.academicYear}) do Tổ chuyên môn THPT Trần Văn Giàu ban hành.</li>`;

                return `
                    <div class="rounded-2xl bg-white dark:bg-[#0e1017] border ${isExpanded ? 'border-sky-500/40 shadow-md' : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'} transition-all duration-200 overflow-hidden">
                        <div class="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <!-- Left: Subject Identity (Click to expand/collapse scope) -->
                            <button type="button" onclick="ExamScheduleEngine.toggleExpandSubject('${s.id}')"
                                    class="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group">
                                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                                    ${s.icon}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-2">
                                        <h4 class="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                                            ${s.name} ${this.selectedGrade}
                                        </h4>
                                        <span class="text-[10px] font-bold text-slate-400 shrink-0">• ${s.duration}</span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                        ${s.format}
                                    </p>
                                </div>
                            </button>

                            <!-- Right: Clean Uniform Actions -->
                            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-13 sm:pl-0">
                                <button type="button" onclick="ExamScheduleEngine.toggleExpandSubject('${s.id}')"
                                        class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${isExpanded ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30' : 'bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-transparent'}">
                                    ${isExpanded ? 'Thu gọn ▲' : 'Giới hạn ▾'}
                                </button>

                                ${s.inAppFolder ? `
                                    <button type="button" onclick="AzotaApp.openFileExplorer('${s.inAppFolder}')"
                                            class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-white/[0.04] hover:bg-sky-500/15 text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-300 border border-slate-200/70 dark:border-white/10 transition-colors cursor-pointer"
                                            title="Mở kho đề ${s.name} trên Aseta">
                                        Ôn bài
                                    </button>
                                ` : ''}

                                ${link ? `
                                    <a href="${link}" target="_blank" rel="noopener noreferrer"
                                       class="px-3 py-1.5 rounded-xl text-[11px] font-black bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 transition-colors flex items-center gap-1 shadow-xs">
                                        <span>Đề cương</span>
                                        <span>↗</span>
                                    </a>
                                ` : `
                                    <span class="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.03] text-slate-400">
                                        Đang cập nhật
                                    </span>
                                `}
                            </div>
                        </div>

                        <!-- Expandable Scope Drawer -->
                        ${isExpanded ? `
                            <div class="px-4 pb-4 pt-3 border-t border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
                                <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                    Giới hạn ôn tập chính thức • Khối ${this.selectedGrade}
                                </div>
                                <ul class="space-y-1.5">
                                    ${scopeItems}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        },

        renderTimelineTab: function(d) {
            const officialScheduleBlock = (d.officialScheduleImage || d.officialSchedulePdf) ? `
                <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-emerald-500/35 p-5 space-y-4 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                ✓ Đã có lịch thi chính thức
                            </span>
                            <h3 class="text-base font-black text-slate-900 dark:text-white mt-1.5">
                                ${d.officialScheduleArticle?.title || 'Lịch Kiểm Tra Cuối Học Kỳ I Chính Thức'}
                            </h3>
                        </div>
                        <div class="flex items-center gap-2">
                            ${d.officialSchedulePdf ? `<a href="${d.officialSchedulePdf}" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black">Tải PDF ↗</a>` : ''}
                            ${d.officialScheduleArticle?.link ? `<a href="${d.officialScheduleArticle.link}" target="_blank" class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold">Bài gốc ↗</a>` : ''}
                        </div>
                    </div>
                    ${d.officialScheduleImage ? `
                        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black/40 p-2 flex justify-center">
                            <img src="${d.officialScheduleImage}" alt="Lịch thi cuối HK1 THPT Trần Văn Giàu" class="max-h-[520px] object-contain rounded-xl cursor-pointer" onclick="window.open(this.src,'_blank')">
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span class="text-[10px] font-black uppercase tracking-widest text-amber-500">Chờ lịch ca/phòng chi tiết</span>
                        </div>
                        <h4 class="text-sm font-black text-slate-900 dark:text-white">
                            Tự động đồng bộ từ Web Trường THPT Trần Văn Giàu
                        </h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            ${d.examWindow.statusNote}
                        </p>
                    </div>
                    <a href="${d.sourceArticleUrl}" target="_blank" rel="noopener noreferrer"
                       class="shrink-0 px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black text-center hover:opacity-90 transition-opacity">
                        Văn bản gốc TVG ↗
                    </a>
                </div>
            `;

            const milestonesHtml = (d.milestones || []).map((m, idx, arr) => `
                <div class="relative flex gap-4 ${idx < arr.length - 1 ? 'pb-5' : ''}">
                    ${idx < arr.length - 1 ? `<div class="absolute left-[13px] top-7 bottom-0 w-px ${m.done ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-white/10'}"></div>` : ''}
                    <div class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${m.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/15'}">
                        ${m.done ? '✓' : idx + 1}
                    </div>
                    <div class="min-w-0 flex-1 pt-0.5">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-black font-mono ${m.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">${m.dateLabel}</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${m.done ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'}">
                                ${m.done ? 'Hoàn thành' : 'Sắp tới'}
                            </span>
                        </div>
                        <h5 class="text-sm font-black text-slate-900 dark:text-white mt-1">${m.title}</h5>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${m.detail}</p>
                    </div>
                </div>
            `).join('');

            return `
                <div class="space-y-4">
                    ${officialScheduleBlock}
                    <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6">
                        <div class="flex items-center justify-between gap-2 mb-5">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeline • HK1</p>
                                <h3 class="text-base font-black text-slate-900 dark:text-white mt-0.5">Các Mốc Quan Trọng</h3>
                            </div>
                            <button type="button" onclick="window.SchoolNewsEngine && window.SchoolNewsEngine.openModal('general')"
                                    class="text-xs font-bold text-sky-500 hover:text-sky-400 cursor-pointer">
                                Cổng Thông Báo TVG ↗
                            </button>
                        </div>
                        <div>${milestonesHtml}</div>
                    </div>
                </div>
            `;
        },

        render: async function(containerId = 'examScheduleContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!this.data) {
                container.innerHTML = `
                    <div class="py-16 text-center text-slate-400">
                        <div class="text-3xl animate-pulse">🗓️</div>
                        <p class="mt-2 text-xs font-semibold">Đang đồng bộ Lịch Thi Cuối HK1...</p>
                    </div>`;
                await this.fetchData(false);
                if (!this.data) return;
            }

            const d = this.data;
            const c = this.getDaysRemaining();
            const groups = [
                { id: 'all', label: 'Tất cả' },
                { id: 'Cốt lõi', label: 'Cốt lõi' },
                { id: 'Tự nhiên', label: 'Tự nhiên' },
                { id: 'Xã hội', label: 'Xã hội' },
                { id: 'Thực hành', label: 'Thực hành' }
            ];

            const isSyllabus = this.activeTab === 'syllabus';

            container.innerHTML = `
                <div class="max-w-7xl mx-auto space-y-4">
                    <!-- 1. COMPACT EDITORIAL HEADER + LIVE CLOCK (Bento 6-col) -->
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div class="md:col-span-4 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-sm">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <button type="button" onclick="AzotaApp.goBack()"
                                            class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer">
                                        ← Quay lại
                                    </button>
                                    <span class="text-[11px] font-bold text-slate-400">${d.schoolName}</span>
                                </div>
                                <button type="button" onclick="ExamScheduleEngine.fetchData(true)"
                                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                        title="Kiểm tra cập nhật mới từ web trường">
                                    <svg id="hk1RefreshIcon" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    <span>Làm mới</span>
                                </button>
                            </div>

                            <div>
                                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Lịch Thi & Đề Cương ${d.semester} <span class="text-slate-400 font-bold text-base sm:text-lg">${d.academicYear}</span>
                                </h2>
                                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <span>📅 <strong class="text-slate-800 dark:text-slate-200">14/12 – 22/12/2026</strong></span>
                                    <span>•</span>
                                    <span>${(d.subjects || []).length} môn chính thức</span>
                                    <span>•</span>
                                    <a href="${d.sourceArticleUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-500 hover:text-sky-400 font-bold">
                                        Văn bản trường ↗
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Compact High-Contrast Countdown Tile -->
                        <div class="md:col-span-2 rounded-3xl bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 p-5 sm:p-6 flex flex-col justify-between gap-2 shadow-sm border border-slate-800 dark:border-white/40 relative overflow-hidden">
                            <div class="bento-hatch-overlay"></div>
                            <div class="relative z-10 flex items-center justify-between">
                                <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Đếm ngược HK1</span>
                                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            </div>
                            <div id="hk1LiveClockText" class="relative z-10 text-xl sm:text-2xl font-black font-mono tracking-tight">
                                ${c.started ? 'ĐANG TRONG ĐỢT THI' : `${String(c.days).padStart(2, '0')}d : ${String(c.hours).padStart(2, '0')}h : ${String(c.mins).padStart(2, '0')}m : ${String(c.secs).padStart(2, '0')}s`}
                            </div>
                            <p class="relative z-10 text-[11px] opacity-65 truncate">
                                Bắt đầu 07:30 • Thứ Hai, 14/12/2026
                            </p>
                        </div>
                    </div>

                    <!-- 2. CLEAN 2-TAB NAVIGATION -->
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10">
                            <button type="button" onclick="ExamScheduleEngine.setTab('syllabus')"
                                    class="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${isSyllabus ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                📚 Đề Cương (${(d.subjects || []).length} môn)
                            </button>
                            <button type="button" onclick="ExamScheduleEngine.setTab('timeline')"
                                    class="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${!isSyllabus ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                🗓️ Lịch Ca Thi & Lộ Trình
                            </button>
                        </div>

                        ${isSyllabus ? `
                            <!-- Compact Grade Switcher right next to tabs -->
                            <div class="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10">
                                ${['11', '10', '12'].map(g => `
                                    <button type="button" onclick="ExamScheduleEngine.setGrade('${g}')"
                                            class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${this.selectedGrade === g ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                        Khối ${g}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- 3. TAB CONTENT -->
                    ${isSyllabus ? `
                        <div class="space-y-3">
                            <!-- Single Clean Filter & Search Row -->
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                    ${groups.map(gr => `
                                        <button type="button" onclick="ExamScheduleEngine.setGroup('${gr.id}')"
                                                class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${this.selectedGroup === gr.id ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white border border-transparent dark:border-white/20' : 'bg-white dark:bg-[#0e1017] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10'}">
                                            ${gr.label}
                                        </button>
                                    `).join('')}
                                </div>

                                <div class="flex items-center gap-2 w-full sm:w-auto">
                                    <span id="hk1MatchCount" class="text-[11px] font-bold text-slate-400 shrink-0 hidden sm:inline">${(d.subjects || []).length} môn</span>
                                    <div class="relative flex-1 sm:w-60">
                                        <input type="text"
                                               value="${this.searchQuery}"
                                               oninput="ExamScheduleEngine.setSearch(this.value)"
                                               placeholder="Tìm môn hoặc nội dung..."
                                               class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 focus:border-sky-500/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none">
                                        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Clean 2-Column Accordion List -->
                            <div id="hk1SubjectsGrid" class="grid grid-cols-1 lg:grid-cols-2 items-start gap-2.5"></div>
                        </div>
                    ` : this.renderTimelineTab(d)}
                </div>
            `;

            if (isSyllabus) {
                this.renderSubjectsListOnly();
            }
            this.startLiveCountdown();
        }
    };

    window.ExamScheduleEngine = ExamScheduleEngine;
    document.addEventListener('DOMContentLoaded', () => {
        ExamScheduleEngine.init();
    });
})(window);
