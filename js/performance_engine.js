/**
 * ASETA OS — GRAPHICS & PERFORMANCE ENGINE (CHẾ ĐỘ GIẢM LAG CHO MÁY YẾU)
 * - 3 presets: ultra_low (Siêu Mượt), balanced (Cân Bằng), high (Đầy Đủ) + custom
 * - 6 granular toggles: animations, blur, tilt3d, ambientBg, shadows, confetti
 * - Post-login graphics picker modal + always-accessible in-app Settings modal
 * - Real GPU/CPU savings: disables backdrop-filter blur, CSS keyframes, 3D parallax,
 *   spotlight listeners, heavy shadows, and canvas confetti allocation.
 */
(function (window) {
    "use strict";

    const STORAGE_KEY = "aseta_graphics_settings_v1";

    const PRESETS = {
        ultra_low: {
            label: "Siêu Mượt",
            badge: "⚡ Máy yếu / Mát máy",
            desc: "Tắt hết animation, kính mờ blur, 3D & pháo giấy — nhẹ tối đa cho máy cũ.",
            flags: {
                animations: false,
                blur: false,
                tilt3d: false,
                ambientBg: false,
                shadows: false,
                confetti: false
            }
        },
        balanced: {
            label: "Cân Bằng",
            badge: "✨ Mượt & Gọn",
            desc: "Tắt kính mờ nặng, 3D & đốm sáng nền; giữ hiệu ứng chuyển cảnh nhẹ.",
            flags: {
                animations: true,
                blur: false,
                tilt3d: false,
                ambientBg: false,
                shadows: true,
                confetti: true
            }
        },
        high: {
            label: "Đầy Đủ",
            badge: "🎨 Máy mạnh",
            desc: "Bật trọn bộ hiệu ứng kính mờ, thư mục 3D, đổ bóng & pháo giấy.",
            flags: {
                animations: true,
                blur: true,
                tilt3d: true,
                ambientBg: true,
                shadows: true,
                confetti: true
            }
        }
    };

    const TOGGLE_ITEMS = [
        {
            key: "animations",
            icon: "🎞️",
            title: "Hiệu ứng chuyển động (Animation)",
            desc: "Tắt tất cả keyframes, nhấp nháy ping/pulse, ngọn lửa & đếm số động.",
            impact: "Cao"
        },
        {
            key: "blur",
            icon: "🫧",
            title: "Kính mờ (Backdrop Blur)",
            desc: "Nguyên nhân gây nóng máy & giật khi cuộn số 1 trên điện thoại/laptop cũ.",
            impact: "Rất cao"
        },
        {
            key: "tilt3d",
            icon: "🧊",
            title: "Hiệu ứng 3D & Đèn Spotlight",
            desc: "Tắt nghiêng 3D thư mục & quét sáng theo chuột/chạm cảm ứng.",
            impact: "Cao"
        },
        {
            key: "ambientBg",
            icon: "🌌",
            title: "Nền phát sáng & Đốm sáng mờ",
            desc: "Tắt các khối màu blur lớn và lưới động chạy ngầm ở nền trang.",
            impact: "Trung bình"
        },
        {
            key: "shadows",
            icon: "🌑",
            title: "Đổ bóng dày (Heavy Shadows)",
            desc: "Lược bỏ bóng đổ nặng nhiều lớp giúp cuộn danh sách mượt hơn.",
            impact: "Trung bình"
        },
        {
            key: "confetti",
            icon: "🎉",
            title: "Pháo giấy Canvas (Confetti)",
            desc: "Tắt bắn pháo giấy toàn màn hình khi đăng nhập hoặc đạt điểm cao.",
            impact: "Nhẹ"
        }
    ];

    function detectLowEndDevice() {
        try {
            const cores = navigator.hardwareConcurrency || 4;
            const mem = navigator.deviceMemory || 4;
            const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
            const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            return {
                isLowEnd: reduced || cores <= 4 || mem <= 4 || isMobile,
                isMobile,
                cores,
                mem,
                recommendedPreset: (reduced || mem <= 2 || cores <= 2) ? "ultra_low" : (isMobile || mem <= 4 ? "balanced" : "high")
            };
        } catch (_) {
            return { isLowEnd: false, isMobile: false, cores: 4, mem: 4, recommendedPreset: "balanced" };
        }
    }

    function getDefaultSettings() {
        const dev = detectLowEndDevice();
        const preset = dev.recommendedPreset === "ultra_low" ? "ultra_low" : "balanced";
        return {
            preset,
            flags: { ...PRESETS[preset].flags },
            askAfterLogin: true,
            hasChosenOnce: false
        };
    }

    let settings = null;
    let rawConfettiFn = null;

    function loadSettings() {
        if (settings) return settings;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.flags) {
                    settings = {
                        preset: parsed.preset || "custom",
                        flags: {
                            animations: parsed.flags.animations !== false,
                            blur: parsed.flags.blur !== false,
                            tilt3d: parsed.flags.tilt3d !== false,
                            ambientBg: parsed.flags.ambientBg !== false,
                            shadows: parsed.flags.shadows !== false,
                            confetti: parsed.flags.confetti !== false
                        },
                        askAfterLogin: parsed.askAfterLogin !== false,
                        hasChosenOnce: !!parsed.hasChosenOnce
                    };
                    return settings;
                }
            }
        } catch (_) {}
        settings = getDefaultSettings();
        return settings;
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadSettings()));
        } catch (_) {}
    }

    function matchPresetName(flags) {
        for (const key of Object.keys(PRESETS)) {
            const pf = PRESETS[key].flags;
            const same = Object.keys(pf).every(k => !!flags[k] === !!pf[k]);
            if (same) return key;
        }
        return "custom";
    }

    function computeGpuLoadSummary(flags) {
        const weights = { blur: 32, animations: 26, tilt3d: 16, ambientBg: 12, shadows: 9, confetti: 5 };
        let activeLoad = 0;
        Object.keys(weights).forEach(k => {
            if (flags[k]) activeLoad += weights[k];
        });
        const saved = 100 - activeLoad;
        if (activeLoad <= 15) {
            return { label: "Siêu nhẹ • Rất mát máy", savedPct: saved, tone: "emerald", barPct: 14 };
        }
        if (activeLoad <= 55) {
            return { label: "Nhẹ & Cân bằng", savedPct: saved, tone: "sky", barPct: 48 };
        }
        return { label: "Đầy đủ hiệu ứng (GPU cao)", savedPct: saved, tone: "amber", barPct: 95 };
    }

    function wrapConfettiSafely() {
        if (typeof window.confetti === "function" && !window.confetti._asetaWrapped) {
            rawConfettiFn = window.confetti;
            const guarded = function () {
                if (!AsetaPerfEngine.isEnabled("confetti")) return null;
                return rawConfettiFn.apply(this, arguments);
            };
            guarded._asetaWrapped = true;
            window.confetti = guarded;
        }
    }

    function applyToDom() {
        const s = loadSettings();
        const f = s.flags;
        const root = document.documentElement;
        if (!root) return;

        const map = {
            perfNoAnim: !f.animations,
            perfNoBlur: !f.blur,
            perfNo3d: !f.tilt3d,
            perfNoAmbient: !f.ambientBg,
            perfNoShadows: !f.shadows,
            perfNoConfetti: !f.confetti
        };

        Object.keys(map).forEach(attr => {
            if (map[attr]) root.dataset[attr] = "true";
            else delete root.dataset[attr];
        });

        root.dataset.perfPreset = s.preset || "custom";

        // Update top navbar Settings indicator pill if present
        const btn = document.getElementById("headerPerfSettingsBtn");
        const badge = document.getElementById("headerPerfModeBadge");
        if (badge) {
            if (s.preset === "ultra_low") {
                badge.textContent = "Siêu mượt";
                badge.className = "hidden md:inline text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400";
            } else if (s.preset === "balanced") {
                badge.textContent = "Cân bằng";
                badge.className = "hidden md:inline text-[11px] font-extrabold text-sky-600 dark:text-sky-400";
            } else if (s.preset === "high") {
                badge.textContent = "Đầy đủ";
                badge.className = "hidden md:inline text-[11px] font-extrabold text-amber-600 dark:text-amber-400";
            } else {
                badge.textContent = "Tùy chỉnh";
                badge.className = "hidden md:inline text-[11px] font-extrabold text-violet-600 dark:text-violet-400";
            }
        }
        if (btn) {
            btn.title = `Cài đặt Đồ họa & Giảm lag (${s.preset === "ultra_low" ? "Siêu Mượt" : s.preset === "balanced" ? "Cân Bằng" : s.preset === "high" ? "Đầy Đủ" : "Tùy Chỉnh"})`;
        }

        wrapConfettiSafely();
    }

    function ensureModalContainers() {
        if (!document.getElementById("asetaPerfSettingsModal")) {
            const settingsModal = document.createElement("div");
            settingsModal.id = "asetaPerfSettingsModal";
            settingsModal.className = "fixed inset-0 z-[100001] hidden items-center justify-center p-3 sm:p-4 bg-black/75";
            settingsModal.onclick = (e) => {
                if (e.target === settingsModal) AsetaPerfEngine.closeSettingsModal();
            };
            document.body.appendChild(settingsModal);
        }

        if (!document.getElementById("asetaPostLoginPerfModal")) {
            const pickerModal = document.createElement("div");
            pickerModal.id = "asetaPostLoginPerfModal";
            pickerModal.className = "fixed inset-0 z-[100002] hidden items-center justify-center p-3 sm:p-4 bg-black/80";
            document.body.appendChild(pickerModal);
        }
    }

    function renderSettingsModalContent() {
        const modal = document.getElementById("asetaPerfSettingsModal");
        if (!modal) return;
        const s = loadSettings();
        const f = s.flags;
        const gpu = computeGpuLoadSummary(f);
        const allOff = Object.values(f).every(v => !v);
        const toneCls = gpu.tone === "emerald"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
            : gpu.tone === "sky"
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30";
        const barCls = gpu.tone === "emerald" ? "bg-emerald-500" : (gpu.tone === "sky" ? "bg-sky-500" : "bg-amber-500");

        modal.innerHTML = `
            <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0f131d] border border-slate-200 dark:border-white/15 shadow-2xl text-slate-900 dark:text-white">
                <!-- Header -->
                <div class="sticky top-0 z-10 px-5 py-4 bg-white dark:bg-[#0f131d] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
                            ⚙️
                        </div>
                        <div class="min-w-0">
                            <h3 class="text-base font-black tracking-tight leading-tight">Cài Đặt Đồ Họa &amp; Giảm Lag</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">Tối ưu mượt &amp; mát máy cho điện thoại, laptop cũ</p>
                        </div>
                    </div>
                    <button type="button" onclick="AsetaPerfEngine.closeSettingsModal()"
                            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer shrink-0">
                        ✕
                    </button>
                </div>

                <div class="p-5 space-y-4">
                    <!-- GPU Load Indicator -->
                    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Tải đồ họa hiện tại</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black border ${toneCls}">
                                ${gpu.label}${gpu.savedPct > 0 ? ` (Giảm ${gpu.savedPct}% tải)` : ''}
                            </span>
                        </div>
                        <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div class="h-full rounded-full ${barCls}" style="width: ${gpu.barPct}%"></div>
                        </div>
                    </div>

                    <!-- 1-Click Master Kill Switch -->
                    <div class="p-3.5 rounded-2xl ${allOff ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-900 text-white dark:bg-white/[0.06] border-slate-700/80 dark:border-white/10'} border flex items-center justify-between gap-3">
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm font-black flex items-center gap-1.5">
                                <span>🚀</span>
                                <span>Tắt hết hiệu ứng (Chế độ Máy Yếu)</span>
                            </div>
                            <p class="text-[11px] opacity-75 mt-0.5">Bật nhanh để dừng mọi animation, blur &amp; chống nóng máy lập tức</p>
                        </div>
                        <button type="button" onclick="AsetaPerfEngine.toggleAllOff()"
                                class="px-3.5 py-2 rounded-xl text-xs font-black shrink-0 cursor-pointer ${allOff ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}">
                            ${allOff ? '✓ Đang Bật' : 'Bật Ngay'}
                        </button>
                    </div>

                    <!-- 3 Preset Pills -->
                    <div class="space-y-1.5">
                        <div class="text-[11px] font-black uppercase tracking-wider text-slate-400">Chọn nhanh mức đồ họa</div>
                        <div class="grid grid-cols-3 gap-2">
                            ${["ultra_low", "balanced", "high"].map(pk => {
                                const p = PRESETS[pk];
                                const active = s.preset === pk;
                                return `
                                    <button type="button" onclick="AsetaPerfEngine.applyPreset('${pk}', true)"
                                            class="p-2.5 rounded-2xl border text-left cursor-pointer ${
                                                active
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200'
                                            }">
                                        <div class="text-xs font-black">${pk === 'ultra_low' ? '⚡' : pk === 'balanced' ? '✨' : '🎨'} ${p.label}</div>
                                        <div class="text-[10px] mt-0.5 ${active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}">${pk === 'ultra_low' ? 'Máy yếu' : pk === 'balanced' ? 'Khuyên dùng' : 'Máy mạnh'}</div>
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <!-- 6 Granular Individual Toggles -->
                    <div class="space-y-2">
                        <div class="text-[11px] font-black uppercase tracking-wider text-slate-400">Tùy chỉnh tắt / bật từng hiệu ứng</div>
                        <div class="divide-y divide-slate-200/80 dark:divide-white/[0.07] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
                            ${TOGGLE_ITEMS.map(item => {
                                const on = !!f[item.key];
                                return `
                                    <div class="px-3.5 py-2.5 flex items-center justify-between gap-3">
                                        <div class="min-w-0">
                                            <div class="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                                <span>${item.icon}</span>
                                                <span>${item.title}</span>
                                                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300">Tải: ${item.impact}</span>
                                            </div>
                                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">${item.desc}</p>
                                        </div>
                                        <button type="button"
                                                role="switch"
                                                aria-checked="${on ? 'true' : 'false'}"
                                                data-perf-toggle="${item.key}"
                                                onclick="AsetaPerfEngine.toggleFlag('${item.key}')"
                                                class="relative w-12 h-7 rounded-full shrink-0 cursor-pointer border ${on ? 'bg-blue-600 border-blue-500' : 'bg-slate-300 dark:bg-slate-700 border-transparent'}">
                                            <span class="block w-5 h-5 rounded-full bg-white shadow transform ${on ? 'translate-x-5' : 'translate-x-0.5'}"></span>
                                        </button>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <!-- Ask after login option -->
                    <label class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 cursor-pointer">
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Hiện bảng chọn đồ họa sau khi bấm Đăng nhập</span>
                        <input type="checkbox" ${s.askAfterLogin ? 'checked' : ''}
                               onchange="AsetaPerfEngine.setAskAfterLogin(this.checked)"
                               class="w-4 h-4 accent-blue-600 cursor-pointer">
                    </label>
                </div>

                <!-- Footer -->
                <div class="sticky bottom-0 px-5 py-3.5 bg-white dark:bg-[#0f131d] border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end">
                    <button type="button" onclick="AsetaPerfEngine.closeSettingsModal()"
                            class="px-5 py-2.5 rounded-2xl text-xs font-black bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 cursor-pointer">
                        ✓ Xong &amp; Lưu
                    </button>
                </div>
            </div>
        `;
    }

    function renderPostLoginPickerContent() {
        const modal = document.getElementById("asetaPostLoginPerfModal");
        if (!modal) return;
        const s = loadSettings();
        const dev = detectLowEndDevice();
        const deviceHint = dev.isMobile
            ? "Đang dùng điện thoại — nên chọn Siêu Mượt hoặc Cân Bằng để mát máy"
            : `Thiết bị ${dev.cores} nhân${dev.mem ? ` • ${dev.mem}GB RAM` : ""} — chọn mức phù hợp`;

        modal.innerHTML = `
            <div class="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f131d] border border-slate-200 dark:border-white/15 shadow-2xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4">
                <div class="text-center space-y-1">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                    <h3 class="text-lg font-black tracking-tight">Chọn Chế Độ Đồ Họa</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${deviceHint}</p>
                </div>

                <div class="space-y-2.5">
                    ${["ultra_low", "balanced", "high"].map(pk => {
                        const p = PRESETS[pk];
                        const isRec = pk === "ultra_low" || (pk === dev.recommendedPreset);
                        const isSelected = s.preset === pk;
                        const accent = pk === "ultra_low"
                            ? "border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/15"
                            : pk === "balanced"
                                ? "border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/15"
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08]";

                        return `
                            <button type="button"
                                    data-pick-preset="${pk}"
                                    onclick="AsetaPerfEngine.choosePostLoginPreset('${pk}')"
                                    class="w-full p-3.5 rounded-2xl border text-left cursor-pointer flex items-start justify-between gap-3 ${accent} ${isSelected ? 'ring-2 ring-blue-500' : ''}">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-black text-slate-900 dark:text-white">${p.label}</span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/80 dark:bg-black/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10">${p.badge}</span>
                                    </div>
                                    <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">${p.desc}</p>
                                </div>
                                <span class="text-sm font-black text-blue-500 shrink-0 mt-1">➔</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div class="pt-1 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <label class="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" id="postLoginDontAskAgain" class="w-3.5 h-3.5 accent-blue-600 cursor-pointer">
                        <span>Không hỏi lại lần sau</span>
                    </label>
                    <button type="button" onclick="AsetaPerfEngine.closePostLoginPicker(); AsetaPerfEngine.openSettingsModal();"
                            class="font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        ⚙️ Tùy chỉnh chi tiết
                    </button>
                </div>
            </div>
        `;
    }

    const AsetaPerfEngine = {
        PRESETS,
        TOGGLE_ITEMS,

        init: function () {
            loadSettings();
            applyToDom();
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => {
                    ensureModalContainers();
                    applyToDom();
                });
            } else {
                ensureModalContainers();
                applyToDom();
            }
        },

        getSettings: function () {
            return JSON.parse(JSON.stringify(loadSettings()));
        },

        isEnabled: function (flagKey) {
            const s = loadSettings();
            return s.flags[flagKey] !== false;
        },

        applyPreset: function (presetName, showToast = false) {
            const p = PRESETS[presetName];
            if (!p) return;
            const s = loadSettings();
            s.preset = presetName;
            s.flags = { ...p.flags };
            s.hasChosenOnce = true;
            saveSettings();
            applyToDom();
            renderSettingsModalContent();
            if (showToast && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(`⚡ Đã chuyển đồ họa sang: ${p.label} (${p.badge})`);
            }
        },

        toggleFlag: function (flagKey) {
            const s = loadSettings();
            if (!(flagKey in s.flags)) return;
            s.flags[flagKey] = !s.flags[flagKey];
            s.preset = matchPresetName(s.flags);
            s.hasChosenOnce = true;
            saveSettings();
            applyToDom();
            renderSettingsModalContent();
        },

        toggleAllOff: function () {
            const s = loadSettings();
            const allOff = Object.values(s.flags).every(v => !v);
            this.applyPreset(allOff ? "balanced" : "ultra_low", true);
        },

        setAskAfterLogin: function (val) {
            const s = loadSettings();
            s.askAfterLogin = !!val;
            saveSettings();
        },

        openSettingsModal: function () {
            ensureModalContainers();
            renderSettingsModalContent();
            const modal = document.getElementById("asetaPerfSettingsModal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("flex");
            }
        },

        closeSettingsModal: function () {
            const modal = document.getElementById("asetaPerfSettingsModal");
            if (modal) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            }
        },

        openPostLoginPicker: function (force = false) {
            const s = loadSettings();
            if (!force && s.askAfterLogin === false) return;
            ensureModalContainers();
            renderPostLoginPickerContent();
            const modal = document.getElementById("asetaPostLoginPerfModal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("flex");
            }
        },

        choosePostLoginPreset: function (presetName) {
            const chk = document.getElementById("postLoginDontAskAgain");
            if (chk && chk.checked) {
                this.setAskAfterLogin(false);
            }
            this.applyPreset(presetName, true);
            this.closePostLoginPicker();
        },

        closePostLoginPicker: function () {
            const modal = document.getElementById("asetaPostLoginPerfModal");
            if (modal) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            }
        }
    };

    window.AsetaPerfEngine = AsetaPerfEngine;
    AsetaPerfEngine.init();
})(window);
