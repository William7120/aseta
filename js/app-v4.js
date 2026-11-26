// ========================================================
// AZOTA OS CONTROLLER (DESKTOP OS, FILE EXPLORER, LIVE CLOCK, DOCK)
// ========================================================
window.AzotaApp = (function() {

    let allExams = [];
    let currentFilter = {
        subject: "all",
        grade: "all",
        search: ""
    };
    let currentResultData = null;
    let appTheme = "dark";
    let activeAppName = "File Explorer";

    // ==========================================
    // FILE EXPLORER STATE & CONFIGURATION
    // ==========================================
    let currentExplorerFolder = 'root';
    let explorerLayout = 'grid'; // 'grid' | 'list'
    let explorerKeyword = '';
    let currentExplorerCategory = 'all'; // 'all' | 'lop11' | 'tuluan' | 'tracnghiem'
    let currentExplorerSort = 'default'; // 'default' | 'name' | 'questions'
    let isSidebarMainFoldersCollapsed = false;
    let isSubjectTreeCollapsed = false;
    let selectedAvatar = '👦';

    // SHUFFLE PREFERENCES STATE (Synchronized across Header & Exam Settings)
    let shuffleQuestions = false;
    let shuffleOptions = false;

    function updateShuffleUI() {
        const btnQ = document.getElementById("headerToggleShuffleQ");
        const statusTextQ = document.getElementById("statusTextShuffleQ");
        const btnOpt = document.getElementById("headerToggleShuffleOpt");
        const statusTextOpt = document.getElementById("statusTextShuffleOpt");
        const chkQ = document.getElementById("prefShuffleQ");
        const chkOpt = document.getElementById("prefShuffleOpt");

        if (btnQ) {
            if (shuffleQuestions) {
                btnQ.classList.add("active-emerald");
                if (statusTextQ) statusTextQ.textContent = "BẬT";
            } else {
                btnQ.classList.remove("active-emerald");
                if (statusTextQ) statusTextQ.textContent = "TẮT";
            }
        }
        if (chkQ) {
            chkQ.checked = shuffleQuestions;
        }

        if (btnOpt) {
            if (shuffleOptions) {
                btnOpt.classList.add("active-sky");
                if (statusTextOpt) statusTextOpt.textContent = "BẬT";
            } else {
                btnOpt.classList.remove("active-sky");
                if (statusTextOpt) statusTextOpt.textContent = "TẮT";
            }
        }
        if (chkOpt) {
            chkOpt.checked = shuffleOptions;
        }
    }

    function toggleShuffleQuestions() {
        shuffleQuestions = !shuffleQuestions;
        try {
            localStorage.setItem("azota_shuffle_q", shuffleQuestions);
        } catch (e) {}
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper && window.AudioHelper.playClick) {
            window.AudioHelper.playClick();
        }
        updateShuffleUI();
    }

    function toggleShuffleOptions() {
        shuffleOptions = !shuffleOptions;
        try {
            localStorage.setItem("azota_shuffle_opt", shuffleOptions);
        } catch (e) {}
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper && window.AudioHelper.playClick) {
            window.AudioHelper.playClick();
        }
        updateShuffleUI();
    }

    // ========================================================
    // AZOTA SECURITY GUARD & RATE LIMITING (ANTI-FLOOD / DDOS)
    // ========================================================
    const SecurityGuard = {
        actionTimestamps: [],
        MAX_ACTIONS_PER_SECOND: 6,
        toastTimeout: null,

        sanitize: function(input) {
            if (typeof input !== "string") return "";
            return input
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;")
                .replace(/\//g, "&#x2F;");
        },

        checkRateLimit: function(actionName = "thao tác") {
            const now = Date.now();
            this.actionTimestamps = this.actionTimestamps.filter(t => now - t < 1000);
            this.actionTimestamps.push(now);

            if (this.actionTimestamps.length > this.MAX_ACTIONS_PER_SECOND) {
                this.showSecurityToast(`⚠️ Phát hiện thao tác quá nhanh (${actionName})! Vui lòng chờ 1s để bảo vệ hệ thống.`);
                if (window.AudioHelper) window.AudioHelper.playIncorrect();
                return false;
            }
            return true;
        },

        showSecurityToast: function(msg) {
            const toast = document.getElementById("securityToast");
            const msgEl = document.getElementById("securityToastMsg");
            if (msgEl) msgEl.textContent = msg;
            if (toast) {
                toast.classList.add("show");
                clearTimeout(this.toastTimeout);
                this.toastTimeout = setTimeout(() => {
                    toast.classList.remove("show");
                }, 2800);
            }
        }
    };

    let selectedNewAccAvatar = "🎓";
    function selectNewAccAvatar(av) {
        selectedNewAccAvatar = av;
        document.querySelectorAll(".new-acc-avatar-btn").forEach(btn => {
            if (btn.getAttribute("data-avatar") === av) {
                btn.classList.add("border-sky-500", "scale-110");
                btn.classList.remove("border-transparent");
            } else {
                btn.classList.remove("border-sky-500", "scale-110");
                btn.classList.add("border-transparent");
            }
        });
        if (window.AudioHelper) window.AudioHelper.playClick();
    }


    // ========================================================
    // SLEEK IN-APP GLASS MODAL (Replaces ugly browser alerts/confirms)
    // ========================================================
    const AzotaModal = {
        show: function(options) {
            const {
                title = "Thông Báo",
                message = "",
                icon = "ℹ️",
                confirmText = "Đồng Ý",
                cancelText = "Hủy Bỏ",
                isConfirm = false,
                onConfirm = null,
                onCancel = null
            } = options;

            const modal = document.getElementById("azotaAppModal");
            const titleEl = document.getElementById("appModalTitle");
            const msgEl = document.getElementById("appModalMessage");
            const iconBox = document.getElementById("appModalIconBox");
            const confirmBtn = document.getElementById("appModalConfirmBtn");
            const cancelBtn = document.getElementById("appModalCancelBtn");

            if (!modal) {
                if (isConfirm) {
                    const ok = window.confirm(title + "\n\n" + message);
                    if (ok && onConfirm) onConfirm();
                    else if (!ok && onCancel) onCancel();
                } else {
                    window.alert(title + "\n\n" + message);
                    if (onConfirm) onConfirm();
                }
                return;
            }

            if (titleEl) titleEl.textContent = title;
            if (msgEl) msgEl.textContent = message;
            if (iconBox) iconBox.textContent = icon;
            if (confirmBtn) confirmBtn.textContent = confirmText;

            if (cancelBtn) {
                if (isConfirm) {
                    cancelBtn.textContent = cancelText;
                    cancelBtn.classList.remove("hidden");
                } else {
                    cancelBtn.classList.add("hidden");
                }
            }

            modal.classList.remove("hidden");
            modal.classList.add("flex");

            if (window.AudioHelper && window.AudioHelper.playPlip) {
                window.AudioHelper.playPlip();
            }

            confirmBtn.onclick = () => {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
                if (window.AudioHelper && window.AudioHelper.playClick) {
                    window.AudioHelper.playClick();
                }
                if (typeof onConfirm === "function") onConfirm();
            };

            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                    if (window.AudioHelper && window.AudioHelper.playClick) {
                        window.AudioHelper.playClick();
                    }
                    if (typeof onCancel === "function") onCancel();
                };
            }
        },

        alert: function(msg, title = "Thông Báo", icon = "ℹ️", callback = null) {
            this.show({
                title,
                message: msg,
                icon,
                confirmText: "Đồng Ý",
                isConfirm: false,
                onConfirm: callback
            });
        },

        confirm: function(msg, onConfirm, onCancel = null, title = "Xác Nhận Thao Tác", icon = "⚠️") {
            this.show({
                title,
                message: msg,
                icon,
                confirmText: "Xác Nhận",
                cancelText: "Hủy Bỏ",
                isConfirm: true,
                onConfirm,
                onCancel
            });
        }
    };
    window.AzotaModal = AzotaModal;

    // ========================================================
    // ACCOUNT MANAGER & MULTI-USER SYSTEM (STRICT 4 ACCOUNTS)
    // ========================================================
    const AccountManager = {
        STORAGE_KEY: "azota_user_accounts",
        CURRENT_KEY: "azota_current_account_id",
        SCHEMA_KEY: "azota_accounts_schema_v",
        SCHEMA_VERSION: "v3_strict_4_accounts",

        getDefaultAccounts: function() {
            return [
                {
                    id: "acc_vanthua",
                    name: "Văn Thừa (Admin)",
                    nickname: "VanThua",
                    grade: "Quản Trị Hệ Thống",
                    role: "👑 Quản Trị Viên (Admin)",
                    pin: "VT712010",
                    avatar: "👑",
                    goal: "Toàn quyền quản trị hệ thống Aseta",
                    isAdmin: true,
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                },
                {
                    id: "acc_ngocbinh",
                    name: "Ngọc Bình",
                    nickname: "NgocBinh",
                    grade: "Lớp 11",
                    role: "🎓 Học Sinh",
                    pin: "NB8429",
                    avatar: "🌟",
                    goal: "Chinh phục điểm cao Học Kỳ 1",
                    isAdmin: false,
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                },
                {
                    id: "acc_minhtri",
                    name: "Minh Trí",
                    nickname: "MinhTri",
                    grade: "Lớp 11",
                    role: "🎓 Học Sinh",
                    pin: "MT5173",
                    avatar: "👦",
                    goal: "9.0+ Học Kỳ 1",
                    isAdmin: false,
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                },
                {
                    id: "acc_tuanminh",
                    name: "Tuấn Minh",
                    nickname: "TuanMinh",
                    grade: "Lớp 11",
                    role: "🎓 Học Sinh",
                    pin: "TM6948",
                    avatar: "🧑‍🎓",
                    goal: "Thủ khoa khối A / D",
                    isAdmin: false,
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                }
            ];
        },

        getAllAccounts: function() {
            const coreAccounts = this.getDefaultAccounts();
            const legacyIds = new Set(["acc_admin", "acc_ban_a", "acc_ban_b", "acc_guest"]);
            const legacyNicks = new Set(["hocsinh11", "hoang11a", "lan11b", "guest"]);
            let list = null;
            let schemaMatch = false;

            try {
                schemaMatch = localStorage.getItem(this.SCHEMA_KEY) === this.SCHEMA_VERSION;
                if (schemaMatch) {
                    const raw = localStorage.getItem(this.STORAGE_KEY);
                    if (raw) list = JSON.parse(raw);
                }
            } catch (e) {}

            // One-time clean wipe of all old accounts when migrating to v3_strict_4_accounts
            if (!schemaMatch || !Array.isArray(list) || list.length === 0) {
                list = coreAccounts.map(a => ({ ...a }));
                this.saveAccounts(list);
                try {
                    localStorage.setItem(this.SCHEMA_KEY, this.SCHEMA_VERSION);
                    const prevCurr = localStorage.getItem(this.CURRENT_KEY);
                    if (!list.some(a => a.id === prevCurr)) {
                        localStorage.setItem(this.CURRENT_KEY, "acc_ngocbinh");
                        localStorage.removeItem("azota_session_active_3d");
                        localStorage.removeItem("azota_auth_logged_in");
                        localStorage.removeItem("azota_user_profile");
                    }
                } catch (e) {}
                return list;
            }

            // Always prune any legacy accounts and enforce exact PIN/roles for the 4 core accounts
            let changed = false;
            const cleaned = list.filter(a => {
                if (!a || !a.id) { changed = true; return false; }
                const nickLow = (a.nickname || "").toLowerCase();
                if (legacyIds.has(a.id) || legacyNicks.has(nickLow)) {
                    changed = true;
                    return false;
                }
                return true;
            });

            coreAccounts.forEach(core => {
                const idx = cleaned.findIndex(a => a.id === core.id || (a.nickname && a.nickname.toLowerCase() === core.nickname.toLowerCase()));
                if (idx === -1) {
                    cleaned.push({ ...core });
                    changed = true;
                } else {
                    const cur = cleaned[idx];
                    if (cur.pin !== core.pin || cur.nickname !== core.nickname || cur.isAdmin !== core.isAdmin || cur.id !== core.id) {
                        cleaned[idx] = {
                            ...cur,
                            id: core.id,
                            nickname: core.nickname,
                            pin: core.pin,
                            role: core.role,
                            isAdmin: core.isAdmin,
                            isDefault: true
                        };
                        if (core.isAdmin) {
                            cleaned[idx].name = core.name;
                            cleaned[idx].avatar = core.avatar;
                        }
                        changed = true;
                    }
                }
            });

            if (changed) {
                this.saveAccounts(cleaned);
            }
            return cleaned;
        },

        saveAccounts: function(list) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            } catch (e) {}
        },

        getCurrentAccountId: function() {
            try {
                const id = localStorage.getItem(this.CURRENT_KEY) || "acc_ngocbinh";
                // Extra protection: if id is admin but session is not valid in sessionStorage, force acc_ngocbinh
                if (id === "acc_vanthua" || id === "acc_admin") {
                    const isSessionValid = typeof sessionStorage !== "undefined" && sessionStorage.getItem("azota_session_active_3d") === "true";
                    if (!isSessionValid) return "acc_ngocbinh";
                }
                return id;
            } catch(e) {
                return "acc_ngocbinh";
            }
        },

        getCurrentAccount: function() {
            const list = this.getAllAccounts();
            const currId = this.getCurrentAccountId();
            let acc = list.find(a => a.id === currId);
            // Extra protection: if acc is Admin but session is not valid in sessionStorage, force student
            if (acc && (acc.isAdmin === true || acc.id === "acc_vanthua")) {
                const isSessionValid = typeof sessionStorage !== "undefined" && sessionStorage.getItem("azota_session_active_3d") === "true";
                if (!isSessionValid) {
                    acc = null;
                }
            }
            return acc || list.find(a => a.id === "acc_ngocbinh") || list.find(a => !a.isAdmin) || list[0];
        },

        switchAccount: function(accountId) {
            if (!SecurityGuard.checkRateLimit("chuyển tài khoản")) return;
            const list = this.getAllAccounts();
            const target = list.find(a => a.id === accountId);
            if (!target) return;

            // Security gate: Switching to Admin REQUIRES PIN verification
            if (target.isAdmin === true || target.id === "acc_vanthua") {
                const isSessionValid = typeof sessionStorage !== "undefined" && sessionStorage.getItem("azota_session_active_3d") === "true";
                if (!isCurrentUserAdmin() && !isSessionValid) {
                    const enteredPin = prompt("Vui lòng nhập Mật khẩu Quản Trị Viên (Admin) để xác thực chuyển tài khoản:");
                    if (!enteredPin || enteredPin.trim() !== (target.pin || "VT712010")) {
                        SecurityGuard.showSecurityToast("❌ Mật khẩu Admin không đúng! Quyền truy cập bị từ chối.");
                        if (window.AudioHelper) window.AudioHelper.playIncorrect();
                        return;
                    }
                    if (typeof sessionStorage !== "undefined") {
                        sessionStorage.setItem("azota_session_active_3d", "true");
                    }
                }
            }

            localStorage.setItem(this.CURRENT_KEY, target.id);
            // Sync with UserProfile
            UserProfile.save({
                id: target.id,
                name: target.name,
                nickname: target.nickname,
                grade: target.grade,
                goal: target.goal || "9.0+ Học Kỳ 1",
                avatar: target.avatar || "🌟",
                isAdmin: !!target.isAdmin,
                role: target.role
            });

            this.renderAccountsList();
            UserProfile.updateUI();
            if (currentActiveViewId === "dashboard" && window.DashboardHubEngine && typeof window.DashboardHubEngine.renderDashboard === "function") {
                window.DashboardHubEngine.renderDashboard("dashboardHubContainer");
            }
            if (currentActiveViewId === "gradeCalc" && window.GradeCalcEngine && typeof window.GradeCalcEngine.render === "function") {
                window.GradeCalcEngine.render("gradeCalcContainer");
            }
            SecurityGuard.showSecurityToast(`✅ Đã chuyển sang tài khoản: ${target.name} (@${target.nickname})`);
            if (window.AudioHelper) window.AudioHelper.playSuccess();
        },

        createAccount: function(name, nickname, grade, pin, role, avatar) {
            if (!SecurityGuard.checkRateLimit("tạo tài khoản")) return;

            const cleanName = SecurityGuard.sanitize(name.trim()) || "Bạn Học Mới";
            const cleanNick = SecurityGuard.sanitize(nickname.trim().replace(/^@/, '')) || ("banhoc_" + Math.floor(Math.random() * 1000));
            const cleanGrade = SecurityGuard.sanitize(grade) || "Lớp 11";
            const cleanPin = (pin && pin.trim()) || "1234";
            const cleanRole = SecurityGuard.sanitize(role) || "🎓 Học Sinh";
            const cleanAvatar = avatar || "🎓";

            const list = this.getAllAccounts();
            if (list.some(a => a.nickname.toLowerCase() === cleanNick.toLowerCase())) {
                AzotaModal.alert(`Tên đăng nhập @${cleanNick} đã tồn tại! Vui lòng chọn biệt danh khác.`, "Biệt Danh Đã Tồn Tại", "⚠️");
                return false;
            }

            const newAcc = {
                id: "acc_" + Date.now(),
                name: cleanName,
                nickname: cleanNick,
                grade: cleanGrade,
                role: cleanRole,
                pin: cleanPin,
                avatar: cleanAvatar,
                goal: "Chăm chỉ ôn tập 100%",
                createdAt: new Date().toISOString()
            };

            list.push(newAcc);
            this.saveAccounts(list);
            this.switchAccount(newAcc.id);
            this.switchTab("list");
            SecurityGuard.showSecurityToast(`🎉 Cấp tài khoản mới thành công cho @${cleanNick}!`);
            return true;
        },

        deleteAccount: function(accountId) {
            const list = this.getAllAccounts();
            if (list.length <= 1) {
                alert("Hệ thống phải có ít nhất 1 tài khoản!");
                return;
            }
            if (accountId === "acc_admin" || accountId === "acc_vanthua") {
                alert("Không thể xóa tài khoản Quản trị viên tối cao!");
                return;
            }
            if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?")) return;

            const filtered = list.filter(a => a.id !== accountId);
            this.saveAccounts(filtered);
            if (this.getCurrentAccountId() === accountId) {
                this.switchAccount(filtered[0].id);
            } else {
                this.renderAccountsList();
            }
            if (window.AudioHelper) window.AudioHelper.playClick();
        },

        renderAccountsList: function() {
            const container = document.getElementById("accountsListContainer");
            const badge = document.getElementById("accountCountBadge");
            if (!container) return;

            const list = this.getAllAccounts();
            const currId = this.getCurrentAccountId();
            if (badge) badge.textContent = `${list.length} tài khoản`;

            container.innerHTML = "";
            list.forEach(acc => {
                const isCurrent = (acc.id === currId);
                const isVanThuaAdmin = (acc.isAdmin || (acc.nickname && acc.nickname.toLowerCase() === "vanthua"));
                const card = document.createElement("div");
                card.className = `account-card-item p-3 sm:p-3.5 flex items-center justify-between gap-3 ${isCurrent ? 'is-current ring-1 ring-sky-500/50' : ''}`;
                card.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-2xl bg-slate-800 border ${isVanThuaAdmin ? 'border-amber-400/50 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/10' : (isCurrent ? 'border-sky-400 bg-sky-500/20' : 'border-white/10')} flex items-center justify-center text-xl shrink-0">
                            ${acc.avatar || (isVanThuaAdmin ? '👑' : '👦')}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h4 class="font-extrabold text-sm text-white truncate">${acc.name}</h4>
                                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isVanThuaAdmin ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30' : (isCurrent ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'bg-slate-800 text-slate-400')}">
                                    ${acc.role || (isVanThuaAdmin ? '👑 Quản Trị Viên' : 'Học Sinh')}
                                </span>
                            </div>
                            <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span class="font-bold text-slate-300">@${acc.nickname}</span>
                                <span>•</span>
                                <span>${acc.grade}</span>
                                <span>•</span>
                                <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300 border border-amber-400/25">Mã PIN: <strong>${acc.pin || '••••'}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${isCurrent ? `
                            <span class="px-3 py-1.5 rounded-xl text-xs font-black bg-sky-500 text-white shadow-sm flex items-center gap-1">
                                <span>✓</span> <span>Đang dùng</span>
                            </span>
                        ` : `
                            <button type="button" onclick="AzotaApp.switchUserAccount('${acc.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-sky-500 hover:text-white text-slate-300 transition-all cursor-pointer">
                                Chuyển Sang
                            </button>
                        `}
                        ${(!acc.isDefault && !isVanThuaAdmin) ? `
                            <button type="button" onclick="AzotaApp.deleteUserAccount('${acc.id}')" title="Xóa tài khoản này" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer">
                                🗑️
                            </button>
                        ` : `
                            <span title="Tài khoản bảo vệ hệ thống" class="p-1.5 text-xs text-amber-400/60 select-none">🔒</span>
                        `}
                    </div>
                `;
                container.appendChild(card);
            });
        },

        switchTab: function(tab) {
            const tabList = document.getElementById("accTabList");
            const tabCreate = document.getElementById("accTabCreate");
            const tabEdit = document.getElementById("accTabEdit");
            const paneList = document.getElementById("accPaneList");
            const paneCreate = document.getElementById("accPaneCreate");
            const paneEdit = document.getElementById("accPaneEdit");

            [tabList, tabCreate, tabEdit].forEach(t => {
                if (t) {
                    t.classList.remove("bg-sky-500", "text-white", "shadow-sm");
                    t.classList.add("text-slate-400");
                }
            });
            [paneList, paneCreate, paneEdit].forEach(p => {
                if (p) p.classList.add("hidden");
            });

            if (tab === "list") {
                if (tabList) { tabList.classList.add("bg-sky-500", "text-white", "shadow-sm"); tabList.classList.remove("text-slate-400"); }
                if (paneList) paneList.classList.remove("hidden");
                this.renderAccountsList();
            } else if (tab === "create") {
                if (tabCreate) { tabCreate.classList.add("bg-sky-500", "text-white", "shadow-sm"); tabCreate.classList.remove("text-slate-400"); }
                if (paneCreate) paneCreate.classList.remove("hidden");
            } else if (tab === "edit") {
                if (tabEdit) { tabEdit.classList.add("bg-sky-500", "text-white", "shadow-sm"); tabEdit.classList.remove("text-slate-400"); }
                if (paneEdit) paneEdit.classList.remove("hidden");
                UserProfile.openModalFields();
            }
            if (window.AudioHelper) window.AudioHelper.playClick();
        }
    };

    function createNewFriendAccount() {
        const nameInput = document.getElementById("newAccName");
        const nickInput = document.getElementById("newAccNickname");
        const gradeInput = document.getElementById("newAccGrade");
        const pinInput = document.getElementById("newAccPin");
        const roleInput = document.getElementById("newAccRole");

        const name = (nameInput && nameInput.value) || "";
        const nick = (nickInput && nickInput.value) || "";
        const grade = (gradeInput && gradeInput.value) || "Lớp 11A";
        const pin = (pinInput && pinInput.value) || "1234";
        const role = (roleInput && roleInput.value) || "🎓 Học Sinh";

        if (!name.trim()) {
            AzotaModal.alert("Vui lòng nhập họ và tên của bạn bè!", "Thiếu Thông Tin", "✍️");
            return;
        }

        const success = AccountManager.createAccount(name, nick, grade, pin, role, selectedNewAccAvatar);
        if (success) {
            if (nameInput) nameInput.value = "";
            if (nickInput) nickInput.value = "";
            if (pinInput) pinInput.value = "";
            if (typeof AuthGate !== "undefined" && AuthGate.renderQuickAccounts) {
                AuthGate.renderQuickAccounts();
            }
        }
    }

    // ========================================================
    // AUTH GATE: AZOTA OS SIGN-IN & ACCESS CONTROL ENGINE
    // ========================================================
    const AuthGate = {
        SESSION_KEY: "azota_session_active_3d",
        FAIL_COUNT_KEY: "azota_auth_fail_count",
        LOCKOUT_UNTIL_KEY: "azota_auth_lockout_until",
        MAX_FAIL_ATTEMPTS: 5,
        LOCKOUT_DURATION_MS: 30000,
        lockoutInterval: null,

        getStorage: function(isSession = false) {
            try {
                if (isSession && typeof sessionStorage !== "undefined") return sessionStorage;
                if (!isSession && typeof localStorage !== "undefined") return localStorage;
            } catch (e) {}
            return null;
        },

        isAuthenticated: function() {
            this.checkLockout();
            let loggedIn = null;
            try {
                const ls = this.getStorage(false);
                const ss = this.getStorage(true);
                const currAccId = ls ? ls.getItem("azota_current_account_id") : null;
                // Extra shield: Admin cannot rely on localStorage alone
                if (currAccId === "acc_vanthua" || currAccId === "acc_admin") {
                    loggedIn = ss ? ss.getItem(this.SESSION_KEY) : null;
                    if (loggedIn !== "true" && ls) {
                        ls.removeItem(this.SESSION_KEY);
                        ls.removeItem("azota_auth_logged_in");
                        ls.setItem("azota_current_account_id", "acc_ngocbinh");
                    }
                } else {
                    loggedIn = (ls && ls.getItem(this.SESSION_KEY)) || (ss && ss.getItem(this.SESSION_KEY));
                }
            } catch (e) {}
            return loggedIn === "true";
        },

        init3DCard: function() {
            const wrapper = document.getElementById("loginCardWrapper");
            const card = document.getElementById("loginCard3D");
            if (!wrapper || !card || wrapper._has3DInit) return;
            wrapper._has3DInit = true;

            wrapper.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - rect.width / 2;
                const mouseY = e.clientY - rect.top - rect.height / 2;
                const rotateX = -(mouseY / (rect.height / 2)) * 10;
                const rotateY = (mouseX / (rect.width / 2)) * 10;
                card.style.transform = `perspective(1500px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
            });

            wrapper.addEventListener("mouseleave", () => {
                card.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
                card.style.transform = "perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
            });

            wrapper.addEventListener("mouseenter", () => {
                card.style.transition = "transform 0.1s ease-out";
            });
        },

        init: function() {
            this.init3DCard();
            this.renderQuickAccounts();
            this.checkLockout();

            if (this.isAuthenticated()) {
                this.hideLoginGate();
            } else {
                this.showLoginGate();
            }
        },

        showLoginGate: function() {
            this.init3DCard();
            const gate = document.getElementById("authGateView");
            if (gate) {
                gate.classList.remove("hidden", "opacity-0", "pointer-events-none");
                gate.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; min-width: 100vw !important; min-height: 100vh !important; max-width: 100vw !important; max-height: 100vh !important; z-index: 999999 !important; background-color: #000000 !important; display: flex !important; align-items: center !important; justify-content: center !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;";
            }
            const wrapper = document.getElementById("loginCardWrapper");
            if (wrapper) {
                wrapper.style.width = "100%";
                wrapper.style.maxWidth = "400px";
            }
            this.renderQuickAccounts();
            this.checkLockout();
        },

        hideLoginGate: function() {
            const gate = document.getElementById("authGateView");
            if (gate) {
                gate.classList.add("opacity-0", "pointer-events-none");
                gate.style.opacity = "0";
                gate.style.pointerEvents = "none";
                setTimeout(() => {
                    gate.classList.add("hidden");
                    gate.style.display = "none";
                    gate.style.visibility = "hidden";
                    gate.style.cssText = "display: none !important; visibility: hidden !important; pointer-events: none !important;";
                }, 350);
            }
        },

        checkLockout: function() {
            let lockoutUntil = 0;
            try {
                const ls = this.getStorage(false);
                if (ls) lockoutUntil = parseInt(ls.getItem(this.LOCKOUT_UNTIL_KEY) || "0", 10);
            } catch (e) {}

            const now = Date.now();
            const lockoutBox = document.getElementById("loginLockoutBox");
            const submitBtn = document.getElementById("loginSubmitBtn");

            if (lockoutUntil > now) {
                if (submitBtn) submitBtn.disabled = true;
                if (lockoutBox) lockoutBox.classList.remove("hidden");
                this.startLockoutCountdown(lockoutUntil);
                return true;
            } else {
                if (submitBtn) submitBtn.disabled = false;
                if (lockoutBox) lockoutBox.classList.add("hidden");
                clearInterval(this.lockoutInterval);
                return false;
            }
        },

        startLockoutCountdown: function(lockoutUntil) {
            clearInterval(this.lockoutInterval);
            const timerEl = document.getElementById("loginLockoutTimer");
            const barEl = document.getElementById("loginLockoutBar");

            const update = () => {
                const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
                if (timerEl) timerEl.textContent = `${remaining}s`;
                if (barEl) {
                    const pct = Math.max(0, Math.min(100, (remaining / (this.LOCKOUT_DURATION_MS / 1000)) * 100));
                    barEl.style.width = `${pct}%`;
                }

                if (remaining <= 0) {
                    clearInterval(this.lockoutInterval);
                    try {
                        const ls = this.getStorage(false);
                        if (ls) {
                            ls.removeItem(this.LOCKOUT_UNTIL_KEY);
                            ls.setItem(this.FAIL_COUNT_KEY, "0");
                        }
                    } catch (e) {}
                    this.checkLockout();
                    this.hideAlert();
                }
            };

            update();
            this.lockoutInterval = setInterval(update, 1000);
        },

        handleLoginSubmit: function(e) {
            if (e && e.preventDefault) e.preventDefault();
            if (this.checkLockout()) return;

            const uInput = document.getElementById("loginUsernameInput");
            const pInput = document.getElementById("loginPinInput");
            const remInput = document.getElementById("loginRememberMe");

            const username = (uInput && uInput.value.trim().replace(/^@/, '')) || "";
            const pin = (pInput && pInput.value.trim()) || "";
            const remember = remInput ? (remInput.checked !== false) : true;

            if (!username) {
                this.showAlert("Vui lòng nhập Tên Đăng Nhập hoặc Biệt Danh (@username)!", "warning");
                if (uInput) uInput.focus();
                return;
            }

            if (!pin) {
                this.showAlert("Vui lòng nhập Mã PIN hoặc Mật Khẩu!", "warning");
                if (pInput) pInput.focus();
                return;
            }

            const accounts = AccountManager.getAllAccounts();
            const matchedAcc = accounts.find(a => 
                (a.nickname && a.nickname.toLowerCase() === username.toLowerCase()) ||
                (a.name && a.name.toLowerCase() === username.toLowerCase()) ||
                (a.id && a.id.toLowerCase() === username.toLowerCase())
            );

            if (!matchedAcc) {
                this.handleFailedAttempt(`Không tìm thấy tài khoản "@${username}". Vui lòng kiểm tra lại tên đăng nhập!`);
                return;
            }

            if (matchedAcc.pin && matchedAcc.pin !== pin) {
                this.handleFailedAttempt(`Mật khẩu không chính xác cho tài khoản @${matchedAcc.nickname}!`);
                return;
            }

            this.loginSuccess(matchedAcc, remember);
        },

        handleFailedAttempt: function(errMsg) {
            let fails = 0;
            try {
                const ls = this.getStorage(false);
                if (ls) {
                    fails = parseInt(ls.getItem(this.FAIL_COUNT_KEY) || "0", 10) + 1;
                    ls.setItem(this.FAIL_COUNT_KEY, fails.toString());
                    if (fails >= this.MAX_FAIL_ATTEMPTS) {
                        const lockoutUntil = Date.now() + this.LOCKOUT_DURATION_MS;
                        ls.setItem(this.LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
                    }
                }
            } catch (e) {}

            if (fails >= this.MAX_FAIL_ATTEMPTS) {
                this.checkLockout();
                this.showAlert(`Đã nhập sai ${fails} lần! Tạm khóa đăng nhập 30 giây để bảo vệ an toàn hệ thống.`, "error");
            } else {
                const remaining = this.MAX_FAIL_ATTEMPTS - fails;
                this.showAlert(`${errMsg} (Còn ${remaining} lần thử trước khi bị khóa)`, "error");
            }

            if (window.AudioHelper) window.AudioHelper.playIncorrect();
        },

        loginSuccess: function(account, remember = true) {
            try {
                const ls = this.getStorage(false);
                const ss = this.getStorage(true);
                if (ls) {
                    ls.setItem(this.FAIL_COUNT_KEY, "0");
                    ls.removeItem(this.LOCKOUT_UNTIL_KEY);
                }

                const isAccAdmin = (account.isAdmin === true || account.id === "acc_vanthua" || (account.nickname && account.nickname.toLowerCase() === "vanthua"));

                if (isAccAdmin) {
                    // CRITICAL SECURITY: Admin session is ONLY permitted in sessionStorage (current browser tab).
                    // NEVER persist Admin session across browser restarts or shared link opens via localStorage!
                    if (ss) ss.setItem(this.SESSION_KEY, "true");
                    if (ls) {
                        ls.removeItem(this.SESSION_KEY);
                        ls.removeItem("azota_auth_logged_in");
                    }
                } else {
                    if (remember) {
                        if (ls) ls.setItem(this.SESSION_KEY, "true");
                        if (ss) ss.removeItem(this.SESSION_KEY);
                    } else {
                        if (ss) ss.setItem(this.SESSION_KEY, "true");
                        if (ls) ls.removeItem(this.SESSION_KEY);
                    }
                }
            } catch (e) {}

            // Visual button loading state
            const spinner = document.getElementById("loginBtnSpinner");
            const btnText = document.getElementById("loginBtnText");
            if (spinner) spinner.classList.remove("hidden");
            if (btnText) btnText.textContent = "ĐANG VÀO...";

            setTimeout(() => {
                if (spinner) spinner.classList.add("hidden");
                if (btnText) btnText.textContent = "ĐĂNG NHẬP";

                // Switch to this account in AccountManager & sync profile
                AccountManager.switchAccount(account.id);

                // Hide alert and login view
                this.hideAlert();
                this.hideLoginGate();

                // Always land on Dashboard first after login
                showView("dashboard", true);

                // Audio & confetti
                if (window.AudioHelper) {
                    if (window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
                    else if (window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                }

                if (window.confetti) {
                    window.confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.6 }
                    });
                }
            }, 250);

            SecurityGuard.showSecurityToast(`👋 Chào mừng ${account.name} (@${account.nickname}) đã đăng nhập thành công!`);
        },

        loginAsGuest: function() {
            this.showAlert("Chế độ khách đã tắt. Vui lòng đăng nhập bằng tài khoản được cấp!", "warning");
        },

        logout: function() {
            try {
                const ls = this.getStorage(false);
                const ss = this.getStorage(true);
                if (ls) {
                    ls.removeItem(this.SESSION_KEY);
                    ls.removeItem("azota_auth_logged_in");
                }
                if (ss) {
                    ss.removeItem(this.SESSION_KEY);
                    ss.removeItem("azota_auth_logged_in");
                }
            } catch (e) {}

            const uInput = document.getElementById("loginUsernameInput");
            const pInput = document.getElementById("loginPinInput");
            if (uInput) uInput.value = "";
            if (pInput) pInput.value = "";

            if (typeof AzotaApp !== "undefined" && AzotaApp.closeUserProfileModal) {
                try { AzotaApp.closeUserProfileModal(); } catch(e) {}
            }

            this.showLoginGate();
            try { window.scrollTo({ top: 0, behavior: "instant" }); } catch(e) {}
            if (window.AudioHelper && window.AudioHelper.playClick) {
                try { window.AudioHelper.playClick(); } catch(e) {}
            }
            if (typeof SecurityGuard !== "undefined" && SecurityGuard.showSecurityToast) {
                try { SecurityGuard.showSecurityToast("🚪 Bạn đã đăng xuất an toàn khỏi Aseta."); } catch(e) {}
            }
        },

        fillAccount: function(nickname, pin) {
            const uInput = document.getElementById("loginUsernameInput");
            const pInput = document.getElementById("loginPinInput");
            if (uInput) uInput.value = nickname;
            if (pInput) pInput.value = pin;
            this.hideAlert();
            if (window.AudioHelper && window.AudioHelper.playPlip) {
                window.AudioHelper.playPlip();
            } else if (window.AudioHelper) {
                window.AudioHelper.playClick();
            }
        },

        renderQuickAccounts: function() {
            const container = document.getElementById("loginQuickAccountsList");
            if (!container) return;
            // Never leak PINs/passwords on the login card
            container.innerHTML = "";
        },

        showAlert: function(msg, type = "error") {
            const box = document.getElementById("loginAlertBox");
            const text = document.getElementById("loginAlertText");
            const icon = document.getElementById("loginAlertIcon");
            if (!box || !text) return;

            text.textContent = msg;
            box.classList.remove("hidden");
            if (type === "warning") {
                box.className = "p-3 rounded-xl text-xs font-medium border flex items-center gap-2 bg-amber-500/15 border-amber-500/30 text-amber-300 relative z-10";
                if (icon) icon.textContent = "⚠️";
            } else {
                box.className = "p-3 rounded-xl text-xs font-medium border flex items-center gap-2 bg-rose-500/15 border-rose-500/30 text-rose-300 animate-shake relative z-10";
                if (icon) icon.textContent = "✕";
            }
        },

        hideAlert: function() {
            const box = document.getElementById("loginAlertBox");
            if (box) box.classList.add("hidden");
        },

        togglePasswordVisibility: function() {
            const input = document.getElementById("loginPinInput");
            const btn = document.getElementById("loginTogglePinVisibility");
            const eyeIcon = document.getElementById("loginEyeIcon");
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                if (eyeIcon) {
                    eyeIcon.innerHTML = '<path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/>';
                } else if (btn) {
                    btn.textContent = "🙈";
                }
            } else {
                input.type = "password";
                if (eyeIcon) {
                    eyeIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
                } else if (btn) {
                    btn.textContent = "👁️";
                }
            }
        },

        showPinHelp: function() {
            const accounts = AccountManager.getAllAccounts().filter(a => !a.isAdmin && a.nickname.toLowerCase() !== "vanthua");
            const names = accounts.map(a => `@${a.nickname} (${a.name})`).join('\n• ');
            AzotaModal.alert(`Danh sách tài khoản học sinh hợp lệ:\n• ${names}\n\nVui lòng nhập mật khẩu riêng đã được Admin (@VanThua) cấp!`, "Hướng Dẫn Đăng Nhập", "🔑");
        }
    };

    // Make globally accessible for inline HTML onclicks
    window.AuthGate = AuthGate;
    window.AccountManager = AccountManager;

    // HELPER: KIỂM TRA QUYỀN ADMIN (QUẢN TRỊ VIÊN) - BẢO MẬT TUYỆT ĐỐI
    function isCurrentUserAdmin() {
        try {
            // Must be authenticated in AuthGate
            if (typeof AuthGate !== "undefined" && typeof AuthGate.isAuthenticated === "function") {
                if (!AuthGate.isAuthenticated()) return false;
            }
            // Admin session MUST be active in sessionStorage (current browser tab/session)
            const isSessionActive = typeof sessionStorage !== "undefined" && sessionStorage.getItem("azota_session_active_3d") === "true";
            if (!isSessionActive) return false;

            const acc = AccountManager.getCurrentAccount();
            if (acc) {
                // Strict Admin: Only genuine VanThua Admin Account with isAdmin: true
                if (acc.isAdmin === true && (acc.id === "acc_vanthua" || (acc.nickname && acc.nickname.toLowerCase() === "vanthua"))) {
                    return true;
                }
                return false;
            }
        } catch(e) {}
        return false;
    }
    window.isCurrentUserAdmin = isCurrentUserAdmin;
    window.AuthGate.isCurrentUserAdmin = isCurrentUserAdmin;

    // USER PROFILE CONTROLLER
    const UserProfile = {
        get: function() {
            try {
                const raw = localStorage.getItem("azota_user_profile");
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            return {
                id: "acc_ngocbinh",
                name: "Ngọc Bình",
                nickname: "NgocBinh",
                grade: "Lớp 11",
                role: "🎓 Học Sinh",
                goal: "Chinh phục điểm cao Học Kỳ 1",
                avatar: "🌟",
                isAdmin: false
            };
        },
        save: function(profile) {
            try {
                localStorage.setItem("azota_user_profile", JSON.stringify(profile));
            } catch (e) {}
            this.updateUI();
        },
        updateUI: function() {
            const p = this.get();
            const isAdmin = isCurrentUserAdmin();

            const nameEl = document.getElementById("userNameDisplay");
            const nickEl = document.getElementById("userNicknameDisplay");
            const avatarEl = document.getElementById("userAvatarPill");
            if (nameEl) nameEl.textContent = p.name || "Học Sinh Aseta";
            if (nickEl) nickEl.textContent = `@${p.nickname || "hocsinh11"} • ${p.grade || "Lớp 11"}`;
            if (avatarEl) avatarEl.textContent = p.avatar || "👦";

            const sideNameEl = document.getElementById("sidebarUserName");
            const sideNickEl = document.getElementById("sidebarUserHandle");
            const sideAvatarEl = document.getElementById("sidebarAvatarIcon");
            if (sideNameEl) sideNameEl.textContent = p.name || "Học Sinh Aseta";
            if (sideNickEl) sideNickEl.textContent = `@${p.nickname || "hocsinh11"}`;
            if (sideAvatarEl) sideAvatarEl.textContent = p.avatar || "👦";

            // CHỈ ADMIN MỚI CÓ BUTTON QUẢN LÝ TÀI KHOẢN TRÊN THANH SIDEBAR
            const accBtn = document.getElementById("sidebar-util-accounts");
            if (accBtn) {
                if (isAdmin) {
                    accBtn.classList.remove("hidden");
                    accBtn.style.removeProperty("display");
                } else {
                    accBtn.classList.add("hidden");
                    accBtn.style.setProperty("display", "none", "important");
                }
            }

            // User Account Pill trên Navbar
            const navAccountPill = document.getElementById("explorerUserAccountPill");
            if (navAccountPill) {
                if (isAdmin) {
                    navAccountPill.setAttribute("title", "Quản lý hệ thống tài khoản (Admin)");
                    navAccountPill.classList.add("cursor-pointer");
                } else {
                    navAccountPill.setAttribute("title", `Tài khoản: ${p.name || ''} (@${p.nickname || ''})`);
                    navAccountPill.classList.remove("cursor-pointer");
                }
            }
        },
        openModal: function() {
            if (!isCurrentUserAdmin()) {
                const acc = AccountManager.getCurrentAccount();
                if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast(`👤 Bạn đang đăng nhập bằng tài khoản học sinh: ${acc ? acc.name : 'Minh Trí'} (@${acc ? acc.nickname : 'MinhTri'}). Chức năng Quản Trị Hệ Thống chỉ dành riêng cho Admin.`);
                }
                const modal = document.getElementById("userProfileModal");
                if (modal) {
                    modal.classList.add("hidden");
                    modal.style.setProperty("display", "none", "important");
                }
                return;
            }
            const modal = document.getElementById("userProfileModal");
            if (modal) {
                modal.style.removeProperty("display");
                modal.classList.remove("hidden");
            }
            AccountManager.switchTab("list");
        },
        handleProfileClick: function() {
            if (isCurrentUserAdmin()) {
                this.openModal();
            } else {
                const acc = AccountManager.getCurrentAccount();
                if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                    window.SecurityGuard.showSecurityToast(`👤 Tài khoản học sinh: ${acc ? acc.name : 'Minh Trí'} (@${acc ? acc.nickname : 'MinhTri'}) • Khối ${acc ? acc.grade : 'Lớp 11'}`);
                }
            }
        },
        openModalFields: function() {
            const p = this.get();
            selectedAvatar = p.avatar || "👑";
            const nameInput = document.getElementById("modalInputName");
            const nickInput = document.getElementById("modalInputNickname");
            const gradeInput = document.getElementById("modalInputGrade");
            const goalInput = document.getElementById("modalInputGoal");
            if (nameInput) nameInput.value = p.name || "";
            if (nickInput) nickInput.value = p.nickname || "";
            if (gradeInput) gradeInput.value = p.grade || "Lớp 11";
            if (goalInput) goalInput.value = p.goal || "";
            this.updateAvatarOptionUI();
        },
        closeModal: function() {
            const modal = document.getElementById("userProfileModal");
            if (modal) {
                modal.classList.add("hidden");
                modal.style.setProperty("display", "none", "important");
            }
        },
        updateAvatarOptionUI: function() {
            document.querySelectorAll(".avatar-opt-btn").forEach(btn => {
                const av = btn.getAttribute("data-avatar");
                if (av === selectedAvatar) {
                    btn.classList.add("border-sky-500", "scale-105");
                    btn.classList.remove("border-transparent");
                } else {
                    btn.classList.remove("border-sky-500", "scale-105");
                    btn.classList.add("border-transparent");
                }
            });
        },
        selectAvatar: function(av) {
            selectedAvatar = av;
            this.updateAvatarOptionUI();
            if (window.AudioHelper) window.AudioHelper.playClick();
        },
        saveFromModal: function() {
            if (!SecurityGuard.checkRateLimit("lưu hồ sơ")) return;

            const nameInput = document.getElementById("modalInputName");
            const nickInput = document.getElementById("modalInputNickname");
            const gradeInput = document.getElementById("modalInputGrade");
            const goalInput = document.getElementById("modalInputGoal");

            const name = SecurityGuard.sanitize((nameInput && nameInput.value.trim()) || "Học Sinh Aseta");
            const nick = SecurityGuard.sanitize((nickInput && nickInput.value.trim().replace(/^@/, '')) || "hocsinh11");
            const grade = SecurityGuard.sanitize((gradeInput && gradeInput.value) || "Lớp 11");
            const goal = SecurityGuard.sanitize((goalInput && goalInput.value.trim()) || "9.0+ Học Kỳ 1");

            this.save({
                name: name,
                nickname: nick,
                grade: grade,
                goal: goal,
                avatar: selectedAvatar || "👑"
            });

            // Also update in AccountManager list
            const accounts = AccountManager.getAllAccounts();
            const currId = AccountManager.getCurrentAccountId();
            const currAcc = accounts.find(a => a.id === currId);
            if (currAcc) {
                currAcc.name = name;
                currAcc.nickname = nick;
                currAcc.grade = grade;
                currAcc.goal = goal;
                currAcc.avatar = selectedAvatar || "👑";
                AccountManager.saveAccounts(accounts);
            }

            AccountManager.switchTab("list");
            SecurityGuard.showSecurityToast("💾 Đã lưu thay đổi hồ sơ thành công!");
            if (window.AudioHelper) window.AudioHelper.playSuccess();
        }
    };

    const SUBJECT_FOLDERS = [
        {
            id: "Tiếng Anh",
            title: "Tiếng Anh 11",
            abbr: "EN",
            grade: "11",
            icon: '<svg class="inline-block w-[1.2em] h-[1.2em] rounded-full overflow-hidden shrink-0 align-[-0.18em] ring-1 ring-white/15" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>',
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-blue-950/70 border border-blue-500/40 text-blue-400",
            badgeBg: "bg-blue-500 text-white",
            lineBg: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]",
            progressTextColor: "text-blue-400 font-bold",
            defaultProgress: 100,
            defaultFiles: 1,
            defaultQuestions: 67,
            colorClass: "from-blue-600 to-indigo-600",
            bgLight: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            description: "Trọn bộ 67 từ vựng trọng tâm Unit 4: ASEAN and Vietnam. Đầy đủ phát âm, Cô khảo bài và Flashcard 3D.",
            tags: ["Unit 4 Vocab", "67 Từ Vựng", "ASEAN & VN"]
        },
        {
            id: "Ngữ Văn",
            title: "Ngữ Văn 11",
            abbr: "NV",
            grade: "11",
            icon: "📖",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-rose-950/70 border border-rose-500/40 text-rose-400",
            badgeBg: "bg-rose-500 text-white",
            lineBg: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]",
            progressTextColor: "text-rose-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-rose-500 via-pink-600 to-red-600",
            bgLight: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            description: "Đọc hiểu văn bản, nghị luận văn học, nghị luận xã hội & phân tích tác phẩm văn học 11.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Toán",
            title: "Toán 11",
            abbr: "TO",
            grade: "11",
            icon: "📐",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-blue-950/70 border border-blue-500/40 text-blue-400",
            badgeBg: "bg-blue-600 text-white",
            lineBg: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]",
            progressTextColor: "text-blue-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-blue-600 to-indigo-600",
            bgLight: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            description: "Đại số & Giải tích, Hình học không gian 11.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Vật Lí",
            title: "Vật Lí 11",
            abbr: "VL",
            grade: "11",
            icon: "⚡",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-amber-950/70 border border-amber-500/40 text-amber-400",
            badgeBg: "bg-amber-500 text-slate-950",
            lineBg: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]",
            progressTextColor: "text-amber-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-amber-500 to-orange-600",
            bgLight: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            description: "Dao động điều hòa, Sóng cơ & sóng âm, Điện trường.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Địa Lí",
            title: "Địa Lí 11",
            abbr: "DL",
            grade: "11",
            icon: "🌍",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-teal-950/70 border border-cyan-500/40 text-cyan-400",
            badgeBg: "bg-cyan-500 text-slate-950",
            lineBg: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]",
            progressTextColor: "text-cyan-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-teal-500 via-cyan-600 to-blue-600",
            bgLight: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            description: "Địa lí kinh tế - xã hội thế giới & khu vực.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Tin Học",
            title: "Tin Học 11",
            abbr: "TH",
            grade: "11",
            icon: "💻",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-rose-950/70 border border-rose-500/40 text-rose-400",
            badgeBg: "bg-rose-500 text-white",
            lineBg: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]",
            progressTextColor: "text-rose-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-rose-500 via-pink-600 to-purple-600",
            bgLight: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            description: "Hệ điều hành, Kiến trúc máy tính & Lưu trữ đám mây.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Lịch Sử",
            title: "Lịch Sử 11",
            abbr: "LS",
            grade: "11",
            icon: "🏛️",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-amber-950/70 border border-amber-500/40 text-amber-400",
            badgeBg: "bg-amber-500 text-slate-950",
            lineBg: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]",
            progressTextColor: "text-amber-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-amber-500 to-orange-600",
            bgLight: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            description: "Lịch sử thế giới cận hiện đại & Lịch sử Việt Nam.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "GDKT&PL",
            title: "GDKT & PL 11",
            abbr: "PL",
            grade: "11",
            icon: "⚖️",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-purple-950/70 border border-purple-500/40 text-purple-400",
            badgeBg: "bg-purple-500 text-white",
            lineBg: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]",
            progressTextColor: "text-purple-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-purple-600 to-fuchsia-600",
            bgLight: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            description: "Giáo dục kinh tế & pháp luật 11.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "GDQP&AN",
            title: "GDQP & AN 11",
            abbr: "QP",
            grade: "11",
            icon: "🛡️",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400",
            badgeBg: "bg-emerald-500 text-slate-950",
            lineBg: "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
            progressTextColor: "text-emerald-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-emerald-600 to-teal-600",
            bgLight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            description: "Giáo dục quốc phòng & an ninh 11.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        },
        {
            id: "Hoc_Tu_Luan",
            title: "Học Tự Luận",
            abbr: "TL",
            grade: "Đa môn",
            icon: "📝",
            category: "tuluan",
            isLop11: true,
            folderBoxBg: "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400",
            badgeBg: "bg-emerald-500 text-slate-950",
            lineBg: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
            progressTextColor: "text-emerald-400 font-bold",
            defaultProgress: 0,
            defaultFiles: 0,
            defaultQuestions: 0,
            colorClass: "from-emerald-500 via-teal-600 to-green-600",
            bgLight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            description: "Thư viện học tự luận 11: Flashcard 3D, Active Recall & Chấm điểm AI.",
            tags: ["⭐ Tạm Thời Rỗng", "Đã Qua Cuối Kì", "Chờ Cập Nhật"]
        }
    ];

    function init() {
        loadSettings();
        applyTheme();
        UserProfile.updateUI();
        AccountManager.renderAccountsList();
        updateShuffleUI();
        loadExams();
        renderDashboardStats();
        setupEventListeners();
        checkInProgressExam();
        startLiveClock();
        
        // Initialize Authentication Gateway
        AuthGate.init();

        // Update sync timestamp in bottom status bar
        const now = new Date();
        const syncEl = document.getElementById("explorerSyncTime");
        if (syncEl) {
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            syncEl.textContent = `Đã đồng bộ lúc ${timeStr}`;
        }
        
        // Start in Dashboard view by default (Dashboard is primary landing page)
        showView('dashboard', true);

        // Restore saved sidebar mode if set to expanded
        try {
            const savedSidebarMode = localStorage.getItem("azota_sidebar_mode");
            if (savedSidebarMode === "expanded") {
                const sidebar = document.getElementById("appSidebar");
                if (sidebar) sidebar.classList.add("sidebar-expanded");
            }
        } catch (e) {}

        if (window.AzotaDock) {
            window.AzotaDock.init();
        try {
            if (window.SolutionEngine && typeof window.SolutionEngine.syncFromCloud === "function") {
                window.SolutionEngine.syncFromCloud(false);
            }
        } catch(e) {}
            window.AzotaDock.setActiveApp("dashboard");
        }
    }

    function loadSettings() {
        try {
            appTheme = localStorage.getItem("azota_theme") || "dark";
            shuffleQuestions = localStorage.getItem("azota_shuffle_q") === "true";
            shuffleOptions = localStorage.getItem("azota_shuffle_opt") === "true";
        } catch (e) {
            appTheme = "dark";
        }
    }

    function applyTheme() {
        const html = document.documentElement;
        const themeBtn = document.getElementById("toggleThemeBtn");
        const body = document.body;

        if (appTheme === "dark") {
            html.classList.add("dark");
            body.classList.remove("text-slate-800");
            body.classList.add("text-slate-100");
            if (themeBtn) themeBtn.innerHTML = `<span>☀️</span> <span class="hidden sm:inline">Nền Sáng</span>`;
        } else {
            html.classList.remove("dark");
            body.classList.remove("text-slate-100");
            body.classList.add("text-slate-800");
            if (themeBtn) themeBtn.innerHTML = `<span>🌙</span> <span class="hidden sm:inline">Nền Tối</span>`;
        }

        localStorage.setItem("azota_theme", appTheme);
    }

    function toggleTheme() {
        appTheme = (appTheme === "dark") ? "light" : "dark";
        applyTheme();
        window.AudioHelper.playClick();
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    function startLiveClock() {
        const clockEl = document.getElementById("osLiveClock");
        if (!clockEl) return;

        function updateTime() {
            const now = new Date();
            const days = ["CN", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            const dayName = days[now.getDay()];
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const d = now.getDate();
            const mon = now.getMonth() + 1;
            clockEl.textContent = `${dayName}, ${d} Th${mon} • ${h}:${m}`;
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    function loadExams() {
        const initial = window.INITIAL_EXAMS || [];
        let custom = [];
        try {
            custom = JSON.parse(localStorage.getItem("azota_custom_exams") || "[]");
        } catch (e) {
            custom = [];
        }
        allExams = [...custom, ...initial];
    }

    function setupEventListeners() {
        const searchInput = document.getElementById("examSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                currentFilter.search = e.target.value.trim().toLowerCase();
                renderExamGrid();
            });
        }

        const bankInput = document.getElementById("bankSearchInput");
        if (bankInput) {
            bankInput.addEventListener("input", () => {
                renderQuestionBank();
            });
        }

        const soundBtn = document.getElementById("toggleSoundBtn");
        if (soundBtn) {
            soundBtn.addEventListener("click", () => {
                const enabled = window.AudioHelper.toggleSound();
                soundBtn.innerHTML = enabled ? `<span>🔊</span> <span class="hidden sm:inline">Bật</span>` : `<span>🔇</span> <span class="hidden sm:inline">Tắt</span>`;
            });
        }

        // 2-way data binding for Kho Đề Thi inline preferences
        const prefQ = document.getElementById("prefShuffleQ");
        if (prefQ) {
            prefQ.addEventListener("change", (e) => {
                shuffleQuestions = e.target.checked;
                try { localStorage.setItem("azota_shuffle_q", shuffleQuestions); } catch (err) {}
                if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                updateShuffleUI();
            });
        }
        const prefOpt = document.getElementById("prefShuffleOpt");
        if (prefOpt) {
            prefOpt.addEventListener("change", (e) => {
                shuffleOptions = e.target.checked;
                try { localStorage.setItem("azota_shuffle_opt", shuffleOptions); } catch (err) {}
                if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                updateShuffleUI();
            });
        }
    }

    function checkInProgressExam() {
        const resumeBanner = document.getElementById("resumeExamBanner");
        if (!resumeBanner) return;
        const inProgress = window.ExamEngine ? window.ExamEngine.restoreInProgress() : null;
        if (inProgress && inProgress.exam) {
            resumeBanner.classList.remove("hidden");
            const titleEl = document.getElementById("resumeExamTitle");
            if (titleEl) {
                const totalQ = inProgress.questions ? inProgress.questions.length : 0;
                const currentNum = (typeof inProgress.currentIndex === 'number' ? inProgress.currentIndex : 0) + 1;
                titleEl.textContent = `${inProgress.exam.title} • Đang dừng ở Câu ${currentNum}/${totalQ}`;
            }
        } else {
            resumeBanner.classList.add("hidden");
        }
    }

    function resumeExam() {
        let resumed = false;
        try {
            if (window.ExamEngine && typeof window.ExamEngine.resumeExam === "function") {
                resumed = window.ExamEngine.resumeExam();
            }
        } catch(e) {
            console.error("[Aseta] Error calling ExamEngine.resumeExam:", e);
            resumed = false;
        }

        if (resumed) {
            showView("exam");
            const resumeBanner = document.getElementById("resumeExamBanner");
            if (resumeBanner) resumeBanner.classList.add("hidden");
            return;
        }

        // Fallback: if direct resume returned false, re-start with stored exam
        try {
            const inProgress = window.ExamEngine ? window.ExamEngine.restoreInProgress() : null;
            if (inProgress && inProgress.exam) {
                window.ExamEngine.startExam(inProgress.exam, inProgress.mode, {
                    layout: inProgress.layout,
                    duration: inProgress.totalDurationSeconds > 0 ? Math.round(inProgress.totalDurationSeconds / 60) : -1
                });
                showView("exam");
                const resumeBanner = document.getElementById("resumeExamBanner");
                if (resumeBanner) resumeBanner.classList.add("hidden");
            }
        } catch(err) {
            console.error("[Aseta] Fallback resume failed:", err);
        }
    }

    function discardInProgressExam() {
        localStorage.removeItem("azota_in_progress");
        const resumeBanner = document.getElementById("resumeExamBanner");
        if (resumeBanner) resumeBanner.classList.add("hidden");
    }

    function updateActiveAppName(name) {
        activeAppName = name;
        const appLabel = document.getElementById("osActiveAppName");
        const windowTitle = document.getElementById("osWindowTitle");
        const navbarTitle = document.getElementById("appNavbarTitle");
        if (appLabel) appLabel.textContent = name;
        if (windowTitle) windowTitle.textContent = `Aseta — ${name}`;
        if (navbarTitle) navbarTitle.textContent = name;
        document.title = `${name} • Aseta`;
    }

    function toggleSidebar(forceState) {
        const sidebar = document.getElementById("appSidebar");
        const backdrop = document.getElementById("sidebarBackdrop");
        if (!sidebar) return;
        const isCurrentlyOpen = !sidebar.classList.contains("-translate-x-full");
        const shouldOpen = (typeof forceState === "boolean") ? forceState : !isCurrentlyOpen;
        if (shouldOpen) {
            sidebar.classList.remove("-translate-x-full");
            if (backdrop) backdrop.classList.remove("hidden");
        } else {
            sidebar.classList.add("-translate-x-full");
            if (backdrop) backdrop.classList.add("hidden");
        }
    }

    function toggleSidebarExpand(forceState) {
        const sidebar = document.getElementById("appSidebar");
        if (!sidebar) return;
        const willExpand = (typeof forceState === "boolean") ? forceState : !sidebar.classList.contains("sidebar-expanded");
        if (willExpand) {
            sidebar.classList.add("sidebar-expanded");
            try { localStorage.setItem("azota_sidebar_mode", "expanded"); } catch(e) {}
        } else {
            sidebar.classList.remove("sidebar-expanded");
            try { localStorage.setItem("azota_sidebar_mode", "collapsed"); } catch(e) {}
        }
    }

    let currentActiveViewId = "explorer";
    const viewHistoryStack = [];

    function goBack() {
        if (window.AudioHelper && window.AudioHelper.playTap) {
            window.AudioHelper.playTap();
        }
        while (viewHistoryStack.length > 0) {
            const prev = viewHistoryStack.pop();
            if (prev && prev !== currentActiveViewId) {
                showView(prev, true);
                return;
            }
        }
        // Smart default: if inside a utility sub-view, return to Utilities hub; else Dashboard
        const utilitySubs = ["solutions", "gradeCalc", "history", "notebook", "bank", "creator", "essay", "examSchedule"];
        if (utilitySubs.includes(currentActiveViewId)) {
            showView("utilities", true);
        } else {
            showView("dashboard", true);
        }
    }

    function getDashboardData() {
        const currAcc = AccountManager.getCurrentAccount();
        const user = {
            ...UserProfile.get(),
            id: currAcc ? currAcc.id : "acc_ngocbinh",
            name: (currAcc && currAcc.name) || UserProfile.get().name,
            nickname: (currAcc && currAcc.nickname) || UserProfile.get().nickname,
            grade: (currAcc && currAcc.grade) || UserProfile.get().grade,
            avatar: (currAcc && currAcc.avatar) || UserProfile.get().avatar,
            role: (currAcc && currAcc.role) || UserProfile.get().role,
            isAdmin: !!(currAcc && currAcc.isAdmin)
        };
        let leaderboard = [];
        try {
            const raw = getCompiledLeaderboardData();
            leaderboard = [...raw].sort((a, b) => {
                if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
                if ((b.gpa || 0) !== (a.gpa || 0)) return (b.gpa || 0) - (a.gpa || 0);
                if ((b.doneCount || 0) !== (a.doneCount || 0)) return (b.doneCount || 0) - (a.doneCount || 0);
                return (a.name || "").localeCompare(b.name || "", "vi");
            }).map((st, idx) => ({
                ...st,
                rank: idx + 1
            }));
        } catch (e) {
            leaderboard = [];
        }
        const me = leaderboard.find(s => s.isCurrentUser) || {
            points: 0,
            doneCount: 0,
            gpa: 0,
            accuracy: 0,
            rank: 1
        };
        return {
            user: user,
            exp: me.points || 0,
            doneCount: me.doneCount || 0,
            gpa: me.gpa || 0,
            accuracy: me.accuracy || 0,
            rank: me.rank || 1,
            leaderboard: leaderboard
        };
    }

    function updateMobileDockActive(dockKey) {
        document.querySelectorAll(".mobile-dock-btn").forEach(btn => btn.classList.remove("active"));
        const targetBtn = document.getElementById(`mobile-dock-${dockKey}`);
        if (targetBtn) {
            targetBtn.classList.add("active");
        } else {
            const utilBtn = document.getElementById("mobile-dock-utilities") || document.getElementById("mobile-dock-root");
            if (utilBtn) utilBtn.classList.add("active");
        }
    }

    function updateSidebarActive(targetKey) {
        document.querySelectorAll(".nav-item-modern").forEach(item => {
            item.classList.remove("nav-item-active", "liquid-active", "liquid-active-amber");
        });
        let el = document.getElementById(targetKey);
        if (!el) {
            if (targetKey && targetKey.startsWith("sidebar-folder-") && targetKey !== "sidebar-folder-leaderboard" && targetKey !== "sidebar-folder-Hoc_Tu_Luan") {
                el = document.getElementById("sidebar-folder-root");
            } else {
                el = document.getElementById("sidebar-nav-utilities") || document.getElementById("sidebar-folder-root");
            }
        }
        if (el) {
            el.classList.add("nav-item-active");
        }

        // Synchronize Mobile Bottom Dock (Compact 4-item hub)
        if (targetKey === "sidebar-folder-root" || (el && el.id === "sidebar-folder-root")) {
            updateMobileDockActive("root");
        } else if (targetKey === "sidebar-nav-dashboard") {
            updateMobileDockActive("dashboard");
        } else if (targetKey === "sidebar-nav-exam-schedule") {
            updateMobileDockActive("examSchedule");
        } else {
            updateMobileDockActive("utilities");
        }
    }

    function showView(viewId, isBackNav = false) {
        if (!SecurityGuard.checkRateLimit("chuyển trang")) return;

        if (!isBackNav && currentActiveViewId && currentActiveViewId !== viewId && viewId !== "home") {
            viewHistoryStack.push(currentActiveViewId);
            if (viewHistoryStack.length > 20) viewHistoryStack.shift();
        }
        if (viewId !== "home") {
            currentActiveViewId = viewId;
        }

        const views = ["explorerView", "homeView", "dashboardView", "utilitiesView", "examScheduleView", "examView", "essayView", "resultView", "notebookView", "creatorView", "bankView", "historyView", "leaderboardView", "solutionsView", "gradeCalcView"];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) {
                el.classList.add("hidden");
                el.classList.remove("view-animated");
            }
        });

        const activeEl = document.getElementById(viewId + "View");
        if (activeEl) {
            window.scrollTo(0, 0);
            activeEl.classList.remove("hidden");
            activeEl.classList.remove("smooth-fade-view");
            void activeEl.offsetWidth;
            activeEl.classList.add("smooth-fade-view");
        }

        if (window.AzotaDock) {
            window.AzotaDock.setActiveApp(viewId);
        }

        // Auto close mobile drawer on navigation
        toggleSidebar(false);

        if (viewId === "explorer") {
            updateActiveAppName("Kho Đề & Môn Học");
            updateSidebarActive("sidebar-folder-root");
            renderFileExplorer();
            checkInProgressExam();
        } else if (viewId === "dashboard") {
            updateActiveAppName("Dashboard — Tổng Quan & BXH");
            updateSidebarActive("sidebar-nav-dashboard");
            if (window.DashboardHubEngine && typeof window.DashboardHubEngine.renderDashboard === "function") {
                window.DashboardHubEngine.renderDashboard("dashboardHubContainer");
            }
        } else if (viewId === "utilities") {
            updateActiveAppName("Chức Năng & Tiện Ích");
            updateSidebarActive("sidebar-nav-utilities");
            if (window.DashboardHubEngine && typeof window.DashboardHubEngine.renderUtilities === "function") {
                window.DashboardHubEngine.renderUtilities("utilitiesHubContainer");
            }
        } else if (viewId === "examSchedule") {
            updateActiveAppName("Lịch Thi & Đề Cương Cuối HK1");
            updateSidebarActive("sidebar-nav-exam-schedule");
            if (window.ExamScheduleEngine && typeof window.ExamScheduleEngine.render === "function") {
                window.ExamScheduleEngine.render("examScheduleContainer");
            }
        } else if (viewId === "home") {
            openFileExplorer('root');
            return;
        } else if (viewId === "solutions") {
            updateActiveAppName("Kho Lời Giải & Bài Mẫu Chi Tiết");
            updateSidebarActive("sidebar-nav-utilities");
            if (window.SolutionEngine) {
                if (typeof window.SolutionEngine.syncFromCloud === "function") {
                    window.SolutionEngine.syncFromCloud(true);
                } else if (typeof window.SolutionEngine.render === "function") {
                    window.SolutionEngine.render();
                }
            }
        } else if (viewId === "gradeCalc") {
            updateActiveAppName("Tính Điểm & Xếp Loại THPT (TT 22)");
            updateSidebarActive("sidebar-nav-utilities");
            if (window.GradeCalcEngine && typeof window.GradeCalcEngine.render === "function") {
                window.GradeCalcEngine.render("gradeCalcContainer");
            }
        } else if (viewId === "essay") {
            updateActiveAppName("Học Tự Luận Siêu Tốc — Môn Địa");
            updateSidebarActive("sidebar-nav-utilities");
            if (window.EssayEngine) window.EssayEngine.render();
        } else if (viewId === "notebook") {
            updateActiveAppName("Câu Cần Ghi Nhớ");
            updateSidebarActive("sidebar-nav-utilities");
            renderMistakeNotebook();
        } else if (viewId === "bank") {
            updateActiveAppName("Tra Cứu Ngân Hàng Câu Hỏi");
            updateSidebarActive("sidebar-nav-utilities");
            renderQuestionBank();
        } else if (viewId === "creator") {
            updateActiveAppName("Trình Tạo Đề Nhanh AI");
            updateSidebarActive("sidebar-nav-utilities");
        } else if (viewId === "history") {
            updateActiveAppName("Lịch Sử Khảo Thí");
            updateSidebarActive("sidebar-nav-utilities");
            renderExamHistory();
        } else if (viewId === "leaderboard") {
            showView("dashboard", true);
            return;
        } else if (viewId === "exam") {
            updateActiveAppName("Phòng Khảo Thí Trực Tuyến");
        } else if (viewId === "result") {
            updateActiveAppName("Báo Cáo Điểm Số");
        }
    }

    function openEssayStudy(examId = "dia-11-tu-luan", initialSubMode = null) {
        let exam = allExams.find(e => e.id === examId);
        if (!exam) {
            exam = (window.INITIAL_EXAMS || []).find(e => e.id === examId) || allExams[0];
        }
        if (window.EssayEngine) {
            window.EssayEngine.init(exam);
            if (initialSubMode) {
                window.EssayEngine.setSubMode(initialSubMode);
            }
        }
        if (window.AzotaDock) {
            window.AzotaDock.setActiveApp("explorer");
        }
        window.AudioHelper.playClick();
        showView("essay");
    }

    // ==========================================
    // FILE EXPLORER IMPLEMENTATION
    // ==========================================
    function openFileExplorer(folderName = 'root') {
        const aliasMap = {
            'anh-11': 'Tiếng Anh',
            'ta-11': 'Tiếng Anh',
            'tieng-anh': 'Tiếng Anh',
            'van-11': 'Ngữ Văn',
            'th-11': 'Tin Học',
            'su-11': 'Lịch Sử',
            'ls-11': 'Lịch Sử',
            'dia-11': 'Địa Lí',
            'gdktpl-11': 'GDKT&PL',
            'gdkt-11': 'GDKT&PL',
            'toan-11': 'Toán',
            'ly-11': 'Vật Lí',
            'tuluan': 'Hoc_Tu_Luan'
        };
        if (aliasMap[folderName]) {
            folderName = aliasMap[folderName];
        }
        currentExplorerFolder = folderName || 'root';
        explorerKeyword = '';
        const searchInput = document.getElementById("explorerSearchInput");
        if (searchInput) searchInput.value = '';

        if (window.AzotaDock) {
            window.AzotaDock.bounceItem("explorer");
            window.AzotaDock.setActiveApp("explorer");
        }
        window.AudioHelper.playClick();
        showView("explorer");
    }

    function goBackExplorer() {
        window.AudioHelper.playClick();
        openFileExplorer('root');
    }

    function handleExplorerSearch(kw) {
        explorerKeyword = (kw || '').trim().toLowerCase();
        renderFileExplorer();
    }

    function expandSearch() {
        const dock = document.getElementById("expandingSearchDock");
        const input = document.getElementById("explorerSearchInput");
        if (dock) {
            dock.classList.add("is-expanded");
        }
        if (input) {
            setTimeout(() => {
                input.focus();
                input.select();
            }, 60);
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        }
    }

    function collapseSearch() {
        const dock = document.getElementById("expandingSearchDock");
        const input = document.getElementById("explorerSearchInput");
        if (dock) {
            dock.classList.remove("is-expanded");
        }
        if (input) {
            input.value = "";
            handleExplorerSearch("");
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        }
    }

    function setExplorerLayout(layout) {
        explorerLayout = layout;
        const gridBtn = document.getElementById("explorerGridBtn");
        const listBtn = document.getElementById("explorerListBtn");
        if (gridBtn && listBtn) {
            const activeClass = "nimbus-pill-btn p-1.5 sm:p-2 rounded-lg bg-white/95 dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-xs cursor-pointer transition-all active:scale-95";
            const inactiveClass = "nimbus-pill-btn p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 cursor-pointer transition-all active:scale-95";
            if (layout === 'grid') {
                gridBtn.className = activeClass;
                listBtn.className = inactiveClass;
            } else {
                listBtn.className = activeClass;
                gridBtn.className = inactiveClass;
            }
        }
        renderFileExplorer();
    }

    // ==========================================
    // 3D GLASS FOLDERS (Kho Đề & Môn Học Chính)
    // ==========================================
    const GLASS_FOLDER_SUBJECTS = [
        {
            id: "ta-11",
            subjectName: "Tiếng Anh",
            title: "Tiếng Anh 11",
            meta: "1 đề • Trọn bộ 67 từ vựng Unit 4",
            category: "tracnghiem",
            art: "glacier",
            sheets: [
                { id: "ta-unit4-vocab-40", name: "Unit 4: 67 Từ Vựng ASEAN & VN", meta: "67 câu • 45p", art: "aurora" }
            ]
        },
        {
            id: "van-11",
            subjectName: "Ngữ Văn",
            title: "Ngữ Văn 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "van-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "dusk", isEmpty: true },
                { id: "van-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "toan-11",
            subjectName: "Toán",
            title: "Toán 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "aurora",
            sheets: [
                { id: "toan-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "aurora", isEmpty: true },
                { id: "toan-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "ly-11",
            subjectName: "Vật Lí",
            title: "Vật Lí 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "ember",
            sheets: [
                { id: "ly-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "ember", isEmpty: true },
                { id: "ly-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "dia-11",
            subjectName: "Địa Lí",
            title: "Địa Lí 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "aurora",
            sheets: [
                { id: "dia-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "aurora", isEmpty: true },
                { id: "dia-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "th-11",
            subjectName: "Tin Học",
            title: "Tin Học 11",
            meta: "3 đề • Bài 12, 13 (Cơ sở dữ liệu)",
            category: "tracnghiem",
            art: "ember",
            sheets: [
                { id: "th-11-chude-4", name: "Chủ Đề 4: Hệ QTCSDL & CSDL Quan Hệ", meta: "56 câu • 45p", art: "ember" },
                { id: "th-11-bai_12", name: "Bài 12: Hệ Quản Trị CSDL & Hệ CSDL", meta: "28 câu • 25p", art: "glacier" },
                { id: "th-11-bai_13", name: "Bài 13: Cơ Sở Dữ Liệu Quan Hệ", meta: "28 câu • 25p", art: "aurora" }
            ]
        },
        {
            id: "ls-11",
            subjectName: "Lịch Sử",
            title: "Lịch Sử 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "ls-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "dusk", isEmpty: true },
                { id: "ls-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "gdkt-11",
            subjectName: "GDKT&PL",
            title: "GDKT & PL 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "gdkt-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "dusk", isEmpty: true },
                { id: "gdkt-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "gdqp-11",
            subjectName: "GDQP&AN",
            title: "GDQP & AN 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "verdant",
            sheets: [
                { id: "gdqp-11-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "verdant", isEmpty: true },
                { id: "gdqp-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        },
        {
            id: "tuluan",
            subjectName: "Hoc_Tu_Luan",
            title: "Học Tự Luận",
            meta: "0 đề • Tạm thời rỗng",
            category: "tuluan",
            art: "verdant",
            sheets: [
                { id: "tl-coming", name: "Chưa có đề thi", meta: "Đã qua cuối kì", art: "verdant", isEmpty: true },
                { id: "tl-coming-2", name: "Tạm thời rỗng", meta: "Chờ cập nhật", lines: true, isEmpty: true }
            ]
        }
    ];

    function attachGlassFolderEvents(folderEl) {
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

    function buildGlassFolderCard(subjectData) {
        const { id, title, meta, art, sheets } = subjectData;
        const folder = document.createElement("div");
        folder.className = "gf-root";
        folder.setAttribute("data-tone", "dark");
        folder.setAttribute("data-place", "bottom-left");

        const sheetsHtml = sheets.map((sheet, index) => {
            const depth = sheets.length - 1 - index;
            const slot = (index === 0) ? -1 : (index === 1 ? 0 : 1);
            const jx = (index === 0 ? -5 : (index === 2 ? 5 : 0));
            const jr = (index === 0 ? -2 : (index === 2 ? 2 : 0));
            const isArt = !!sheet.art;
            const artClass = sheet.art ? ('gf-art--' + sheet.art) : '';

            return `
                <div class="gf-sheet-slot">
                    <button type="button" 
                            class="gf-sheet ${isArt ? 'gf-sheet--art' : ''}" 
                            style="--gf-depth: ${depth}; --gf-slot: ${slot}; --gf-jx: ${jx}px; --gf-jr: ${jr}deg;"
                            onclick="event.stopPropagation(); ${sheet.isEmpty ? ('AzotaApp.openFileExplorer(\'' + (subjectData.subjectName || subjectData.id) + '\')') : (sheet.isEssay ? 'AzotaApp.openEssayStudy(\'dia-11-tu-luan\')' : 'AzotaApp.startExam(\'' + sheet.id + '\', \'practice\')')};"
                            title="👉 Bấm để vào làm ngay: ${sheet.name}">
                        ${isArt ? '<div class="gf-sheet-art-bg ' + artClass + '"></div>' : ''}
                        <div class="gf-sheet-head">
                            <span class="gf-sheet-name">${sheet.name}</span>
                            <span class="gf-sheet-meta">${sheet.meta}</span>
                        </div>
                        ${!isArt || sheet.lines ? '<div class="gf-lines"><i></i><i></i><i></i></div>' : ''}
                    </button>
                </div>
            `;
        }).join("");

        folder.innerHTML = `
            <div class="gf-stage">
                <div class="gf-tilt">
                    <div class="gf-shadow" aria-hidden="true"></div>

                    <!-- Back panel and its artwork -->
                    <div class="gf-back" aria-hidden="true">
                        <div class="gf-art gf-art--${art}"></div>
                        <div class="gf-back-sheen"></div>
                    </div>
                    <svg class="gf-rim gf-back-rim" viewBox="0 0 340 272" aria-hidden="true">
                        <path d="M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z"></path>
                    </svg>

                    <!-- Files lifting out of the pocket -->
                    <div class="gf-files" role="list">
                        ${sheetsHtml}
                    </div>

                    <!-- Frosted front glass panel -->
                    <div class="gf-front">
                        <div class="gf-tint" aria-hidden="true"></div>
                        <div class="gf-spec" aria-hidden="true"></div>
                        <svg class="gf-rim gf-front-rim" viewBox="0 0 340 198" aria-hidden="true">
                            <path d="M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z"></path>
                        </svg>
                        <button type="button" class="gf-hit" onclick="AzotaApp.handleGlassFolderClick('${id}')" title="Mở thư mục môn ${title}"></button>
                        <div class="gf-label">
                            <span class="gf-title">${title}</span>
                            <span class="gf-meta">${meta}</span>
                        </div>
                    </div>

                    <!-- The key button with vector SVG forward arrow -->
                    <button type="button" class="gf-key" onclick="event.stopPropagation(); AzotaApp.handleGlassFolderClick('${id}')" title="Xem danh sách đề thi môn ${title}">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        attachGlassFolderEvents(folder);
        return folder;
    }

    function handleGlassFolderClick(folderId) {
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper && window.AudioHelper.playClick) {
            window.AudioHelper.playClick();
        }
        const item = GLASS_FOLDER_SUBJECTS.find(s => s.id === folderId);
        if (!item) return;

        if (item.subjectName === "Hoc_Tu_Luan" || item.id === "tuluan") {
            openFileExplorer("Hoc_Tu_Luan");
            return;
        }

        openFileExplorer(item.subjectName);
    }


    function renderFileExplorer() {
        const crumbEl = document.getElementById("explorerCurrentCrumb");
        const crumbBadge = document.getElementById("explorerCrumbBadge");
        const contentArea = document.getElementById("explorerContentArea");
        if (!contentArea) return;

        // Update sidebar highlight with Modernize & Liquid Glass styles
        document.querySelectorAll("[id^='sidebar-folder-']").forEach(el => {
            el.classList.remove("nav-item-active", "liquid-active", "liquid-active-amber", "bg-sky-500/15", "text-sky-500", "font-black", "bg-amber-500/20", "text-amber-400");
        });
        const currentSidebarItem = document.getElementById(`sidebar-folder-${currentExplorerFolder}`);
        if (currentSidebarItem) {
            if (currentExplorerFolder === 'leaderboard') {
                currentSidebarItem.classList.add("liquid-active-amber");
            } else {
                currentSidebarItem.classList.add("nav-item-active");
            }
        }
        updateMobileDockActive(currentExplorerFolder);

        const backBtn = document.getElementById("explorerBackBtn");
        if (backBtn) {
            if (currentExplorerFolder === 'root') {
                backBtn.classList.add("hidden");
            } else {
                backBtn.classList.remove("hidden");
            }
        }

        if (currentExplorerFolder === 'root') {
            if (crumbEl) crumbEl.textContent = "Thư Mục Môn Học";
            if (crumbBadge) {
                crumbBadge.textContent = `${GLASS_FOLDER_SUBJECTS.length} môn`;
                crumbBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/20";
            }
            renderExplorerRootFolders(contentArea);
        } else if (currentExplorerFolder === 'timetable') {
            if (crumbEl) crumbEl.textContent = "Thời Khóa Biểu";
            if (crumbBadge) {
                crumbBadge.textContent = "Sắp Ra Mắt 🔥";
                crumbBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
            }
            renderExplorerTimetable(contentArea);
        } else if (currentExplorerFolder === 'leaderboard') {
            if (crumbEl) crumbEl.textContent = "Bảng Xếp Hạng & Đua Top";
            if (crumbBadge) {
                crumbBadge.textContent = "Top 10 🔥";
                crumbBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30";
            }
            renderExplorerLeaderboard(contentArea);
        } else {
            if (crumbEl) crumbEl.textContent = currentExplorerFolder;
            if (crumbBadge) {
                crumbBadge.textContent = "Chi tiết";
                crumbBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/20";
            }
            renderExplorerSubjectFiles(contentArea, currentExplorerFolder);
        }
    }

    function toggleSubjectTree(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const subTree = document.getElementById("sidebarSubjectsSubTree");
        const arrow = document.getElementById("subjectTreeArrow");
        if (!subTree) return;

        isSubjectTreeCollapsed = !isSubjectTreeCollapsed;
        if (isSubjectTreeCollapsed) {
            subTree.style.maxHeight = "0px";
            subTree.style.opacity = "0";
            subTree.style.pointerEvents = "none";
            if (arrow) arrow.style.transform = "rotate(-90deg)";
        } else {
            subTree.style.maxHeight = "500px";
            subTree.style.opacity = "1";
            subTree.style.pointerEvents = "auto";
            if (arrow) arrow.style.transform = "rotate(0deg)";
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }
    }

    function openTimetable() {
        currentExplorerFolder = 'timetable';
        explorerKeyword = '';
        const searchInput = document.getElementById("explorerSearchInput");
        if (searchInput) searchInput.value = '';

        if (window.AzotaDock) {
            window.AzotaDock.bounceItem("explorer");
            window.AzotaDock.setActiveApp("explorer");
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }
        showView("explorer");
        renderFileExplorer();
    }

    function openLeaderboard() {
        showView("dashboard");
    }

    function refreshLeaderboard() {
        if (window.AudioHelper) window.AudioHelper.playSuccess();
        renderFileExplorer();
    }

    function toggleSidebarMainFolders() {
        const list = document.getElementById("sidebarMainFoldersList");
        const arrow = document.getElementById("sidebarFolderArrow");
        if (!list) return;

        isSidebarMainFoldersCollapsed = !isSidebarMainFoldersCollapsed;
        if (isSidebarMainFoldersCollapsed) {
            list.style.maxHeight = "0px";
            list.style.opacity = "0";
            list.style.pointerEvents = "none";
            if (arrow) arrow.style.transform = "rotate(-90deg)";
        } else {
            list.style.maxHeight = "1200px";
            list.style.opacity = "1";
            list.style.pointerEvents = "auto";
            if (arrow) arrow.style.transform = "rotate(0deg)";
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }
    }

    function setExplorerCategoryFilter(category) {
        currentExplorerCategory = category || 'all';
        document.querySelectorAll(".explorer-cat-btn").forEach(btn => {
            const cat = btn.getAttribute("data-cat");
            if (cat === currentExplorerCategory) {
                btn.className = "explorer-cat-btn active-cat px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shrink-0 transition-all";
            } else {
                btn.className = "explorer-cat-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all";
            }
        });
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }
        renderFileExplorer();
    }

    function handleExplorerSort(sortKey) {
        currentExplorerSort = sortKey || 'default';
        renderFileExplorer();
    }

    function renderExplorerRootFolders(container) {
        container.innerHTML = "";

        // 1. Filter folders by keyword & category
        let activeSubjects = GLASS_FOLDER_SUBJECTS.filter(s => {
            // Category filter
            if (currentExplorerCategory === 'lop11') return true;
            if (currentExplorerCategory === 'tuluan') return s.id === 'tuluan' || s.subjectName === 'Hoc_Tu_Luan';
            if (currentExplorerCategory === 'tracnghiem') return s.id !== 'tuluan' && s.subjectName !== 'Hoc_Tu_Luan';

            // Keyword search filter
            if (!explorerKeyword) return true;
            const kw = explorerKeyword.toLowerCase();
            return s.title.toLowerCase().includes(kw) ||
                   s.subjectName.toLowerCase().includes(kw) ||
                   s.meta.toLowerCase().includes(kw) ||
                   s.sheets.some(sh => sh.name.toLowerCase().includes(kw));
        });

        // 2. Sort folders
        if (currentExplorerSort === 'name') {
            activeSubjects.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        } else if (currentExplorerSort === 'questions') {
            activeSubjects.sort((a, b) => {
                const parseQ = meta => {
                    const m = meta.match(/(\d+)\s*câu/);
                    return m ? parseInt(m[1]) : 0;
                };
                return parseQ(b.meta) - parseQ(a.meta);
            });
        }

        // Section Title & Counter
        const headerDiv = document.createElement("div");
        headerDiv.className = "flex items-center justify-between mb-5 flex-wrap gap-2";
        headerDiv.innerHTML = `
            <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Danh Sách Đề Thi Theo Môn</span>
                    <span class="text-xs text-slate-400 font-normal hidden sm:inline">(Nhấp để mở thư mục & xem danh sách đề)</span>
                </h3>
            </div>
            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold" id="explorerFolderCountDisplay">
                Hiển thị ${activeSubjects.length} / ${GLASS_FOLDER_SUBJECTS.length} thư mục môn học 3D
            </div>
        `;
        // Mini Timetable Banner for Today
        if (window.TimetableEngine && window.TimetableEngine.renderMiniBanner) {
            const bannerBox = document.createElement("div");
            window.TimetableEngine.renderMiniBanner(bannerBox);
            container.appendChild(bannerBox);
        }

        container.appendChild(headerDiv);

        // HERO CARD: UNIT 4 ASEAN AND VIETNAM (TRỌN BỘ 67 TỪ VỰNG)
        const unit4Hero = document.createElement("div");
        unit4Hero.className = "mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/60 to-purple-900/40 border border-blue-500/30 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5";
        unit4Hero.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 select-none">
                    <svg class="w-9 h-9 rounded-full overflow-hidden shadow-md ring-2 ring-white/30" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>
                </div>
                <div>
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-500 text-white shadow-xs">
                            TRỌNG TÂM ÔN TẬP
                        </span>
                        <span class="text-xs font-bold text-sky-400">
                            Unit 4: ASEAN and Vietnam
                        </span>
                    </div>
                    <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">
                        Bài Học Trọn Bộ 67 Từ Vựng Cốt Lõi Unit 4
                    </h2>
                    <p class="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Tổng hợp toàn bộ 67 từ vựng cốt lõi Unit 4 (cả 2 trang đề cương) từ đề cương THPT Trần Văn Giàu. Tích hợp Cô Khảo Bài (Giọng nói nữ tương tác), Flashcard 3D và Trắc nghiệm 67 câu!
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap shrink-0">
                <button type="button" 
                        onclick="if(window.VocabHub){window.VocabHub.openOralTest();}else{AzotaApp.openUnit4VocabCheatSheet();}" 
                        class="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95">
                    <span>👩‍🏫</span>
                    <span>Cô Khảo Bài (67/67)</span>
                </button>
                <button type="button" 
                        onclick="if(window.VocabHub){window.VocabHub.openFlashcards();}else{AzotaApp.openUnit4VocabCheatSheet();}" 
                        class="px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95">
                    <span>🎴</span>
                    <span>Flashcard 3D &amp; Ghép Thẻ</span>
                </button>
                <button type="button" 
                        onclick="AzotaApp.startExam('ta-unit4-vocab-40', 'practice')" 
                        class="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95">
                    <span>📝</span>
                    <span>Khảo Sát 67 Câu</span>
                </button>
            </div>
        `;
        container.appendChild(unit4Hero);

        if (activeSubjects.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "p-12 text-center rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 space-y-3";
            emptyDiv.innerHTML = `
                <div class="text-4xl">🔍</div>
                <h4 class="font-bold text-slate-700 dark:text-slate-200 text-sm">Không tìm thấy thư mục môn học phù hợp</h4>
                <p class="text-xs text-slate-500">Hãy thử tìm từ khóa khác hoặc chuyển danh mục bộ lọc về "Tất cả".</p>
                <button type="button" onclick="AzotaApp.setExplorerCategoryFilter('all')" class="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white cursor-pointer hover:bg-sky-500">
                    Xem tất cả môn học
                </button>
            `;
            container.appendChild(emptyDiv);
            return;
        }

        if (explorerLayout === 'list') {
            const listGrid = document.createElement("div");
            listGrid.className = "space-y-3";
            activeSubjects.forEach(sub => {
                const folderMeta = SUBJECT_FOLDERS.find(f => f.title === sub.title || f.id === sub.subjectName || f.id === sub.id) || {};
                const progressPercent = folderMeta.defaultProgress || 75;
                const card = document.createElement("div");
                card.className = "subject-folder-card group";
                card.onclick = () => handleGlassFolderClick(sub.id);

                card.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3.5 min-w-0">
                            <div class="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${folderMeta.folderBoxBg || 'bg-slate-800 text-sky-400'} group-hover:scale-105 transition-transform">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                                </svg>
                                <span class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black tracking-tight ${folderMeta.badgeBg || 'bg-sky-500 text-white'} shadow-sm">
                                    ${folderMeta.abbr || '11'}
                                </span>
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-sky-400 transition-colors">
                                    ${sub.title}
                                </h4>
                                <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span>${sub.meta}</span>
                                    <span>•</span>
                                    <span class="text-emerald-400 font-bold">Đã ôn ${progressPercent}%</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all pr-2">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-3.5 w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
                        <div class="h-full rounded-full ${folderMeta.lineBg || 'bg-sky-500'}" style="width: ${progressPercent}%"></div>
                    </div>
                `;
                listGrid.appendChild(card);
            });
            container.appendChild(listGrid);
        } else {
            // Default: 3D Glass Folders (Responsive Grid)
            const grid = document.createElement("div");
            grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 justify-items-center py-2";
            activeSubjects.forEach(sub => {
                const folderCard = buildGlassFolderCard(sub);
                grid.appendChild(folderCard);
            });
            container.appendChild(grid);
        }
    }

    // ==========================================
    // MULTI-SCOPE HIGH-DENSITY LEADERBOARD SYSTEM
    // Compact, information-dense, subject-specific & overall GPA
    // ==========================================
    let currentLeaderboardSubject = 'all'; // 'all' (GPA Tổng Hợp), 'dia-11', 'th-11', 'tu-luan', 'en-11', 'ls-11', 'gd-11'
    let currentLeaderboardSort = 'gpa'; // 'gpa' (Điểm TB cao nhất), 'points' (Tổng điểm), 'done' (Số đề)
    let leaderboardSearchQuery = '';

    const LEADERBOARD_SCOPES = [
        { id: 'all', name: '🌟 Tổng Hợp (Điểm TB)', shortName: 'Điểm TB Tổng Hợp', icon: '🌟', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
        { id: 'dia-11', name: '🌍 Địa Lí 11', shortName: 'Địa Lí 11', icon: '🌍', badge: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' },
        { id: 'th-11', name: '💻 Tin Học 11', shortName: 'Tin Học 11', icon: '💻', badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
        { id: 'tu-luan', name: '📝 Học Tự Luận', shortName: 'Tự Luận', icon: '📝', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        { id: 'en-11', name: '🌐 Tiếng Anh 11', shortName: 'Tiếng Anh 11', icon: '🌐', badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
        { id: 'ls-11', name: '🏛️ Lịch Sử 11', shortName: 'Lịch Sử 11', icon: '🏛️', badge: 'bg-amber-500/20 text-amber-500 border border-amber-500/30' },
        { id: 'gd-11', name: '⚖️ GDKT & PL 11', shortName: 'GDKT&PL 11', icon: '⚖️', badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' }
    ];

    // REAL-DATA LEADERBOARD ONLY — ZERO FAKE/MOCK CLASSMATES
    const CLASSMATE_LEADERBOARD_ROSTER = [];

    function getCompiledLeaderboardData() {
        const currAcc = AccountManager.getCurrentAccount();
        const currAccId = currAcc ? currAcc.id : AccountManager.getCurrentAccountId();
        let examHistory = [];
        try {
            examHistory = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
            if (!Array.isArray(examHistory)) examHistory = [];
        } catch (e) {
            examHistory = [];
        }

        function getExamsForAccount(acc) {
            const nickLow = (acc.nickname || "").toLowerCase();
            return examHistory.filter(h => {
                if (!h) return false;
                if (h.accountId) return h.accountId === acc.id;
                if (h.nickname) return h.nickname.toLowerCase() === nickLow;
                // Legacy attempts without accountId belong only to the active account
                return acc.id === currAccId;
            });
        }

        function computeStatsFromExams(exams, roleFallback) {
            const count = exams.length;
            if (count === 0) {
                return { gpa: 0, points: 0, doneCount: 0, accuracy: 0, role: roleFallback || "Chưa làm đề" };
            }
            const totalScore = exams.reduce((sum, h) => sum + (Number(h.score) || 0), 0);
            const gpa = Number((totalScore / count).toFixed(2));
            const points = exams.reduce((sum, h) => sum + Math.round((Number(h.score) || 0) * 20), 0);
            const accSum = exams.reduce((sum, h) => {
                if (h.totalQuestions > 0 && typeof h.correctCount === "number") {
                    return sum + (h.correctCount / h.totalQuestions) * 100;
                }
                return sum + Math.min(100, Math.max(0, (Number(h.score) || 0) * 10));
            }, 0);
            const accuracy = Math.round(accSum / count);
            return { gpa, points, doneCount: count, accuracy, role: roleFallback || "🎓 Học Sinh" };
        }

        function computeSubjectStats(exams, matcher, roleFallback) {
            const subExams = exams.filter(h => {
                const title = (h.examTitle || "").toLowerCase();
                const subj = (h.subject || "").toLowerCase();
                return title.includes(matcher) || subj.includes(matcher);
            });
            return computeStatsFromExams(subExams, roleFallback);
        }

        function readAccountStreak(accId) {
            try {
                const raw = localStorage.getItem("aseta_daily_streak_v2_" + accId);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed.count === "number") return parsed.count;
                }
            } catch (_) {}
            return 0;
        }

        const allAccounts = AccountManager.getAllAccounts();
        const combined = allAccounts.map(acc => {
            const accExams = getExamsForAccount(acc);
            const scores = {
                all: computeStatsFromExams(accExams, acc.role || "🎓 Học Sinh"),
                "dia-11": computeSubjectStats(accExams, "địa", acc.role),
                "th-11": computeSubjectStats(accExams, "tin", acc.role),
                "tu-luan": computeSubjectStats(accExams, "tự luận", acc.role),
                "en-11": computeSubjectStats(accExams, "tiếng anh", acc.role),
                "ls-11": computeSubjectStats(accExams, "sử", acc.role),
                "gd-11": computeSubjectStats(accExams, "kt", acc.role)
            };
            return {
                id: acc.id,
                name: acc.name,
                nickname: acc.nickname,
                avatar: acc.avatar || (acc.isAdmin ? "👑" : "🎓"),
                grade: acc.grade || "Lớp 11",
                isAdmin: !!acc.isAdmin,
                streak: readAccountStreak(acc.id),
                isCurrentUser: acc.id === currAccId,
                scores: scores
            };
        });

        const mapped = combined.map(student => {
            const subScore = student.scores[currentLeaderboardSubject] || student.scores.all;
            return {
                id: student.id,
                name: student.name,
                nickname: student.nickname,
                avatar: student.avatar,
                grade: student.grade,
                isAdmin: student.isAdmin,
                streak: student.streak || 0,
                isCurrentUser: !!student.isCurrentUser,
                gpa: subScore.gpa,
                points: subScore.points,
                doneCount: subScore.doneCount,
                accuracy: subScore.accuracy,
                role: subScore.role
            };
        });

        let filtered = mapped;
        if (leaderboardSearchQuery.trim()) {
            const q = leaderboardSearchQuery.trim().toLowerCase();
            filtered = mapped.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.nickname.toLowerCase().includes(q) ||
                s.grade.toLowerCase().includes(q)
            );
        }

        filtered.sort((a, b) => {
            if (currentLeaderboardSort === 'points') {
                if (b.points !== a.points) return b.points - a.points;
                if (b.gpa !== a.gpa) return b.gpa - a.gpa;
            } else if (currentLeaderboardSort === 'done') {
                if (b.doneCount !== a.doneCount) return b.doneCount - a.doneCount;
                if (b.points !== a.points) return b.points - a.points;
            } else {
                if (b.points !== a.points) return b.points - a.points;
                if (b.gpa !== a.gpa) return b.gpa - a.gpa;
            }
            return (a.name || "").localeCompare(b.name || "", "vi");
        });

        return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    function setLeaderboardScope(scopeId) {
        currentLeaderboardSubject = scopeId || 'all';
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }
        const contentArea = document.getElementById("explorerContentArea");
        if (contentArea) renderExplorerLeaderboard(contentArea);
    }

    function setLeaderboardSort(sortKey) {
        currentLeaderboardSort = sortKey || 'gpa';
        if (window.AudioHelper) window.AudioHelper.playClick();
        const contentArea = document.getElementById("explorerContentArea");
        if (contentArea) renderExplorerLeaderboard(contentArea);
    }

    function handleLeaderboardSearch(query) {
        leaderboardSearchQuery = query || '';
        const contentArea = document.getElementById("explorerContentArea");
        if (contentArea) renderExplorerLeaderboard(contentArea);
    }

    function renderExplorerTimetable(container) {
        if (window.TimetableEngine && window.TimetableEngine.render) {
            window.TimetableEngine.render(container);
        } else {
            container.innerHTML = '<div class="p-8 text-center text-slate-400">Đang tải thời khóa biểu...</div>';
        }
    }

    function renderExplorerLeaderboard(container) {
        container.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "py-10 px-4 sm:px-8 max-w-3xl mx-auto space-y-6 text-center animate-fadeIn";

        wrapper.innerHTML = `
            <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/25 to-yellow-400/20 blur-2xl animate-pulse"></div>
                <div class="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 border border-amber-300/40 transform hover:scale-105 hover:rotate-3 transition-transform cursor-pointer" onclick="window.AudioHelper && window.AudioHelper.playBubblePop()">
                    🏆
                </div>
            </div>

            <div class="space-y-3">
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>SẮP RA MẮT • COMING SOON</span>
                </div>
                <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bảng Xếp Hạng &amp; Đua Top Toàn Trường
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Hệ thống vinh danh bảng vàng và tính điểm thi đua thời gian thực đang được hoàn thiện. Hãy chăm chỉ luyện đề tại Aseta để sẵn sàng bứt phá top 1 khi tính năng ra mắt nhé!
                </p>
            </div>

            <!-- Coming Soon Feature Highlights -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg font-bold mb-2.5">
                        🥇
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Top 10 Cao Thủ Tuần</div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Vinh danh học sinh có điểm trung bình khảo thí cao nhất.</div>
                </div>

                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center text-lg font-bold mb-2.5">
                        ⚡
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Tốc Độ Giải Đề Thần Tốc</div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Ghi nhận chuỗi trả lời đúng nhanh nhất mà không dùng gợi ý.</div>
                </div>

                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-lg font-bold mb-2.5">
                        👑
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Danh Hiệu &amp; Huy Hiệu</div>
                    <div class="text-[11px] text-slate-400 mt-1 leading-normal">Mở khóa huy hiệu VIP và danh hiệu học sinh xuất sắc.</div>
                </div>
            </div>

            <div class="pt-4 flex items-center justify-center gap-3">
                <button type="button" onclick="AzotaApp.openFileExplorer('root')" class="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98">
                    <span>📁</span>
                    <span>Về Kho Đề &amp; Luyện Thi Ngay</span>
                </button>
            </div>
        `;

        container.appendChild(wrapper);
    }

    function renderExplorerHocTuLuan(container) {
        container.innerHTML = "";

        // Sleek Subject Header (Back button moved up to toolbar)
        const headerDiv = document.createElement("div");
        headerDiv.className = "mb-5 p-4 sm:p-4.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs";
        headerDiv.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/25">
                    📝
                </div>
                <div class="min-w-0">
                    <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        Thư Mục: Học Tự Luận
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                        Chọn môn học bên dưới để bắt đầu học thuộc tự luận với Flashcard 3D, Active Recall & Chấm điểm AI
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ✨ Phương Pháp Ghi Nhớ Hiện Đại
                </span>
            </div>
        `;
        container.appendChild(headerDiv);

        // Subject cards inside "Học Tự Luận"
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 lg:grid-cols-2 gap-5";

        // Card 1: Địa Lí 11 (Available now!)
        const diaCard = document.createElement("div");
        diaCard.className = "p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-2 border-emerald-500/40 hover:border-emerald-500/70 transition-all shadow-xl space-y-4";
        diaCard.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
                        🌍
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                                Sẵn Sàng Học
                            </span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                Lớp 11
                            </span>
                            <span class="text-xs text-slate-400">6 câu tự luận + Biểu đồ</span>
                        </div>
                        <h4 class="text-lg font-black text-slate-900 dark:text-white mt-1">
                            Môn Địa Lí 11 — Tự Luận Cấp Tốc
                        </h4>
                    </div>
                </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Đầy đủ 6 câu trọng tâm theo đúng ảnh chụp đề cương: Toàn cầu hoá kinh tế (biểu hiện & hệ quả), Mỹ Latinh (dân cư & khí hậu), Quy mô Liên minh Châu Âu (EU), 4 vấn đề an ninh toàn cầu & bí kíp nhận dạng 4 dạng biểu đồ.
            </p>

            <!-- 4 Quick Mode Buttons -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20">
                <button type="button" onclick="AzotaApp.openEssayStudy('dia-11-tu-luan', 'flashcard')" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-emerald-500 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer group">
                    <div class="text-xs font-black flex items-center gap-1.5">
                        <span>🃏</span> Flashcard 3D
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-emerald-100 mt-0.5">Lật thẻ học thuộc nhanh</div>
                </button>
                <button type="button" onclick="AzotaApp.openEssayStudy('dia-11-tu-luan', 'cloze')" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-teal-500 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-left transition-all cursor-pointer group">
                    <div class="text-xs font-black flex items-center gap-1.5">
                        <span>✏️</span> Che Khuyết Từ Khóa
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-teal-100 mt-0.5">Active Recall điền từ</div>
                </button>
                <button type="button" onclick="AzotaApp.openEssayStudy('dia-11-tu-luan', 'write')" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-cyan-600 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-cyan-600 text-left transition-all cursor-pointer group">
                    <div class="text-xs font-black flex items-center gap-1.5">
                        <span>🤖</span> Tự Viết & Chấm AI
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-cyan-100 mt-0.5">So khớp từ khóa thang 10</div>
                </button>
                <button type="button" onclick="AzotaApp.openEssayStudy('dia-11-tu-luan', 'chart')" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left transition-all cursor-pointer group">
                    <div class="text-xs font-black flex items-center gap-1.5">
                        <span>📊</span> Bí Kíp Biểu Đồ
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-amber-100 mt-0.5">Mẹo từ khóa Tròn, Miền, Cột, Đường</div>
                </button>
            </div>

            <!-- Big Action Button -->
            <button type="button" onclick="AzotaApp.openEssayStudy('dia-11-tu-luan')" class="w-full py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-500 transition-all cursor-pointer flex items-center justify-center gap-2">
                <span>🚀</span> Vào Học Tự Luận Môn Địa Lí 11
            </button>
        `;
        grid.appendChild(diaCard);

        // Placeholder cards for other subjects
        const placeholderSubjects = [
            {
                name: "Môn Tin Học 11 — Tự Luận Kiến Thức Cốt Lõi",
                icon: "💻",
                gradient: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
                badge: "Sắp Ra Mắt",
                desc: "Hệ điều hành, mã nguồn mở, kiến trúc CPU/RAM/ROM, truyền dữ liệu bus và lưu trữ đám mây."
            },
            {
                name: "Môn GDKT & PL 11 — Tự Luận Tình Huống Pháp Luật",
                icon: "⚖️",
                gradient: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20",
                badge: "Sắp Ra Mắt",
                desc: "Phân tích quy luật cung cầu, lạm phát, thất nghiệp và kỹ năng giải quyết tình huống pháp luật."
            },
            {
                name: "Môn Lịch Sử 11 — Tự Luận Sự Kiện & Ý Nghĩa",
                icon: "🏛️",
                gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
                badge: "Sắp Ra Mắt",
                desc: "Nguyên nhân, ý nghĩa các cuộc cách mạng tư sản, lịch sử các cuộc kháng chiến và tổ chức ASEAN."
            }
        ];

        placeholderSubjects.forEach(s => {
            const card = document.createElement("div");
            card.className = `p-5 sm:p-6 rounded-3xl bg-gradient-to-br ${s.gradient} border transition-all shadow-md space-y-3.5 opacity-80`;
            card.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3.5">
                        <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-2xl shrink-0">
                            ${s.icon}
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    ${s.badge}
                                </span>
                                <span class="text-xs text-slate-400">Lớp 11</span>
                            </div>
                            <h4 class="text-base font-black text-slate-800 dark:text-slate-200 mt-1">
                                ${s.name}
                            </h4>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    ${s.desc}
                </p>
                <div class="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <span class="text-[11px] text-slate-400 italic">Đang cập nhật ngân hàng đề cương...</span>
                    <button type="button" disabled class="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-400 cursor-not-allowed">
                        Chưa Mở
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    function renderExplorerSubjectFiles(container, subjectName) {

        container.innerHTML = "";

        const folderMeta = SUBJECT_FOLDERS.find(f => f.id === subjectName) || {
            title: subjectName,
            icon: "📁",
            description: "Thư mục tài liệu khảo thí"
        };

        let exams = allExams.filter(e => e.subject === subjectName);
        if (explorerKeyword) {
            exams = exams.filter(e => 
                e.title.toLowerCase().includes(explorerKeyword) ||
                (e.description && e.description.toLowerCase().includes(explorerKeyword))
            );
        }

        // Sleek Subject Header (Back button moved up to toolbar)
        const headerDiv = document.createElement("div");
        headerDiv.className = "mb-5 p-4 sm:p-4.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs";
        headerDiv.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-500 dark:text-sky-400 flex items-center justify-center text-xl shrink-0 border border-sky-500/25">
                    ${folderMeta.icon || '📁'}
                </div>
                <div class="min-w-0">
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        ${folderMeta.title}
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Tổng cộng ${exams.length} tệp đề thi (.azota)
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold ${exams.length > 0 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                    ${exams.length > 0 ? 'Sẵn sàng ôn luyện & thi thử' : 'Tạm thời rỗng (Chờ cập nhật)'}
                </span>
            </div>
        `;
        container.appendChild(headerDiv);

        if (subjectName === "Tiếng Anh") {
            const tip = document.createElement("div");
            tip.className = "mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm";
            tip.innerHTML = `
                <div class="flex items-center gap-3 text-xs text-blue-900 dark:text-blue-100">
                    <svg class="w-8 h-8 rounded-full overflow-hidden shadow-sm ring-1 ring-white/20 shrink-0" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>
                    <div>
                        <div class="font-extrabold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <span>Bài Học Trọn Bộ 67 Từ Vựng Unit 4: ASEAN and Vietnam</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">Mới Nhất</span>
                        </div>
                        <div class="text-slate-600 dark:text-slate-300 mt-0.5">
                            Tổng hợp toàn bộ 67 từ vựng Unit 4 từ tài liệu đề cương chính thức của trường THPT Trần Văn Giàu. Đầy đủ phát âm, từ loại và tra cứu nhanh!
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 flex-wrap">
                    <button type="button" onclick="if(window.VocabHub){window.VocabHub.openOralTest();}else{AzotaApp.openUnit4VocabCheatSheet();}" class="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-pink-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95">
                        <span>👩‍🏫</span> Cô Khảo Bài (67/67)
                    </button>
                    <button type="button" onclick="if(window.VocabHub){window.VocabHub.openFlashcards();}else{AzotaApp.openUnit4VocabCheatSheet();}" class="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95">
                        <span>🎴</span> Flashcard 3D & Game
                    </button>
                    <button type="button" onclick="if(window.VocabHub){window.VocabHub.openCheatSheet();}else{AzotaApp.openUnit4VocabCheatSheet();}" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95">
                        <span>📖</span> Bảng 67 Từ
                    </button>
                    <button type="button" onclick="AzotaApp.startExam('ta-unit4-vocab-40', 'practice')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95">
                        <span>📝</span> Làm Khảo Sát 67 Câu
                    </button>
                </div>
            `;
            container.appendChild(tip);
        }

        if (subjectName === "Địa Lí") {
            const tip = document.createElement("div");
            tip.className = "mb-4 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3";
            tip.innerHTML = `
                <div class="flex items-center gap-3 text-xs text-teal-800 dark:text-teal-200">
                    <span class="text-2xl">💡</span>
                    <div>
                        <div class="font-extrabold text-sm text-teal-900 dark:text-teal-100">Bạn muốn học 6 câu tự luận & nhận dạng biểu đồ?</div>
                        <div class="text-slate-600 dark:text-slate-300 mt-0.5">Phần tự luận đã được tách thành thư mục riêng <strong>Học Tự Luận</strong> với Flashcard 3D & Chấm AI.</div>
                    </div>
                </div>
                <button type="button" onclick="AzotaApp.openFileExplorer('Hoc_Tu_Luan')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md">
                    <span>📝</span> Mở Thư Mục Học Tự Luận ➜
                </button>
            `;
            container.appendChild(tip);
        }

        if (exams.length === 0) {
            container.innerHTML += `
                <div class="py-16 px-6 text-center rounded-3xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl space-y-4 max-w-xl mx-auto shadow-lg my-6">
                    <div class="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500/20 via-blue-500/10 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-4xl shadow-inner">
                        📁
                    </div>
                    <div class="space-y-1.5">
                        <h4 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            Thư mục môn ${folderMeta.title} hiện đang rỗng
                        </h4>
                        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                            Đề thi và tài liệu khảo thí cho môn học này đang được chuẩn bị và sẽ sớm được cập nhật vào hệ thống.
                        </p>
                    </div>
                    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25">
                        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>Trạng thái: 0 đề thi • Tạm thời rỗng (Chờ cập nhật)</span>
                    </div>
                    <div class="pt-2">
                        <button type="button" 
                                onclick="AzotaApp.openFileExplorer('root')" 
                                class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95">
                            <span>←</span>
                            <span>Quay lại Thư Mục Môn Học</span>
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Grid or List Layout
        const listDiv = document.createElement("div");
        listDiv.className = (explorerLayout === 'grid') 
            ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
            : "space-y-3";

        // Sort so that Full 64 questions (Địa) and Chủ Đề 4 (Tin) are first
        const sortedExams = [...exams].sort((a, b) => {
            if (a.id === "dia-11-full-64" || a.id === "th-11-chude-4") return -1;
            if (b.id === "dia-11-full-64" || b.id === "th-11-chude-4") return 1;
            return 0;
        });

        sortedExams.forEach(exam => {
            const isChude4 = (exam.id === "th-11-chude-4");
            const isFull64 = (exam.id === "dia-11-full-64");
            const isHighlight = isChude4 || isFull64;
            const qCount = exam.questions ? exam.questions.length : 0;
            const card = document.createElement("div");
            card.className = `exam-file-card cursor-pointer group ${isHighlight ? (isFull64 ? 'ring-1 ring-teal-500/40' : 'ring-1 ring-rose-500/40') : ''}`;

            card.innerHTML = `
                <div class="flex items-start justify-between gap-3 min-w-0">
                    <div class="flex items-start gap-3 min-w-0 flex-1">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isHighlight ? (isFull64 ? 'bg-gradient-to-tr from-teal-500 to-cyan-600 text-white shadow-md' : 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md') : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                            ${isHighlight ? '🔥' : '📄'}
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                ${isFull64 ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shrink-0">FULL 64 CÂU ĐỀ CƯƠNG</span>' : ''}
                                ${isChude4 ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">CHỦ ĐỀ 4 (BÀI 12-13)</span>' : ''}
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">${exam.grade ? 'Lớp ' + exam.grade : 'Khảo sát'}</span>
                                <span class="text-xs text-slate-400 font-mono shrink-0">.azota</span>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1 leading-snug line-clamp-2 break-words group-hover:text-fuchsia-300 transition-colors">
                                ${exam.title}
                            </h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed break-words">
                                ${exam.description || 'Đề khảo sát trắc nghiệm kiến thức trọng tâm.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        <span>📝 ${qCount} câu hỏi</span>
                        <span>⏱️ ${exam.duration > 0 ? exam.duration + ' phút' : 'Không giới hạn'}</span>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'practice')" class="btn-card-practice px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                            <span>💡</span> Luyện Tập
                        </button>
                        <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'exam')" class="btn-card-exam px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                            <span>⏱️</span> Thi Thử
                        </button>
                    </div>
                </div>
            `;
            listDiv.appendChild(card);
        });

        container.appendChild(listDiv);
    }

    function setExamViewMode(mode) {
        examViewMode = mode;
        const btnGrouped = document.getElementById("examViewGroupedBtn");
        const btnAll = document.getElementById("examViewAllBtn");
        if (btnGrouped && btnAll) {
            if (mode === "grouped") {
                btnGrouped.className = "px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-sky-500 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all";
                btnAll.className = "px-3 py-1 rounded-lg hover:text-sky-500 cursor-pointer flex items-center gap-1.5 transition-all";
            } else {
                btnAll.className = "px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-sky-500 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all";
                btnGrouped.className = "px-3 py-1 rounded-lg hover:text-sky-500 cursor-pointer flex items-center gap-1.5 transition-all";
            }
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        }
        renderExamGrid();
    }

    function setSubjectFilter(sub) {
        currentFilter.subject = sub;
        if (sub === "all") {
            examViewMode = "grouped";
            const btnGrouped = document.getElementById("examViewGroupedBtn");
            const btnAll = document.getElementById("examViewAllBtn");
            if (btnGrouped && btnAll) {
                btnGrouped.className = "px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-sky-500 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all";
                btnAll.className = "px-3 py-1 rounded-lg hover:text-sky-500 cursor-pointer flex items-center gap-1.5 transition-all";
            }
        }
        document.querySelectorAll(".subject-tab").forEach(tab => {
            if (tab.dataset.subject === sub) {
                tab.className = "subject-tab active-sub-tab px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shrink-0";
            } else {
                tab.className = "subject-tab px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1.5";
            }
        });
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        }
        renderExamGrid();
    }

    function setGradeFilter(gr) {
        currentFilter.grade = gr;
        document.querySelectorAll(".grade-tab").forEach(tab => {
            if (tab.dataset.grade === gr) {
                tab.className = "grade-tab px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all cursor-pointer shadow-sm";
            } else {
                tab.className = "grade-tab px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer";
            }
        });
        renderExamGrid();
    }

    function renderDashboardStats() {
        let history = [];
        let notebook = [];
        try {
            history = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {}

        const totalExamsDone = history.length;
        let avgScore = 0;
        let totalCorrect = 0;
        let totalIncorrect = 0;

        if (totalExamsDone > 0) {
            const sumScore = history.reduce((acc, cur) => acc + (cur.score || 0), 0);
            avgScore = (sumScore / totalExamsDone).toFixed(1);
            totalCorrect = history.reduce((acc, cur) => acc + (cur.correctCount || 0), 0);
            totalIncorrect = history.reduce((acc, cur) => acc + (cur.incorrectCount || 0), 0);
        }

        const elDone = document.getElementById("statExamsDone");
        const elAvg = document.getElementById("statAvgScore");
        const elCorrect = document.getElementById("statCorrectRate");
        const elMistakes = document.getElementById("statMistakeCount");

        if (elDone) elDone.textContent = totalExamsDone;
        if (elAvg) elAvg.textContent = totalExamsDone > 0 ? avgScore : "--";
        if (elCorrect) {
            const grandTotal = totalCorrect + totalIncorrect;
            const rate = grandTotal > 0 ? Math.round((totalCorrect / grandTotal) * 100) : 0;
            elCorrect.textContent = grandTotal > 0 ? `${rate}%` : "--";
        }
        if (elMistakes) elMistakes.textContent = notebook.length;
    }

    function renderExamGrid() {
        const grid = document.getElementById("examGrid");
        const countEl = document.getElementById("examCountBadge");
        const titleEl = document.getElementById("examSectionTitle");
        const subTitleEl = document.getElementById("examSectionSubtitle");
        const bannerEl = document.getElementById("examSubjectDetailBanner");
        if (!grid) return;

        grid.innerHTML = "";

        // MODE 1: Grouped Subject Folders (Glass Folder 3D with Lifting Sheets)
        if (currentFilter.subject === "all" && !currentFilter.search && examViewMode === "grouped") {
            if (bannerEl) bannerEl.classList.add("hidden");
            if (titleEl) titleEl.innerHTML = `<span>Danh Sách Đề Thi Theo Môn</span>`;
            if (subTitleEl) subTitleEl.textContent = `${GLASS_FOLDER_SUBJECTS.length} Thư Mục 3D`;
            if (countEl) countEl.textContent = `${allExams.length} đề thi (${GLASS_FOLDER_SUBJECTS.length} môn)`;

            grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center";

            GLASS_FOLDER_SUBJECTS.forEach(sub => {
                const folderCard = buildGlassFolderCard(sub);
                grid.appendChild(folderCard);
            });
            return;
        }

        // MODE 2: Specific Subject Detail OR All Exams Flat List OR Search Active
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5";

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
        } catch (e) {}

        const filtered = allExams.filter(exam => {
            const matchSub = (currentFilter.subject === "all" || exam.subject === currentFilter.subject);
            const matchGrade = (currentFilter.grade === "all" || exam.grade === currentFilter.grade);
            const matchSearch = !currentFilter.search || 
                (exam.title && exam.title.toLowerCase().includes(currentFilter.search)) ||
                (exam.description && exam.description.toLowerCase().includes(currentFilter.search)) ||
                (exam.subject && exam.subject.toLowerCase().includes(currentFilter.search));
            return matchSub && matchGrade && matchSearch;
        });

        if (countEl) countEl.textContent = `${filtered.length} đề thi`;

        // Update banner if in specific subject
        if (bannerEl) {
            if (currentFilter.subject !== "all") {
                bannerEl.classList.remove("hidden");
                const bTitle = document.getElementById("subjectDetailTitle");
                const bDesc = document.getElementById("subjectDetailDesc");
                const bIcon = document.getElementById("subjectDetailIcon");
                if (bTitle) bTitle.textContent = `Đang xem: ${currentFilter.subject}`;
                if (bDesc) bDesc.textContent = `Hiển thị ${filtered.length} đề ôn tập khảo sát kiến thức chuẩn chương trình.`;
                if (bIcon) {
                    if (currentFilter.subject.includes("Địa Lí")) bIcon.textContent = "🌍";
                    else if (currentFilter.subject.includes("Tin Học")) bIcon.textContent = "💻";
                    else if (currentFilter.subject.includes("Tự Luận")) bIcon.textContent = "📝";
                    else if (currentFilter.subject.includes("Tiếng Anh")) bIcon.textContent = "🌐";
                    else if (currentFilter.subject.includes("Lịch Sử")) bIcon.textContent = "🏛️";
                    else if (currentFilter.subject.includes("GDKT")) bIcon.textContent = "⚖️";
                    else bIcon.textContent = "📁";
                }
            } else {
                bannerEl.classList.add("hidden");
            }
        }

        if (titleEl) {
            titleEl.innerHTML = currentFilter.subject !== "all" 
                ? `<span>Danh Sách Đề Thi — ${currentFilter.subject}</span>`
                : `<span>Danh Sách Toàn Bộ Đề Thi Khảo Sát</span>`;
        }
        if (subTitleEl) {
            subTitleEl.textContent = `${filtered.length} đề`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center text-slate-400">
                    <div class="text-5xl mb-3">🔍</div>
                    <p class="font-bold text-lg text-slate-700 dark:text-slate-300">Không tìm thấy đề thi phù hợp</p>
                    <p class="text-sm mt-1">Hãy thử đổi môn học hoặc bấm nút quay lại xem thư mục 3D.</p>
                    <button type="button" onclick="AzotaApp.setSubjectFilter('all')" class="mt-4 px-4 py-2 rounded-xl text-xs font-black bg-sky-600 text-white shadow-md hover:bg-sky-500 transition-all cursor-pointer">
                        ⬅ Về Thư Mục 3D
                    </button>
                </div>
            `;
            return;
        }

        filtered.forEach(exam => {
            const attempts = history.filter(h => h.examId === exam.id);
            let bestScore = null;
            if (attempts.length > 0) {
                bestScore = Math.max(...attempts.map(a => a.score || 0));
            }

            const card = document.createElement("div");
            card.className = "neon-beam-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between group cursor-pointer";

            const qCount = exam.questions ? exam.questions.length : 0;
            const isChude4 = (exam.id === "th-11-chude-4");
            const isFull64 = (exam.id === "dia-11-full-64");

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between gap-1.5 mb-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            ${isChude4 ? '<span class="px-2 py-0.2 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-sm">TRỌN BỘ 56 CÂU</span>' : ''}
                            ${isFull64 ? '<span class="px-2 py-0.2 rounded-md text-[10px] font-black bg-teal-600 text-white shadow-sm">FULL 64 CÂU</span>' : ''}
                            <span class="px-2 py-0.2 rounded-md text-[10px] font-black ${getSubjectBadge(exam.subject)}">
                                ${exam.subject}
                            </span>
                            <span class="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Lớp ${exam.grade || '11'}
                            </span>
                        </div>
                        ${bestScore !== null ? `
                            <span class="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                ⭐ ${bestScore.toFixed(1)}
                            </span>
                        ` : ''}
                    </div>

                    <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 break-words group-hover:text-fuchsia-300 transition-colors">
                        ${exam.title}
                    </h4>

                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed break-words">
                        ${exam.description || 'Đề ôn tập khảo sát kiến thức chuẩn chương trình.'}
                    </p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                    <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
                        <span>📝 ${qCount} câu hỏi</span>
                        <span>⏱️ ${exam.duration > 0 ? exam.duration + ' phút' : 'Tự do'}</span>
                    </div>

                    ${(exam.isEssay || exam.id === 'dia-11-tu-luan') ? `
                        <div class="space-y-1.5">
                            <button type="button" onclick="AzotaApp.openEssayStudy('${exam.id}')" class="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white shadow-sm hover:from-emerald-400 hover:to-green-500 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
                                <span>📝</span> Học Tự Luận Siêu Tốc (AI)
                            </button>
                            <div class="grid grid-cols-2 gap-1.5">
                                <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'practice')" class="btn-card-practice w-full py-1.5 rounded-xl text-xs font-semibold text-center cursor-pointer whitespace-nowrap">
                                    Luyện Viết
                                </button>
                                <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'exam')" class="btn-card-exam w-full py-1.5 rounded-xl text-xs font-bold text-center cursor-pointer whitespace-nowrap">
                                    Thi Thử
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'practice')" class="btn-card-practice w-full py-1.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                                <span>💡</span> Luyện Tập
                            </button>
                            <button type="button" onclick="AzotaApp.startExam('${exam.id}', 'exam')" class="btn-card-exam w-full py-1.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                                <span>⏱️</span> Thi Thử
                            </button>
                        </div>
                    `}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function getSubjectBadge(sub) {
        switch (sub) {
            case "Học Tự Luận": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
            case "Địa Lí": return "bg-teal-500/15 text-teal-400 border border-teal-500/30";
            case "Tin Học": return "bg-rose-500/15 text-rose-500 border border-rose-500/30";
            case "Tiếng Anh": return "bg-blue-500/15 text-blue-500 border border-blue-500/30";
            case "Lịch Sử": return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
            case "GDKT&PL": return "bg-purple-500/15 text-purple-500 border border-purple-500/30";
            default: return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30";
        }
    }

    function startExam(examId, mode = "exam") {
        const exam = allExams.find(e => e.id === examId);
        if (!exam) {
            AzotaModal.alert("Không tìm thấy đề thi này!", "Thông Báo", "🔍");
            return;
        }

        const layout = document.getElementById("prefLayoutSelect")?.value || "single";
        const shuffleQ = shuffleQuestions;
        const shuffleOpt = shuffleOptions;

        window.ExamEngine.startExam(exam, mode, {
            layout: layout,
            shuffleQuestions: shuffleQ,
            shuffleOptions: shuffleOpt
        });
        showView("exam");
        updateActiveAppName(exam.title);
    }

    function launchFullTinHoc(mode = "practice") {
        if (window.AzotaDock) {
            window.AzotaDock.bounceItem("tinhoc");
            window.AzotaDock.setActiveApp("tinhoc");
        }
        startExam("th-11-chude-4", mode);
    }

    function startRandomMockQuiz(count = 20) {
        let pool = [];
        allExams.forEach(e => {
            if (e.questions) {
                e.questions.forEach(q => pool.push({ ...q, originSubject: e.subject, originExam: e.title }));
            }
        });

        if (pool.length === 0) return;

        pool = [...pool].sort(() => Math.random() - 0.5);
        const selected = pool.slice(0, count);

        const customExam = {
            id: `random-mock-${Date.now()}`,
            title: `Đề Thi Thử Ngẫu Nhiên (${count} câu hỏi)`,
            subject: "Tổng Hợp",
            grade: "11",
            duration: Math.round(count * 1.25),
            description: `Đề thi tổng hợp chọn lọc ngẫu nhiên ${count} câu hỏi từ ngân hàng hệ thống.`,
            author: "Aseta Random Generator",
            questions: selected
        };

        window.ExamEngine.startExam(customExam, "exam", { layout: "single", shuffleQuestions: true });
        showView("exam");
        updateActiveAppName("Thi Thử Ngẫu Nhiên");
    }

    let currentResultReviewFilter = 'all';

    function isQuestionInNotebook(qId) {
        try {
            const notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
            return notebook.some(item => String(item.id) === String(qId));
        } catch (e) {
            return false;
        }
    }

    function toggleRememberQuestion(qId, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        let notebook = [];
        try {
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {
            notebook = [];
        }

        const qIndex = notebook.findIndex(item => String(item.id) === String(qId));
        let isSavedNow = false;

        if (qIndex >= 0) {
            notebook.splice(qIndex, 1);
            isSavedNow = false;
        } else {
            const qs = (currentResultData && (currentResultData.examQuestions || currentResultData.questions)) || [];
            let targetQ = qs.find(q => String(q.id) === String(qId));
            if (!targetQ) {
                allExams.forEach(e => {
                    if (e.questions) {
                        const found = e.questions.find(q => String(q.id) === String(qId));
                        if (found) targetQ = { ...found, examTitle: e.title, subject: e.subject };
                    }
                });
            }
            if (targetQ) {
                notebook.unshift({
                    ...targetQ,
                    examTitle: targetQ.examTitle || (currentResultData ? currentResultData.examTitle : 'Đề Khảo Sát'),
                    subject: targetQ.subject || (currentResultData ? currentResultData.subject : 'Tổng Hợp'),
                    savedAt: new Date().toISOString()
                });
                isSavedNow = true;
            }
        }

        localStorage.setItem("azota_mistake_notebook", JSON.stringify(notebook));

        // Update button UI in-place
        const btn = (event && event.currentTarget) ? event.currentTarget : document.getElementById(`btn-remember-${qId}`);
        if (btn) {
            if (isSavedNow) {
                btn.className = "px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm";
                btn.innerHTML = `<span>⭐</span> <span>Đã Lưu Vào Ghi Nhớ</span>`;
            } else {
                btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 cursor-pointer flex items-center gap-1.5 transition-all";
                btn.innerHTML = `<span>📌</span> <span>Thêm Vào Câu Cần Ghi Nhớ</span>`;
            }
        }

        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        } else if (window.AudioHelper) {
            window.AudioHelper.playClick();
        }

        renderDashboardStats();
    }

    function showResultView(result) {
        currentResultData = result;
        showView("result");
        updateActiveAppName("Báo Cáo Điểm Số");

        const scoreEl = document.getElementById("resultScoreBig");
        const rankEl = document.getElementById("resultRankBadge");
        const titleEl = document.getElementById("resultExamTitle");
        const correctEl = document.getElementById("resultCorrectCount");
        const incorrectEl = document.getElementById("resultIncorrectCount");
        const timeEl = document.getElementById("resultTimeSpent");
        const dateEl = document.getElementById("resultCompletedDate");

        if (scoreEl) scoreEl.textContent = result.score.toFixed(1);
        if (titleEl) titleEl.textContent = result.examTitle;
        if (correctEl) correctEl.textContent = `${result.correctCount}/${result.totalQuestions}`;
        if (incorrectEl) incorrectEl.textContent = `${result.incorrectCount}/${result.totalQuestions}`;
        if (timeEl) {
            const m = Math.floor(result.timeSpentSeconds / 60);
            const s = result.timeSpentSeconds % 60;
            timeEl.textContent = `${m} phút ${s} giây`;
        }
        if (dateEl) {
            const d = new Date(result.timestamp || result.date || Date.now());
            dateEl.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
        }

        if (rankEl) {
            if (result.score >= 9.0) {
                rankEl.className = "inline-flex px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3";
                rankEl.textContent = "Xuất sắc! Đạt chuẩn học sinh giỏi 🌟";
            } else if (result.score >= 8.0) {
                rankEl.className = "inline-flex px-4 py-1.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/40 mb-3";
                rankEl.textContent = "Giỏi! Nắm rất chắc kiến thức trọng tâm 🎉";
            } else if (result.score >= 6.5) {
                rankEl.className = "inline-flex px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-3";
                rankEl.textContent = "Khá! Cần ôn luyện thêm các câu hỏi phân hóa 👍";
            } else {
                rankEl.className = "inline-flex px-4 py-1.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 mb-3";
                rankEl.textContent = "Cần cố gắng! Hãy xem lại câu sai và bấm lưu vào Câu Cần Ghi Nhớ 📖";
            }
        }

        const wrongTotal = (result.incorrectCount || 0) + (result.skippedCount || 0);
        const defaultFilter = (wrongTotal > 0) ? 'incorrect' : 'all';
        renderResultQuestionsReview(defaultFilter);
    }

    function showWrongQuestionsReview() {
        renderResultQuestionsReview('incorrect');
        const section = document.getElementById("resultReviewSection");
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (window.AudioHelper && window.AudioHelper.playPlip) {
            window.AudioHelper.playPlip();
        }
    }

    function renderResultQuestionsReview(filter = 'all') {
        if (!currentResultData) return;
        currentResultReviewFilter = filter;
        const container = document.getElementById("resultReviewList") || document.getElementById("resultReviewContainer");
        if (!container) return;

        // Update filter tabs
        const allBtn = document.getElementById("reviewFilterAllBtn");
        const wrongBtn = document.getElementById("reviewFilterWrongBtn");
        const correctBtn = document.getElementById("reviewFilterCorrectBtn");

        if (allBtn) {
            allBtn.className = (filter === 'all')
                ? "px-3.5 py-1.5 rounded-xl text-xs font-black bg-sky-500 text-white shadow-sm cursor-pointer transition-all"
                : "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white border border-white/5 cursor-pointer transition-all";
        }
        if (wrongBtn) {
            wrongBtn.className = (filter === 'incorrect')
                ? "px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-sm cursor-pointer transition-all"
                : "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 cursor-pointer transition-all";
        }
        if (correctBtn) {
            correctBtn.className = (filter === 'correct')
                ? "px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-sm cursor-pointer transition-all"
                : "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 cursor-pointer transition-all";
        }

        container.innerHTML = "";
        const allQuestions = currentResultData.examQuestions || currentResultData.questions || [];
        const userAnsMap = currentResultData.userAnswers || {};

        let filteredQs = allQuestions.filter(q => {
            const userAns = userAnsMap[q.id];
            const isCorrect = (q.type === 'mcq') ? (userAns === q.correct) : false;
            if (filter === 'correct') return isCorrect;
            if (filter === 'incorrect') return !isCorrect;
            return true;
        });

        if (filteredQs.length === 0) {
            container.innerHTML = `
                <div class="py-12 text-center text-slate-400">
                    <div class="text-4xl mb-2">${filter === 'incorrect' ? '🎉' : '🔍'}</div>
                    <p class="font-bold text-slate-300">${filter === 'incorrect' ? 'Tuyệt vời! Bạn không làm sai câu nào trong bài thi này!' : 'Không có câu hỏi nào phù hợp với bộ lọc.'}</p>
                </div>
            `;
            return;
        }

        filteredQs.forEach((q) => {
            const userAns = userAnsMap[q.id];
            const isCorrect = (userAns === q.correct);
            const isUnanswered = !userAns;
            const isSaved = isQuestionInNotebook(q.id);

            const card = document.createElement("div");
            card.className = `p-4 sm:p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/30' : (isUnanswered ? 'bg-slate-500/5 border-slate-500/30' : 'bg-rose-500/5 border-rose-500/30')} space-y-3`;

            let ansStatusBadge = "";
            if (isCorrect) {
                ansStatusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">✓ Chính xác</span>`;
            } else if (isUnanswered) {
                ansStatusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Chưa trả lời</span>`;
            } else {
                ansStatusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">✕ Làm sai (Bạn chọn ${userAns})</span>`;
            }

            let optsHTML = "";
            if (q.type === 'mcq' && q.options) {
                const letters = ["A", "B", "C", "D"];
                optsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-3">
                        ${q.options.map((opt, i) => {
                            const isKey = (q.correct === letters[i]);
                            const isUser = (userAns === letters[i]);
                            let optClass = "p-3 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ";
                            if (isKey) {
                                optClass += "bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 font-bold";
                            } else if (isUser) {
                                optClass += "bg-rose-500/15 border-rose-500/50 text-rose-950 dark:text-rose-100 font-bold";
                            } else {
                                optClass += "bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-70";
                            }
                            return `
                                <div class="${optClass} min-w-0">
                                    <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isKey ? 'bg-emerald-600 text-white' : (isUser ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')}">${letters[i]}</span>
                                    <span class="flex-1 min-w-0 break-words leading-relaxed">${opt}</span>
                                    ${isKey ? '<span class="ml-auto text-emerald-400 font-bold text-xs shrink-0 whitespace-nowrap">✓ Đáp án đúng</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-sky-400 text-sm">Câu ${q.id}</span>
                        ${ansStatusBadge}
                    </div>
                    <button type="button" 
                            id="btn-remember-${q.id}"
                            onclick="AzotaApp.toggleRememberQuestion('${q.id}', event)" 
                            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isSaved ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'}">
                        <span>${isSaved ? '⭐' : '📌'}</span>
                        <span>${isSaved ? 'Đã Lưu Vào Ghi Nhớ' : 'Thêm Vào Câu Cần Ghi Nhớ'}</span>
                    </button>
                </div>
                <div class="text-slate-900 dark:text-white font-bold">${q.question}</div>
                ${optsHTML}
                <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-950 dark:text-sky-200 text-xs sm:text-sm mt-3">
                    <div class="font-bold text-sky-400 mb-1">💡 Lời giải chi tiết:</div>
                    <div>${q.explain || 'Kiến thức trọng tâm bài học chuẩn SGK.'}</div>
                </div>
            `;
            container.appendChild(card);
        });

        if (window.renderMathInElement) {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    function retryCurrentExam() {
        if (!currentResultData) return;
        startExam(currentResultData.examId, currentResultData.mode);
    }

    // ==========================================
    // QUESTION BANK SEARCH
    // ==========================================
    function renderQuestionBank() {
        const container = document.getElementById("bankQuestionsList");
        const totalBadge = document.getElementById("bankTotalBadge");
        const kwInput = document.getElementById("bankSearchInput");
        const subSelect = document.getElementById("bankSubjectSelect");
        if (!container) return;

        const kw = (kwInput ? kwInput.value : "").trim().toLowerCase();
        const selectedSub = subSelect ? subSelect.value : "all";

        let pool = [];
        allExams.forEach(exam => {
            if (exam.questions) {
                exam.questions.forEach(q => {
                    pool.push({
                        ...q,
                        originSubject: exam.subject,
                        originExam: exam.title
                    });
                });
            }
        });

        const filtered = pool.filter(q => {
            const matchSub = (selectedSub === "all" || q.originSubject === selectedSub);
            const matchKw = !kw || 
                q.question.toLowerCase().includes(kw) ||
                (q.explain && q.explain.toLowerCase().includes(kw)) ||
                (q.options && q.options.some(opt => typeof opt === 'string' && opt.toLowerCase().includes(kw)));
            return matchSub && matchKw;
        });

        if (totalBadge) totalBadge.textContent = `${filtered.length} câu hỏi`;

        container.innerHTML = "";
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="py-16 text-center text-slate-400">
                    <div class="text-4xl mb-2">🔍</div>
                    <p class="font-bold">Không tìm thấy câu hỏi phù hợp với từ khóa "${kw}"</p>
                </div>
            `;
            return;
        }

        const toShow = filtered.slice(0, 100);

        toShow.forEach((q, idx) => {
            const card = document.createElement("div");
            card.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 space-y-3";

            let optsHTML = "";
            if (q.type === "mcq" && q.options) {
                const letters = ["A", "B", "C", "D"];
                optsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                        ${q.options.map((opt, i) => `
                            <div class="p-2.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${q.correct === letters[i] ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}">
                                <span class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${q.correct === letters[i] ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">${letters[i]}</span>
                                <span>${opt}</span>
                                ${q.correct === letters[i] ? '<span class="ml-auto text-emerald-500 text-xs font-bold">✓ Đáp án</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="flex items-center justify-between text-xs text-slate-400">
                    <span class="font-bold text-sky-500">${q.originSubject} • ${q.originExam}</span>
                    <span>ID: ${q.id}</span>
                </div>
                <div class="text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">${q.question}</div>
                ${optsHTML}
                <div class="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-900 dark:text-sky-200 text-xs">
                    <span class="font-bold text-sky-500">💡 Đáp án đúng: ${q.correct}.</span> ${q.explain || 'Kiến thức bài học.'}
                </div>
            `;
            container.appendChild(card);
        });

        if (window.renderMathInElement) {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    // ==========================================
    // CÂU CẦN GHI NHỚ (MEMORY NOTEBOOK)
    // ==========================================
    function renderMistakeNotebook() {
        const container = document.getElementById("notebookList");
        const countBadge = document.getElementById("notebookTotalBadge") || document.getElementById("notebookCountBadge");
        if (!container) return;

        let notebook = [];
        try {
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {}

        if (countBadge) countBadge.textContent = `${notebook.length} câu đã lưu`;
        container.innerHTML = "";

        if (notebook.length === 0) {
            container.innerHTML = `
                <div class="py-16 text-center text-slate-400">
                    <div class="text-5xl mb-3">📖</div>
                    <p class="font-bold text-lg text-slate-700 dark:text-slate-300">Danh sách câu cần ghi nhớ đang trống!</p>
                    <p class="text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed text-slate-500">Khi bạn làm bài thi hoặc xem lại kết quả bài làm, hãy bấm nút <strong class="text-amber-400 font-bold">"📌 Thêm Vào Câu Cần Ghi Nhớ"</strong> ở những câu bạn muốn ôn tập riêng để lưu vào đây.</p>
                </div>
            `;
            return;
        }

        notebook.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 space-y-3";

            let optsHTML = "";
            if (item.options && item.options.length === 4) {
                const letters = ["A", "B", "C", "D"];
                optsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                        ${item.options.map((opt, i) => `
                            <div class="p-2.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${item.correct === letters[i] ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 font-bold' : (item.userAnswer === letters[i] ? 'bg-rose-500/15 border-rose-500/50 text-rose-950 dark:text-rose-100 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500')}">
                                <span class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${item.correct === letters[i] ? 'bg-emerald-600 text-white' : (item.userAnswer === letters[i] ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')}">${letters[i]}</span>
                                <span>${opt}</span>
                                ${item.correct === letters[i] ? '<span class="ml-auto text-emerald-500 text-xs font-bold">✓ Đáp án đúng</span>' : (item.userAnswer === letters[i] ? '<span class="ml-auto text-rose-500 text-xs font-bold">✕ Bạn chọn</span>' : '')}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="flex items-center justify-between text-xs text-slate-400">
                    <span class="font-bold text-amber-500">${item.subject || 'Đề thi'} • ${item.examTitle || ''}</span>
                    <button type="button" onclick="AzotaApp.removeMistake(${index})" class="text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors flex items-center gap-1">
                        <span>✕</span> Bỏ ghi nhớ
                    </button>
                </div>
                <div class="text-slate-900 dark:text-white font-black text-sm sm:text-base">${item.question}</div>
                ${optsHTML}
                <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs">
                    <span class="font-bold text-amber-500">💡 Giải thích chi tiết:</span> ${item.explain || 'Kiến thức trọng tâm bài học.'}
                </div>
            `;
            container.appendChild(card);
        });

        if (window.renderMathInElement) {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    function removeMistake(index) {
        let notebook = [];
        try {
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {}

        notebook.splice(index, 1);
        localStorage.setItem("azota_mistake_notebook", JSON.stringify(notebook));
        renderMistakeNotebook();
        renderDashboardStats();
    }

    function practiceMistakesNow() {
        let notebook = [];
        try {
            notebook = JSON.parse(localStorage.getItem("azota_mistake_notebook") || "[]");
        } catch (e) {}

        if (notebook.length === 0) {
            AzotaModal.alert("Danh sách câu cần ghi nhớ hiện đang trống! Hãy bấm 'Thêm Vào Câu Cần Ghi Nhớ' khi xem lại bài thi.", "Sổ Tay Ghi Nhớ", "📖");
            return;
        }

        const customExam = {
            id: `mistakes-practice-${Date.now()}`,
            title: `Luyện Tập Lại ${notebook.length} Câu Cần Ghi Nhớ`,
            subject: "Ghi Nhớ",
            grade: "11",
            duration: Math.round(notebook.length * 1.5),
            description: "Bài luyện tập đặc biệt giúp bạn ôn luyện sâu các câu hỏi đã lưu vào danh sách ghi nhớ.",
            author: "Aseta Memory Trainer",
            questions: notebook
        };

        window.ExamEngine.startExam(customExam, "practice", { layout: "single", shuffleQuestions: false });
        showView("exam");
        updateActiveAppName("Luyện Tập Câu Ghi Nhớ");
    }

    // ==========================================
    // SMART TEXT PARSER
    // ==========================================
    let lastParsedExam = null;

    function parseAndPreviewText() {
        const textInput = document.getElementById("creatorRawText");
        const titleInput = document.getElementById("creatorTitleInput");
        const subjectInput = document.getElementById("creatorSubjectSelect");
        const gradeInput = document.getElementById("creatorGradeSelect");
        const durationInput = document.getElementById("creatorDurationInput");
        const previewEl = document.getElementById("creatorParsedPreview");
        const badgeEl = document.getElementById("creatorParsedBadge");
        const saveBtn = document.getElementById("creatorSaveBtn");

        if (!textInput || !textInput.value.trim()) {
            AzotaModal.alert("Vui lòng dán nội dung đề thi vào ô văn bản!", "Chưa Có Nội Dung", "📋");
            return;
        }

        const parsed = window.SmartParser.parseAzotaText(textInput.value);

        if (parsed.questions.length === 0) {
            AzotaModal.alert("Không tìm thấy câu hỏi hợp lệ! Hãy chắc chắn văn bản có dạng 'Câu 1: ...', các đáp án 'A. ...', 'B. ...' và 'Đáp án: C'.", "Lỗi Cú Pháp Đề Thi", "⚠️");
            return;
        }

        lastParsedExam = {
            id: `custom-${Date.now()}`,
            title: (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : (parsed.title || "Đề Thi Tự Tạo Mới"),
            subject: subjectInput ? subjectInput.value : "Tin Học",
            grade: gradeInput ? gradeInput.value : "11",
            duration: durationInput ? parseInt(durationInput.value, 10) || 15 : 15,
            description: `Đề thi trích xuất thông minh từ văn bản với ${parsed.questions.length} câu hỏi.`,
            author: "Người dùng Aseta",
            questions: parsed.questions
        };

        if (badgeEl) badgeEl.textContent = `${parsed.questions.length} câu hỏi hợp lệ`;
        if (saveBtn) saveBtn.classList.remove("hidden");

        if (previewEl) {
            previewEl.classList.remove("hidden");
            previewEl.innerHTML = `
                <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 mb-4 text-xs font-bold flex items-center justify-between">
                    <span>✓ Trích xuất thành công ${parsed.questions.length} câu hỏi!</span>
                    <span>Thời gian làm bài: ${lastParsedExam.duration} phút</span>
                </div>
                <div class="space-y-3">
                    ${parsed.questions.slice(0, 10).map((q, i) => `
                        <div class="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                            <div class="font-extrabold text-sky-500 mb-1">Câu ${i+1}: ${q.question}</div>
                            <div class="grid grid-cols-2 gap-1.5 my-2 text-slate-600 dark:text-slate-300">
                                <div>A. ${q.options[0]}</div>
                                <div>B. ${q.options[1]}</div>
                                <div>C. ${q.options[2]}</div>
                                <div>D. ${q.options[3]}</div>
                            </div>
                            <div class="text-emerald-500 font-bold">Đáp án: ${q.correct} | Lời giải: ${q.explain || 'Kiến thức bài học'}</div>
                        </div>
                    `).join('')}
                    ${parsed.questions.length > 10 ? `<div class="text-center text-xs text-slate-400 font-bold">... và ${parsed.questions.length - 10} câu hỏi khác</div>` : ''}
                </div>
            `;
        }
    }

    function saveCustomExam() {
        if (!lastParsedExam) return;

        let custom = [];
        try {
            custom = JSON.parse(localStorage.getItem("azota_custom_exams") || "[]");
        } catch (e) {}

        custom.unshift(lastParsedExam);
        localStorage.setItem("azota_custom_exams", JSON.stringify(custom));

        loadExams();
        AzotaModal.alert(`Đã lưu thành công đề thi "${lastParsedExam.title}"! Bạn có thể bắt đầu làm bài ngay.`, "Tạo Đề Thành Công", "🎉");
        
        openFileExplorer('root');
    }

    function exportExamAsJSON() {
        if (!lastParsedExam) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastParsedExam, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${lastParsedExam.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // ==========================================
    // EXAM HISTORY
    // ==========================================
    function renderExamHistory() {
        const listEl = document.getElementById("historyList");
        if (!listEl) return;

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
        } catch (e) {}

        listEl.innerHTML = "";

        if (history.length === 0) {
            listEl.innerHTML = `
                <div class="py-16 text-center text-slate-400">
                    <div class="text-5xl mb-3">📜</div>
                    <p class="font-bold text-lg text-slate-700 dark:text-slate-300">Chưa có lịch sử làm bài</p>
                    <p class="text-xs sm:text-sm mt-1">Lịch sử và điểm số sẽ được ghi lại tự động mỗi khi bạn nộp bài thi.</p>
                </div>
            `;
            return;
        }

        history.forEach((h, idx) => {
            const card = document.createElement("div");
            card.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4";

            const dateStr = new Date(h.timestamp).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            let scoreColor = "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
            if (h.score < 5.0) scoreColor = "text-rose-500 border-rose-500/30 bg-rose-500/10";
            else if (h.score < 8.0) scoreColor = "text-sky-500 border-sky-500/30 bg-sky-500/10";

            card.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-black shrink-0 ${scoreColor}">
                        <span class="text-lg leading-none">${h.score.toFixed(1)}</span>
                        <span class="text-[10px] uppercase">Điểm</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 rounded-full text-xs font-bold ${getSubjectBadge(h.subject)}">${h.subject}</span>
                            <span class="text-xs text-slate-400">• ${dateStr}</span>
                        </div>
                        <h4 class="font-bold text-slate-900 dark:text-white text-base">${h.examTitle}</h4>
                        <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                            <span>✓ Đúng: ${h.correctCount}/${h.totalQuestions} câu</span>
                            <span>⏱️ ${Math.floor(h.timeSpentSeconds / 60)}p ${h.timeSpentSeconds % 60}s</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center">
                    <button type="button" onclick="AzotaApp.viewHistoryAttempt(${idx})" class="px-3.5 py-2 rounded-xl text-xs font-bold glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                        Xem chi tiết
                    </button>
                    <button type="button" onclick="AzotaApp.startExam('${h.examId}', 'exam')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer">
                        Làm lại
                    </button>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    function viewHistoryAttempt(index) {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
        } catch (e) {}
        const item = history[index];
        if (item) showResultView(item);
    }

    function clearAllHistory() {
        AzotaModal.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử làm bài khảo thí?", () => {
            localStorage.removeItem("azota_exam_history");
            renderExamHistory();
            renderDashboardStats();
        }, null, "Xác Nhận Xóa Lịch Sử", "🗑️");
    }

    
    // ========================================================
    // UNIT 4 VOCABULARY ENGINE (40 TỪ VỰNG CỐT LÕI ĐẦU TIÊN)
    // ========================================================
    const UNIT_4_VOCAB_DATA = [
        { stt: 1, word: "Volunteer\nVolunteering\nCompulsory", type: "n, v\nv\nadj", meaning: "tình nguyện viên; làm tình nguyện\nbắt buộc", note: "" },
        { stt: 2, word: "take part in", type: "v.phr", meaning: "tham gia vào (= participate in)", note: "" },
        { stt: 3, word: "Development\ndevelop\ndevelopmental", type: "N\nv\nadj", meaning: "sự phát triển\nThuộc về sự phát triển", note: "" },
        { stt: 4, word: "goals", type: "n", meaning: "các mục tiêu", note: "" },
        { stt: 5, word: "qualified (for)\nqualify\nqualification", type: "Adj\nv\nn", meaning: "đủ tiêu chuẩn, đủ điều kiện/trình độ (cho)\nbằng cấp", note: "" },
        { stt: 6, word: "suggest + V-ing", type: "v.phr", meaning: "đề xuất / gợi ý làm gì", note: "" },
        { stt: 7, word: "thank sb for V-ing", type: "v.phr", meaning: "cảm ơn ai vì đã làm gì", note: "" },
        { stt: 8, word: "community", type: "n", meaning: "cộng đồng", note: "" },
        { stt: 9, word: "keen on\nkeeness", type: "phr.v\nn", meaning: "thích thú, hào hứng với (= fond of / interested in / excited about)", note: "" },
        { stt: 10, word: "depend on", type: "phr.v", meaning: "phụ thuộc vào", note: "" },
        { stt: 11, word: "leadership skills", type: "n.phr", meaning: "các kỹ năng lãnh đạo", note: "" },
        { stt: 12, word: "Contribution\nmake contribution\ncontributor\ncontribute to", type: "N\nv.phr\nn\nv", meaning: "sự đóng góp, cống hiến\nngười đóng góp, cống hiến", note: "" },
        { stt: 13, word: "cultural exchange", type: "n.phr", meaning: "sự giao lưu / trao đổi văn hóa", note: "" },
        { stt: 14, word: "current issues", type: "n.phr", meaning: "các vấn đề hiện tại / vấn đề thời sự", note: "" },
        { stt: 15, word: "climate change", type: "n.phr", meaning: "biến đổi khí hậu", note: "" },
        { stt: 16, word: "convenient", type: "adj", meaning: "thuận tiện, tiện lợi", note: "" },
        { stt: 17, word: "Ability\ninability\ndisability", type: "N\nn\nn", meaning: "khả năng, năng lực\nkhông có khả năng, bất lực\nsự khuyết tật, tàn tật", note: "" },
        { stt: 18, word: "managed to (+ V-inf)", type: "v.phr", meaning: "đã xoay xở / thành công làm được việc gì khó khăn", note: "" },
        { stt: 19, word: "reach", type: "v", meaning: "đạt tới, chạm đến, tiếp cận", note: "" },
        { stt: 20, word: "aim", type: "n, v", meaning: "mục đích, mục tiêu; hướng tới", note: "" },
        { stt: 21, word: "Various = diverse", type: "adj", meaning: "đa dạng, nhiều loại khác nhau", note: "" },
        { stt: 22, word: "Variety = diversity\na variety of N", type: "n", meaning: "sự đa dạng", note: "" },
        { stt: 23, word: "Participant\nparticipation", type: "N\nn", meaning: "người tham gia\nsự tham gia, góp mặt, tham dự", note: "" },
        { stt: 24, word: "take place", type: "v.phr", meaning: "diễn ra (= occur / happen)", note: "" },
        { stt: 25, word: "live-streamed", type: "adj/v", meaning: "được phát sóng trực tiếp (qua mạng)", note: "" },
        { stt: 26, word: "raise awareness", type: "v.phr", meaning: "nâng cao nhận thức", note: "" },
        { stt: 27, word: "promote", type: "v", meaning: "thúc đẩy, xúc tiến, quảng bá", note: "" },
        { stt: 28, word: "strengthen", type: "v", meaning: "tăng cường, củng cố", note: "" },
        { stt: 29, word: "Relation (ngoại giao, họ hàng)\nrelationship (yêu đương, bạn bè, gia đình)", type: "N\nn", meaning: "mối quan hệ", note: "" },
        { stt: 30, word: "represent", type: "v", meaning: "đại diện cho", note: "" },
        { stt: 31, word: "representative", type: "n (adj)", meaning: "người đại diện, đại biểu (adj: tiêu biểu)", note: "Lưu ý từ loại: n = người đại diện" },
        { stt: 32, word: "eye-opening", type: "adj", meaning: "mở mang tầm mắt, khai sáng", note: "" },
        { stt: 33, word: "opportunity", type: "n", meaning: "cơ hội (= chance)", note: "" },
        { stt: 34, word: "Equality\ngender equality", type: "N\nn.phr", meaning: "sự bình đẳng\nbình đẳng giới", note: "" },
        { stt: 35, word: "have community work experience", type: "v.phr", meaning: "có kinh nghiệm làm việc cộng đồng", note: "" },
        { stt: 36, word: "be confident speakers", type: "v.phr", meaning: "là những người nói tự tin", note: "" },
        { stt: 37, word: "have teamwork skills", type: "v.phr", meaning: "có kỹ năng làm việc nhóm", note: "" },
        { stt: 38, word: "practical skills", type: "n.phr", meaning: "kỹ năng thực hành, kỹ năng thực tế", note: "" },
        { stt: 39, word: "understand different cultures", type: "v.phr", meaning: "thấu hiểu các nền văn hóa khác nhau", note: "" },
        { stt: 40, word: "offer solution", type: "v.phr", meaning: "đưa ra giải pháp", note: "" }
    ];

    function speakVocabWord(word) {
        if (!window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const clean = word.split('\n')[0].replace(/[=()]/g, '').trim();
            const utter = new SpeechSynthesisUtterance(clean);
            utter.lang = 'en-US';
            utter.rate = 0.9;
            window.speechSynthesis.speak(utter);
        } catch (e) {
            console.error(e);
        }
    }

    function openUnit4VocabCheatSheet(initialTab = 'flashcards') {
        if (window.VocabHub && window.VocabHub.open) {
            window.VocabHub.open(initialTab);
            return;
        }
        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        
        let existingModal = document.getElementById("unit4VocabModal");
        if (existingModal) existingModal.remove();

        const modal = document.createElement("div");
        modal.id = "unit4VocabModal";
        modal.className = "fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn";

        function renderRows(keyword = "") {
            const kw = keyword.toLowerCase().trim();
            const filtered = UNIT_4_VOCAB_DATA.filter(item => {
                if (!kw) return true;
                return item.word.toLowerCase().includes(kw) ||
                       item.type.toLowerCase().includes(kw) ||
                       item.meaning.toLowerCase().includes(kw) ||
                       (item.note && item.note.toLowerCase().includes(kw));
            });

            if (filtered.length === 0) {
                return `
                    <tr>
                        <td colspan="5" class="py-8 text-center text-xs text-slate-400">
                            🔍 Không tìm thấy từ vựng nào khớp với "${keyword}"
                        </td>
                    </tr>
                `;
            }

            return filtered.map(item => {
                const wordHtml = item.word.split('\n').map(w => `<span class="block font-bold text-sky-400 dark:text-sky-300">${w}</span>`).join('');
                const typeHtml = item.type.split('\n').map(t => `<span class="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 mr-1 mb-1">${t}</span>`).join('');
                const meaningHtml = item.meaning.split('\n').map(m => `<span class="block text-slate-700 dark:text-slate-200">${m}</span>`).join('');
                const firstWord = item.word.split('\n')[0].replace(/['"]/g, "\\'");

                return `
                    <tr class="border-b border-slate-200/50 dark:border-white/5 hover:bg-sky-500/5 transition-colors">
                        <td class="py-2.5 px-3 text-center text-xs font-black text-slate-400 w-12">
                            ${item.stt}
                        </td>
                        <td class="py-2.5 px-3 text-xs">
                            <div class="flex items-center gap-1.5">
                                <div>${wordHtml}</div>
                                <button type="button" 
                                        onclick="window.AzotaApp.speakVocabWord('${firstWord}')" 
                                        class="w-6 h-6 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 flex items-center justify-center text-xs transition-all cursor-pointer active:scale-95 shrink-0" 
                                        title="Phát âm từ vựng">
                                    🔊
                                </button>
                            </div>
                        </td>
                        <td class="py-2.5 px-3 text-xs w-24">
                            ${typeHtml}
                        </td>
                        <td class="py-2.5 px-3 text-xs leading-relaxed">
                            ${meaningHtml}
                        </td>
                        <td class="py-2.5 px-3 text-[11px] text-amber-500 dark:text-amber-300 italic w-32">
                            ${item.note || '-'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        modal.innerHTML = `
            <div class="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
                <!-- Header -->
                <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-purple-600/15 flex items-center justify-between gap-3 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                            <svg class="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/25" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                    Trọn Bộ 67 Từ Vựng Unit 4: ASEAN and Vietnam
                                </h3>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">Trọn Bộ 67 Từ</span>
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">
                                Tiếng Anh 11 Global Success • Trường THPT Trần Văn Giàu
                            </div>
                        </div>
                    </div>
                    <button type="button" 
                            id="closeUnit4VocabModalBtn"
                            class="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-all active:scale-95">
                        ✕
                    </button>
                </div>

                <!-- Search bar & Tools -->
                <div class="p-3 sm:px-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                    <div class="relative flex-1">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                        <input type="text" 
                               id="unit4VocabSearchInput" 
                               placeholder="Tìm nhanh từ vựng, từ loại (v.phr, adj, n) hoặc nghĩa tiếng Việt..." 
                               class="w-full pl-8 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" 
                                onclick="document.getElementById('unit4VocabModal').remove(); window.AzotaApp.startExam('ta-unit4-vocab-40', 'practice')" 
                                class="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                            <span>⚡</span>
                            <span>Luyện 40 Câu Trắc Nghiệm</span>
                        </button>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="flex-1 overflow-y-auto p-3 sm:p-5">
                    <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                                    <th class="py-2.5 px-3 text-center w-12">STT</th>
                                    <th class="py-2.5 px-3">Từ vựng / Cụm từ</th>
                                    <th class="py-2.5 px-3 w-24">Từ loại</th>
                                    <th class="py-2.5 px-3">Nghĩa tiếng Việt</th>
                                    <th class="py-2.5 px-3 w-32">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody id="unit4VocabTableBody">
                                ${renderRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-3 sm:px-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
                    <div>
                        <span>Hiển thị đầy đủ đúng <strong>toàn bộ 67 từ vựng</strong> trong tài liệu đề cương.</span>
                    </div>
                    <button type="button" 
                            onclick="document.getElementById('unit4VocabModal').remove()" 
                            class="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer">
                        Đóng
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector("#closeUnit4VocabModalBtn");
        if (closeBtn) closeBtn.onclick = () => modal.remove();

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        const searchInput = modal.querySelector("#unit4VocabSearchInput");
        const tableBody = modal.querySelector("#unit4VocabTableBody");
        if (searchInput && tableBody) {
            searchInput.focus();
            searchInput.oninput = () => {
                tableBody.innerHTML = renderRows(searchInput.value);
            };
        }

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                window.removeEventListener('keydown', handleKey);
            }
        };
        window.addEventListener('keydown', handleKey);
    }

    return {
        init: init,
        showView: showView,
        goBack: goBack,
        getDashboardData: getDashboardData,
        openDashboard: () => showView("dashboard"),
        openUtilities: () => showView("utilities"),
        openExamSchedule: () => showView("examSchedule"),
        openGradeCalculator: () => showView("gradeCalc"),
        openFileExplorer: openFileExplorer,
        openEssayStudy: openEssayStudy,
        openUnit4VocabCheatSheet: openUnit4VocabCheatSheet,
        openVocabHub: function(tab) { if (window.VocabHub) window.VocabHub.open(tab || 'flashcards'); else openUnit4VocabCheatSheet(); },
        openFlashcards: function() { if (window.VocabHub) window.VocabHub.openFlashcards(); else openUnit4VocabCheatSheet(); },
        speakVocabWord: speakVocabWord,
        goBackExplorer: goBackExplorer,
        handleExplorerSearch: handleExplorerSearch,
        expandSearch: expandSearch,
        collapseSearch: collapseSearch,
        setExplorerLayout: setExplorerLayout,
        renderFileExplorer: renderFileExplorer,
        toggleSidebarMainFolders: toggleSidebarMainFolders,
        toggleSubjectTree: toggleSubjectTree,
        openLeaderboard: openLeaderboard,
        openTimetable: openTimetable,
        openSchoolNews: (tab) => window.SchoolNewsEngine ? window.SchoolNewsEngine.openModal(tab) : null,
        open11A7Journal: (idx) => window.Class11A7JournalEngine ? window.Class11A7JournalEngine.openModal(idx) : null,
        refreshLeaderboard: refreshLeaderboard,
        setLeaderboardScope: setLeaderboardScope,
        setLeaderboardSort: setLeaderboardSort,
        handleLeaderboardSearch: handleLeaderboardSearch,
        setExplorerCategoryFilter: setExplorerCategoryFilter,
        handleExplorerSort: handleExplorerSort,
        openUserProfileModal: () => UserProfile.openModal(),
        handleProfileClick: () => UserProfile.handleProfileClick(),
        closeUserProfileModal: () => UserProfile.closeModal(),
        saveUserProfileFromModal: () => UserProfile.saveFromModal(),
        selectAvatarOption: (av) => UserProfile.selectAvatar(av),
        switchAccountTab: (t) => AccountManager.switchTab(t),
        switchUserAccount: (id) => AccountManager.switchAccount(id),
        deleteUserAccount: (id) => AccountManager.deleteAccount(id),
        createNewFriendAccount: () => createNewFriendAccount(),
        selectNewAccAvatar: (av) => selectNewAccAvatar(av),
        toggleSidebar: toggleSidebar,
        toggleSidebarExpand: toggleSidebarExpand,
        updateSidebarActive: updateSidebarActive,
        toggleTheme: toggleTheme,
        toggleFullscreen: toggleFullscreen,
        toggleShuffleQuestions: toggleShuffleQuestions,
        toggleShuffleOptions: toggleShuffleOptions,
        updateShuffleUI: updateShuffleUI,
        setExamViewMode: setExamViewMode,
        handleGlassFolderClick: handleGlassFolderClick,
        setSubjectFilter: setSubjectFilter,
        setGradeFilter: setGradeFilter,
        startExam: startExam,
        launchFullTinHoc: launchFullTinHoc,
        startRandomMockQuiz: startRandomMockQuiz,
        showResultView: showResultView,
        showWrongQuestionsReview: showWrongQuestionsReview,
        toggleRememberQuestion: toggleRememberQuestion,
        isQuestionInNotebook: isQuestionInNotebook,
        retryCurrentExam: retryCurrentExam,
        renderResultQuestionsReview: renderResultQuestionsReview,
        renderQuestionBank: renderQuestionBank,
        renderMistakeNotebook: renderMistakeNotebook,
        removeMistake: removeMistake,
        practiceMistakesNow: practiceMistakesNow,
        parseAndPreviewText: parseAndPreviewText,
        saveCustomExam: saveCustomExam,
        exportExamAsJSON: exportExamAsJSON,
        resumeExam: resumeExam,
        discardInProgressExam: discardInProgressExam,
        viewHistoryAttempt: viewHistoryAttempt,
        clearAllHistory: clearAllHistory,
        AuthGate: AuthGate
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    window.AzotaApp.init();
    window.AsetaApp = window.AzotaApp;
    window.AsetaModal = window.AzotaModal;
});
