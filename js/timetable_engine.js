/**
 * Aseta Timetable Engine (Thời Khóa Biểu & Balo Học Tập Lớp 11A7)
 * Trường THPT Trần Văn Giàu - Học Kỳ 1 (Áp dụng từ 09/11/2026)
 * GVCN: Nguyễn Việt Kiều Anh
 * Bố cục 1 hàng chung (3 cột song song):
 * [ Cột 1: Ảnh gốc to ] | [ Cột 2: Lịch tiết học Sáng & Chiều ] | [ Cột 3: Balo đi học checklist ]
 * Balo không bị chìm xuống dưới, mọi chức năng đều hiển thị trọn vẹn trên 1 hàng!
 */

window.TimetableEngine = (function() {
    'use strict';

    // 1. DỮ LIỆU THỜI KHÓA BIỂU & ĐỒ DÙNG CẦN MANG
    const TIMETABLE_CONFIG = {
        schoolName: "Trường THPT Trần Văn Giàu",
        className: "11A7",
        semester: "Học Kỳ 1 (Áp dụng từ 09/11/2026)",
        homeroomTeacher: "Nguyễn Việt Kiều Anh",
        imageUrl: "assets/thoi_khoa_bieu_11a7.jpg",
        
        // Khung giờ các tiết học chuẩn THPT Trần Văn Giàu (Áp dụng từ 09/11/2026)
        // Buổi Sáng: Tiết 1 bắt đầu 7:00, Tiết 4 kết thúc 10:35
        // Buổi Chiều: Tiết 1 bắt đầu 13:30 (1g30), Tiết 4 kết thúc 16:15 (4g15), Tiết 5 kết thúc 17:05 (5g05)
        timeSlots: {
            morning: [
                { id: "S1", label: "Tiết 1", time: "07:00 - 07:45" },
                { id: "S2", label: "Tiết 2", time: "07:50 - 08:35" },
                { id: "S3", label: "Tiết 3", time: "09:00 - 09:45" },
                { id: "S4", label: "Tiết 4", time: "09:50 - 10:35" },
                { id: "S5", label: "Tiết 5", time: "10:40 - 11:25" }
            ],
            afternoon: [
                { id: "C1", label: "Tiết 1", time: "13:30 - 14:10" },
                { id: "C2", label: "Tiết 2", time: "14:15 - 14:55" },
                { id: "C3", label: "Tiết 3", time: "15:05 - 15:40" },
                { id: "C4", label: "Tiết 4", time: "15:40 - 16:15" },
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
    let activeDayCode = null; // T2, T3, T4, T5, T6
    let currentViewMode = 'day'; // 'day' or 'fullweek'
    let imageModalZoom = 1;

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
        // Thời gian soạn cặp: Kích hoạt sau khi kết thúc buổi chiều (từ sau 16h15 trở đi), buổi tối hoặc sáng sớm trước 7g
        const isPackingTime = (hour === 16 && minute >= 15) || (hour >= 17) || (hour < 7);
        const isEvening = isPackingTime;

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
            isPackingTime,
            isEvening,
            tomorrowCode,
            tomorrowName: dayNameMap[tomorrowCode],
            formattedDate,
            timeString
        };
    }

    // Xác định tiết học đang diễn ra trong ngày hiện tại
    // Buổi Sáng: Tiết 1 bắt đầu 7:00, Tiết 4 kết thúc 10:35
    // Buổi Chiều: Tiết 1 bắt đầu 13:30 (1g30), Tiết 4 kết thúc 16:15 (4g15), Tiết 5 kết thúc 17:05 (5g05)
    function getCurrentPeriodId() {
        const info = getTodayInfo();
        if (info.isWeekend) return null;

        const currentMinutes = info.hour * 60 + info.minute;

        // Morning periods
        // S1: 07:00 - 07:45
        if (currentMinutes >= 7 * 60 && currentMinutes < 7 * 60 + 45) return "S1";
        // S2: 07:50 - 08:35
        if (currentMinutes >= 7 * 60 + 50 && currentMinutes < 8 * 60 + 35) return "S2";
        // S3: 09:00 - 09:45 (Sau giờ ra chơi 25 phút)
        if (currentMinutes >= 9 * 60 && currentMinutes < 9 * 60 + 45) return "S3";
        // S4: 09:50 - 10:35 (Kết thúc đúng 10g35)
        if (currentMinutes >= 9 * 60 + 50 && currentMinutes < 10 * 60 + 35) return "S4";
        // S5: 10:40 - 11:25
        if (currentMinutes >= 10 * 60 + 40 && currentMinutes < 11 * 60 + 25) return "S5";

        // Afternoon periods
        // C1: 13:30 - 14:10 (Bắt đầu đúng 1g30)
        if (currentMinutes >= 13 * 60 + 30 && currentMinutes < 14 * 60 + 10) return "C1";
        // C2: 14:15 - 14:55
        if (currentMinutes >= 14 * 60 + 15 && currentMinutes < 14 * 60 + 55) return "C2";
        // C3: 15:05 - 15:40 (Sau giờ ra chơi 10 phút)
        if (currentMinutes >= 15 * 60 + 5 && currentMinutes < 15 * 60 + 40) return "C3";
        // C4: 15:40 - 16:15 (Kết thúc đúng 4g15 / 16g15)
        if (currentMinutes >= 15 * 60 + 40 && currentMinutes < 16 * 60 + 15) return "C4";
        // C5: 16:20 - 17:05 (Kết thúc đúng 5g05 / 17g05)
        if (currentMinutes >= 16 * 60 + 20 && currentMinutes < 17 * 60 + 5) return "C5";

        return null;
    }

    // 3. QUẢN LÝ CHECKLIST BALO HỌC SINH
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

    // Tổng hợp tất cả đồ dùng cần mang của một ngày
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

        if (!activeDayCode) {
            if (info.isWeekend) {
                activeDayCode = "T2";
            } else if (info.isPackingTime && info.todayCode !== 'T6') {
                // Sau giờ tan học chiều (từ sau 16h15), ưu tiên gợi ý ngày mai để soạn cặp
                activeDayCode = info.tomorrowCode;
            } else {
                activeDayCode = info.todayCode;
            }
        }

        const wrapper = document.createElement("div");
        wrapper.className = "py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-fadeIn text-slate-800 dark:text-slate-100";

        // A. HEADER TRANG THỜI KHÓA BIỂU
        const headerEl = document.createElement("div");
        headerEl.className = "p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-600/15 via-indigo-600/15 to-purple-600/15 border border-sky-500/25 backdrop-blur-xl relative overflow-hidden shadow-xl";
        headerEl.innerHTML = `
            <div class="absolute -right-8 -bottom-8 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1.5">
                    <div class="flex items-center flex-wrap gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                            <span>${TIMETABLE_CONFIG.className} • ${TIMETABLE_CONFIG.schoolName}</span>
                        </span>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            GVCN: ${TIMETABLE_CONFIG.homeroomTeacher}
                        </span>
                    </div>
                    <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <span>📅 Thời Khóa Biểu &amp; Balo Đi Học</span>
                    </h1>
                    <p class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sky-600 dark:text-sky-400">🕒 Hôm nay: ${info.formattedDate}</span>
                        <span class="text-slate-400 dark:text-slate-500">•</span>
                        <span class="text-slate-500 dark:text-slate-400">${TIMETABLE_CONFIG.semester}</span>
                    </p>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                    <button type="button" 
                            onclick="window.TimetableEngine.openImageModal()" 
                            class="px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            title="Phóng to ảnh chụp gốc">
                        <span>🔍</span>
                        <span>Phóng To Ảnh TKB</span>
                    </button>
                    <button type="button" 
                            onclick="window.TimetableEngine.switchViewMode('fullweek')" 
                            class="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${currentViewMode === 'fullweek' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/25 ring-2 ring-sky-400/40' : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'}">
                        <span>📋</span>
                        <span>Bảng Lưới Tuần</span>
                    </button>
                    <button type="button" 
                            onclick="window.AzotaApp.openFileExplorer('root')" 
                            class="px-3.5 py-2 rounded-2xl text-xs font-bold bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1 cursor-pointer active:scale-98">
                        <span>📁</span>
                        <span>Kho Đề Thi</span>
                    </button>
                </div>
            </div>
        `;
        wrapper.appendChild(headerEl);

        // B. THANH CHỌN THỨ TRONG TUẦN (DAY TABS)
        const tabsContainer = document.createElement("div");
        tabsContainer.className = "flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none";
        
        const dayKeys = ["T2", "T3", "T4", "T5", "T6"];
        
        // 1. Nút "HÔM NAY"
        const isViewingToday = (currentViewMode === 'day' && activeDayCode === info.todayCode);
        const todayBtn = document.createElement("button");
        todayBtn.type = "button";
        todayBtn.className = `shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm ${
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
            tabBtn.className = `shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
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

        // 3. Phím tắt: "Soạn cặp ngày mai" (Kích hoạt từ sau 16h15 hoặc buổi tối)
        if (info.isPackingTime) {
            const targetCode = info.isWeekend ? "T2" : (info.todayCode === 'T6' ? "T2" : info.tomorrowCode);
            const targetName = TIMETABLE_CONFIG.days[targetCode] ? TIMETABLE_CONFIG.days[targetCode].name : targetCode;
            const tomorrowBtn = document.createElement("button");
            tomorrowBtn.type = "button";
            const isTargetActive = (currentViewMode === 'day' && activeDayCode === targetCode && !isViewingToday);
            tomorrowBtn.className = `shrink-0 px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                isTargetActive 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 ring-2 ring-amber-400/50' 
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/30'
            }`;
            tomorrowBtn.innerHTML = `
                <span>🌙</span>
                <span>Soạn Cặp: ${targetName}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/30 text-amber-900 dark:text-amber-200">Gợi ý</span>
            `;
            tomorrowBtn.onclick = () => {
                if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
                currentViewMode = 'day';
                activeDayCode = targetCode;
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

    // 5. RENDER BỐ CỤC 1 HÀNG CHUNG (3 CỘT SONG SONG):
    // [ CỘT 1: ẢNH GỐC TO ]  |  [ CỘT 2: LỊCH TIẾT HỌC ]  |  [ CỘT 3: BALO ĐI HỌC CHECKLIST ]
    function renderDayView(dayCode, container) {
        const targetContainer = container || document.getElementById("timetableMainContentArea");
        if (!targetContainer) return;
        targetContainer.innerHTML = "";

        const dayData = TIMETABLE_CONFIG.days[dayCode] || TIMETABLE_CONFIG.days["T2"];
        const info = getTodayInfo();
        const isToday = (info.todayCode === dayCode);
        const currentPeriod = isToday ? getCurrentPeriodId() : null;

        const dayWrapper = document.createElement("div");
        dayWrapper.className = "space-y-4 animate-fadeIn";

        // BANNER TRẠNG THÁI & LƯU Ý GIÁO VIÊN (NGANG BĂNG TRÊN CÙNG)
        const topBannerEl = document.createElement("div");
        topBannerEl.className = "p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/10 border border-emerald-500/25 backdrop-blur-md flex items-center justify-between gap-3 flex-wrap shadow-xs";
        
        let bannerText = "";
        if (info.isPackingTime && !info.isWeekend && dayCode === info.tomorrowCode && info.todayCode !== 'T6') {
            bannerText = `
                <div class="flex items-center gap-2">
                    <span class="text-base">🌙</span>
                    <span class="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                        GIỜ SOẠN CẶP (Sau 16h15): Đang xem lịch ${dayData.name} ngày mai
                    </span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                        (${dayData.morning.filter(Boolean).length} tiết Sáng • ${dayData.afternoon.filter(Boolean).length} tiết Chiều)
                    </span>
                </div>
            `;
        } else if (isToday) {
            bannerText = `
                <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        LỊCH HỌC HÔM NAY: ${dayData.name}
                    </span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                        (${dayData.morning.filter(Boolean).length} tiết Sáng • ${dayData.afternoon.filter(Boolean).length} tiết Chiều)
                    </span>
                </div>
            `;
        } else if (info.isWeekend && dayCode === "T2") {
            bannerText = `
                <div class="flex items-center gap-2">
                    <span class="text-base">🌴</span>
                    <span class="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                        <strong class="font-bold">Cuối tuần nghỉ học!</strong> Đang hiển thị lịch <strong class="underline">${dayData.name}</strong> để bạn chuẩn bị sách vở đầu tuần.
                    </span>
                </div>
            `;
        } else {
            bannerText = `
                <div class="flex items-center gap-2">
                    <span class="text-base">📅</span>
                    <span class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        LỊCH HỌC: ${dayData.name} (${dayData.morning.filter(Boolean).length} tiết Sáng • ${dayData.afternoon.filter(Boolean).length} tiết Chiều)
                    </span>
                </div>
            `;
        }

        let noteBadge = "";
        if (dayData.specialNote) {
            noteBadge = `
                <div class="text-[11px] sm:text-xs text-amber-600 dark:text-amber-300 font-semibold flex items-center gap-1.5 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/25">
                    <span>📌</span><span>${dayData.specialNote}</span>
                </div>
            `;
        }

        topBannerEl.innerHTML = `
            <div class="flex items-center gap-2">${bannerText}</div>
            ${noteBadge}
        `;
        dayWrapper.appendChild(topBannerEl);

        // ================= HÀNG 3 CỘT SONG SONG TRÊN CÙNG 1 ROW =================
        // lg:col-span-4 (Cột 1: Ảnh gốc to)
        // lg:col-span-4 (Cột 2: Lịch tiết học Sáng & Chiều)
        // lg:col-span-4 (Cột 3: Balo đi học checklist)
        const rowGrid = document.createElement("div");
        rowGrid.className = "grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch";

        // ================= CỘT 1: ẢNH GỐC THỜI KHÓA BIỂU TO (lg:col-span-4) =================
        const col1Image = document.createElement("div");
        col1Image.className = "lg:col-span-4 flex flex-col";

        col1Image.innerHTML = `
            <div class="p-4 sm:p-5 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl space-y-3.5 flex-1 flex flex-col justify-between">
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-white/5">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base font-bold shrink-0">
                            🖼️
                        </div>
                        <div>
                            <h3 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white">Ảnh Gốc Thời Khóa Biểu</h3>
                            <div class="text-[10px] text-slate-400">Lớp 11A7 • THPT Trần Văn Giàu</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1">
                        <button type="button" 
                                onclick="window.TimetableEngine.openImageModal()" 
                                class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Phóng to toàn màn hình">
                            <span>🔍</span><span>Phóng To</span>
                        </button>
                        <a href="${TIMETABLE_CONFIG.imageUrl}" 
                           download="Thoi_Khoa_Bieu_11A7_THPT_Tran_Van_Giau.jpg" 
                           class="px-2 py-1 rounded-xl text-[11px] font-bold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all flex items-center cursor-pointer"
                           title="Tải ảnh gốc về máy">
                            <span>📥</span>
                        </a>
                    </div>
                </div>

                <!-- Khung ảnh to rõ nét -->
                <div class="relative flex-1 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950 p-2 text-center cursor-pointer group shadow-inner flex items-center justify-center min-h-[360px]" 
                     onclick="window.TimetableEngine.openImageModal()" 
                     title="Nhấp vào ảnh để phóng to toàn màn hình">
                    <img src="${TIMETABLE_CONFIG.imageUrl}" 
                         alt="Thời khóa biểu Lớp 11A7 Trường THPT Trần Văn Giàu" 
                         class="w-full h-auto max-h-[460px] object-contain mx-auto rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                    
                    <div class="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/85 text-white text-[10px] font-black backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                        <span>🔍</span><span>Nhấp để phóng to</span>
                    </div>
                </div>

                <div class="text-[10px] text-slate-400 dark:text-slate-400 text-center pt-1">
                    Bản chụp nhà trường áp dụng từ 09/11/2026.
                </div>
            </div>
        `;
        rowGrid.appendChild(col1Image);

        // ================= CỘT 2: LỊCH TIẾT HỌC SÁNG & CHIỀU (lg:col-span-4) =================
        const col2Schedule = document.createElement("div");
        col2Schedule.className = "lg:col-span-4 flex flex-col";

        const hasAfternoon = dayData.afternoon.some(Boolean);

        col2Schedule.innerHTML = `
            <div class="p-4 sm:p-5 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl space-y-3.5 flex-1 flex flex-col">
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-white/5">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-base font-bold shrink-0">
                            📅
                        </div>
                        <div>
                            <h3 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white">Lịch Tiết Học ${dayData.name}</h3>
                            <div class="text-[10px] text-slate-400">Buổi Sáng &amp; Buổi Chiều</div>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                        ${dayData.morning.filter(Boolean).length + dayData.afternoon.filter(Boolean).length} Tiết
                    </span>
                </div>

                <div class="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-0.5">
                    <!-- Buổi Sáng -->
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                            <span class="flex items-center gap-1.5">
                                <span>🌅</span><span>Buổi Sáng</span>
                                <span class="text-[10px] text-slate-400 font-normal">(07:00 – 10:35)</span>
                            </span>
                            <span class="text-[10px] text-sky-500 font-bold">${dayData.morning.filter(Boolean).length} tiết</span>
                        </div>
                        <div class="space-y-1.5" id="morningPeriodList"></div>
                    </div>

                    <!-- Buổi Chiều -->
                    <div class="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/5">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                            <span class="flex items-center gap-1.5">
                                <span>🌇</span><span>Buổi Chiều</span>
                                <span class="text-[10px] text-slate-400 font-normal">(13:30 – 16:15/17:05)</span>
                            </span>
                            <span class="text-[10px] ${hasAfternoon ? 'text-indigo-400' : 'text-slate-400'} font-bold">
                                ${hasAfternoon ? `${dayData.afternoon.filter(Boolean).length} tiết` : 'Nghỉ'}
                            </span>
                        </div>
                        <div class="space-y-1.5" id="afternoonPeriodList"></div>
                    </div>
                </div>
            </div>
        `;

        const morningList = col2Schedule.querySelector("#morningPeriodList");
        TIMETABLE_CONFIG.timeSlots.morning.forEach((slot, idx) => {
            const subjectKey = dayData.morning[idx] || "";
            const isOngoing = (isToday && currentPeriod === slot.id);
            morningList.appendChild(createCompactPeriodRow(slot, subjectKey, isOngoing));
        });

        const afternoonList = col2Schedule.querySelector("#afternoonPeriodList");
        if (hasAfternoon) {
            TIMETABLE_CONFIG.timeSlots.afternoon.forEach((slot, idx) => {
                const subjectKey = dayData.afternoon[idx] || "";
                const isOngoing = (isToday && currentPeriod === slot.id);
                afternoonList.appendChild(createCompactPeriodRow(slot, subjectKey, isOngoing));
            });
        } else {
            afternoonList.innerHTML = `
                <div class="p-3.5 text-center rounded-xl bg-slate-500/5 border border-dashed border-slate-300 dark:border-white/10 text-[11px] text-slate-400">
                    ☕ Buổi chiều nghỉ học chính khóa.
                </div>
            `;
        }

        rowGrid.appendChild(col2Schedule);

        // ================= CỘT 3: BALO HỌC SINH CHECKLIST (lg:col-span-4) =================
        // NẰM NGAY CÙNG 1 HÀNG CHUNG VỚI CỘT 1 & CỘT 2! KHÔNG BỊ CHÌM XUỐNG DƯỚI!
        const col3Backpack = document.createElement("div");
        col3Backpack.className = "lg:col-span-4 flex flex-col";

        const daySupplies = getSuppliesForDay(dayCode);
        const checkedMap = getCheckedSupplies(dayCode);

        let totalItems = 0;
        let checkedCount = 0;
        daySupplies.forEach(grp => {
            grp.supplies.forEach(item => {
                totalItems++;
                if (checkedMap[item.id]) checkedCount++;
            });
        });
        const percent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 100;

        col3Backpack.innerHTML = `
            <div class="p-4 sm:p-5 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl space-y-3.5 flex-1 flex flex-col justify-between">
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-white/5">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base font-bold shrink-0">
                            🎒
                        </div>
                        <div>
                            <h3 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white">Balo Đi Học ${dayData.name}</h3>
                            <div class="text-[10px] text-slate-400">Sách, vở, đề cương cần mang</div>
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
                <div class="p-2.5 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div class="flex items-center justify-between text-xs font-bold">
                        <span class="text-slate-700 dark:text-slate-300">Tiến độ soạn cặp:</span>
                        <span class="${percent === 100 ? 'text-emerald-500' : 'text-sky-500'} font-black">${checkedCount}/${totalItems} (${percent}%)</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gradient-to-r from-sky-500 to-indigo-600'}" style="width: ${percent}%;"></div>
                    </div>
                    ${percent === 100 ? `
                        <div class="text-[10px] font-bold text-emerald-500 flex items-center gap-1 pt-0.5">
                            <span>🎉</span><span>Tuyệt vời! Đã đủ 100% sách vở vào cặp.</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Danh sách checklist từng môn (scrollable) -->
                <div class="space-y-2.5 flex-1 overflow-y-auto max-h-[440px] pr-0.5" id="backpackSuppliesList"></div>

                <!-- Ghi chú bổ sung -->
                <div class="pt-2 text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <span>💡 Đồ mang luôn: Bút, thước, Casio, nước.</span>
                    <span>Chỉ mang chuyên đề khi dặn</span>
                </div>
            </div>
        `;

        const suppliesListEl = col3Backpack.querySelector("#backpackSuppliesList");
        if (daySupplies.length === 0) {
            suppliesListEl.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400">Không có đồ dùng cần mang trong ngày nghỉ.</div>
            `;
        } else {
            daySupplies.forEach(grp => {
                const subMeta = grp.subjectMeta;
                const subSection = document.createElement("div");
                subSection.className = "space-y-1";

                const subHeader = document.createElement("div");
                subHeader.className = "flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200";
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
                        <div class="w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all text-[10px] font-black ${
                            isChecked 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-white/20 bg-white/40 dark:bg-slate-800/60'
                        }">
                            ${isChecked ? '✓' : ''}
                        </div>
                        <div class="flex-1 text-[11px] item-text font-medium leading-tight">
                            ${item.name}
                            ${item.optional ? '<span class="text-[9px] text-amber-500 font-bold ml-0.5">(Tùy chọn)</span>' : ''}
                            ${item.highlight ? '<span class="text-[9px] text-orange-400 font-bold ml-0.5">🔥 Quan trọng</span>' : ''}
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

        rowGrid.appendChild(col3Backpack);

        dayWrapper.appendChild(rowGrid);
        targetContainer.appendChild(dayWrapper);
    }

    // Helper tạo một hàng tiết học tinh tế, tích hợp sẵn tóm tắt đồ dùng cần mang
    // Helper tạo một hàng tiết học tinh tế, thiết kế 2 tầng (2-tier card) chống đè chữ tuyệt đối
    function createCompactPeriodRow(slot, subjectKey, isOngoing) {
        const row = document.createElement("div");
        row.className = `timetable-period-row ${isOngoing ? 'is-current' : ''}`;

        if (!subjectKey) {
            row.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center text-[10px] font-black shrink-0">
                            ${slot.id}
                        </span>
                        <div>
                            <div class="text-[11px] font-semibold text-slate-400">${slot.label}</div>
                            <div class="text-[9px] text-slate-500 font-mono">${slot.time}</div>
                        </div>
                    </div>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 italic px-2 py-0.5 rounded-md bg-slate-500/5">Nghỉ</span>
                </div>
            `;
            return row;
        }

        const meta = TIMETABLE_CONFIG.subjectsMeta[subjectKey] || {
            fullName: subjectKey,
            icon: "📚",
            badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/20"
        };

        const hasExams = (window.INITIAL_EXAMS || []).some(e => e.subject === subjectKey || (subjectKey === "Ngoại ngữ" && e.subject === "Tiếng Anh"));
        const suppliesSummary = meta.supplies ? meta.supplies.map(s => s.name).join(", ") : "";

        // BỐ CỤC 2 TẦNG CHUYÊN NGHIỆP:
        // TẦNG 1: [Tiết ID] [Icon & Tên môn học] [Badge Đang học] | [Thời gian 07:00 - 07:45]
        // TẦNG 2: [🎒 Đồ dùng sách vở] | [Nút chức năng tinh gọn]
        // ĐẢM BẢO 100% NÚT BẤM KHÔNG BAO GIỜ BỊ ĐÈ LÊN THỜI GIAN HOẶC TÊN MÔN!
        row.innerHTML = `
            <!-- TẦNG 1: TIÊU ĐỀ TIẾT & THỜI GIAN ĐỘC LẬP -->
            <div class="flex items-center justify-between gap-2 w-full">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="w-6 h-6 rounded-lg ${isOngoing ? 'bg-emerald-500 text-white font-black shadow-xs shadow-emerald-500/40' : 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/20'} flex items-center justify-center text-[10px] font-black shrink-0">
                        ${slot.id}
                    </span>
                    <div class="flex items-center gap-1.5 min-w-0">
                        <span class="text-sm shrink-0">${meta.icon}</span>
                        <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${subjectKey}</span>
                        ${isOngoing ? `<span class="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500 text-white shrink-0 animate-pulse">Đang Học</span>` : ''}
                    </div>
                </div>
                <div class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md shrink-0 border border-slate-300/40 dark:border-white/5">
                    ⏱️ ${slot.time}
                </div>
            </div>

            <!-- TẦNG 2: ĐỒ DÙNG BALO & NÚT HÀNH ĐỘNG TINH TẾ -->
            <div class="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2 w-full">
                <div class="min-w-0 flex-1">
                    ${suppliesSummary ? `
                        <div class="text-[10px] text-sky-600 dark:text-sky-300 font-medium truncate" title="${suppliesSummary}">
                            🎒 ${suppliesSummary}
                        </div>
                    ` : `
                        <div class="text-[10px] text-slate-400 italic">Không có đồ dùng riêng</div>
                    `}
                </div>

                <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    ${(subjectKey === "Ngoại ngữ") ? `
                        <button type="button" 
                                onclick="if(window.VocabHub){window.VocabHub.openOralTest();}else if(window.AzotaApp&&window.AzotaApp.openOralTest){window.AzotaApp.openOralTest();}" 
                                class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="👩‍🏫 Học & Khảo Bài Unit 4 (67 Từ): Flashcard 3D, Cô Khảo Bài 67/67, Ghép Thẻ & Trắc Nghiệm">
                            <span>👩‍🏫</span>
                            <span>Học &amp; Khảo Bài Unit 4</span>
                        </button>
                    ` : (hasExams ? `
                        <button type="button" 
                                onclick="window.AzotaApp.openFileExplorer('${meta.examFolderId}')" 
                                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Luyện giải đề môn ${subjectKey} trên Aseta">
                            <span>📝</span>
                            <span>Luyện Đề</span>
                        </button>
                    ` : `
                        <span class="text-[9px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-500/5">
                            Chính khóa
                        </span>
                    `)}
                </div>
            </div>
        `;
        return row;
    }

    // 6. RENDER GIAO DIỆN TOÀN BỘ TUẦN (GRID TABLE CHUẨN THPT + ẢNH GỐC TO)
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
            <div class="flex items-center gap-2">
                <button type="button" 
                        onclick="window.TimetableEngine.openImageModal()" 
                        class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
                    <span>🖼️</span>
                    <span>Phóng To Ảnh Gốc</span>
                </button>
                <button type="button" 
                        onclick="window.TimetableEngine.switchViewMode('day', '${info.isWeekend ? 'T2' : info.todayCode}')" 
                        class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
                    <span>🎒</span>
                    <span>Quay Về Lịch 1 Hàng</span>
                </button>
            </div>
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

        // BẢN ẢNH GỐC THỜI KHÓA BIỂU TO
        const imgCard = document.createElement("div");
        imgCard.className = "p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-4";
        imgCard.innerHTML = `
            <div class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/60 dark:border-white/5">
                <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🖼️</span>
                    <div>
                        <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">Ảnh Gốc Thời Khóa Biểu Nhà Trường (Bản Chuẩn)</h3>
                        <div class="text-[11px] text-slate-400">Trường THPT Trần Văn Giàu • Lớp 11A7 • Áp dụng từ 09/11/2026</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" 
                            onclick="window.TimetableEngine.openImageModal()" 
                            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
                        <span>🔍</span><span>Phóng To Cực Đại</span>
                    </button>
                    <a href="${TIMETABLE_CONFIG.imageUrl}" 
                       download="Thoi_Khoa_Bieu_11A7_THPT_Tran_Van_Giau.jpg" 
                       class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-all flex items-center gap-1 cursor-pointer">
                        <span>📥</span><span>Tải Về</span>
                    </a>
                </div>
            </div>

            <div class="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950 p-2 sm:p-4 text-center cursor-pointer group shadow-inner" 
                 onclick="window.TimetableEngine.openImageModal()" 
                 title="Nhấp để phóng to toàn màn hình">
                <img src="${TIMETABLE_CONFIG.imageUrl}" 
                     alt="Thời khóa biểu Lớp 11A7 THPT Trần Văn Giàu" 
                     class="max-w-full max-h-[550px] w-auto h-auto mx-auto rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.015]">
                <div class="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-slate-900/85 text-white text-xs font-black backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <span>🔍</span><span>Bấm để phóng to</span>
                </div>
            </div>
        `;
        fullWrapper.appendChild(imgCard);

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

    // 7. FULLSCREEN LIGHTBOX MODAL CHO ẢNH THỜI KHÓA BIỂU
    function openImageModal() {
        let modal = document.getElementById("timetableImageModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "timetableImageModal";
            modal.className = "fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn transition-all select-none";
            
            modal.innerHTML = `
                <!-- Top bar controls -->
                <div class="w-full max-w-5xl flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                    <div class="flex items-center gap-2 text-white">
                        <span class="text-xl">📅</span>
                        <div>
                            <div class="font-black text-sm sm:text-base">${TIMETABLE_CONFIG.schoolName} • Lớp ${TIMETABLE_CONFIG.className}</div>
                            <div class="text-[11px] text-slate-400">${TIMETABLE_CONFIG.semester} • GVCN: ${TIMETABLE_CONFIG.homeroomTeacher}</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="button" 
                                onclick="window.TimetableEngine.zoomImage(0.2)" 
                                class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                                title="Phóng to (+)">
                            +
                        </button>
                        <button type="button" 
                                onclick="window.TimetableEngine.zoomImage(-0.2)" 
                                class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                                title="Thu nhỏ (-)">
                            -
                        </button>
                        <button type="button" 
                                onclick="window.TimetableEngine.resetZoom()" 
                                class="px-2.5 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                                title="Khôi phục kích thước 100%">
                            100%
                        </button>
                        <a href="${TIMETABLE_CONFIG.imageUrl}" 
                           download="Thoi_Khoa_Bieu_11A7_THPT_Tran_Van_Giau.jpg" 
                           class="px-3 h-9 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                            <span>📥</span><span class="hidden sm:inline">Tải Về</span>
                        </a>
                        <button type="button" 
                                onclick="window.TimetableEngine.closeImageModal()" 
                                class="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center font-black text-base cursor-pointer shadow-lg ml-1"
                                title="Đóng cửa sổ (ESC)">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Image container with scroll/pan support -->
                <div class="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2 sm:p-4 cursor-zoom-in" 
                     id="timetableModalImgWrapper"
                     onclick="window.TimetableEngine.zoomImage(0.3)">
                    <img id="timetableModalImg" 
                         src="${TIMETABLE_CONFIG.imageUrl}" 
                         alt="Thời khóa biểu Lớp 11A7" 
                         class="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200">
                </div>

                <!-- Footer hint -->
                <div class="w-full max-w-5xl pt-2 text-center text-xs text-slate-400 flex items-center justify-between shrink-0 border-t border-white/10">
                    <span>💡 Nhấp vào ảnh hoặc dùng nút [+] [-] để phóng to chi tiết. Nhấn phím ESC để đóng.</span>
                    <button type="button" onclick="window.TimetableEngine.closeImageModal()" class="text-xs text-slate-300 hover:text-white underline cursor-pointer">
                        Đóng
                    </button>
                </div>
            `;

            document.body.appendChild(modal);

            window.addEventListener("keydown", function(e) {
                if (e.key === "Escape") {
                    window.TimetableEngine.closeImageModal();
                }
            });
        }

        imageModalZoom = 1;
        const img = document.getElementById("timetableModalImg");
        if (img) img.style.transform = `scale(1)`;

        modal.classList.remove("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        if (window.AudioHelper && window.AudioHelper.playClick) {
            window.AudioHelper.playClick();
        }
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
        if (img) {
            img.style.transform = `scale(${imageModalZoom})`;
        }
    }

    function resetZoom() {
        imageModalZoom = 1;
        const img = document.getElementById("timetableModalImg");
        if (img) {
            img.style.transform = `scale(1)`;
        }
    }

    // 8. MINI BANNER CHO TRANG KHO ĐỀ (ROOT EXPLORER)
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
                    <div class="flex items-center gap-2">
                        <button type="button" 
                                onclick="window.TimetableEngine.openImageModal()" 
                                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer">
                            <span>🖼️</span><span>Ảnh To</span>
                        </button>
                        <button type="button" 
                                onclick="window.AzotaApp.openTimetable()" 
                                class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
                            <span>📅</span>
                            <span>Xem TKB Tuần Mới</span>
                        </button>
                    </div>
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
                    <div class="flex items-center gap-2">
                        <button type="button" 
                                onclick="window.TimetableEngine.openImageModal()" 
                                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer">
                            <span>🖼️</span><span>Ảnh To</span>
                        </button>
                        <button type="button" 
                                onclick="window.AzotaApp.openTimetable()" 
                                class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
                            <span>🎒</span>
                            <span>Soạn Cặp Đi Học</span>
                        </button>
                    </div>
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
        openImageModal: openImageModal,
        closeImageModal: closeImageModal,
        zoomImage: zoomImage,
        resetZoom: resetZoom,
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
