// Azota Smart Text & File Parser
// Tự động phân tích đề thi từ văn bản dạng Word/PDF/Text
window.AzotaSmartParser = (function() {

    function parseRawText(rawText) {
        if (!rawText || !rawText.trim()) {
            throw new Error("Văn bản đề thi không được để trống!");
        }

        const lines = rawText.split(/\r?\n/).map(l => l.trimEnd());
        
        let examInfo = {
            title: "Đề thi mới (Nhập từ văn bản)",
            subject: "Khác",
            grade: "11",
            duration: 45,
            questions: []
        };

        // 1. Phân tích tiêu đề sơ bộ từ những dòng đầu tiên
        for (let i = 0; i < Math.min( lines.length, 10); i++) {
            const line = lines[i].trim();
            if (line.match(/(ĐỀ\s+THI|BÀI\s+KIỂM\s+TRA|ĐỀ\s+ÔN\s+TẬP|TEST|EXAM)/i)) {
                examInfo.title = line.replace(/^[#\*\-_\s]+/, '').trim();
                break;
            }
        }

        // Tự đoán môn học
        const fullTextLower = rawText.toLowerCase();
        if (fullTextLower.includes("tiếng anh") || fullTextLower.includes("english")) examInfo.subject = "Tiếng Anh";
        else if (fullTextLower.includes("lịch sử") || fullTextLower.includes("cách mạng tư sản")) examInfo.subject = "Lịch Sử";
        else if (fullTextLower.includes("gdkt") || fullTextLower.includes("kinh tế") || fullTextLower.includes("pháp luật")) examInfo.subject = "GDKT&PL";
        else if (fullTextLower.includes("toán") || fullTextLower.includes("tích phân") || fullTextLower.includes("hàm số")) examInfo.subject = "Toán Học";
        else if (fullTextLower.includes("vật lý") || fullTextLower.includes("dao động") || fullTextLower.includes("sóng cơ")) examInfo.subject = "Vật Lý";
        else if (fullTextLower.includes("hóa học") || fullTextLower.includes("este") || fullTextLower.includes("polime")) examInfo.subject = "Hóa Học";
        else if (fullTextLower.includes("sinh học") || fullTextLower.includes("nhiễm sắc thể")) examInfo.subject = "Sinh Học";
        else if (fullTextLower.includes("địa lý")) examInfo.subject = "Địa Lý";

        // Tự đoán thời gian
        const durationMatch = rawText.match(/(\d+)\s*(phút|mins|minutes)/i);
        if (durationMatch) {
            examInfo.duration = parseInt(durationMatch[1], 10);
        }

        // 2. Tách các câu hỏi bằng regex nhận diện mốc câu
        // Nhận diện: Câu 1:, Câu 1., Question 1:, Bài 1., 1. hoặc [Câu 1]
        const questionSplitRegex = /(?:^|\n)\s*(?:(?:Câu|Question|Bài)\s*(\d+)[:\.]?|(\d+)[\.\)])\s+/i;
        
        // Kiểm tra xem có bảng đáp án tổng hợp ở cuối bài không
        // Ví dụ: 1. A, 2. B, 3. C hoặc BẢNG ĐÁP ÁN: 1-A 2-B
        let globalAnswers = {};
        const answerSectionMatch = rawText.match(/(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY)[\s\S]*$/i);
        if (answerSectionMatch) {
            const ansSection = answerSectionMatch[0];
            const ansPairs = ansSection.matchAll(/(?:Câu\s*)?(\d+)\s*[\.\:\-\s]+\s*([A-DĐS])/gi);
            for (const pair of ansPairs) {
                globalAnswers[parseInt(pair[1], 10)] = pair[2].toUpperCase();
            }
        }

        // Tách câu hỏi
        let parts = rawText.split(/(?=(?:^|\n)\s*(?:(?:Câu|Question|Bài)\s*\d+[:\.]?|\d+[\.\)])\s+)/i);
        
        let qIndex = 1;
        const parsedQuestions = [];

        for (let part of parts) {
            part = part.trim();
            if (!part) continue;

            const headerMatch = part.match(/^(?:(?:Câu|Question|Bài)\s*(\d+)[:\.]?|(\d+)[\.\)])\s*(.*)/i);
            if (!headerMatch) {
                continue;
            }

            const foundNumber = headerMatch[1] || headerMatch[2];
            const currentQNum = foundNumber ? parseInt(foundNumber, 10) : qIndex;
            const contentAfterHeader = part.substring(headerMatch[0].indexOf(headerMatch[3] || ''));

            // Phân loại: Dạng câu hỏi Đúng/Sai 4 ý (a, b, c, d) hay Trắc nghiệm 4 lựa chọn (A, B, C, D)
            const isTrueFalseFormat = /(?:^|\n)\s*[a-d]\)\s+/i.test(part) && (part.includes("Đúng") || part.includes("Sai") || part.includes("đúng, sai"));

            if (isTrueFalseFormat) {
                // Parse dạng Đúng/Sai 4 ý
                parsedQuestions.push(parseTrueFalseQuestion(currentQNum, part));
            } else {
                // Parse dạng MCQ thông thường
                parsedQuestions.push(parseMCQQuestion(currentQNum, part, globalAnswers[currentQNum]));
            }
            qIndex++;
        }

        if (parsedQuestions.length === 0) {
            throw new Error("Không tìm thấy câu hỏi hợp lệ! Hãy chắc chắn văn bản có các câu hỏi bắt đầu bằng 'Câu 1:', 'Câu 2:' hoặc 'Question 1:' và các đáp án 'A.', 'B.', 'C.', 'D.'");
        }

        examInfo.questions = parsedQuestions;
        return examInfo;
    }

    function parseMCQQuestion(qNum, text, fallbackAnswer) {
        // Tách lời giải / giải thích nếu có
        let explain = "";
        const explainMatch = text.match(/(?:Hướng\s+dẫn\s+giải|Lời\s+giải|Giải\s+thích|Explain)[\s\:\-]+([\s\S]*?)(?=(?:$|\n\s*(?:Câu|Question|\d+[\.\)])))/i);
        if (explainMatch) {
            explain = explainMatch[1].trim();
            text = text.replace(explainMatch[0], "");
        }

        // Tách đáp án đúng trong câu nếu có
        let correctAnswer = fallbackAnswer || null;
        const ansMatch = text.match(/(?:Đáp\s+án|Đ\/A|Key|Chọn)[\s\:\-]+([A-D])/i);
        if (ansMatch) {
            correctAnswer = ansMatch[1].toUpperCase();
            text = text.replace(ansMatch[0], "");
        }

        // Tách nội dung câu hỏi và 4 lựa chọn A, B, C, D
        const optA_index = text.search(/(?:^|\n|\s{2,})(?:A[\.\)]|\(A\))\s+/);
        const optB_index = text.search(/(?:^|\n|\s{2,})(?:B[\.\)]|\(B\))\s+/);
        const optC_index = text.search(/(?:^|\n|\s{2,})(?:C[\.\)]|\(C\))\s+/);
        const optD_index = text.search(/(?:^|\n|\s{2,})(?:D[\.\)]|\(D\))\s+/);

        let questionText = text;
        let options = ["", "", "", ""];

        if (optA_index !== -1 && optB_index !== -1 && optC_index !== -1 && optD_index !== -1) {
            questionText = text.substring(0, optA_index).replace(/^(?:(?:Câu|Question|Bài)\s*\d+[:\.]?|\d+[\.\)])\s*/i, '').trim();

            const optA_text = text.substring(optA_index, optB_index).replace(/^(?:[\r\n\s]*(?:A[\.\)]|\(A\))\s*)/i, '').trim();
            const optB_text = text.substring(optB_index, optC_index).replace(/^(?:[\r\n\s]*(?:B[\.\)]|\(B\))\s*)/i, '').trim();
            const optC_text = text.substring(optC_index, optD_index).replace(/^(?:[\r\n\s]*(?:C[\.\)]|\(C\))\s*)/i, '').trim();
            const optD_text = text.substring(optD_index).replace(/^(?:[\r\n\s]*(?:D[\.\)]|\(D\))\s*)/i, '').trim();

            options = [optA_text, optB_text, optC_text, optD_text];
        } else {
            // Thử bắt theo regex tổng quát
            const optMatches = [...text.matchAll(/(?:^|\n|\s{2,})([A-D])[\.\)]\s*([^\n\r]*)/g)];
            if (optMatches.length >= 4) {
                questionText = text.substring(0, optMatches[0].index).replace(/^(?:(?:Câu|Question|Bài)\s*\d+[:\.]?|\d+[\.\)])\s*/i, '').trim();
                options = [optMatches[0][2].trim(), optMatches[1][2].trim(), optMatches[2][2].trim(), optMatches[3][2].trim()];
            } else {
                questionText = text.replace(/^(?:(?:Câu|Question|Bài)\s*\d+[:\.]?|\d+[\.\)])\s*/i, '').trim();
                options = ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"];
            }
        }

        // Tự động kiểm tra xem có dấu hiệu gạch chân hoặc bôi đậm đáp án không
        if (!correctAnswer) {
            // Nếu không có, mặc định tạm A để người dùng có thể sửa
            correctAnswer = "A";
        }

        const letters = ["A", "B", "C", "D"];
        const correctIndex = Math.max(0, letters.indexOf(correctAnswer));

        return {
            id: qNum,
            type: "mcq",
            question: questionText || `Câu hỏi số ${qNum}`,
            options: options,
            correct: correctAnswer,
            correct_index: correctIndex,
            explain: explain || `Đáp án đúng là ${correctAnswer}.`
        };
    }

    function parseTrueFalseQuestion(qNum, text) {
        // Tách câu hỏi Đúng Sai 4 ý a, b, c, d
        let introText = text.split(/(?:^|\n)\s*[a-d]\)\s+/i)[0].replace(/^(?:(?:Câu|Question|Bài)\s*\d+[:\.]?|\d+[\.\)])\s*/i, '').trim();
        
        const subItems = [];
        const subLetters = ['a', 'b', 'c', 'd'];
        
        for (let i = 0; i < subLetters.length; i++) {
            const letter = subLetters[i];
            const nextLetter = subLetters[i + 1];
            
            let regex;
            if (nextLetter) {
                regex = new RegExp(`(?:^|\\n)\\s*${letter}\\)\\s*([\\s\\S]*?)(?=(?:^|\\n)\\s*${nextLetter}\\)\\s*)`, 'i');
            } else {
                regex = new RegExp(`(?:^|\\n)\\s*${letter}\\)\\s*([\\s\\S]*)`, 'i');
            }
            
            const match = text.match(regex);
            if (match) {
                let subContent = match[1].trim();
                let ans = "Đ";
                if (subContent.match(/\b(Sai|S)\b/i)) {
                    ans = "S";
                }
                // Dọn dẹp nhãn (Đúng) hoặc (Sai) ở cuối
                subContent = subContent.replace(/[\(\[\{]?(?:Đúng|Sai|Đ|S)[\)\]\}]?\s*$/i, '').trim();
                
                subItems.push({
                    sub: letter.toUpperCase(),
                    text: subContent,
                    ans: ans,
                    explain: `Mệnh đề ${letter.toUpperCase()} là ${ans === 'Đ' ? 'ĐÚNG' : 'SAI'}.`
                });
            }
        }

        return {
            id: qNum,
            type: "true_false",
            question: introText || `Nhận định Đúng / Sai số ${qNum}`,
            items: subItems
        };
    }

    return {
        parseRawText: parseRawText
    };
})();
