/**
 * Grade Calculator & Predictive Rank Engine (Thông tư 22/2021/TT-BGDĐT)
 * Bảng Sổ Điểm Điện Tử & Dự Báo Xếp Loại Học Sinh THPT
 * Aseta Exam Suite - Chuẩn Chương Trình GDPT 2018 Mới Nhất
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'aseta_grade_calculator_v2';

    // Danh mục môn học THPT chuẩn lớp 11 theo đúng thứ tự sổ điểm VnEdu
    const DEFAULT_SUBJECTS = [
        { id: 'math', name: 'Toán', fullName: 'Toán Học', icon: '📐', group: 'core', type: 'numeric', active: true, tx: [7.0, null, null], gk: 9.5, ck: null, target: 8.0 },
        { id: 'phy', name: 'Vật lý', fullName: 'Vật Lí', icon: '⚡', group: 'natural', type: 'numeric', active: true, tx: [8.0, null, null], gk: 8.0, ck: null, target: 8.0 },
        { id: 'it', name: 'Tin học', fullName: 'Tin Học', icon: '💻', group: 'applied', type: 'numeric', active: true, tx: [8.0, null, null], gk: 8.8, ck: null, target: 8.0 },
        { id: 'lit', name: 'Ngữ văn', fullName: 'Ngữ Văn', icon: '📚', group: 'core', type: 'numeric', active: true, tx: [7.0, 8.0, null], gk: 7.0, ck: null, target: 8.0 },
        { id: 'his', name: 'Lịch Sử', fullName: 'Lịch Sử', icon: '🏛️', group: 'social', type: 'numeric', active: true, tx: [9.5, null, null], gk: 10.0, ck: null, target: 8.0 },
        { id: 'geo', name: 'Địa Lý', fullName: 'Địa Lí', icon: '🌍', group: 'social', type: 'numeric', active: true, tx: [9.3, null, null], gk: null, ck: null, target: 8.0 },
        { id: 'eng', name: 'Ngoại ngữ', fullName: 'Tiếng Anh', icon: '🇬🇧', group: 'core', type: 'numeric', active: true, tx: [6.8, null, null], gk: 8.5, ck: null, target: 8.0 },
        { id: 'qpan', name: 'GD QP-AN', fullName: 'Giáo Dục Quốc Phòng - AN', icon: '🎖️', group: 'applied', type: 'numeric', active: true, tx: [7.5, null, null], gk: 8.5, ck: null, target: 8.0 },
        { id: 'pe', name: 'GDTC', fullName: 'Giáo Dục Thể Chất', icon: '🏃', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
        { id: 'hdtn', name: 'HĐTN2', fullName: 'Hoạt Động Trải Nghiệm, Hướng Nghiệp', icon: '🌟', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
        { id: 'chem', name: 'Hóa học', fullName: 'Hóa Học', icon: '🧪', group: 'natural', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
        { id: 'bio', name: 'Sinh học', fullName: 'Sinh Học', icon: '🧬', group: 'natural', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
        { id: 'gdktpl', name: 'GDKTPL', fullName: 'GD Kinh Tế & Pháp Luật', icon: '⚖️', group: 'social', type: 'numeric', active: true, tx: [8.5, null, null], gk: null, ck: null, target: 8.0 },
        { id: 'tech', name: 'Công nghệ', fullName: 'Công Nghệ', icon: '⚙️', group: 'applied', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
        { id: 'gddp', name: 'GD ĐP', fullName: 'Giáo Dục Địa Phương', icon: '🏮', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' }
    ];

    let state = {
        subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
        targetRank: 'gioi', // 'xuatsac', 'gioi', 'kha', 'dat'
        viewMode: 'table' // 'table' (bảng sổ điểm giống ảnh) hoặc 'cards' (dạng thẻ)
    };

    // Load state từ localStorage
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.subjects)) {
                    state = Object.assign(state, parsed);
                }
            }
        } catch(e) {
            console.warn('[GradeCalc] Load state failed:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch(e) {
            console.warn('[GradeCalc] Save state failed:', e);
        }
    }

    // TÍNH ĐIỂM TRUNG BÌNH MÔN (Hệ số Thông tư 22: Thường xuyên x1, Giữa kì x2, Cuối kì x3)
    function calcSubjectAverage(sub) {
        if (sub.type === 'comment') {
            const isPassed = (sub.result === 'Đạt' || sub.txComment === 'Đ' || sub.gkComment === 'Đ');
            return { isComment: true, result: isPassed ? 'Đạt' : 'Chưa Đạt' };
        }

        const txList = Array.isArray(sub.tx) ? sub.tx.filter(v => typeof v === 'number' && !isNaN(v) && v >= 0 && v <= 10) : [];
        const hasGk = typeof sub.gk === 'number' && !isNaN(sub.gk) && sub.gk >= 0 && sub.gk <= 10;
        const hasCk = typeof sub.ck === 'number' && !isNaN(sub.ck) && sub.ck >= 0 && sub.ck <= 10;

        let totalScore = 0;
        let totalCoeff = 0;

        // Điểm thường xuyên (Hệ số 1)
        txList.forEach(score => {
            totalScore += score * 1;
            totalCoeff += 1;
        });

        // Điểm giữa kì (Hệ số 2)
        if (hasGk) {
            totalScore += sub.gk * 2;
            totalCoeff += 2;
        }

        // Điểm cuối kì (Hệ số 3)
        if (hasCk) {
            totalScore += sub.ck * 3;
            totalCoeff += 3;
        }

        if (totalCoeff === 0) {
            return { isComment: false, average: null, isCompleted: false, hasCk: false, txCount: 0 };
        }

        const avg = Math.round((totalScore / totalCoeff) * 10) / 10;
        return {
            isComment: false,
            average: avg,
            isCompleted: hasCk,
            hasCk: hasCk,
            totalCoeff: totalCoeff,
            totalScore: totalScore,
            txCount: txList.length,
            hasGk: hasGk
        };
    }

    // TÍNH ĐIỂM THI CUỐI KÌ CẦN ĐẠT ĐỂ CÁN MỐC MỤC TIÊU (ƯỚC LƯỢNG NGƯỢC)
    function calcNeededExamScore(sub, targetScore) {
        if (sub.type === 'comment') return null;

        const txList = Array.isArray(sub.tx) ? sub.tx.filter(v => typeof v === 'number' && !isNaN(v)) : [];
        const hasGk = typeof sub.gk === 'number' && !isNaN(sub.gk);

        // Số cột TX tối thiểu là 1 hoặc số cột đã nhập
        const txCount = Math.max(txList.length, 1);
        const totalCoeff = txCount + 2 + 3; // TX + GK(2) + CK(3)

        let existingScore = 0;
        txList.forEach(s => existingScore += s * 1);

        if (hasGk) {
            existingScore += sub.gk * 2;
        } else {
            // Nếu chưa có điểm GK, giả định GK tương đương điểm TX hoặc điểm mục tiêu
            const avgTx = txList.length > 0 ? (existingScore / txList.length) : targetScore;
            existingScore += avgTx * 2;
        }

        // Công thức giải ngược: (Mục tiêu * Tổng hệ số - Điểm hiện tại) / 3
        const needed = (targetScore * totalCoeff - existingScore) / 3;
        const rounded = Math.round(needed * 10) / 10;

        return {
            neededScore: rounded,
            isSafe: rounded <= 0,
            isFeasible: rounded <= 10.0,
            targetScore: targetScore,
            difficulty: rounded <= 5.0 ? 'easy' : (rounded <= 8.0 ? 'medium' : (rounded <= 10.0 ? 'hard' : 'impossible'))
        };
    }

    // ĐÁNH GIÁ VÀ XẾP LOẠI HỌC LỰC THEO THÔNG TƯ 22/2021/TT-BGDĐT
    function evaluateClassification(subjects) {
        const activeNumeric = subjects.filter(s => s.active && s.type === 'numeric');
        const activeComment = subjects.filter(s => s.active && s.type === 'comment');

        const averages = activeNumeric.map(sub => {
            const res = calcSubjectAverage(sub);
            return {
                id: sub.id,
                name: sub.name,
                fullName: sub.fullName,
                icon: sub.icon,
                avg: res.average,
                hasCk: res.hasCk
            };
        });

        // Lọc các điểm hợp lệ
        const validScores = averages.filter(a => a.avg !== null).map(a => a.avg);
        const countGte9 = validScores.filter(s => s >= 9.0).length;
        const countGte8 = validScores.filter(s => s >= 8.0).length;
        const countGte65 = validScores.filter(s => s >= 6.5).length;
        const countGte5 = validScores.filter(s => s >= 5.0).length;
        const countLt35 = validScores.filter(s => s < 3.5).length;
        const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

        // Điểm TB chung
        const overallAvg = validScores.length > 0 
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
            : 0;

        // Kiểm tra môn nhận xét
        const notPassedComments = activeComment.filter(s => s.result !== 'Đạt').length;
        const allCommentsPassed = notPassedComments === 0;

        let rank = 'chuadat';
        let rankTitle = 'Chưa Đạt';
        let rankColor = 'rose';
        let rankBadge = '⚠️';
        let rankDescription = 'Chưa hoàn thành đủ tiêu chuẩn rèn luyện học tập';

        if (validScores.length >= 6) {
            // 1. XUẤT SẮC: Ít nhất 6 môn >= 9.0, tất cả các môn còn lại >= 6.5, môn nhận xét Đạt
            if (countGte9 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rank = 'xuatsac';
                rankTitle = 'Học Sinh Xuất Sắc';
                rankColor = 'amber';
                rankBadge = '🏆';
                rankDescription = 'Đạt danh hiệu Học sinh Xuất sắc (Ít nhất 6 môn ≥ 9.0, các môn còn lại ≥ 6.5)';
            }
            // 2. GIỎI (TỐT): Ít nhất 6 môn >= 8.0, tất cả các môn còn lại >= 6.5, môn nhận xét Đạt
            else if (countGte8 >= 6 && minScore >= 6.5 && allCommentsPassed) {
                rank = 'gioi';
                rankTitle = 'Học Sinh Giỏi';
                rankColor = 'emerald';
                rankBadge = '🥇';
                rankDescription = 'Đạt kết quả học tập mức Giỏi (Ít nhất 6 môn ≥ 8.0, các môn còn lại ≥ 6.5)';
            }
            // 3. KHÁ: Ít nhất 6 môn >= 6.5, tất cả các môn còn lại >= 5.0, môn nhận xét Đạt
            else if (countGte65 >= 6 && minScore >= 5.0 && allCommentsPassed) {
                rank = 'kha';
                rankTitle = 'Học Sinh Khá';
                rankColor = 'sky';
                rankBadge = '🥈';
                rankDescription = 'Đạt kết quả học tập mức Khá (Ít nhất 6 môn ≥ 6.5, các môn còn lại ≥ 5.0)';
            }
            // 4. ĐẠT: Ít nhất 6 môn >= 5.0, không môn nào < 3.5, tối đa 1 môn nhận xét Chưa đạt
            else if (countGte5 >= 6 && countLt35 === 0 && notPassedComments <= 1) {
                rank = 'dat';
                rankTitle = 'Mức Đạt';
                rankColor = 'teal';
                rankBadge = '🥉';
                rankDescription = 'Đạt kết quả học tập mức Đạt (Ít nhất 6 môn ≥ 5.0, không có môn dưới 3.5)';
            } else {
                rank = 'chuadat';
                rankTitle = 'Chưa Đạt';
                rankColor = 'rose';
                rankBadge = '⚠️';
                rankDescription = 'Có môn học dưới 3.5 điểm hoặc chưa đủ số môn theo quy định';
            }
        } else {
            rankTitle = 'Đang Nhập Liệu';
            rankColor = 'slate';
            rankBadge = '📝';
            rankDescription = `Đã nhập ${validScores.length}/6 môn tối thiểu để bắt đầu xếp loại`;
        }

        // TẠO LỜI KHUYÊN & CHIẾN LƯỢC CẢI THIỆN
        const recommendations = [];

        if (rank !== 'xuatsac' && rank !== 'gioi') {
            const needed8 = 6 - countGte8;
            if (needed8 > 0) {
                const candidates = averages
                    .filter(a => a.avg !== null && a.avg < 8.0)
                    .sort((a, b) => b.avg - a.avg)
                    .slice(0, needed8);
                
                const names = candidates.map(c => `${c.name} (hiện ${c.avg})`).join(', ');
                recommendations.push(`🎯 <strong>Mục tiêu Học Sinh Giỏi:</strong> Cần thêm <strong>${needed8} môn</strong> nữa đạt ≥ 8.0. Hãy tập trung kéo các môn gần mốc nhất: <strong>${names}</strong>.`);
            }

            const below65 = averages.filter(a => a.avg !== null && a.avg < 6.5);
            if (below65.length > 0) {
                const names = below65.map(c => `<strong>${c.name}</strong> (${c.avg})`).join(', ');
                recommendations.push(`⚠️ <strong>Môn khống chế:</strong> Có môn dưới 6.5: ${names}. Theo Thông tư 22, để giữ loại Giỏi hoặc Xuất Sắc, <strong>bắt buộc mọi môn phải từ 6.5 trở lên</strong>.`);
            }
        } else if (rank === 'gioi') {
            const needed9 = 6 - countGte9;
            if (needed9 > 0) {
                const candidates = averages
                    .filter(a => a.avg !== null && a.avg >= 8.0 && a.avg < 9.0)
                    .sort((a, b) => b.avg - a.avg)
                    .slice(0, needed9);
                const names = candidates.map(c => `${c.name} (hiện ${c.avg})`).join(', ');
                recommendations.push(`✨ <strong>Chỉ còn một bước để đạt Xuất Sắc:</strong> Cần thêm <strong>${needed9} môn</strong> đạt ≥ 9.0. Các môn sáng giá nhất để bứt phá: <strong>${names}</strong>!`);
            }
        }

        return {
            rank: rank,
            rankTitle: rankTitle,
            rankColor: rankColor,
            rankBadge: rankBadge,
            rankDescription: rankDescription,
            overallAvg: overallAvg,
            minScore: minScore,
            countGte9: countGte9,
            countGte8: countGte8,
            countGte65: countGte65,
            countGte5: countGte5,
            countLt35: countLt35,
            allCommentsPassed: allCommentsPassed,
            totalActive: activeNumeric.length,
            recommendations: recommendations
        };
    }

    // TẢI BỘ ĐIỂM THỰC TẾ TRONG HÌNH ẢNH VNEDU CỦA BẠN
    function loadVnEduPhotoData() {
        state.subjects = [
            { id: 'math', name: 'Toán', fullName: 'Toán Học', icon: '📐', group: 'core', type: 'numeric', active: true, tx: [7.0, null, null], gk: 9.5, ck: null, target: 8.0 },
            { id: 'phy', name: 'Vật lý', fullName: 'Vật Lí', icon: '⚡', group: 'natural', type: 'numeric', active: true, tx: [8.0, null, null], gk: 8.0, ck: null, target: 8.0 },
            { id: 'it', name: 'Tin học', fullName: 'Tin Học', icon: '💻', group: 'applied', type: 'numeric', active: true, tx: [8.0, null, null], gk: 8.8, ck: null, target: 8.0 },
            { id: 'lit', name: 'Ngữ văn', fullName: 'Ngữ Văn', icon: '📚', group: 'core', type: 'numeric', active: true, tx: [7.0, 8.0, null], gk: 7.0, ck: null, target: 8.0 },
            { id: 'his', name: 'Lịch Sử', fullName: 'Lịch Sử', icon: '🏛️', group: 'social', type: 'numeric', active: true, tx: [9.5, null, null], gk: 10.0, ck: null, target: 8.0 },
            { id: 'geo', name: 'Địa Lý', fullName: 'Địa Lí', icon: '🌍', group: 'social', type: 'numeric', active: true, tx: [9.3, null, null], gk: null, ck: null, target: 8.0 },
            { id: 'eng', name: 'Ngoại ngữ', fullName: 'Tiếng Anh', icon: '🇬🇧', group: 'core', type: 'numeric', active: true, tx: [6.8, null, null], gk: 8.5, ck: null, target: 8.0 },
            { id: 'qpan', name: 'GD QP-AN', fullName: 'Giáo Dục Quốc Phòng - AN', icon: '🎖️', group: 'applied', type: 'numeric', active: true, tx: [7.5, null, null], gk: 8.5, ck: null, target: 8.0 },
            { id: 'pe', name: 'GDTC', fullName: 'Giáo Dục Thể Chất', icon: '🏃', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
            { id: 'hdtn', name: 'HĐTN2', fullName: 'Hoạt Động Trải Nghiệm 2', icon: '🌟', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
            { id: 'chem', name: 'Hóa học', fullName: 'Hóa Học', icon: '🧪', group: 'natural', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
            { id: 'bio', name: 'Sinh học', fullName: 'Sinh Học', icon: '🧬', group: 'natural', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
            { id: 'gdktpl', name: 'GDKTPL', fullName: 'GD Kinh Tế & Pháp Luật', icon: '⚖️', group: 'social', type: 'numeric', active: true, tx: [8.5, null, null], gk: null, ck: null, target: 8.0 },
            { id: 'tech', name: 'Công nghệ', fullName: 'Công Nghệ', icon: '⚙️', group: 'applied', type: 'numeric', active: false, tx: [null, null, null], gk: null, ck: null, target: 8.0 },
            { id: 'gddp', name: 'GD ĐP', fullName: 'Giáo Dục Địa Phương', icon: '🏮', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' }
        ];
        state.targetRank = 'gioi';
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    // NẠP ĐIỂM MẪU TOÀN DIỆN LỚP 11A7
    function loadDemo11A7() {
        state.subjects = [
            { id: 'math', name: 'Toán', fullName: 'Toán Học', icon: '📐', group: 'core', type: 'numeric', active: true, tx: [8.5, 8.0, 9.0], gk: 8.0, ck: null, target: 8.0 },
            { id: 'phy', name: 'Vật lý', fullName: 'Vật Lí', icon: '⚡', group: 'natural', type: 'numeric', active: true, tx: [7.5, 7.0, null], gk: 7.5, ck: null, target: 8.0 },
            { id: 'it', name: 'Tin học', fullName: 'Tin Học', icon: '💻', group: 'applied', type: 'numeric', active: true, tx: [9.0, 9.5, null], gk: 9.0, ck: null, target: 9.0 },
            { id: 'lit', name: 'Ngữ văn', fullName: 'Ngữ Văn', icon: '📚', group: 'core', type: 'numeric', active: true, tx: [7.5, 8.0, 8.0], gk: 7.5, ck: null, target: 8.0 },
            { id: 'his', name: 'Lịch Sử', fullName: 'Lịch Sử', icon: '🏛️', group: 'social', type: 'numeric', active: true, tx: [8.5, 9.0, null], gk: 8.5, ck: null, target: 8.0 },
            { id: 'geo', name: 'Địa Lý', fullName: 'Địa Lí', icon: '🌍', group: 'social', type: 'numeric', active: true, tx: [8.0, 8.5, null], gk: 8.0, ck: null, target: 8.0 },
            { id: 'eng', name: 'Ngoại ngữ', fullName: 'Tiếng Anh', icon: '🇬🇧', group: 'core', type: 'numeric', active: true, tx: [9.0, 9.5, 9.0], gk: 9.0, ck: null, target: 9.0 },
            { id: 'qpan', name: 'GD QP-AN', fullName: 'Giáo Dục Quốc Phòng - AN', icon: '🎖️', group: 'applied', type: 'numeric', active: true, tx: [8.5, 9.0, null], gk: 8.5, ck: null, target: 8.0 },
            { id: 'pe', name: 'GDTC', fullName: 'Giáo Dục Thể Chất', icon: '🏃', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
            { id: 'hdtn', name: 'HĐTN2', fullName: 'Hoạt Động Trải Nghiệm 2', icon: '🌟', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' },
            { id: 'chem', name: 'Hóa học', fullName: 'Hóa Học', icon: '🧪', group: 'natural', type: 'numeric', active: false, tx: [7.0, null, null], gk: 7.0, ck: null, target: 6.5 },
            { id: 'bio', name: 'Sinh học', fullName: 'Sinh Học', icon: '🧬', group: 'natural', type: 'numeric', active: false, tx: [7.5, null, null], gk: 7.5, ck: null, target: 6.5 },
            { id: 'gdktpl', name: 'GDKTPL', fullName: 'GD Kinh Tế & Pháp Luật', icon: '⚖️', group: 'social', type: 'numeric', active: true, tx: [8.5, 9.0, null], gk: 8.5, ck: null, target: 8.0 },
            { id: 'tech', name: 'Công nghệ', fullName: 'Công Nghệ', icon: '⚙️', group: 'applied', type: 'numeric', active: false, tx: [8.0, null, null], gk: 8.0, ck: null, target: 6.5 },
            { id: 'gddp', name: 'GD ĐP', fullName: 'Giáo Dục Địa Phương', icon: '🏮', group: 'comment', type: 'comment', active: true, txComment: 'Đ', gkComment: 'Đ', ckComment: 'Đ', result: 'Đạt' }
        ];
        state.targetRank = 'xuatsac';
        saveState();
        renderGradeCalculator();
        if (window.AudioHelper && window.AudioHelper.playSuccess) window.AudioHelper.playSuccess();
    }

    // ĐẶT LẠI TOÀN BỘ (XÓA ĐIỂM ĐỂ NHẬP MỚI)
    function resetAllGrades() {
        if (!confirm('Bạn có chắc muốn xóa trắng bảng điểm để nhập lại từ đầu không?')) return;
        state.subjects.forEach(s => {
            if (s.type === 'numeric') {
                s.tx = [null, null, null];
                s.gk = null;
                s.ck = null;
            } else {
                s.txComment = 'Đ';
                s.gkComment = 'Đ';
                s.ckComment = 'Đ';
                s.result = 'Đạt';
            }
        });
        saveState();
        renderGradeCalculator();
    }

    // TÍNH MÀU SẮC BADGE ĐIỂM TRUNG BÌNH
    function getAverageBadge(avg, hasCk) {
        if (avg === null || isNaN(avg)) {
            return `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-500 border border-slate-700/60">—</span>`;
        }

        let bg = 'bg-slate-800 text-slate-300 border-slate-700';
        if (avg >= 9.0) bg = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        else if (avg >= 8.0) bg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        else if (avg >= 6.5) bg = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
        else if (avg >= 5.0) bg = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
        else bg = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';

        const statusTag = hasCk ? '' : '<span class="text-[9px] text-slate-400 block font-normal leading-none mt-0.5">(tạm tính)</span>';

        return `
            <div class="inline-flex flex-col items-center">
                <span class="px-2.5 py-0.5 rounded-lg text-sm font-mono font-black border shadow-sm ${bg}">
                    ${avg.toFixed(1)}
                </span>
                ${statusTag}
            </div>
        `;
    }

    // TÍNH BADGE DỰ BÁO ĐIỂM THI CUỐI KÌ
    function getPredictionBadge(sub, targetScore) {
        if (sub.type === 'comment') {
            return `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">✅ Đạt yêu cầu</span>`;
        }

        if (typeof sub.ck === 'number' && !isNaN(sub.ck)) {
            const avg = calcSubjectAverage(sub).average;
            const reached = avg >= targetScore;
            return `
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${reached ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}">
                    ${reached ? '✅ Đã thi: Đạt mục tiêu' : '⚠️ Đã thi: Chưa chạm mốc'}
                </span>
            `;
        }

        const needed = calcNeededExamScore(sub, targetScore);
        if (!needed) return '—';

        if (needed.isSafe) {
            return `<span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">✅ An toàn (Cần ≥ 0đ)</span>`;
        } else if (!needed.isFeasible) {
            return `<span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">⚠️ Cần > 10.0đ (Rất khó)</span>`;
        } else if (needed.neededScore <= 5.0) {
            return `<span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-teal-500/15 text-teal-300 border border-teal-500/25">Dễ: Cần ≥ <strong>${needed.neededScore.toFixed(1)}</strong></span>`;
        } else if (needed.neededScore <= 8.0) {
            return `<span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-sky-500/15 text-sky-300 border border-sky-500/25">Vừa sức: Cần ≥ <strong>${needed.neededScore.toFixed(1)}</strong></span>`;
        } else {
            return `<span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/25">Cần nỗ lực: Cần ≥ <strong>${needed.neededScore.toFixed(1)}</strong></span>`;
        }
    }

    // RENDER GIAO DIỆN CHÍNH
    function renderGradeCalculator(containerId) {
        const container = document.getElementById(containerId || 'gradeCalcContainer');
        if (!container) return;

        loadState();
        const evalResult = evaluateClassification(state.subjects);
        const targetVal = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));

        container.innerHTML = `
            <div class="w-full max-w-6xl mx-auto space-y-6 pb-14 animate-fadeIn font-sans">
                
                <!-- 1. HEADER & HERO BANNER -->
                <div class="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                    <div class="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                        <div class="space-y-1.5">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                                    <span>⚖️</span> <span>Chuẩn Thông Tư 22/2021/TT-BGDĐT</span>
                                </span>
                                <span class="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    THPT Lớp 11
                                </span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                                <span>📊</span> <span>Sổ Điểm Điện Tử &amp; Dự Báo Xếp Loại Học Sinh</span>
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                Bảng điểm chi tiết từng môn chuẩn giao diện VnEdu. Cột <strong class="text-emerald-300">ĐTB Môn</strong> tự động tính ngay khi bạn gõ điểm, và hệ thống tự giải ngược <strong class="text-amber-300">Điểm thi Cuối kì cần đạt</strong> để giành học bổng / xếp loại mong muốn!
                            </p>
                        </div>

                        <!-- Action Bar Buttons -->
                        <div class="flex items-center gap-2.5 flex-wrap">
                            <button type="button" id="gradeCalcVnEduBtn" class="px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2" title="Nạp đúng toàn bộ điểm trong ảnh chụp VnEdu">
                                <span>📸</span> <span>Nạp Điểm VnEdu (Hình Của Bạn)</span>
                            </button>
                            <button type="button" id="gradeCalcDemoBtn" class="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                <span>🎲</span> <span>Mẫu 11A7</span>
                            </button>
                            <button type="button" id="gradeCalcResetBtn" class="px-3 py-2.5 rounded-2xl text-xs font-bold bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/80 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                <span>🔄</span> <span>Xóa trắng</span>
                            </button>
                        </div>
                    </div>

                    <!-- 2. SUMMARY RANK & PREDICTION STATS -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-white/10">
                        
                        <!-- Cột 1: Xếp Loại Hiện Tại -->
                        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5 shadow-inner">
                            <div id="gradeRankBadge" class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0 shadow-lg">
                                ${evalResult.rankBadge}
                            </div>
                            <div class="min-w-0">
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dự báo Xếp Loại</div>
                                <div id="gradeRankTitle" class="text-lg sm:text-xl font-black text-white truncate">${evalResult.rankTitle}</div>
                                <div id="gradeRankDesc" class="text-[11px] text-slate-400 truncate">${evalResult.rankDescription}</div>
                            </div>
                        </div>

                        <!-- Cột 2: Điểm Trung Bình Chung & Thống kê mốc -->
                        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                            <div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ĐTB Chung Tích Lũy</div>
                                <div id="gradeOverallAverage" class="text-2xl font-black text-emerald-400">${evalResult.overallAvg.toFixed(1)}</div>
                                <div id="gradeActiveCount" class="text-[11px] text-slate-400">Từ ${evalResult.totalActive} môn tính điểm</div>
                            </div>
                            <div class="flex flex-col gap-1 text-[11px] font-mono text-right">
                                <span id="gradeCountGte9" class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                                    ${evalResult.countGte9} môn ≥ 9.0
                                </span>
                                <span id="gradeCountGte8" class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                                    ${evalResult.countGte8} môn ≥ 8.0
                                </span>
                                <span id="gradeCountGte65" class="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold">
                                    ${evalResult.countGte65} môn ≥ 6.5
                                </span>
                            </div>
                        </div>

                        <!-- Cột 3: Trạng thái môn khống chế -->
                        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-1.5 shadow-inner">
                            <div class="flex items-center justify-between text-[11px] font-bold">
                                <span class="text-slate-400 uppercase text-[10px]">Môn Thấp Nhất (Khống Chế)</span>
                                <span id="gradeMinScore" class="font-mono ${evalResult.minScore >= 6.5 ? 'text-emerald-400' : 'text-rose-400 font-bold'}">
                                    Min: ${evalResult.minScore.toFixed(1)}
                                </span>
                            </div>
                            <div id="gradeControlStatus" class="text-xs ${evalResult.minScore >= 6.5 ? 'text-emerald-300' : 'text-rose-300'} font-semibold">
                                ${evalResult.minScore >= 6.5 
                                    ? '✅ An toàn: Tất cả các môn đều ≥ 6.5 (đủ chuẩn Giỏi/Xuất Sắc)' 
                                    : '⚠️ Cảnh báo: Có môn < 6.5, cần kéo điểm thi để không bị hạ bậc!'}
                            </div>
                            <div class="text-[10px] text-slate-500">
                                Môn nhận xét (GDTC, HĐTN, GD ĐP): <strong id="gradeCommentStatus" class="${evalResult.allCommentsPassed ? 'text-emerald-400' : 'text-rose-400'}">${evalResult.allCommentsPassed ? 'Đạt' : 'Chưa Đạt'}</strong>
                            </div>
                        </div>

                    </div>

                    <!-- Chiến lược & Đề xuất AI -->
                    <div id="gradeStrategyAdvice" class="${evalResult.recommendations.length > 0 ? '' : 'hidden'} mt-3.5 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 space-y-1 text-xs text-indigo-200">
                        <div class="font-black text-indigo-300 flex items-center gap-1.5">
                            <span>💡</span> <span>Chiến Lược Tối Ưu Điểm Thi (Gợi Ý Tự Động):</span>
                        </div>
                        <ul id="gradeAdviceList" class="space-y-1 pl-4 list-disc">
                            ${evalResult.recommendations.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>

                </div>

                <!-- 3. BẢNG SỔ ĐIỂM CHI TIẾT (THEO ĐÚNG HÌNH ẢNH VNEDU CỦA USER) -->
                <div class="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                    
                    <!-- Toolbar trên đầu bảng -->
                    <div class="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black">
                                📑
                            </span>
                            <div>
                                <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <span>Điểm Chi Tiết Từng Môn</span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/15 text-teal-300 border border-teal-500/30">Chuẩn VnEdu</span>
                                </h3>
                                <p class="text-xs text-slate-400">Gõ điểm trực tiếp vào từng ô • Cột ĐTB và Dự báo thi học kì sẽ tự động nhảy số tức thì</p>
                            </div>
                        </div>

                        <!-- Bộ chọn mục tiêu xếp loại phấn đấu -->
                        <div class="flex items-center gap-2">
                            <label for="gradeCalcTargetSelect" class="text-xs text-slate-400 font-bold hidden sm:inline">Mục tiêu thi HK:</label>
                            <select id="gradeCalcTargetSelect" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400 transition-all cursor-pointer">
                                <option value="xuatsac" ${state.targetRank === 'xuatsac' ? 'selected' : ''}>🏆 Học Sinh Xuất Sắc (≥ 9.0)</option>
                                <option value="gioi" ${state.targetRank === 'gioi' ? 'selected' : ''}>🥇 Học Sinh Giỏi (≥ 8.0)</option>
                                <option value="kha" ${state.targetRank === 'kha' ? 'selected' : ''}>🥈 Học Sinh Khá (≥ 6.5)</option>
                                <option value="dat" ${state.targetRank === 'dat' ? 'selected' : ''}>🥉 Mức Đạt (≥ 5.0)</option>
                            </select>
                        </div>
                    </div>

                    <!-- BẢNG NHẬP ĐIỂM DẠNG EXCEL / VNEDU (TABLE VIEW) -->
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse min-w-[760px]">
                            <thead>
                                <!-- Hàng Tiêu Đề 1 (Chuẩn Màu Xanh Teal VnEdu) -->
                                <tr class="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white text-xs font-black uppercase tracking-wider">
                                    <th rowspan="2" class="py-2.5 px-3 text-center border-r border-teal-500/40 w-12">TT</th>
                                    <th rowspan="2" class="py-2.5 px-3.5 border-r border-teal-500/40 min-w-[140px]">Môn</th>
                                    <th colspan="3" class="py-1.5 px-2 text-center border-r border-teal-500/40 border-b border-teal-500/40">
                                        ĐGTX (Thường Xuyên x1)
                                    </th>
                                    <th rowspan="2" class="py-2.5 px-3 text-center border-r border-teal-500/40 w-20">
                                        ĐGGK<br><span class="text-[10px] font-normal lowercase">(hệ số 2)</span>
                                    </th>
                                    <th rowspan="2" class="py-2.5 px-3 text-center border-r border-teal-500/40 w-20">
                                        ĐGCK<br><span class="text-[10px] font-normal lowercase">(hệ số 3)</span>
                                    </th>
                                    <th rowspan="2" class="py-2.5 px-3 text-center border-r border-teal-500/40 w-24 bg-teal-800/80">
                                        ĐTB Môn<br><span class="text-[10px] font-normal lowercase text-emerald-300">★ Tự tính</span>
                                    </th>
                                    <th rowspan="2" class="py-2.5 px-3.5 text-center min-w-[150px] bg-slate-950/40">
                                        Dự Báo Thi CK<br><span class="text-[10px] font-normal lowercase text-amber-300">Mục tiêu: ${state.targetRank.toUpperCase()}</span>
                                    </th>
                                    <th rowspan="2" class="py-2.5 px-2 text-center w-12 text-[10px]">Học</th>
                                </tr>
                                <!-- Hàng Tiêu Đề 2: Cột con Thường xuyên 1, 2, 3 -->
                                <tr class="bg-teal-700/90 text-teal-100 text-[11px] font-bold text-center">
                                    <th class="py-1 px-1.5 border-r border-teal-500/40 w-14">1</th>
                                    <th class="py-1 px-1.5 border-r border-teal-500/40 w-14">2</th>
                                    <th class="py-1 px-1.5 border-r border-teal-500/40 w-14">3</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 text-xs text-slate-200">
                                ${state.subjects.map((sub, idx) => {
                                    const isNumeric = sub.type === 'numeric';
                                    const subAvg = calcSubjectAverage(sub);
                                    const rowBg = idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-850/40';
                                    const opacityClass = sub.active ? '' : 'opacity-40 grayscale';

                                    if (isNumeric) {
                                        const tx0 = (sub.tx && sub.tx[0] !== null && sub.tx[0] !== undefined) ? sub.tx[0] : '';
                                        const tx1 = (sub.tx && sub.tx[1] !== null && sub.tx[1] !== undefined) ? sub.tx[1] : '';
                                        const tx2 = (sub.tx && sub.tx[2] !== null && sub.tx[2] !== undefined) ? sub.tx[2] : '';
                                        const gkVal = (sub.gk !== null && sub.gk !== undefined) ? sub.gk : '';
                                        const ckVal = (sub.ck !== null && sub.ck !== undefined) ? sub.ck : '';

                                        return `
                                            <tr class="grade-table-row hover:bg-slate-800/60 transition-colors ${rowBg} ${opacityClass}" data-sub-id="${sub.id}">
                                                <!-- TT -->
                                                <td class="py-2 px-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                                                    ${idx + 1}
                                                </td>

                                                <!-- Tên Môn -->
                                                <td class="py-2 px-3 border-r border-slate-800/80">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-base">${sub.icon}</span>
                                                        <div>
                                                            <div class="font-black text-white text-xs sm:text-sm">${sub.name}</div>
                                                            <div class="text-[10px] text-slate-400">${sub.fullName}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <!-- TX 1 -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80">
                                                    <input type="number" step="0.1" min="0" max="10" placeholder="-" 
                                                           value="${tx0}" 
                                                           data-sub-id="${sub.id}" data-field="tx" data-tx-index="0"
                                                           class="grade-cell-input w-12 sm:w-13 h-8 text-center text-xs font-mono font-bold bg-slate-950/80 border border-slate-700/80 focus:border-teal-400 focus:bg-slate-900 rounded-lg text-white outline-none transition-all">
                                                </td>

                                                <!-- TX 2 -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80">
                                                    <input type="number" step="0.1" min="0" max="10" placeholder="-" 
                                                           value="${tx1}" 
                                                           data-sub-id="${sub.id}" data-field="tx" data-tx-index="1"
                                                           class="grade-cell-input w-12 sm:w-13 h-8 text-center text-xs font-mono font-bold bg-slate-950/80 border border-slate-700/80 focus:border-teal-400 focus:bg-slate-900 rounded-lg text-white outline-none transition-all">
                                                </td>

                                                <!-- TX 3 -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80">
                                                    <input type="number" step="0.1" min="0" max="10" placeholder="-" 
                                                           value="${tx2}" 
                                                           data-sub-id="${sub.id}" data-field="tx" data-tx-index="2"
                                                           class="grade-cell-input w-12 sm:w-13 h-8 text-center text-xs font-mono font-bold bg-slate-950/80 border border-slate-700/80 focus:border-teal-400 focus:bg-slate-900 rounded-lg text-white outline-none transition-all">
                                                </td>

                                                <!-- ĐGGK (x2) -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 bg-teal-950/15">
                                                    <input type="number" step="0.1" min="0" max="10" placeholder="-" 
                                                           value="${gkVal}" 
                                                           data-sub-id="${sub.id}" data-field="gk"
                                                           class="grade-cell-input w-13 sm:w-14 h-8 text-center text-xs font-mono font-black bg-slate-950/90 border border-teal-500/40 focus:border-teal-400 focus:bg-slate-900 rounded-lg text-teal-200 outline-none transition-all">
                                                </td>

                                                <!-- ĐGCK (x3 - Thi HK) -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 bg-amber-950/15">
                                                    <input type="number" step="0.1" min="0" max="10" placeholder="Chưa" 
                                                           value="${ckVal}" 
                                                           data-sub-id="${sub.id}" data-field="ck"
                                                           class="grade-cell-input w-13 sm:w-14 h-8 text-center text-xs font-mono font-black bg-slate-950/90 border border-amber-500/40 focus:border-amber-400 focus:bg-slate-900 rounded-lg text-amber-200 outline-none transition-all"
                                                           title="Điểm thi học kì cuối kì (hệ số 3). Để trống nếu chưa thi để hệ thống tự dự báo!">
                                                </td>

                                                <!-- ĐTB Môn (Tự tính) -->
                                                <td class="py-2 px-2 text-center border-r border-slate-800/80 bg-slate-950/50" data-cell-role="average">
                                                    ${getAverageBadge(subAvg.average, subAvg.hasCk)}
                                                </td>

                                                <!-- Dự Báo Thi CK -->
                                                <td class="py-2 px-3 text-center border-r border-slate-800/80" data-cell-role="prediction">
                                                    ${getPredictionBadge(sub, targetVal)}
                                                </td>

                                                <!-- Checkbox Học Môn Này -->
                                                <td class="py-2 px-2 text-center">
                                                    <input type="checkbox" data-sub-id="${sub.id}" class="sub-active-checkbox w-4 h-4 rounded text-teal-600 bg-slate-800 border-slate-700 focus:ring-teal-500 cursor-pointer" ${sub.active ? 'checked' : ''} title="Tích chọn nếu bạn học môn này">
                                                </td>
                                            </tr>
                                        `;
                                    } else {
                                        // MÔN NHẬN XÉT (GDTC, HĐTN, GD ĐP)
                                        const isPassed = sub.result === 'Đạt';
                                        return `
                                            <tr class="grade-table-row hover:bg-slate-800/60 transition-colors ${rowBg} ${opacityClass}" data-sub-id="${sub.id}">
                                                <!-- TT -->
                                                <td class="py-2 px-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                                                    ${idx + 1}
                                                </td>

                                                <!-- Tên Môn -->
                                                <td class="py-2 px-3 border-r border-slate-800/80">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-base">${sub.icon}</span>
                                                        <div>
                                                            <div class="font-black text-white text-xs sm:text-sm">${sub.name}</div>
                                                            <div class="text-[10px] text-slate-400">${sub.fullName} (Nhận xét)</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <!-- TX 1 (Đ / CĐ) -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80">
                                                    <button type="button" data-sub-id="${sub.id}" data-toggle-comment="tx" class="px-2 py-1 rounded-md text-xs font-mono font-bold ${sub.txComment === 'Đ' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                                                        ${sub.txComment || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- TX 2 -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 text-slate-600 font-mono">
                                                    —
                                                </td>

                                                <!-- TX 3 -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 text-slate-600 font-mono">
                                                    —
                                                </td>

                                                <!-- ĐGGK (Đ / CĐ) -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 bg-teal-950/15">
                                                    <button type="button" data-sub-id="${sub.id}" data-toggle-comment="gk" class="px-2 py-1 rounded-md text-xs font-mono font-bold ${sub.gkComment === 'Đ' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                                                        ${sub.gkComment || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- ĐGCK -->
                                                <td class="py-1 px-1 text-center border-r border-slate-800/80 bg-amber-950/15">
                                                    <button type="button" data-sub-id="${sub.id}" data-toggle-comment="ck" class="px-2 py-1 rounded-md text-xs font-mono font-bold ${sub.ckComment === 'Đ' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                                                        ${sub.ckComment || 'Đ'}
                                                    </button>
                                                </td>

                                                <!-- ĐTB Môn -->
                                                <td class="py-2 px-2 text-center border-r border-slate-800/80 bg-slate-950/50">
                                                    <span class="px-2.5 py-0.5 rounded-lg text-xs font-black border ${isPassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}">
                                                        ${isPassed ? 'Đạt' : 'Chưa Đạt'}
                                                    </span>
                                                </td>

                                                <!-- Dự Báo -->
                                                <td class="py-2 px-3 text-center border-r border-slate-800/80">
                                                    <span class="text-[11px] font-bold text-emerald-400">
                                                        ✅ Môn Đánh Giá Nhận Xét
                                                    </span>
                                                </td>

                                                <!-- Checkbox -->
                                                <td class="py-2 px-2 text-center">
                                                    <input type="checkbox" data-sub-id="${sub.id}" class="sub-active-checkbox w-4 h-4 rounded text-teal-600 bg-slate-800 border-slate-700 focus:ring-teal-500 cursor-pointer" ${sub.active ? 'checked' : ''}>
                                                </td>
                                            </tr>
                                        `;
                                    }
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- FOOTER HƯỚNG DẪN DƯỚI BẢNG -->
                    <div class="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400">
                        <div class="flex items-center gap-2">
                            <span class="text-teal-400 font-bold">ℹ️ Lưu ý:</span>
                            <span>Ô để trống <strong class="text-slate-300">"Chưa"</strong> ở cột ĐGCK tức là chưa thi cuối kì. Hệ thống sẽ tự tính điểm thi cần đạt để bạn giữ được danh hiệu!</span>
                        </div>
                        <div class="text-[11px] text-slate-500 font-mono">
                            Hệ số TT22: TX × 1, GK × 2, CK × 3
                        </div>
                    </div>

                </div>

            </div>
        `;

        // BIND EVENT LISTENERS
        bindEvents(container, containerId);
    }

    // GẮN SỰ KIỆN TƯƠNG TÁC THỜI GIAN THỰC (REALTIME CALCULATION)
    function bindEvents(container, containerId) {
        // Nút nạp điểm ảnh VnEdu
        const vnEduBtn = container.querySelector('#gradeCalcVnEduBtn');
        if (vnEduBtn) {
            vnEduBtn.onclick = () => loadVnEduPhotoData();
        }

        // Nút điểm mẫu 11A7
        const demoBtn = container.querySelector('#gradeCalcDemoBtn');
        if (demoBtn) {
            demoBtn.onclick = () => loadDemo11A7();
        }

        // Nút xóa trắng
        const resetBtn = container.querySelector('#gradeCalcResetBtn');
        if (resetBtn) {
            resetBtn.onclick = () => resetAllGrades();
        }

        // Dropdown mục tiêu xếp loại
        const targetSelect = container.querySelector('#gradeCalcTargetSelect');
        if (targetSelect) {
            targetSelect.onchange = (e) => {
                state.targetRank = e.target.value;
                saveState();
                renderGradeCalculator(containerId);
            };
        }

        // Checkbox bật/tắt môn học
        container.querySelectorAll('.sub-active-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                const subId = e.target.dataset.subId;
                const sub = state.subjects.find(s => s.id === subId);
                if (sub) {
                    sub.active = e.target.checked;
                    saveState();
                    renderGradeCalculator(containerId);
                }
            };
        });

        // Toggle môn nhận xét (Đ / CĐ)
        container.querySelectorAll('button[data-toggle-comment]').forEach(btn => {
            btn.onclick = () => {
                const subId = btn.dataset.subId;
                const field = btn.dataset.toggleComment;
                const sub = state.subjects.find(s => s.id === subId);
                if (sub) {
                    const key = field + 'Comment';
                    sub[key] = (sub[key] === 'Đ') ? 'CĐ' : 'Đ';
                    // Nếu có ít nhất 1 CĐ thì kết quả là Chưa Đạt
                    sub.result = (sub.txComment === 'CĐ' || sub.gkComment === 'CĐ' || sub.ckComment === 'CĐ') ? 'Chưa Đạt' : 'Đạt';
                    saveState();
                    renderGradeCalculator(containerId);
                }
            };
        });

        // INPUT ĐIỂM SỐ REALTIME (Tự tính tức thì không cần reload)
        container.querySelectorAll('.grade-cell-input').forEach(inp => {
            inp.oninput = (e) => {
                const inputEl = e.target;
                const subId = inputEl.dataset.subId;
                const field = inputEl.dataset.field;
                const txIdx = inputEl.dataset.txIndex;
                const rawVal = inputEl.value.trim();

                const sub = state.subjects.find(s => s.id === subId);
                if (!sub) return;

                let numVal = null;
                if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                    numVal = Math.min(10, Math.max(0, parseFloat(rawVal)));
                }

                if (field === 'tx') {
                    if (!Array.isArray(sub.tx)) sub.tx = [null, null, null];
                    sub.tx[parseInt(txIdx, 10)] = numVal;
                } else if (field === 'gk') {
                    sub.gk = numVal;
                } else if (field === 'ck') {
                    sub.ck = numVal;
                }

                saveState();

                // Cập nhật cell ĐTB Môn và Dự Báo của hàng đó ngay lập tức
                const row = inputEl.closest('.grade-table-row');
                if (row) {
                    const targetVal = state.targetRank === 'xuatsac' ? 9.0 : (state.targetRank === 'gioi' ? 8.0 : (state.targetRank === 'kha' ? 6.5 : 5.0));
                    const subAvg = calcSubjectAverage(sub);
                    
                    const avgCell = row.querySelector('[data-cell-role="average"]');
                    if (avgCell) {
                        avgCell.innerHTML = getAverageBadge(subAvg.average, subAvg.hasCk);
                    }

                    const predCell = row.querySelector('[data-cell-role="prediction"]');
                    if (predCell) {
                        predCell.innerHTML = getPredictionBadge(sub, targetVal);
                    }
                }

                // Cập nhật lại thanh tổng kết xếp loại trên cùng
                updateSummaryStats(container);
            };

            // Hỗ trợ phím Enter để nhảy sang ô tiếp theo như Excel
            inp.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const allInputs = Array.from(container.querySelectorAll('.grade-cell-input'));
                    const curIndex = allInputs.indexOf(inp);
                    if (curIndex >= 0 && curIndex < allInputs.length - 1) {
                        allInputs[curIndex + 1].focus();
                        allInputs[curIndex + 1].select();
                    }
                }
            };
        });
    }

    // CẬP NHẬT TỨC THÌ PHẦN TỔNG KẾT XẾP LOẠI MÀ KHÔNG GÂY MẤT FOCUS KHI ĐANG GÕ
    function updateSummaryStats(container) {
        const evalResult = evaluateClassification(state.subjects);

        const badgeEl = container.querySelector('#gradeRankBadge');
        if (badgeEl) badgeEl.innerHTML = evalResult.rankBadge;

        const titleEl = container.querySelector('#gradeRankTitle');
        if (titleEl) titleEl.innerText = evalResult.rankTitle;

        const descEl = container.querySelector('#gradeRankDesc');
        if (descEl) descEl.innerText = evalResult.rankDescription;

        const avgEl = container.querySelector('#gradeOverallAverage');
        if (avgEl) avgEl.innerText = evalResult.overallAvg.toFixed(1);

        const c9 = container.querySelector('#gradeCountGte9');
        if (c9) c9.innerText = `${evalResult.countGte9} môn ≥ 9.0`;

        const c8 = container.querySelector('#gradeCountGte8');
        if (c8) c8.innerText = `${evalResult.countGte8} môn ≥ 8.0`;

        const c65 = container.querySelector('#gradeCountGte65');
        if (c65) c65.innerText = `${evalResult.countGte65} môn ≥ 6.5`;

        const minEl = container.querySelector('#gradeMinScore');
        if (minEl) {
            minEl.innerText = `Min: ${evalResult.minScore.toFixed(1)}`;
            minEl.className = `font-mono ${evalResult.minScore >= 6.5 ? 'text-emerald-400' : 'text-rose-400 font-bold'}`;
        }

        const ctrlEl = container.querySelector('#gradeControlStatus');
        if (ctrlEl) {
            ctrlEl.innerText = evalResult.minScore >= 6.5 
                ? '✅ An toàn: Tất cả các môn đều ≥ 6.5 (đủ chuẩn Giỏi/Xuất Sắc)' 
                : '⚠️ Cảnh báo: Có môn < 6.5, cần kéo điểm thi để không bị hạ bậc!';
            ctrlEl.className = `text-xs ${evalResult.minScore >= 6.5 ? 'text-emerald-300' : 'text-rose-300'} font-semibold`;
        }

        // Lời khuyên AI
        const adviceBox = container.querySelector('#gradeStrategyAdvice');
        const adviceList = container.querySelector('#gradeAdviceList');
        if (adviceBox && adviceList) {
            if (evalResult.recommendations.length > 0) {
                adviceBox.classList.remove('hidden');
                adviceList.innerHTML = evalResult.recommendations.map(r => `<li>${r}</li>`).join('');
            } else {
                adviceBox.classList.add('hidden');
            }
        }
    }

    // EXPOSE GLOBAL API
    window.GradeCalcEngine = {
        render: renderGradeCalculator,
        loadVnEduPhotoData: loadVnEduPhotoData,
        loadDemo11A7: loadDemo11A7,
        resetAllGrades: resetAllGrades,
        getState: () => state,
        evaluate: () => evaluateClassification(state.subjects)
    };

})(window);
