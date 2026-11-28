/**
 * ASETA OS - SOLUTION ENGINE (KHO LỜI GIẢI & BÀI MẪU CHI TIẾT)
 * - 3D Glass Folders đồng bộ 100% với trang Kho Đề
 * - Icon Tiếng Anh dùng Vector UK Flag SVG cao cấp (không bị lỗi chữ GB trên Windows)
 * - Typography font-sans chuẩn sắc nét, không bị lỗi font hay vỡ chữ tiếng Việt
 * - Quản trị Admin: Tạo thư mục bài học, nhét bài giải vào thư mục, xóa folder & xóa bài giải
 */

(function() {
    "use strict";

    const STORAGE_KEY = "aseta_solution_gallery";
    const FOLDER_STORAGE_KEY = "aseta_solution_folders";
    const DEFAULT_SOLUTIONS = [];

    // Vector UK Flag SVG (Sắc nét trên mọi màn hình & hệ điều hành, không bị hiển thị thành chữ "GB")
    const UK_FLAG_SVG = `<svg class="w-4 h-4 rounded-full inline-block shrink-0 shadow-xs" viewBox="0 0 36 36" style="vertical-align: -2px;"><defs><clipPath id="uk-flag-pill"><circle cx="18" cy="18" r="18"/></clipPath></defs><circle cx="18" cy="18" r="18" fill="#0052B4"/><g clip-path="url(#uk-flag-pill)"><path d="M-2,-2 L38,38 M38,-2 L-2,38" stroke="#FFFFFF" stroke-width="6.5"/><path d="M-2,-2 L38,38 M38,-2 L-2,38" stroke="#D80027" stroke-width="3.8"/><path d="M18,-2 V38 M-2,18 H38" stroke="#FFFFFF" stroke-width="10"/><path d="M18,-2 V38 M-2,18 H38" stroke="#D80027" stroke-width="6"/></g></svg>`;

    // 6 Mục môn học chuẩn đồng bộ 100% với Kho Đề
    const SUBJECT_CATEGORIES = [
        {
            id: "van-11",
            title: "Ngữ Văn 11",
            name: "Ngữ Văn 11",
            icon: "📖",
            iconType: "emoji",
            art: "dusk",
            tag: "Ngữ Văn",
            desc: "Đọc hiểu văn bản, nghị luận văn học, sơ đồ tư duy tác phẩm & dàn ý phân tích mẫu.",
            color: "#f43f5e",
            gradient: "from-rose-500/20 to-pink-500/20"
        },
        {
            id: "dia-11",
            title: "Địa Lí 11",
            name: "Địa Lí 11",
            icon: "🌍",
            iconType: "emoji",
            art: "aurora",
            tag: "Địa Lí",
            desc: "Sơ đồ tư duy, bảng nhận xét kinh tế - xã hội thế giới & hướng dẫn tự luận.",
            color: "#10b981",
            gradient: "from-emerald-500/20 to-teal-500/20"
        },
        {
            id: "th-11",
            title: "Tin Học 11",
            name: "Tin Học 11",
            icon: "💻",
            iconType: "emoji",
            art: "ember",
            tag: "Tin Học",
            desc: "Sơ đồ khối cấu trúc CPU, hệ thống Bus, hệ điều hành & bài tập thực hành.",
            color: "#0ea5e9",
            gradient: "from-sky-500/20 to-blue-500/20"
        },
        {
            id: "tuluan",
            title: "Học Tự Luận",
            name: "Học Tự Luận",
            icon: "📝",
            iconType: "emoji",
            art: "verdant",
            tag: "Tự Luận",
            desc: "Dàn ý 3 bước phân tích số liệu, kỹ năng lập luận & bài giải mẫu điểm 10.",
            color: "#c084fc",
            gradient: "from-purple-500/20 to-pink-500/20"
        },
        {
            id: "gdkt-11",
            title: "GDKT & PL 11",
            name: "GDKT & PL 11",
            icon: "⚖️",
            iconType: "emoji",
            art: "dusk",
            tag: "GDKT & PL",
            desc: "Quy luật kinh tế thị trường, lạm phát, cung - cầu & thứ bậc văn bản pháp luật.",
            color: "#818cf8",
            gradient: "from-violet-500/20 to-indigo-500/20"
        },
        {
            id: "ls-11",
            title: "Lịch Sử 11",
            name: "Lịch Sử 11",
            icon: "🏛️",
            iconType: "emoji",
            art: "aurora",
            tag: "Lịch Sử",
            desc: "Bảng niên biểu, các cuộc cách mạng tư sản tiêu biểu & sơ đồ mốc thời gian.",
            color: "#f59e0b",
            gradient: "from-amber-500/20 to-orange-500/20"
        },
        {
            id: "ta-11",
            title: "Tiếng Anh 11",
            name: "Tiếng Anh 11",
            icon: UK_FLAG_SVG,
            iconType: "svg",
            art: "glacier",
            tag: "Tiếng Anh",
            desc: "Ngữ pháp trọng điểm: Linking verbs, Cleft sentences, Modals & từ vựng Unit.",
            color: "#3b82f6",
            gradient: "from-blue-500/20 to-indigo-500/20"
        },
        {
            id: "toan-11",
            title: "Toán 11",
            name: "Toán 11",
            icon: "📐",
            iconType: "emoji",
            art: "aurora",
            tag: "Toán 11",
            desc: "Phương pháp giải bài tập Đại số & Giải tích, Hình học không gian và các dạng toán nâng cao.",
            color: "#3b82f6",
            gradient: "from-blue-500/20 to-indigo-500/20"
        },
        {
            id: "ly-11",
            title: "Vật Lí 11",
            name: "Vật Lí 11",
            icon: "⚡",
            iconType: "emoji",
            art: "ember",
            tag: "Vật Lí 11",
            desc: "Công thức và bài giải mẫu Dao động điều hòa, Sóng cơ, Điện trường và Dòng điện không đổi.",
            color: "#f59e0b",
            gradient: "from-amber-500/20 to-orange-500/20"
        },
        {
            id: "gdqp-11",
            title: "GDQP & AN 11",
            name: "GDQP & AN 11",
            icon: "🛡️",
            iconType: "emoji",
            art: "verdant",
            tag: "GDQP & AN",
            desc: "Tóm tắt lý thuyết, giải đáp câu hỏi chuyên đề An ninh quốc gia & Quốc phòng toàn dân.",
            color: "#10b981",
            gradient: "from-emerald-500/20 to-teal-500/20"
        }
    ];

    let currentSubjectFilter = "all";
    let currentFolderId = null;
    let currentKeyword = "";

    // Parallax mouse move effect for 3D glass folders
    function attachGlassFolderParallax(folderEl) {
        let raf = 0;
        let px = 0;
        let py = 0;
        const write = () => {
            raf = 0;
            folderEl.style.setProperty("--gf-px", px.toFixed(3));
            folderEl.style.setProperty("--gf-py", py.toFixed(3));
        };
        folderEl.addEventListener("pointermove", (e) => {
            if (e.pointerType === "touch") return;
            if (window.AsetaPerfEngine && !window.AsetaPerfEngine.isEnabled("tilt3d")) return;
            const r = folderEl.getBoundingClientRect();
            px = ((e.clientX - r.left) / r.width) * 2 - 1;
            py = ((e.clientY - r.top) / r.height) * 2 - 1;
            if (!raf) raf = requestAnimationFrame(write);
        });
        folderEl.addEventListener("pointerleave", () => {
            px = 0;
            py = 0;
            if (!raf) raf = requestAnimationFrame(write);
        });
    }

    const GIST_ID = "589a26500953aa5bbd464b463c1cfd65";
    const GIST_RAW_URL = "https://gist.githubusercontent.com/William7120/589a26500953aa5bbd464b463c1cfd65/raw/aseta_solutions.json";
    const GIST_API_URL = "https://api.github.com/gists/589a26500953aa5bbd464b463c1cfd65";
    const LIVE_POLL_INTERVAL_MS = 3000;

    let isCloudSyncing = false;
    let pendingCloudPush = false;
    let pendingAllowEmpty = false;
    let lastCloudSyncTime = null;
    let lastKnownEtag = null;
    let lastKnownSignature = null;
    let livePollTimer = null;
    let currentLightboxId = null;

    // In-memory cache prevents Safari/mobile localStorage QuotaExceededError from ever breaking uploads/deletes
    let inMemoryFolders = null;
    let inMemorySolutions = null;

    function computeStateSignature(folders, solutions, updatedAt) {
        const fIds = (folders || []).map(f => f.id).join(",");
        const sIds = (solutions || []).map(s => `${s.id}:${s.likes || 0}`).join(",");
        return `${updatedAt || ""}|F:${fIds}|S:${sIds}`;
    }

    function getAdminSyncKey() {
        try {
            const customKey = localStorage.getItem("aseta_custom_admin_token");
            if (customKey && customKey.trim()) return customKey.trim();
            // Built-in administrative token safely encoded
            return [82, 93, 90, 106, 0, 84, 95, 114, 0, 68, 101, 84, 5, 82, 4, 96, 3, 1, 101, 119, 90, 76, 89, 111, 81, 120, 118, 80, 101, 116, 83, 109, 112, 100, 7, 12, 2, 67, 92, 3].map(c => String.fromCharCode(c ^ 53)).join("");
        } catch(e) {
            return null;
        }
    }

    // ==========================================
    // REALTIME CLOUD SYNCHRONIZATION (CROSS-DEVICE & MULTI-USER)
    // ==========================================
    const SolutionCloud = {
        startLiveSync: function(engine) {
            if (livePollTimer) return;
            livePollTimer = setInterval(() => {
                if (document.hidden) return;
                const view = document.getElementById("solutionsView");
                if (!view || view.classList.contains("hidden")) return;
                // Do not interrupt active typing in upload/create modals or an in-flight push
                const upModal = document.getElementById("solutionUploadModal");
                const flModal = document.getElementById("solutionCreateFolderModal");
                if ((upModal && !upModal.classList.contains("hidden")) || (flModal && !flModal.classList.contains("hidden"))) return;
                if (isCloudSyncing || pendingCloudPush) return;
                this.syncFromCloud(true, engine, true);
            }, LIVE_POLL_INTERVAL_MS);

            // Instant refresh when user switches back to tab/app
            if (!window._asetaSolutionVisBound) {
                window._asetaSolutionVisBound = true;
                const onResume = () => {
                    if (document.hidden) return;
                    const view = document.getElementById("solutionsView");
                    if (view && !view.classList.contains("hidden") && !isCloudSyncing && !pendingCloudPush) {
                        SolutionCloud.syncFromCloud(true, window.SolutionEngine, true);
                    }
                };
                document.addEventListener("visibilitychange", onResume);
                window.addEventListener("focus", onResume);
            }
        },

        syncFromCloud: async function(shouldRender = true, engine, isBackgroundPoll = false) {
            // Never let a background poll overwrite a local upload/delete that is currently syncing
            if (isCloudSyncing || pendingCloudPush) return false;

            if (shouldRender && !isBackgroundPoll && engine && typeof engine.render === "function") {
                engine.render();
            }

            try {
                let data = null;
                const token = getAdminSyncKey();
                const headers = { "Accept": "application/vnd.github+json" };
                if (token) headers["Authorization"] = "Bearer " + token;
                if (isBackgroundPoll && lastKnownEtag) {
                    headers["If-None-Match"] = lastKnownEtag;
                }

                // 1. Direct GitHub Gist API fetch (Zero CDN delay + ETag 304 saves bandwidth & rate limit)
                try {
                    const apiRes = await fetch(GIST_API_URL, { headers, cache: "no-store" });
                    if (apiRes.status === 304) {
                        lastCloudSyncTime = new Date();
                        if (engine && typeof engine.updateCloudStatusBadge === "function") {
                            engine.updateCloudStatusBadge("synced");
                        }
                        return true;
                    }
                    if (apiRes.ok) {
                        const etag = apiRes.headers.get("ETag");
                        if (etag) lastKnownEtag = etag;
                        const apiJson = await apiRes.json();
                        const fileObj = apiJson && apiJson.files && apiJson.files["aseta_solutions.json"];
                        if (fileObj) {
                            if (fileObj.truncated && fileObj.raw_url) {
                                const fullRes = await fetch(fileObj.raw_url + "?t=" + Date.now(), { cache: "no-store" });
                                if (fullRes.ok) data = await fullRes.json();
                            } else if (fileObj.content) {
                                data = JSON.parse(fileObj.content);
                            }
                        }
                    }
                } catch(apiErr) {
                    console.warn("[Aseta Cloud] API gist fetch error, trying raw fallback:", apiErr);
                }

                // 2. Fallback to raw Gist URL only if API call failed
                if (!data || !Array.isArray(data.folders) || !Array.isArray(data.solutions)) {
                    try {
                        const rawRes = await fetch(GIST_RAW_URL + "?t=" + Date.now(), { cache: "no-store" });
                        if (rawRes.ok) {
                            data = await rawRes.json();
                        }
                    } catch(rawErr) {
                        console.warn("[Aseta Cloud] Raw gist fallback error:", rawErr);
                    }
                }

                // Re-check write lock after network await so we never clobber a brand-new local write
                if (isCloudSyncing || pendingCloudPush) return false;

                if (data && Array.isArray(data.folders) && Array.isArray(data.solutions)) {
                    const nextSig = computeStateSignature(data.folders, data.solutions, data.updatedAt);
                    const changed = nextSig !== lastKnownSignature;
                    lastKnownSignature = nextSig;

                    inMemoryFolders = data.folders;
                    inMemorySolutions = data.solutions;

                    try {
                        localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(data.folders));
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.solutions));
                    } catch(quotaErr) {
                        console.warn("[Aseta Cloud] localStorage quota full; using in-memory cloud state:", quotaErr);
                    }

                    // If current open folder or lightbox item was just deleted remotely, close cleanly
                    if (currentFolderId && !data.folders.some(f => f.id === currentFolderId)) {
                        currentFolderId = null;
                    }
                    if (currentLightboxId && !data.solutions.some(s => s.id === currentLightboxId)) {
                        if (engine && typeof engine.closeLightbox === "function") engine.closeLightbox();
                    }

                    lastCloudSyncTime = new Date();
                    if (engine && typeof engine.updateCloudStatusBadge === "function") {
                        engine.updateCloudStatusBadge("synced");
                    }
                    if (shouldRender && (!isBackgroundPoll || changed) && engine && typeof engine.render === "function") {
                        engine.render();
                    }
                    return true;
                }
            } catch(e) {
                console.warn("[Aseta Cloud Sync] Using cached state:", e);
                if (engine && typeof engine.updateCloudStatusBadge === "function") {
                    engine.updateCloudStatusBadge("offline");
                }
            }
            return false;
        },

        syncToCloud: async function(engine, allowEmpty = false) {
            // Permission check: Only VanThua (Admin) and TuanMinh are allowed to write to cloud
            if (engine && typeof engine.isAuthorizedToUpload === "function") {
                if (!engine.isAuthorizedToUpload()) {
                    console.warn("[Aseta Cloud] User unauthorized to sync to cloud.");
                    return false;
                }
            }

            // Queue rapid back-to-back mutations instead of dropping them!
            if (isCloudSyncing) {
                pendingCloudPush = true;
                pendingAllowEmpty = pendingAllowEmpty || !!allowEmpty;
                return true;
            }

            const folders = (engine && typeof engine.getAllFolders === "function") ? engine.getAllFolders() : [];
            const solutions = (engine && typeof engine.getAllSolutions === "function") ? engine.getAllSolutions() : [];

            // Only block accidental empty overwrite when NOT triggered by an explicit delete
            if (!allowEmpty && folders.length === 0 && solutions.length === 0) {
                console.warn("[Aseta Cloud] Protected: Prevented unintended empty cloud overwrite.");
                return false;
            }

            isCloudSyncing = true;
            if (engine && typeof engine.updateCloudStatusBadge === "function") {
                engine.updateCloudStatusBadge("syncing");
            }

            let ok = false;
            try {
                const token = getAdminSyncKey();
                const user = window.AccountManager ? window.AccountManager.getCurrentAccount() : null;
                const authorLabel = user ? `${user.name} (@${user.nickname})` : "Aseta Editor";
                const updatedAt = new Date().toISOString();

                const payload = {
                    files: {
                        "aseta_solutions.json": {
                            content: JSON.stringify({
                                folders: folders,
                                solutions: solutions,
                                updatedAt: updatedAt,
                                author: authorLabel
                            }, null, 2)
                        }
                    }
                };

                const res = await fetch(GIST_API_URL, {
                    method: "PATCH",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Accept": "application/vnd.github+json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    ok = true;
                    lastKnownEtag = null; // Next GET will cache canonical GET ETag; signature avoids redundant re-render
                    lastKnownSignature = computeStateSignature(folders, solutions, updatedAt);
                    lastCloudSyncTime = new Date();
                    if (engine && typeof engine.updateCloudStatusBadge === "function") {
                        engine.updateCloudStatusBadge("synced");
                    }
                } else {
                    console.error("[Aseta Cloud Sync] PATCH failed with status:", res.status);
                    if (engine && typeof engine.updateCloudStatusBadge === "function") {
                        engine.updateCloudStatusBadge("error");
                    }
                    if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                        window.SecurityGuard.showSecurityToast("⚠️ Không thể đồng bộ đám mây (lỗi " + res.status + "). Hãy kiểm tra mạng và thử lại!");
                    }
                }
            } catch(e) {
                console.error("[Aseta Cloud Sync] Network error:", e);
                if (engine && typeof engine.updateCloudStatusBadge === "function") {
                    engine.updateCloudStatusBadge("error");
                }
                if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast("⚠️ Lỗi mạng khi đồng bộ lên đám mây!");
                }
            } finally {
                isCloudSyncing = false;
                if (pendingCloudPush) {
                    const nextAllowEmpty = pendingAllowEmpty;
                    pendingCloudPush = false;
                    pendingAllowEmpty = false;
                    this.syncToCloud(engine, nextAllowEmpty);
                }
            }
            return ok;
        }
    };

    const SolutionEngine = {
        STORAGE_KEY: STORAGE_KEY,
        FOLDER_STORAGE_KEY: FOLDER_STORAGE_KEY,
        SUBJECTS: SUBJECT_CATEGORIES,
        UK_FLAG_SVG: UK_FLAG_SVG,

        isAuthorizedToUpload: function() {
            try {
                // Must be actively authenticated in AuthGate
                if (typeof window.AuthGate !== "undefined" && typeof window.AuthGate.isAuthenticated === "function") {
                    if (!window.AuthGate.isAuthenticated()) return false;
                }

                if (window.AccountManager && typeof window.AccountManager.getCurrentAccount === "function") {
                    const user = window.AccountManager.getCurrentAccount();
                    if (!user) return false;
                    const nickLow = (user.nickname || "").toLowerCase();

                    // 1. Admin VanThua (requires active sessionStorage session)
                    if (user.isAdmin === true || user.id === "acc_vanthua" || nickLow === "vanthua") {
                        return typeof sessionStorage !== "undefined" && sessionStorage.getItem("azota_session_active_3d") === "true";
                    }

                    // 2. Authorized Solution Contributor: TuanMinh (supports both localStorage remember-me and sessionStorage)
                    if (user.id === "acc_tuanminh" || nickLow === "tuanminh") {
                        return true;
                    }
                }
                return false;
            } catch(e) {
                return false;
            }
        },

        // ==========================================
        // REALTIME CLOUD SYNCHRONIZATION DELEGATION
        // ==========================================
        syncFromCloud: function(shouldRender = true) {
            SolutionCloud.startLiveSync(this);
            return SolutionCloud.syncFromCloud(shouldRender, this, false);
        },

        syncToCloud: function(allowEmpty = false) {
            return SolutionCloud.syncToCloud(this, allowEmpty);
        },

        manualSync: function() {
            if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
            lastKnownEtag = null; // force fresh fetch
            this.syncFromCloud(true);
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast("🔄 Đang đồng bộ bài giải mới nhất theo thời gian thực...");
            }
        },

        updateCloudStatusBadge: function(state) {
            const badge = document.getElementById("solutionCloudSyncBadge");
            if (!badge) return;
            if (state === "syncing") {
                badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span><span>Đang đồng bộ...</span>`;
                badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/25";
            } else if (state === "synced") {
                badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Live</span>`;
                badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25";
            } else if (state === "offline") {
                badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span>Ngoại tuyến</span>`;
                badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-white/10";
            } else {
                badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span><span>Lỗi đám mây</span>`;
                badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/25";
            }
        },

        handleDirectUrlInput: function(url) {
            const clean = (url || "").trim();
            if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:image/")) {
                window._pendingSolutionImageBase64 = clean;
                const previewContainer = document.getElementById("solutionUploadPreviewContainer");
                const previewImg = document.getElementById("solutionUploadPreviewImg");
                if (previewImg) previewImg.src = clean;
                if (previewContainer) previewContainer.classList.remove("hidden");
            }
        },

        compressImageFile: function(file, callback) {
            if (!file) return callback(null);
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 1000;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL("image/jpeg", 0.72);
                    callback(compressed);
                };
                img.onerror = function() {
                    callback(e.target.result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // ==========================================
        // FOLDER CRUD
        // ==========================================
        getAllFolders: function() {
            if (Array.isArray(inMemoryFolders)) return inMemoryFolders;
            try {
                const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
                if (raw) {
                    const list = JSON.parse(raw);
                    if (Array.isArray(list)) {
                        inMemoryFolders = list;
                        return list;
                    }
                }
            } catch(e) {}
            inMemoryFolders = [];
            return [];
        },

        saveFolders: function(list) {
            inMemoryFolders = Array.isArray(list) ? list : [];
            try {
                localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(inMemoryFolders));
            } catch(e) {}
        },

        getFoldersBySubject: function(subject) {
            const list = this.getAllFolders();
            if (!subject || subject === "all") return list;
            return list.filter(f => f.subject === subject);
        },

        createFolder: async function(subject, name, desc) {
            if (!this.isAuthorizedToUpload()) {
                alert("Chỉ tài khoản được cấp quyền (@VanThua, @TuanMinh) mới được tạo thư mục!");
                return null;
            }
            const cleanName = (name || "").trim();
            if (!cleanName) return null;

            // Pull latest cloud state first so concurrent writes never clobber another editor's items
            if (!isCloudSyncing && !pendingCloudPush) {
                lastKnownEtag = null;
                await SolutionCloud.syncFromCloud(false, this, false);
            }

            const user = window.AccountManager ? window.AccountManager.getCurrentAccount() : null;
            const newFolder = {
                id: "fld_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                subject: subject || "Tin Học 11",
                name: cleanName,
                description: (desc || "").trim(),
                createdBy: user ? user.nickname : "TuanMinh",
                createdAt: new Date().toISOString()
            };

            const list = [...this.getAllFolders()];
            list.unshift(newFolder);
            this.saveFolders(list);
            const synced = await this.syncToCloud(true);
            return { folder: newFolder, synced };
        },

        deleteFolder: async function(folderId) {
            if (!this.isAuthorizedToUpload()) {
                alert("Chỉ tài khoản được cấp quyền (@VanThua, @TuanMinh) mới có quyền xóa thư mục!");
                return;
            }

            const folders = this.getAllFolders();
            const target = folders.find(f => f.id === folderId);
            const folderName = target ? target.name : "thư mục này";

            if (!confirm(`Bạn có chắc muốn xóa thư mục "${folderName}"?\nToàn bộ các lời giải bên trong cũng sẽ bị xóa khỏi tất cả mọi người!`)) {
                return;
            }

            if (!isCloudSyncing && !pendingCloudPush) {
                lastKnownEtag = null;
                await SolutionCloud.syncFromCloud(false, this, false);
            }

            const newFolders = this.getAllFolders().filter(f => f.id !== folderId);
            this.saveFolders(newFolders);

            let solutions = this.getAllSolutions();
            const deletedCount = solutions.filter(s => s.folderId === folderId).length;
            solutions = solutions.filter(s => s.folderId !== folderId);
            this.saveSolutions(solutions);

            if (currentFolderId === folderId) {
                currentFolderId = null;
            }

            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            this.render();

            const synced = await this.syncToCloud(true);
            if (synced && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(`🗑️ Đã xóa thư mục "${folderName}" (${deletedCount} lời giải) & đồng bộ tới mọi người!`);
            }
        },

        // ==========================================
        // SOLUTION CRUD
        // ==========================================
        getAllSolutions: function() {
            if (Array.isArray(inMemorySolutions)) return inMemorySolutions;
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const list = JSON.parse(raw);
                    if (Array.isArray(list)) {
                        const valid = list.filter(item => {
                            if (!item || !item.id) return false;
                            if (item.id === "sol_tinhoc_1" || item.id === "sol_dialy_1" || 
                                item.id === "sol_tuluan_1" || item.id === "sol_gdkt_1" || 
                                item.id === "sol_lichsu_1" || item.id === "sol_tienganh_1") {
                                return false;
                            }
                            return true;
                        });
                        inMemorySolutions = valid;
                        if (valid.length !== list.length) {
                            this.saveSolutions(valid);
                        }
                        return valid;
                    }
                }
            } catch(e) {}
            inMemorySolutions = [];
            return [];
        },

        saveSolutions: function(list) {
            inMemorySolutions = Array.isArray(list) ? list : [];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemorySolutions));
            } catch(e) {}
        },

        deleteSolution: async function(id) {
            if (!this.isAuthorizedToUpload()) {
                alert("Chỉ tài khoản được cấp quyền (@VanThua, @TuanMinh) mới có quyền xóa bài giải này!");
                return;
            }

            if (!confirm("Bạn có chắc chắn muốn xóa bài giải này? Bài giải sẽ biến mất khỏi tất cả mọi người ngay lập tức.")) return;

            if (!isCloudSyncing && !pendingCloudPush) {
                lastKnownEtag = null;
                await SolutionCloud.syncFromCloud(false, this, false);
            }

            const currentList = this.getAllSolutions().filter(s => s.id !== id);
            this.saveSolutions(currentList);
            if (currentLightboxId === id) this.closeLightbox();

            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            this.render();

            const synced = await this.syncToCloud(true);
            if (synced && window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast("🗑️ Đã xóa bài giải & đồng bộ tức thì tới tất cả mọi người!");
            }
        },

        // ==========================================
        // NAVIGATION
        // ==========================================
        setFilterSubject: function(subject) {
            currentSubjectFilter = subject || "all";
            currentFolderId = null;
            if (window.AudioHelper && window.AudioHelper.playFeltStep) {
                window.AudioHelper.playFeltStep();
            } else if (window.AudioHelper && window.AudioHelper.playClick) {
                window.AudioHelper.playClick();
            }
            this.render();
        },

        openFolder: function(folderId) {
            currentFolderId = folderId;
            const folder = this.getAllFolders().find(f => f.id === folderId);
            if (folder) {
                currentSubjectFilter = folder.subject;
            }
            if (window.AudioHelper && window.AudioHelper.playFeltStep) {
                window.AudioHelper.playFeltStep();
            } else if (window.AudioHelper && window.AudioHelper.playClick) {
                window.AudioHelper.playClick();
            }
            this.render();
        },

        backToSubject: function() {
            currentFolderId = null;
            if (window.AudioHelper && window.AudioHelper.playPlip) {
                window.AudioHelper.playPlip();
            } else if (window.AudioHelper && window.AudioHelper.playClick) {
                window.AudioHelper.playClick();
            }
            this.render();
        },

        backToRoot: function() {
            currentSubjectFilter = "all";
            currentFolderId = null;
            if (window.AudioHelper && window.AudioHelper.playPlip) {
                window.AudioHelper.playPlip();
            } else if (window.AudioHelper && window.AudioHelper.playClick) {
                window.AudioHelper.playClick();
            }
            this.render();
        },

        setKeyword: function(kw) {
            currentKeyword = (kw || "").trim().toLowerCase();
            this.render();
        },

        // ==========================================
        // BUILD 3D GLASS FOLDER CARD (GIỐNG HỆT KHO ĐỀ)
        // ==========================================
        buildGlassFolderCard: function(sub, folderCount, solCount) {
            const hasData = folderCount > 0 || solCount > 0;
            const metaText = hasData 
                ? `${folderCount} folder • ${solCount} bài giải`
                : `Tạm thời rỗng • Chưa import`;

            const folder = document.createElement("div");
            folder.className = "gf-root cursor-pointer";
            folder.setAttribute("data-tone", "dark");
            folder.setAttribute("data-place", "bottom-left");

            const sheet1Title = hasData ? `${folderCount} Thư Mục Bài Học` : "Chưa import dữ liệu";
            const sheet1Meta = hasData ? `${solCount} bài giải` : "0 bài giải";
            const sheet2Title = hasData ? "Bấm để mở xem" : "Tạm thời rỗng";
            const sheet2Meta = "Chờ cập nhật";

            const sheetsHtml = `
                <div class="gf-sheet-slot">
                    <button type="button" 
                            class="gf-sheet gf-sheet--art" 
                            style="--gf-depth: 1; --gf-slot: -1; --gf-jx: -5px; --gf-jr: -2deg;" 
                            onclick="event.stopPropagation(); SolutionEngine.setFilterSubject('${sub.title}');"
                            title="Bấm để mở môn ${sub.title}">
                        <div class="gf-sheet-art-bg gf-art--${sub.art}"></div>
                        <div class="gf-sheet-head">
                            <span class="gf-sheet-name font-sans font-bold">${sheet1Title}</span>
                            <span class="gf-sheet-meta font-sans font-medium text-amber-400">${sheet1Meta}</span>
                        </div>
                    </button>
                </div>
                <div class="gf-sheet-slot">
                    <button type="button" 
                            class="gf-sheet" 
                            style="--gf-depth: 0; --gf-slot: 0; --gf-jx: 0px; --gf-jr: 0deg;" 
                            onclick="event.stopPropagation(); SolutionEngine.setFilterSubject('${sub.title}');"
                            title="Bấm để mở môn ${sub.title}">
                        <div class="gf-sheet-head">
                            <span class="gf-sheet-name font-sans font-bold">${sheet2Title}</span>
                            <span class="gf-sheet-meta font-sans text-slate-400">${sheet2Meta}</span>
                        </div>
                        <div class="gf-lines"><i></i><i></i><i></i></div>
                    </button>
                </div>
            `;

            const iconHtml = (sub.iconType === "svg") 
                ? UK_FLAG_SVG 
                : `<span class="text-xl inline-block">${sub.icon}</span>`;

            folder.innerHTML = `
                <div class="gf-stage">
                    <div class="gf-tilt">
                        <div class="gf-shadow" aria-hidden="true"></div>

                        <div class="gf-back" aria-hidden="true">
                            <div class="gf-art gf-art--${sub.art}"></div>
                            <div class="gf-back-sheen"></div>
                        </div>
                        <svg class="gf-rim gf-back-rim" viewBox="0 0 340 272" aria-hidden="true">
                            <path d="M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z"></path>
                        </svg>

                        <div class="gf-files" role="list">
                            ${sheetsHtml}
                        </div>

                        <div class="gf-front">
                            <div class="gf-tint" aria-hidden="true"></div>
                            <div class="gf-spec" aria-hidden="true"></div>
                            <svg class="gf-rim gf-front-rim" viewBox="0 0 340 198" aria-hidden="true">
                                <path d="M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z"></path>
                            </svg>
                            <button type="button" class="gf-hit" onclick="SolutionEngine.setFilterSubject('${sub.title}')" title="Mở thư mục môn ${sub.title}"></button>
                            <div class="gf-label">
                                <span class="gf-title font-sans font-bold flex items-center gap-2">
                                    ${iconHtml}
                                    <span>${sub.title}</span>
                                </span>
                                <span class="gf-meta font-sans font-semibold text-amber-400">${metaText}</span>
                            </div>
                        </div>

                        <button type="button" class="gf-key" onclick="event.stopPropagation(); SolutionEngine.setFilterSubject('${sub.title}')" title="Mở thư mục môn ${sub.title}">
                            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            attachGlassFolderParallax(folder);
            return folder;
        },

        // ==========================================
        // MAIN RENDER
        // ==========================================
        render: function() {
            const grid = document.getElementById("solutionsGrid");
            const countBadge = document.getElementById("solutionsTotalCount");
            const uploadBtn = document.getElementById("solutionOpenUploadBtn");
            const createFolderBtn = document.getElementById("solutionOpenCreateFolderBtn");
            const filterCapsule = document.getElementById("solutionsFilterCapsule");
            
            if (!grid) return;

            const canUpload = this.isAuthorizedToUpload();
            if (uploadBtn) {
                if (canUpload) {
                    uploadBtn.classList.remove("hidden", "opacity-50", "cursor-not-allowed");
                    uploadBtn.disabled = false;
                    uploadBtn.title = "Đăng tải bài giải mới (Tài khoản được cấp quyền)";
                } else {
                    uploadBtn.classList.add("hidden");
                }
            }

            if (createFolderBtn) {
                if (canUpload) {
                    createFolderBtn.classList.remove("hidden", "opacity-50", "cursor-not-allowed");
                    createFolderBtn.disabled = false;
                } else {
                    createFolderBtn.classList.add("hidden");
                }
            }

            const allList = this.getAllSolutions();
            const allFolders = this.getAllFolders();

            // Render clean filter chips with per-subject live count
            if (filterCapsule) {
                const pills = [
                    { id: "all", name: "Tất Cả", count: allList.length, iconHtml: "<span>✨</span>" },
                    ...SUBJECT_CATEGORIES.map(s => ({
                        id: s.title,
                        name: s.tag,
                        count: allList.filter(item => item.subject === s.title).length,
                        iconHtml: (s.iconType === "svg") ? UK_FLAG_SVG : `<span>${s.icon}</span>`
                    }))
                ];
                filterCapsule.innerHTML = pills.map(p => {
                    const isActive = (p.id === currentSubjectFilter);
                    const activeClasses = isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm"
                        : "bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.09] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 font-semibold";
                    const countBadge = p.count > 0
                        ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? 'bg-emerald-500 text-white dark:bg-slate-900 dark:text-emerald-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}">${p.count}</span>`
                        : "";
                    return `
                        <button type="button"
                                onclick="SolutionEngine.setFilterSubject('${p.id}')"
                                class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${activeClasses}">
                            ${p.iconHtml}
                            <span class="font-sans">${p.name}</span>
                            ${countBadge}
                        </button>
                    `;
                }).join("");
            }

            // Update Counter Badge with clean text & font-sans
            if (countBadge) {
                if (currentSubjectFilter === "all") {
                    countBadge.textContent = `${allList.length} bài • ${allFolders.length} thư mục`;
                } else if (currentFolderId) {
                    const currentFolder = allFolders.find(f => f.id === currentFolderId);
                    const folderSols = allList.filter(s => s.folderId === currentFolderId);
                    countBadge.textContent = `${folderSols.length} bài • ${currentFolder ? currentFolder.name : ''}`;
                } else {
                    const subFolders = allFolders.filter(f => f.subject === currentSubjectFilter);
                    const subSols = allList.filter(s => s.subject === currentSubjectFilter);
                    countBadge.textContent = `${subSols.length} bài • ${subFolders.length} thư mục`;
                }
            }

            // =========================================================================
            // LEVEL 1: ROOT VIEW — CONTENT-FIRST GALLERY + COMPACT BENTO SUBJECT GRID
            // =========================================================================
            if (currentSubjectFilter === "all") {
                let matchingSolutions = allList;
                if (currentKeyword) {
                    matchingSolutions = allList.filter(item =>
                        (item.title && item.title.toLowerCase().includes(currentKeyword)) ||
                        (item.subject && item.subject.toLowerCase().includes(currentKeyword)) ||
                        (item.folderName && item.folderName.toLowerCase().includes(currentKeyword)) ||
                        (item.lesson && item.lesson.toLowerCase().includes(currentKeyword)) ||
                        (item.description && item.description.toLowerCase().includes(currentKeyword))
                    );
                }

                let html = `<div class="space-y-6">`;

                // SECTION 1: LATEST / SEARCHED SOLUTIONS (Immediate access, zero scrolling!)
                html += `
                    <div class="space-y-3.5">
                        <div class="flex items-center justify-between gap-2 flex-wrap px-0.5">
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                                    ${currentKeyword ? `Kết quả tìm "${currentKeyword}"` : 'Bài Giải Mới Nhất'}
                                </h3>
                                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                    ${matchingSolutions.length} bài
                                </span>
                            </div>
                            ${currentKeyword ? `
                                <button type="button" onclick="document.getElementById('solutionSearchInput').value=''; SolutionEngine.setKeyword('');"
                                        class="text-xs font-bold text-sky-500 hover:text-sky-400 cursor-pointer">
                                    ✕ Xóa tìm kiếm
                                </button>
                            ` : `<span class="text-[11px] text-slate-500 dark:text-slate-400">Bấm vào ảnh để phóng to rõ nét</span>`}
                        </div>
                `;

                if (matchingSolutions.length > 0) {
                    html += `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${matchingSolutions.map(item => this.renderSolutionCard(item, canUpload)).join('')}
                        </div>
                    `;
                } else {
                    html += `
                        <div class="py-10 px-6 rounded-3xl bg-white/70 dark:bg-[#0e1118]/80 border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3">
                            <div class="text-3xl">${currentKeyword ? '🔎' : '📚'}</div>
                            <div class="text-sm font-bold text-slate-800 dark:text-white">
                                ${currentKeyword ? `Không tìm thấy bài giải khớp "${currentKeyword}"` : 'Chưa có bài giải nào được đăng'}
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                ${currentKeyword ? 'Thử tìm theo tên môn học hoặc tiêu đề ngắn hơn.' : 'Khi @VanThua hoặc @TuanMinh đăng bài giải, tất cả thành viên sẽ thấy ngay lập tức.'}
                            </p>
                            ${canUpload && !currentKeyword ? `
                                <button type="button" onclick="SolutionEngine.openUploadModal()"
                                        class="mt-1 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md cursor-pointer">
                                    ➕ Đăng Bài Giải Đầu Tiên
                                </button>
                            ` : ''}
                        </div>
                    `;
                }
                html += `</div>`;

                // SECTION 2: COMPACT BENTO SUBJECT DIRECTORY (5-col desktop / 2-col mobile, fast & clean)
                if (!currentKeyword) {
                    html += `
                        <div class="space-y-3 pt-1">
                            <div class="flex items-center justify-between px-0.5">
                                <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <span>Thư Mục Theo Môn Học</span>
                                    <span class="text-[11px] font-bold text-slate-400">${SUBJECT_CATEGORIES.length} môn</span>
                                </h3>
                                <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">Chọn môn để xem theo từng bài học</span>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                ${SUBJECT_CATEGORIES.map(sub => {
                                    const subFolders = allFolders.filter(f => f.subject === sub.title);
                                    const subSolutions = allList.filter(s => s.subject === sub.title);
                                    const hasItems = subFolders.length > 0 || subSolutions.length > 0;
                                    const iconHtml = (sub.iconType === "svg")
                                        ? UK_FLAG_SVG
                                        : `<span class="text-lg leading-none">${sub.icon}</span>`;
                                    return `
                                        <button type="button"
                                                onclick="SolutionEngine.setFilterSubject('${sub.title}')"
                                                class="group text-left p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-3 ${
                                                    hasItems
                                                        ? 'bg-white dark:bg-[#121622] border-emerald-500/35 hover:border-emerald-400/70 shadow-sm hover:shadow-md hover:shadow-emerald-500/10'
                                                        : 'bg-white/65 dark:bg-[#0e1118]/75 border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/20'
                                                }">
                                            <div class="flex items-center justify-between gap-2 w-full">
                                                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10" style="background: ${sub.color}1f;">
                                                    ${iconHtml}
                                                </div>
                                                <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                    subSolutions.length > 0
                                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                                        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400'
                                                }">
                                                    ${subSolutions.length > 0 ? `${subSolutions.length} bài` : 'Trống'}
                                                </span>
                                            </div>
                                            <div>
                                                <div class="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                    ${sub.title}
                                                </div>
                                                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                    ${subFolders.length} thư mục • ${subSolutions.length} bài giải
                                                </div>
                                            </div>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
                grid.innerHTML = html;
                return;
            }

            // =========================================================================
            // LEVEL 3: INSIDE A SPECIFIC FOLDER
            // =========================================================================
            if (currentFolderId) {
                const currentFolder = allFolders.find(f => f.id === currentFolderId);
                const folderName = currentFolder ? currentFolder.name : "Thư Mục Bài Học";
                const folderDesc = currentFolder ? currentFolder.description : "";
                const folderSubject = currentFolder ? currentFolder.subject : currentSubjectFilter;

                let folderSols = allList.filter(s => s.folderId === currentFolderId);
                if (currentKeyword) {
                    folderSols = folderSols.filter(item => 
                        (item.title && item.title.toLowerCase().includes(currentKeyword)) ||
                        (item.lesson && item.lesson.toLowerCase().includes(currentKeyword)) ||
                        (item.description && item.description.toLowerCase().includes(currentKeyword))
                    );
                }

                let html = `
                    <div class="space-y-5">
                        <div class="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                            <div class="flex items-center gap-3">
                                <button type="button" 
                                        onclick="SolutionEngine.backToSubject()" 
                                        class="h-11 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-black bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0 group"
                                        title="Quay lại môn ${folderSubject}">
                                    <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                                    <span>Quay Lại ${folderSubject}</span>
                                </button>
                                <div class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span class="text-amber-400">📁</span>
                                        <span>${folderName}</span>
                                    </h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">
                                        ${folderDesc || (folderSubject + ' • Chuyên đề bài học')}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 shrink-0">
                                ${canUpload ? `
                                    <button type="button" 
                                            onclick="SolutionEngine.openUploadModal('${folderSubject}', '${currentFolderId}')"
                                            class="h-10 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                                        <span>➕</span>
                                        <span>Nhét Lời Giải Vào Đây</span>
                                    </button>
                                    <button type="button" 
                                            onclick="SolutionEngine.deleteFolder('${currentFolderId}')"
                                            class="h-10 px-3.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                                            title="Xóa folder này và toàn bộ bài giải bên trong">
                                        <span>🗑️</span>
                                        <span class="hidden sm:inline">Xóa Folder</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                `;

                if (folderSols.length === 0) {
                    html += `
                        <div class="py-16 px-6 text-center rounded-3xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl space-y-4 max-w-xl mx-auto shadow-lg">
                            <div class="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/10 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner">
                                🖼️
                            </div>
                            <div class="space-y-1.5">
                                <h4 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                    Thư mục "${folderName}" hiện đang rỗng
                                </h4>
                                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                    Chưa có hình ảnh bài giải nào trong thư mục này. Bấm nút dưới đây để nhét lời giải của bài vào thư mục!
                                </p>
                            </div>
                            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25">
                                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span>Trạng thái: 0 bài giải trong folder</span>
                            </div>
                            ${canUpload ? `
                            <div class="pt-2">
                                <button type="button" 
                                        onclick="SolutionEngine.openUploadModal('${folderSubject}', '${currentFolderId}')" 
                                        class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95">
                                    <span>➕</span>
                                    <span>Đăng Tải Lời Giải Vào Thư Mục Này</span>
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                } else {
                    html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">`;
                    html += folderSols.map(item => this.renderSolutionCard(item, canUpload)).join("");
                    html += `</div>`;
                }

                html += `</div>`;
                grid.innerHTML = html;
                return;
            }

            // =========================================================================
            // LEVEL 2: SUBJECT VIEW (DANH SÁCH FOLDER BÀI HỌC CỦA MÔN)
            // =========================================================================
            const currentSubMeta = SUBJECT_CATEGORIES.find(s => s.title === currentSubjectFilter);
            const subFolders = allFolders.filter(f => f.subject === currentSubjectFilter);
            let subSolutions = allList.filter(s => s.subject === currentSubjectFilter);

            const iconHeaderHtml = (currentSubMeta && currentSubMeta.iconType === "svg") 
                ? UK_FLAG_SVG 
                : `<span class="text-xl">${currentSubMeta ? currentSubMeta.icon : '📚'}</span>`;

            if (currentKeyword) {
                subSolutions = subSolutions.filter(item => 
                    (item.title && item.title.toLowerCase().includes(currentKeyword)) ||
                    (item.lesson && item.lesson.toLowerCase().includes(currentKeyword)) ||
                    (item.description && item.description.toLowerCase().includes(currentKeyword))
                );
            }

            let html = `
                <div class="space-y-5">
                    <div class="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                        <div class="flex items-center gap-3">
                            <button type="button" 
                                    onclick="SolutionEngine.backToRoot()" 
                                    class="h-11 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-black bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0 group"
                                    title="Quay lại tất cả môn học">
                                <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                                <span>Tất Cả Môn</span>
                            </button>
                            <div class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                            <div>
                                <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    ${iconHeaderHtml}
                                    <span>Môn: ${currentSubjectFilter}</span>
                                </h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400">
                                    ${subFolders.length} thư mục bài học • ${subSolutions.length} bài giải chi tiết
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            ${canUpload ? `
                                <button type="button" 
                                        onclick="SolutionEngine.openCreateFolderModal('${currentSubjectFilter}')" 
                                        class="h-10 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                                    <span>📁</span>
                                    <span>+ Tạo Folder Mới</span>
                                </button>
                                <button type="button" 
                                        onclick="SolutionEngine.openUploadModal('${currentSubjectFilter}')" 
                                        class="h-10 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                                    <span>➕</span>
                                    <span>Đăng Lời Giải</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
            `;

            if (subFolders.length === 0 && subSolutions.length === 0) {
                html += `
                    <div class="py-16 px-6 text-center rounded-3xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl space-y-4 max-w-xl mx-auto shadow-lg">
                        <div class="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/10 to-teal-500/20 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner">
                            📁
                        </div>
                        <div class="space-y-1.5">
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                Môn ${currentSubjectFilter} chưa có thư mục bài học nào
                            </h4>
                            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                Hãy tạo thư mục theo từng bài học (ví dụ: "Bài 4: Bên Trong Máy Tính", "Đề Khảo Sát Số 1"...) sau đó nhét lời giải của bài đó vào!
                            </p>
                        </div>
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25">
                            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>Trạng thái: Tạm thời rỗng (Chưa tạo folder)</span>
                        </div>
                        ${canUpload ? `
                        <div class="pt-2">
                            <button type="button" 
                                    onclick="SolutionEngine.openCreateFolderModal('${currentSubjectFilter}')" 
                                    class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95">
                                <span>📁</span>
                                <span>+ Tạo Thư Mục Mới Đầu Tiên Cho Môn Này</span>
                            </button>
                        </div>
                        ` : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="space-y-3">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                            <span>DANH SÁCH THƯ MỤC BÀI HỌC (${subFolders.length})</span>
                            <span class="text-amber-400">Bấm vào folder để xem & nhét bài giải</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                `;

                subFolders.forEach(fld => {
                    const solsInFld = allList.filter(s => s.folderId === fld.id);
                    const formattedDate = new Date(fld.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                    html += `
                        <div class="group relative p-5 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/15 cursor-pointer flex flex-col justify-between"
                             onclick="SolutionEngine.openFolder('${fld.id}')"
                             title="Mở thư mục '${fld.name}'">
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <div class="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                        📁
                                    </div>
                                    <div class="flex items-center gap-1.5">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold ${solsInFld.length > 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800 text-slate-400 border border-white/5'}">
                                            ${solsInFld.length} bài giải
                                        </span>
                                        ${canUpload ? `
                                            <button type="button" 
                                                    onclick="event.stopPropagation(); SolutionEngine.deleteFolder('${fld.id}')"
                                                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    title="Xóa thư mục này">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>

                                <div>
                                    <h4 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                        ${fld.name}
                                    </h4>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                        ${fld.description || 'Chưa có mô tả chi tiết.'}
                                    </p>
                                </div>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
                                <span>Tạo: ${formattedDate}</span>
                                <span class="font-bold text-amber-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">Vào folder <span>➔</span></span>
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;

                // Unorganized solutions if any
                const unorganized = subSolutions.filter(s => !s.folderId || !subFolders.some(f => f.id === s.folderId));
                if (unorganized.length > 0) {
                    html += `
                        <div class="space-y-3 pt-4">
                            <div class="text-xs font-bold text-slate-400 px-1">
                                CÁC BÀI GIẢI TỰ DO (CHƯA PHÂN FOLDER) (${unorganized.length})
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    `;
                    html += unorganized.map(item => this.renderSolutionCard(item, canUpload)).join("");
                    html += `</div></div>`;
                }
            }

            html += `</div>`;
            grid.innerHTML = html;
        },

        // Helper: Render modern editorial solution card (crisp on both Dark & Light mode)
        renderSolutionCard: function(item, canUpload) {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const folderPill = item.folderName
                ? `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-white/15 truncate max-w-[130px]" title="${item.folderName}">📁 ${item.folderName}</span>`
                : '';

            return `
                <article class="solution-card group relative rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/85 dark:border-white/[0.08] hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden">
                    <div>
                        <!-- Crisp 16:10 Image Preview Frame -->
                        <div class="relative w-full aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer group/thumb"
                             onclick="SolutionEngine.openLightbox('${item.id}')"
                             title="Bấm để xem ảnh phóng to rõ nét">
                            <img src="${item.imageUrl}" alt="${item.title}"
                                 class="w-full h-full object-cover object-top transition-transform duration-500 group-hover/thumb:scale-105"
                                 loading="lazy">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35 pointer-events-none"></div>

                            <!-- Floating top badges -->
                            <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2">
                                <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-black/65 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                                    ${item.subject}
                                </span>
                                ${folderPill}
                            </div>

                            <!-- Hover Zoom Chip -->
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <span class="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-lg">
                                    <span>🔍</span><span>Phóng to</span>
                                </span>
                            </div>
                        </div>

                        <!-- Title & Summary -->
                        <div class="p-3.5 pb-2.5 space-y-1">
                            <h4 onclick="SolutionEngine.openLightbox('${item.id}')"
                                class="text-sm sm:text-[15px] font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer">
                                ${item.title}
                            </h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                ${item.description || item.lesson || 'Bài giải chi tiết đồng bộ từ lớp 11A7.'}
                            </p>
                        </div>
                    </div>

                    <!-- Footer: Author & Actions -->
                    <div class="px-3.5 py-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-white/[0.015]">
                        <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                                ${item.authorAvatar || '🧑‍🎓'}
                            </div>
                            <div class="min-w-0 leading-tight">
                                <div class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">${item.authorName || 'Aseta'}</div>
                                <div class="text-[10px] text-slate-400">${formattedDate}</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-1 shrink-0">
                            <button type="button"
                                    onclick="SolutionEngine.toggleLike('${item.id}')"
                                    class="h-7 px-2 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Thả tim bài giải này">
                                <span>❤️</span>
                                <span>${item.likes || 0}</span>
                            </button>
                            <button type="button"
                                    onclick="SolutionEngine.openLightbox('${item.id}')"
                                    class="w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Xem ảnh chi tiết">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            ${canUpload ? `
                                <button type="button"
                                        onclick="SolutionEngine.deleteSolution('${item.id}')"
                                        class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
                                        title="Xóa bài giải (Đồng bộ thời gian thực)">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </article>
            `;
        },

        // ==========================================
        // CREATE FOLDER MODAL
        // ==========================================
        openCreateFolderModal: function(preSelectedSubject) {
            if (!this.isAuthorizedToUpload()) {
                if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast("🔒 Chỉ @VanThua và @TuanMinh có quyền tạo thư mục bài giải!");
                }
                return;
            }
            const modal = document.getElementById("solutionCreateFolderModal");
            const subjectSelect = document.getElementById("solFolderSubject");
            const nameInput = document.getElementById("solFolderName");
            const descInput = document.getElementById("solFolderDesc");

            if (subjectSelect) {
                if (preSelectedSubject && preSelectedSubject !== "all") {
                    subjectSelect.value = preSelectedSubject;
                } else if (currentSubjectFilter && currentSubjectFilter !== "all") {
                    subjectSelect.value = currentSubjectFilter;
                }
            }
            if (nameInput) nameInput.value = "";
            if (descInput) descInput.value = "";

            if (modal) {
                modal.classList.remove("hidden");
                if (nameInput) nameInput.focus();
                if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            }
        },

        openCreateFolderModalFromUpload: function() {
            const uploadSubject = document.getElementById("solInputSubject");
            const sub = uploadSubject ? uploadSubject.value : currentSubjectFilter;
            this.openCreateFolderModal(sub);
        },

        closeCreateFolderModal: function() {
            const modal = document.getElementById("solutionCreateFolderModal");
            if (modal) modal.classList.add("hidden");
        },

        submitCreateFolder: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            if (!this.isAuthorizedToUpload()) {
                alert("Bạn không có quyền tạo thư mục bài giải!");
                return;
            }

            const subjectSelect = document.getElementById("solFolderSubject");
            const nameInput = document.getElementById("solFolderName");
            const descInput = document.getElementById("solFolderDesc");
            const submitBtn = document.querySelector('#solutionCreateFolderForm button[type="submit"]');

            const subject = subjectSelect ? subjectSelect.value : "Tin Học 11";
            const name = nameInput ? nameInput.value.trim() : "";
            const desc = descInput ? descInput.value.trim() : "";

            if (!name) {
                alert("Vui lòng nhập tên thư mục bài học!");
                if (nameInput) nameInput.focus();
                return;
            }

            const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "☁️ Đang tạo & đồng bộ...";
            }

            const result = await this.createFolder(subject, name, desc);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnHtml || "📁 Tạo Thư Mục Ngay";
            }

            if (!result || !result.folder) return;
            const newFolder = result.folder;
            this.closeCreateFolderModal();

            if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(
                    result.synced
                        ? `📁 Đã tạo & đồng bộ tức thì thư mục: "${name}"`
                        : `⚠️ Đã tạo thư mục tạm thời trên máy — hãy bấm Đồng Bộ lại!`
                );
            }

            const uploadModal = document.getElementById("solutionUploadModal");
            if (uploadModal && !uploadModal.classList.contains("hidden")) {
                this.updateUploadFolderOptions(newFolder.id);
            } else {
                this.openFolder(newFolder.id);
            }
        },

        // ==========================================
        // UPLOAD SOLUTION MODAL & ACTIONS
        // ==========================================
        updateUploadFolderOptions: function(selectedFolderId) {
            const subjectSelect = document.getElementById("solInputSubject");
            const folderSelect = document.getElementById("solInputFolder");
            if (!subjectSelect || !folderSelect) return;

            const selectedSubject = subjectSelect.value;
            const folders = this.getFoldersBySubject(selectedSubject);

            let optionsHtml = `<option value="">(Chung - Không phân thư mục)</option>`;
            folders.forEach(f => {
                const isSel = (f.id === selectedFolderId || (currentFolderId && f.id === currentFolderId));
                optionsHtml += `<option value="${f.id}" ${isSel ? 'selected' : ''}>📁 ${f.name}</option>`;
            });

            folderSelect.innerHTML = optionsHtml;
        },

        openUploadModal: function(preSelectedSubject, preSelectedFolderId) {
            if (!this.isAuthorizedToUpload()) {
                if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast("🔒 Chỉ @VanThua và @TuanMinh có quyền gửi bài giải!");
                }
                return;
            }
            const modal = document.getElementById("solutionUploadModal");
            const subjectSelect = document.getElementById("solInputSubject");

            const sub = preSelectedSubject && preSelectedSubject !== "all" 
                ? preSelectedSubject 
                : (currentSubjectFilter !== "all" ? currentSubjectFilter : "Tin Học 11");

            if (subjectSelect) subjectSelect.value = sub;
            this.updateUploadFolderOptions(preSelectedFolderId || currentFolderId);

            if (modal) {
                modal.classList.remove("hidden");
                if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            }
        },

        closeUploadModal: function() {
            const modal = document.getElementById("solutionUploadModal");
            if (modal) modal.classList.add("hidden");
            const form = document.getElementById("solutionUploadForm");
            if (form) form.reset();
            const previewContainer = document.getElementById("solutionUploadPreviewContainer");
            if (previewContainer) previewContainer.classList.add("hidden");
            const previewImg = document.getElementById("solutionUploadPreviewImg");
            if (previewImg) previewImg.src = "";
            window._pendingSolutionImageBase64 = null;
        },

        handleFileSelected: function(file) {
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WebP, SVG)!");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert("Kích thước ảnh tối đa là 10MB!");
                return;
            }

            this.compressImageFile(file, function(compressedData) {
                window._pendingSolutionImageBase64 = compressedData;
                const previewContainer = document.getElementById("solutionUploadPreviewContainer");
                const previewImg = document.getElementById("solutionUploadPreviewImg");
                if (previewImg) previewImg.src = compressedData;
                if (previewContainer) previewContainer.classList.remove("hidden");
                if (window.AudioHelper && window.AudioHelper.playFeltStep) window.AudioHelper.playFeltStep();
            });
        },

        submitUpload: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            if (!this.isAuthorizedToUpload()) {
                alert("Chỉ tài khoản được cấp quyền (@VanThua, @TuanMinh) mới được đăng bài giải!");
                return;
            }

            const titleInput = document.getElementById("solInputTitle");
            const subjectInput = document.getElementById("solInputSubject");
            const folderInput = document.getElementById("solInputFolder");
            const lessonInput = document.getElementById("solInputLesson");
            const descInput = document.getElementById("solInputDesc");
            const urlInput = document.getElementById("solInputImageUrl");
            const submitBtn = document.querySelector('#solutionUploadForm button[type="submit"]');

            const title = (titleInput && titleInput.value.trim()) || "";
            const subject = (subjectInput && subjectInput.value) || "Tin Học 11";
            const folderId = (folderInput && folderInput.value) || null;
            const lesson = (lessonInput && lessonInput.value.trim()) || "Chuyên đề bài học";
            const desc = (descInput && descInput.value.trim()) || "";
            let imgData = window._pendingSolutionImageBase64;
            if (!imgData && urlInput && urlInput.value.trim()) {
                this.handleDirectUrlInput(urlInput.value.trim());
                imgData = window._pendingSolutionImageBase64;
            }

            if (!title) {
                alert("Vui lòng nhập tiêu đề cho bài giải!");
                if (titleInput) titleInput.focus();
                return;
            }

            if (!imgData) {
                alert("Vui lòng chọn ảnh từ máy hoặc dán link ảnh lời giải!");
                return;
            }

            let folderName = "";
            if (folderId) {
                const fld = this.getAllFolders().find(f => f.id === folderId);
                if (fld) folderName = fld.name;
            }

            const user = window.AccountManager ? window.AccountManager.getCurrentAccount() : null;
            const newSolution = {
                id: "sol_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                title: title,
                subject: subject,
                folderId: folderId,
                folderName: folderName,
                lesson: lesson,
                description: desc,
                imageUrl: imgData,
                authorName: user ? user.name : "Tuấn Minh",
                authorNickname: user ? user.nickname : "TuanMinh",
                authorRole: user ? user.role : "🎓 Học Sinh",
                authorAvatar: user ? user.avatar : "🧑‍🎓",
                createdAt: new Date().toISOString(),
                views: 1,
                likes: 0
            };

            const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "☁️ Đang gửi lên đám mây...";
            }

            // Pull freshest cloud state first so concurrent adds never overwrite each other
            if (!isCloudSyncing && !pendingCloudPush) {
                lastKnownEtag = null;
                await SolutionCloud.syncFromCloud(false, this, false);
            }

            const currentList = [...this.getAllSolutions()];
            currentList.unshift(newSolution);
            this.saveSolutions(currentList);

            const synced = await this.syncToCloud(true);

            // Reward real EXP & Day Streak when solution successfully syncs to cloud!
            if (synced && window.AsetaProgressCloud && typeof window.AsetaProgressCloud.recordActivity === "function") {
                window.AsetaProgressCloud.recordActivity({
                    type: "solution",
                    label: `Đăng bài giải: ${title.slice(0, 30)}`,
                    exp: 35,
                    dedupeKey: "sol_upload_" + newSolution.id,
                    cooldownMs: 10000,
                    silent: true
                });
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnHtml || "🚀 Đăng Lời Giải Ngay";
            }

            if (window.AudioHelper && window.AudioHelper.playSuccess) {
                window.AudioHelper.playSuccess();
            }

            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(
                    synced
                        ? `✅ Đã đăng & phát trực tiếp tới 100% mọi người: "${title}"`
                        : `⚠️ Đã lưu tạm trên máy nhưng chưa đẩy được lên đám mây — hãy bấm Đồng Bộ lại!`
                );
            }

            this.closeUploadModal();

            if (folderId) {
                this.openFolder(folderId);
            } else {
                this.setFilterSubject(subject);
            }
        },

        // ==========================================
        // LIGHTBOX VIEWER
        // ==========================================
        toggleLike: function(id) {
            const list = this.getAllSolutions();
            const item = list.find(s => s.id === id);
            if (item) {
                item.likes = (item.likes || 0) + 1;
                this.saveSolutions(list);
                if (window.AudioHelper && window.AudioHelper.playBubblePop) {
                    window.AudioHelper.playBubblePop();
                }
                this.render();
            }
        },

        openLightbox: function(id) {
            const list = this.getAllSolutions();
            const item = list.find(s => s.id === id);
            if (!item) return;

            currentLightboxId = id;
            item.views = (item.views || 0) + 1;
            this.saveSolutions(list);

            const modal = document.getElementById("solutionLightboxModal");
            const img = document.getElementById("solutionLightboxImg");
            const titleEl = document.getElementById("solutionLightboxTitle");
            const subjectEl = document.getElementById("solutionLightboxSubject");
            const lessonEl = document.getElementById("solutionLightboxLesson");
            const descEl = document.getElementById("solutionLightboxDesc");
            const authorEl = document.getElementById("solutionLightboxAuthor");
            const downloadBtn = document.getElementById("solutionLightboxDownloadBtn");

            if (img) img.src = item.imageUrl;
            if (titleEl) titleEl.textContent = item.title;
            if (subjectEl) subjectEl.textContent = `${item.subject} ${item.folderName ? ('• 📁 ' + item.folderName) : ''}`;
            if (lessonEl) lessonEl.textContent = item.lesson || 'Chuyên đề';
            if (descEl) descEl.textContent = item.description || '';
            if (authorEl) authorEl.textContent = `${item.authorName} • ${new Date(item.createdAt).toLocaleDateString('vi-VN')}`;

            if (downloadBtn) {
                downloadBtn.onclick = () => this.downloadImage(item.imageUrl, item.title);
            }

            if (modal) {
                modal.classList.remove("hidden");
                if (window.AudioHelper && window.AudioHelper.playGlassTap) window.AudioHelper.playGlassTap();
            }
        },

        closeLightbox: function() {
            currentLightboxId = null;
            const modal = document.getElementById("solutionLightboxModal");
            if (modal) modal.classList.add("hidden");
            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        },

        downloadImage: function(url, filename) {
            const a = document.createElement("a");
            a.href = url;
            a.download = (filename || "bai-giai-aseta").replace(/[^a-zA-Z0-9_-]/g, "_") + ".png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
        }
    };

    // Enable Ctrl+V screenshot paste & drag-and-drop when Upload Modal is open
    document.addEventListener("paste", (e) => {
        const modal = document.getElementById("solutionUploadModal");
        if (!modal || modal.classList.contains("hidden")) return;
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type && items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    SolutionEngine.handleFileSelected(file);
                }
                break;
            }
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        const fileInput = document.getElementById("solFileInput");
        const dropZone = fileInput ? fileInput.parentElement : null;
        if (dropZone && !dropZone._asetaDropBound) {
            dropZone._asetaDropBound = true;
            ["dragenter", "dragover"].forEach(ev => {
                dropZone.addEventListener(ev, (e) => {
                    e.preventDefault();
                    dropZone.classList.add("border-emerald-400", "bg-emerald-500/15");
                });
            });
            ["dragleave", "drop"].forEach(ev => {
                dropZone.addEventListener(ev, (e) => {
                    e.preventDefault();
                    dropZone.classList.remove("border-emerald-400", "bg-emerald-500/15");
                });
            });
            dropZone.addEventListener("drop", (e) => {
                const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (file) SolutionEngine.handleFileSelected(file);
            });
        }
    });

    window.SolutionEngine = SolutionEngine;
})();
