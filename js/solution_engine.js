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

    const SolutionEngine = {
        STORAGE_KEY: STORAGE_KEY,
        FOLDER_STORAGE_KEY: FOLDER_STORAGE_KEY,
        SUBJECTS: SUBJECT_CATEGORIES,
        UK_FLAG_SVG: UK_FLAG_SVG,

        isAuthorizedToUpload: function() {
            try {
                if (window.AccountManager && typeof window.AccountManager.getCurrentAccount === "function") {
                    const user = window.AccountManager.getCurrentAccount();
                    if (user) {
                        if (user.isAdmin) return true;
                        if (user.nickname && (user.nickname.toLowerCase() === "vanthua" || user.nickname.toLowerCase() === "hocsinh11")) return true;
                        if (user.role && (user.role.includes("Admin") || user.role.includes("Quản Trị") || user.role.includes("Giáo Viên") || user.role.includes("VIP"))) return true;
                    }
                }

                const currId = localStorage.getItem("azota_current_account_id") || localStorage.getItem("aseta_current_account_id");
                if (currId === "acc_vanthua") return true;

                const accountsRaw = localStorage.getItem("azota_accounts_list") || localStorage.getItem("aseta_accounts_list");
                if (accountsRaw) {
                    try {
                        const accounts = JSON.parse(accountsRaw);
                        const activeId = currId || "acc_vanthua";
                        const acc = accounts.find(a => a.id === activeId);
                        if (acc) {
                            if (acc.isAdmin) return true;
                            if (acc.nickname && (acc.nickname.toLowerCase() === "vanthua" || acc.nickname.toLowerCase() === "hocsinh11")) return true;
                            if (acc.role && (acc.role.includes("Admin") || acc.role.includes("Quản Trị") || acc.role.includes("Giáo Viên") || acc.role.includes("VIP"))) return true;
                        }
                    } catch(e) {}
                }

                const profileRaw = localStorage.getItem("azota_user_profile") || localStorage.getItem("aseta_user_profile");
                if (profileRaw) {
                    try {
                        const prof = JSON.parse(profileRaw);
                        if (prof.nickname && (prof.nickname.toLowerCase() === "vanthua" || prof.nickname.toLowerCase() === "hocsinh11")) return true;
                    } catch(e) {}
                }

                // Default initial account in system is acc_vanthua (Admin)
                if (!currId) return true;

                return false;
            } catch(e) {
                return true; // Fallback to allow Admin testing
            }
        },

        // ==========================================
        // FOLDER CRUD
        // ==========================================
        getAllFolders: function() {
            try {
                const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
                if (raw) {
                    const list = JSON.parse(raw);
                    if (Array.isArray(list)) return list;
                }
            } catch(e) {}
            return [];
        },

        saveFolders: function(list) {
            try {
                localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(list || []));
            } catch(e) {}
        },

        getFoldersBySubject: function(subject) {
            const list = this.getAllFolders();
            if (!subject || subject === "all") return list;
            return list.filter(f => f.subject === subject);
        },

        createFolder: function(subject, name, desc) {
            const cleanName = (name || "").trim();
            if (!cleanName) return null;

            const newFolder = {
                id: "fld_" + Date.now(),
                subject: subject || "Tin Học 11",
                name: cleanName,
                description: (desc || "").trim(),
                createdAt: new Date().toISOString()
            };

            const list = this.getAllFolders();
            list.unshift(newFolder);
            this.saveFolders(list);
            return newFolder;
        },

        deleteFolder: function(folderId) {
            if (!this.isAuthorizedToUpload()) {
                alert("Bạn không có quyền xóa thư mục!");
                return;
            }

            const folders = this.getAllFolders();
            const target = folders.find(f => f.id === folderId);
            const folderName = target ? target.name : "thư mục này";

            if (!confirm(`Bạn có chắc muốn xóa thư mục "${folderName}"?\nToàn bộ các lời giải và hình ảnh bên trong thư mục này cũng sẽ bị xóa vĩnh viễn!`)) {
                return;
            }

            const newFolders = folders.filter(f => f.id !== folderId);
            this.saveFolders(newFolders);

            let solutions = this.getAllSolutions();
            const deletedCount = solutions.filter(s => s.folderId === folderId).length;
            solutions = solutions.filter(s => s.folderId !== folderId);
            this.saveSolutions(solutions);

            if (currentFolderId === folderId) {
                currentFolderId = null;
            }

            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(`🗑️ Đã xóa thư mục "${folderName}" (${deletedCount} lời giải).`);
            }

            this.render();
        },

        // ==========================================
        // SOLUTION CRUD
        // ==========================================
        getAllSolutions: function() {
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
                        if (valid.length !== list.length) {
                            this.saveSolutions(valid);
                        }
                        return valid;
                    }
                }
            } catch(e) {}
            this.saveSolutions([]);
            return [];
        },

        saveSolutions: function(list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
            } catch(e) {}
        },

        deleteSolution: function(id) {
            if (!this.isAuthorizedToUpload()) {
                alert("Bạn không có quyền xóa bài giải này!");
                return;
            }

            if (!confirm("Bạn có chắc chắn muốn xóa bài giải này khỏi hệ thống?")) return;

            let currentList = this.getAllSolutions();
            currentList = currentList.filter(s => s.id !== id);
            this.saveSolutions(currentList);

            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast("🗑️ Đã xóa thành công bài giải.");
            }
            this.render();
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
                    uploadBtn.classList.remove("opacity-50", "cursor-not-allowed");
                    uploadBtn.title = "Đăng tải bài giải mới (Tài khoản đã cấp quyền)";
                } else {
                    uploadBtn.classList.add("opacity-50", "cursor-not-allowed");
                    uploadBtn.title = "Chỉ tài khoản được cấp quyền (Admin / Giáo viên / VIP) mới có quyền đăng bài giải";
                }
            }

            if (createFolderBtn) {
                if (canUpload) {
                    createFolderBtn.classList.remove("opacity-50", "cursor-not-allowed");
                } else {
                    createFolderBtn.classList.add("opacity-50", "cursor-not-allowed");
                }
            }

            const allList = this.getAllSolutions();
            const allFolders = this.getAllFolders();

            // Render filter pill buttons at the top (Tiếng Anh dùng Vector UK Flag SVG)
            if (filterCapsule) {
                const pills = [
                    { id: "all", name: `Tất Cả (${SUBJECT_CATEGORIES.length} Môn)`, iconHtml: "<span>✨</span>" },
                    ...SUBJECT_CATEGORIES.map(s => ({
                        id: s.title,
                        name: s.tag,
                        iconHtml: (s.iconType === "svg") ? UK_FLAG_SVG : `<span>${s.icon}</span>`
                    }))
                ];
                filterCapsule.innerHTML = pills.map(p => {
                    const isActive = (p.id === currentSubjectFilter);
                    const activeClasses = isActive 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-md shadow-emerald-500/30 scale-102"
                        : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5";
                    return `
                        <button type="button" 
                                onclick="SolutionEngine.setFilterSubject('${p.id}')"
                                class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${activeClasses}">
                            ${p.iconHtml}
                            <span class="font-sans">${p.name}</span>
                        </button>
                    `;
                }).join("");
            }

            // Update Counter Badge with clean text & font-sans
            if (countBadge) {
                if (currentSubjectFilter === "all") {
                    countBadge.textContent = `${allFolders.length} thư mục • ${allList.length} bài giải`;
                } else if (currentFolderId) {
                    const currentFolder = allFolders.find(f => f.id === currentFolderId);
                    const folderSols = allList.filter(s => s.folderId === currentFolderId);
                    countBadge.textContent = `${folderSols.length} bài giải (${currentFolder ? currentFolder.name : ''})`;
                } else {
                    const subFolders = allFolders.filter(f => f.subject === currentSubjectFilter);
                    const subSols = allList.filter(s => s.subject === currentSubjectFilter);
                    countBadge.textContent = `${subFolders.length} thư mục • ${subSols.length} bài giải (${currentSubjectFilter})`;
                }
            }

            // =========================================================================
            // LEVEL 1: ROOT VIEW (3D GLASS FOLDERS GIỐNG HỆT TRANG KHO ĐỀ)
            // =========================================================================
            if (currentSubjectFilter === "all" && !currentKeyword) {
                grid.innerHTML = "";

                // Header info
                const headerDiv = document.createElement("div");
                headerDiv.className = "flex items-center justify-between flex-wrap gap-2 mb-6";
                headerDiv.innerHTML = `
                    <div>
                        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Danh Sách Thư Mục Môn Học 3D</span>
                            <span class="text-xs text-amber-500 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">${SUBJECT_CATEGORIES.length} môn</span>
                        </h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Bấm vào từng thư mục 3D để xem các bài học và lời giải chi tiết bên trong
                        </p>
                    </div>
                    <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                        Hiển thị ${SUBJECT_CATEGORIES.length} / ${SUBJECT_CATEGORIES.length} thư mục môn học 3D
                    </div>
                `;
                grid.appendChild(headerDiv);

                // 3D Glass Folders Container (Exact same class & styling as Kho Đề!)
                const foldersContainer = document.createElement("div");
                foldersContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 justify-items-center py-2";

                SUBJECT_CATEGORIES.forEach(sub => {
                    const subFolders = allFolders.filter(f => f.subject === sub.title);
                    const subSolutions = allList.filter(s => s.subject === sub.title);
                    const card = this.buildGlassFolderCard(sub, subFolders.length, subSolutions.length);
                    foldersContainer.appendChild(card);
                });

                grid.appendChild(foldersContainer);
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
                                        class="h-10 px-3.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group"
                                        title="Quay lại môn ${folderSubject}">
                                    <span class="transform group-hover:-translate-x-1 transition-transform">←</span>
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
                                    class="h-10 px-3.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group"
                                    title="Quay lại danh mục môn học">
                                <span class="transform group-hover:-translate-x-1 transition-transform">←</span>
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

        // Helper: Render individual solution card
        renderSolutionCard: function(item, canUpload) {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return `
                <div class="solution-card group relative rounded-3xl bg-slate-900/80 dark:bg-black/70 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 p-4.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden">
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-2">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                                <span>📚</span>
                                <span>${item.subject}</span>
                            </span>
                            <span class="text-xs font-bold text-amber-400 truncate max-w-[140px]" title="${item.folderName || ''}">
                                📁 ${item.folderName || item.lesson || 'Chung'}
                            </span>
                        </div>

                        <div class="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950/80 border border-white/5 cursor-pointer group/thumb" onclick="SolutionEngine.openLightbox('${item.id}')" title="Bấm để xem ảnh phóng to chi tiết">
                            <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover object-top transition-transform duration-500 group-hover/thumb:scale-105" loading="lazy">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span class="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-lg transform -translate-y-2 group-hover/thumb:translate-y-0 transition-transform">
                                    <span>🔍</span>
                                    <span>Xem Ảnh Phóng To</span>
                                </span>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <h4 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                ${item.title}
                            </h4>
                            <p class="text-xs text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                ${item.description || 'Không có mô tả bổ sung.'}
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                ${item.authorAvatar || '🧑‍🏫'}
                            </div>
                            <div class="min-w-0">
                                <div class="text-xs font-bold text-slate-300 truncate">${item.authorName || 'Giáo viên'}</div>
                                <div class="text-[10px] text-slate-500">${formattedDate}</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" 
                                    onclick="SolutionEngine.toggleLike('${item.id}')" 
                                    class="px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer" 
                                    title="Thả tim bài giải này">
                                <span>❤️</span>
                                <span class="text-xs font-bold">${item.likes || 0}</span>
                            </button>
                            <button type="button" 
                                    onclick="SolutionEngine.openLightbox('${item.id}')" 
                                    class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer" 
                                    title="Xem chi tiết">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            ${canUpload ? `
                                <button type="button" 
                                        onclick="SolutionEngine.deleteSolution('${item.id}')" 
                                        class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" 
                                        title="Xóa bài giải (Quyền Admin)">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        },

        // ==========================================
        // CREATE FOLDER MODAL
        // ==========================================
        openCreateFolderModal: function(preSelectedSubject) {
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

        submitCreateFolder: function(e) {
            if (e && e.preventDefault) e.preventDefault();

            const subjectSelect = document.getElementById("solFolderSubject");
            const nameInput = document.getElementById("solFolderName");
            const descInput = document.getElementById("solFolderDesc");

            const subject = subjectSelect ? subjectSelect.value : "Tin Học 11";
            const name = nameInput ? nameInput.value.trim() : "";
            const desc = descInput ? descInput.value.trim() : "";

            if (!name) {
                alert("Vui lòng nhập tên thư mục bài học!");
                if (nameInput) nameInput.focus();
                return;
            }

            const newFolder = this.createFolder(subject, name, desc);
            this.closeCreateFolderModal();

            if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(`📁 Đã tạo thành công thư mục: "${name}"`);
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

            if (file.size > 8 * 1024 * 1024) {
                alert("Kích thước ảnh tối đa là 8MB!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                window._pendingSolutionImageBase64 = e.target.result;
                const previewContainer = document.getElementById("solutionUploadPreviewContainer");
                const previewImg = document.getElementById("solutionUploadPreviewImg");
                if (previewImg) previewImg.src = e.target.result;
                if (previewContainer) previewContainer.classList.remove("hidden");
                if (window.AudioHelper && window.AudioHelper.playFeltStep) window.AudioHelper.playFeltStep();
            };
            reader.readAsDataURL(file);
        },

        submitUpload: function(e) {
            if (e && e.preventDefault) e.preventDefault();

            const titleInput = document.getElementById("solInputTitle");
            const subjectInput = document.getElementById("solInputSubject");
            const folderInput = document.getElementById("solInputFolder");
            const lessonInput = document.getElementById("solInputLesson");
            const descInput = document.getElementById("solInputDesc");

            const title = (titleInput && titleInput.value.trim()) || "";
            const subject = (subjectInput && subjectInput.value) || "Tin Học 11";
            const folderId = (folderInput && folderInput.value) || null;
            const lesson = (lessonInput && lessonInput.value.trim()) || "Chuyên đề bài học";
            const desc = (descInput && descInput.value.trim()) || "";
            const imgData = window._pendingSolutionImageBase64;

            if (!title) {
                alert("Vui lòng nhập tiêu đề cho bài giải!");
                if (titleInput) titleInput.focus();
                return;
            }

            if (!imgData) {
                alert("Vui lòng tải lên hoặc chọn một hình ảnh lời giải!");
                return;
            }

            let folderName = "";
            if (folderId) {
                const fld = this.getAllFolders().find(f => f.id === folderId);
                if (fld) folderName = fld.name;
            }

            const user = window.AccountManager ? window.AccountManager.getCurrentAccount() : null;
            const newSolution = {
                id: "sol_" + Date.now(),
                title: title,
                subject: subject,
                folderId: folderId,
                folderName: folderName,
                lesson: lesson,
                description: desc,
                imageUrl: imgData,
                authorName: user ? user.name : "Văn Thừa (Admin)",
                authorRole: user ? user.role : "👑 Quản Trị Viên",
                authorAvatar: user ? user.avatar : "👑",
                createdAt: new Date().toISOString(),
                views: 1,
                likes: 0
            };

            const currentList = this.getAllSolutions();
            currentList.unshift(newSolution);
            this.saveSolutions(currentList);

            if (window.AudioHelper && window.AudioHelper.playSuccess) {
                window.AudioHelper.playSuccess();
            }

            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(`✅ Đã nhét bài giải vào ${folderName ? ('thư mục "' + folderName + '"') : subject}!`);
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

    window.SolutionEngine = SolutionEngine;
})();
