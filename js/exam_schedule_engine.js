/**
 * Aseta — Final HK1 Exam Schedule & Syllabus Engine (THPT Trần Văn Giàu)
 * Chức năng chuyên biệt: Lịch Thi Cuối HK1, Đếm Ngược Real-time, Mốc Chuẩn Bị
 * & Kho Đề Cương Chính Thức 14 Môn (tự động đồng bộ từ website THPT Trần Văn Giàu)
 */
(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_exam_hk1_cache_v1';

    const ExamScheduleEngine = {
        data: null,
        selectedGrade: '11', // '11' | '10' | '12'
        selectedGroup: 'all', // 'all' | 'Tự nhiên & Cốt lõi' | ...
        searchQuery: '',
        expandedSubjectId: null,
        countdownTimer: null,
        isLoading: false,

        init: function() {
            this.loadCache();
            setTimeout(() => this.fetchData(false), 250);
            // Poll every 2 minutes for real-time schedule updates
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
                        window.SecurityGuard.showSecurityToast('🔄 Đã đồng bộ Lịch Thi & Đề Cương HK1 mới nhất từ THPT Trần Văn Giàu!');
                    }
                    const container = document.getElementById('examScheduleContainer');
                    if (container && !document.getElementById('examScheduleView')?.classList.contains('hidden')) {
                        this.render('examScheduleContainer');
                    }
                    // Also refresh dashboard countdown pill if present
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
                const dEl = document.getElementById('hk1CdDays');
                const hEl = document.getElementById('hk1CdHours');
                const mEl = document.getElementById('hk1CdMins');
                const sEl = document.getElementById('hk1CdSecs');
                if (dEl) dEl.textContent = String(c.days).padStart(2, '0');
                if (hEl) hEl.textContent = String(c.hours).padStart(2, '0');
                if (mEl) mEl.textContent = String(c.mins).padStart(2, '0');
                if (sEl) sEl.textContent = String(c.secs).padStart(2, '0');
            };
            tick();
            this.countdownTimer = setInterval(tick, 1000);
        },

        setGrade: function(g) {
            this.selectedGrade = g;
            this.render('examScheduleContainer');
        },

        setGroup: function(grp) {
            this.selectedGroup = grp;
            this.render('examScheduleContainer');
        },

        setSearch: function(val) {
            this.searchQuery = (val || '').trim();
            this.renderSubjectsGridOnly();
        },

        toggleExpandSubject: function(id) {
            this.expandedSubjectId = (this.expandedSubjectId === id) ? null : id;
            this.renderSubjectsGridOnly();
        },

        getSubjectLinkForGrade: function(subj, grade) {
            const links = subj.links || {};
            if (links[grade]) return links[grade];
            if (links.all) return links.all;
            const firstKey = Object.keys(links)[0];
            return firstKey ? links[firstKey] : null;
        },

        renderSubjectsGridOnly: function() {
            const grid = document.getElementById('hk1SubjectsGrid');
            if (!grid || !this.data) return;

            const q = this.searchQuery.toLowerCase();
            const list = (this.data.subjects || []).filter(s => {
                const matchGroup = this.selectedGroup === 'all' || s.group.toLowerCase().includes(this.selectedGroup.toLowerCase());
                const matchQ = !q || s.name.toLowerCase().includes(q) || (s.grade11Scope || []).some(line => line.toLowerCase().includes(q));
                return matchGroup && matchQ;
            });

            if (list.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full py-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 text-slate-400">
                        <span class="text-3xl">🔍</span>
                        <p class="mt-2 text-sm font-semibold">Không tìm thấy môn học phù hợp với "${this.searchQuery}"</p>
                    </div>`;
                return;
            }

            grid.innerHTML = list.map(s => {
                const link = this.getSubjectLinkForGrade(s, this.selectedGrade);
                const isExpanded = this.expandedSubjectId === s.id;
                const scopeItems = (s.grade11Scope || []).map(item => `
                    <li class="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span class="text-cyan-400 mt-0.5 shrink-0">•</span>
                        <span>${item}</span>
                    </li>
                `).join('');

                return `
                    <div class="group rounded-3xl bg-slate-900/75 dark:bg-[#10121b] border border-white/10 hover:border-sky-500/40 p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all duration-200 shadow-lg hover:shadow-sky-500/10">
                        <div class="space-y-3">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md shrink-0 border border-white/15">
                                        ${s.icon}
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-sm sm:text-base font-black text-white tracking-tight truncate">${s.name} ${this.selectedGrade}</h4>
                                        <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">⏱ ${s.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                ${s.inAppFolder ? `
                                    <button type="button" onclick="AzotaApp.openFileExplorer('${s.inAppFolder}')"
                                            class="shrink-0 px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 text-[11px] font-bold border border-sky-500/30 transition-all cursor-pointer"
                                            title="Mở kho đề ôn luyện ${s.name} trên Aseta">
                                        Ôn ngay ➔
                                    </button>
                                ` : ''}
                            </div>

                            <div class="px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-amber-300/95 font-semibold">
                                📋 ${s.format}
                            </div>

                            ${this.selectedGrade === '11' ? `
                                <div class="space-y-1.5">
                                    <ul class="space-y-1.5 ${isExpanded ? '' : 'line-clamp-3'}">
                                        ${scopeItems}
                                    </ul>
                                    ${(s.grade11Scope || []).length > 2 ? `
                                        <button type="button" onclick="ExamScheduleEngine.toggleExpandSubject('${s.id}')"
                                                class="text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer mt-1">
                                            ${isExpanded ? '▲ Thu gọn nội dung' : '▼ Xem đầy đủ giới hạn ôn tập'}
                                        </button>
                                    ` : ''}
                                </div>
                            ` : `
                                <p class="text-xs text-slate-400 leading-relaxed">
                                    Tài liệu giới hạn ôn tập chính thức Khối ${this.selectedGrade} môn ${s.name} năm học ${this.data.academicYear} do Tổ chuyên môn Trường THPT Trần Văn Giàu ban hành.
                                </p>
                            `}
                        </div>

                        <div class="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                            ${link ? `
                                <a href="${link}" target="_blank" rel="noopener noreferrer"
                                   class="flex-1 px-3.5 py-2 rounded-xl bg-gradient-to-r ${s.color} hover:opacity-90 text-white text-xs font-extrabold text-center shadow-md transition-all flex items-center justify-center gap-1.5">
                                    <span>📄 Xem / Tải Đề Cương Khối ${this.selectedGrade}</span>
                                    <span>↗</span>
                                </a>
                            ` : `
                                <span class="flex-1 px-3 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold text-center border border-white/5">
                                    ⏳ Trường đang cập nhật link tải
                                </span>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        },

        render: async function(containerId = 'examScheduleContainer') {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!this.data) {
                container.innerHTML = `
                    <div class="py-16 text-center text-slate-400">
                        <div class="text-4xl animate-bounce">🗓️</div>
                        <p class="mt-3 text-sm font-semibold">Đang đồng bộ Lịch Thi Cuối HK1 từ THPT Trần Văn Giàu...</p>
                    </div>`;
                await this.fetchData(false);
                if (!this.data) return;
            }

            const d = this.data;
            const c = this.getDaysRemaining();
            const groups = [
                { id: 'all', label: 'Tất cả (14 môn)' },
                { id: 'Cốt lõi', label: '⭐ Môn Cốt Lõi' },
                { id: 'Tự nhiên', label: '🔬 Tự Nhiên' },
                { id: 'Xã hội', label: '🌍 Xã Hội' },
                { id: 'Thực hành', label: '⚽ Thực Hành' }
            ];

            // Official timetable banner (shows actual PDF/Image automatically as soon as school publishes it!)
            const officialScheduleBlock = (d.officialScheduleImage || d.officialSchedulePdf) ? `
                <div class="rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-slate-900 border border-emerald-500/30 p-5 space-y-3 shadow-xl">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">✅ ĐÃ CÓ LỊCH THI CHÍNH THỨC</span>
                            <h3 class="text-base sm:text-lg font-black text-white mt-1.5">${d.officialScheduleArticle?.title || 'Lịch Kiểm Tra Cuối Học Kỳ I Chính Thức'}</h3>
                        </div>
                        <div class="flex items-center gap-2">
                            ${d.officialSchedulePdf ? `<a href="${d.officialSchedulePdf}" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md">📥 Tải File PDF Lịch Thi</a>` : ''}
                            ${d.officialScheduleArticle?.link ? `<a href="${d.officialScheduleArticle.link}" target="_blank" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold">Mở Bài Gốc ↗</a>` : ''}
                        </div>
                    </div>
                    ${d.officialScheduleImage ? `
                        <div class="rounded-2xl overflow-hidden border border-white/10 bg-black/50 p-2 flex justify-center">
                            <img src="${d.officialScheduleImage}" alt="Lịch thi cuối HK1 THPT Trần Văn Giàu" class="max-h-[520px] object-contain rounded-xl cursor-pointer" onclick="window.open(this.src,'_blank')">
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="rounded-3xl bg-amber-500/10 border border-amber-500/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl shrink-0">📡</span>
                        <div>
                            <div class="flex flex-wrap items-center gap-2">
                                <h4 class="text-sm font-black text-amber-300">Đang Theo Dõi Tự Động Lịch Ca/Phòng Chi Tiết Từ Web Trường</h4>
                                <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Bot quét 30p/lần</span>
                            </div>
                            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${d.examWindow.statusNote}</p>
                        </div>
                    </div>
                    <a href="${d.sourceArticleUrl}" target="_blank" rel="noopener noreferrer"
                       class="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-extrabold transition-all">
                        Xem Văn Bản Gốc TVG ↗
                    </a>
                </div>
            `;

            const milestonesHtml = (d.milestones || []).map((m, idx) => `
                <div class="relative flex items-start gap-3 p-3.5 rounded-2xl ${m.done ? 'bg-emerald-500/10 border border-emerald-500/25' : 'bg-white/[0.03] border border-white/10'}">
                    <div class="w-8 h-8 rounded-xl ${m.done ? 'bg-emerald-500 text-slate-950' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'} flex items-center justify-center font-black text-xs shrink-0">
                        ${m.done ? '✓' : idx + 1}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-[11px] font-black ${m.done ? 'text-emerald-300' : 'text-amber-300'}">${m.dateLabel}</span>
                            ${m.done ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Đã triển khai</span>' : '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">Sắp tới</span>'}
                        </div>
                        <h5 class="text-xs sm:text-sm font-bold text-white mt-0.5">${m.title}</h5>
                        <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">${m.detail}</p>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- TOP HERO BANNER + LIVE COUNTDOWN -->
                    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#131b35] to-[#1e1035] border border-sky-500/25 p-5 sm:p-7 shadow-2xl">
                        <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>
                        <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

                        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div class="space-y-2.5 max-w-2xl">
                                <div class="flex flex-wrap items-center gap-2">
                                    <button type="button" onclick="AzotaApp.goBack()" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-extrabold border border-white/15 transition-all cursor-pointer">
                                        ← Quay Lại
                                    </button>
                                    <span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                                        🏫 ${d.schoolName}
                                    </span>
                                    <span class="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Đồng bộ: ${d.lastUpdatedText}
                                    </span>
                                </div>
                                <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Lịch Thi & Đề Cương ${d.semester}
                                    <span class="bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">(${d.academicYear})</span>
                                </h2>
                                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    📅 Thời gian kiểm tra tập trung: <strong class="text-amber-300">${d.examWindow.label}</strong>. Tổng hợp trực tiếp từ Cổng thông tin điện tử Trường THPT Trần Văn Giàu kèm trọn bộ 14 file đề cương chính thức.
                                </p>
                                <div class="flex flex-wrap items-center gap-2 pt-1">
                                    <button type="button" onclick="ExamScheduleEngine.fetchData(true)"
                                            class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-2 cursor-pointer transition-all">
                                        <svg id="hk1RefreshIcon" class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                        <span>Kiểm tra lịch mới ngay</span>
                                    </button>
                                    <button type="button" onclick="window.SchoolNewsEngine && window.SchoolNewsEngine.openModal('general')"
                                            class="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-bold border border-sky-500/30 cursor-pointer transition-all">
                                        📢 Mở Cổng Thông Báo TVG
                                    </button>
                                </div>
                            </div>

                            <!-- LIVE COUNTDOWN CARD -->
                            <div class="shrink-0 p-4 sm:p-5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-xl text-center min-w-[270px]">
                                <div class="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2.5">
                                    ⏳ Đếm Ngược Tới Ngày Thi (14/12/2026)
                                </div>
                                <div class="grid grid-cols-4 gap-2">
                                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <div id="hk1CdDays" class="text-xl sm:text-2xl font-black text-white font-mono">${String(c.days).padStart(2, '0')}</div>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Ngày</div>
                                    </div>
                                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <div id="hk1CdHours" class="text-xl sm:text-2xl font-black text-sky-400 font-mono">${String(c.hours).padStart(2, '0')}</div>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Giờ</div>
                                    </div>
                                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <div id="hk1CdMins" class="text-xl sm:text-2xl font-black text-emerald-400 font-mono">${String(c.mins).padStart(2, '0')}</div>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Phút</div>
                                    </div>
                                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <div id="hk1CdSecs" class="text-xl sm:text-2xl font-black text-amber-400 font-mono">${String(c.secs).padStart(2, '0')}</div>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Giây</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- OFFICIAL TIMETABLE / LIVE WATCHER BANNER -->
                    ${officialScheduleBlock}

                    <!-- OFFICIAL MILESTONES TIMELINE -->
                    <div class="space-y-3">
                        <h3 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                            <span>📌</span> <span>Lộ Trình & Các Mốc Quan Trọng Kỳ Thi Cuối HK1</span>
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                            ${milestonesHtml}
                        </div>
                    </div>

                    <!-- SUBJECT SYLLABUS & EXAM FORMAT FILTER BAR -->
                    <div class="space-y-4">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/70 border border-white/10">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="text-xs font-black text-slate-400 mr-1">CHỌN KHỐI:</span>
                                ${['11', '10', '12'].map(g => `
                                    <button type="button" onclick="ExamScheduleEngine.setGrade('${g}')"
                                            class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${this.selectedGrade === g ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'}">
                                        Khối ${g} ${g === '11' ? '(11A7)' : ''}
                                    </button>
                                `).join('')}
                            </div>

                            <div class="relative w-full md:w-72">
                                <input type="text"
                                       value="${this.searchQuery}"
                                       oninput="ExamScheduleEngine.setSearch(this.value)"
                                       placeholder="Tìm môn học hoặc nội dung ôn..."
                                       class="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-sky-500/50 text-xs text-white placeholder-slate-400 outline-none">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                            </div>
                        </div>

                        <!-- Group Filter Chips -->
                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            ${groups.map(gr => `
                                <button type="button" onclick="ExamScheduleEngine.setGroup('${gr.id}')"
                                        class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${this.selectedGroup === gr.id ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'}">
                                    ${gr.label}
                                </button>
                            `).join('')}
                        </div>

                        <!-- 14 Subjects Grid -->
                        <div id="hk1SubjectsGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"></div>
                    </div>
                </div>
            `;

            this.renderSubjectsGridOnly();
            this.startLiveCountdown();
        }
    };

    window.ExamScheduleEngine = ExamScheduleEngine;
    document.addEventListener('DOMContentLoaded', () => {
        ExamScheduleEngine.init();
    });
})(window);
