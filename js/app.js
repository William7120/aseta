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
    // ACCOUNT MANAGER & MULTI-USER SYSTEM FOR FRIENDS
    // ========================================================
    const AccountManager = {
        STORAGE_KEY: "azota_user_accounts",
        CURRENT_KEY: "azota_current_account_id",

        getDefaultAccounts: function() {
            return [
                {
                    id: "acc_vanthua",
                    name: "Văn Thừa (Admin)",
                    nickname: "VanThua",
                    grade: "Quản Trị Hệ Thống",
                    role: "👑 Quản Trị Viên (Admin)",
                    pin: "712010",
                    avatar: "👑",
                    goal: "Toàn quyền quản trị hệ thống Aseta",
                    isAdmin: true,
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                },
                {
                    id: "acc_admin",
                    name: "Học Sinh Aseta (VIP)",
                    nickname: "hocsinh11",
                    grade: "Lớp 11",
                    role: "👑 Quản Trị Viên",
                    pin: "1111",
                    avatar: "👑",
                    goal: "9.0+ Học Kỳ 1",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "acc_ban_a",
                    name: "Bạn Học Hoàng",
                    nickname: "hoang11a",
                    grade: "Lớp 11A",
                    role: "🚀 Bạn Thân",
                    pin: "1234",
                    avatar: "🧑‍💻",
                    goal: "Ôn thi Địa Lý & Tin Học",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "acc_ban_b",
                    name: "Bạn Học Lan",
                    nickname: "lan11b",
                    grade: "Lớp 11B",
                    role: "🎓 Học Sinh",
                    pin: "5678",
                    avatar: "👧",
                    goal: "Thủ khoa khối D",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "acc_guest",
                    name: "Khách Ôn Tập",
                    nickname: "guest",
                    grade: "Lớp 11",
                    role: "🌟 Khách Tự Do",
                    pin: "0000",
                    avatar: "🦊",
                    goal: "Trải nghiệm Aseta",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "acc_minhtri",
                    name: "Minh Trí",
                    nickname: "MinhTri",
                    grade: "Lớp 11",
                    role: "🎓 Học Sinh",
                    pin: "123",
                    avatar: "👦",
                    goal: "9.0+ Học Kỳ 1",
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                },
                {
                    id: "acc_tuanminh",
                    name: "Tuấn Minh",
                    nickname: "TuanMinh",
                    grade: "Lớp 11",
                    role: "🎓 Học Sinh",
                    pin: "321",
                    avatar: "🧑‍🎓",
                    goal: "Thủ khoa khối A / D",
                    isDefault: true,
                    createdAt: "2026-01-01T00:00:00.000Z"
                }
            ];
        },

        getAllAccounts: function() {
            let list = null;
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw) {
                    list = JSON.parse(raw);
                }
            } catch (e) {}

            if (!Array.isArray(list) || list.length === 0) {
                list = this.getDefaultAccounts();
            }

            // Always guarantee VanThua Admin Account is present and has PIN 712010
            const vanThuaAcc = {
                id: "acc_vanthua",
                name: "Văn Thừa (Admin)",
                nickname: "VanThua",
                grade: "Quản Trị Hệ Thống",
                role: "👑 Quản Trị Viên (Admin)",
                pin: "712010",
                avatar: "👑",
                goal: "Toàn quyền quản trị hệ thống Aseta",
                isAdmin: true,
                isDefault: true,
                createdAt: "2026-01-01T00:00:00.000Z"
            };

            const idx = list.findIndex(a => a.nickname && a.nickname.toLowerCase() === "vanthua");
            if (idx === -1) {
                list.unshift(vanThuaAcc);
                this.saveAccounts(list);
            } else {
                list[idx].pin = "712010";
                list[idx].role = "👑 Quản Trị Viên (Admin)";
                list[idx].avatar = "👑";
                list[idx].isAdmin = true;
                list[idx].name = "Văn Thừa (Admin)";
                this.saveAccounts(list);
            }

            // Always guarantee MinhTri student account is present with PIN 123
            const mtIdx = list.findIndex(a => a.nickname && a.nickname.toLowerCase() === "minhtri");
            const minhtriAcc = {
                id: "acc_minhtri",
                name: "Minh Trí",
                nickname: "MinhTri",
                grade: "Lớp 11",
                role: "🎓 Học Sinh",
                pin: "123",
                avatar: "👦",
                goal: "9.0+ Học Kỳ 1",
                isDefault: true,
                createdAt: "2026-01-01T00:00:00.000Z"
            };
            if (mtIdx === -1) {
                list.push(minhtriAcc);
                this.saveAccounts(list);
            } else {
                list[mtIdx].pin = "123";
                list[mtIdx].nickname = "MinhTri";
                list[mtIdx].role = "🎓 Học Sinh";
                this.saveAccounts(list);
            }

            // Always guarantee TuanMinh student account is present with PIN 321
            const tmIdx = list.findIndex(a => a.nickname && a.nickname.toLowerCase() === "tuanminh");
            const tuanminhAcc = {
                id: "acc_tuanminh",
                name: "Tuấn Minh",
                nickname: "TuanMinh",
                grade: "Lớp 11",
                role: "🎓 Học Sinh",
                pin: "321",
                avatar: "🧑‍🎓",
                goal: "Thủ khoa khối A / D",
                isDefault: true,
                createdAt: "2026-01-01T00:00:00.000Z"
            };
            if (tmIdx === -1) {
                list.push(tuanminhAcc);
                this.saveAccounts(list);
            } else {
                list[tmIdx].pin = "321";
                list[tmIdx].nickname = "TuanMinh";
                list[tmIdx].role = "🎓 Học Sinh";
                this.saveAccounts(list);
            }

            return list;
        },

        saveAccounts: function(list) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            } catch (e) {}
        },

        getCurrentAccountId: function() {
            try {
                return localStorage.getItem(this.CURRENT_KEY) || "acc_minhtri";
            } catch(e) {
                return "acc_minhtri";
            }
        },

        getCurrentAccount: function() {
            const list = this.getAllAccounts();
            const currId = this.getCurrentAccountId();
            return list.find(a => a.id === currId) || list.find(a => a.id === "acc_minhtri") || list.find(a => !a.isAdmin) || list[0];
        },

        switchAccount: function(accountId) {
            if (!SecurityGuard.checkRateLimit("chuyển tài khoản")) return;
            const list = this.getAllAccounts();
            const target = list.find(a => a.id === accountId);
            if (!target) return;

            localStorage.setItem(this.CURRENT_KEY, target.id);
            // Sync with UserProfile
            UserProfile.save({
                name: target.name,
                nickname: target.nickname,
                grade: target.grade,
                goal: target.goal || "9.0+ Học Kỳ 1",
                avatar: target.avatar || "👦",
                isAdmin: !!target.isAdmin,
                role: target.role
            });

            this.renderAccountsList();
            UserProfile.updateUI();
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
                loggedIn = (ls && ls.getItem(this.SESSION_KEY)) || (ss && ss.getItem(this.SESSION_KEY));
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
                this.handleFailedAttempt(`Không tìm thấy tài khoản "@${username}". Vui lòng kiểm tra lại hoặc bấm chọn từ danh sách bên dưới!`);
                return;
            }

            if (matchedAcc.pin && matchedAcc.pin !== pin) {
                this.handleFailedAttempt(`Mã PIN không chính xác cho tài khoản @${matchedAcc.nickname}! Nhấp "Xem mã mẫu" hoặc chọn lại.`);
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

                if (remember) {
                    if (ls) ls.setItem(this.SESSION_KEY, "true");
                    if (ss) ss.removeItem(this.SESSION_KEY);
                } else {
                    if (ss) ss.setItem(this.SESSION_KEY, "true");
                    if (ls) ls.removeItem(this.SESSION_KEY);
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
            const accounts = AccountManager.getAllAccounts();
            const guestAcc = accounts.find(a => a.id === "acc_guest" || a.nickname === "guest") || accounts[0];
            this.loginSuccess(guestAcc, false);
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
            const accounts = AccountManager.getAllAccounts();

            container.innerHTML = accounts.map(a => `
                <button type="button" 
                        onclick="AuthGate.fillAccount('${a.nickname}', '${a.pin || '1234'}')" 
                        class="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 group">
                    <span>${a.avatar || '👤'}</span>
                    <span class="font-bold text-white">@${a.nickname}</span>
                    <span class="text-[9.5px] text-white/40 font-mono">PIN: ${a.pin || '1234'}</span>
                </button>
            `).join('');
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
            const accounts = AccountManager.getAllAccounts();
            const info = accounts.map(a => `@${a.nickname} (PIN: ${a.pin || '1234'}) - ${a.role || 'Học Sinh'}`).join('\n• ');
            AzotaModal.alert(`Danh sách tài khoản & mã PIN trên hệ thống:\n• ${info}\n\nNhập Tên đăng nhập và Mã PIN ở trên để đăng nhập!`, "Tài Khoản & Mã PIN", "🔑");
        }
    };

    // Make globally accessible for inline HTML onclicks
    window.AuthGate = AuthGate;
    window.AccountManager = AccountManager;

    // HELPER: KIỂM TRA QUYỀN ADMIN (QUẢN TRỊ VIÊN)
    function isCurrentUserAdmin() {
        try {
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

    // USER PROFILE CONTROLLER
    const UserProfile = {
        get: function() {
            try {
                const raw = localStorage.getItem("azota_user_profile");
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            return {
                name: "Minh Trí",
                nickname: "MinhTri",
                grade: "Lớp 11",
                role: "🎓 Học Sinh",
                goal: "9.0+ Học Kỳ 1",
                avatar: "👦",
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
            tags: ["⭐ Tạm Thời Rỗng", "Nghị Luận Văn Học", "Đọc Hiểu", "Đang Cập Nhật"]
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
            defaultProgress: 67,
            defaultFiles: 1,
            defaultQuestions: 6,
            colorClass: "from-emerald-500 via-teal-600 to-green-600",
            bgLight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            description: "Thư viện học tự luận: Bấm vào để chọn môn học. Hỗ trợ Flashcard 3D lật thẻ, Che khuyết từ khóa (Active Recall) và AI chấm điểm.",
            tags: ["⭐ Tự Luận Trọng Tâm", "Flashcard 3D & AI", "Active Recall", "Địa Lí 11"]
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
            defaultProgress: 80,
            defaultFiles: 9,
            defaultQuestions: 140,
            colorClass: "from-teal-500 via-cyan-600 to-blue-600",
            bgLight: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            description: "Toàn bộ 64 câu trắc nghiệm chuẩn SGK chia theo 6 chủ đề + Đề ôn tập Full 64 câu + Đúng/Sai & Nhận dạng biểu đồ.",
            tags: ["⭐ Full 64 Câu", "6 Chủ Đề Ôn Tập", "Đúng / Sai", "Nhận Dạng Biểu Đồ"]
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
            defaultProgress: 45,
            defaultFiles: 6,
            defaultQuestions: 200,
            colorClass: "from-rose-500 via-pink-600 to-purple-600",
            bgLight: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            description: "Hệ điều hành, Mã nguồn mở, Phần cứng CPU, Kết nối thiết bị số, Lưu trữ đám mây.",
            tags: ["⭐ Trọng tâm", "Full 100 câu", "Bài 1, 3, 4, 5, 6"]
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
            defaultProgress: 55,
            defaultFiles: 3,
            defaultQuestions: 98,
            colorClass: "from-purple-600 to-fuchsia-600",
            bgLight: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            description: "Cạnh tranh, Cung cầu, Lạm phát, Thất nghiệp và Khảo sát nhận định Đúng / Sai.",
            tags: ["Kinh tế", "Pháp luật", "98 câu hỏi"]
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
            defaultProgress: 92,
            defaultFiles: 3,
            defaultQuestions: 86,
            colorClass: "from-amber-500 to-orange-600",
            bgLight: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            description: "Kháng chiến chống thực dân Pháp, Kháng chiến chống Mỹ và Quá trình gia nhập ASEAN.",
            tags: ["Kháng chiến", "ASEAN", "79 câu"]
        },
        {
            id: "Tiếng Anh",
            title: "Tiếng Anh 11",
            abbr: "EN",
            grade: "11",
            icon: "🌐",
            category: "tracnghiem",
            isLop11: true,
            folderBoxBg: "bg-blue-950/70 border border-blue-500/40 text-blue-400",
            badgeBg: "bg-blue-500 text-white",
            lineBg: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]",
            progressTextColor: "text-blue-400 font-bold",
            defaultProgress: 66,
            defaultFiles: 2,
            defaultQuestions: 45,
            colorClass: "from-blue-600 to-cyan-500",
            bgLight: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            description: "Đề kiểm tra giữa kỳ, Chuyên đề ngữ pháp Modal verbs, Gerund, Tenses & Vocab.",
            tags: ["Grammar", "Vocabulary", "50 câu"]
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
            description: "Đại số & Giải tích: Hàm số lượng giác, dãy số, cấp số; Hình học không gian: Quan hệ song song, vuông góc.",
            tags: ["Toán 11", "Đại số & Giải tích", "Hình học không gian"]
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
            description: "Dao động điều hòa, Sóng cơ & sóng âm, Điện trường, Dòng điện không đổi & Từ trường.",
            tags: ["Vật Lí 11", "Dao động điều hòa", "Sóng & Điện"]
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
            description: "Bảo vệ an ninh quốc gia, trật tự an toàn xã hội, truyền thống vẻ vang của lực lượng vũ trang nhân dân Việt Nam.",
            tags: ["GDQP & AN 11", "An ninh quốc gia", "Quốc phòng toàn dân"]
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
        
        // Start in File Explorer view by default
        openFileExplorer('root');

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
            window.AzotaDock.setActiveApp("explorer");
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
        const inProgress = window.ExamEngine.restoreInProgress();
        if (inProgress && inProgress.exam) {
            const resumeBanner = document.getElementById("resumeExamBanner");
            if (resumeBanner) {
                resumeBanner.classList.remove("hidden");
                const titleEl = document.getElementById("resumeExamTitle");
                if (titleEl) titleEl.textContent = inProgress.exam.title;
            }
        }
    }

    function resumeExam() {
        const inProgress = window.ExamEngine.restoreInProgress();
        if (inProgress && inProgress.exam) {
            window.ExamEngine.startExam(inProgress.exam, inProgress.mode, {
                layout: inProgress.layout,
                duration: Math.round(inProgress.totalDurationSeconds / 60)
            });
            showView("exam");
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

    function updateMobileDockActive(dockKey) {
        document.querySelectorAll(".mobile-dock-btn").forEach(btn => btn.classList.remove("active"));
        const targetBtn = document.getElementById(`mobile-dock-${dockKey}`);
        if (targetBtn) {
            targetBtn.classList.add("active");
        } else {
            const menuBtn = document.getElementById("mobile-dock-menu");
            if (menuBtn) menuBtn.classList.add("active");
        }
    }

    function updateSidebarActive(targetKey) {
        document.querySelectorAll(".nav-item-modern").forEach(item => {
            item.classList.remove("nav-item-active", "liquid-active", "liquid-active-amber");
        });
        const el = document.getElementById(targetKey);
        if (el) {
            if (targetKey === "sidebar-folder-leaderboard") {
                el.classList.add("liquid-active-amber");
            } else {
                el.classList.add("nav-item-active");
            }
        }

        // Synchronize Mobile Bottom Dock
        if (targetKey === "sidebar-folder-root") {
            updateMobileDockActive("root");
        } else if (targetKey === "sidebar-folder-leaderboard") {
            updateMobileDockActive("leaderboard");
        } else if (targetKey === "sidebar-folder-Hoc_Tu_Luan") {
            updateMobileDockActive("Hoc_Tu_Luan");
        } else if (targetKey === "sidebar-util-notebook") {
            updateMobileDockActive("notebook");
        } else {
            updateMobileDockActive("menu");
        }
    }

    function showView(viewId) {
        if (!SecurityGuard.checkRateLimit("chuyển trang")) return;

        const views = ["explorerView", "homeView", "examView", "essayView", "resultView", "notebookView", "creatorView", "bankView", "historyView", "leaderboardView", "solutionsView"];
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
        } else if (viewId === "home") {
            openFileExplorer('root');
            return;
        } else if (viewId === "solutions") {
            updateActiveAppName("Kho Lời Giải & Bài Mẫu Chi Tiết");
            updateSidebarActive("sidebar-util-solutions");
            if (window.SolutionEngine) {
                if (typeof window.SolutionEngine.syncFromCloud === "function") {
                    window.SolutionEngine.syncFromCloud(true);
                } else if (typeof window.SolutionEngine.render === "function") {
                    window.SolutionEngine.render();
                }
            }
        } else if (viewId === "essay") {
            updateActiveAppName("Học Tự Luận Siêu Tốc — Môn Địa");
            updateSidebarActive("sidebar-folder-Hoc_Tu_Luan");
            if (window.EssayEngine) window.EssayEngine.render();
        } else if (viewId === "notebook") {
            updateActiveAppName("Câu Cần Ghi Nhớ");
            updateSidebarActive("sidebar-util-notebook");
            renderMistakeNotebook();
        } else if (viewId === "bank") {
            updateActiveAppName("Tra Cứu Ngân Hàng Câu Hỏi");
            updateSidebarActive("sidebar-util-bank");
            renderQuestionBank();
        } else if (viewId === "creator") {
            updateActiveAppName("Trình Tạo Đề Nhanh AI");
            updateSidebarActive("sidebar-util-creator");
        } else if (viewId === "history") {
            updateActiveAppName("Lịch Sử Khảo Thí");
            updateSidebarActive("sidebar-util-stats");
            renderExamHistory();
        } else if (viewId === "leaderboard") {
            updateActiveAppName("Bảng Xếp Hạng & Vinh Danh");
            updateSidebarActive("sidebar-folder-leaderboard");
            refreshLeaderboard();
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
            id: "van-11",
            subjectName: "Ngữ Văn",
            title: "Ngữ Văn 11",
            meta: "0 đề • Tạm thời rỗng",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "van-11-coming", name: "Chưa có đề thi", meta: "Đang cập nhật", art: "dusk", isEmpty: true },
                { id: "van-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ import", lines: true, isEmpty: true }
            ]
        },
        {
            id: "dia-11",
            subjectName: "Địa Lí",
            title: "Địa Lí 11",
            meta: "9 đề • 140 câu",
            category: "tracnghiem",
            art: "aurora",
            sheets: [
                { id: "dia-11-full-64", name: "FULL 64 Câu Cương", meta: "64 câu • 50p", art: "aurora" },
                { id: "dia-11-cd-1", name: "CĐ 1: Nhóm Nước", meta: "8 câu • 15p", art: "dusk" },
                { id: "dia-11-cd-2", name: "CĐ 2: Toàn Cầu Hóa", meta: "12 câu • 20p", lines: true }
            ]
        },
        {
            id: "th-11",
            subjectName: "Tin Học",
            title: "Tin Học 11",
            meta: "6 đề • 200 câu",
            category: "tracnghiem",
            art: "ember",
            sheets: [
                { id: "th-11-full-100", name: "FULL 100 Câu SGK", meta: "100 câu • 45p", art: "ember" },
                { id: "th-11-b1", name: "Hệ Điều Hành & PM Mở", meta: "20 câu • 20p", art: "glacier" },
                { id: "th-11-b4", name: "Bên Trong Máy Tính", meta: "20 câu • 20p", lines: true }
            ]
        },
        {
            id: "tuluan",
            subjectName: "Hoc_Tu_Luan",
            title: "Học Tự Luận",
            meta: "1 đề • 6 câu & biểu đồ",
            category: "tuluan",
            art: "verdant",
            sheets: [
                { id: "dia-11-tu-luan", name: "Toàn Cầu Hóa Kinh Tế", meta: "Câu 1 & Câu 4", art: "verdant", isEssay: true },
                { id: "dia-11-tu-luan", name: "Mỹ La-tinh & EU", meta: "Câu 2, 3 & 6", art: "aurora", isEssay: true },
                { id: "dia-11-tu-luan", name: "Nhận Dạng Biểu Đồ", meta: "Bí kíp 4 dạng", lines: true, isEssay: true }
            ]
        },
        {
            id: "ls-11",
            subjectName: "Lịch Sử",
            title: "Lịch Sử 11",
            meta: "3 đề • 86 câu",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "ls-11-b1", name: "Cách Mạng Tư Sản", meta: "52 câu • 45p", art: "dusk" },
                { id: "ls-11-b2", name: "Chủ Nghĩa Tư Bản", meta: "27 câu • 30p", art: "aurora" },
                { id: "ls-11-dung-sai", name: "Đúng/Sai Tư Liệu", meta: "7 câu • 15p", lines: true }
            ]
        },
        {
            id: "gdkt-11",
            subjectName: "GDKT&PL",
            title: "GDKT & PL 11",
            meta: "3 đề • 98 câu",
            category: "tracnghiem",
            art: "dusk",
            sheets: [
                { id: "gdkt-11-de1", name: "Cạnh Tranh & Cung Cầu", meta: "40 câu • 40p", art: "dusk" },
                { id: "gdkt-11-de2", name: "Thị Trường Lao Động", meta: "42 câu • 40p", art: "glacier" },
                { id: "gdkt-11-dung-sai", name: "Đúng/Sai Cấu Trúc Mới", meta: "16 câu • 20p", lines: true }
            ]
        },
        {
            id: "ta-11",
            subjectName: "Tiếng Anh",
            title: "Tiếng Anh 11",
            meta: "2 đề • 45 câu",
            category: "tracnghiem",
            art: "glacier",
            sheets: [
                { id: "ta-11-unit123", name: "Từ Vựng Unit 1, 2, 3", meta: "30 câu • 30p", art: "glacier" },
                { id: "ta-11-smartcities", name: "Smart Cities & Future", meta: "15 câu • 20p", art: "aurora" },
                { id: "ta-11-unit123", name: "Grammar Focus", meta: "Modal & Gerund", lines: true }
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
                { id: "toan-11-coming", name: "Chưa có đề thi", meta: "Đang cập nhật", art: "aurora", isEmpty: true },
                { id: "toan-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ import", lines: true, isEmpty: true }
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
                { id: "ly-11-coming", name: "Chưa có đề thi", meta: "Đang cập nhật", art: "ember", isEmpty: true },
                { id: "ly-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ import", lines: true, isEmpty: true }
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
                { id: "gdqp-11-coming", name: "Chưa có đề thi", meta: "Đang cập nhật", art: "verdant", isEmpty: true },
                { id: "gdqp-11-coming-2", name: "Tạm thời rỗng", meta: "Chờ import", lines: true, isEmpty: true }
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
        currentExplorerFolder = 'leaderboard';
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
            list.style.maxHeight = "500px";
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
        container.appendChild(headerDiv);

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

    const CLASSMATE_LEADERBOARD_ROSTER = [
        {
            name: "Lê Minh Tuấn",
            nickname: "tuanpro11",
            avatar: "🧑‍💻",
            grade: "11A2",
            streak: 6,
            scores: {
                all: { gpa: 9.85, points: 2950, doneCount: 34, accuracy: 98, role: "Đại Kiện Tướng" },
                "dia-11": { gpa: 9.75, points: 880, doneCount: 9, accuracy: 97, role: "Bản Đồ Học" },
                "th-11": { gpa: 10.0, points: 600, doneCount: 6, accuracy: 100, role: "Hacker Mũ Trắng" },
                "tu-luan": { gpa: 9.60, points: 480, doneCount: 5, accuracy: 95, role: "Ngòi Bút Vàng" },
                "en-11": { gpa: 9.80, points: 490, doneCount: 5, accuracy: 98, role: "IELTS Master" },
                "ls-11": { gpa: 9.70, points: 485, doneCount: 5, accuracy: 97, role: "Sử Gia Trẻ" },
                "gd-11": { gpa: 9.80, points: 390, doneCount: 4, accuracy: 98, role: "Luật Sư 11A" }
            }
        },
        {
            name: "Trần Mai Anh",
            nickname: "maianh_11",
            avatar: "👧",
            grade: "11A1",
            streak: 5,
            scores: {
                all: { gpa: 9.72, points: 2780, doneCount: 31, accuracy: 96, role: "Chiến Thần Tốc Độ" },
                "dia-11": { gpa: 9.60, points: 770, doneCount: 8, accuracy: 95, role: "Địa Lí Chuyên Sâu" },
                "th-11": { gpa: 9.80, points: 590, doneCount: 6, accuracy: 98, role: "Coder Nữ Thần" },
                "tu-luan": { gpa: 9.85, points: 595, doneCount: 6, accuracy: 99, role: "Văn Hay Chữ Tốt" },
                "en-11": { gpa: 10.0, points: 600, doneCount: 6, accuracy: 100, role: "Thủ Khoa Ngoại Ngữ" },
                "ls-11": { gpa: 9.50, points: 475, doneCount: 5, accuracy: 94, role: "Yêu Lịch Sử" },
                "gd-11": { gpa: 9.60, points: 380, doneCount: 4, accuracy: 96, role: "Pháp Luật Học" }
            }
        },
        {
            name: "Hoàng Kim Long",
            nickname: "long_geo11",
            avatar: "🦁",
            grade: "11A4",
            streak: 4,
            scores: {
                all: { gpa: 9.58, points: 2520, doneCount: 28, accuracy: 94, role: "Bậc Thầy Địa Lí" },
                "dia-11": { gpa: 9.95, points: 895, doneCount: 9, accuracy: 99, role: "Khai Thác Atlat" },
                "th-11": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 92, role: "Thực Hành Máy Tính" },
                "tu-luan": { gpa: 9.40, points: 470, doneCount: 5, accuracy: 93, role: "Lập Luận Sắc Bén" },
                "en-11": { gpa: 9.30, points: 465, doneCount: 5, accuracy: 91, role: "Tiếng Anh Giao Tiếp" },
                "ls-11": { gpa: 9.80, points: 490, doneCount: 5, accuracy: 98, role: "Chiến Hào Lịch Sử" },
                "gd-11": { gpa: 9.50, points: 375, doneCount: 4, accuracy: 95, role: "Công Dân Gương Mẫu" }
            }
        },
        {
            name: "Phạm Bảo Châu",
            nickname: "chau_chau11",
            avatar: "🦊",
            grade: "11A3",
            streak: 3,
            scores: {
                all: { gpa: 9.45, points: 2120, doneCount: 23, accuracy: 91, role: "Ong Vàng Chăm Chỉ" },
                "dia-11": { gpa: 9.40, points: 660, doneCount: 7, accuracy: 93, role: "Khám Phá Địa Cầu" },
                "th-11": { gpa: 9.50, points: 475, doneCount: 5, accuracy: 94, role: "Tin Học Văn Phòng" },
                "tu-luan": { gpa: 9.70, points: 485, doneCount: 5, accuracy: 97, role: "Sơ Đồ Tư Duy" },
                "en-11": { gpa: 9.40, points: 470, doneCount: 5, accuracy: 93, role: "Từ Vựng Phong Phú" },
                "ls-11": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 91, role: "Dòng Thời Gian" },
                "gd-11": { gpa: 9.60, points: 380, doneCount: 4, accuracy: 96, role: "Triết Học & Đời Sống" }
            }
        },
        {
            name: "Đặng Quốc Huy",
            nickname: "huyquoc11",
            avatar: "🐯",
            grade: "11A1",
            streak: 5,
            scores: {
                all: { gpa: 9.38, points: 1980, doneCount: 21, accuracy: 89, role: "Tự Luận Siêu Tốc" },
                "dia-11": { gpa: 9.20, points: 550, doneCount: 6, accuracy: 90, role: "Phân Tích Bảng Số" },
                "th-11": { gpa: 9.70, points: 485, doneCount: 5, accuracy: 97, role: "Thuật Toán Nhạy Bén" },
                "tu-luan": { gpa: 9.90, points: 495, doneCount: 5, accuracy: 99, role: "Thủ Khoa Tự Luận" },
                "en-11": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 89, role: "Ngữ Pháp Chắc" },
                "ls-11": { gpa: 9.30, points: 465, doneCount: 5, accuracy: 92, role: "Ghi Nhớ Sự Kiện" },
                "gd-11": { gpa: 9.40, points: 370, doneCount: 4, accuracy: 93, role: "Kiến Thức Pháp Lí" }
            }
        },
        {
            name: "Vũ Đức Thắng",
            nickname: "thang_lead",
            avatar: "🎯",
            grade: "11A5",
            streak: 2,
            scores: {
                all: { gpa: 9.25, points: 1850, doneCount: 19, accuracy: 88, role: "Chiến Binh Bứt Phá" },
                "dia-11": { gpa: 9.10, points: 540, doneCount: 6, accuracy: 89, role: "Địa Lí Kinh Tế" },
                "th-11": { gpa: 9.30, points: 465, doneCount: 5, accuracy: 92, role: "Phần Cứng & Mạng" },
                "tu-luan": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 91, role: "Phản Biện Sắc Bén" },
                "en-11": { gpa: 9.30, points: 465, doneCount: 5, accuracy: 91, role: "Nghe Nói Tự Tin" },
                "ls-11": { gpa: 9.50, points: 475, doneCount: 5, accuracy: 95, role: "Tư Duy Khách Quan" },
                "gd-11": { gpa: 9.40, points: 370, doneCount: 4, accuracy: 93, role: "Ý Thức Pháp Luật" }
            }
        },
        {
            name: "Bùi Thảo Nguyên",
            nickname: "nguyen_bt",
            avatar: "🎓",
            grade: "11A2",
            streak: 4,
            scores: {
                all: { gpa: 9.18, points: 1720, doneCount: 17, accuracy: 86, role: "Cây Bút Chuyên Cần" },
                "dia-11": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 88, role: "Địa Lí Tự Nhiên" },
                "th-11": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 90, role: "Ứng Dụng Đồ Họa" },
                "tu-luan": { gpa: 9.50, points: 475, doneCount: 5, accuracy: 95, role: "Trình Bày Đẹp" },
                "en-11": { gpa: 9.50, points: 475, doneCount: 5, accuracy: 95, role: "Đọc Hiểu Siêu Tốc" },
                "ls-11": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 90, role: "Nhân Vật Lịch Sử" },
                "gd-11": { gpa: 9.30, points: 365, doneCount: 4, accuracy: 92, role: "Quy Chuẩn Đạo Đức" }
            }
        },
        {
            name: "Ngô Minh Khang",
            nickname: "khang_ngo",
            avatar: "⚡",
            grade: "11A1",
            streak: 3,
            scores: {
                all: { gpa: 9.05, points: 1640, doneCount: 16, accuracy: 85, role: "Tia Chớp Phản Xạ" },
                "dia-11": { gpa: 8.90, points: 440, doneCount: 5, accuracy: 87, role: "Trắc Nghiệm Nhanh" },
                "th-11": { gpa: 9.60, points: 480, doneCount: 5, accuracy: 96, role: "Phím Tắt Thần Sầu" },
                "tu-luan": { gpa: 8.80, points: 440, doneCount: 5, accuracy: 86, role: "Gạch Đầu Dòng" },
                "en-11": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 91, role: "Phát Âm Chuẩn" },
                "ls-11": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 88, role: "Khai Sáng Sử Ký" },
                "gd-11": { gpa: 9.10, points: 360, doneCount: 4, accuracy: 90, role: "Trách Nhiệm Xã Hội" }
            }
        },
        {
            name: "Dương Ánh Tuyết",
            nickname: "tuyet_duong",
            avatar: "🌸",
            grade: "11A3",
            streak: 2,
            scores: {
                all: { gpa: 8.95, points: 1510, doneCount: 15, accuracy: 84, role: "Tinh Thần Quyết Tâm" },
                "dia-11": { gpa: 8.80, points: 435, doneCount: 5, accuracy: 85, role: "Ghi Nhớ Bản Đồ" },
                "th-11": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 89, role: "Soạn Thảo Tinh Tế" },
                "tu-luan": { gpa: 9.30, points: 465, doneCount: 5, accuracy: 93, role: "Hành Văn Mượt Mà" },
                "en-11": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 90, role: "Giao Tiếp Anh Ngữ" },
                "ls-11": { gpa: 8.90, points: 445, doneCount: 5, accuracy: 87, role: "Dữ Liệu Lịch Sử" },
                "gd-11": { gpa: 9.20, points: 365, doneCount: 4, accuracy: 91, role: "Ý Thức Pháp Luật" }
            }
        },
        {
            name: "Lê Quỳnh Nga",
            nickname: "nga_le11",
            avatar: "🌺",
            grade: "11A2",
            streak: 3,
            scores: {
                all: { gpa: 8.85, points: 1420, doneCount: 14, accuracy: 83, role: "Kiên Trì Bền Bỉ" },
                "dia-11": { gpa: 8.70, points: 430, doneCount: 5, accuracy: 84, role: "Ôn Tập Đều Đặn" },
                "th-11": { gpa: 8.90, points: 445, doneCount: 5, accuracy: 87, role: "Thực Hành Tốt" },
                "tu-luan": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 91, role: "Văn Phong Rõ Ràng" },
                "en-11": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 89, role: "Học Kép Ngữ Pháp" },
                "ls-11": { gpa: 8.80, points: 440, doneCount: 5, accuracy: 86, role: "Sử Liệu Chân Thực" },
                "gd-11": { gpa: 9.00, points: 355, doneCount: 4, accuracy: 89, role: "Kinh Tế Thị Trường" }
            }
        },
        {
            name: "Trịnh Quốc Bảo",
            nickname: "bao_trinh11",
            avatar: "🛡️",
            grade: "11A4",
            streak: 1,
            scores: {
                all: { gpa: 8.75, points: 1350, doneCount: 13, accuracy: 82, role: "Vững Vàng Kiến Thức" },
                "dia-11": { gpa: 8.60, points: 425, doneCount: 5, accuracy: 83, role: "Nắm Vững Khái Niệm" },
                "th-11": { gpa: 8.80, points: 440, doneCount: 5, accuracy: 86, role: "Cơ Bản Vững Chắc" },
                "tu-luan": { gpa: 8.90, points: 445, doneCount: 5, accuracy: 88, role: "Ý Tứ Chặt Chẽ" },
                "en-11": { gpa: 8.90, points: 445, doneCount: 5, accuracy: 87, role: "Từ Vựng Mở Rộng" },
                "ls-11": { gpa: 8.70, points: 435, doneCount: 5, accuracy: 85, role: "Cương Lĩnh Lịch Sử" },
                "gd-11": { gpa: 8.90, points: 350, doneCount: 4, accuracy: 88, role: "Pháp Quy Cơ Bản" }
            }
        },
        {
            name: "Võ Hoàng Yến",
            nickname: "yen_vo11",
            avatar: "🦅",
            grade: "11A5",
            streak: 2,
            scores: {
                all: { gpa: 8.65, points: 1280, doneCount: 12, accuracy: 81, role: "Khát Khao Tiến Bộ" },
                "dia-11": { gpa: 8.50, points: 420, doneCount: 5, accuracy: 82, role: "Rèn Luyện Mỗi Ngày" },
                "th-11": { gpa: 8.70, points: 435, doneCount: 5, accuracy: 85, role: "Kỹ Năng Tin Học" },
                "tu-luan": { gpa: 8.80, points: 440, doneCount: 5, accuracy: 87, role: "Bố Cục Rành Mạch" },
                "en-11": { gpa: 8.80, points: 440, doneCount: 5, accuracy: 86, role: "Ngữ Âm Cơ Bản" },
                "ls-11": { gpa: 8.60, points: 430, doneCount: 5, accuracy: 84, role: "Cột Mốc Lịch Sử" },
                "gd-11": { gpa: 8.80, points: 345, doneCount: 4, accuracy: 86, role: "Đạo Đức Công Dân" }
            }
        }
    ];

    function getCompiledLeaderboardData() {
        const user = UserProfile.get();
        let examHistory = [];
        try {
            examHistory = JSON.parse(localStorage.getItem("azota_exam_history") || "[]");
        } catch (e) {
            examHistory = [];
        }

        const userDoneTotal = examHistory.length;
        const userEarnedScore = examHistory.reduce((sum, h) => sum + Math.round((h.score || 8) * 15), 0);
        const userTotalScore = (userDoneTotal > 0) ? (2240 + userEarnedScore) : 2240;
        const userAvgOverall = (userDoneTotal > 0)
            ? Number((examHistory.reduce((sum, h) => sum + (h.score || 8), 0) / userDoneTotal).toFixed(2))
            : 9.35;
        const userAccuracyOverall = (userDoneTotal > 0)
            ? Math.round((examHistory.filter(h => (h.score || 0) >= 5).length / userDoneTotal) * 100)
            : 92;

        function computeUserSubjectStats(subjectKey, subjectMatcher) {
            const subjectExams = examHistory.filter(h => {
                const title = (h.examTitle || "").toLowerCase();
                const subj = (h.subject || "").toLowerCase();
                return title.includes(subjectMatcher) || subj.includes(subjectMatcher);
            });
            const sCount = subjectExams.length;
            if (sCount > 0) {
                const sGPA = Number((subjectExams.reduce((sum, h) => sum + (h.score || 8), 0) / sCount).toFixed(2));
                const sPoints = Math.round(subjectExams.reduce((sum, h) => sum + (h.score || 8) * 20, 0));
                const sAcc = Math.round((subjectExams.filter(h => (h.score || 0) >= 5).length / sCount) * 100);
                return { gpa: sGPA, points: sPoints, doneCount: sCount, accuracy: sAcc, role: "Ngôi Sao Thực Tế ⭐" };
            }
            return { gpa: 9.20, points: 460, doneCount: 2, accuracy: 90, role: "Học Viên Sẵn Sàng" };
        }

        const userScores = {
            all: { gpa: userAvgOverall, points: userTotalScore, doneCount: (userDoneTotal > 0 ? userDoneTotal : 2), accuracy: userAccuracyOverall, role: "Ngôi Sao Đang Lên ⭐" },
            "dia-11": computeUserSubjectStats("dia-11", "địa"),
            "th-11": computeUserSubjectStats("th-11", "tin"),
            "tu-luan": computeUserSubjectStats("tu-luan", "tự luận"),
            "en-11": computeUserSubjectStats("en-11", "tiếng anh"),
            "ls-11": computeUserSubjectStats("ls-11", "sử"),
            "gd-11": computeUserSubjectStats("gd-11", "kt")
        };

        const activeUserEntry = {
            id: "user_active",
            name: user.name || "Học Sinh Aseta",
            nickname: user.nickname || "hocsinh11",
            avatar: user.avatar || "👦",
            grade: user.grade || "11A1",
            streak: 3,
            isCurrentUser: true,
            scores: userScores
        };

        const additionalAccounts = [];
        try {
            const allAccs = AccountManager.getAllAccounts();
            const currAccId = AccountManager.getCurrentAccountId();
            allAccs.forEach(acc => {
                if (acc.id !== currAccId && acc.id !== "acc_admin" && acc.id !== "acc_guest") {
                    additionalAccounts.push({
                        name: acc.name,
                        nickname: acc.nickname,
                        avatar: acc.avatar || "🧑‍💻",
                        grade: acc.grade || "11A",
                        streak: 2,
                        scores: {
                            all: { gpa: 9.15, points: 1680, doneCount: 16, accuracy: 86, role: acc.role || "Bạn Cùng Lớp" },
                            "dia-11": { gpa: 9.10, points: 455, doneCount: 5, accuracy: 90, role: "Bạn Cùng Lớp" },
                            "th-11": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 91, role: "Bạn Cùng Lớp" },
                            "tu-luan": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 88, role: "Bạn Cùng Lớp" },
                            "en-11": { gpa: 9.20, points: 460, doneCount: 5, accuracy: 91, role: "Bạn Cùng Lớp" },
                            "ls-11": { gpa: 9.00, points: 450, doneCount: 5, accuracy: 88, role: "Bạn Cùng Lớp" },
                            "gd-11": { gpa: 9.10, points: 360, doneCount: 4, accuracy: 90, role: "Bạn Cùng Lớp" }
                        }
                    });
                }
            });
        } catch (e) {}

        const combined = [...CLASSMATE_LEADERBOARD_ROSTER, activeUserEntry, ...additionalAccounts];

        const mapped = combined.map(student => {
            const subScore = student.scores[currentLeaderboardSubject] || student.scores.all;
            return {
                name: student.name,
                nickname: student.nickname,
                avatar: student.avatar,
                grade: student.grade,
                streak: student.streak || 1,
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
            if (currentLeaderboardSort === 'gpa') {
                if (b.gpa !== a.gpa) return b.gpa - a.gpa;
                return b.points - a.points;
            } else if (currentLeaderboardSort === 'points') {
                if (b.points !== a.points) return b.points - a.points;
                return b.gpa - a.gpa;
            } else if (currentLeaderboardSort === 'done') {
                if (b.doneCount !== a.doneCount) return b.doneCount - a.doneCount;
                return b.gpa - a.gpa;
            }
            return b.gpa - a.gpa;
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
        container.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "py-10 px-4 sm:px-8 max-w-3xl mx-auto space-y-6 text-center animate-fadeIn";

        wrapper.innerHTML = `
            <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/20 via-blue-500/25 to-indigo-500/20 blur-2xl animate-pulse"></div>
                <div class="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/30 border border-sky-300/40 transform hover:scale-105 hover:rotate-3 transition-transform cursor-pointer" onclick="window.AudioHelper && window.AudioHelper.playBubblePop()">
                    📅
                </div>
            </div>

            <div class="space-y-3">
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                    <span>SẮP RA MẮT • COMING SOON</span>
                </div>
                <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Thời Khóa Biểu &amp; Lịch Học Lớp 11
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Hệ thống thời khóa biểu thông minh, tự động đồng bộ lịch học theo buổi, đếm ngược tiết thi và gợi ý bộ đề ôn tập tương ứng chuẩn bị ra mắt!
                </p>
            </div>

            <!-- Coming Soon Feature Highlights -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center text-lg font-bold mb-2.5">
                        🗓️
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Lịch Học Từng Tiết</div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Phân phối chương trình chi tiết từ Thứ 2 đến Thứ 7, tự nhiên &amp; xã hội.</div>
                </div>

                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-lg font-bold mb-2.5">
                        ⏰
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Đếm Ngược Kiểm Tra</div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Nhắc nhở ngày kiểm tra 15 phút, 1 tiết và kì thi Giữa kì / Cuối kì.</div>
                </div>

                <div class="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
                    <div class="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-lg font-bold mb-2.5">
                        🎯
                    </div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">Gợi Ý Bộ Đề Ôn</div>
                    <div class="text-[11px] text-slate-400 mt-1 leading-normal">Khuyên học sinh luyện đề trong Kho Đề cho môn sắp có tiết ngày mai.</div>
                </div>
            </div>

            <div class="pt-4 flex items-center justify-center gap-3">
                <button type="button" onclick="AzotaApp.openFileExplorer('root')" class="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98">
                    <span>📁</span>
                    <span>Quay Lại Thư Mục Môn Học</span>
                </button>
            </div>
        `;

        container.appendChild(wrapper);
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
        if (subjectName === "Hoc_Tu_Luan") {
            renderExplorerHocTuLuan(container);
            return;
        }

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

        // Sort so that Full 64 questions (Địa) and Full 100 (Tin) are first
        const sortedExams = [...exams].sort((a, b) => {
            if (a.id === "dia-11-full-64" || a.id === "th-11-full-100") return -1;
            if (b.id === "dia-11-full-64" || b.id === "th-11-full-100") return 1;
            return 0;
        });

        sortedExams.forEach(exam => {
            const isFull100 = (exam.id === "th-11-full-100");
            const isFull64 = (exam.id === "dia-11-full-64");
            const isHighlight = isFull100 || isFull64;
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
                                ${isFull100 ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">FULL 100 CÂU</span>' : ''}
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
            const isFull100 = (exam.id === "th-11-full-100");
            const isFull64 = (exam.id === "dia-11-full-64");

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between gap-1.5 mb-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            ${isFull100 ? '<span class="px-2 py-0.2 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-sm">FULL 100 CÂU</span>' : ''}
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
        startExam("th-11-full-100", mode);
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

    return {
        init: init,
        showView: showView,
        openFileExplorer: openFileExplorer,
        openEssayStudy: openEssayStudy,
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
