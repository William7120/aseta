/**
 * Aseta Timetable Engine — Thời Khóa Biểu & Balo Đi Học Lớp 11A7
 * Trường THPT Trần Văn Giàu • Học Kỳ 1 (Áp dụng từ 09/11/2026) • GVCN: Nguyễn Việt Kiều Anh
 * Thiết kế Editorial Bento 2 khung gọn gàng:
 *   - Trái (7 cột): Lịch tiết học Sáng & Chiều tinh gọn (ẩn tiết trống, hiện giờ học trực quan)
 *   - Phải (5 cột): Balo Đi Học tương tác (tiến độ soạn cặp, lưu riêng từng tài khoản, chạm 1 lần để tick)
 *   - Ảnh gốc TKB đóng gói trong nút "🖼️ Ảnh gốc" mở Lightbox phóng to khi cần, không chiếm chỗ màn hình.
 */
window.TimetableEngine = (function() {
    'use strict';

    const UK_FLAG_SVG = '<svg class="inline-block w-[1.15em] h-[1.15em] rounded-full overflow-hidden shrink-0 align-[-0.18em] ring-1 ring-white/15" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#012169"/><path d="M0 0L64 64M64 0L0 64" stroke="#FFF" stroke-width="11"/><path d="M0 0L64 64M64 0L0 64" stroke="#C8102E" stroke-width="6"/><path d="M32 0V64M0 32H64" stroke="#FFF" stroke-width="18"/><path d="M32 0V64M0 32H64" stroke="#C8102E" stroke-width="10"/></svg>';

    const TIMETABLE_CONFIG = {
        schoolName: "Trường THPT Trần Văn Giàu",
        className: "11A7",
        semester: "HK1 (từ 09/11/2026)",
        homeroomTeacher: "Nguyễn Việt Kiều Anh",
        imageUrl: "assets/thoi_khoa_bieu_11a7.jpg",

        timeSlots: {
            morning: [
                { id: "S1", label: "Tiết 1", time: "07:00 – 07:45" },
                { id: "S2", label: "Tiết 2", time: "07:50 – 08:35" },
                { id: "S3", label: "Tiết 3", time: "09:00 – 09:45" },
                { id: "S4", label: "Tiết 4", time: "09:50 – 10:35" },
                { id: "S5", label: "Tiết 5", time: "10:40 – 11:25" }
            ],
            afternoon: [
                { id: "C1", label: "Tiết 1", time: "13:30 – 14:10" },
                { id: "C2", label: "Tiết 2", time: "14:15 – 14:55" },
                { id: "C3", label: "Tiết 3", time: "15:05 – 15:40" },
                { id: "C4", label: "Tiết 4", time: "15:40 – 16:15" },
                { id: "C5", label: "Tiết 5", time: "16:20 – 17:05" }
            ]
        },

        subjectsMeta: {
            "Ngoại ngữ": {
                fullName: "Tiếng Anh",
                icon: UK_FLAG_SVG,
                examFolderId: "Tiếng Anh",
                supplies: [
                    { id: "nn_decuong", name: "Đề cương Tiếng Anh" },
                    { id: "nn_sach", name: "Sách Tiếng Anh" }
                ]
            },
            "Ngữ văn": {
                fullName: "Ngữ Văn",
                icon: "📖",
                examFolderId: "Ngữ Văn",
                supplies: [
                    { id: "van_decuong", name: "Đề cương Văn" },
                    { id: "van_sach", name: "Sách Văn" },
                    { id: "van_vo", name: "Vở ghi Văn" },
                    { id: "van_chuyende", name: "Chuyên đề Văn (khi cô dặn)", optional: true }
                ]
            },
            "Tin học": {
                fullName: "Tin Học",
                icon: "💻",
                examFolderId: "Tin Học",
                supplies: [
                    { id: "tin_decuong", name: "Đề cương Tin học" },
                    { id: "tin_sach", name: "Sách Tin học" }
                ]
            },
            "TH MOS": {
                fullName: "Thực Hành MOS",
                icon: "🖥️",
                supplies: [
                    { id: "mos_decuong", name: "Đề cương MOS" }
                ]
            },
            "Lịch Sử": {
                fullName: "Lịch Sử",
                icon: "🏛️",
                examFolderId: "Lịch Sử",
                supplies: [
                    { id: "su_decuong", name: "Đề cương Lịch Sử" },
                    { id: "su_sach", name: "Sách Lịch Sử" }
                ]
            },
            "Toán": {
                fullName: "Toán Học",
                icon: "📐",
                examFolderId: "Toán",
                supplies: [
                    { id: "toan_sach", name: "Sách Toán" },
                    { id: "toan_voso", name: "Vở Toán Số" },
                    { id: "toan_vohinh", name: "Vở Toán Hình" },
                    { id: "toan_decuong", name: "Đề cương Toán" },
                    { id: "toan_casio", name: "Máy tính Casio & thước kẻ" }
                ]
            },
            "Vật lý": {
                fullName: "Vật Lý",
                icon: "⚡",
                supplies: [
                    { id: "ly_sach", name: "Sách Vật Lý" },
                    { id: "ly_decuong", name: "Đề cương Vật Lý" },
                    { id: "ly_chuyende", name: "Chuyên đề Lý (khi thầy dặn)", optional: true }
                ]
            },
            "GD QP-AN": {
                fullName: "GD QP-AN",
                icon: "🎖️",
                examFolderId: "GDQP&AN",
                supplies: [
                    { id: "qpan_sach", name: "Sách GD QP-AN" }
                ]
            },
            "GDKTPL": {
                fullName: "GDKT & Pháp Luật",
                icon: "⚖️",
                examFolderId: "GDKT&PL",
                supplies: [
                    { id: "ktpl_sach", name: "Sách GDKTPL" },
                    { id: "ktpl_decuong", name: "Đề cương GDKTPL" }
                ]
            },
            "GDTC": {
                fullName: "Giáo Dục Thể Chất",
                icon: "🏸",
                supplies: [
                    { id: "gdtc_caulong", name: "2 quả cầu lông & 1 cây vợt", highlight: true },
                    { id: "gdtc_trangphuc", name: "Đồng phục thể dục & giày thể thao" }
                ]
            },
            "Địa Lý": {
                fullName: "Địa Lí",
                icon: "🌍",
                examFolderId: "Địa Lí",
                supplies: [
                    { id: "dia_sach", name: "Sách Địa Lí" },
                    { id: "dia_decuong", name: "Đề cương Địa Lí" }
                ]
            },
            "GD ĐP": {
                fullName: "GD Địa Phương",
                icon: "🏙️",
                supplies: [
                    { id: "gddp_tailieu", name: "Tài liệu / Vở GD Địa Phương" }
                ]
            },
            "HĐTN1": {
                fullName: "Hoạt Động Trải Nghiệm 1",
                icon: "🌱",
                supplies: [
                    { id: "hdtn1_so", name: "Sổ tay / Vở ghi HĐTN" }
                ]
            },
            "HĐTN2": {
                fullName: "Hoạt Động Trải Nghiệm 2",
                icon: "🌱",
                supplies: [
                    { id: "hdtn2_so", name: "Sổ tay / Vở ghi HĐTN" }
                ]
            },
            "SHC": {
                fullName: "Chào Cờ (SHC)",
                icon: "🚩",
                supplies: [
                    { id: "shc_dongphuc", name: "Lễ phục chào cờ & sổ tay" }
                ]
            }
        },

        days: {
            "T2": {
                code: "T2",
                short: "T2",
                name: "Thứ Hai",
                dayIndex: 1,
                morning: ["SHC", "HĐTN1", "Ngoại ngữ", "Ngoại ngữ", ""],
                afternoon: ["Ngữ văn", "Ngữ văn", "Tin học", "", ""],
                specialNote: "Chào cờ đầu tuần: mặc lễ phục chỉnh tề."
            },
            "T3": {
                code: "T3",
                short: "T3",
                name: "Thứ Ba",
                dayIndex: 2,
                morning: ["GD ĐP", "Ngoại ngữ", "TH MOS", "Lịch Sử", ""],
                afternoon: ["Toán", "Vật lý", "Vật lý", "", ""],
                specialNote: "Chiều có 2 tiết Vật lý — mang đủ sách & đề cương Lý."
            },
            "T4": {
                code: "T4",
                short: "T4",
                name: "Thứ Tư",
                dayIndex: 3,
                morning: ["Ngoại ngữ", "Ngoại ngữ", "HĐTN2", "HĐTN2", ""],
                afternoon: ["", "", "", "", ""],
                specialNote: "Buổi chiều nghỉ chính khóa — tranh thủ luyện đề trên Aseta."
            },
            "T5": {
                code: "T5",
                short: "T5",
                name: "Thứ Năm",
                dayIndex: 4,
                morning: ["Ngữ văn", "GD QP-AN", "Tin học", "GDKTPL", ""],
                afternoon: ["Toán", "Toán", "GDTC", "GDTC", ""],
                specialNote: "Chiều có 2 tiết GDTC — nhớ mang đồng phục thể dục & vợt/cầu."
            },
            "T6": {
                code: "T6",
                short: "T6",
                name: "Thứ Sáu",
                dayIndex: 5,
                morning: ["Ngữ văn", "Vật lý", "Toán", "Địa Lý", ""],
                afternoon: ["TH MOS", "GDKTPL", "Địa Lý", "", ""],
                specialNote: "Nhiều môn cuối tuần — kiểm tra đủ 6 môn trước khi đi học."
            },
            "T7": {
                code: "T7",
                short: "T7",
                name: "Thứ Bảy",
                dayIndex: 6,
                morning: ["", "", "", "", ""],
                afternoon: ["", "", "", "", ""],
                isOff: true,
                specialNote: "Thứ Bảy nghỉ chính khóa."
            },
            "CN": {
                code: "CN",
                short: "CN",
                name: "Chủ Nhật",
                dayIndex: 0,
                morning: ["", "", "", "", ""],
                afternoon: ["", "", "", "", ""],
                isOff: true,
                specialNote: "Chủ Nhật nghỉ ngơi — chuẩn bị balo cho Thứ Hai nhé."
            }
        }
    };

    let activeDayCode = null;
    let currentViewMode = 'day'; // 'day' | 'fullweek'
    let imageModalZoom = 1;

    function getAccountIdSafe() {
        try {
            if (window.AccountManager && typeof window.AccountManager.getCurrentAccountId === 'function') {
                return window.AccountManager.getCurrentAccountId() || 'default';
            }
        } catch (_) {}
        return 'default';
    }

    function getTodayInfo() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();

        const map = { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 0: "CN" };
        const dayNameMap = {
            "T2": "Thứ Hai", "T3": "Thứ Ba", "T4": "Thứ Tư",
            "T5": "Thứ Năm", "T6": "Thứ Sáu", "T7": "Thứ Bảy", "CN": "Chủ Nhật"
        };

        const todayCode = map[day] || "T2";
        const isWeekend = (day === 0 || day === 6);
        const isPackingTime = (hour === 16 && minute >= 15) || (hour >= 17) || (hour < 7);
        const tomorrowCode = map[(day + 1) % 7] || "T2";

        const pad = (n) => String(n).padStart(2, '0');
        return {
            now, day, hour, minute,
            todayCode,
            todayName: dayNameMap[todayCode],
            isWeekend,
            isPackingTime,
            isEvening: isPackingTime,
            tomorrowCode,
            tomorrowName: dayNameMap[tomorrowCode],
            formattedDate: `${dayNameMap[todayCode]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
            timeString: `${pad(hour)}:${pad(minute)}`
        };
    }

    function getCurrentPeriodId() {
        const info = getTodayInfo();
        if (info.isWeekend) return null;
        const m = info.hour * 60 + info.minute;
        if (m >= 420 && m < 465) return "S1";
        if (m >= 470 && m < 515) return "S2";
        if (m >= 540 && m < 585) return "S3";
        if (m >= 590 && m < 635) return "S4";
        if (m >= 640 && m < 685) return "S5";
        if (m >= 810 && m < 850) return "C1";
        if (m >= 855 && m < 895) return "C2";
        if (m >= 905 && m < 940) return "C3";
        if (m >= 940 && m < 975) return "C4";
        if (m >= 980 && m < 1025) return "C5";
        return null;
    }

    function getBackpackStorageKey(dayCode) {
        const d = new Date();
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `aseta_backpack_v2_${getAccountIdSafe()}_${dayCode}_${dateKey}`;
    }

    function getCheckedSupplies(dayCode) {
        try {
            const raw = localStorage.getItem(getBackpackStorageKey(dayCode));
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    function saveCheckedSupplies(dayCode, mapObj) {
        try {
            localStorage.setItem(getBackpackStorageKey(dayCode), JSON.stringify(mapObj));
        } catch (_) {}
    }

    function setSupplyChecked(dayCode, supplyId, isChecked) {
        const checkedMap = getCheckedSupplies(dayCode);
        if (isChecked) checkedMap[supplyId] = true;
        else delete checkedMap[supplyId];
        saveCheckedSupplies(dayCode, checkedMap);
    }

    function getSuppliesForDay(dayCode) {
        const dayData = TIMETABLE_CONFIG.days[dayCode];
        if (!dayData || dayData.isOff) return [];
        const allSubjects = [...dayData.morning, ...dayData.afternoon].filter(s => s && s.trim());
        const uniqueSubjects = [...new Set(allSubjects)];
        const out = [];
        uniqueSubjects.forEach(subKey => {
            const meta = TIMETABLE_CONFIG.subjectsMeta[subKey];
            if (meta && meta.supplies) {
                out.push({ subjectKey: subKey, subjectMeta: meta, supplies: meta.supplies });
            }
        });
        return out;
    }

    function resetBackpackChecklist(dayCode) {
        try {
            localStorage.removeItem(getBackpackStorageKey(dayCode));
            if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
            renderDayView(dayCode);
        } catch (_) {}
    }

    function checkAllBackpack(dayCode) {
        const groups = getSuppliesForDay(dayCode);
        const map = {};
        groups.forEach(g => g.supplies.forEach(s => { map[s.id] = true; }));
        saveCheckedSupplies(dayCode, map);
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
        if (window.confetti) {
            window.confetti({ particleCount: 45, spread: 55, origin: { y: 0.65 } });
        }
        renderDayView(dayCode);
    }

    // =========================================================================
    // MAIN RENDER (CLEAN EDITORIAL BENTO)
    // =========================================================================
    function render(container) {
        if (!container) return;
        container.innerHTML = "";

        const info = getTodayInfo();
        if (!activeDayCode) {
            if (info.isWeekend) activeDayCode = "T2";
            else if (info.isPackingTime && info.todayCode !== 'T6') activeDayCode = info.tomorrowCode;
            else activeDayCode = info.todayCode;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto space-y-4 pb-8 text-slate-900 dark:text-slate-100";

        const isDayMode = currentViewMode === 'day';
        const packingTarget = info.isWeekend ? "T2" : (info.todayCode === 'T6' ? "T2" : info.tomorrowCode);
        const packingHint = info.isPackingTime && isDayMode && activeDayCode === packingTarget
            ? `🌙 Giờ soạn cặp • Đang xem lịch ${TIMETABLE_CONFIG.days[activeDayCode].name}`
            : `Lớp ${TIMETABLE_CONFIG.className} • ${info.formattedDate}`;

        wrapper.innerHTML = `
            <!-- 1. ULTRA-CLEAN TOP BAR -->
            <div class="flex flex-wrap items-center justify-between gap-2.5">
                <div class="flex items-center gap-2.5 min-w-0">
                    <button type="button" onclick="AzotaApp.goBack()"
                            class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0">
                        ← Quay lại
                    </button>
                    <div class="min-w-0">
                        <h2 class="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                            Thời Khóa Biểu &amp; Balo
                        </h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${packingHint}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <div class="inline-flex p-1 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10">
                        <button type="button" onclick="window.TimetableEngine.switchViewMode('day')"
                                class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${isDayMode ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                            Theo ngày
                        </button>
                        <button type="button" onclick="window.TimetableEngine.switchViewMode('fullweek')"
                                class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${!isDayMode ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                            Cả tuần
                        </button>
                    </div>

                    <button type="button" onclick="window.TimetableEngine.openImageModal()"
                            class="px-3 py-2 rounded-2xl bg-white dark:bg-[#0e1017] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Xem ảnh chụp thời khóa biểu gốc">
                        <span>🖼️</span>
                        <span class="hidden sm:inline">Ảnh gốc</span>
                    </button>
                </div>
            </div>

            <!-- 2. COMPACT 5-DAY STRIP (FITS 1 ROW ON EVERY PHONE!) -->
            ${isDayMode ? `
                <div class="grid grid-cols-5 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    ${["T2", "T3", "T4", "T5", "T6"].map(code => {
                        const dObj = TIMETABLE_CONFIG.days[code];
                        const isSel = activeDayCode === code;
                        const isToday = info.todayCode === code;
                        const isTomorrow = info.isPackingTime && code === packingTarget && !isToday;
                        return `
                            <button type="button" onclick="window.TimetableEngine.selectDay('${code}')"
                                    class="relative py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                        isSel
                                            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md font-black'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-bold'
                                    }">
                                <div class="text-xs sm:text-sm leading-none">${dObj.short}</div>
                                <div class="text-[9px] sm:text-[10px] mt-1 leading-none opacity-70 truncate">
                                    ${isToday ? 'Hôm nay' : (isTomorrow ? 'Ngày mai' : dObj.name.replace('Thứ ', ''))}
                                </div>
                                ${isToday ? `<span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            ` : ''}

            <!-- 3. MAIN WORKSPACE -->
            <div id="timetableMainContentArea"></div>
        `;

        container.appendChild(wrapper);

        const contentArea = wrapper.querySelector("#timetableMainContentArea");
        if (currentViewMode === 'fullweek') {
            renderFullWeekView(contentArea);
        } else {
            renderDayView(activeDayCode, contentArea);
        }
    }

    // =========================================================================
    // DAY VIEW: CLEAN 2-PANE BENTO (SCHEDULE LEFT 7-COL | BACKPACK RIGHT 5-COL)
    // =========================================================================
    function renderDayView(dayCode, container) {
        const target = container || document.getElementById("timetableMainContentArea");
        if (!target) return;
        target.innerHTML = "";

        const dayData = TIMETABLE_CONFIG.days[dayCode] || TIMETABLE_CONFIG.days["T2"];
        const info = getTodayInfo();
        const isToday = info.todayCode === dayCode;
        const currentPeriod = isToday ? getCurrentPeriodId() : null;

        const morningPeriods = TIMETABLE_CONFIG.timeSlots.morning
            .map((slot, idx) => ({ slot, subject: dayData.morning[idx] || "" }))
            .filter(p => p.subject);
        const afternoonPeriods = TIMETABLE_CONFIG.timeSlots.afternoon
            .map((slot, idx) => ({ slot, subject: dayData.afternoon[idx] || "" }))
            .filter(p => p.subject);

        const daySupplies = getSuppliesForDay(dayCode);
        const checkedMap = getCheckedSupplies(dayCode);
        let totalItems = 0;
        let checkedCount = 0;
        daySupplies.forEach(g => g.supplies.forEach(item => {
            totalItems++;
            if (checkedMap[item.id]) checkedCount++;
        }));
        const percent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 100;

        function buildPeriodRowHtml(p) {
            const meta = TIMETABLE_CONFIG.subjectsMeta[p.subject] || { fullName: p.subject, icon: "📚" };
            const isOngoing = currentPeriod === p.slot.id;
            const actionBtn = p.subject === "Ngoại ngữ"
                ? `<button type="button" onclick="if(window.VocabHub){window.VocabHub.openOralTest();}else if(window.AzotaApp&&window.AzotaApp.openOralTest){window.AzotaApp.openOralTest();}"
                           class="px-2.5 py-1 rounded-xl text-[11px] font-black bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/25 transition-colors cursor-pointer shrink-0">
                       Khảo bài ➔
                   </button>`
                : (meta.examFolderId
                    ? `<button type="button" onclick="window.AzotaApp.openFileExplorer('${meta.examFolderId}')"
                               class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-white/[0.05] hover:bg-sky-500/15 text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-300 transition-colors cursor-pointer shrink-0">
                           Ôn bài
                       </button>`
                    : '');

            return `
                <div class="flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl border transition-colors ${
                    isOngoing
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/[0.06]'
                }">
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black font-mono shrink-0 ${
                            isOngoing
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-white dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10'
                        }">${p.slot.id}</span>
                        <span class="text-lg leading-none shrink-0 flex items-center">${meta.icon}</span>
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="text-sm font-black text-slate-900 dark:text-white truncate">${meta.fullName}</span>
                                ${isOngoing ? '<span class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 shrink-0">Đang học</span>' : ''}
                            </div>
                            <div class="text-[11px] font-mono text-slate-400">${p.slot.time}</div>
                        </div>
                    </div>
                    ${actionBtn}
                </div>
            `;
        }

        const gridEl = document.createElement("div");
        gridEl.className = "grid grid-cols-1 lg:grid-cols-12 gap-4 items-start";

        // LEFT PANE (7 cols): CLEAN SCHEDULE CARD
        const leftPane = document.createElement("div");
        leftPane.className = "lg:col-span-7 bento-card-enter rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-sm";
        leftPane.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Lịch Học • ${TIMETABLE_CONFIG.className}</p>
                    <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">${dayData.name}</h3>
                </div>
                <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    ${morningPeriods.length + afternoonPeriods.length} tiết
                </span>
            </div>

            <!-- Buổi Sáng -->
            <div class="space-y-2">
                <div class="flex items-center justify-between px-1">
                    <span class="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">🌅 Buổi Sáng</span>
                    <span class="text-[11px] font-mono text-slate-400">07:00 – 10:35</span>
                </div>
                <div class="space-y-2">
                    ${morningPeriods.map(buildPeriodRowHtml).join('')}
                </div>
            </div>

            <!-- Buổi Chiều -->
            <div class="space-y-2 pt-3 border-t border-slate-200/70 dark:border-white/[0.08]">
                <div class="flex items-center justify-between px-1">
                    <span class="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">🌇 Buổi Chiều</span>
                    <span class="text-[11px] font-mono text-slate-400">${afternoonPeriods.length > 0 ? '13:30 – 16:15' : 'Nghỉ'}</span>
                </div>
                ${afternoonPeriods.length > 0
                    ? `<div class="space-y-2">${afternoonPeriods.map(buildPeriodRowHtml).join('')}</div>`
                    : `<div class="py-4 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs font-semibold text-slate-400">☕ Buổi chiều nghỉ học chính khóa</div>`
                }
            </div>

            ${dayData.specialNote ? `
                <div class="px-3.5 py-2.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <span>📌</span>
                    <span>${dayData.specialNote}</span>
                </div>
            ` : ''}
        `;
        gridEl.appendChild(leftPane);

        // RIGHT PANE (5 cols): HIGH-CONTRAST BACKPACK CHECKLIST
        const rightPane = document.createElement("div");
        rightPane.className = "lg:col-span-5 space-y-3";

        // 1. High-Contrast Progress Header Card
        const progressCard = document.createElement("div");
        progressCard.className = "bento-card-enter relative overflow-hidden rounded-3xl bg-slate-950 text-white dark:bg-[#f4f5f7] dark:text-slate-950 p-5 shadow-lg border border-slate-800 dark:border-white/40 space-y-3";
        progressCard.innerHTML = `
            <div class="bento-hatch-overlay"></div>
            <div class="relative z-10 flex items-center justify-between gap-2">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest opacity-60">🎒 Balo Đi Học</span>
                    <h3 class="text-lg font-black tracking-tight mt-0.5">${dayData.name}</h3>
                </div>
                <div class="text-right">
                    <div id="backpackProgressPct" class="text-3xl font-black font-mono leading-none">${percent}%</div>
                    <div id="backpackProgressText" class="text-[11px] font-bold opacity-65 mt-0.5">${checkedCount}/${totalItems} món</div>
                </div>
            </div>

            <div class="relative z-10 space-y-2">
                <div class="bento-shimmer-track w-full h-2.5 rounded-full bg-white/15 dark:bg-slate-950/10 overflow-hidden">
                    <div id="backpackProgressBarFill" class="h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-white dark:bg-slate-950'}" style="width: ${percent}%"></div>
                </div>
                <div class="flex items-center justify-between gap-2 pt-0.5">
                    <span id="backpackSuccessBadge" class="text-[11px] font-bold ${percent === 100 ? 'text-emerald-400 dark:text-emerald-600' : 'opacity-65'}">
                        ${percent === 100 ? '✓ Đã soạn đủ 100%!' : 'Chạm từng mục để đánh dấu'}
                    </span>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="window.TimetableEngine.checkAllBackpack('${dayCode}')"
                                class="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-slate-950/10 dark:hover:bg-slate-950/20 text-[10px] font-black transition-colors cursor-pointer">
                            ✓ Đủ hết
                        </button>
                        <button type="button" onclick="window.TimetableEngine.resetBackpackChecklist('${dayCode}')"
                                class="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-slate-950/10 dark:hover:bg-slate-950/20 text-[10px] font-bold opacity-80 hover:opacity-100 transition-colors cursor-pointer">
                            ↺ Reset
                        </button>
                    </div>
                </div>
            </div>
        `;
        rightPane.appendChild(progressCard);

        // 2. Clean Grouped Checklist Card
        const listCard = document.createElement("div");
        listCard.className = "bento-card-enter rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 space-y-3.5 shadow-sm";
        listCard.innerHTML = `<div id="backpackSuppliesList" class="space-y-3.5"></div>`;

        const listEl = listCard.querySelector("#backpackSuppliesList");

        function refreshProgressUI() {
            const curMap = getCheckedSupplies(dayCode);
            let curCount = 0;
            daySupplies.forEach(g => g.supplies.forEach(s => { if (curMap[s.id]) curCount++; }));
            const curPct = totalItems > 0 ? Math.round((curCount / totalItems) * 100) : 100;

            const pctEl = progressCard.querySelector("#backpackProgressPct");
            const txtEl = progressCard.querySelector("#backpackProgressText");
            const barEl = progressCard.querySelector("#backpackProgressBarFill");
            const msgEl = progressCard.querySelector("#backpackSuccessBadge");

            if (pctEl) pctEl.textContent = `${curPct}%`;
            if (txtEl) txtEl.textContent = `${curCount}/${totalItems} món`;
            if (barEl) {
                barEl.style.width = `${curPct}%`;
                barEl.className = `h-full rounded-full transition-all duration-300 ${curPct === 100 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-white dark:bg-slate-950'}`;
            }
            if (msgEl) {
                msgEl.textContent = curPct === 100 ? '✓ Đã soạn đủ 100%!' : 'Chạm từng mục để đánh dấu';
                msgEl.className = `text-[11px] font-bold ${curPct === 100 ? 'text-emerald-400 dark:text-emerald-600' : 'opacity-65'}`;
            }
            return { curCount, curPct };
        }

        if (daySupplies.length === 0) {
            listEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Không có đồ dùng cần mang trong ngày nghỉ.</p>`;
        } else {
            daySupplies.forEach(grp => {
                const sec = document.createElement("div");
                sec.className = "space-y-1.5";

                const hdr = document.createElement("div");
                hdr.className = "flex items-center gap-1.5 px-1 text-[11px] font-black uppercase tracking-wider text-slate-400";
                hdr.innerHTML = `<span class="text-sm leading-none">${grp.subjectMeta.icon}</span><span>${grp.subjectMeta.fullName}</span>`;
                sec.appendChild(hdr);

                grp.supplies.forEach(item => {
                    let isChecked = !!checkedMap[item.id];
                    const btn = document.createElement("button");
                    btn.type = "button";
                    const applyItemStyle = () => {
                        btn.className = `w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-2xl border text-left transition-all active:scale-[0.99] cursor-pointer ${
                            isChecked
                                ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-slate-400 dark:text-slate-500'
                                : 'bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border-slate-200/70 dark:border-white/[0.07] text-slate-800 dark:text-slate-100'
                        }`;
                        btn.innerHTML = `
                            <span class="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border transition-all ${
                                isChecked
                                    ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                    : 'border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04]'
                            }">${isChecked ? '✓' : ''}</span>
                            <span class="flex-1 text-xs sm:text-[13px] font-bold leading-snug ${isChecked ? 'line-through opacity-75' : ''}">
                                ${item.name}
                                ${item.optional ? '<span class="ml-1 text-[10px] font-bold text-amber-500 no-underline">(tùy chọn)</span>' : ''}
                                ${item.highlight ? '<span class="ml-1 text-[10px] font-black text-orange-500 no-underline">• Quan trọng</span>' : ''}
                            </span>
                        `;
                    };
                    applyItemStyle();

                    btn.onclick = () => {
                        isChecked = !isChecked;
                        setSupplyChecked(dayCode, item.id, isChecked);
                        applyItemStyle();
                        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
                        const { curCount } = refreshProgressUI();
                        if (isChecked && totalItems > 0 && curCount === totalItems && window.confetti) {
                            window.confetti({ particleCount: 45, spread: 55, origin: { y: 0.65 } });
                        }
                    };
                    sec.appendChild(btn);
                });

                listEl.appendChild(sec);
            });
        }

        const footerHint = document.createElement("div");
        footerHint.className = "pt-2.5 border-t border-slate-200/70 dark:border-white/[0.08] text-[11px] text-slate-400 flex items-center justify-between gap-2";
        footerHint.innerHTML = `<span>💡 Luôn mang: Bút, thước, Casio, bình nước</span>`;
        listCard.appendChild(footerHint);

        rightPane.appendChild(listCard);
        gridEl.appendChild(rightPane);
        target.appendChild(gridEl);
    }

    // =========================================================================
    // FULL WEEK VIEW (CLEAN EDITORIAL MATRIX — CLICK ANY DAY HEADER TO PACK!)
    // =========================================================================
    function renderFullWeekView(container) {
        const target = container || document.getElementById("timetableMainContentArea");
        if (!target) return;
        target.innerHTML = "";

        const info = getTodayInfo();
        const daysList = ["T2", "T3", "T4", "T5", "T6"];
        const slotsM = TIMETABLE_CONFIG.timeSlots.morning.slice(0, 4);
        const slotsA = TIMETABLE_CONFIG.timeSlots.afternoon.slice(0, 4);

        const buildRows = (slots, key, label, accent) => slots.map((slot, sIdx) => `
            <tr class="border-t border-slate-100 dark:border-white/[0.06]">
                ${sIdx === 0 ? `<td rowspan="${slots.length}" class="px-2 py-2 text-center font-black text-[10px] uppercase tracking-widest ${accent} border-r border-slate-100 dark:border-white/[0.06]">${label}</td>` : ''}
                <td class="px-2 py-2.5 text-center font-mono text-[11px] font-bold text-slate-400 border-r border-slate-100 dark:border-white/[0.06]">${slot.id}</td>
                ${daysList.map(code => {
                    const subj = TIMETABLE_CONFIG.days[code][key][sIdx] || "";
                    const meta = TIMETABLE_CONFIG.subjectsMeta[subj];
                    const isToday = info.todayCode === code;
                    return `
                        <td class="px-2 py-2.5 text-center ${isToday ? 'bg-sky-500/[0.05]' : ''}">
                            ${subj ? `
                                <span class="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                                    <span>${meta ? meta.icon : ''}</span>
                                    <span>${subj}</span>
                                </span>
                            ` : '<span class="text-slate-300 dark:text-slate-700 text-xs">—</span>'}
                        </td>
                    `;
                }).join('')}
            </tr>
        `).join('');

        target.innerHTML = `
            <div class="bento-card-enter rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse min-w-[640px]">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-white/[0.03] text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th class="py-3 px-2 w-14 border-r border-slate-100 dark:border-white/[0.06]">Buổi</th>
                                <th class="py-3 px-2 w-12 border-r border-slate-100 dark:border-white/[0.06]">Tiết</th>
                                ${daysList.map(code => {
                                    const dObj = TIMETABLE_CONFIG.days[code];
                                    const isToday = info.todayCode === code;
                                    return `
                                        <th class="py-3 px-2 ${isToday ? 'text-sky-500 bg-sky-500/[0.06]' : ''}">
                                            <button type="button" onclick="window.TimetableEngine.selectDay('${code}')"
                                                    class="hover:text-sky-500 transition-colors cursor-pointer inline-flex items-center gap-1">
                                                <span>${dObj.name}</span>
                                                ${isToday ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>' : ''}
                                            </button>
                                        </th>
                                    `;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${buildRows(slotsM, 'morning', 'Sáng', 'text-sky-500 bg-sky-500/[0.05]')}
                            ${buildRows(slotsA, 'afternoon', 'Chiều', 'text-amber-500 bg-amber-500/[0.05]')}
                        </tbody>
                    </table>
                </div>
                <div class="px-4 py-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span>💡 Bấm vào tên Thứ trên bảng để mở Balo soạn cặp của ngày đó.</span>
                    <button type="button" onclick="window.TimetableEngine.openImageModal()"
                            class="text-sky-500 hover:text-sky-400 font-bold cursor-pointer">
                        Xem ảnh TKB gốc ↗
                    </button>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // FULLSCREEN LIGHTBOX MODAL CHO ẢNH TKB GỐC
    // =========================================================================
    function openImageModal() {
        let modal = document.getElementById("timetableImageModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "timetableImageModal";
            modal.className = "fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none";
            modal.innerHTML = `
                <div class="w-full max-w-5xl flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                    <div class="text-white">
                        <div class="font-black text-sm sm:text-base">${TIMETABLE_CONFIG.schoolName} • ${TIMETABLE_CONFIG.className}</div>
                        <div class="text-[11px] text-slate-400">${TIMETABLE_CONFIG.semester} • GVCN: ${TIMETABLE_CONFIG.homeroomTeacher}</div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="window.TimetableEngine.zoomImage(0.25)" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer">+</button>
                        <button type="button" onclick="window.TimetableEngine.zoomImage(-0.25)" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer">−</button>
                        <button type="button" onclick="window.TimetableEngine.resetZoom()" class="px-2.5 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer">100%</button>
                        <a href="${TIMETABLE_CONFIG.imageUrl}" download="Thoi_Khoa_Bieu_11A7.jpg" class="px-3 h-9 rounded-xl bg-white text-slate-950 text-xs font-black flex items-center gap-1">📥 Tải</a>
                        <button type="button" onclick="window.TimetableEngine.closeImageModal()" class="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black cursor-pointer">✕</button>
                    </div>
                </div>
                <div class="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-3" onclick="if(event.target===this) window.TimetableEngine.closeImageModal()">
                    <img id="timetableModalImg" src="${TIMETABLE_CONFIG.imageUrl}" alt="Thời khóa biểu 11A7" class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200">
                </div>
            `;
            document.body.appendChild(modal);
            window.addEventListener("keydown", function(e) {
                if (e.key === "Escape") window.TimetableEngine.closeImageModal();
            });
        }
        imageModalZoom = 1;
        const img = document.getElementById("timetableModalImg");
        if (img) img.style.transform = "scale(1)";
        modal.classList.remove("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeImageModal() {
        const modal = document.getElementById("timetableImageModal");
        if (modal) {
            modal.classList.add("hidden");
            modal.style.display = "none";
        }
        document.body.style.overflow = "";
    }

    function zoomImage(delta) {
        imageModalZoom = Math.max(0.6, Math.min(3, imageModalZoom + delta));
        const img = document.getElementById("timetableModalImg");
        if (img) img.style.transform = `scale(${imageModalZoom})`;
    }

    function resetZoom() {
        imageModalZoom = 1;
        const img = document.getElementById("timetableModalImg");
        if (img) img.style.transform = "scale(1)";
    }

    // =========================================================================
    // MINI BANNER CHO TRANG KHO ĐỀ (CLEAN EDITORIAL STRIP)
    // =========================================================================
    function renderMiniBanner(container) {
        if (!container) return;
        container.innerHTML = "";
        const info = getTodayInfo();
        const dayData = TIMETABLE_CONFIG.days[info.todayCode];
        const summary = info.isWeekend
            ? "Cuối tuần nghỉ chính khóa • Chuẩn bị bài cho Thứ Hai"
            : `Sáng: ${dayData.morning.filter(Boolean).join(", ") || "Nghỉ"} • Chiều: ${dayData.afternoon.filter(Boolean).join(", ") || "Nghỉ"}`;

        const banner = document.createElement("div");
        banner.className = "mb-5 px-4 py-3 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap";
        banner.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <span class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-base shrink-0">🎒</span>
                <div class="min-w-0">
                    <div class="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>${info.isWeekend ? `Cuối tuần (${info.todayName})` : `Hôm nay • ${info.todayName}`}</span>
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${summary}</p>
                </div>
            </div>
            <button type="button" onclick="window.AzotaApp.openTimetable()"
                    class="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-black transition-colors cursor-pointer shrink-0">
                Soạn cặp ➔
            </button>
        `;
        container.appendChild(banner);
    }

    return {
        render: render,
        renderMiniBanner: renderMiniBanner,
        renderDayView: renderDayView,
        renderFullWeekView: renderFullWeekView,
        openImageModal: openImageModal,
        closeImageModal: closeImageModal,
        zoomImage: zoomImage,
        resetZoom: resetZoom,
        resetBackpackChecklist: resetBackpackChecklist,
        checkAllBackpack: checkAllBackpack,
        switchViewMode: function(mode, dayCode) {
            currentViewMode = mode;
            if (dayCode) activeDayCode = dayCode;
            const container = document.getElementById("explorerContentArea");
            if (container) render(container);
        },
        selectDay: function(dayCode) {
            currentViewMode = 'day';
            activeDayCode = dayCode;
            const container = document.getElementById("explorerContentArea");
            if (container) render(container);
        },
        getTodayInfo: getTodayInfo,
        CONFIG: TIMETABLE_CONFIG
    };
})();
