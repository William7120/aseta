/**
 * Aseta Timetable Engine (Thời Khóa Biểu & Balo Học Tập Lớp 11A7)
 * Trường THPT Trần Văn Giàu - Học Kỳ 1 (Áp dụng từ 09/11/2026)
 * GVCN: Nguyễn Việt Kiều Anh
 * Tự động nhận diện thứ ngày hôm nay, hiển thị lịch học và checklist đồ dùng cần mang.
 */

window.TimetableEngine = (function() {
    'use strict';

    // 1. DỮ LIỆU THỜI KHÓA BIỂU & ĐỒ DÙNG CẦN MANG
    const TIMETABLE_CONFIG = {
        schoolName: "Trường THPT Trần Văn Giàu",
        className: "11A7",
        semester: "Học Kỳ 1 (Áp dụng từ 09/11/2026)",
        homeroomTeacher: "Nguyễn Việt Kiều Anh",
        
        // Khung giờ các tiết học chuẩn THPT
        timeSlots: {
            morning: [
                { id: "S1", label: "Tiết 1", time: "07:00 - 07:45" },
                { id: "S2", label: "Tiết 2", time: "07:45 - 08:30" },
                { id: "S3", label: "Tiết 3", time: "08:50 - 09:35" },
                { id: "S4", label: "Tiết 4", time: "09:35 - 10:20" },
                { id: "S5", label: "Tiết 5", time: "10:20 - 11:05" }
            ],
            afternoon: [
                { id: "C1", label: "Tiết 1", time: "13:00 - 13:45" },
                { id: "C2", label: "Tiết 2", time: "13:45 - 14:30" },
                { id: "C3", label: "Tiết 3", time: "14:50 - 15:35" },
                { id: "C4", label: "Tiết 4", time: "15:35 - 16:20" },
                { id: "C5", label: "Tiết 5", time: "16:20 - 17:05" }
            ]
        },

        // Danh sách đồ dùng đi học theo từng môn (Trích từ Danh_sach_do_dung_di_hoc.txt)
        subjectsMeta: {
            "Ngoại ngữ": {
                fullName: "Ngoại Ngữ (Tiếng Anh)",
                icon: "🇬🇧",
                color: "blue",
                badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                examFolderId: "anh-11",
                supplies: [
                    { id: "nn_decuong", name: "Đề cương tiếng Anh", type: "decuong" },
                    { id: "nn_sach", name: "Sách tiếng Anh", type: "sach" }
                ]
            },
            "Ngữ văn": {
                fullName: "Ngữ Văn",
                icon: "📖",
                color: "rose",
                badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
                examFolderId: "van-11",
                supplies: [
                    { id: "van_decuong", name: "Đề cương Văn", type: "decuong" },
                    { id: "van_sach", name: "Sách Văn", type: "sach" },
                    { id: "van_vo", name: "Vở Văn", type: "vo" },
                    { id: "van_chuyende", name: "Chuyên đề Văn (nếu cô yêu cầu mang)", type: "chuyende", optional: true }
                ]
            },
            "Tin học": {
                fullName: "Tin Học",
                icon: "💻",
                color: "cyan",
                badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
                examFolderId: "th-11",
                supplies: [
                    { id: "tin_decuong", name: "Đề cương Tin", type: "decuong" },
                    { id: "tin_sach", name: "Sách Tin", type: "sach" }
                ]
            },
            "TH MOS": {
                fullName: "Thực Hành Tin Học MOS",
                icon: "🖥️",
                color: "indigo",
                badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
                supplies: [
                    { id: "mos_decuong", name: "Đề cương MOS", type: "decuong" }
                ]
            },
            "Lịch Sử": {
                fullName: "Lịch Sử",
                icon: "🏛️",
                color: "amber",
                badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                examFolderId: "su-11",
                supplies: [
                    { id: "su_decuong", name: "Đề cương Sử", type: "decuong" },
                    { id: "su_sach", name: "Sách Sử", type: "sach" }
                ]
            },
            "Toán": {
                fullName: "Toán Học",
                icon: "📐",
                color: "emerald",
                badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                examFolderId: "tuluan",
                supplies: [
                    { id: "toan_sach", name: "Sách Toán", type: "sach" },
                    { id: "toan_voso", name: "Vở Toán Số", type: "vo" },
                    { id: "toan_vohinh", name: "Vở Toán Hình", type: "vo" },
                    { id: "toan_decuong", name: "Đề cương Toán", type: "decuong" },
                    { id: "toan_casio", name: "Máy tính Casio FX & thước kẻ", type: "dungcu" }
                ]
            },
            "Vật lý": {
                fullName: "Vật Lý",
                icon: "⚡",
                color: "violet",
                badgeClass: "bg-violet-500/15 text-violet-400 border-violet-500/30",
                examFolderId: "ly-11",
                supplies: [
                    { id: "ly_sach", name: "Sách Lý", type: "sach" },
                    { id: "ly_decuong", name: "Đề cương Lý", type: "decuong" },
                    { id: "ly_chuyende", name: "Chuyên đề Lý (nếu thầy yêu cầu mang)", type: "chuyende", optional: true }
                ]
            },
            "GD QP-AN": {
                fullName: "Giáo Dục Quốc Phòng - An Ninh",
                icon: "🎖️",
                color: "lime",
                badgeClass: "bg-lime-500/15 text-lime-400 border-lime-500/30",
                examFolderId: "qp-11",
                supplies: [
                    { id: "qpan_sach", name: "Sách GD QP-AN", type: "sach" }
                ]
            },
            "GDKTPL": {
                fullName: "Giáo Dục Kinh Tế & Pháp Luật",
                icon: "⚖️",
                color: "purple",
                badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
                examFolderId: "gdktpl-11",
                supplies: [
                    { id: "ktpl_sach", name: "Sách GDKTPL", type: "sach" },
                    { id: "ktpl_decuong", name: "Đề cương GDKTPL", type: "decuong" }
                ]
            },
            "GDTC": {
                fullName: "Giáo Dục Thể Chất",
                icon: "🏸",
                color: "orange",
                badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
                supplies: [
                    { id: "gdtc_caulong", name: "2 quả cầu lông & 1 cây vợt (nếu học cầu lông)", type: "dungcu", highlight: true },
                    { id: "gdtc_trangphuc", name: "Đồng phục thể dục & giày thể thao", type: "trangphuc" }
                ]
            },
            "Địa Lý": {
                fullName: "Địa Lí",
                icon: "🌍",
                color: "teal",
                badgeClass: "bg-teal-500/15 text-teal-400 border-teal-500/30",
                examFolderId: "dia-11",
                supplies: [
                    { id: "dia_sach", name: "Sách Địa", type: "sach" },
                    { id: "dia_decuong", name: "Đề cương Địa", type: "decuong" }
                ]
            },
            "GD ĐP": {
                fullName: "Giáo Dục Địa Phương",
                icon: "🏙️",
                color: "amber",
                badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                supplies: [
                    { id: "gddp_tailieu", name: "Tài liệu / Vở ghi GD Địa Phương", type: "vo" }
                ]
            },
            "HĐTN1": {
                fullName: "Hoạt Động Trải Nghiệm 1",
                icon: "🌱",
                color: "green",
                badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
                supplies: [
                    { id: "hdtn1_so", name: "Sổ tay hoạt động trải nghiệm / vở ghi chép", type: "vo" }
                ]
            },
            "HĐTN2": {
                fullName: "Hoạt Động Trải Nghiệm 2",
                icon: "🌱",
                color: "green",
                badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
                supplies: [
                    { id: "hdtn2_so", name: "Sổ tay hoạt động trải nghiệm / vở ghi chép", type: "vo" }
                ]
            },
            "SHC": {
                fullName: "Sinh Hoạt Dưới Cờ (Chào Cờ)",
                icon: "🚩",
                color: "red",
                badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
                supplies: [
                    { id: "shc_dongphuc", name: "Lễ phục chào cờ nghiêm trang, sổ tay ghi chép sinh hoạt", type: "trangphuc" }
                ]
            }
        },

        // Lịch học chi tiết từng ngày trong tuần
        days: {
            "T2": {
                code: "T2",
                name: "Thứ Hai",
                dayIndex: 1,
                morning: ["SHC", "HĐTN1", "Ngoại ngữ", "Ngoại ngữ", ""],
                afternoon: ["Ngữ văn", "Ngữ văn", "Tin học", "", ""],
                specialNote: "🚩 Chào cờ đầu tuần: Mặc đồng phục lễ phục chỉnh tề và ghi chép hoạt động sinh hoạt lớp."
            },
            "T3": {
                code: "T3",
                name: "Thứ Ba",
                dayIndex: 2,
                morning: ["GD ĐP", "Ngoại ngữ", "TH MOS", "Lịch Sử", ""],
                afternoon: ["Toán", "Vật lý", "Vật lý", "", ""],
                specialNote: "⚡ Chiều có 2 tiết Vật lý: Nhớ mang sách, vở bài tập và đề cương Lý (chỉ mang chuyên đề khi thầy dặn)."
            },
            "T4": {
                code: "T4",
                name: "Thứ Tư",
                dayIndex: 3,
                morning: ["Ngoại ngữ", "Ngoại ngữ", "HĐTN2", "HĐTN2", ""],
                afternoon: ["", "", "", "", ""],
                specialNote: "🎉 Buổi chiều nghỉ học chính khóa! Tranh thủ tự học hoặc luyện giải đề trên Aseta."
            },
            "T5": {
                code: "T5",
                name: "Thứ Năm",
                dayIndex: 4,
                morning: ["Ngữ văn", "GD QP-AN", "Tin học", "GDKTPL", ""],
                afternoon: ["Toán", "Toán", "GDTC", "GDTC", ""],
                specialNote: "🏸 Lưu ý GDTC: Chiều có 2 tiết Thể dục, nếu học cầu lông nhớ mang 2 quả cầu và 1 cây vợt!"
            },
            "T6": {
                code: "T6",
                name: "Thứ Sáu",
                dayIndex: 5,
                morning: ["Ngữ văn", "Vật lý", "Toán", "Địa Lý", ""],
                afternoon: ["TH MOS", "GDKTPL", "Địa Lý", "", ""],
                specialNote: "📖 Ngày học cuối tuần: Có cả Văn, Lý, Toán, Địa, MOS và KTPL. Kiểm tra kỹ balo trước khi đến lớp!"
            },
            "T7": {
                code: "T7",
                name: "Thứ Bảy",
                dayIndex: 6,
                morning: ["", "", "", "", ""],
                afternoon: ["", "", "", "", ""],
                isOff: true,
                specialNote: "🌴 Thứ Bảy nghỉ học chính khóa. Tự ôn tập kiến thức và làm đề thi online."
            },
            "CN": {
                code: "CN",
                name: "Chủ Nhật",
                dayIndex: 0,
                morning: ["", "", "", "", ""],
                afternoon: ["", "", "", "", ""],
                isOff: true,
                specialNote: "☀️ Chủ Nhật nghỉ ngơi nạp năng lượng! Đừng quên soạn sách vở cho Thứ Hai đầu tuần nhé."
            }
        }
    };

    // State
    let activeDayCode = null; // T2, T3, T4, T5, T6, or 'ALL'
    let currentViewMode = 'day'; // 'day' or 'fullweek'

    // 2. HÀM TỰ ĐỘNG NHẬN DIỆN THỜI GIAN & THỨ HÔM NAY
    function getTodayInfo() {
        const now = new Date();
        const day = now.getDay(); // 0: CN, 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7
        const hour = now.getHours();
        const minute = now.getMinutes();

        const map = { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 0: "CN" };
        const dayNameMap = {
            "T2": "Thứ Hai",
            "T3": "Thứ Ba",
            "T4": "Thứ Tư",
            "T5": "Thứ Năm",
            "T6": "Thứ Sáu",
            "T7": "Thứ Bảy",
            "CN": "Chủ Nhật"
        };

        const todayCode = map[day] || "T2";
        const isWeekend = (day === 0 || day === 6);
        const isEvening = (hour >= 18);

        // Tính ngày mai
        const nextDayIdx = (day + 1) % 7;
        const tomorrowCode = map[nextDayIdx] || "T2";

        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${dayNameMap[todayCode]}, ngày ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
        const timeString = `${pad(hour)}:${pad(minute)}`;

        return {
            now,
            day,
            hour,
            minute,
            todayCode,
            todayName: dayNameMap[todayCode],
            isWeekend,
            isEvening,
            tomorrowCode,
            tomorrowName: dayNameMap[tomorrowCode],
            formattedDate,
            timeString
        };
    }

    // Xác định tiết học đang diễn ra trong ngày hiện tại (nếu đang trong giờ học)
    function getCurrentPeriodId() {
        const info = getTodayInfo();
        if (info.isWeekend) return null;

        const currentMinutes = info.hour * 60 + info.minute;

        // Morning periods
        if (currentMinutes >= 7 * 60 && currentMinutes < 7 * 60 + 45) return "S1";
        if (currentMinutes >= 7 * 60 + 45 && currentMinutes < 8 * 60 + 30) return "S2";
        if (currentMinutes >= 8 * 60 + 50 && currentMinutes < 9 * 60 + 35) return "S3";
        if (currentMinutes >= 9 * 60 + 35 && currentMinutes < 10 * 60 + 20) return "S4";
        if (currentMinutes >= 10 * 60 + 20 && currentMinutes < 11 * 60 + 5) return "S5";

        // Afternoon periods
        if (currentMinutes >= 13 * 60 && currentMinutes < 13 * 60 + 45) return "C1";
        if (currentMinutes >= 13 * 60 + 45 && currentMinutes < 14 * 60 + 30) return "C2";
        if (currentMinutes >= 14 * 60 + 50 && currentMinutes < 15 * 60 + 35) return "C3";
        if (currentMinutes >= 15 * 60 + 35 && currentMinutes < 16 * 60 + 20) return "C4";
        if (currentMinutes >= 16 * 60 + 20 && currentMinutes < 17 * 60 + 5) return "C5";

        return null;
    }

    // 3. QUẢN LÝ CHECKLIST BALO HỌC SINH (LOCALSTORAGE PERSISTENCE)
    function getBackpackStorageKey(dayCode) {
        const todayStr = new Date().toISOString().slice(0, 10);
        return `aseta_backpack_checked_${dayCode}_${todayStr}`;
    }

    function getCheckedSupplies(dayCode) {
        try {
            const raw = localStorage.getItem(getBackpackStorageKey(dayCode));
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function setSupplyChecked(dayCode, supplyId, isChecked) {
        try {
            const checkedMap = getCheckedSupplies(dayCode);
            if (isChecked) {
                checkedMap[supplyId] = true;
            } else {
                delete checkedMap[supplyId];
            }
            localStorage.setItem(getBackpackStorageKey(dayCode), JSON.stringify(checkedMap));
        } catch (e) {
            console.error("Lỗi lưu checklist:", e);
        }
    }

    function resetBackpackChecklist(dayCode) {
        try {
            localStorage.removeItem(getBackpackStorageKey(dayCode));
            if (window.AudioHelper && window.AudioHelper.playPlip) {
                window.AudioHelper.playPlip();
            }
            renderDayView(dayCode);
        } catch (e) {
            console.error(e);
        }
    }

    // Tổng hợp tất cả đồ dùng cần mang của một ngày từ các môn học
    function getSuppliesForDay(dayCode) {
        const dayData = TIMETABLE_CONFIG.days[dayCode];
        if (!dayData || dayData.isOff) return [];

        const allPeriodSubjects = [...dayData.morning, ...dayData.afternoon].filter(s => s && s.trim());
        const uniqueSubjects = [...new Set(allPeriodSubjects)];

        const aggregated = [];
        uniqueSubjects.forEach(subKey => {
            const meta = TIMETABLE_CONFIG.subjectsMeta[subKey];
            if (meta && meta.supplies) {
                aggregated.push({
                    subjectKey: subKey,
                    subjectMeta: meta,
                    supplies: meta.supplies
                });
            }
        });

        return aggregated;
    }

    // 4. GIAO DIỆN CHÍNH
    function render(container) {
        if (!container) return;
        container.innerHTML = "";

        const info = getTodayInfo();

        // Tự động chọn ngày nếu chưa chọn:
        // Nếu là cuối tuần (T7, CN), mặc định gợi ý T2 (Thứ Hai) để chuẩn bị bài
        if (!activeDayCode) {
            if (info.isWeekend) {
                activeDayCode = "T2";
            } else {
                activeDayCode = info.todayCode;
            }
        }

        const wrapper = document.createElement("div");
        wrapper.className = "py-6 px-3 sm:px-6 max-w-5xl mx-auto space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100";

        // A. HEADER TRANG THỜI KHÓA BIỂU
        const headerEl = document.createElement("div");
        headerEl.className = "p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-sky-600/15 via-indigo-600/15 to-purple-600/15 border border-sky-500/25 backdrop-blur-xl relative overflow-hidden shadow-xl";
        headerEl.innerHTML = `
            <div class="absolute -right-8 -bottom-8 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-2">
                    <div class="flex items-center flex-wrap gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                            <span>${TIMETABLE_CONFIG.className} • ${TIMETABLE_CONFIG.schoolName}</span>
                        </span>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            GVCN: ${TIMETABLE_CONFIG.homeroomTeacher}
                        </span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <span>📅 Thời Khóa Biểu &amp; Balo Đi Học</span>
                    </h1>
                    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sky-600 dark:text-sky-400">🕒 Hôm nay: ${info.formattedDate}</span>
                        <span class="text-slate-400 dark:text-slate-500">•</span>
                        <span class="text-slate-500 dark:text-slate-400">${TIMETABLE_CONFIG.semester}</span>
                    </p>
                </div>

                <div class="flex items-center gap-2.5 flex-wrap">
                    <button type="button" 
                            onclick="window.TimetableEngine.switchViewMode('fullweek')" 
                            class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98 ${currentViewMode === 'fullweek' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/25 ring-2 ring-sky-400/40' : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'}">
                        <span>📋</span>
                        <span>Toàn Bộ Tuần</span>
                    </button>
                    <button type="button" 
                            onclick="window.AzotaApp.openFileExplorer('root')" 
                            class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98">
                        <span>📁</span>
                        <span>Kho Đề Thi</span>
                    </button>
                </div>
            </div>
        `;
        wrapper.appendChild(headerEl);

        // B. THANH CHỌN THỨ TRONG TUẦN (DAY TABS)
        const tabsContainer = document.createElement("div");
        tabsContainer.className = "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none";
        
        const dayKeys = ["T2", "T3", "T4", "T5", "T6"];
        
        // 1. Nút "HÔM NAY"
        const isViewingToday = (currentViewMode === 'day' && activeDayCode === info.todayCode);
        const todayBtn = document.createElement("button");
        todayBtn.type = "button";
        todayBtn.className = `shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm ${
            isViewingToday 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50' 
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
        }`;
        todayBtn.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-400 ${isViewingToday ? 'animate-ping' : ''}"></span>
            <span>🔴 Hôm Nay (${info.todayName})</span>
        `;
        todayBtn.onclick = () => {
            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            currentViewMode = 'day';
            // Nếu hôm nay là cuối tuần thì mở T2 nhưng thông báo rõ
            activeDayCode = info.isWeekend ? "T2" : info.todayCode;
            render(container);
        };
        tabsContainer.appendChild(todayBtn);

        // 2. Các nút T2 đến T6
        dayKeys.forEach(code => {
            const dayObj = TIMETABLE_CONFIG.days[code];
            const isSelected = (currentViewMode === 'day' && activeDayCode === code);
            const isToday = (info.todayCode === code);

            const tabBtn = document.createElement("button");
            tabBtn.type = "button";
            tabBtn.className = `shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                isSelected 
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400/40' 
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
            }`;
            tabBtn.innerHTML = `
                <span>${dayObj.name}</span>
                ${isToday ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">Nay</span>` : ''}
            `;
            tabBtn.onclick = () => {
                if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
                currentViewMode = 'day';
                activeDayCode = code;
                render(container);
            };
            tabsContainer.appendChild(tabBtn);
        });

        // 3. Phím tắt buổi tối: "Soạn cặp ngày mai"
        if (info.isEvening && !info.isWeekend && info.todayCode !== 'T6') {
            const tomorrowBtn = document.createElement("button");
            tomorrowBtn.type = "button";
            tomorrowBtn.className = "shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95";
            tomorrowBtn.innerHTML = `
                <span>🌙 Soạn Cặp ${info.tomorrowName}</span>
            `;
            tomorrowBtn.onclick = () => {
                if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
                currentViewMode = 'day';
                activeDayCode = info.tomorrowCode;
                render(container);
            };
            tabsContainer.appendChild(tomorrowBtn);
        }

        wrapper.appendChild(tabsContainer);

        // C. NỘI DUNG CHÍNH (THEO VIEW MODE)
        const mainContentArea = document.createElement("div");
        mainContentArea.id = "timetableMainContentArea";
        wrapper.appendChild(mainContentArea);

        container.appendChild(wrapper);

        if (currentViewMode === 'fullweek') {
            renderFullWeekView(mainContentArea);
        } else {
            renderDayView(activeDayCode, mainContentArea);
        }
    }

    // 5. RENDER CHI TIẾT THEO NGÀY (LỊCH TIẾT HỌC + BALO SOẠN CẶP)
    function renderDayView(dayCode, container) {
        const targetContainer = container || document.getElementById("timetableMainContentArea");
        if (!targetContainer) return;
        targetContainer.innerHTML = "";

        const dayData = TIMETABLE_CONFIG.days[dayCode] || TIMETABLE_CONFIG.days["T2"];
        const info = getTodayInfo();
        const isToday = (info.todayCode === dayCode);
        const currentPeriod = isToday ? getCurrentPeriodId() : null;

        const dayWrapper = document.createElement("div");
        dayWrapper.className = "space-y-6 animate-fadeIn";

        // BANNER THÔNG BÁO NGÀY
        let bannerHtml = "";
        if (isToday) {
            bannerHtml = `
                <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/25 backdrop-blur-md flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-emerald-500/30">
                            ✨
                        </div>
                        <div>
                            <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ĐANG XEM LỊCH HÔM NAY</div>
                            <div class="text-sm sm:text-base font-black text-slate-900 dark:text-white">${dayData.name} • Đang áp dụng lịch học chính khóa</div>
                        </div>
                    </div>
                    <div class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        ${dayData.morning.filter(Boolean).length} tiết Sáng • ${dayData.afternoon.filter(Boolean).length} tiết Chiều
                    </div>
                </div>
            `;
        } else if (info.isWeekend && dayCode === "T2") {
            bannerHtml = `
                <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/25 backdrop-blur-md flex items-center gap-3">
                    <span class="text-2xl">🌴</span>
                    <div class="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                        <span class="font-bold">Hôm nay là cuối tuần (Nghỉ học)!</span> Đang gợi ý thời khóa biểu <span class="font-bold underline">${dayData.name}</span> để bạn chuẩn bị sách vở và đề cương cho đầu tuần mới.
                    </div>
                </div>
            `;
        }

        if (bannerHtml) {
            const bannerEl = document.createElement("div");
            bannerEl.innerHTML = bannerHtml;
            dayWrapper.appendChild(bannerEl);
        }

        // LƯU Ý ĐẶC BIỆT CỦA NGÀY (NẾU CÓ)
        if (dayData.specialNote) {
            const noteEl = document.createElement("div");
            noteEl.className = "p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs sm:text-sm flex items-start gap-2.5 text-slate-700 dark:text-slate-300";
            noteEl.innerHTML = `
                <span class="text-base">📌</span>
                <div class="flex-1 leading-relaxed"><span class="font-bold text-slate-900 dark:text-white">Lưu ý giáo viên:</span> ${dayData.specialNote}</div>
            `;
            dayWrapper.appendChild(noteEl);
        }

        // 2 CỘT: CỘT 1 (LỊCH TIẾT HỌC) + CỘT 2 (SOẠN CẶP ĐI HỌC)
        const gridEl = document.createElement("div");
        gridEl.className = "grid grid-cols-1 lg:grid-cols-12 gap-6";

        // ================= CỘT 1: LỊCH HỌC SÁNG & CHIỀU (7 CỘT) =================
        const scheduleCol = document.createElement("div");
        scheduleCol.className = "lg:col-span-7 space-y-5";

        // BUỔI SÁNG
        const morningCard = document.createElement("div");
        morningCard.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-3.5";
        morningCard.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <div class="flex items-center gap-2">
                    <span class="text-lg">🌅</span>
                    <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">Buổi Sáng</h3>
                    <span class="text-xs text-slate-400 font-medium">(07:00 – 11:05)</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                    ${dayData.morning.filter(Boolean).length} Tiết Học
                </span>
            </div>
            <div class="space-y-2" id="morningPeriodList"></div>
        `;
        const morningList = morningCard.querySelector("#morningPeriodList");
        TIMETABLE_CONFIG.timeSlots.morning.forEach((slot, idx) => {
            const subjectKey = dayData.morning[idx] || "";
            const isOngoing = (isToday && currentPeriod === slot.id);
            morningList.appendChild(createPeriodRow(slot, subjectKey, isOngoing));
        });
        scheduleCol.appendChild(morningCard);

        // BUỔI CHIỀU
        const afternoonCard = document.createElement("div");
        afternoonCard.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-3.5";
        
        const hasAfternoon = dayData.afternoon.some(Boolean);
        afternoonCard.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <div class="flex items-center gap-2">
                    <span class="text-lg">🌇</span>
                    <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">Buổi Chiều</h3>
                    <span class="text-xs text-slate-400 font-medium">(13:00 – 17:05)</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${hasAfternoon ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' : 'bg-slate-500/15 text-slate-400'}">
                    ${hasAfternoon ? `${dayData.afternoon.filter(Boolean).length} Tiết Học` : 'Nghỉ Chiều'}
                </span>
            </div>
            <div class="space-y-2" id="afternoonPeriodList"></div>
        `;
        const afternoonList = afternoonCard.querySelector("#afternoonPeriodList");
        if (hasAfternoon) {
            TIMETABLE_CONFIG.timeSlots.afternoon.forEach((slot, idx) => {
                const subjectKey = dayData.afternoon[idx] || "";
                const isOngoing = (isToday && currentPeriod === slot.id);
                afternoonList.appendChild(createPeriodRow(slot, subjectKey, isOngoing));
            });
        } else {
            afternoonList.innerHTML = `
                <div class="p-6 text-center rounded-2xl bg-slate-500/5 border border-dashed border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-400 space-y-1">
                    <div class="text-2xl">☕</div>
                    <div class="font-bold text-slate-700 dark:text-slate-300">Buổi chiều không có tiết học</div>
                    <div>Học sinh được nghỉ học chính khóa hoặc tự ôn tập tại nhà.</div>
                </div>
            `;
        }
        scheduleCol.appendChild(afternoonCard);

        gridEl.appendChild(scheduleCol);

        // ================= CỘT 2: CHECKLIST SOẠN BALO ĐI HỌC (5 CỘT) =================
        const backpackCol = document.createElement("div");
        backpackCol.className = "lg:col-span-5 space-y-5";

        const daySupplies = getSuppliesForDay(dayCode);
        const checkedMap = getCheckedSupplies(dayCode);

        // Tính tổng số món và số món đã tick
        let totalItems = 0;
        let checkedCount = 0;
        daySupplies.forEach(grp => {
            grp.supplies.forEach(item => {
                totalItems++;
                if (checkedMap[item.id]) checkedCount++;
            });
        });
        const percent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 100;

        const backpackCard = document.createElement("div");
        backpackCard.className = "p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-4";
        backpackCard.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🎒</span>
                    <div>
                        <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">Balo Đi Học ${dayData.name}</h3>
                        <div class="text-[11px] text-slate-400">Danh sách sách, vở &amp; đề cương cần mang</div>
                    </div>
                </div>
                <button type="button" 
                        onclick="window.TimetableEngine.resetBackpackChecklist('${dayCode}')" 
                        class="text-[11px] font-bold text-sky-500 hover:text-sky-400 underline cursor-pointer"
                        title="Đặt lại các ô đã đánh dấu">
                    Làm mới
                </button>
            </div>

            <!-- Thanh tiến độ soạn cặp -->
            <div class="p-3.5 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold">
                    <span class="text-slate-700 dark:text-slate-300">Tiến độ soạn cặp:</span>
                    <span class="${percent === 100 ? 'text-emerald-500' : 'text-sky-500'}">${checkedCount}/${totalItems} món (${percent}%)</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gradient-to-r from-sky-500 to-indigo-600'}" style="width: ${percent}%;"></div>
                </div>
                ${percent === 100 ? `
                    <div class="text-[11px] font-bold text-emerald-500 flex items-center gap-1 pt-0.5">
                        <span>🎉</span><span>Tuyệt vời! Balo đã đủ 100% sách vở &amp; đồ dùng.</span>
                    </div>
                ` : ''}
            </div>

            <!-- Danh sách từng môn -->
            <div class="space-y-3.5" id="backpackSuppliesList"></div>

            <!-- Gợi ý bổ sung -->
            <div class="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-white/5 space-y-1">
                <div class="flex items-start gap-1.5">
                    <span>💡</span>
                    <span><strong class="text-slate-700 dark:text-slate-300">Đồ dùng luôn mang:</strong> Bút bi, thước kẻ, máy tính Casio, nước uống cá nhân.</span>
                </div>
                <div class="flex items-start gap-1.5">
                    <span>⚠️</span>
                    <span>Chỉ mang chuyên đề Văn/Lý khi thầy cô có dặn trước.</span>
                </div>
            </div>
        `;

        const suppliesListEl = backpackCard.querySelector("#backpackSuppliesList");
        if (daySupplies.length === 0) {
            suppliesListEl.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400">Không có đồ dùng cần mang trong ngày nghỉ.</div>
            `;
        } else {
            daySupplies.forEach(grp => {
                const subMeta = grp.subjectMeta;
                const subSection = document.createElement("div");
                subSection.className = "space-y-1.5";

                const subHeader = document.createElement("div");
                subHeader.className = "flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200";
                subHeader.innerHTML = `
                    <span>${subMeta.icon}</span>
                    <span>${subMeta.fullName}</span>
                `;
                subSection.appendChild(subHeader);

                grp.supplies.forEach(item => {
                    const isChecked = !!checkedMap[item.id];
                    const itemEl = document.createElement("div");
                    itemEl.className = `backpack-checkbox-item ${isChecked ? 'is-checked' : ''}`;
                    itemEl.innerHTML = `
                        <div class="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isChecked 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-white/20 bg-white/40 dark:bg-slate-800/60'
                        }">
                            ${isChecked ? '✓' : ''}
                        </div>
                        <div class="flex-1 text-xs item-text font-medium leading-normal">
                            ${item.name}
                            ${item.optional ? '<span class="text-[10px] text-amber-500 font-bold ml-1">(Tùy chọn)</span>' : ''}
                            ${item.highlight ? '<span class="text-[10px] text-orange-400 font-bold ml-1">🔥 Quan trọng</span>' : ''}
                        </div>
                    `;

                    itemEl.onclick = () => {
                        const newCheckedState = !isChecked;
                        setSupplyChecked(dayCode, item.id, newCheckedState);
                        if (window.AudioHelper && window.AudioHelper.playClick) {
                            window.AudioHelper.playClick();
                        }
                        
                        // Check if just reached 100%
                        if (newCheckedState && totalItems > 0 && checkedCount + 1 === totalItems) {
                            if (window.confetti) {
                                window.confetti({
                                    particleCount: 50,
                                    spread: 60,
                                    origin: { y: 0.6 }
                                });
                            }
                        }

                        renderDayView(dayCode, targetContainer);
                    };

                    subSection.appendChild(itemEl);
                });

                suppliesListEl.appendChild(subSection);
            });
        }

        backpackCol.appendChild(backpackCard);
        gridEl.appendChild(backpackCol);

        dayWrapper.appendChild(gridEl);
        targetContainer.appendChild(dayWrapper);
    }

    // Helper tạo một hàng tiết học
    function createPeriodRow(slot, subjectKey, isOngoing) {
        const row = document.createElement("div");
        row.className = `timetable-period-row ${isOngoing ? 'is-current' : ''}`;

        if (!subjectKey) {
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center text-xs font-black shrink-0">
                        ${slot.id}
                    </span>
                    <div>
                        <div class="text-xs font-semibold text-slate-400">${slot.label}</div>
                        <div class="text-[10px] text-slate-500">${slot.time}</div>
                    </div>
                </div>
                <span class="text-xs text-slate-400 dark:text-slate-500 italic">Nghỉ tiết này</span>
            `;
            return row;
        }

        const meta = TIMETABLE_CONFIG.subjectsMeta[subjectKey] || {
            fullName: subjectKey,
            icon: "📚",
            badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/20"
        };

        const hasExams = !!meta.examFolderId;

        row.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-xs font-black shrink-0 border border-sky-500/20">
                    ${slot.id}
                </span>
                <div>
                    <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>${meta.icon}</span>
                        <span>${subjectKey}</span>
                        ${isOngoing ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-white animate-pulse">Đang Học</span>` : ''}
                    </div>
                    <div class="text-[10px] text-slate-400 font-medium">${slot.label} • ${slot.time}</div>
                </div>
            </div>

            <div class="flex items-center gap-2">
                ${hasExams ? `
                    <button type="button" 
                            onclick="window.AzotaApp.openFileExplorer('${meta.examFolderId}')" 
                            class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/25 transition-all flex items-center gap-1 cursor-pointer"
                            title="Luyện giải đề môn ${subjectKey} trên Aseta">
                        <span>📝</span>
                        <span class="hidden sm:inline">Luyện Đề</span>
                    </button>
                ` : `
                    <span class="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-lg bg-slate-500/5">
                        Chính khóa
                    </span>
                `}
            </div>
        `;

        return row;
    }

    // 6. RENDER GIAO DIỆN TOÀN BỘ TUẦN (GRID TABLE CHUẨN THPT)
    function renderFullWeekView(container) {
        const targetContainer = container || document.getElementById("timetableMainContentArea");
        if (!targetContainer) return;
        targetContainer.innerHTML = "";

        const info = getTodayInfo();

        const fullWrapper = document.createElement("div");
        fullWrapper.className = "space-y-6 animate-fadeIn";

        // Thanh chuyển đổi nhanh về ngày hôm nay
        const topBar = document.createElement("div");
        topBar.className = "flex items-center justify-between flex-wrap gap-2";
        topBar.innerHTML = `
            <div class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>📋 Bảng Phân Phối Tiết Học Toàn Bộ Tuần Lớp 11A7</span>
            </div>
            <button type="button" 
                    onclick="window.TimetableEngine.switchViewMode('day', '${info.isWeekend ? 'T2' : info.todayCode}')" 
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
                <span>🎒</span>
                <span>Xem Chi Tiết &amp; Soạn Balo Hôm Nay</span>
            </button>
        `;
        fullWrapper.appendChild(topBar);

        // BẢNG THỜI KHÓA BIỂU TOÀN TUẦN
        const tableCard = document.createElement("div");
        tableCard.className = "timetable-table-container shadow-xl";

        const daysList = ["T2", "T3", "T4", "T5", "T6", "T7"];

        let tableHtml = `
            <table class="timetable-table">
                <thead>
                    <tr>
                        <th class="w-16">Buổi</th>
                        <th class="w-14">Tiết</th>
                        ${daysList.map(code => {
                            const isToday = (info.todayCode === code);
                            const dayObj = TIMETABLE_CONFIG.days[code];
                            return `<th class="${isToday ? 'col-today' : ''}">
                                <div>${dayObj.name}</div>
                                ${isToday ? `<span class="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">Hôm Nay</span>` : ''}
                            </th>`;
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        // Hàng Buổi Sáng S1 -> S5
        TIMETABLE_CONFIG.timeSlots.morning.forEach((slot, sIdx) => {
            tableHtml += `<tr>`;
            if (sIdx === 0) {
                tableHtml += `<td rowspan="5" class="font-black text-sky-400 bg-sky-500/10 align-middle">SÁNG</td>`;
            }
            tableHtml += `<td class="font-bold text-slate-400 text-xs">${slot.id}</td>`;

            daysList.forEach(code => {
                const dayObj = TIMETABLE_CONFIG.days[code];
                const subject = (dayObj && dayObj.morning) ? dayObj.morning[sIdx] : "";
                const isToday = (info.todayCode === code);
                const meta = TIMETABLE_CONFIG.subjectsMeta[subject];

                tableHtml += `<td class="${isToday ? 'col-today' : ''}">
                    ${subject ? `
                        <div class="font-bold text-xs text-slate-800 dark:text-white flex items-center justify-center gap-1">
                            <span>${meta ? meta.icon : ''}</span>
                            <span>${subject}</span>
                        </div>
                    ` : `<span class="text-slate-500 dark:text-slate-600 text-xs">—</span>`}
                </td>`;
            });

            tableHtml += `</tr>`;
        });

        // Hàng Buổi Chiều C1 -> C5
        TIMETABLE_CONFIG.timeSlots.afternoon.forEach((slot, cIdx) => {
            tableHtml += `<tr>`;
            if (cIdx === 0) {
                tableHtml += `<td rowspan="5" class="font-black text-indigo-400 bg-indigo-500/10 align-middle">CHIỀU</td>`;
            }
            tableHtml += `<td class="font-bold text-slate-400 text-xs">${slot.id}</td>`;

            daysList.forEach(code => {
                const dayObj = TIMETABLE_CONFIG.days[code];
                const subject = (dayObj && dayObj.afternoon) ? dayObj.afternoon[cIdx] : "";
                const isToday = (info.todayCode === code);
                const meta = TIMETABLE_CONFIG.subjectsMeta[subject];

                tableHtml += `<td class="${isToday ? 'col-today' : ''}">
                    ${subject ? `
                        <div class="font-bold text-xs text-slate-800 dark:text-white flex items-center justify-center gap-1">
                            <span>${meta ? meta.icon : ''}</span>
                            <span>${subject}</span>
                        </div>
                    ` : `<span class="text-slate-500 dark:text-slate-600 text-xs">—</span>`}
                </td>`;
            });

            tableHtml += `</tr>`;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        tableCard.innerHTML = tableHtml;
        fullWrapper.appendChild(tableCard);

        // BẢNG TRA CỨU ĐỒ DÙNG HỌC TẬP TẤT CẢ CÁC MÔN
        const refCard = document.createElement("div");
        refCard.className = "p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-4";
        refCard.innerHTML = `
            <div class="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/5">
                <span class="text-lg">📚</span>
                <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">Bảng Tra Cứu Đồ Dùng Học Tập Tất Cả Các Môn (Lớp 11A7)</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" id="allSubjectsRefGrid"></div>
        `;

        const refGrid = refCard.querySelector("#allSubjectsRefGrid");
        Object.entries(TIMETABLE_CONFIG.subjectsMeta).forEach(([subName, meta]) => {
            const itemBox = document.createElement("div");
            itemBox.className = "p-3.5 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1.5";
            itemBox.innerHTML = `
                <div class="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                    <span>${meta.icon}</span>
                    <span>${meta.fullName}</span>
                </div>
                <ul class="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    ${meta.supplies.map(s => `<li>${s.name}</li>`).join('')}
                </ul>
            `;
            refGrid.appendChild(itemBox);
        });

        fullWrapper.appendChild(refCard);
        targetContainer.appendChild(fullWrapper);
    }

    // 7. MINI BANNER CHO TRANG KHO ĐỀ (ROOT EXPLORER)
    function renderMiniBanner(container) {
        if (!container) return;
        container.innerHTML = "";

        const info = getTodayInfo();
        const dayData = TIMETABLE_CONFIG.days[info.todayCode];

        const banner = document.createElement("div");
        banner.className = "mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-600/10 via-indigo-600/10 to-purple-600/10 border border-sky-500/20 backdrop-blur-xl transition-all hover:border-sky-500/40";

        if (info.isWeekend) {
            banner.innerHTML = `
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg shrink-0">
                            🌴
                        </div>
                        <div class="space-y-0.5">
                            <div class="text-xs font-bold text-amber-600 dark:text-amber-400">Cuối Tuần: ${info.todayName}</div>
                            <div class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">Nghỉ học chính khóa. Tự do ôn luyện đề hoặc chuẩn bị bài Thứ Hai!</div>
                        </div>
                    </div>
                    <button type="button" 
                            onclick="window.AzotaApp.openTimetable()" 
                            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
                        <span>📅</span>
                        <span>Xem TKB Tuần Mới</span>
                    </button>
                </div>
            `;
        } else {
            const morningStr = dayData.morning.filter(Boolean).join(", ") || "Nghỉ";
            const afternoonStr = dayData.afternoon.filter(Boolean).join(", ") || "Nghỉ";

            banner.innerHTML = `
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg shrink-0">
                            📅
                        </div>
                        <div class="space-y-0.5">
                            <div class="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                <span>LỊCH HỌC HÔM NAY (${info.todayName})</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            </div>
                            <div class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                                🌅 <strong>Sáng:</strong> ${morningStr} &nbsp;•&nbsp; 🌇 <strong>Chiều:</strong> ${afternoonStr}
                            </div>
                        </div>
                    </div>
                    <button type="button" 
                            onclick="window.AzotaApp.openTimetable()" 
                            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
                        <span>🎒</span>
                        <span>Soạn Cặp Đi Học</span>
                    </button>
                </div>
            `;
        }

        container.appendChild(banner);
    }

    // Public API
    return {
        render: render,
        renderMiniBanner: renderMiniBanner,
        renderDayView: renderDayView,
        renderFullWeekView: renderFullWeekView,
        resetBackpackChecklist: resetBackpackChecklist,
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
