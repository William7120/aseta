/**
 * Aseta — Creative Zero-Scroll HK1 Exam Studio (THPT Trần Văn Giàu)
 * Thiết kế sáng tạo, gọn trong 1 màn hình:
 *  - Hero Đếm Ngược ngang siêu nổi bật (NGÀY : GIỜ : PHÚT : GIÂY to rõ, tiết kiệm chiều dọc)
 *  - PC (Split Studio): Trái = lưới 2×7 thẻ tên gọn thấy hết 14 môn cùng lúc (không cần cuộn) | Phải = khung chi tiết môn cập nhật tức thì khi bấm
 *  - Mobile: Lưới 2 cột 14 môn siêu gọn + Bottom Sheet trượt lên mượt mà khi chạm vào bất kỳ môn nào
 */
(function(window) {
    'use strict';

    const CACHE_KEY = 'aseta_tvg_exam_hk1_cache_v1';

    const ExamScheduleEngine = {
        data: null,
        selectedGrade: '11',       // '11' | '10' | '12'
        selectedSubjectId: 'toan', // default selected subject on PC right pane
        mobileSheetOpen: false,    // mobile slide-up detail sheet
        timelineModalOpen: false,  // clean modal for milestones & official schedule
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
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                this.mobileSheetOpen = true;
            }
            this.updateSelectionUI();
            if (window.AudioHelper && window.AudioHelper.playPlip) {
                try { window.AudioHelper.playPlip(); } catch (_) {}
            }
        },

        closeMobileSheet: function() {
            this.mobileSheetOpen = false;
            const sheet = document.getElementById('hk1MobileSheetOverlay');
            if (sheet) sheet.classList.add('hidden');
        },

        openTimeline: function() {
            this.timelineModalOpen = true;
            const modal = document.getElementById('hk1TimelineModal');
            if (modal) modal.classList.remove('hidden');
        },

        closeTimeline: function() {
            this.timelineModalOpen = false;
            const modal = document.getElementById('hk1TimelineModal');
            if (modal) modal.classList.add('hidden');
        },

        renderSubjectIcon: function(icon, sizeClass = 'w-5 h-5') {
            if (!icon || icon === '🇬🇧' || icon === 'uk-flag') {
                return `<svg class="inline-block ${sizeClass} rounded-full overflow-hidden shrink-0 ring-1 ring-white/20" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>`;
            }
            return icon;
        },

        getSubjectLinkForGrade: function(subj, grade) {
            const links = subj.links || {};
            if (links[grade]) return links[grade];
            if (links.all) return links.all;
            const firstKey = Object.keys(links)[0];
            return firstKey ? links[firstKey] : null;
        },

        buildDetailInnerHtml: function(subj, isSheet = false) {
            if (!subj) return '';
            const link = this.getSubjectLinkForGrade(subj, this.selectedGrade);
            const hasScope = this.selectedGrade === '11' && Array.isArray(subj.grade11Scope) && subj.grade11Scope.length > 0;
            const scopeItems = hasScope
                ? subj.grade11Scope.map(item => `
                    <li class="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                        <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                        <span>${item}</span>
                    </li>
                  `).join('')
                : `
                    <li class="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Mở file Đề Cương PDF Khối ${this.selectedGrade} môn ${subj.name} để xem chi tiết giới hạn kiến thức chính thức.
                    </li>
                  `;

            return `
                <div class="space-y-4 bento-card-enter">
                    <!-- Subject Title Row -->
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3.5 min-w-0">
                            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-2xl shrink-0">
                                ${this.renderSubjectIcon(subj.icon, 'w-7 h-7')}
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                                    ${subj.name} ${this.selectedGrade}
                                </h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                    ⏱ ${subj.duration} • ${subj.format}
                                </p>
                            </div>
                        </div>
                        ${isSheet ? `
                            <button type="button" onclick="ExamScheduleEngine.closeMobileSheet()"
                                    class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer">
                                ✕
                            </button>
                        ` : ''}
                    </div>

                    <!-- Primary Actions -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${link ? `
                            <a href="${link}" target="_blank" rel="noopener noreferrer"
                               class="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm">
                                <span>📄 Mở Đề Cương PDF</span>
                                <span>↗</span>
                            </a>
                        ` : `
                            <div class="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-400 text-xs font-bold text-center border border-slate-200/70 dark:border-white/10">
                                ⏳ Trường đang cập nhật link
                            </div>
                        `}

                        ${subj.inAppFolder ? `
                            <button type="button" onclick="ExamScheduleEngine.closeMobileSheet(); AzotaApp.openFileExplorer('${subj.inAppFolder}')"
                                    class="py-3 px-4 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer">
                                <span>📚 Làm Đề Ôn ${subj.name}</span>
                                <span>➔</span>
                            </button>
                        ` : `
                            <button type="button" onclick="ExamScheduleEngine.closeMobileSheet(); AzotaApp.openFileExplorer('root')"
                                    class="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                                <span>📚 Mở Kho Đề Chung</span>
                                <span>➔</span>
                            </button>
                        `}
                    </div>

                    <!-- Scope List -->
                    <div class="space-y-2 pt-2 border-t border-slate-200/70 dark:border-white/10">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Nội dung trọng tâm cần ôn
                        </p>
                        <ul class="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                            ${scopeItems}
                        </ul>
                    </div>
                </div>
            `;
        },

        updateSelectionUI: function() {
            const subjects = this.data?.subjects || [];
            const subj = subjects.find(s => s.id === this.selectedSubjectId) || subjects[0];
            if (!subj) return;

            // Update active chip styling without re-rendering countdown
            document.querySelectorAll('.hk1-subject-chip').forEach(btn => {
                const isAct = btn.getAttribute('data-subj-id') === subj.id;
                btn.className = `hk1-subject-chip group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                    isAct
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-[#0e1017] hover:bg-slate-50 dark:hover:bg-[#151824] text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500/40'
                }`;
                const arrow = btn.querySelector('.hk1-chip-arrow');
                if (arrow) {
                    arrow.className = `hk1-chip-arrow text-xs font-black transition-transform shrink-0 ${
                        isAct ? 'opacity-90 translate-x-0.5' : 'opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5'
                    }`;
                }
            });

            // Update PC Right Preview Pane
            const pcPane = document.getElementById('hk1DesktopDetailPane');
            if (pcPane) {
                pcPane.innerHTML = this.buildDetailInnerHtml(subj, false);
            }

            // Update & Open Mobile Bottom Sheet if triggered on mobile
            const sheetBody = document.getElementById('hk1MobileSheetBody');
            const sheetOverlay = document.getElementById('hk1MobileSheetOverlay');
            if (sheetBody) {
                sheetBody.innerHTML = this.buildDetailInnerHtml(subj, true);
            }
            if (sheetOverlay && this.mobileSheetOpen) {
                sheetOverlay.classList.remove('hidden');
            }
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
            const c = this.getDaysRemaining();
            const subjects = d.subjects || [];
            if (!subjects.some(s => s.id === this.selectedSubjectId) && subjects.length > 0) {
                this.selectedSubjectId = subjects[0].id;
            }
            const activeSubj = subjects.find(s => s.id === this.selectedSubjectId) || subjects[0];

            const compactGridChips = subjects.map(s => {
                const isAct = s.id === activeSubj?.id;
                return `
                    <button type="button" data-subj-id="${s.id}" onclick="ExamScheduleEngine.openSubject('${s.id}')"
                            class="hk1-subject-chip group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                                isAct
                                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md scale-[1.01]'
                                    : 'bg-white dark:bg-[#0e1017] hover:bg-slate-50 dark:hover:bg-[#151824] text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500/40'
                            }">
                        <span class="flex items-center gap-2.5 min-w-0">
                            <span class="text-base leading-none shrink-0 flex items-center justify-center">${this.renderSubjectIcon(s.icon, 'w-4 h-4')}</span>
                            <span class="text-xs sm:text-[13px] font-extrabold tracking-tight truncate">${s.name}</span>
                        </span>
                        <span class="hk1-chip-arrow text-xs font-black transition-transform shrink-0 ${isAct ? 'opacity-90 translate-x-0.5' : 'opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5'}">→</span>
                    </button>
                `;
            }).join('');

            const milestonesHtml = (d.milestones || []).map((m, idx, arr) => `
                <div class="relative flex gap-3.5 ${idx < arr.length - 1 ? 'pb-4' : ''}">
                    ${idx < arr.length - 1 ? `<div class="absolute left-[11px] top-6 bottom-0 w-px ${m.done ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-white/10'}"></div>` : ''}
                    <div class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${m.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300'}">
                        ${m.done ? '✓' : idx + 1}
                    </div>
                    <div class="min-w-0 flex-1">
                        <span class="text-[11px] font-black font-mono ${m.done ? 'text-emerald-500' : 'text-amber-500'}">${m.dateLabel}</span>
                        <h5 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">${m.title}</h5>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${m.detail}</p>
                    </div>
                </div>
            `).join('');

            const officialScheduleBlock = (d.officialScheduleImage || d.officialSchedulePdf) ? `
                <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-black text-emerald-500">✓ Đã có lịch thi chính thức</span>
                        ${d.officialSchedulePdf ? `<a href="${d.officialSchedulePdf}" target="_blank" class="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black">Tải PDF ↗</a>` : ''}
                    </div>
                    ${d.officialScheduleImage ? `<img src="${d.officialScheduleImage}" alt="Lịch thi HK1" class="w-full max-h-[360px] object-contain rounded-xl cursor-pointer" onclick="window.open(this.src,'_blank')">` : ''}
                </div>
            ` : '';

            container.innerHTML = `
                <div class="max-w-6xl mx-auto space-y-4">
                    <!-- 1. ULTRA-CLEAN TOP BAR -->
                    <div class="flex items-center justify-between gap-2">
                        <button type="button" onclick="AzotaApp.goBack()"
                                class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
                            ← Quay lại
                        </button>

                        <div class="flex items-center gap-2">
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

                    <!-- 2. COMPACT HIGH-IMPACT HORIZONTAL COUNTDOWN HERO -->
                    <div class="bento-card-enter relative overflow-hidden rounded-3xl bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 px-5 py-5 sm:px-7 sm:py-6 shadow-xl border border-slate-800 dark:border-white/40">
                        <div class="bento-hatch-overlay"></div>

                        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div class="space-y-1 text-center md:text-left">
                                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 dark:bg-slate-950/10 text-[10px] font-black uppercase tracking-widest">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                    <span>Đếm Ngược Cuối HK1</span>
                                </div>
                                <h2 class="text-lg sm:text-2xl font-black tracking-tight">
                                    14/12 – 22/12/2026
                                </h2>
                                <p class="text-[11px] sm:text-xs font-semibold opacity-60">
                                    Khối ${this.selectedGrade} • THPT Trần Văn Giàu
                                </p>
                            </div>

                            <div class="grid grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto md:min-w-[390px]">
                                <div class="py-3 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10 text-center">
                                    <div id="hk1HeroDays" class="text-2xl sm:text-4xl font-black font-mono leading-none">${String(c.days).padStart(2, '0')}</div>
                                    <div class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-55 mt-1.5">Ngày</div>
                                </div>
                                <div class="py-3 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10 text-center">
                                    <div id="hk1HeroHours" class="text-2xl sm:text-4xl font-black font-mono leading-none">${String(c.hours).padStart(2, '0')}</div>
                                    <div class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-55 mt-1.5">Giờ</div>
                                </div>
                                <div class="py-3 px-2 rounded-2xl bg-white/10 dark:bg-slate-950/[0.07] border border-white/10 dark:border-slate-950/10 text-center">
                                    <div id="hk1HeroMins" class="text-2xl sm:text-4xl font-black font-mono leading-none">${String(c.mins).padStart(2, '0')}</div>
                                    <div class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-55 mt-1.5">Phút</div>
                                </div>
                                <div class="py-3 px-2 rounded-2xl bg-amber-500/20 dark:bg-slate-950 text-amber-300 dark:text-amber-400 border border-amber-400/30 dark:border-slate-950 text-center">
                                    <div id="hk1HeroSecs" class="text-2xl sm:text-4xl font-black font-mono leading-none">${String(c.secs).padStart(2, '0')}</div>
                                    <div class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-80 mt-1.5">Giây</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. CREATIVE 2-PANE STUDIO (ALL 14 SUBJECTS FIT IN 1 SCREEN, ZERO SCROLL ON PC!) -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <!-- Left: Compact 2-Column Subject Grid (14 subjects = only 7 compact rows!) -->
                        <div class="lg:col-span-5 space-y-2">
                            <div class="flex items-center justify-between px-1">
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Chọn môn học
                                </span>
                                <span class="text-[10px] font-bold text-slate-400">${subjects.length} môn</span>
                            </div>
                            <div id="hk1SubjectsGrid" class="grid grid-cols-2 gap-2">
                                ${compactGridChips}
                            </div>
                        </div>

                        <!-- Right (Desktop only): Live Packaged Subject Inspector -->
                        <div id="hk1DesktopDetailPane"
                             class="hidden lg:block lg:col-span-7 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-6 shadow-sm min-h-[385px]">
                            ${this.buildDetailInnerHtml(activeSubj, false)}
                        </div>
                    </div>
                </div>

                <!-- MOBILE SLIDE-UP BOTTOM SHEET (FOR SUBJECT DETAILS) -->
                <div id="hk1MobileSheetOverlay"
                     onclick="if (event.target === this) ExamScheduleEngine.closeMobileSheet()"
                     class="${this.mobileSheetOpen ? '' : 'hidden'} lg:hidden fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end justify-center p-2 pb-20">
                    <div id="hk1MobileSheetBody"
                         class="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/15 p-5 shadow-2xl max-h-[75vh] overflow-y-auto">
                        ${this.buildDetailInnerHtml(activeSubj, true)}
                    </div>
                </div>

                <!-- OPTIONAL TIMELINE & OFFICIAL SCHEDULE MODAL -->
                <div id="hk1TimelineModal"
                     onclick="if (event.target === this) ExamScheduleEngine.closeTimeline()"
                     class="${this.timelineModalOpen ? '' : 'hidden'} fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div class="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-5 max-h-[82vh] overflow-y-auto">
                        <div class="flex items-center justify-between gap-2">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">THPT Trần Văn Giàu</p>
                                <h3 class="text-base font-black text-slate-900 dark:text-white mt-0.5">Lộ Trình Kỳ Thi HK1</h3>
                            </div>
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="ExamScheduleEngine.fetchData(true)"
                                        class="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer" title="Đồng bộ">
                                    <svg id="hk1RefreshIcon" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                </button>
                                <button type="button" onclick="ExamScheduleEngine.closeTimeline()"
                                        class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 font-bold text-sm cursor-pointer">✕</button>
                            </div>
                        </div>

                        ${officialScheduleBlock}
                        <div>${milestonesHtml}</div>

                        <a href="${d.sourceArticleUrl}" target="_blank" rel="noopener noreferrer"
                           class="block w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-center text-xs font-extrabold text-sky-500 transition-colors">
                            Mở Văn Bản Gốc THPT TVG ↗
                        </a>
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
