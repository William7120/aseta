/**
 * Aseta — Ultra-Minimalist HK1 Exam Schedule & Syllabus Engine (THPT Trần Văn Giàu)
 * Triết lý thiết kế:
 *  - Màn hình chính chỉ giữ 2 thứ quan trọng nhất:
 *      1. Đồng hồ đếm ngược Cuối HK1 siêu nổi bật ở trung tâm
 *      2. Danh sách dọc tinh gọn chỉ gồm tên từng môn học
 *  - Bấm vào tên môn → mở trang chi tiết đóng gói đầy đủ (Đề cương PDF + Ôn bài trong Kho Đề + Giới hạn ôn tập)
 *  - Lịch ca thi / Lộ trình / Văn bản gốc gói gọn trong nút phụ ở góc trên, không làm rối màn hình chính.
 */
(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_exam_hk1_cache_v1';

    const ExamScheduleEngine = {
        data: null,
        selectedGrade: '11',       // '11' | '10' | '12'
        selectedSubjectId: null,   // null = main list, string = packaged subject detail view
        showTimelineView: false,   // true = optional clean timeline/official schedule subview
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
                        window.SecurityGuard.showSecurityToast('🔄 Đã đồng bộ Lịch Thi HK1 mới nhất!');
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
            el.textContent = c.started ? 'Đang thi HK1' : `Còn ${c.days} ngày`;
        },

        startLiveCountdown: function() {
            if (this.countdownTimer) clearInterval(this.countdownTimer);
            const tick = () => {
                const c = this.getDaysRemaining();
                const dEl = document.getElementById('hk1HeroDays');
                const hEl = document.getElementById('hk1HeroHours');
                const mEl = document.getElementById('hk1HeroMins');
                const sEl = document.getElementById('hk1HeroSecs');
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

        openSubject: function(id) {
            this.selectedSubjectId = id;
            this.showTimelineView = false;
            this.render('examScheduleContainer');
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
        },

        closeSubject: function() {
            this.selectedSubjectId = null;
            this.showTimelineView = false;
            this.render('examScheduleContainer');
        },

        openTimeline: function() {
            this.selectedSubjectId = null;
            this.showTimelineView = true;
            this.render('examScheduleContainer');
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
        },

        getSubjectLinkForGrade: function(subj, grade) {
            const links = subj.links || {};
            if (links[grade]) return links[grade];
            if (links.all) return links.all;
            const firstKey = Object.keys(links)[0];
            return firstKey ? links[firstKey] : null;
        },

        renderSubjectDetailView: function(d, subj) {
            const link = this.getSubjectLinkForGrade(subj, this.selectedGrade);
            const hasScope = this.selectedGrade === '11' && Array.isArray(subj.grade11Scope) && subj.grade11Scope.length > 0;
            const scopeItems = hasScope
                ? subj.grade11Scope.map(item => `
                    <li class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        <span class="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                        <span>${item}</span>
                    </li>
                  `).join('')
                : `
                    <li class="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Mở file Đề Cương chính thức Khối ${this.selectedGrade} môn ${subj.name} để xem đầy đủ nội dung giới hạn kiến thức.
                    </li>
                  `;

            return `
                <div class="max-w-2xl mx-auto space-y-5 bento-card-enter">
                    <!-- Top Back Bar -->
                    <div class="flex items-center justify-between gap-3">
                        <button type="button" onclick="ExamScheduleEngine.closeSubject()"
                                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-extrabold text-slate-800 dark:text-white transition-all cursor-pointer">
                            <span>←</span>
                            <span>Danh sách môn</span>
                        </button>

                        <div class="inline-flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10">
                            ${['11', '10', '12'].map(g => `
                                <button type="button" onclick="ExamScheduleEngine.setGrade('${g}')"
                                        class="px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${this.selectedGrade === g ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    K${g}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Packaged Subject Card -->
                    <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-sm">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-3xl shrink-0">
                                ${subj.icon}
                            </div>
                            <div class="min-w-0">
                                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    ${subj.name} ${this.selectedGrade}
                                </h2>
                                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    ⏱ ${subj.duration} • ${subj.format}
                                </p>
                            </div>
                        </div>

                        <!-- Primary Actions (Đề cương + Đề ôn) -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${link ? `
                                <a href="${link}" target="_blank" rel="noopener noreferrer"
                                   class="py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md">
                                    <span>📄 Mở Đề Cương PDF</span>
                                    <span>↗</span>
                                </a>
                            ` : `
                                <div class="py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-400 text-xs sm:text-sm font-bold text-center border border-slate-200/70 dark:border-white/10">
                                    ⏳ Đang cập nhật file đề cương
                                </div>
                            `}

                            ${subj.inAppFolder ? `
                                <button type="button" onclick="AzotaApp.openFileExplorer('${subj.inAppFolder}')"
                                        class="py-3.5 px-5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer">
                                    <span>📚 Làm Đề Ôn ${subj.name}</span>
                                    <span>➔</span>
                                </button>
                            ` : `
                                <button type="button" onclick="AzotaApp.openFileExplorer('root')"
                                        class="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                                    <span>📚 Mở Kho Đề Chung</span>
                                    <span>➔</span>
                                </button>
                            `}
                        </div>

                        <!-- Scope Section -->
                        <div class="space-y-3 pt-2 border-t border-slate-200/70 dark:border-white/10">
                            <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                Nội dung trọng tâm cần ôn
                            </p>
                            <ul class="space-y-2">
                                ${scopeItems}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        },

        renderTimelineSubView: function(d) {
            const officialScheduleBlock = (d.officialScheduleImage || d.officialSchedulePdf) ? `
                <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-emerald-500/30 p-5 space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h3 class="text-sm font-black text-emerald-500">✓ Lịch thi chính thức</h3>
                        ${d.officialSchedulePdf ? `<a href="${d.officialSchedulePdf}" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black">Tải PDF ↗</a>` : ''}
                    </div>
                    ${d.officialScheduleImage ? `<img src="${d.officialScheduleImage}" alt="Lịch thi HK1" class="w-full max-h-[500px] object-contain rounded-2xl cursor-pointer" onclick="window.open(this.src,'_blank')">` : ''}
                </div>
            ` : '';

            const milestonesHtml = (d.milestones || []).map((m, idx, arr) => `
                <div class="relative flex gap-4 ${idx < arr.length - 1 ? 'pb-5' : ''}">
                    ${idx < arr.length - 1 ? `<div class="absolute left-[13px] top-7 bottom-0 w-px ${m.done ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-white/10'}"></div>` : ''}
                    <div class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${m.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300'}">
                        ${m.done ? '✓' : idx + 1}
                    </div>
                    <div class="min-w-0 flex-1 pt-0.5">
                        <span class="text-xs font-black font-mono ${m.done ? 'text-emerald-500' : 'text-amber-500'}">${m.dateLabel}</span>
                        <h5 class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${m.title}</h5>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${m.detail}</p>
                    </div>
                </div>
            `).join('');

            return `
                <div class="max-w-2xl mx-auto space-y-5 bento-card-enter">
                    <div class="flex items-center justify-between gap-3">
                        <button type="button" onclick="ExamScheduleEngine.closeSubject()"
                                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-extrabold text-slate-800 dark:text-white transition-all cursor-pointer">
                            <span>←</span>
                            <span>Quay lại Lịch Thi</span>
                        </button>
                        <a href="${d.sourceArticleUrl}" target="_blank" rel="noopener noreferrer"
                           class="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-sky-500 hover:text-sky-400">
                            Văn bản gốc TVG ↗
                        </a>
                    </div>

                    ${officialScheduleBlock}

                    <div class="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-6 space-y-5">
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-black text-slate-900 dark:text-white">Lộ Trình Kỳ Thi HK1</h3>
                            <button type="button" onclick="ExamScheduleEngine.fetchData(true)"
                                    class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                                <svg id="hk1RefreshIcon" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                <span>Đồng bộ</span>
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
                        <p class="mt-2 text-xs font-semibold">Đang tải Lịch Thi Cuối HK1...</p>
                    </div>`;
                await this.fetchData(false);
                if (!this.data) return;
            }

            const d = this.data;

            // Sub-view 1: Packaged Subject Detail
            if (this.selectedSubjectId) {
                const subj = (d.subjects || []).find(s => s.id === this.selectedSubjectId);
                if (subj) {
                    container.innerHTML = this.renderSubjectDetailView(d, subj);
                    return;
                }
                this.selectedSubjectId = null;
            }

            // Sub-view 2: Optional Timeline & Official Schedule
            if (this.showTimelineView) {
                container.innerHTML = this.renderTimelineSubView(d);
                return;
            }

            // MAIN CLEAN VIEW: Prominent Live Countdown + Clean Vertical Subject Name List
            const c = this.getDaysRemaining();
            const subjects = d.subjects || [];

            const verticalSubjectRows = subjects.map((s, idx) => `
                <button type="button" onclick="ExamScheduleEngine.openSubject('${s.id}')"
                        style="animation-delay: ${Math.min(idx * 25, 250)}ms"
                        class="bento-card-enter w-full group flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white dark:bg-[#0e1017] hover:bg-slate-50 dark:hover:bg-[#151824] border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500/40 transition-all duration-200 cursor-pointer text-left">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <span class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                            ${s.icon}
                        </span>
                        <span class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                            ${s.name}
                        </span>
                    </div>
                    <span class="text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 transition-all text-base font-bold shrink-0">
                        →
                    </span>
                </button>
            `).join('');

            container.innerHTML = `
                <div class="max-w-3xl mx-auto space-y-6">
                    <!-- Minimal Top Utility Bar -->
                    <div class="flex items-center justify-between gap-3">
                        <button type="button" onclick="AzotaApp.goBack()"
                                class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
                            ← Quay lại
                        </button>

                        <div class="flex items-center gap-2">
                            <!-- Compact Grade Switch -->
                            <div class="inline-flex p-0.5 rounded-xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10">
                                ${['11', '10', '12'].map(g => `
                                    <button type="button" onclick="ExamScheduleEngine.setGrade('${g}')"
                                            class="px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${this.selectedGrade === g ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                        K${g}
                                    </button>
                                `).join('')}
                            </div>

                            <button type="button" onclick="ExamScheduleEngine.openTimeline()"
                                    class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
                                🗓️ Lộ trình
                            </button>
                        </div>
                    </div>

                    <!-- HERO PROMINENT COUNTDOWN (THE FOCAL POINT) -->
                    <div class="bento-card-enter relative overflow-hidden rounded-3xl bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 p-7 sm:p-10 text-center shadow-2xl border border-slate-800 dark:border-white/40">
                        <div class="bento-hatch-overlay"></div>

                        <div class="relative z-10 space-y-5">
                            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 dark:bg-slate-950/10 text-[11px] font-black uppercase tracking-widest">
                                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                <span>Đếm Ngược Kỳ Thi Cuối HK1</span>
                            </div>

                            <div class="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl mx-auto">
                                <div class="py-4 sm:py-5 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10">
                                    <div id="hk1HeroDays" class="text-3xl sm:text-5xl font-black font-mono tracking-tight leading-none">${String(c.days).padStart(2, '0')}</div>
                                    <div class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-55 mt-2">Ngày</div>
                                </div>
                                <div class="py-4 sm:py-5 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10">
                                    <div id="hk1HeroHours" class="text-3xl sm:text-5xl font-black font-mono tracking-tight leading-none">${String(c.hours).padStart(2, '0')}</div>
                                    <div class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-55 mt-2">Giờ</div>
                                </div>
                                <div class="py-4 sm:py-5 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10">
                                    <div id="hk1HeroMins" class="text-3xl sm:text-5xl font-black font-mono tracking-tight leading-none">${String(c.mins).padStart(2, '0')}</div>
                                    <div class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-55 mt-2">Phút</div>
                                </div>
                                <div class="py-4 sm:py-5 px-2 rounded-2xl bg-amber-500/20 dark:bg-slate-950 text-amber-300 dark:text-amber-400 border border-amber-400/30 dark:border-slate-950">
                                    <div id="hk1HeroSecs" class="text-3xl sm:text-5xl font-black font-mono tracking-tight leading-none">${String(c.secs).padStart(2, '0')}</div>
                                    <div class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-80 mt-2">Giây</div>
                                </div>
                            </div>

                            <p class="text-xs sm:text-sm font-bold opacity-65">
                                14/12 – 22/12/2026 • Khối ${this.selectedGrade} • THPT Trần Văn Giàu
                            </p>
                        </div>
                    </div>

                    <!-- CLEAN VERTICAL LIST OF SUBJECT NAMES ONLY -->
                    <div class="space-y-2.5">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                Chọn môn để xem đề cương & đề ôn
                            </span>
                            <span class="text-[11px] font-bold text-slate-400">${subjects.length} môn</span>
                        </div>
                        <div id="hk1SubjectsList" class="space-y-2">
                            ${verticalSubjectRows}
                        </div>
                    </div>
                </div>
            `;

            this.startLiveCountdown();
        }
    };

    window.ExamScheduleEngine = ExamScheduleEngine;
    document.addEventListener('DOMContentLoaded', () => {
        ExamScheduleEngine.init();
    });
})(window);
