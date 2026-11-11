/**
 * VOCABULARY STUDY SUITE (HỆ THỐNG HỌC TỪ VỰNG THÔNG MINH Aseta 2.5)
 * Dành cho Unit 4: ASEAN and Vietnam - 40 Từ Vựng Trọng Tâm THPT Trần Văn Giàu
 * 
 * Các tính năng cao cấp:
 * 1. 🎴 3D Flip Flashcards (Thẻ ghi nhớ 3D, Spaced Repetition Leitner, Auto-Play, Shuffle, Starred Filter)
 * 2. 👩‍🏫 Cô Khảo Bài Miệng 40/40 (Khảo ngẫu nhiên câu hỏi tiếng Việt của cô, lặp lại các câu sai cho đến khi thuộc 100%)
 * 3. ⚡ Speed Matching Game (Trò chơi ghép cặp từ vựng tốc độ cao có bấm giờ & lưu kỷ lục)
 * 4. ✍️ Spelling & Dictation Master (Luyện nghe & viết chính tả từ vựng, tự động kiểm tra, gợi ý)
 * 5. 🎯 Quick Speed Quiz (Trắc nghiệm nhanh 4 lựa chọn phản xạ từ - nghĩa)
 * 6. 📖 Full Reference Explorer (Bảng 40 từ tra cứu trực quan, phát âm, live search)
 * 7. 🏆 LocalStorage Persistence (Lưu từ gắn sao, từ đã thuộc, kỷ lục thời gian ghép thẻ, tiến độ cô khảo bài)
 */

