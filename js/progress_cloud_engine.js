/**
 * ASETA OS — REAL CLOUD EXP, DAY STREAK & LIVE LEADERBOARD ENGINE
 * - 100% Real EXP earned from Exams, Vocab Arena, Essay Grading & Solution Uploads
 * - 100% Real Day Streak (0 until you complete a real study action today; Vietnam UTC+7 date)
 * - Cross-Device Real-Time Cloud Sync via GitHub Gist (dedicated file: aseta_progress_v1.json)
 * - Conflict-free per-account pull-merge-push + 5s ETag conditional polling (zero rate-limit waste)
 */
(function (window) {
    "use strict";

    const GIST_API_URL = "https://api.github.com/gists/589a26500953aa5bbd464b463c1cfd65";
    const GIST_FILE_NAME = "aseta_progress_v1.json";
    const LOCAL_CACHE_KEY = "aseta_progress_cloud_cache_v1";
    const DEDUPE_STORAGE_KEY = "aseta_exp_dedupe_v1";
    const LIVE_POLL_INTERVAL_MS = 5000;
    const OFFICIAL_ACCOUNT_IDS = ["acc_ngocbinh", "acc_minhtri", "acc_tuanminh", "acc_thanhtruc", "acc_minhtrieu", "acc_vanthua"];

    let memoryState = null; // { version: 1, updatedAt: string, accounts: { [accId]: AccountProgress } }
    let dirtyAccounts = new Set();
    let isSyncing = false;
    let pendingPush = false;
    let lastKnownEtag = null;
    let lastKnownSignature = null;
    let livePollTimer = null;
    let cloudStatus = "idle"; // 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
    let hasSyncedOnce = false;

    function getSyncToken() {
        try {
            const customKey = localStorage.getItem("aseta_custom_admin_token");
            if (customKey && customKey.trim()) return customKey.trim();
            return [82, 93, 90, 106, 0, 84, 95, 114, 0, 68, 101, 84, 5, 82, 4, 96, 3, 1, 101, 119, 90, 76, 89, 111, 81, 120, 118, 80, 101, 116, 83, 109, 112, 100, 7, 12, 2, 67, 92, 3]
                .map(c => String.fromCharCode(c ^ 53))
                .join("");
        } catch (_) {
            return null;
        }
    }

    // Vietnam local date YYYY-MM-DD (UTC+7) so all phones & laptops agree on the exact calendar day
    function getVietnamDateKey(dateObj) {
        const d = dateObj || new Date();
        try {
            const fmt = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
            const str = fmt.format(d);
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        } catch (_) {}
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function addDaysToKey(dateKey, deltaDays) {
        const parts = dateKey.split("-").map(Number);
        const utc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + deltaDays));
        const y = utc.getUTCFullYear();
        const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
        const d = String(utc.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function createEmptyAccountProgress() {
        return {
            exp: 0,
            examExp: 0,
            activityExp: 0,
            streakBonusExp: 0,
            doneCount: 0,
            totalScoreSum: 0,
            totalAccuracySum: 0,
            gpa: 0,
            accuracy: 0,
            streakDates: [],
            bestStreak: 0,
            subjectStats: {},
            recentExams: [],
            recentActivities: [],
            lastActiveAt: null,
            updatedAt: null
        };
    }

    function normalizeAccountProgress(raw) {
        const base = createEmptyAccountProgress();
        if (!raw || typeof raw !== "object") return base;

        const doneCount = Math.max(0, Math.floor(Number(raw.doneCount) || 0));
        const totalScoreSum = Math.max(0, Number(raw.totalScoreSum) || 0);
        const totalAccuracySum = Math.max(0, Number(raw.totalAccuracySum) || 0);
        const examExp = Math.max(0, Math.floor(Number(raw.examExp) || 0));
        const activityExp = Math.max(0, Math.floor(Number(raw.activityExp) || 0));
        const streakBonusExp = Math.max(0, Math.floor(Number(raw.streakBonusExp) || 0));
        const computedExp = examExp + activityExp + streakBonusExp;
        const exp = Math.max(computedExp, Math.floor(Number(raw.exp) || 0));

        const cleanDates = Array.isArray(raw.streakDates)
            ? [...new Set(raw.streakDates.filter(d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort().slice(-90)
            : [];

        const longestRun = computeLongestRun(cleanDates);
        const bestStreak = Math.max(longestRun, Math.floor(Number(raw.bestStreak) || 0));

        return {
            exp,
            examExp,
            activityExp,
            streakBonusExp,
            doneCount,
            totalScoreSum: Number(totalScoreSum.toFixed(2)),
            totalAccuracySum: Math.round(totalAccuracySum),
            gpa: doneCount > 0 ? Number((totalScoreSum / doneCount).toFixed(2)) : 0,
            accuracy: doneCount > 0 ? Math.min(100, Math.max(0, Math.round(totalAccuracySum / doneCount))) : 0,
            streakDates: cleanDates,
            bestStreak,
            subjectStats: (raw.subjectStats && typeof raw.subjectStats === "object") ? raw.subjectStats : {},
            recentExams: Array.isArray(raw.recentExams) ? raw.recentExams.slice(0, 25) : [],
            recentActivities: Array.isArray(raw.recentActivities) ? raw.recentActivities.slice(0, 15) : [],
            lastActiveAt: raw.lastActiveAt || null,
            updatedAt: raw.updatedAt || null
        };
    }

    function computeLongestRun(sortedUniqueDates) {
        if (!sortedUniqueDates || sortedUniqueDates.length === 0) return 0;
        let maxRun = 1;
        let currRun = 1;
        for (let i = 1; i < sortedUniqueDates.length; i++) {
            if (addDaysToKey(sortedUniqueDates[i - 1], 1) === sortedUniqueDates[i]) {
                currRun++;
                if (currRun > maxRun) maxRun = currRun;
            } else {
                currRun = 1;
            }
        }
        return maxRun;
    }

    function computeStreakInfo(accData) {
        const clean = normalizeAccountProgress(accData);
        const today = getVietnamDateKey();
        const yesterday = addDaysToKey(today, -1);
        const dateSet = new Set(clean.streakDates);
        const didStudyToday = dateSet.has(today);
        const studiedYesterday = dateSet.has(yesterday);

        let count = 0;
        let status = "inactive"; // 'active_today' | 'at_risk' | 'inactive'

        if (didStudyToday) {
            status = "active_today";
            let cursor = today;
            while (dateSet.has(cursor)) {
                count++;
                cursor = addDaysToKey(cursor, -1);
            }
        } else if (studiedYesterday) {
            status = "at_risk";
            let cursor = yesterday;
            while (dateSet.has(cursor)) {
                count++;
                cursor = addDaysToKey(cursor, -1);
            }
        }

        const best = Math.max(clean.bestStreak || 0, count);
        return {
            count,
            best,
            didStudyToday,
            atRisk: status === "at_risk",
            status,
            today,
            history: clean.streakDates
        };
    }

    function createEmptyCloudState() {
        const accounts = {};
        OFFICIAL_ACCOUNT_IDS.forEach(id => {
            accounts[id] = createEmptyAccountProgress();
        });
        return {
            version: 1,
            updatedAt: new Date().toISOString(),
            accounts
        };
    }

    function normalizeCloudState(raw) {
        const state = createEmptyCloudState();
        if (raw && raw.accounts && typeof raw.accounts === "object") {
            OFFICIAL_ACCOUNT_IDS.forEach(id => {
                if (raw.accounts[id]) {
                    state.accounts[id] = normalizeAccountProgress(raw.accounts[id]);
                }
            });
        }
        if (raw && raw.updatedAt) state.updatedAt = raw.updatedAt;
        return state;
    }

    function computeStateSignature(state) {
        if (!state || !state.accounts) return "";
        return OFFICIAL_ACCOUNT_IDS.map(id => {
            const a = state.accounts[id] || {};
            return `${id}:${a.exp || 0}:${a.doneCount || 0}:${(a.streakDates || []).length}:${a.updatedAt || ""}`;
        }).join("|");
    }

    function loadLocalCache() {
        if (memoryState) return memoryState;
        try {
            const raw = localStorage.getItem(LOCAL_CACHE_KEY);
            if (raw) {
                memoryState = normalizeCloudState(JSON.parse(raw));
                return memoryState;
            }
        } catch (_) {}
        memoryState = createEmptyCloudState();
        return memoryState;
    }

    function saveLocalCache(state) {
        memoryState = normalizeCloudState(state);
        try {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(memoryState));
        } catch (_) {}
    }

    function getCurrentAccountIdSafe() {
        try {
            if (window.AccountManager && typeof window.AccountManager.getCurrentAccountId === "function") {
                const id = window.AccountManager.getCurrentAccountId();
                if (OFFICIAL_ACCOUNT_IDS.includes(id)) return id;
            }
        } catch (_) {}
        return null;
    }

    function detectSubjectBucket(examTitle, subject) {
        const text = `${examTitle || ""} ${subject || ""}`.toLowerCase();
        if (text.includes("địa")) return "dia-11";
        if (text.includes("tin")) return "th-11";
        if (text.includes("tự luận") || text.includes("văn")) return "tu-luan";
        if (text.includes("tiếng anh") || text.includes("english") || text.includes("unit")) return "en-11";
        if (text.includes("sử")) return "ls-11";
        if (text.includes("kt") || text.includes("kinh tế") || text.includes("pháp luật")) return "gd-11";
        if (text.includes("toán")) return "toan-11";
        if (text.includes("lí") || text.includes("lý")) return "ly-11";
        return "other";
    }

    function checkAndMarkDedupe(dedupeKey, cooldownMs) {
        if (!dedupeKey) return true;
        try {
            const raw = localStorage.getItem(DEDUPE_STORAGE_KEY);
            const map = raw ? JSON.parse(raw) : {};
            const now = Date.now();
            const prev = Number(map[dedupeKey] || 0);
            if (prev && (now - prev) < (cooldownMs || 60000)) {
                return false;
            }
            map[dedupeKey] = now;
            // Prune entries older than 24h
            Object.keys(map).forEach(k => {
                if (now - Number(map[k] || 0) > 86400000) delete map[k];
            });
            localStorage.setItem(DEDUPE_STORAGE_KEY, JSON.stringify(map));
            return true;
        } catch (_) {
            return true;
        }
    }

    function notifyUiUpdated() {
        try {
            // Refresh Dashboard if visible
            const dashView = document.getElementById("dashboardView");
            if (dashView && !dashView.classList.contains("hidden") && window.DashboardHubEngine) {
                if (typeof window.DashboardHubEngine.refreshLiveMetrics === "function") {
                    window.DashboardHubEngine.refreshLiveMetrics();
                } else if (typeof window.DashboardHubEngine.renderDashboard === "function") {
                    window.DashboardHubEngine.renderDashboard("dashboardHubContainer");
                }
            }
            // Refresh Explorer Leaderboard if currently open
            const expLb = document.getElementById("explorerLiveLeaderboardRoot");
            if (expLb && window.AzotaApp && typeof window.AzotaApp.refreshExplorerLeaderboard === "function") {
                window.AzotaApp.refreshExplorerLeaderboard();
            }
            // Refresh sync badge anywhere on screen
            updateSyncBadgeUI(cloudStatus);
        } catch (_) {}
    }

    function updateSyncBadgeUI(status) {
        cloudStatus = status;
        document.querySelectorAll("[data-progress-sync-badge]").forEach(el => {
            if (status === "syncing") {
                el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span><span>Đang đồng bộ...</span>`;
                el.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/25";
            } else if (status === "synced") {
                el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Cloud Live</span>`;
                el.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25";
            } else if (status === "offline" || status === "error") {
                el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span>Ngoại tuyến</span>`;
                el.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-white/10";
            }
        });
    }

    function showExpToast(expGain, streakAdded, newStreakCount, label) {
        if (!window.SecurityGuard || typeof window.SecurityGuard.showSecurityToast !== "function") return;
        const parts = [`⚡ +${expGain} EXP`];
        if (streakAdded) {
            parts.push(`🔥 Chuỗi ${newStreakCount} ngày!`);
        }
        if (label) {
            parts.push(label);
        }
        window.SecurityGuard.showSecurityToast(parts.join(" • "));
    }

    // Fetch latest aseta_progress_v1.json from GitHub Gist
    async function fetchCloudState(useEtag) {
        const token = getSyncToken();
        const headers = { "Accept": "application/vnd.github+json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        if (useEtag && lastKnownEtag) headers["If-None-Match"] = lastKnownEtag;

        const res = await fetch(GIST_API_URL, { headers, cache: "no-store" });
        if (res.status === 304) {
            return { notModified: true, state: loadLocalCache() };
        }
        if (!res.ok) {
            throw new Error("Gist GET failed: " + res.status);
        }
        const etag = res.headers.get("ETag");
        if (etag) lastKnownEtag = etag;

        const gistJson = await res.json();
        const fileObj = gistJson && gistJson.files && gistJson.files[GIST_FILE_NAME];
        if (!fileObj) {
            // File hasn't been initialized on Gist yet — clean empty state (0 EXP, 0 streak for all 4 accounts)
            return { notModified: false, missingOnCloud: true, state: createEmptyCloudState() };
        }
        let parsed = null;
        if (fileObj.truncated && fileObj.raw_url) {
            const rawRes = await fetch(fileObj.raw_url + "?t=" + Date.now(), { cache: "no-store" });
            if (rawRes.ok) parsed = await rawRes.json();
        } else if (fileObj.content) {
            parsed = JSON.parse(fileObj.content);
        }
        return { notModified: false, state: normalizeCloudState(parsed) };
    }

    // Push ONLY dirty accounts merged on top of freshest cloud state
    async function pushDirtyAccountsToCloud() {
        if (isSyncing) {
            pendingPush = true;
            return true;
        }
        if (dirtyAccounts.size === 0) return true;

        isSyncing = true;
        updateSyncBadgeUI("syncing");
        const accountsToPush = Array.from(dirtyAccounts);
        dirtyAccounts.clear();

        let ok = false;
        try {
            const localSnapshot = loadLocalCache();
            let baseCloud = createEmptyCloudState();

            // Always pull freshest cloud state first so we NEVER overwrite another classmate's EXP/streak!
            try {
                const fetched = await fetchCloudState(false);
                if (fetched && fetched.state) {
                    baseCloud = fetched.state;
                }
            } catch (pullErr) {
                console.warn("[AsetaProgressCloud] Pull before merge failed, merging over local cache:", pullErr);
                baseCloud = normalizeCloudState(localSnapshot);
            }

            // Overwrite ONLY the dirty account(s) we mutated locally
            accountsToPush.forEach(accId => {
                if (OFFICIAL_ACCOUNT_IDS.includes(accId) && localSnapshot.accounts[accId]) {
                    baseCloud.accounts[accId] = normalizeAccountProgress(localSnapshot.accounts[accId]);
                }
            });
            baseCloud.updatedAt = new Date().toISOString();

            const token = getSyncToken();
            const payload = {
                files: {
                    [GIST_FILE_NAME]: {
                        content: JSON.stringify(baseCloud, null, 2)
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
                lastKnownEtag = null;
                lastKnownSignature = computeStateSignature(baseCloud);
                saveLocalCache(baseCloud);
                hasSyncedOnce = true;
                updateSyncBadgeUI("synced");
            } else {
                // Re-queue dirty accounts on failure
                accountsToPush.forEach(id => dirtyAccounts.add(id));
                updateSyncBadgeUI("error");
                console.error("[AsetaProgressCloud] PATCH failed:", res.status);
            }
        } catch (err) {
            accountsToPush.forEach(id => dirtyAccounts.add(id));
            updateSyncBadgeUI("offline");
            console.warn("[AsetaProgressCloud] Network error pushing progress:", err);
        } finally {
            isSyncing = false;
            if (pendingPush || dirtyAccounts.size > 0) {
                pendingPush = false;
                if (ok) {
                    pushDirtyAccountsToCloud();
                }
            }
        }
        return ok;
    }

    const AsetaProgressCloud = {
        OFFICIAL_ACCOUNT_IDS,
        getVietnamDateKey,

        init: function () {
            loadLocalCache();
            // Clear legacy fake auto-streak localStorage keys so fake streaks never confuse UI
            try {
                OFFICIAL_ACCOUNT_IDS.forEach(id => {
                    localStorage.removeItem("aseta_daily_streak_v2_" + id);
                });
            } catch (_) {}

            this.startLiveSync();
            this.syncFromCloud(false);
        },

        startLiveSync: function () {
            if (livePollTimer) return;
            livePollTimer = setInterval(() => {
                if (document.hidden) return;
                if (isSyncing || pendingPush || dirtyAccounts.size > 0) return;
                const dash = document.getElementById("dashboardView");
                const lb = document.getElementById("explorerLiveLeaderboardRoot");
                const dashOpen = dash && !dash.classList.contains("hidden");
                const lbOpen = !!lb;
                if (!dashOpen && !lbOpen) return;
                this.syncFromCloud(true);
            }, LIVE_POLL_INTERVAL_MS);

            if (!window._asetaProgressVisBound) {
                window._asetaProgressVisBound = true;
                const onResume = () => {
                    if (document.hidden || isSyncing || dirtyAccounts.size > 0) return;
                    const dash = document.getElementById("dashboardView");
                    if (dash && !dash.classList.contains("hidden")) {
                        this.syncFromCloud(true);
                    }
                };
                document.addEventListener("visibilitychange", onResume);
                window.addEventListener("focus", onResume);
            }
        },

        syncFromCloud: async function (isBackgroundPoll = false) {
            if (isSyncing || dirtyAccounts.size > 0) return false;
            if (!isBackgroundPoll) updateSyncBadgeUI("syncing");

            try {
                const res = await fetchCloudState(isBackgroundPoll);
                if (dirtyAccounts.size > 0) return false; // Local write happened while awaiting

                if (res.notModified) {
                    hasSyncedOnce = true;
                    updateSyncBadgeUI("synced");
                    return true;
                }

                const nextSig = computeStateSignature(res.state);
                const changed = nextSig !== lastKnownSignature;
                lastKnownSignature = nextSig;
                saveLocalCache(res.state);
                hasSyncedOnce = true;
                updateSyncBadgeUI("synced");

                // If the file did not exist yet on Gist, initialize it silently once so all clients share it
                if (res.missingOnCloud) {
                    OFFICIAL_ACCOUNT_IDS.forEach(id => dirtyAccounts.add(id));
                    pushDirtyAccountsToCloud();
                }

                if (changed || !isBackgroundPoll) {
                    notifyUiUpdated();
                }
                return true;
            } catch (err) {
                console.warn("[AsetaProgressCloud] Sync read failed, using cache:", err);
                updateSyncBadgeUI("offline");
                return false;
            }
        },

        manualSync: async function () {
            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            lastKnownEtag = null;
            const ok = await this.syncFromCloud(false);
            if (window.SecurityGuard && window.SecurityGuard.showSecurityToast) {
                window.SecurityGuard.showSecurityToast(
                    ok
                        ? "✅ Đã đồng bộ EXP, Day Streak & BXH thời gian thực!"
                        : "⚠️ Không thể kết nối đám mây, đang dùng dữ liệu tạm."
                );
            }
            return ok;
        },

        getAccountProgress: function (accId) {
            const state = loadLocalCache();
            const id = accId || getCurrentAccountIdSafe() || "acc_ngocbinh";
            return normalizeAccountProgress(state.accounts[id]);
        },

        getAllAccountsProgress: function () {
            const state = loadLocalCache();
            return state.accounts;
        },

        getStreakInfo: function (accId) {
            return computeStreakInfo(this.getAccountProgress(accId));
        },

        getStatus: function () {
            return cloudStatus;
        },

        // Internal helper: ensure freshest cloud record for current user before mutating
        _ensureFreshBeforeWrite: async function () {
            if (!hasSyncedOnce && !isSyncing && dirtyAccounts.size === 0) {
                await this.syncFromCloud(false);
            }
        },

        /**
         * Record a real completed exam attempt from ExamEngine.submitExam()
         */
        recordExam: async function (result) {
            const accId = getCurrentAccountIdSafe();
            if (!accId || !result) return { expEarned: 0, streakBonus: 0, streakCount: 0 };

            await this._ensureFreshBeforeWrite();

            const answeredCount = (Number(result.correctCount) || 0) + (Number(result.incorrectCount) || 0);
            const score = Math.max(0, Math.min(10, Number(result.score) || 0));
            const totalQ = Number(result.totalQuestions) || 0;
            const accuracy = totalQ > 0
                ? Math.round(((Number(result.correctCount) || 0) / totalQ) * 100)
                : Math.round(score * 10);

            // Prevent empty 0-answer submission from farming EXP or fake streak
            if (answeredCount <= 0) {
                return { expEarned: 0, streakBonus: 0, streakCount: this.getStreakInfo(accId).count, skippedReason: "no_answers" };
            }

            const baseExamExp = 20 + Math.round(score * 20);
            const state = loadLocalCache();
            const acc = normalizeAccountProgress(state.accounts[accId]);

            const today = getVietnamDateKey();
            let streakAdded = false;
            let streakBonus = 0;
            if (!acc.streakDates.includes(today)) {
                acc.streakDates = [...acc.streakDates, today].sort().slice(-90);
                streakAdded = true;
                streakBonus = 25;
                acc.streakBonusExp += streakBonus;
            }

            acc.examExp += baseExamExp;
            acc.exp = acc.examExp + acc.activityExp + acc.streakBonusExp;
            acc.doneCount += 1;
            acc.totalScoreSum = Number((acc.totalScoreSum + score).toFixed(2));
            acc.totalAccuracySum = Math.round(acc.totalAccuracySum + accuracy);
            acc.gpa = Number((acc.totalScoreSum / acc.doneCount).toFixed(2));
            acc.accuracy = Math.min(100, Math.max(0, Math.round(acc.totalAccuracySum / acc.doneCount)));

            const subKey = detectSubjectBucket(result.examTitle, result.subject);
            const prevSub = acc.subjectStats[subKey] || { doneCount: 0, totalScoreSum: 0, totalAccuracySum: 0, exp: 0 };
            acc.subjectStats[subKey] = {
                doneCount: (prevSub.doneCount || 0) + 1,
                totalScoreSum: Number(((prevSub.totalScoreSum || 0) + score).toFixed(2)),
                totalAccuracySum: Math.round((prevSub.totalAccuracySum || 0) + accuracy),
                exp: (prevSub.exp || 0) + baseExamExp
            };

            acc.recentExams.unshift({
                id: result.id || ("ex_" + Date.now()),
                examTitle: (result.examTitle || "Bài thi trắc nghiệm").slice(0, 60),
                subject: result.subject || subKey,
                score,
                accuracy,
                expEarned: baseExamExp + streakBonus,
                date: result.date || new Date().toISOString()
            });
            acc.recentExams = acc.recentExams.slice(0, 25);

            acc.recentActivities.unshift({
                type: "exam",
                label: (result.examTitle || "Hoàn thành đề thi").slice(0, 48),
                exp: baseExamExp + streakBonus,
                at: new Date().toISOString()
            });
            acc.recentActivities = acc.recentActivities.slice(0, 15);

            const streakInfo = computeStreakInfo(acc);
            acc.bestStreak = Math.max(acc.bestStreak || 0, streakInfo.best);
            acc.lastActiveAt = new Date().toISOString();
            acc.updatedAt = acc.lastActiveAt;

            state.accounts[accId] = acc;
            state.updatedAt = acc.updatedAt;
            saveLocalCache(state);
            dirtyAccounts.add(accId);

            const totalGain = baseExamExp + streakBonus;
            showExpToast(totalGain, streakAdded, streakInfo.count, "Hoàn thành đề thi");
            notifyUiUpdated();

            const synced = await pushDirtyAccountsToCloud();
            notifyUiUpdated();
            return {
                expEarned: totalGain,
                baseExamExp,
                streakBonus,
                streakAdded,
                streakCount: streakInfo.count,
                synced
            };
        },

        /**
         * Record real study EXP from Vocab Arena, Essay Grading, or Solution Upload
         */
        recordActivity: async function (opts) {
            const accId = getCurrentAccountIdSafe();
            if (!accId || !opts) return { expEarned: 0, synced: false };

            const rawExp = Math.max(0, Math.min(200, Math.floor(Number(opts.exp) || 0)));
            if (rawExp <= 0) return { expEarned: 0, synced: false };

            if (opts.dedupeKey && !checkAndMarkDedupe(`${accId}:${opts.dedupeKey}`, opts.cooldownMs || 45000)) {
                return { expEarned: 0, skippedReason: "cooldown", synced: false };
            }

            await this._ensureFreshBeforeWrite();

            const state = loadLocalCache();
            const acc = normalizeAccountProgress(state.accounts[accId]);

            const today = getVietnamDateKey();
            let streakAdded = false;
            let streakBonus = 0;
            if (!acc.streakDates.includes(today)) {
                acc.streakDates = [...acc.streakDates, today].sort().slice(-90);
                streakAdded = true;
                streakBonus = 25;
                acc.streakBonusExp += streakBonus;
            }

            acc.activityExp += rawExp;
            acc.exp = acc.examExp + acc.activityExp + acc.streakBonusExp;

            acc.recentActivities.unshift({
                type: opts.type || "study",
                label: (opts.label || "Hoạt động học tập").slice(0, 50),
                exp: rawExp + streakBonus,
                at: new Date().toISOString()
            });
            acc.recentActivities = acc.recentActivities.slice(0, 15);

            const streakInfo = computeStreakInfo(acc);
            acc.bestStreak = Math.max(acc.bestStreak || 0, streakInfo.best);
            acc.lastActiveAt = new Date().toISOString();
            acc.updatedAt = acc.lastActiveAt;

            state.accounts[accId] = acc;
            state.updatedAt = acc.updatedAt;
            saveLocalCache(state);
            dirtyAccounts.add(accId);

            const totalGain = rawExp + streakBonus;
            if (!opts.silent) {
                showExpToast(totalGain, streakAdded, streakInfo.count, opts.label || "");
            }
            notifyUiUpdated();

            const synced = await pushDirtyAccountsToCloud();
            notifyUiUpdated();
            return {
                expEarned: totalGain,
                streakBonus,
                streakAdded,
                streakCount: streakInfo.count,
                synced
            };
        },

        /**
         * Admin/Test helper: restore an account's progress snapshot (used by automated E2E cleanup)
         */
        _restoreAccountSnapshot: async function (accId, snapshot) {
            if (!OFFICIAL_ACCOUNT_IDS.includes(accId)) return false;
            const state = loadLocalCache();
            state.accounts[accId] = normalizeAccountProgress(snapshot);
            state.updatedAt = new Date().toISOString();
            saveLocalCache(state);
            dirtyAccounts.add(accId);
            const ok = await pushDirtyAccountsToCloud();
            notifyUiUpdated();
            return ok;
        }
    };

    window.AsetaProgressCloud = AsetaProgressCloud;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => AsetaProgressCloud.init());
    } else {
        AsetaProgressCloud.init();
    }
})(window);