(function (window) {
    'use strict';

    // DỮ LIỆU CHUẨN 40 TỪ VỰNG ĐẦU TIÊN TỪ CƯƠNG UNIT 4
    const UNIT4_VOCAB_DATA = [
        {
            stt: 1,
            primaryWord: "Volunteer",
            displayWord: "Volunteer / Volunteering / Compulsory",
            ipa: "/ˌvɒlənˈtɪər/",
            type: "n, v / v / adj",
            typeCategory: "all",
            primaryMeaning: "tình nguyện viên; làm tình nguyện",
            fullMeaning: "tình nguyện viên; làm tình nguyện (trái nghĩa: compulsory - bắt buộc)",
            teacherQuestion: "tình nguyện viên hoặc làm tình nguyện (trái nghĩa với bắt buộc)",
            example: "Many high school students volunteer to support local community projects.",
            exampleVi: "Nhiều học sinh cấp 3 tình nguyện hỗ trợ các dự án cộng đồng địa phương.",
            note: "Compulsory (adj) = bắt buộc, mandatory"
        },
        {
            stt: 2,
            primaryWord: "take part in",
            displayWord: "take part in",
            ipa: "/teɪk pɑːt ɪn/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "tham gia vào",
            fullMeaning: "tham gia vào (= participate in / join)",
            teacherQuestion: "tham gia vào một hoạt động hoặc sự kiện",
            example: "Vietnam actively takes part in various ASEAN youth exchange activities.",
            exampleVi: "Việt Nam tích cực tham gia vào nhiều hoạt động giao lưu thanh niên ASEAN.",
            note: "take part in = participate in = join"
        },
        {
            stt: 3,
            primaryWord: "Development",
            displayWord: "Development / develop / developmental",
            ipa: "/dɪˈveləpmənt/",
            type: "n / v / adj",
            typeCategory: "noun",
            primaryMeaning: "sự phát triển",
            fullMeaning: "sự phát triển / phát triển / thuộc về sự phát triển",
            teacherQuestion: "sự phát triển về kinh tế hoặc xã hội",
            example: "ASEAN countries work together for economic and cultural development.",
            exampleVi: "Các quốc gia ASEAN cùng hợp tác vì sự phát triển kinh tế và văn hóa.",
            note: "develop (v) -> development (n) -> developmental (adj)"
        },
        {
            stt: 4,
            primaryWord: "goals",
            displayWord: "goals / aim / objective",
            ipa: "/ɡəʊlz/",
            type: "n",
            typeCategory: "noun",
            primaryMeaning: "các mục tiêu",
            fullMeaning: "các mục tiêu, mục đích đặt ra",
            teacherQuestion: "các mục tiêu hoặc mục đích đề ra",
            example: "One of our main goals is to protect regional peace and stability.",
            exampleVi: "Một trong những mục tiêu chính của chúng ta là bảo vệ hòa bình và ổn định khu vực.",
            note: "set / achieve goals = đặt ra / đạt được mục tiêu"
        },
        {
            stt: 5,
            primaryWord: "qualified (for)",
            displayWord: "qualified (for) / qualify / qualification",
            ipa: "/ˈkwɒlɪfaɪd fɔːr/",
            type: "adj / v / n",
            typeCategory: "adj",
            primaryMeaning: "đủ tiêu chuẩn, đủ điều kiện",
            fullMeaning: "đủ tiêu chuẩn, đủ điều kiện/trình độ (cho) / bằng cấp",
            teacherQuestion: "đủ tiêu chuẩn, đủ điều kiện hoặc trình độ cho một vị trí",
            example: "Applicants must be qualified for the ASEAN youth leadership scholarship.",
            exampleVi: "Ứng viên phải đủ điều kiện nhận học bổng lãnh đạo thanh niên ASEAN.",
            note: "be qualified for N / to V; qualification (n) = bằng cấp"
        },
        {
            stt: 6,
            primaryWord: "suggest + V-ing",
            displayWord: "suggest + V-ing",
            ipa: "/səˈdʒest/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "đề xuất / gợi ý làm gì",
            fullMeaning: "đề xuất / gợi ý làm gì",
            teacherQuestion: "cấu trúc đề xuất hoặc gợi ý cùng làm việc gì",
            example: "The teacher suggested organizing a cultural exchange exhibition.",
            exampleVi: "Giáo viên đề xuất tổ chức một buổi triển lãm giao lưu văn hóa.",
            note: "suggest + V-ing / suggest that S + (should) + V-bare"
        },
        {
            stt: 7,
            primaryWord: "thank sb for V-ing",
            displayWord: "thank sb for V-ing",
            ipa: "/θæŋk/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "cảm ơn ai vì đã làm gì",
            fullMeaning: "cảm ơn ai vì đã làm việc gì đó",
            teacherQuestion: "cấu trúc cảm ơn ai vì đã làm điều gì đó",
            example: "We thanked the delegates for sharing their inspiring experiences.",
            exampleVi: "Chúng tôi cảm ơn các đại biểu vì đã chia sẻ những kinh nghiệm truyền cảm hứng.",
            note: "thank sb for doing sth / be thankful for sth"
        },
        {
            stt: 8,
            primaryWord: "community",
            displayWord: "community",
            ipa: "/kəˈmjuːnəti/",
            type: "n",
            typeCategory: "noun",
            primaryMeaning: "cộng đồng",
            fullMeaning: "cộng đồng",
            teacherQuestion: "cộng đồng những người cùng chung sống hoặc lợi ích",
            example: "ASEAN represents a united and dynamic regional community.",
            exampleVi: "ASEAN đại diện cho một cộng đồng khu vực đoàn kết và năng động.",
            note: "community service = phục vụ cộng đồng"
        },
        {
            stt: 9,
            primaryWord: "keen on",
            displayWord: "keen on / keenness",
            ipa: "/kiːn ɒn/",
            type: "phr.v / n",
            typeCategory: "phrase",
            primaryMeaning: "thích thú, hào hứng với",
            fullMeaning: "thích thú, hào hứng với (= fond of / interested in / excited about)",
            teacherQuestion: "thích thú, say mê hoặc hào hứng với điều gì",
            example: "Vietnamese teenagers are very keen on joining international volunteer programs.",
            exampleVi: "Thanh thiếu niên Việt Nam rất hào hứng tham gia các chương trình tình nguyện quốc tế.",
            note: "be keen on + V-ing / N = be fond of = be interested in"
        },
        {
            stt: 10,
            primaryWord: "depend on",
            displayWord: "depend on / reliant on",
            ipa: "/dɪˈpend ɒn/",
            type: "phr.v",
            typeCategory: "phrase",
            primaryMeaning: "phụ thuộc vào",
            fullMeaning: "phụ thuộc vào (= rely on)",
            teacherQuestion: "phụ thuộc hoặc dựa dẫm vào ai hoặc cái gì",
            example: "The success of our presentation depends on great teamwork and preparation.",
            exampleVi: "Sự thành công của bài thuyết trình phụ thuộc vào tinh thần làm việc nhóm và chuẩn bị chu đáo.",
            note: "depend on = rely on; independent (adj) = độc lập"
        },
        {
            stt: 11,
            primaryWord: "leadership skills",
            displayWord: "leadership skills",
            ipa: "/ˈliːdəʃɪp skɪlz/",
            type: "n.phr",
            typeCategory: "noun",
            primaryMeaning: "kỹ năng lãnh đạo",
            fullMeaning: "các kỹ năng lãnh đạo",
            teacherQuestion: "các kỹ năng lãnh đạo, dẫn dắt đội ngũ",
            example: "Leading school clubs helps students develop strong leadership skills.",
            exampleVi: "Dẫn dắt các câu lạc bộ trường học giúp học sinh rèn luyện kỹ năng lãnh đạo vững vàng.",
            note: "leader (n) -> leadership (n)"
        },
        {
            stt: 12,
            primaryWord: "contribution",
            displayWord: "Contribution / make contribution / contributor / contribute to",
            ipa: "/ˌkɒntrɪˈbjuːʃn/",
            type: "n / v.phr / n / v",
            typeCategory: "noun",
            primaryMeaning: "sự đóng góp, cống hiến",
            fullMeaning: "sự đóng góp, cống hiến / người đóng góp / đóng góp vào",
            teacherQuestion: "sự đóng góp, cống hiến cho tập thể hoặc xã hội",
            example: "Vietnam has made significant contributions to the prosperity of ASEAN.",
            exampleVi: "Việt Nam đã có những đóng góp to lớn vào sự thịnh vượng của ASEAN.",
            note: "make a contribution to = contribute to + V-ing/N"
        },
        {
            stt: 13,
            primaryWord: "cultural exchange",
            displayWord: "cultural exchange",
            ipa: "/ˈkʌltʃərəl ɪksˈtʃeɪndʒ/",
            type: "n.phr",
            typeCategory: "noun",
            primaryMeaning: "giao lưu / trao đổi văn hóa",
            fullMeaning: "sự giao lưu / trao đổi văn hóa",
            teacherQuestion: "sự giao lưu, trao đổi văn hóa giữa các quốc gia",
            example: "Cultural exchange festivals bring ASEAN youth closer together.",
            exampleVi: "Các lễ hội giao lưu văn hóa giúp thanh niên ASEAN gắn kết gần nhau hơn.",
            note: "culture (n) -> cultural (adj)"
        },
        {
            stt: 14,
            primaryWord: "current issues",
            displayWord: "current issues",
            ipa: "/ˈkʌrənt ˈɪʃuːz/",
            type: "n.phr",
            typeCategory: "noun",
            primaryMeaning: "các vấn đề thời sự, hiện nay",
            fullMeaning: "các vấn đề hiện tại / vấn đề thời sự nóng hổi",
            teacherQuestion: "các vấn đề thời sự, vấn đề đang diễn ra hiện nay",
            example: "The summit focused on current issues such as clean energy and food security.",
            exampleVi: "Hội nghị thượng đỉnh tập trung vào các vấn đề thời sự như năng lượng sạch và an ninh lương thực.",
            note: "current (adj) = hiện nay, hiện hành"
        },
        {
            stt: 15,
            primaryWord: "climate change",
            displayWord: "climate change",
            ipa: "/ˈklaɪmət tʃeɪndʒ/",
            type: "n.phr",
            typeCategory: "noun",
            primaryMeaning: "biến đổi khí hậu",
            fullMeaning: "biến đổi khí hậu toàn cầu",
            teacherQuestion: "hiện tượng biến đổi khí hậu trên trái đất",
            example: "All Southeast Asian countries are taking urgent actions to fight climate change.",
            exampleVi: "Tất cả các nước Đông Nam Á đang hành động khẩn trương để chống lại biến đổi khí hậu.",
            note: "fight / combat / tackle climate change"
        },
        {
            stt: 16,
            primaryWord: "convenient",
            displayWord: "convenient / convenience",
            ipa: "/kənˈviːniənt/",
            type: "adj",
            typeCategory: "adj",
            primaryMeaning: "thuận tiện, tiện lợi",
            fullMeaning: "thuận tiện, tiện lợi",
            teacherQuestion: "thuận tiện, tiện lợi, dễ dàng sử dụng",
            example: "Online meeting apps make it convenient for delegates to discuss remotely.",
            exampleVi: "Các ứng dụng họp trực tuyến giúp các đại biểu thảo luận từ xa rất thuận tiện.",
            note: "inconvenient (adj) = bất tiện; convenience (n)"
        },
        {
            stt: 17,
            primaryWord: "ability",
            displayWord: "Ability / inability / disability",
            ipa: "/əˈbɪləti/",
            type: "n / n / n",
            typeCategory: "noun",
            primaryMeaning: "khả năng, năng lực",
            fullMeaning: "khả năng, năng lực / không có khả năng / sự khuyết tật",
            teacherQuestion: "khả năng, năng lực làm được việc gì đó",
            example: "She has an outstanding ability to communicate in multiple foreign languages.",
            exampleVi: "Cô ấy có khả năng xuất sắc trong việc giao tiếp bằng nhiều ngoại ngữ.",
            note: "have the ability to do sth; disabled (adj)"
        },
        {
            stt: 18,
            primaryWord: "managed to",
            displayWord: "managed to (+ V-inf)",
            ipa: "/ˈmænɪdʒd tuː/",
            type: "v.phr",
            typeCategory: "verb",
            primaryMeaning: "xoay xở / làm được việc khó",
            fullMeaning: "đã xoay xở / thành công làm được việc gì khó khăn",
            teacherQuestion: "xoay xở hoặc thành công làm được một việc khó khăn",
            example: "Despite technical difficulties, the organizers managed to complete the workshop on time.",
            exampleVi: "Bất chấp khó khăn kỹ thuật, ban tổ chức đã xoay xở hoàn thành buổi hội thảo đúng giờ.",
            note: "manage to do sth = succeed in doing sth"
        },
        {
            stt: 19,
            primaryWord: "reach",
            displayWord: "reach",
            ipa: "/riːtʃ/",
            type: "v",
            typeCategory: "verb",
            primaryMeaning: "đạt tới, chạm đến, tiếp cận",
            fullMeaning: "đạt tới, chạm đến, tiếp cận",
            teacherQuestion: "đạt tới mục tiêu, chạm đến hoặc tiếp cận",
            example: "ASEAN leaders hope to reach an agreement on carbon reduction targets.",
            exampleVi: "Các nhà lãnh đạo ASEAN hy vọng đạt được một thỏa thuận về mục tiêu giảm phát thải carbon.",
            note: "reach an agreement / reach a goal"
        },
        {
            stt: 20,
            primaryWord: "aim",
            displayWord: "aim (at) / goal / purpose",
            ipa: "/eɪm/",
            type: "n, v",
            typeCategory: "verb",
            primaryMeaning: "mục đích, mục tiêu; hướng tới",
            fullMeaning: "mục đích, mục tiêu; hướng tới",
            teacherQuestion: "mục đích, mục tiêu đề ra hoặc nhắm tới",
            example: "The campaign aims to raise youth awareness about wildlife protection.",
            exampleVi: "Chiến dịch hướng tới mục tiêu nâng cao nhận thức giới trẻ về bảo vệ động vật hoang dã.",
            note: "aim at + V-ing / aim to do sth"
        },
        {
            stt: 21,
            primaryWord: "various",
            displayWord: "Various = diverse",
            ipa: "/ˈveəriəs/",
            type: "adj",
            typeCategory: "adj",
            primaryMeaning: "đa dạng, nhiều loại khác nhau",
            fullMeaning: "đa dạng, nhiều loại khác nhau (= diverse)",
            teacherQuestion: "tính từ chỉ sự đa dạng, nhiều thể loại khác nhau",
            example: "Participants come from various cultural backgrounds across Southeast Asia.",
            exampleVi: "Những người tham gia đến từ nhiều nền văn hóa đa dạng khắp Đông Nam Á.",
            note: "various = diverse; vary (v)"
        },
        {
            stt: 22,
            primaryWord: "variety",
            displayWord: "Variety = diversity / a variety of N",
            ipa: "/vəˈraɪəti/",
            type: "n",
            typeCategory: "noun",
            primaryMeaning: "sự đa dạng",
            fullMeaning: "sự đa dạng (= diversity / a variety of: nhiều thứ khác nhau)",
            teacherQuestion: "danh từ chỉ sự đa dạng, phong phú nhiều loại",
            example: "The ASEAN food festival offered a wide variety of traditional dishes.",
            exampleVi: "Lễ hội ẩm thực ASEAN mang đến sự đa dạng phong phú các món ăn truyền thống.",
            note: "a variety of + plural noun = a wide range of"
        },
        {
            stt: 23,
            primaryWord: "participant",
            displayWord: "Participant / participation",
            ipa: "/pɑːˈtɪsɪpənt/",
            type: "n / n",
            typeCategory: "noun",
            primaryMeaning: "người tham gia",
            fullMeaning: "người tham gia / sự tham gia, góp mặt, tham dự",
            teacherQuestion: "người tham gia, người góp mặt trong sự kiện",
            example: "Each participant received a certificate of completion at the end of the summit.",
            exampleVi: "Mỗi người tham gia đều nhận được giấy chứng nhận hoàn thành khi kết thúc hội nghị.",
            note: "participate in (v) -> participant (n người) -> participation (n sự)"
        },
        {
            stt: 24,
            primaryWord: "take place",
            displayWord: "take place",
            ipa: "/teɪk pleɪs/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "diễn ra (có kế hoạch trước)",
            fullMeaning: "diễn ra (= occur / happen theo lịch trình định sẵn)",
            teacherQuestion: "diễn ra theo kế hoạch hoặc lịch trình định sẵn",
            example: "The 43rd ASEAN Summit took place in Jakarta, Indonesia.",
            exampleVi: "Hội nghị cấp cao ASEAN lần thứ 43 đã diễn ra tại Jakarta, Indonesia.",
            note: "take place (có kế hoạch) # happen (bất ngờ, ngẫu nhiên)"
        },
        {
            stt: 25,
            primaryWord: "live-streamed",
            displayWord: "live-streamed",
            ipa: "/ˈlaɪv striːmd/",
            type: "adj/v",
            typeCategory: "verb",
            primaryMeaning: "phát sóng trực tiếp qua mạng",
            fullMeaning: "được phát sóng trực tiếp (qua mạng Internet)",
            teacherQuestion: "được phát sóng trực tiếp qua mạng Internet",
            example: "The opening ceremony was live-streamed to millions of viewers worldwide.",
            exampleVi: "Lễ khai mạc được phát sóng trực tiếp tới hàng triệu khán giả trên toàn thế giới.",
            note: "broadcast live / streamed online in real time"
        },
        {
            stt: 26,
            primaryWord: "raise awareness",
            displayWord: "raise awareness (of / about)",
            ipa: "/reɪz əˈweənəs/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "nâng cao nhận thức",
            fullMeaning: "nâng cao nhận thức (về một vấn đề)",
            teacherQuestion: "cụm từ mang nghĩa nâng cao nhận thức của mọi người",
            example: "Schools organized green campaigns to raise awareness about plastic recycling.",
            exampleVi: "Các trường học tổ chức chiến dịch xanh để nâng cao nhận thức về tái chế rác nhựa.",
            note: "raise awareness of/about sth; aware (adj) -> awareness (n)"
        },
        {
            stt: 27,
            primaryWord: "promote",
            displayWord: "promote / promotion",
            ipa: "/prəˈməʊt/",
            type: "v",
            typeCategory: "verb",
            primaryMeaning: "thúc đẩy, xúc tiến, quảng bá",
            fullMeaning: "thúc đẩy, xúc tiến, quảng bá",
            teacherQuestion: "thúc đẩy, xúc tiến hoặc quảng bá cái gì",
            example: "The program aims to promote friendship and mutual understanding among member states.",
            exampleVi: "Chương trình nhằm thúc đẩy tình hữu nghị và sự thấu hiểu lẫn nhau giữa các nước thành viên.",
            note: "promote tourism / friendship / peace; promotion (n)"
        },
        {
            stt: 28,
            primaryWord: "strengthen",
            displayWord: "strengthen / strong / strength",
            ipa: "/ˈstreŋθn/",
            type: "v",
            typeCategory: "verb",
            primaryMeaning: "tăng cường, củng cố",
            fullMeaning: "tăng cường, củng cố, làm mạnh thêm",
            teacherQuestion: "động từ chỉ hành động tăng cường, củng cố cho vững mạnh hơn",
            example: "Education partnerships help strengthen bilateral relations between nations.",
            exampleVi: "Hợp tác giáo dục giúp tăng cường mối quan hệ song phương giữa các quốc gia.",
            note: "strong (adj) -> strength (n) -> strengthen (v)"
        },
        {
            stt: 29,
            primaryWord: "relation",
            displayWord: "Relation (diplomatic/relatives) / relationship",
            ipa: "/rɪˈleɪʃn/",
            type: "n / n",
            typeCategory: "noun",
            primaryMeaning: "mối quan hệ (ngoại giao / tình cảm)",
            fullMeaning: "mối quan hệ (relations: ngoại giao, đối ngoại / relationship: tình cảm, bạn bè, gia đình)",
            teacherQuestion: "mối quan hệ ngoại giao giữa các quốc gia",
            example: "Vietnam continues to expand diplomatic relations with countries around the globe.",
            exampleVi: "Việt Nam tiếp tục mở rộng quan hệ ngoại giao với các nước trên toàn cầu.",
            note: "diplomatic relations (ngoại giao) # close personal relationship"
        },
        {
            stt: 30,
            primaryWord: "represent",
            displayWord: "represent",
            ipa: "/ˌreprɪˈzent/",
            type: "v",
            typeCategory: "verb",
            primaryMeaning: "đại diện cho",
            fullMeaning: "đại diện cho (quốc gia, tổ chức, tập thể)",
            teacherQuestion: "đại diện cho một quốc gia, tổ chức hoặc tập thể",
            example: "Ten youth ambassadors were selected to represent Vietnam at the summit.",
            exampleVi: "Mười đại sứ trẻ đã được chọn để đại diện cho Việt Nam tại hội nghị thượng đỉnh.",
            note: "represent a country / an organization"
        },
        {
            stt: 31,
            primaryWord: "representative",
            displayWord: "representative",
            ipa: "/ˌreprɪˈzentətɪv/",
            type: "n / adj",
            typeCategory: "noun",
            primaryMeaning: "người đại diện, đại biểu",
            fullMeaning: "người đại diện, đại biểu (adj: tiêu biểu)",
            teacherQuestion: "người đại diện, đại biểu phát biểu ý kiến",
            example: "The representative of the Ministry of Foreign Affairs delivered the keynote speech.",
            exampleVi: "Đại diện của Bộ Ngoại giao đã có bài phát biểu quan trọng.",
            note: "Lưu ý đuôi -ive nhưng đây là danh từ chỉ người đại diện!"
        },
        {
            stt: 32,
            primaryWord: "eye-opening",
            displayWord: "eye-opening",
            ipa: "/ˈaɪ əʊpnɪŋ/",
            type: "adj",
            typeCategory: "adj",
            primaryMeaning: "mở mang tầm mắt, khai sáng",
            fullMeaning: "mở mang tầm mắt, đem lại hiểu biết mới mẻ",
            teacherQuestion: "mở mang tầm mắt, đem lại trải nghiệm bất ngờ thú vị",
            example: "Visiting heritage sites across Southeast Asia was an eye-opening journey.",
            exampleVi: "Tham quan các di sản khắp Đông Nam Á là một chuyến đi mở mang tầm mắt.",
            note: "an eye-opening experience / journey"
        },
        {
            stt: 33,
            primaryWord: "opportunity",
            displayWord: "opportunity = chance",
            ipa: "/ˌɒpəˈtjuːnəti/",
            type: "n",
            typeCategory: "noun",
            primaryMeaning: "cơ hội",
            fullMeaning: "cơ hội (= chance)",
            teacherQuestion: "cơ hội tốt để làm một điều gì đó",
            example: "Studying abroad provides students with the opportunity to explore new cultures.",
            exampleVi: "Du học mang lại cho học sinh cơ hội khám phá những nền văn hóa mới.",
            note: "take / miss / seize an opportunity to do sth"
        },
        {
            stt: 34,
            primaryWord: "equality",
            displayWord: "Equality / gender equality",
            ipa: "/iˈkwɒləti/",
            type: "n / n.phr",
            typeCategory: "noun",
            primaryMeaning: "sự bình đẳng",
            fullMeaning: "sự bình đẳng / bình đẳng giới (gender equality)",
            teacherQuestion: "sự bình đẳng, công bằng trong xã hội",
            example: "Promoting gender equality is an essential goal for modern society.",
            exampleVi: "Thúc đẩy bình đẳng giới là một mục tiêu thiết yếu của xã hội hiện đại.",
            note: "equal (adj) -> equality (n) # inequality"
        },
        {
            stt: 35,
            primaryWord: "have community work experience",
            displayWord: "have community work experience",
            ipa: "/hæv kəˈmjuːnəti wɜːk ɪkˈspɪəriəns/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "có kinh nghiệm làm việc cộng đồng",
            fullMeaning: "có kinh nghiệm làm việc cộng đồng",
            teacherQuestion: "cụm từ có kinh nghiệm tham gia các hoạt động cộng đồng",
            example: "Candidates who have community work experience are highly preferred.",
            exampleVi: "Những ứng viên có kinh nghiệm làm việc cộng đồng được ưu tiên rất cao.",
            note: "work experience (danh từ không đếm được)"
        },
        {
            stt: 36,
            primaryWord: "be confident speakers",
            displayWord: "be confident speakers",
            ipa: "/biː ˈkɒnfɪdənt ˈspiːkəz/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "là những người nói tự tin",
            fullMeaning: "là những người nói tự tin trước công chúng",
            teacherQuestion: "là những người nói, diễn giả tự tin trước đám đông",
            example: "Debate clubs train young students to be confident speakers in public.",
            exampleVi: "Các câu lạc bộ tranh biện rèn luyện học sinh trẻ trở thành những người nói tự tin trước đám đông.",
            note: "confidence (n) -> confident (adj) -> speak (v) -> speaker (n)"
        },
        {
            stt: 37,
            primaryWord: "have teamwork skills",
            displayWord: "have teamwork skills",
            ipa: "/hæv ˈtiːmwɜːk skɪlz/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "có kỹ năng làm việc nhóm",
            fullMeaning: "có kỹ năng làm việc nhóm hiệu quả",
            teacherQuestion: "có kỹ năng phối hợp làm việc nhóm hiệu quả",
            example: "To complete complex group projects, students must have good teamwork skills.",
            exampleVi: "Để hoàn thành các dự án nhóm phức tạp, học sinh phải có kỹ năng làm việc nhóm tốt.",
            note: "teamwork spirit = tinh thần đồng đội"
        },
        {
            stt: 38,
            primaryWord: "practical skills",
            displayWord: "practical skills",
            ipa: "/ˈpræktɪkl skɪlz/",
            type: "n.phr",
            typeCategory: "noun",
            primaryMeaning: "kỹ năng thực hành, thực tế",
            fullMeaning: "kỹ năng thực hành, kỹ năng thực tế",
            teacherQuestion: "các kỹ năng thực hành, thực tế trong đời sống",
            example: "Workshops equip young volunteers with practical skills for emergency response.",
            exampleVi: "Các buổi tập huấn trang bị cho tình nguyện viên trẻ các kỹ năng thực tế để ứng phó khẩn cấp.",
            note: "practice (n) -> practical (adj) # theoretical (lý thuyết)"
        },
        {
            stt: 39,
            primaryWord: "understand different cultures",
            displayWord: "understand different cultures",
            ipa: "/ˌʌndəˈstænd ˈdɪfrənt ˈkʌltʃəz/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "thấu hiểu các nền văn hóa khác nhau",
            fullMeaning: "thấu hiểu các nền văn hóa khác nhau trên thế giới",
            teacherQuestion: "thấu hiểu và tôn trọng các nền văn hóa khác nhau",
            example: "Living with host families helps exchange students understand different cultures deeply.",
            exampleVi: "Sống cùng gia đình bản xứ giúp học sinh trao đổi thấu hiểu sâu sắc các nền văn hóa khác nhau.",
            note: "cultural diversity = sự đa dạng văn hóa"
        },
        {
            stt: 40,
            primaryWord: "offer solution",
            displayWord: "offer solution / propose a solution",
            ipa: "/ˈɒfə səˈluːʃn/",
            type: "v.phr",
            typeCategory: "phrase",
            primaryMeaning: "đưa ra giải pháp",
            fullMeaning: "đưa ra giải pháp giải quyết vấn đề",
            teacherQuestion: "đưa ra giải pháp giải quyết một vấn đề nan giải",
            example: "Youth delegates collaborated to offer innovative solutions to marine pollution.",
            exampleVi: "Các đại biểu trẻ đã cùng nhau đưa ra các giải pháp sáng tạo cho vấn đề ô nhiễm biển.",
            note: "solve (v) -> solution (n) -> offer/find a solution"
        }
    ];

    // CÁC KHÓA LƯU TRỮ LOCALSTORAGE
    const STORAGE_KEY_STARRED = "azota_vocab_starred_u4";
    const STORAGE_KEY_MASTERED = "azota_vocab_mastered_u4";
    const STORAGE_KEY_BEST_TIME = "azota_match_best_time_u4";
    const STORAGE_KEY_ORAL_PROGRESS = "azota_oral_progress_u4";

    function getStarredMap() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_STARRED) || "{}");
        } catch (e) {
            return {};
        }
    }

    function toggleStarred(stt) {
        const map = getStarredMap();
        if (map[stt]) {
            delete map[stt];
        } else {
            map[stt] = true;
        }
        localStorage.setItem(STORAGE_KEY_STARRED, JSON.stringify(map));
        return !!map[stt];
    }

    function getMasteredMap() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_MASTERED) || "{}");
        } catch (e) {
            return {};
        }
    }

    function toggleMastered(stt) {
        const map = getMasteredMap();
        if (map[stt]) {
            delete map[stt];
        } else {
            map[stt] = true;
        }
        localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(map));
        return !!map[stt];
    }

    function getBestMatchTime() {
        try {
            const val = localStorage.getItem(STORAGE_KEY_BEST_TIME);
            return val ? parseFloat(val) : null;
        } catch (e) {
            return null;
        }
    }

    function setBestMatchTime(timeSec) {
        try {
            const current = getBestMatchTime();
            if (current === null || timeSec < current) {
                localStorage.setItem(STORAGE_KEY_BEST_TIME, timeSec.toString());
                return true; // Kỷ lục mới
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    // ==========================================
    // VOICE SYNTHESIS: GIỌNG NỮ CHUẨN CỦA CÔ GIÁO & BẢN XỨ TIẾNG ANH
    // ==========================================
    
    // 1. TÌM GIỌNG NỮ TIẾNG VIỆT (ƯU TIÊN TUYỆT ĐỐI GIỌNG NỮ, LOẠI BỎ MICROSOFT AN)
    function getVietnameseFemaleVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return null;

            // Bộ lọc loại bỏ triệt để giọng nam (đặc biệt Microsoft An, Nam, Male, David...)
            const isMale = (name) => {
                const n = (name || '').toLowerCase();
                return n.includes('microsoft an') || 
                       n.includes(' an online') || 
                       n.includes(' an ') ||
                       n.endsWith(' an') || 
                       n.includes(' male') || 
                       n.includes('nam') || 
                       n.includes('david') || 
                       n.includes('mark') ||
                       n.includes(' đàn ông ');
            };

            const viVoices = voices.filter(v => {
                const l = (v.lang || '').toLowerCase();
                const n = (v.name || '').toLowerCase();
                return l.startsWith('vi') || l.includes('vi-vn') || n.includes('vietnam') || n.includes('tiếng việt');
            });

            // Ưu tiên 1: Giọng nữ tiếng Việt phổ biến (HoaiMy trên Windows 10/11, Linh trên iOS/macOS, Mai, Google)
            const femaleVi = viVoices.find(v => {
                const n = (v.name || '').toLowerCase();
                return !isMale(n) && (
                    n.includes('hoaimy') || 
                    n.includes('hoài my') || 
                    n.includes('linh') || 
                    n.includes('mai') || 
                    n.includes('google') || 
                    n.includes('female') || 
                    n.includes('vic') || 
                    n.includes('vif')
                );
            });
            if (femaleVi) return femaleVi;

            // Ưu tiên 2: Bất kỳ giọng tiếng Việt nào không phải nam
            const nonMaleVi = viVoices.find(v => !isMale(v.name));
            if (nonMaleVi) return nonMaleVi;

            return viVoices[0] || null;
        } catch (e) {
            return null;
        }
    }

    // 2. TÌM GIỌNG NỮ TIẾNG ANH (JENNY, ARIA, SAMANTHA, GOOGLE US ENGLISH)
    function getEnglishFemaleVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return null;

            const isMale = (name) => {
                const n = (name || '').toLowerCase();
                return n.includes(' male') || n.includes('david') || n.includes('mark') || n.includes('george') || n.includes('guy');
            };

            const engVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));

            // Ưu tiên các giọng nữ tự nhiên nổi tiếng
            const femaleEng = engVoices.find(v => {
                const n = (v.name || '').toLowerCase();
                return !isMale(n) && (
                    n.includes('jenny') || 
                    n.includes('aria') || 
                    n.includes('samantha') || 
                    n.includes('zira') || 
                    n.includes('google us') || 
                    n.includes('victoria') || 
                    n.includes('female') || 
                    n.includes('natural')
                );
            });
            if (femaleEng) return femaleEng;

            const nonMaleEng = engVoices.find(v => !isMale(v.name));
            return nonMaleEng || engVoices[0] || null;
        } catch (e) {
            return null;
        }
    }

    // Hiệu ứng sóng âm khi cô giáo đang nói
    function setTeacherSpeakingStatus(isSpeaking, customText) {
        oralIsSpeaking = isSpeaking;
        const waveBox = document.getElementById("oralSoundWaveBox");
        const statusText = document.getElementById("oralTeacherStatusText");
        const teacherAvatar = document.getElementById("oralTeacherAvatar");

        if (waveBox) {
            if (isSpeaking) {
                waveBox.classList.remove("opacity-20");
                waveBox.classList.add("opacity-100");
                waveBox.querySelectorAll(".oral-sound-bar").forEach(bar => bar.classList.add("animate-soundWave"));
            } else {
                waveBox.classList.add("opacity-20");
                waveBox.classList.remove("opacity-100");
                waveBox.querySelectorAll(".oral-sound-bar").forEach(bar => bar.classList.remove("animate-soundWave"));
            }
        }

        if (statusText) {
            if (customText) {
                statusText.textContent = customText;
            } else {
                statusText.textContent = isSpeaking ? "Cô Kiều Anh đang hỏi..." : "Đang chờ em trả lời...";
            }
        }

        if (teacherAvatar) {
            if (isSpeaking) {
                teacherAvatar.classList.add("ring-4", "ring-pink-500/80", "shadow-pink-500/40");
            } else {
                teacherAvatar.classList.remove("ring-4", "ring-pink-500/80", "shadow-pink-500/40");
            }
        }
    }

    // PHÁT ÂM TIẾNG ANH (GIỌNG NỮ BẢN XỨ CHUẨN)
    function speakWord(text, onEndCallback) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanWord = text.split('\n')[0].split('/')[0].split('(')[0].replace(/sb|sth|\+ V-ing/g, '').trim();
            const utterance = new SpeechSynthesisUtterance(cleanWord);
            utterance.lang = 'en-US';
            utterance.rate = 0.92;
            utterance.pitch = 1.08; // Giọng nữ cao, trong trẻo

            const engVoice = getEnglishFemaleVoice();
            if (engVoice) utterance.voice = engVoice;

            if (onEndCallback) {
                utterance.onend = onEndCallback;
                utterance.onerror = onEndCallback;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error(e);
        }
    }

    // PHÁT ÂM TIẾNG VIỆT GIỌNG CÔ GIÁO (CHUẨN GIỌNG NỮ 100%)
    function speakTeacherQuestion(vietnameseText) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const questionPrompt = `Từ nào có nghĩa là: ${vietnameseText}?`;
            const utterance = new SpeechSynthesisUtterance(questionPrompt);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.98;
            utterance.pitch = 1.22; // Tone nữ ấm áp, thanh thoát, sư phạm của cô giáo

            const viVoice = getVietnameseFemaleVoice();
            if (viVoice) utterance.voice = viVoice;

            setTeacherSpeakingStatus(true, "Cô Kiều Anh đang hỏi...");

            utterance.onend = () => {
                setTeacherSpeakingStatus(false);
            };
            utterance.onerror = () => {
                setTeacherSpeakingStatus(false);
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error(e);
        }
    }

    // CÔ GIÁO PHẢN HỒI BẰNG GIỌNG NỮ (KHEN NGỢI HOẶC ĐỘNG VIÊN)
    function speakTeacherFeedback(isCorrect, wordToPronounce) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            let feedbackText = "";
            if (isCorrect) {
                const praises = [
                    "Chính xác! Rất giỏi em nhé!",
                    "Đúng rồi! Tiếp tục phát huy nào!",
                    "Tuyệt vời! Em nhớ từ vựng rất chuẩn!",
                    "Chuẩn xác luôn! Cô cộng một điểm thuộc bài!"
                ];
                feedbackText = praises[Math.floor(Math.random() * praises.length)];
            } else {
                const encourages = [
                    "Chưa đúng rồi! Em hãy xem lại và gõ lại từ này nhé!",
                    "Gần đúng rồi! Em nhìn kỹ từ này và gõ lại để nhớ sâu nhé!",
                    "Chưa chính xác! Cô sẽ hỏi lại câu này sau, em gõ lại từ này nhé!"
                ];
                feedbackText = encourages[Math.floor(Math.random() * encourages.length)];
            }

            const utterance = new SpeechSynthesisUtterance(feedbackText);
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            utterance.pitch = 1.24; // Tone nữ ngọt ngào, khích lệ

            const viVoice = getVietnameseFemaleVoice();
            if (viVoice) utterance.voice = viVoice;

            setTeacherSpeakingStatus(true, isCorrect ? "🥰 Cô Kiều Anh khen ngợi!" : "🧐 Cô Kiều Anh hướng dẫn...");

            utterance.onend = () => {
                setTeacherSpeakingStatus(false);
                // Sau câu nói tiếng Việt của cô, đọc ngay từ tiếng Anh chuẩn bản xứ
                if (wordToPronounce) {
                    setTimeout(() => speakWord(wordToPronounce), 300);
                }
            };
            utterance.onerror = () => {
                setTeacherSpeakingStatus(false);
                if (wordToPronounce) setTimeout(() => speakWord(wordToPronounce), 200);
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error(e);
        }
    }

    // TIỆN ÍCH SO KHỚP ĐÁP ÁN THÔNG MINH
    function checkOralAnswer(userInput, item) {
        if (!userInput) return false;
        const cleanUser = userInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanUser) return false;

        // 1. So khớp với primaryWord
        const cleanPrimary = item.primaryWord.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanUser === cleanPrimary) return true;

        // 2. So khớp với các biến thể trong displayWord
        const variants = item.displayWord.split(/[\/\n;,]/).map(s => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
        if (variants.includes(cleanUser)) return true;

        // 3. Xử lý các tiền tố/hậu tố cấu trúc: (+ V-inf), + V-ing, sb for V-ing, for, at, in, on
        const primaryCore = item.primaryWord.toLowerCase()
            .replace(/\+.*$/, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\bsb\b|\bsth\b/g, '')
            .trim().replace(/[^a-z0-9]/g, '');

        if (primaryCore && cleanUser === primaryCore) return true;

        return false;
    }

    // TRẠNG THÁI TOÀN CỤC CỦA MODAL
    let currentTab = "oral"; // Mặc định mở tab Cô Khảo Bài nếu được gọi, hoặc 'flashcards'
    let flashcardIndex = 0;
    let isFlipped = false;
    let filterStarredOnly = false;
    let autoPlayTimer = null;
    let autoPlayActive = false;
    let flashcardList = [...UNIT4_VOCAB_DATA];

    // ==========================================
    // STATE: CÔ KHẢO BÀI (ORAL MASTERY DRILL)
    // ==========================================
    let oralRemainingList = [];   // Danh sách các từ CHƯA THUỘC (ban đầu 40 từ)
    let oralMasteredList = [];    // Danh sách các từ ĐÃ THUỘC (ban đầu 0 từ)
    let oralCurrentItem = null;   // Từ đang được cô hỏi
    let oralMode = 'choice';      // 'choice' (4 đáp án) hoặc 'type' (gõ chữ)
    let oralMistakesCount = 0;    // Số lần làm sai
    let oralQuestionNumber = 0;   // Lần khảo thứ mấy
    let oralIsAnswered = false;   // Đã kiểm tra câu hiện tại chưa
    let oralIsCorrect = false;    // Kết quả đúng hay sai
    let oralFeedbackMessage = ""; // Lời cô giáo nói
    let oralSelectedChoice = null;// Index nếu ở mode choice
    let oralChoices = [];         // 4 lựa chọn nếu ở mode choice
    let oralStreak = 0;           // Chuỗi đúng liên tiếp
    let oralMaxStreak = 0;        // Kỷ lục chuỗi đúng
    let oralIsSpeaking = false;   // Trạng thái giọng nói cô giáo

    // State cho Game Ghép Thẻ
    let matchCards = [];
    let matchSelected = [];
    let matchMatchedCount = 0;
    let matchStartTime = 0;
    let matchTimerInterval = null;
    let matchElapsedSeconds = 0;
    let matchIsCompleted = false;

    // State cho Luyện Viết (Spelling)
    let spellingIndex = 0;
    let spellingList = [...UNIT4_VOCAB_DATA];
    let spellingScore = { correct: 0, total: 0 };
    let spellingRevealedChars = 0;

    // State cho Trắc Nghiệm Nhanh (Quiz)
    let quizList = [];
    let quizCurrentIdx = 0;
    let quizScore = 0;
    let quizSelectedAnswer = null;
    let quizAnswerSubmitted = false;

    // TIỆN ÍCH TRỘN MẢNG
    function shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // MÀU SẮC TỪ LOẠI
    function getTypeBadge(typeStr) {
        const t = (typeStr || '').toLowerCase();
        if (t.includes('phr') || t.includes('+')) {
            return { label: typeStr, bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
        }
        if (t.includes('adj')) {
            return { label: typeStr, bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
        }
        if (t.includes('v')) {
            return { label: typeStr, bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
        }
        if (t.includes('n')) {
            return { label: typeStr, bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
        }
        return { label: typeStr, bg: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }

    // MỞ VOCABULARY MASTER MODAL
    function openVocabModal(initialTab = "oral") {
        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();

        currentTab = initialTab;
        isFlipped = false;
        flashcardIndex = 0;
        filterStarredOnly = false;
        stopAutoPlay();

        // Khởi tạo trạng thái Cô Khảo Bài nếu chưa có
        if (oralRemainingList.length === 0 && oralMasteredList.length === 0) {
            initOralTest();
        }

        let existingModal = document.getElementById("vocabMasterModal");
        if (existingModal) existingModal.remove();

        const modal = document.createElement("div");
        modal.id = "vocabMasterModal";
        modal.className = "fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn select-none";

        // Khung Modal chính
        const container = document.createElement("div");
        container.className = "relative w-full max-w-4xl max-h-[95vh] h-full sm:h-auto sm:max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all";
        
        container.innerHTML = `
            <!-- HEADER TÍCH HỢP -->
            <div class="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0 text-lg">
                        👩‍🏫
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h2 class="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                                Khảo Bài Miệng Unit 4: ASEAN and Vietnam
                            </h2>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                                Thuộc Đủ 40/40 Câu
                            </span>
                        </div>
                        <p class="text-[11px] text-slate-400 hidden sm:block">
                            Hỏi bất kì bằng tiếng Việt • Sai làm lại đến khi thuộc 100% • 3D Flashcards • Mini Game
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <div id="vocabHeaderStats" class="hidden md:flex items-center gap-2 text-[11px] font-bold">
                        <!-- Render dynamic stats -->
                    </div>
                    <button type="button" id="vocabModalCloseBtn" class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 text-base" title="Đóng (Esc)">
                        ✕
                    </button>
                </div>
            </div>

            <!-- TABS ĐIỀU HƯỚNG CHẾ ĐỘ HỌC -->
            <div class="px-3 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button type="button" data-tab="oral" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>👩‍🏫</span> <span>Cô Khảo Bài (40/40)</span>
                </button>
                <button type="button" data-tab="flashcards" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>🎴</span> <span>Flashcard 3D</span>
                </button>
                <button type="button" data-tab="match" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>⚡</span> <span>Ghép Thẻ Nhanh</span>
                </button>
                <button type="button" data-tab="spelling" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>✍️</span> <span>Luyện Viết</span>
                </button>
                <button type="button" data-tab="quiz" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>🎯</span> <span>Trắc Nghiệm Phản Xạ</span>
                </button>
                <button type="button" data-tab="list" class="vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>📖</span> <span>Bảng 40 Từ</span>
                </button>
                <button type="button" id="vocabGoToExamBtn" class="ml-auto px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95">
                    <span>📝</span> <span class="hidden sm:inline">Khảo Sát</span> <span>40 Câu</span>
                </button>
            </div>

            <!-- NỘI DUNG CHÍNH (THEO TAB) -->
            <div id="vocabTabContent" class="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col justify-center">
                <!-- Nội dung các tab sẽ render ở đây -->
            </div>
        `;

        modal.appendChild(container);
        document.body.appendChild(modal);

        // Update header stats
        updateHeaderStats();

        // Bind tabs
        const tabBtns = container.querySelectorAll(".vocab-tab-btn");
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const tab = btn.getAttribute("data-tab");
                switchTab(tab);
            });
        });

        // Close button
        const closeBtn = document.getElementById("vocabModalCloseBtn");
        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        // Go to Exam button
        const examBtn = document.getElementById("vocabGoToExamBtn");
        if (examBtn) {
            examBtn.addEventListener("click", () => {
                closeModal();
                if (window.AzotaApp && window.AzotaApp.startExam) {
                    window.AzotaApp.startExam('ta-unit4-vocab-40', 'practice');
                }
            });
        }

        // Global Keydown
        window.addEventListener("keydown", handleGlobalKeyDown);

        // Render tab ban đầu
        renderCurrentTab();
    }

    function closeModal() {
        stopAutoPlay();
        clearInterval(matchTimerInterval);
        const modal = document.getElementById("vocabMasterModal");
        if (modal) modal.remove();
        window.removeEventListener("keydown", handleGlobalKeyDown);
    }

    function updateHeaderStats() {
        const statsEl = document.getElementById("vocabHeaderStats");
        if (!statsEl) return;
        const starredCount = Object.keys(getStarredMap()).length;
        const oralMasteredCount = oralMasteredList.length;
        const bestTime = getBestMatchTime();

        statsEl.innerHTML = `
            <span class="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/20 flex items-center gap-1">
                👩‍🏫 Thuộc: ${oralMasteredCount}/40
            </span>
            <span class="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                ⭐ ${starredCount} từ khó
            </span>
            ${bestTime !== null ? `
                <span class="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    ⚡ Kỷ lục: ${bestTime.toFixed(1)}s
                </span>
            ` : ''}
        `;
    }

    function switchTab(tab) {
        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        stopAutoPlay();
        clearInterval(matchTimerInterval);
        currentTab = tab;
        renderCurrentTab();
    }

    function renderCurrentTab() {
        // Cập nhật tab active classes
        const tabBtns = document.querySelectorAll(".vocab-tab-btn");
        tabBtns.forEach(btn => {
            const tab = btn.getAttribute("data-tab");
            if (tab === currentTab) {
                if (tab === 'oral') {
                    btn.className = "vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 ring-2 ring-pink-400/40";
                } else {
                    btn.className = "vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20";
                }
            } else {
                btn.className = "vocab-tab-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/60";
            }
        });

        const content = document.getElementById("vocabTabContent");
        if (!content) return;

        switch (currentTab) {
            case "oral":
                renderOralTab(content);
                break;
            case "flashcards":
                renderFlashcardsTab(content);
                break;
            case "match":
                renderMatchGameTab(content);
                break;
            case "spelling":
                renderSpellingTab(content);
                break;
            case "quiz":
                renderQuizTab(content);
                break;
            case "list":
                renderListTab(content);
                break;
        }
        updateHeaderStats();
    }

    // ==========================================
    // 1. CHẾ ĐỘ CÔ KHẢO BÀI (ORAL MASTERY DRILL)
    // Hỏi bất kì câu tiếng Việt, sai lặp lại đến khi thuộc 40/40
    // ==========================================
    function initOralTest() {
        oralRemainingList = shuffleArray([...UNIT4_VOCAB_DATA]);
        oralMasteredList = [];
        oralMistakesCount = 0;
        oralQuestionNumber = 0;
        oralStreak = 0;
        oralMaxStreak = 0;
        pickNextOralQuestion();
    }

    function pickNextOralQuestion() {
        if (oralRemainingList.length === 0) {
            oralCurrentItem = null;
            return;
        }
        // Chọn ngẫu nhiên 1 từ trong danh sách còn lại
        const randomIdx = Math.floor(Math.random() * oralRemainingList.length);
        oralCurrentItem = oralRemainingList[randomIdx];
        oralQuestionNumber++;
        oralIsAnswered = false;
        oralIsCorrect = false;
        oralFeedbackMessage = "";
        oralSelectedChoice = null;

        // Sinh 4 đáp án nếu đang ở chế độ trắc nghiệm
        const otherItems = shuffleArray(UNIT4_VOCAB_DATA.filter(x => x.stt !== oralCurrentItem.stt)).slice(0, 3);
        oralChoices = shuffleArray([
            { text: oralCurrentItem.primaryWord, isCorrect: true },
            { text: otherItems[0].primaryWord, isCorrect: false },
            { text: otherItems[1].primaryWord, isCorrect: false },
            { text: otherItems[2].primaryWord, isCorrect: false }
        ]);

        // Đọc câu hỏi tiếng Việt của cô (giọng nữ thanh thoát)
        setTimeout(() => {
            speakTeacherQuestion(oralCurrentItem.primaryMeaning);
        }, 120);
    }

    function renderOralTab(container) {
        // Kiểm tra nếu đã hoàn thành đủ 40 câu
        if (oralRemainingList.length === 0 && oralMasteredList.length === UNIT4_VOCAB_DATA.length) {
            showOralVictoryScreen(container);
            return;
        }

        if (!oralCurrentItem && oralRemainingList.length > 0) {
            pickNextOralQuestion();
        }

        const masteredCount = oralMasteredList.length;
        const totalCount = UNIT4_VOCAB_DATA.length;
        const progressPercent = Math.round((masteredCount / totalCount) * 100);
        const remainingCount = oralRemainingList.length;

        container.className = "flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col justify-between items-center";
        container.innerHTML = `
            <!-- Top Controls & Thống kê tiến độ thuộc bài -->
            <div class="w-full max-w-xl flex flex-col gap-2 mb-2 px-1">
                <div class="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-rose-400 flex items-center gap-1.5 text-sm">
                            <span>👩‍🏫</span> <span>Cô Kiều Anh Khảo Bài</span>
                        </span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Đã thuộc: ${masteredCount} / ${totalCount} từ (${progressPercent}%)
                        </span>
                        ${oralStreak > 1 ? `
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse flex items-center gap-1">
                                <span>🔥</span> <span>${oralStreak} câu liên tiếp!</span>
                            </span>
                        ` : ''}
                    </div>

                    <div class="flex items-center gap-2">
                        <!-- Toggle Mode: Gõ chữ vs Trắc nghiệm -->
                        <button type="button" id="oralToggleModeBtn" class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer active:scale-95" title="Đổi cách trả lời: Chọn 4 đáp án (Phím 1-4) hoặc Gõ bàn phím (Enter)">
                            <span>${oralMode === 'type' ? '⌨️ Chế độ Gõ chữ' : '🎯 4 Đáp Án (Phím 1-4)'}</span>
                        </button>
                        <button type="button" id="oralResetBtn" class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center gap-1" title="Khảo lại từ đầu">
                            <span>🔄</span> <span>Khảo lại</span>
                        </button>
                    </div>
                </div>

                <!-- Progress Bar động -->
                <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                    <div class="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Còn lại cần thuộc: <strong class="text-white">${remainingCount} từ</strong></span>
                    <span>Số lần khảo lại: <strong class="${oralMistakesCount > 0 ? 'text-rose-400' : 'text-slate-400'}">${oralMistakesCount} lần</strong></span>
                </div>
            </div>

            <!-- TEACHER CLASSROOM CARD -->
            <div class="w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-800/95 via-slate-900 to-slate-950 border-2 ${
                oralIsAnswered 
                    ? (oralIsCorrect ? 'border-emerald-500/70 shadow-emerald-500/20' : 'border-rose-500/70 shadow-rose-500/20') 
                    : 'border-indigo-500/40 shadow-indigo-500/10'
            } shadow-2xl flex flex-col justify-between my-auto transition-all">
                
                <!-- HỘI THOẠI CỦA CÔ GIÁO & BẢNG ĐEN CÂU HỎI -->
                <div class="flex items-start gap-3.5 mb-4">
                    <!-- Avatar Cô Kiều Anh có hiệu ứng phát sáng -->
                    <div id="oralTeacherAvatar" class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/30 shrink-0 select-none transition-all duration-300">
                        ${oralIsAnswered ? (oralIsCorrect ? '🥰' : '🧐') : '👩‍🏫'}
                    </div>

                    <div class="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 relative overflow-hidden">
                        <!-- Header hội thoại & Sóng âm trực tiếp -->
                        <div class="text-[11px] font-bold text-rose-300 flex items-center justify-between mb-1.5">
                            <div class="flex items-center gap-2">
                                <span id="oralTeacherStatusText">Cô Kiều Anh đang khảo bài:</span>
                                <!-- Sóng âm Equalizer -->
                                <div id="oralSoundWaveBox" class="flex items-end gap-0.5 h-3.5 opacity-20 transition-opacity">
                                    <span class="oral-sound-bar w-0.5 bg-pink-400 rounded-full h-1.5"></span>
                                    <span class="oral-sound-bar w-0.5 bg-pink-400 rounded-full h-3"></span>
                                    <span class="oral-sound-bar w-0.5 bg-pink-400 rounded-full h-2"></span>
                                    <span class="oral-sound-bar w-0.5 bg-pink-400 rounded-full h-3.5"></span>
                                    <span class="oral-sound-bar w-0.5 bg-pink-400 rounded-full h-1.5"></span>
                                </div>
                            </div>
                            <button type="button" id="oralTeacherVoiceBtn" class="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer transition-all px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 active:scale-95" title="Nghe cô đọc lại câu hỏi tiếng Việt (Phím Space)">
                                <span>🔊</span> <span class="text-[10px]">Nghe lại cô hỏi (Space)</span>
                            </button>
                        </div>

                        <div class="text-xs sm:text-sm font-semibold text-slate-300 mb-1">
                            "Em hãy cho cô biết từ tiếng Anh nào có nghĩa là:"
                        </div>

                        <!-- CÂU HỎI TIẾNG VIỆT ĐẶC BIỆT NỔI BẬT -->
                        <div class="text-base sm:text-xl font-black text-amber-300 tracking-wide my-1.5 py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-inner leading-snug">
                            👉 "${oralCurrentItem.primaryMeaning}"
                        </div>

                        <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-2">
                            <span class="px-2 py-0.2 rounded-md ${getTypeBadge(oralCurrentItem.type).bg} text-white font-bold border border-white/10 text-[10px]">${oralCurrentItem.type}</span>
                            <span>Từ này gồm <strong>${oralCurrentItem.primaryWord.length} chữ cái</strong></span>
                            <span class="text-slate-500">• Bấm số 1-4 để chọn nhanh</span>
                        </div>
                    </div>
                </div>

                <!-- KHU VỰC HỌC SINH TRẢ LỜI -->
                ${!oralIsAnswered ? `
                    ${oralMode === 'type' ? `
                        <!-- MODE GÕ CHỮ (NHƯ VIẾT LÊN BẢNG) -->
                        <form id="oralAnswerForm" class="flex flex-col gap-3">
                            <div class="relative">
                                <input type="text" id="oralInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                                       placeholder="Gõ từ tiếng Anh vào đây rồi nhấn Enter..." 
                                       class="w-full px-4 py-3.5 text-center text-base sm:text-lg font-black rounded-2xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all shadow-inner">
                            </div>

                            <div class="flex items-center justify-between gap-2 flex-wrap">
                                <button type="button" id="oralHintBtn" class="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 transition-all cursor-pointer active:scale-95">
                                    💡 Gợi ý chữ cái đầu
                                </button>
                                <button type="button" id="oralSkipBtn" class="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer active:scale-95" title="Nếu chưa nhớ, bấm để cô chỉ bài và khảo lại sau">
                                    ❓ Em chưa nhớ (Khảo lại sau)
                                </button>
                                <button type="submit" class="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95">
                                    Trả Lời (Enter)
                                </button>
                            </div>
                        </form>
                    ` : `
                        <!-- MODE CHỌN 4 ĐÁP ÁN NHANH (CÓ PHÍM TẮT 1-4) -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${oralChoices.map((choice, idx) => {
                                const letters = ['A', 'B', 'C', 'D'];
                                const keys = ['1', '2', '3', '4'];
                                return `
                                    <button type="button" data-choice-idx="${idx}" class="oral-choice-btn group p-3 sm:p-3.5 rounded-2xl border-2 border-slate-700/80 bg-slate-800/80 hover:border-pink-500 hover:bg-slate-750 text-white font-bold text-left text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-98 shadow-sm">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <span class="w-7 h-7 rounded-xl bg-slate-700 group-hover:bg-pink-600 group-hover:text-white font-black text-xs flex items-center justify-center shrink-0 text-slate-300 transition-colors">
                                                ${letters[idx]}
                                            </span>
                                            <span class="truncate font-bold">${choice.text}</span>
                                        </div>
                                        <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400 group-hover:text-pink-300 border border-white/5">
                                            Phím [${keys[idx]}]
                                        </span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    `}
                ` : `
                    <!-- MÀN HÌNH PHẢN HỒI KẾT QUẢ CỦA CÔ -->
                    <div class="p-4 rounded-2xl ${
                        oralIsCorrect ? 'bg-emerald-950/40 border border-emerald-500/50' : 'bg-rose-950/40 border border-rose-500/50'
                    } flex flex-col gap-2.5 animate-fadeIn">
                        
                        <div class="flex items-center justify-between">
                            <span class="text-xs sm:text-sm font-black ${oralIsCorrect ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1.5">
                                <span>${oralIsCorrect ? '✅ XUẤT SẮC! CÔ CỘNG 1 ĐIỂM THUỘC BÀI' : '❌ CHƯA CHÍNH XÁC! CÔ SẼ KHẢO LẠI CÂU NÀY'}</span>
                            </span>
                            <button type="button" onclick="window.VocabHub.speak('${oralCurrentItem.primaryWord}')" class="text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/25">
                                <span>🔊</span> <span>Nghe lại phát âm</span>
                            </button>
                        </div>

                        <!-- Đáp án chuẩn chi tiết -->
                        <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-lg sm:text-xl font-black text-white">${oralCurrentItem.primaryWord}</span>
                                <span class="text-xs text-sky-400 font-mono font-bold">${oralCurrentItem.ipa}</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-full ${getTypeBadge(oralCurrentItem.type).bg} text-white font-bold border border-white/10">${oralCurrentItem.type}</span>
                            </div>
                            <div class="text-xs sm:text-sm text-emerald-300 font-bold mt-1">
                                👉 Nghĩa: ${oralCurrentItem.primaryMeaning}
                            </div>
                            <div class="text-xs text-slate-300 italic mt-1.5 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                                "${oralCurrentItem.example}"
                                <div class="text-[11px] text-slate-400 not-italic mt-0.5">
                                    🇻🇳 ${oralCurrentItem.exampleVi}
                                </div>
                            </div>
                            ${oralCurrentItem.note ? `
                                <div class="text-[10px] text-amber-300 font-bold mt-1.5 flex items-center gap-1">
                                    <span>📌</span> <span>Lưu ý: ${oralCurrentItem.note}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${!oralIsCorrect ? `
                            <!-- BẮT BUỘC GÕ LẠI 1 LẦN NẾU SAI ĐỂ KHẮC SÂU TRÍ NHỚ -->
                            <div class="mt-1">
                                <div class="text-[11px] text-rose-300 font-semibold mb-1 flex items-center gap-1">
                                    <span>✍️</span> <span>Em hãy gõ lại từ <strong>"${oralCurrentItem.primaryWord}"</strong> để khắc sâu trí nhớ:</span>
                                </div>
                                <form id="oralRetryForm" class="flex items-center gap-2">
                                    <input type="text" id="oralRetryInput" placeholder="Gõ lại '${oralCurrentItem.primaryWord}' vào đây..." 
                                           autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                                           class="flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all">
                                    <button type="submit" class="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1">
                                        <span>Đã Thuộc, Khảo Tiếp</span> <span>→</span>
                                    </button>
                                </form>
                            </div>
                        ` : `
                            <div class="flex items-center justify-end mt-1">
                                <button type="button" id="oralNextBtn" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                    <span>Cô hỏi câu tiếp theo (Enter)</span> <span>→</span>
                                </button>
                            </div>
                        `}
                    </div>
                `}

            </div>

            <!-- Footer note -->
            <div class="w-full max-w-xl flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1 flex-wrap gap-1">
                <span>💡 Quy tắc: Bất kỳ câu nào trả lời sai sẽ được cô hỏi lại đến khi nào thuộc 40/40!</span>
                <span>Tiến độ: <strong class="text-emerald-400">${masteredCount}/40 câu</strong></span>
            </div>
        `;

        // BIND EVENTS CHO CÔ KHẢO BÀI
        // 1. Nghe cô đọc tiếng Việt
        const voiceBtn = container.querySelector("#oralTeacherVoiceBtn");
        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                speakTeacherQuestion(oralCurrentItem.primaryMeaning);
            });
        }

        // 2. Toggle Mode (Gõ chữ vs Chọn đáp án)
        const toggleModeBtn = container.querySelector("#oralToggleModeBtn");
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener("click", () => {
                oralMode = (oralMode === 'type') ? 'choice' : 'type';
                renderCurrentTab();
            });
        }

        // 3. Reset Button
        const resetBtn = container.querySelector("#oralResetBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (confirm("Em có chắc chắn muốn cô Kiều Anh khảo bài lại từ đầu không?")) {
                    initOralTest();
                    renderCurrentTab();
                }
            });
        }

        // 4. BIND KEYBOARD SHORTCUTS CHO MODAL CÔ KHẢO BÀI
        const handleOralKeyDown = (e) => {
            if (currentTab !== 'oral') return;

            // Spacebar: Nghe lại cô hỏi (chỉ khi không đang gõ trong input text)
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                speakTeacherQuestion(oralCurrentItem.primaryMeaning);
                return;
            }

            // Nếu chưa trả lời & ở mode trắc nghiệm: bấm phím 1, 2, 3, 4 hoặc A, B, C, D
            if (!oralIsAnswered && oralMode === 'choice' && e.target.tagName !== 'INPUT') {
                let choiceIdx = -1;
                if (e.key === '1' || e.key.toLowerCase() === 'a') choiceIdx = 0;
                else if (e.key === '2' || e.key.toLowerCase() === 'b') choiceIdx = 1;
                else if (e.key === '3' || e.key.toLowerCase() === 'c') choiceIdx = 2;
                else if (e.key === '4' || e.key.toLowerCase() === 'd') choiceIdx = 3;

                if (choiceIdx >= 0 && choiceIdx < oralChoices.length) {
                    e.preventDefault();
                    handleOralAnswer(oralChoices[choiceIdx].isCorrect);
                    return;
                }
            }

            // Nếu đã trả lời đúng: bấm Enter để chuyển câu tiếp theo
            if (oralIsAnswered && oralIsCorrect && e.key === 'Enter') {
                e.preventDefault();
                pickNextOralQuestion();
                renderCurrentTab();
                return;
            }
        };

        // Gắn listener 1 lần
        if (!container._oralKeyBound) {
            container._oralKeyBound = true;
            window.removeEventListener("keydown", container._oralHandler || (() => {}));
            container._oralHandler = handleOralKeyDown;
            window.addEventListener("keydown", handleOralKeyDown);
        }

        // 5. Nếu đang ở mode nhập liệu (chưa trả lời)
        if (!oralIsAnswered) {
            if (oralMode === 'type') {
                const inputEl = container.querySelector("#oralInput");
                if (inputEl) {
                    setTimeout(() => inputEl.focus(), 80);
                }

                // Gợi ý chữ
                let revealed = 0;
                const hintBtn = container.querySelector("#oralHintBtn");
                if (hintBtn) {
                    hintBtn.addEventListener("click", () => {
                        revealed++;
                        const word = oralCurrentItem.primaryWord;
                        inputEl.value = word.slice(0, revealed);
                        inputEl.focus();
                    });
                }

                // Skip / Chưa nhớ
                const skipBtn = container.querySelector("#oralSkipBtn");
                if (skipBtn) {
                    skipBtn.addEventListener("click", () => {
                        handleOralAnswer(false);
                    });
                }

                // Form submit
                const form = container.querySelector("#oralAnswerForm");
                if (form) {
                    form.addEventListener("submit", (e) => {
                        e.preventDefault();
                        const typed = inputEl.value;
                        const isMatch = checkOralAnswer(typed, oralCurrentItem);
                        handleOralAnswer(isMatch);
                    });
                }
            } else {
                // Choice click
                const choiceBtns = container.querySelectorAll(".oral-choice-btn");
                choiceBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const idx = parseInt(btn.getAttribute("data-choice-idx"), 10);
                        const isMatch = oralChoices[idx].isCorrect;
                        handleOralAnswer(isMatch);
                    });
                });
            }
        } else {
            // Đã trả lời: Nếu đúng bấm Next, nếu sai có form Retry
            const nextBtn = container.querySelector("#oralNextBtn");
            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    pickNextOralQuestion();
                    renderCurrentTab();
                });
            }

            const retryForm = container.querySelector("#oralRetryForm");
            if (retryForm) {
                const retryInput = container.querySelector("#oralRetryInput");
                if (retryInput) setTimeout(() => retryInput.focus(), 80);

                retryForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const typed = retryInput.value;
                    const isMatch = checkOralAnswer(typed, oralCurrentItem);
                    if (isMatch || typed.trim().length >= 2) {
                        // Đã gõ lại từ đúng để khắc sâu, chuyển sang câu tiếp theo
                        if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                        pickNextOralQuestion();
                        renderCurrentTab();
                    } else {
                        retryInput.classList.add("border-rose-500", "animate-shake");
                        retryInput.placeholder = `Hãy gõ đúng từ: ${oralCurrentItem.primaryWord}`;
                        setTimeout(() => retryInput.classList.remove("animate-shake"), 500);
                    }
                });
            }
        }
    }

    function handleOralAnswer(isMatch) {
        oralIsAnswered = true;
        oralIsCorrect = isMatch;

        if (isMatch) {
            // ĐÚNG: Cô khen giọng nữ, tăng streak, loại khỏi hàng đợi chưa thuộc, thêm vào đã thuộc!
            oralStreak++;
            if (oralStreak > oralMaxStreak) oralMaxStreak = oralStreak;

            if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
            if (window.confetti) {
                window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
            }

            // Xóa khỏi remainingList
            oralRemainingList = oralRemainingList.filter(x => x.stt !== oralCurrentItem.stt);
            // Thêm vào masteredList (nếu chưa có)
            if (!oralMasteredList.some(x => x.stt === oralCurrentItem.stt)) {
                oralMasteredList.push(oralCurrentItem);
            }

            // Cô giáo khen ngợi bằng giọng nữ và sau đó phát âm từ tiếng Anh
            speakTeacherFeedback(true, oralCurrentItem.primaryWord);

            // Tự động chuyển câu sau 1.8s nếu ở mode choice để học sinh nghe cô khen xong
            if (oralMode === 'choice') {
                setTimeout(() => {
                    if (currentTab === 'oral' && oralIsAnswered && oralIsCorrect) {
                        pickNextOralQuestion();
                        renderCurrentTab();
                    }
                }, 1800);
            }
        } else {
            // SAI: Reset streak, tăng số lần sai, giữ lại trong hàng đợi để khảo lại ở các câu tiếp theo!
            oralStreak = 0;
            oralMistakesCount++;
            // Xáo trộn lại remainingList để câu này xuất hiện lại bất ngờ
            oralRemainingList = shuffleArray(oralRemainingList);
            // Cô giáo động viên bằng giọng nữ và sau đó phát âm từ tiếng Anh
            speakTeacherFeedback(false, oralCurrentItem.primaryWord);
        }

        renderCurrentTab();
    }

    function showOralVictoryScreen(container) {
        if (window.confetti) {
            window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }

        // Cô giáo phát biểu chúc mừng bằng giọng nữ
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance("Chúc mừng em! Em đã xuất sắc thuộc làu làu toàn bộ 40 từ vựng Unit 4!");
                utter.lang = 'vi-VN';
                utter.pitch = 1.25;
                const v = getVietnameseFemaleVoice();
                if (v) utter.voice = v;
                window.speechSynthesis.speak(utter);
            } catch (e) {}
        }

        container.className = "flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center";
        container.innerHTML = `
            <div class="max-w-lg w-full text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl animate-scaleUp">
                <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 mb-4 animate-bounce">
                    👩‍🏫💯
                </div>

                <div class="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
                    XUẤT SẮC ĐẠT 10 ĐIỂM BÀI KHẢO MIỆNG
                </div>

                <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    Chúc Mừng Em Đã Thuộc Lào Lào 40/40 Từ Vựng!
                </h3>
                <p class="text-xs text-slate-300 mb-5 leading-relaxed">
                    Em đã xuất sắc vượt qua toàn bộ câu hỏi bất kì bằng tiếng Việt của cô Kiều Anh. Mọi từ sai trước đó đều đã được em rèn luyện và ghi nhớ thành thạo 100%!
                </p>

                <!-- Thống kê thành tích -->
                <div class="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
                    <div class="p-2 rounded-xl bg-slate-800/60">
                        <div class="text-[10px] text-slate-400 font-bold mb-0.5">Đã thuộc</div>
                        <div class="text-lg sm:text-xl font-black text-emerald-400">40 / 40</div>
                    </div>
                    <div class="p-2 rounded-xl bg-slate-800/60">
                        <div class="text-[10px] text-slate-400 font-bold mb-0.5">Kỷ lục chuỗi</div>
                        <div class="text-lg sm:text-xl font-black text-orange-400">🔥 ${oralMaxStreak}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-slate-800/60">
                        <div class="text-[10px] text-slate-400 font-bold mb-0.5">Khắc phục sai</div>
                        <div class="text-lg sm:text-xl font-black text-amber-400">${oralMistakesCount} lần</div>
                    </div>
                </div>

                <div class="flex items-center justify-center gap-3 flex-wrap">
                    <button type="button" id="oralPlayAgainBtn" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95">
                        🔄 Khảo Lại Từ Đầu
                    </button>
                    <button type="button" id="oralGoToQuizBtn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all cursor-pointer active:scale-95">
                        📝 Làm Khảo Sát 40 Câu
                    </button>
                    <button type="button" id="oralBackToFlashBtn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer active:scale-95">
                        🎴 Về Flashcards
                    </button>
                </div>
            </div>
        `;

        container.querySelector("#oralPlayAgainBtn").addEventListener("click", () => {
            initOralTest();
            renderCurrentTab();
        });

        container.querySelector("#oralGoToQuizBtn").addEventListener("click", () => {
            closeModal();
            if (window.AzotaApp && window.AzotaApp.startExam) {
                window.AzotaApp.startExam('ta-unit4-vocab-40', 'practice');
            }
        });

        container.querySelector("#oralBackToFlashBtn").addEventListener("click", () => {
            switchTab("flashcards");
        });
    }

    // ==========================================
    // 2. CHẾ ĐỘ FLASHCARD 3D
    // ==========================================
    function getActiveFlashcards() {
        const starred = getStarredMap();
        if (filterStarredOnly) {
            const filtered = UNIT4_VOCAB_DATA.filter(item => starred[item.stt]);
            return filtered.length > 0 ? filtered : UNIT4_VOCAB_DATA;
        }
        return flashcardList;
    }

    function renderFlashcardsTab(container) {
        const activeCards = getActiveFlashcards();
        if (flashcardIndex >= activeCards.length) flashcardIndex = 0;
        const currentItem = activeCards[flashcardIndex];

        const starredMap = getStarredMap();
        const masteredMap = getMasteredMap();
        const isStarred = !!starredMap[currentItem.stt];
        const isMastered = !!masteredMap[currentItem.stt];

        const progressPercent = Math.round(((flashcardIndex + 1) / activeCards.length) * 100);
        const badgeInfo = getTypeBadge(currentItem.type);

        container.className = "flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col justify-between items-center";
        container.innerHTML = `
            <!-- Top Controls: Tiến độ & Bộ lọc -->
            <div class="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 mb-2.5 px-1">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">Thẻ ${flashcardIndex + 1} / ${activeCards.length}</span>
                    <button type="button" id="vocabFilterStarredBtn" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        filterStarredOnly 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }">
                        <span>⭐</span> <span>${filterStarredOnly ? 'Đang lọc từ sao' : 'Chỉ từ sao'}</span>
                    </button>
                    <button type="button" id="vocabShuffleBtn" class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-750 transition-all flex items-center gap-1 cursor-pointer active:scale-95" title="Xáo trộn thứ tự các thẻ">
                        <span>🔀</span> <span class="hidden sm:inline">Trộn thẻ</span>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button type="button" id="vocabAutoPlayBtn" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        autoPlayActive 
                            ? 'bg-emerald-500 text-white font-black animate-pulse' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }">
                        <span>${autoPlayActive ? '⏸️ Tạm dừng' : '▶️ Tự chạy'}</span>
                    </button>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full max-w-xl h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
            </div>

            <!-- 3D FLIP FLASHCARD CONTAINER -->
            <div class="w-full max-w-xl h-72 sm:h-80 cursor-pointer perspective-1000 mb-3" id="vocabCardFlipWrapper">
                <div id="vocabFlashcardElement" class="w-full h-full relative preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}">
                    
                    <!-- MẶT TRƯỚC (ENGLISH & IPA) -->
                    <div class="absolute inset-0 backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 transition-all shadow-xl bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 ${
                        isMastered ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-slate-700/60 hover:border-indigo-500/50'
                    }">
                        <!-- Top Front -->
                        <div class="flex items-center justify-between">
                            <span class="px-2.5 py-1 rounded-xl text-xs font-black ${badgeInfo.bg} border">
                                ${badgeInfo.label}
                            </span>
                            <div class="flex items-center gap-2">
                                <button type="button" id="cardSpeakBtn" class="w-9 h-9 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 text-sm" title="Phát âm tiếng Anh (S)">
                                    🔊
                                </button>
                                <button type="button" id="cardStarBtn" class="w-9 h-9 rounded-xl ${isStarred ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-amber-400'} border border-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 text-sm" title="Đánh dấu từ khó">
                                    ⭐
                                </button>
                            </div>
                        </div>

                        <!-- Mid Front: Từ vựng chính & Phiên âm -->
                        <div class="text-center my-auto py-2">
                            <h3 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide leading-tight mb-2">
                                ${currentItem.primaryWord}
                            </h3>
                            <div class="text-sm sm:text-base font-semibold text-blue-400/90 font-mono tracking-wider">
                                ${currentItem.ipa}
                            </div>
                            ${currentItem.displayWord !== currentItem.primaryWord ? `
                                <div class="mt-2 text-xs text-slate-400 line-clamp-1">
                                    Gia đình từ: ${currentItem.displayWord}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Bottom Front Hint -->
                        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                            <span class="flex items-center gap-1 text-indigo-400 font-bold">
                                💡 Chạm để lật xem nghĩa
                            </span>
                            <span class="hidden sm:inline font-mono text-[10px] text-slate-500">
                                [Phím Space / Cách]
                            </span>
                        </div>
                    </div>

                    <!-- MẶT SAU (VIETNAMESE & EXAMPLES) -->
                    <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 shadow-2xl transition-all">
                        <!-- Top Back -->
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                📖 Nghĩa & Ngữ cảnh
                            </span>
                            <div class="flex items-center gap-2">
                                <button type="button" id="cardSpeakBackBtn" class="w-9 h-9 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 text-sm">
                                    🔊
                                </button>
                                <button type="button" id="cardStarBackBtn" class="w-9 h-9 rounded-xl ${isStarred ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-amber-400'} border border-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 text-sm">
                                    ⭐
                                </button>
                            </div>
                        </div>

                        <!-- Mid Back: Nghĩa & Ví dụ -->
                        <div class="text-center my-auto py-1">
                            <div class="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight mb-2.5">
                                ${currentItem.primaryMeaning}
                            </div>
                            <div class="text-xs sm:text-sm text-slate-300 italic mb-1.5 px-2">
                                "${currentItem.example}"
                            </div>
                            <div class="text-xs text-slate-400 mb-2 px-2">
                                👉 ${currentItem.exampleVi}
                            </div>
                            ${currentItem.note ? `
                                <div class="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 max-w-full text-center">
                                    📌 ${currentItem.note}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Bottom Back Hint -->
                        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                            <span class="flex items-center gap-1 text-slate-400">
                                🔄 Chạm để lật lại tiếng Anh
                            </span>
                            <span class="font-bold ${isMastered ? 'text-emerald-400' : 'text-slate-500'}">
                                ${isMastered ? '✅ Đã ghi nhớ' : '⏳ Cần ôn luyện'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            <!-- FLASHCARD CONTROLS -->
            <div class="w-full max-w-xl flex items-center justify-between gap-2 pt-1">
                <!-- Nút Chưa Thuộc -->
                <button type="button" id="cardUnmasterBtn" class="flex-1 py-2.5 px-2 rounded-2xl text-xs font-black bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" title="Đánh dấu cần ôn luyện lại (Phím X)">
                    <span>❌</span> <span>Chưa thuộc</span>
                </button>

                <!-- Nút Trước -->
                <button type="button" id="cardPrevBtn" class="w-12 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center cursor-pointer active:scale-90" title="Thẻ trước (Mũi tên Trái / A)">
                    ←
                </button>

                <!-- Nút Sau -->
                <button type="button" id="cardNextBtn" class="w-12 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center cursor-pointer active:scale-90" title="Thẻ tiếp theo (Mũi tên Phải / D)">
                    →
                </button>

                <!-- Nút Đã Thuộc -->
                <button type="button" id="cardMasterBtn" class="flex-1 py-2.5 px-2 rounded-2xl text-xs font-black bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" title="Đánh dấu đã ghi nhớ (Phím V hoặc M)">
                    <span>✅</span> <span>Đã thuộc</span>
                </button>
            </div>

            <!-- Keyboard shortcut guide -->
            <div class="mt-3 text-[11px] text-slate-500 hidden sm:flex items-center gap-3">
                <span>⌨️ Phím tắt:</span>
                <span class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Space</span> <span>Lật thẻ</span>
                <span class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">← / A</span> <span>Trước</span>
                <span class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">→ / D</span> <span>Sau</span>
                <span class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">S</span> <span>Phát âm</span>
                <span class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">V / M</span> <span>Đã thuộc</span>
            </div>
        `;

        // BIND FLASHCARD EVENTS
        const flipWrapper = container.querySelector("#vocabCardFlipWrapper");
        flipWrapper.addEventListener("click", () => {
            toggleCardFlip();
        });

        // Speak buttons
        const speakBtn = container.querySelector("#cardSpeakBtn");
        const speakBackBtn = container.querySelector("#cardSpeakBackBtn");
        const doSpeak = (e) => {
            e.stopPropagation();
            speakWord(currentItem.primaryWord);
        };
        speakBtn.addEventListener("click", doSpeak);
        speakBackBtn.addEventListener("click", doSpeak);

        // Star buttons
        const starBtn = container.querySelector("#cardStarBtn");
        const starBackBtn = container.querySelector("#cardStarBackBtn");
        const doStar = (e) => {
            e.stopPropagation();
            if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
            toggleStarred(currentItem.stt);
            renderCurrentTab();
        };
        starBtn.addEventListener("click", doStar);
        starBackBtn.addEventListener("click", doStar);

        // Prev / Next
        const prevBtn = container.querySelector("#cardPrevBtn");
        const nextBtn = container.querySelector("#cardNextBtn");
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            prevCard();
        });
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            nextCard();
        });

        // Master / Unmaster
        const masterBtn = container.querySelector("#cardMasterBtn");
        const unmasterBtn = container.querySelector("#cardUnmasterBtn");
        masterBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            markMastered(true);
        });
        unmasterBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            markMastered(false);
        });

        // Filter Starred
        const filterStarredBtn = container.querySelector("#vocabFilterStarredBtn");
        filterStarredBtn.addEventListener("click", () => {
            const starredMap = getStarredMap();
            if (!filterStarredOnly && Object.keys(starredMap).length === 0) {
                alert("Bạn chưa đánh dấu sao từ nào! Hãy bấm biểu tượng ⭐ trên thẻ để đánh dấu từ khó nhớ.");
                return;
            }
            filterStarredOnly = !filterStarredOnly;
            flashcardIndex = 0;
            isFlipped = false;
            renderCurrentTab();
        });

        // Shuffle
        const shuffleBtn = container.querySelector("#vocabShuffleBtn");
        shuffleBtn.addEventListener("click", () => {
            if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
            flashcardList = shuffleArray(flashcardList);
            flashcardIndex = 0;
            isFlipped = false;
            renderCurrentTab();
        });

        // Auto play
        const autoPlayBtn = container.querySelector("#vocabAutoPlayBtn");
        autoPlayBtn.addEventListener("click", () => {
            toggleAutoPlay();
        });
    }

    function toggleCardFlip() {
        if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
        isFlipped = !isFlipped;
        const cardEl = document.getElementById("vocabFlashcardElement");
        if (cardEl) {
            if (isFlipped) {
                cardEl.classList.add("rotate-y-180");
            } else {
                cardEl.classList.remove("rotate-y-180");
            }
        }
    }

    function nextCard() {
        const activeCards = getActiveFlashcards();
        if (activeCards.length === 0) return;
        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        isFlipped = false;
        flashcardIndex = (flashcardIndex + 1) % activeCards.length;
        renderCurrentTab();
        speakWord(activeCards[flashcardIndex].primaryWord);
    }

    function prevCard() {
        const activeCards = getActiveFlashcards();
        if (activeCards.length === 0) return;
        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        isFlipped = false;
        flashcardIndex = (flashcardIndex - 1 + activeCards.length) % activeCards.length;
        renderCurrentTab();
        speakWord(activeCards[flashcardIndex].primaryWord);
    }

    function markMastered(isMastered) {
        const activeCards = getActiveFlashcards();
        if (activeCards.length === 0) return;
        const currentItem = activeCards[flashcardIndex];

        const map = getMasteredMap();
        if (isMastered) {
            map[currentItem.stt] = true;
            if (window.confetti) {
                window.confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            }
        } else {
            delete map[currentItem.stt];
        }
        localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(map));

        nextCard();
    }

    function toggleAutoPlay() {
        if (autoPlayActive) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
        renderCurrentTab();
    }

    function startAutoPlay() {
        autoPlayActive = true;
        stopAutoPlayTimer();
        const activeCards = getActiveFlashcards();
        speakWord(activeCards[flashcardIndex].primaryWord);

        autoPlayTimer = setInterval(() => {
            if (!isFlipped) {
                toggleCardFlip();
            } else {
                nextCard();
            }
        }, 3800);
    }

    function stopAutoPlayTimer() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function stopAutoPlay() {
        autoPlayActive = false;
        stopAutoPlayTimer();
    }

    // ==========================================
    // 3. CHẾ ĐỘ SPEED MATCHING GAME (GHÉP THẺ)
    // ==========================================
    function initMatchGame() {
        clearInterval(matchTimerInterval);
        matchSelected = [];
        matchMatchedCount = 0;
        matchIsCompleted = false;
        matchElapsedSeconds = 0;

        // Bốc 6 từ ngẫu nhiên từ 40 từ
        const picked = shuffleArray(UNIT4_VOCAB_DATA).slice(0, 6);
        const cards = [];

        picked.forEach((item, idx) => {
            cards.push({
                id: `en_${item.stt}`,
                stt: item.stt,
                lang: 'en',
                text: item.primaryWord,
                subText: item.ipa,
                isMatched: false
            });
            cards.push({
                id: `vi_${item.stt}`,
                stt: item.stt,
                lang: 'vi',
                text: item.primaryMeaning,
                subText: item.type,
                isMatched: false
            });
        });

        matchCards = shuffleArray(cards);
        matchStartTime = Date.now();
        matchTimerInterval = setInterval(() => {
            matchElapsedSeconds = ((Date.now() - matchStartTime) / 1000);
            const timerEl = document.getElementById("matchGameTimer");
            if (timerEl) {
                timerEl.textContent = matchElapsedSeconds.toFixed(1) + "s";
            }
        }, 100);
    }

    function renderMatchGameTab(container) {
        if (matchCards.length === 0 || matchIsCompleted) {
            initMatchGame();
        }

        const bestTime = getBestMatchTime();

        container.className = "flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col justify-between items-center";
        container.innerHTML = `
            <!-- Top Controls -->
            <div class="w-full max-w-2xl flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-300">⚡ Ghép 6 Cặp Từ Vựng</span>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ${matchMatchedCount}/6 Cặp
                    </span>
                </div>

                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1 font-mono text-sm font-black text-amber-400">
                        <span>⏱️</span> <span id="matchGameTimer">${matchElapsedSeconds.toFixed(1)}s</span>
                    </div>
                    <button type="button" id="matchRestartBtn" class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95">
                        <span>🔄</span> <span>Ván mới</span>
                    </button>
                </div>
            </div>

            <!-- GRID THẺ 3x4 hoặc 4x3 -->
            <div class="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 my-auto" id="matchCardGrid">
                ${matchCards.map((card, idx) => {
                    const isSelected = matchSelected.some(c => c.id === card.id);
                    if (card.isMatched) {
                        return `
                            <div class="h-20 sm:h-24 rounded-2xl border-2 border-emerald-500/30 bg-emerald-950/20 flex flex-col items-center justify-center p-2 text-center opacity-40 transition-all">
                                <span class="text-xs sm:text-sm font-black text-emerald-400 line-through">${card.text}</span>
                                <span class="text-[10px] text-emerald-400/80">✅ Khớp</span>
                            </div>
                        `;
                    }
                    return `
                        <button type="button" data-card-id="${card.id}" class="match-tile-btn h-20 sm:h-24 rounded-2xl border-2 p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 shadow-md ${
                            isSelected 
                                ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/60 shadow-amber-500/20 text-white scale-102' 
                                : card.lang === 'en'
                                    ? 'border-blue-500/40 bg-gradient-to-b from-blue-950/40 to-slate-900 hover:border-blue-400/80 text-white'
                                    : 'border-purple-500/40 bg-gradient-to-b from-purple-950/40 to-slate-900 hover:border-purple-400/80 text-slate-200'
                        }">
                            <span class="text-xs sm:text-sm font-black leading-snug line-clamp-2">${card.text}</span>
                            <span class="text-[10px] text-slate-400 font-mono mt-1 opacity-75">${card.subText}</span>
                        </button>
                    `;
                }).join('')}
            </div>

            <!-- FOOTER HƯỚNG DẪN -->
            <div class="w-full max-w-2xl flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800 px-1">
                <span>💡 Bấm 1 thẻ tiếng Anh & 1 thẻ tiếng Việt khớp nghĩa</span>
                <span>Kỷ lục tốt nhất: <strong class="text-purple-400">${bestTime !== null ? bestTime.toFixed(1) + 's' : 'Chưa có'}</strong></span>
            </div>
        `;

        // Bind match cards click
        const tileBtns = container.querySelectorAll(".match-tile-btn");
        tileBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const cardId = btn.getAttribute("data-card-id");
                handleMatchSelect(cardId);
            });
        });

        // Restart btn
        const restartBtn = container.querySelector("#matchRestartBtn");
        if (restartBtn) {
            restartBtn.addEventListener("click", () => {
                initMatchGame();
                renderMatchGameTab(container);
            });
        }
    }

    function handleMatchSelect(cardId) {
        const card = matchCards.find(c => c.id === cardId);
        if (!card || card.isMatched) return;

        if (matchSelected.some(c => c.id === cardId)) {
            matchSelected = matchSelected.filter(c => c.id !== cardId);
            renderCurrentTab();
            return;
        }

        if (window.AudioHelper && window.AudioHelper.playClick) window.AudioHelper.playClick();
        matchSelected.push(card);

        if (matchSelected.length === 1) {
            if (card.lang === 'en') speakWord(card.text);
            renderCurrentTab();
            return;
        }

        if (matchSelected.length === 2) {
            renderCurrentTab();
            const [c1, c2] = matchSelected;

            if (c1.stt === c2.stt && c1.lang !== c2.lang) {
                if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                c1.isMatched = true;
                c2.isMatched = true;
                matchMatchedCount++;
                matchSelected = [];

                if (matchMatchedCount === 6) {
                    clearInterval(matchTimerInterval);
                    matchIsCompleted = true;
                    const finalTime = matchElapsedSeconds;
                    const isNewRecord = setBestMatchTime(finalTime);

                    if (window.confetti) {
                        window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                    }

                    setTimeout(() => {
                        showMatchVictoryModal(finalTime, isNewRecord);
                    }, 400);
                } else {
                    renderCurrentTab();
                }
            } else {
                setTimeout(() => {
                    matchSelected = [];
                    renderCurrentTab();
                }, 550);
            }
        }
    }

    function showMatchVictoryModal(timeSec, isNewRecord) {
        const content = document.getElementById("vocabTabContent");
        if (!content) return;

        content.innerHTML = `
            <div class="max-w-md w-full mx-auto my-auto text-center p-6 sm:p-8 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl animate-scaleUp">
                <div class="text-5xl mb-3 animate-bounce">🏆</div>
                <h3 class="text-xl sm:text-2xl font-black text-white mb-1">
                    Xuất Sắc! Hoàn Thành Ghép Thẻ!
                </h3>
                <p class="text-xs text-slate-400 mb-4">
                    Bạn đã phản xạ và ghi nhớ chính xác toàn bộ 6 cặp từ vựng.
                </p>

                <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-5">
                    <div class="text-xs text-slate-400 mb-1">Thời gian hoàn thành:</div>
                    <div class="text-3xl font-black font-mono text-emerald-400 mb-2">
                        ${timeSec.toFixed(1)} giây
                    </div>
                    ${isNewRecord ? `
                        <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            🎉 KỶ LỤC TỐT NHẤT MỚI!
                        </div>
                    ` : ''}
                </div>

                <div class="flex items-center justify-center gap-3">
                    <button type="button" id="matchPlayAgainBtn" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95">
                        ⚡ Chơi Ván Mới
                    </button>
                    <button type="button" id="matchBackToFlashBtn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all cursor-pointer active:scale-95">
                        🎴 Về Flashcard
                    </button>
                </div>
            </div>
        `;

        document.getElementById("matchPlayAgainBtn").addEventListener("click", () => {
            initMatchGame();
            renderMatchGameTab(content);
        });
        document.getElementById("matchBackToFlashBtn").addEventListener("click", () => {
            switchTab("flashcards");
        });
    }

    // ==========================================
    // 4. CHẾ ĐỘ SPELING & DICTATION (LUYỆN VIẾT)
    // ==========================================
    function renderSpellingTab(container) {
        if (spellingIndex >= spellingList.length) spellingIndex = 0;
        const currentItem = spellingList[spellingIndex];

        container.className = "flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col justify-between items-center";
        container.innerHTML = `
            <!-- Top Controls -->
            <div class="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">Câu ${spellingIndex + 1} / ${spellingList.length}</span>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Đúng: ${spellingScore.correct}/${spellingScore.total}
                    </span>
                </div>

                <button type="button" id="spellingShuffleBtn" class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer active:scale-95">
                    <span>🔀</span> <span>Đổi thứ tự</span>
                </button>
            </div>

            <!-- MAIN SPELLING CARD -->
            <div class="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl flex flex-col items-center text-center my-auto">
                <button type="button" id="spellingSpeakBigBtn" class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 mb-3" title="Nghe lại phát âm tiếng Anh">
                    🔊
                </button>
                <span class="text-xs text-blue-400 font-bold mb-3">Nhấp loa để nghe phát âm</span>

                <div class="text-lg sm:text-xl font-black text-emerald-400 mb-1">
                    ${currentItem.primaryMeaning}
                </div>
                <div class="text-xs text-slate-400 mb-5">
                    (${currentItem.type}) • ${currentItem.primaryWord.length} ký tự
                </div>

                <form id="spellingForm" class="w-full max-w-md flex flex-col items-center gap-3">
                    <div class="w-full relative">
                        <input type="text" id="spellingInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                               placeholder="Gõ từ tiếng Anh vào đây..." 
                               class="w-full px-4 py-3 text-center text-base sm:text-lg font-bold rounded-2xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all">
                    </div>

                    <div id="spellingFeedbackArea" class="min-h-[24px] text-xs font-bold"></div>

                    <div class="flex items-center gap-2 w-full justify-center">
                        <button type="button" id="spellingHintBtn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-650 text-slate-200 transition-all cursor-pointer active:scale-95">
                            💡 Gợi ý chữ
                        </button>
                        <button type="submit" class="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all cursor-pointer active:scale-95">
                            Kiểm tra (Enter)
                        </button>
                    </div>
                </form>
            </div>

            <!-- Footer navigation -->
            <div class="w-full max-w-xl flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                <button type="button" id="spellingPrevBtn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">← Câu trước</button>
                <button type="button" id="spellingNextBtn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">Bỏ qua / Câu sau →</button>
            </div>
        `;

        const inputEl = container.querySelector("#spellingInput");
        if (inputEl) {
            setTimeout(() => inputEl.focus(), 100);
        }

        speakWord(currentItem.primaryWord);

        container.querySelector("#spellingSpeakBigBtn").addEventListener("click", () => {
            speakWord(currentItem.primaryWord);
        });

        spellingRevealedChars = 0;
        container.querySelector("#spellingHintBtn").addEventListener("click", () => {
            spellingRevealedChars++;
            const word = currentItem.primaryWord;
            const hint = word.slice(0, spellingRevealedChars) + " _".repeat(Math.max(0, word.length - spellingRevealedChars));
            const feedback = container.querySelector("#spellingFeedbackArea");
            feedback.innerHTML = `<span class="text-amber-400 font-mono">Gợi ý: ${hint}</span>`;
            if (inputEl) inputEl.focus();
        });

        container.querySelector("#spellingForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const typed = (inputEl.value || "").trim().toLowerCase();
            const target = currentItem.primaryWord.toLowerCase().trim();
            const feedback = container.querySelector("#spellingFeedbackArea");

            if (!typed) return;

            spellingScore.total++;
            if (typed === target || typed === currentItem.primaryWord.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()) {
                spellingScore.correct++;
                if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                feedback.innerHTML = `<span class="text-emerald-400">🎉 Chính xác! "${currentItem.primaryWord}"</span>`;
                inputEl.classList.remove("border-slate-700", "border-rose-500");
                inputEl.classList.add("border-emerald-500", "bg-emerald-950/20");

                setTimeout(() => {
                    spellingIndex = (spellingIndex + 1) % spellingList.length;
                    renderCurrentTab();
                }, 1000);
            } else {
                feedback.innerHTML = `<span class="text-rose-400">❌ Chưa đúng! Đáp án đúng: <strong class="text-white underline">${currentItem.primaryWord}</strong></span>`;
                inputEl.classList.remove("border-slate-700");
                inputEl.classList.add("border-rose-500");
                speakWord(currentItem.primaryWord);
            }
        });

        container.querySelector("#spellingPrevBtn").addEventListener("click", () => {
            spellingIndex = (spellingIndex - 1 + spellingList.length) % spellingList.length;
            renderCurrentTab();
        });
        container.querySelector("#spellingNextBtn").addEventListener("click", () => {
            spellingIndex = (spellingIndex + 1) % spellingList.length;
            renderCurrentTab();
        });
        container.querySelector("#spellingShuffleBtn").addEventListener("click", () => {
            spellingList = shuffleArray(spellingList);
            spellingIndex = 0;
            renderCurrentTab();
        });
    }

    // ==========================================
    // 5. CHẾ ĐỘ TRẮC NGHIỆM PHẢN XẠ (SPEED QUIZ)
    // ==========================================
    function initQuiz() {
        quizCurrentIdx = 0;
        quizScore = 0;
        quizSelectedAnswer = null;
        quizAnswerSubmitted = false;

        const shuffled = shuffleArray(UNIT4_VOCAB_DATA).slice(0, 10);
        quizList = shuffled.map(item => {
            const otherItems = shuffleArray(UNIT4_VOCAB_DATA.filter(x => x.stt !== item.stt)).slice(0, 3);
            const options = shuffleArray([
                { text: item.primaryMeaning, isCorrect: true, fullItem: item },
                { text: otherItems[0].primaryMeaning, isCorrect: false, fullItem: otherItems[0] },
                { text: otherItems[1].primaryMeaning, isCorrect: false, fullItem: otherItems[1] },
                { text: otherItems[2].primaryMeaning, isCorrect: false, fullItem: otherItems[2] }
            ]);

            return {
                questionWord: item.primaryWord,
                ipa: item.ipa,
                type: item.type,
                correctItem: item,
                options: options
            };
        });
    }

    function renderQuizTab(container) {
        if (quizList.length === 0) {
            initQuiz();
        }

        if (quizCurrentIdx >= quizList.length) {
            container.className = "flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center";
            container.innerHTML = `
                <div class="max-w-md w-full text-center p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl animate-scaleUp">
                    <div class="text-5xl mb-3">🎯</div>
                    <h3 class="text-xl font-black text-white mb-1">Hoàn Thành Trắc Nghiệm Phản Xạ!</h3>
                    <p class="text-xs text-slate-400 mb-4">Bạn vừa hoàn thành bài kiểm tra 10 câu phản xạ từ vựng.</p>
                    
                    <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-5">
                        <div class="text-xs text-slate-400 mb-1">Điểm số đạt được:</div>
                        <div class="text-3xl font-black ${quizScore >= 8 ? 'text-emerald-400' : quizScore >= 5 ? 'text-amber-400' : 'text-rose-400'}">
                            ${quizScore} / 10
                        </div>
                        <div class="text-xs text-slate-400 mt-1">
                            ${quizScore >= 8 ? 'Xuất sắc! Khả năng nhớ từ vựng rất vững!' : 'Hãy ôn lại thêm flashcard để ghi nhớ chắc hơn nhé!'}
                        </div>
                    </div>

                    <div class="flex items-center justify-center gap-3">
                        <button type="button" id="quizPlayAgainBtn" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md cursor-pointer active:scale-95">
                            🎯 Làm Đề Khác
                        </button>
                        <button type="button" id="quizBackToFlashBtn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700 text-slate-200 cursor-pointer active:scale-95">
                            🎴 Về Flashcard
                        </button>
                    </div>
                </div>
            `;
            container.querySelector("#quizPlayAgainBtn").addEventListener("click", () => {
                initQuiz();
                renderCurrentTab();
            });
            container.querySelector("#quizBackToFlashBtn").addEventListener("click", () => {
                switchTab("flashcards");
            });
            return;
        }

        const currentQ = quizList[quizCurrentIdx];

        container.className = "flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col justify-between items-center";
        container.innerHTML = `
            <!-- Top Controls -->
            <div class="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                <span class="font-bold text-white text-sm">Câu ${quizCurrentIdx + 1} / 10</span>
                <span class="font-bold text-emerald-400">Điểm hiện tại: ${quizScore}/${quizCurrentIdx}</span>
            </div>

            <!-- QUESTION CARD -->
            <div class="w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl text-center mb-4">
                <div class="flex items-center justify-center gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ${currentQ.type}
                    </span>
                    <button type="button" id="quizSpeakBtn" class="text-blue-400 hover:text-blue-300 text-sm cursor-pointer" title="Nghe phát âm">
                        🔊
                    </button>
                </div>
                <h3 class="text-2xl sm:text-3xl font-black text-white tracking-wide mb-1">
                    "${currentQ.questionWord}"
                </h3>
                <div class="text-xs text-slate-400 font-mono mb-1">${currentQ.ipa}</div>
                <p class="text-xs text-slate-400">Nghĩa tiếng Việt chính xác nhất của từ trên là gì?</p>
            </div>

            <!-- OPTIONS LIST -->
            <div class="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                ${currentQ.options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    let btnStyle = "border-slate-700 bg-slate-800 hover:border-indigo-500 text-slate-200";

                    if (quizAnswerSubmitted) {
                        if (opt.isCorrect) {
                            btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/40 font-bold";
                        } else if (quizSelectedAnswer === idx) {
                            btnStyle = "border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/40";
                        } else {
                            btnStyle = "border-slate-800 bg-slate-900/60 text-slate-500 opacity-50";
                        }
                    }

                    return `
                        <button type="button" data-opt-idx="${idx}" class="quiz-option-btn p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 cursor-pointer active:scale-98 ${btnStyle}" ${quizAnswerSubmitted ? 'disabled' : ''}>
                            <span class="w-6 h-6 rounded-lg bg-slate-700/80 font-black text-xs flex items-center justify-center shrink-0">
                                ${letters[idx]}
                            </span>
                            <span class="text-xs sm:text-sm font-semibold leading-snug">${opt.text}</span>
                        </button>
                    `;
                }).join('')}
            </div>

            <!-- NEXT BUTTON -->
            <div class="w-full max-w-xl flex items-center justify-end">
                ${quizAnswerSubmitted ? `
                    <button type="button" id="quizNextBtn" class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 animate-fadeIn">
                        <span>Câu tiếp theo</span> <span>→</span>
                    </button>
                ` : `
                    <span class="text-xs text-slate-500">Chọn 1 đáp án để xem kết quả</span>
                `}
            </div>
        `;

        container.querySelector("#quizSpeakBtn").addEventListener("click", () => {
            speakWord(currentQ.questionWord);
        });

        const optionBtns = container.querySelectorAll(".quiz-option-btn");
        optionBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (quizAnswerSubmitted) return;
                const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
                quizSelectedAnswer = optIdx;
                quizAnswerSubmitted = true;

                if (currentQ.options[optIdx].isCorrect) {
                    quizScore++;
                    if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                }

                renderCurrentTab();
            });
        });

        const nextBtn = container.querySelector("#quizNextBtn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                quizCurrentIdx++;
                quizSelectedAnswer = null;
                quizAnswerSubmitted = false;
                renderCurrentTab();
            });
        }
    }

    // ==========================================
    // 6. CHẾ ĐỘ BẢNG TRA CỨU TOÀN DIỆN (LIST VIEW)
    // ==========================================
    let listSearchKeyword = "";
    let listTypeFilter = "all";

    function renderListTab(container) {
        container.className = "flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col";
        container.innerHTML = `
            <!-- SEARCH & FILTER BAR -->
            <div class="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
                <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                    <input type="text" id="vocabListSearchInput" value="${listSearchKeyword}" placeholder="Tìm nhanh từ vựng, loại từ hoặc nghĩa tiếng Việt..." 
                           class="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                </div>

                <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <button type="button" data-type-filter="all" class="list-filter-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${listTypeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">
                        Tất cả (40)
                    </button>
                    <button type="button" data-type-filter="starred" class="list-filter-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${listTypeFilter === 'starred' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-amber-400'}">
                        ⭐ Có sao
                    </button>
                    <button type="button" data-type-filter="phrase" class="list-filter-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${listTypeFilter === 'phrase' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-purple-400'}">
                        Cụm từ
                    </button>
                </div>
            </div>

            <!-- TABLE CONTAINER -->
            <div class="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table class="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead class="bg-slate-900/90 text-slate-400 font-bold sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                            <th class="py-2.5 px-3 w-12 text-center">STT</th>
                            <th class="py-2.5 px-3 w-48 sm:w-60">Từ vựng & Phát âm</th>
                            <th class="py-2.5 px-3 w-28">Loại từ</th>
                            <th class="py-2.5 px-3">Nghĩa tiếng Việt & Ghi chú</th>
                            <th class="py-2.5 px-2 w-14 text-center">Lưu</th>
                        </tr>
                    </thead>
                    <tbody id="vocabListTableBody" class="divide-y divide-slate-800/60 font-medium">
                        <!-- Dynamic rows -->
                    </tbody>
                </table>
            </div>
        `;

        const searchInput = container.querySelector("#vocabListSearchInput");
        searchInput.addEventListener("input", (e) => {
            listSearchKeyword = e.target.value;
            renderListRows();
        });

        const filterBtns = container.querySelectorAll(".list-filter-btn");
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                listTypeFilter = btn.getAttribute("data-type-filter");
                renderListTab(container);
            });
        });

        renderListRows();
    }

    function renderListRows() {
        const tbody = document.getElementById("vocabListTableBody");
        if (!tbody) return;

        const kw = listSearchKeyword.toLowerCase().trim();
        const starredMap = getStarredMap();

        const filtered = UNIT4_VOCAB_DATA.filter(item => {
            if (listTypeFilter === 'starred' && !starredMap[item.stt]) return false;
            if (listTypeFilter === 'phrase' && !item.type.includes('phr')) return false;

            if (!kw) return true;
            return item.primaryWord.toLowerCase().includes(kw) ||
                   item.displayWord.toLowerCase().includes(kw) ||
                   item.primaryMeaning.toLowerCase().includes(kw) ||
                   item.type.toLowerCase().includes(kw) ||
                   (item.note && item.note.toLowerCase().includes(kw));
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-8 text-center text-slate-500 italic">
                        Không tìm thấy từ vựng nào khớp với từ khóa "${listSearchKeyword}".
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const isStarred = !!starredMap[item.stt];
            const badge = getTypeBadge(item.type);

            return `
                <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                        ${item.stt}
                    </td>
                    <td class="py-2.5 px-3">
                        <div class="flex items-center gap-1.5">
                            <span class="font-black text-white text-xs sm:text-sm tracking-tight">${item.primaryWord}</span>
                            <button type="button" onclick="window.VocabHub.speak('${item.primaryWord}')" class="text-blue-400 hover:text-blue-300 transition-all cursor-pointer p-0.5 text-xs" title="Phát âm">
                                🔊
                            </button>
                        </div>
                        <div class="text-[10px] text-blue-400/80 font-mono">${item.ipa}</div>
                        ${item.displayWord !== item.primaryWord ? `
                            <div class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">${item.displayWord}</div>
                        ` : ''}
                    </td>
                    <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${badge.bg} border inline-block">
                            ${badge.label}
                        </span>
                    </td>
                    <td class="py-2.5 px-3">
                        <div class="font-bold text-slate-200 text-xs">${item.primaryMeaning}</div>
                        <div class="text-[11px] text-slate-400 italic mt-0.5">"${item.example}"</div>
                        ${item.note ? `
                            <div class="text-[10px] text-amber-400/90 font-medium mt-0.5">📌 ${item.note}</div>
                        ` : ''}
                    </td>
                    <td class="py-2.5 px-2 text-center">
                        <button type="button" onclick="window.VocabHub.toggleStar(${item.stt})" class="p-1 rounded-lg ${isStarred ? 'text-amber-400 font-bold' : 'text-slate-600 hover:text-slate-400'} transition-all cursor-pointer text-sm">
                            ${isStarred ? '⭐' : '☆'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // XỬ LÝ PHÍM TẮT TOÀN CỤC KHI MODAL MỞ
    function handleGlobalKeyDown(e) {
        const modal = document.getElementById("vocabMasterModal");
        if (!modal) return;

        if (e.key === "Escape") {
            closeModal();
            return;
        }

        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }

        if (currentTab === "flashcards") {
            if (e.code === "Space") {
                e.preventDefault();
                toggleCardFlip();
            } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                e.preventDefault();
                prevCard();
            } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                e.preventDefault();
                nextCard();
            } else if (e.key === "s" || e.key === "S") {
                e.preventDefault();
                const activeCards = getActiveFlashcards();
                if (activeCards[flashcardIndex]) speakWord(activeCards[flashcardIndex].primaryWord);
            } else if (e.key === "v" || e.key === "V" || e.key === "m" || e.key === "M") {
                e.preventDefault();
                markMastered(true);
            } else if (e.key === "x" || e.key === "X") {
                e.preventDefault();
                markMastered(false);
            }
        }
    }

    // EXPOSE GLOBAL API
    window.VocabHub = {
        data: UNIT4_VOCAB_DATA,
        open: openVocabModal,
        close: closeModal,
        openOralTest: () => openVocabModal('oral'),
        openFlashcards: () => openVocabModal('flashcards'),
        openMatchGame: () => openVocabModal('match'),
        openSpelling: () => openVocabModal('spelling'),
        openQuiz: () => openVocabModal('quiz'),
        openCheatSheet: () => openVocabModal('list'),
        speak: speakWord,
        speakTeacher: speakTeacherQuestion,
        toggleStar: (stt) => {
            toggleStarred(stt);
            renderCurrentTab();
        }
    };

    // Tương thích ngược với AzotaApp
    if (window.AzotaApp) {
        window.AzotaApp.openUnit4VocabCheatSheet = () => openVocabModal('oral');
        window.AzotaApp.openVocabHub = (tab) => openVocabModal(tab || 'oral');
        window.AzotaApp.openOralTest = () => openVocabModal('oral');
        window.AzotaApp.speakVocabWord = speakWord;
    }

})(window);
