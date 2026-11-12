/**
 * VOCABULARY STUDY SUITE (HỆ THỐNG HỌC TỪ VỰNG THÔNG MINH Aseta 2.5)
 * Dành cho Unit 4: ASEAN and Vietnam - 67 Từ Vựng Trọng Tâm THPT Trần Văn Giàu
 * 
 * Các tính năng cao cấp:
 * 1. 🎴 3D Flip Flashcards (Thẻ ghi nhớ 3D, Spaced Repetition Leitner, Auto-Play, Shuffle, Starred Filter)
 * 2. 👩‍🏫 Cô Khảo Bài Miệng 67/67 (Khảo ngẫu nhiên câu hỏi tiếng Việt của cô, lặp lại các câu sai cho đến khi thuộc 100%)
 * 3. ⚡ Speed Matching Game (Trò chơi ghép cặp từ vựng tốc độ cao có bấm giờ & lưu kỷ lục)
 * 4. ✍️ Spelling & Dictation Master (Luyện nghe & viết chính tả từ vựng, tự động kiểm tra, gợi ý)
 * 5. 🎯 Quick Speed Quiz (Trắc nghiệm nhanh 4 lựa chọn phản xạ từ - nghĩa)
 * 6. 📖 Full Reference Explorer (Bảng 67 từ tra cứu trực quan, phát âm, live search)
 * 7. 🏆 LocalStorage Persistence (Lưu từ gắn sao, từ đã thuộc, kỷ lục thời gian ghép thẻ, tiến độ cô khảo bài)
 */

(function (window) {
    'use strict';

    // DỮ LIỆU CHUẨN 40 TỪ VỰNG ĐẦU TIÊN TỪ CƯƠNG UNIT 4
    const UNIT4_VOCAB_DATA = [
        {
                "stt": 1,
                "primaryWord": "volunteer",
                "displayWord": "volunteer / volunteering / voluntary",
                "ipa": "/ˌvɒlənˈtɪər/",
                "type": "(n; v)",
                "typeCategory": "noun",
                "primaryMeaning": "tình nguyện viên, làm tình nguyện",
                "fullMeaning": "tình nguyện viên / làm tình nguyện (voluntary: tình nguyện, tự nguyện; trái nghĩa: compulsory, mandatory - bắt buộc)",
                "teacherQuestion": "tình nguyện viên, làm tình nguyện",
                "example": "Many high school students volunteer at local charity organizations during summer.",
                "exampleVi": "Nhiều học sinh cấp 3 làm tình nguyện tại các tổ chức từ thiện địa phương vào mùa hè.",
                "note": "voluntary (adj) >< compulsory, mandatory (adj: bắt buộc); volunteering (n): hoạt động tình nguyện"
        },
        {
                "stt": 2,
                "primaryWord": "take part in",
                "displayWord": "take part in / join in / participate in",
                "ipa": "/teɪk pɑːt ɪn/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "tham gia",
                "fullMeaning": "tham gia (= join in = participate in = engage in)",
                "teacherQuestion": "tham gia",
                "example": "Vietnam takes part in various cultural exchange programs across Southeast Asia.",
                "exampleVi": "Việt Nam tham gia vào nhiều chương trình giao lưu văn hóa trên khắp Đông Nam Á.",
                "note": "take part in = join in = participate in = engage in (+ V-ing / Noun)"
        },
        {
                "stt": 3,
                "primaryWord": "development",
                "displayWord": "development / develop / developmental",
                "ipa": "/dɪˈveləpmənt/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "sự phát triển",
                "fullMeaning": "sự phát triển (động từ: develop; tính từ: developmental)",
                "teacherQuestion": "sự phát triển",
                "example": "Economic development is one of the top priorities of ASEAN member states.",
                "exampleVi": "Phát triển kinh tế là một trong những ưu tiên hàng đầu của các quốc gia thành viên ASEAN.",
                "note": "develop (v) -> development (n) -> developmental (adj)"
        },
        {
                "stt": 4,
                "primaryWord": "goal",
                "displayWord": "goal / aim",
                "ipa": "/ɡəʊl/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "mục tiêu",
                "fullMeaning": "mục tiêu (= aim, objective, target)",
                "teacherQuestion": "mục tiêu",
                "example": "Our main goal is to promote peace and stability in the region.",
                "exampleVi": "Mục tiêu chính của chúng tôi là thúc đẩy hòa bình và ổn định trong khu vực.",
                "note": "achieve/set a goal; goal = aim (n)"
        },
        {
                "stt": 5,
                "primaryWord": "be qualified (for)",
                "displayWord": "be qualified (for) / qualify / qualification",
                "ipa": "/biː ˈkwɒlɪfaɪd fɔːr/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "đủ tiêu chuẩn (cho)",
                "fullMeaning": "đủ tiêu chuẩn (cho), đủ điều kiện / năng lực (= be eligible for)",
                "teacherQuestion": "đủ tiêu chuẩn, đủ điều kiện cho",
                "example": "Candidates must be qualified for the ASEAN youth leadership exchange program.",
                "exampleVi": "Các ứng viên phải có đủ điều kiện và tiêu chuẩn tham gia chương trình giao lưu lãnh đạo trẻ ASEAN.",
                "note": "qualify (v) -> qualification (n: bằng cấp, tiêu chuẩn) -> qualified (adj)"
        },
        {
                "stt": 6,
                "primaryWord": "suggest + V-ing",
                "displayWord": "suggest + V-ing",
                "ipa": "/səˈdʒest/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "gợi ý làm gì",
                "fullMeaning": "gợi ý, đề xuất làm gì (theo sau là V-ing hoặc that + S + (should) + V-inf)",
                "teacherQuestion": "gợi ý, đề xuất làm gì",
                "example": "The teacher suggested organizing a cultural exchange exhibition next week.",
                "exampleVi": "Cô giáo đã gợi ý tổ chức một buổi triển lãm giao lưu văn hóa vào tuần tới.",
                "note": "suggest + V-ing; suggest that S + (should) V-inf; suggestion (n)"
        },
        {
                "stt": 7,
                "primaryWord": "thank sb for V-ing",
                "displayWord": "thank sb for V-ing",
                "ipa": "/θæŋk/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "cảm ơn ai vì đã làm gì",
                "fullMeaning": "cảm ơn ai đó vì đã làm gì",
                "teacherQuestion": "cảm ơn ai vì đã làm gì",
                "example": "The presenter thanked the audience for listening attentively.",
                "exampleVi": "Người thuyết trình đã cảm ơn khán giả vì đã chăm chú lắng nghe.",
                "note": "thank someone for doing something; thankful (adj) to sb for sth"
        },
        {
                "stt": 8,
                "primaryWord": "community",
                "displayWord": "community / communal",
                "ipa": "/kəˈmjuːnəti/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "cộng đồng",
                "fullMeaning": "cộng đồng (tính từ: communal: thuộc về cộng đồng, chung)",
                "teacherQuestion": "cộng đồng",
                "example": "The ASEAN Community was established to bring Southeast Asian nations closer.",
                "exampleVi": "Cộng đồng ASEAN được thành lập nhằm đưa các quốc gia Đông Nam Á lại gần nhau hơn.",
                "note": "communal (adj): thuộc cộng đồng, công cộng; community work: công tác cộng đồng"
        },
        {
                "stt": 9,
                "primaryWord": "be keen on",
                "displayWord": "be keen on / interested in / fond of",
                "ipa": "/biː kiːn ɒn/",
                "type": "phr.v",
                "typeCategory": "phrase",
                "primaryMeaning": "yêu thích, say mê",
                "fullMeaning": "yêu thích, say mê (= be interested in = be fond of = excited about)",
                "teacherQuestion": "yêu thích, say mê điều gì",
                "example": "She is keen on learning about diverse ASEAN cultural traditions.",
                "exampleVi": "Cô ấy rất say mê tìm hiểu các truyền thống văn hóa đa dạng của ASEAN.",
                "note": "be keen on = be interested in = be fond of = be keen on (+ V-ing/Noun); keenness (n)"
        },
        {
                "stt": 10,
                "primaryWord": "depend on",
                "displayWord": "depend on / dependent / dependence",
                "ipa": "/dɪˈpend ɒn/",
                "type": "phr.v",
                "typeCategory": "phrase",
                "primaryMeaning": "phụ thuộc vào",
                "fullMeaning": "phụ thuộc vào (= rely on; tính từ: dependent; danh từ: dependence; trái nghĩa: independent from/of)",
                "teacherQuestion": "phụ thuộc vào",
                "example": "The success of the project depends on close cooperation among all members.",
                "exampleVi": "Thành công của dự án phụ thuộc vào sự hợp tác chặt chẽ giữa tất cả các thành viên.",
                "note": "depend on/upon; dependent (adj); dependence (n) >< independent from/of (adj)"
        },
        {
                "stt": 11,
                "primaryWord": "leadership skills",
                "displayWord": "leadership skills",
                "ipa": "/ˈliːdəʃɪp skɪlz/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "kỹ năng lãnh đạo",
                "fullMeaning": "kỹ năng lãnh đạo",
                "teacherQuestion": "kỹ năng lãnh đạo",
                "example": "Participating in youth forums helps students build valuable leadership skills.",
                "exampleVi": "Tham gia diễn đàn thanh niên giúp học sinh xây dựng kỹ năng lãnh đạo quý báu.",
                "note": "lead (v) -> leader (n: người lãnh đạo) -> leadership (n: năng lực lãnh đạo)"
        },
        {
                "stt": 12,
                "primaryWord": "contribution",
                "displayWord": "contribution / contribute to / contributor",
                "ipa": "/ˌkɒntrɪˈbjuːʃn/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "sự đóng góp",
                "fullMeaning": "sự đóng góp (động từ: contribute to; danh từ chỉ người: contributor; cụm từ: make contribution to)",
                "teacherQuestion": "sự đóng góp",
                "example": "Vietnam has made significant contributions to the prosperity of the region.",
                "exampleVi": "Việt Nam đã có những đóng góp to lớn vào sự thịnh vượng của khu vực.",
                "note": "make a contribution to = contribute to (v); contributor (n: người đóng góp)"
        },
        {
                "stt": 13,
                "primaryWord": "cultural exchange",
                "displayWord": "cultural exchange",
                "ipa": "/ˈkʌltʃərəl ɪksˈtʃeɪndʒ/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "giao lưu văn hoá",
                "fullMeaning": "giao lưu văn hoá",
                "teacherQuestion": "giao lưu văn hoá",
                "example": "Cultural exchange programs strengthen friendly relations among ASEAN countries.",
                "exampleVi": "Các chương trình giao lưu văn hóa củng cố mối quan hệ hữu nghị giữa các nước ASEAN.",
                "note": "culture (n) -> cultural (adj); cultural exchange: giao lưu văn hóa"
        },
        {
                "stt": 14,
                "primaryWord": "current issues",
                "displayWord": "current issues",
                "ipa": "/ˈkʌrənt ˈɪʃuːz/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "các vấn đề hiện tại",
                "fullMeaning": "các vấn đề hiện nay, thời sự",
                "teacherQuestion": "các vấn đề hiện tại, thời sự",
                "example": "ASEAN summits always focus on discussing urgent current issues.",
                "exampleVi": "Các hội nghị thượng đỉnh ASEAN luôn tập trung thảo luận các vấn đề thời sự cấp bách.",
                "note": "current (adj: hiện hành, hiện tại); issue (n: vấn đề, đề tài)"
        },
        {
                "stt": 15,
                "primaryWord": "climate change",
                "displayWord": "climate change",
                "ipa": "/ˈklaɪmət tʃeɪndʒ/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "biến đổi khí hậu",
                "fullMeaning": "biến đổi khí hậu toàn cầu",
                "teacherQuestion": "biến đổi khí hậu",
                "example": "Climate change poses a serious threat to agriculture in the Mekong Delta.",
                "exampleVi": "Biến đổi khí hậu gây ra mối đe dọa nghiêm trọng cho nông nghiệp Đồng bằng sông Cửu Long.",
                "note": "fight/combat climate change; global warming"
        },
        {
                "stt": 16,
                "primaryWord": "convenient",
                "displayWord": "convenient / convenience",
                "ipa": "/kənˈviːniənt/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "thuận tiện",
                "fullMeaning": "thuận tiện, tiện lợi (danh từ: convenience; trái nghĩa: inconvenient)",
                "teacherQuestion": "thuận tiện, tiện lợi",
                "example": "Online conferences make it convenient for delegates to connect without traveling.",
                "exampleVi": "Các hội nghị trực tuyến giúp đại biểu kết nối thuận tiện mà không cần di chuyển.",
                "note": "convenience (n: sự thuận tiện) >< inconvenience; convenient (adj) >< inconvenient"
        },
        {
                "stt": 17,
                "primaryWord": "ability",
                "displayWord": "ability / inability / disability",
                "ipa": "/əˈbɪləti/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "khả năng / có khả năng",
                "fullMeaning": "khả năng (trái nghĩa: inability: sự không có khả năng; disability: khuyết tật)",
                "teacherQuestion": "khả năng, năng lực",
                "example": "He proved his ability to lead diverse multinational teams effectively.",
                "exampleVi": "Anh ấy đã chứng minh khả năng lãnh đạo các đội ngũ đa quốc gia một cách hiệu quả.",
                "note": "able (adj) -> ability (n) >< inability (n); disability (n: sự khuyết tật)"
        },
        {
                "stt": 18,
                "primaryWord": "managed to (+ V-inf)",
                "displayWord": "managed to (+ V-inf)",
                "ipa": "/ˈmænɪdʒd tuː/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "xoay xở thành công để làm gì",
                "fullMeaning": "đã xoay xở thành công để làm gì (= succeed in V-ing)",
                "teacherQuestion": "đã xoay xở thành công để làm gì",
                "example": "Despite the heavy traffic, the delegation managed to arrive at the summit on time.",
                "exampleVi": "Dù kẹt xe dữ dội, đoàn đại biểu đã xoay xở đến hội nghị thượng đỉnh đúng giờ.",
                "note": "manage to do sth = succeed in doing sth; management (n)"
        },
        {
                "stt": 19,
                "primaryWord": "reach",
                "displayWord": "reach",
                "ipa": "/riːtʃ/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "đạt được",
                "fullMeaning": "đạt được, chạm tới (= achieve, attain)",
                "teacherQuestion": "đạt được, chạm tới",
                "example": "ASEAN nations strive to reach a comprehensive agreement on environmental protection.",
                "exampleVi": "Các quốc gia ASEAN nỗ lực đạt được thỏa thuận toàn diện về bảo vệ môi trường.",
                "note": "reach an agreement / compromise / consensus (đạt được thỏa thuận/đồng thuận)"
        },
        {
                "stt": 20,
                "primaryWord": "aim",
                "displayWord": "aim",
                "ipa": "/eɪm/",
                "type": "(n; v)",
                "typeCategory": "verb",
                "primaryMeaning": "mục tiêu, nhắm đến",
                "fullMeaning": "mục tiêu / nhắm đến, hướng tới (= goal, purpose; aim at / aim to do sth)",
                "teacherQuestion": "mục tiêu hoặc nhắm đến",
                "example": "The campaign aims to raise young people's awareness of regional cooperation.",
                "exampleVi": "Chiến dịch nhắm đến việc nâng cao nhận thức của giới trẻ về hợp tác khu vực.",
                "note": "aim to do sth / aim at V-ing; take aim at; with the aim of"
        },
        {
                "stt": 21,
                "primaryWord": "various",
                "displayWord": "various / diverse",
                "ipa": "/ˈveəriəs/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "đa dạng, nhiều loại khác nhau",
                "fullMeaning": "đa dạng, nhiều loại khác nhau (= diverse)",
                "teacherQuestion": "đa dạng, nhiều loại khác nhau",
                "example": "Youth delegates from various Asian nations gathered in Hanoi for the workshop.",
                "exampleVi": "Các đại biểu thanh niên từ nhiều quốc gia châu Á khác nhau đã tụ họp tại Hà Nội.",
                "note": "various = diverse (adj); vary (v: thay đổi, biến đổi)"
        },
        {
                "stt": 22,
                "primaryWord": "variety",
                "displayWord": "variety / a variety of / diversity",
                "ipa": "/vəˈraɪəti/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "sự đa dạng",
                "fullMeaning": "sự đa dạng (= diversity; a variety of + danh từ số nhiều)",
                "teacherQuestion": "sự đa dạng",
                "example": "The festival features a wide variety of traditional dishes and costumes.",
                "exampleVi": "Lễ hội giới thiệu rất nhiều món ăn và trang phục truyền thống đa dạng.",
                "note": "a variety of + Ns = a wide range of + Ns; diversity (n)"
        },
        {
                "stt": 23,
                "primaryWord": "participant",
                "displayWord": "participant / participation",
                "ipa": "/pɑːˈtɪsɪpənt/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "người tham gia",
                "fullMeaning": "người tham gia, người tham dự (sự tham gia: participation)",
                "teacherQuestion": "người tham gia, người tham dự",
                "example": "Every participant in the forum received a certificate of completion.",
                "exampleVi": "Mỗi người tham gia diễn đàn đều nhận được chứng chỉ hoàn thành.",
                "note": "participate in (v) -> participant (n: người tham gia) -> participation (n: sự tham gia)"
        },
        {
                "stt": 24,
                "primaryWord": "take place",
                "displayWord": "take place / happen / occur",
                "ipa": "/teɪk pleɪs/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "diễn ra",
                "fullMeaning": "diễn ra (có kế hoạch trước; = happen = occur)",
                "teacherQuestion": "diễn ra",
                "example": "The next ASEAN summit will take place in Vientiane, Laos.",
                "exampleVi": "Hội nghị thượng đỉnh ASEAN tiếp theo sẽ diễn ra tại Viêng Chăn, Lào.",
                "note": "take place (có kế hoạch) >< happen / occur (tự nhiên, bất ngờ)"
        },
        {
                "stt": 25,
                "primaryWord": "live-streamed",
                "displayWord": "live-streamed",
                "ipa": "/ˈlaɪv striːmd/",
                "type": "adj/v",
                "typeCategory": "adj",
                "primaryMeaning": "được phát trực tiếp",
                "fullMeaning": "được truyền hình trực tiếp, phát trực tuyến qua mạng",
                "teacherQuestion": "được phát trực tiếp trên mạng",
                "example": "The opening ceremony of the ASEAN festival was live-streamed worldwide.",
                "exampleVi": "Lễ khai mạc lễ hội ASEAN đã được phát trực tiếp trên toàn thế giới.",
                "note": "live stream (v, n); live-streamed (quá khứ/phân từ/adj)"
        },
        {
                "stt": 26,
                "primaryWord": "raise awareness of",
                "displayWord": "raise awareness of",
                "ipa": "/reɪz əˈweənəs əv/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "nâng cao nhận thức",
                "fullMeaning": "nâng cao nhận thức về một vấn đề",
                "teacherQuestion": "nâng cao nhận thức",
                "example": "The youth campaign successfully raised public awareness of wildlife protection.",
                "exampleVi": "Chiến dịch thanh niên đã nâng cao nhận thức cộng đồng thành công về bảo vệ động vật hoang dã.",
                "note": "raise awareness of / about sth; aware (adj) -> awareness (n)"
        },
        {
                "stt": 27,
                "primaryWord": "promote",
                "displayWord": "promote / promotion",
                "ipa": "/prəˈməʊt/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "thúc đẩy, quảng bá",
                "fullMeaning": "thúc đẩy, phát triển, quảng bá (danh từ: promotion)",
                "teacherQuestion": "thúc đẩy, quảng bá",
                "example": "Member states work together to promote regional tourism and economic trade.",
                "exampleVi": "Các nước thành viên hợp tác cùng nhau để thúc đẩy du lịch khu vực và thương mại kinh tế.",
                "note": "promote (v) -> promotion (n: sự thúc đẩy / quảng bá / thăng chức)"
        },
        {
                "stt": 28,
                "primaryWord": "strengthen",
                "displayWord": "strengthen / strong / strength",
                "ipa": "/ˈstreŋkθn/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "củng cố, tăng cường",
                "fullMeaning": "củng cố, làm cho mạnh mẽ hơn (tính từ: strong; danh từ: strength)",
                "teacherQuestion": "củng cố, tăng cường",
                "example": "Youth exchanges help strengthen mutual understanding between countries.",
                "exampleVi": "Giao lưu thanh niên giúp củng cố sự hiểu biết lẫn nhau giữa các quốc gia.",
                "note": "strong (adj) -> strength (n: sức mạnh) -> strengthen (v: củng cố)"
        },
        {
                "stt": 29,
                "primaryWord": "relation",
                "displayWord": "relation / relationship",
                "ipa": "/rɪˈleɪʃn/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "mối quan hệ",
                "fullMeaning": "mối quan hệ (quốc tế/chính trị: relation; giữa người với người hoặc người với sự vật: relationship)",
                "teacherQuestion": "mối quan hệ",
                "example": "Diplomatic relations between Vietnam and other ASEAN countries have flourished.",
                "exampleVi": "Quan hệ ngoại giao giữa Việt Nam và các nước ASEAN khác đã phát triển rực rỡ.",
                "note": "diplomatic relations (quan hệ ngoại giao); relationship (n: mối quan hệ cá nhân/gắn kết)"
        },
        {
                "stt": 30,
                "primaryWord": "represent",
                "displayWord": "represent",
                "ipa": "/ˌreprɪˈzent/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "đại diện",
                "fullMeaning": "đại diện cho, tượng trưng cho",
                "teacherQuestion": "đại diện",
                "example": "Two outstanding students were chosen to represent Vietnam at the summit.",
                "exampleVi": "Hai học sinh xuất sắc đã được chọn để đại diện cho Việt Nam tại hội nghị thượng đỉnh.",
                "note": "represent (v) -> representative (n: người đại diện; adj: tiêu biểu)"
        },
        {
                "stt": 31,
                "primaryWord": "representative",
                "displayWord": "representative",
                "ipa": "/ˌreprɪˈzentətɪv/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "người đại diện",
                "fullMeaning": "người đại diện, đại biểu",
                "teacherQuestion": "người đại diện, đại biểu",
                "example": "Official representatives from 10 ASEAN countries signed the historic declaration.",
                "exampleVi": "Các đại diện chính thức từ 10 quốc gia ASEAN đã ký kết tuyên bố lịch sử.",
                "note": "representative (n: người đại diện; adj: mang tính đại diện)"
        },
        {
                "stt": 32,
                "primaryWord": "eye-opening",
                "displayWord": "eye-opening",
                "ipa": "/ˈaɪ əʊpnɪŋ/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "mở mang tầm mắt",
                "fullMeaning": "mở mang tầm mắt, bất ngờ và khai sáng",
                "teacherQuestion": "mở mang tầm mắt",
                "example": "Visiting cultural heritage sites across ASEAN was an eye-opening experience.",
                "exampleVi": "Đến thăm các di sản văn hóa trên khắp ASEAN là một trải nghiệm mở mang tầm mắt.",
                "note": "an eye-opening experience (trải nghiệm mở rộng tầm hiểu biết)"
        },
        {
                "stt": 33,
                "primaryWord": "opportunity",
                "displayWord": "opportunity",
                "ipa": "/ˌɒpəˈtjuːnəti/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "cơ hội",
                "fullMeaning": "cơ hội, thời cơ thuận lợi (= chance)",
                "teacherQuestion": "cơ hội",
                "example": "Studying abroad provides students with great opportunities to broaden their minds.",
                "exampleVi": "Du học đem lại cho học sinh những cơ hội tuyệt vời để mở rộng tư duy.",
                "note": "seize/take/have an opportunity (nắm bắt/tận dụng cơ hội)"
        },
        {
                "stt": 34,
                "primaryWord": "equality",
                "displayWord": "equality / equally / equal to",
                "ipa": "/iˈkwɒləti/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "sự bình đẳng",
                "fullMeaning": "sự bình đẳng (phó từ: equally; tính từ: equal to)",
                "teacherQuestion": "sự bình đẳng",
                "example": "Gender equality is essential for sustainable social and economic progress.",
                "exampleVi": "Bình đẳng giới là yếu tố thiết yếu cho sự tiến bộ xã hội và kinh tế bền vững.",
                "note": "equal (adj) -> equally (adv) -> equality (n: sự bình đẳng) >< inequality"
        },
        {
                "stt": 35,
                "primaryWord": "have community work experience",
                "displayWord": "have community work experience",
                "ipa": "/hæv kəˈmjuːnəti wɜːk ɪkˈspɪəriəns/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "có kinh nghiệm làm công tác cộng đồng",
                "fullMeaning": "có kinh nghiệm thực tế làm công tác cộng đồng / hoạt động xã hội",
                "teacherQuestion": "có kinh nghiệm làm công tác cộng đồng",
                "example": "Volunteers who have community work experience are highly preferred.",
                "exampleVi": "Những tình nguyện viên có kinh nghiệm làm công tác cộng đồng được ưu tiên rất cao.",
                "note": "community work experience: kinh nghiệm hoạt động tình nguyện cộng đồng"
        },
        {
                "stt": 36,
                "primaryWord": "be confident speakers",
                "displayWord": "be confident speakers",
                "ipa": "/biː ˈkɒnfɪdənt ˈspiːkəz/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "tự tin khi nói trước mọi người",
                "fullMeaning": "tự tin khi nói trước mọi người, diễn giả tự tin trước đám đông",
                "teacherQuestion": "tự tin khi nói trước mọi người",
                "example": "Debate clubs train young students to be confident speakers in public.",
                "exampleVi": "Các câu lạc bộ tranh biện rèn luyện học sinh trẻ trở thành những người nói tự tin trước đám đông.",
                "note": "confident (adj: tự tin) -> confidence (n: sự tự tin); public speaking"
        },
        {
                "stt": 37,
                "primaryWord": "have teamwork skills",
                "displayWord": "have teamwork skills",
                "ipa": "/hæv ˈtiːmwɜːk skɪlz/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "có kỹ năng làm việc nhóm",
                "fullMeaning": "có kỹ năng làm việc nhóm hiệu quả",
                "teacherQuestion": "có kỹ năng làm việc nhóm",
                "example": "Students need to have teamwork skills to collaborate successfully on projects.",
                "exampleVi": "Học sinh cần có kỹ năng làm việc nhóm để cộng tác thành công trong các dự án.",
                "note": "teamwork (n: làm việc nhóm) -> teamwork skills: kỹ năng phối hợp đồng đội"
        },
        {
                "stt": 38,
                "primaryWord": "practical skills",
                "displayWord": "practical skills",
                "ipa": "/ˈpræktɪkl skɪlz/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "kỹ năng thực hành",
                "fullMeaning": "kỹ năng thực tế, thực hành ứng dụng",
                "teacherQuestion": "kỹ năng thực hành, thực tế",
                "example": "Vocational schools equip students with practical skills for the modern job market.",
                "exampleVi": "Các trường dạy nghề trang bị cho học sinh những kỹ năng thực hành cho thị trường việc làm hiện đại.",
                "note": "practice (n, v) -> practical (adj: thực tế, thực hành)"
        },
        {
                "stt": 39,
                "primaryWord": "understand different cultures",
                "displayWord": "understand different cultures",
                "ipa": "/ˌʌndəˈstænd ˈdɪfrənt ˈkʌltʃəz/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "hiểu các nền văn hóa khác nhau",
                "fullMeaning": "thấu hiểu và tôn trọng sự đa dạng của các nền văn hóa khác nhau",
                "teacherQuestion": "hiểu các nền văn hóa khác nhau",
                "example": "International exchanges help youths understand different cultures and make friends.",
                "exampleVi": "Giao lưu quốc tế giúp thanh thiếu niên thấu hiểu các nền văn hóa khác nhau và kết bạn.",
                "note": "culture (n: văn hóa) -> different cultures: các nền văn hóa đa dạng"
        },
        {
                "stt": 40,
                "primaryWord": "offer solution",
                "displayWord": "offer solution",
                "ipa": "/ˈɒfə səˈluːʃn/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "đưa ra giải pháp",
                "fullMeaning": "đưa ra giải pháp, đề xuất cách xử lý vấn đề",
                "teacherQuestion": "đưa ra giải pháp",
                "example": "The committee met this morning to discuss issues and offer practical solutions.",
                "exampleVi": "Ủy ban đã họp sáng nay để thảo luận các vấn đề và đưa ra những giải pháp thiết thực.",
                "note": "solve (v: giải quyết) -> solution (n: giải pháp); offer a solution: đưa ra giải pháp"
        },
        {
                "stt": 41,
                "primaryWord": "welcome event",
                "displayWord": "welcome event",
                "ipa": "/ˈwelkəm ɪˈvent/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "sự kiện chào mừng",
                "fullMeaning": "sự kiện chào mừng, buổi lễ đón tiếp (sự chào mừng)",
                "teacherQuestion": "sự kiện chào mừng, buổi đón tiếp",
                "example": "The school organized a warm welcome event for exchange students from Thailand.",
                "exampleVi": "Nhà trường đã tổ chức một sự kiện chào mừng nồng nhiệt cho các bạn học sinh trao đổi đến từ Thái Lan.",
                "note": "welcome (v, n, adj); welcome event: sự kiện / tiệc chào đón"
        },
        {
                "stt": 42,
                "primaryWord": "make friends with",
                "displayWord": "make friends with",
                "ipa": "/meɪk frendz wɪð/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "kết bạn với",
                "fullMeaning": "kết bạn với ai đó (= befriend)",
                "teacherQuestion": "kết bạn với ai",
                "example": "It is easy to make friends with peers from different ASEAN nations.",
                "exampleVi": "Rất dễ dàng để kết bạn với những bạn cùng trang lứa đến từ các quốc gia ASEAN khác nhau.",
                "note": "make friends with sb (kết bạn với ai - luôn có 's' ở friends)"
        },
        {
                "stt": 43,
                "primaryWord": "contribute",
                "displayWord": "contribute / contribute to",
                "ipa": "/kənˈtrɪbjuːt/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "đóng góp",
                "fullMeaning": "đóng góp, góp phần (thường đi với giới từ to)",
                "teacherQuestion": "đóng góp",
                "example": "Every member country strives to contribute to peace and economic prosperity.",
                "exampleVi": "Mỗi quốc gia thành viên đều nỗ lực đóng góp cho hòa bình và thịnh vượng kinh tế.",
                "note": "contribute to + V-ing / N; contribution (n: sự đóng góp); contributor (n: người đóng góp)"
        },
        {
                "stt": 44,
                "primaryWord": "region",
                "displayWord": "region / regional",
                "ipa": "/ˈriːdʒən/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "khu vực",
                "fullMeaning": "khu vực, vùng miền (tính từ: regional)",
                "teacherQuestion": "khu vực, vùng miền",
                "example": "Southeast Asia is a dynamic region with rapid economic growth.",
                "exampleVi": "Đông Nam Á là một khu vực năng động với tốc độ tăng trưởng kinh tế nhanh chóng.",
                "note": "region (n: khu vực) -> regional (adj: thuộc về khu vực)"
        },
        {
                "stt": 45,
                "primaryWord": "discuss",
                "displayWord": "discuss",
                "ipa": "/dɪˈskʌs/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "thảo luận",
                "fullMeaning": "thảo luận, bàn luận về điều gì (không dùng 'discuss about')",
                "teacherQuestion": "thảo luận",
                "example": "Ministers gathered to discuss urgent environmental and educational issues.",
                "exampleVi": "Các bộ trưởng đã tập trung để thảo luận các vấn đề cấp bách về môi trường và giáo dục.",
                "note": "discuss sth (không dùng discuss about); discuss (v) -> discussion (n)"
        },
        {
                "stt": 46,
                "primaryWord": "discussion",
                "displayWord": "discussion",
                "ipa": "/dɪˈskʌʃn/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "cuộc thảo luận",
                "fullMeaning": "cuộc thảo luận, buổi trao đổi bàn bạc",
                "teacherQuestion": "cuộc thảo luận",
                "example": "The panel discussion on youth employment attracted hundreds of attendees.",
                "exampleVi": "Cuộc thảo luận bàn tròn về việc làm cho thanh niên đã thu hút hàng trăm người tham dự.",
                "note": "have a discussion with sb about sth; under discussion: đang được thảo luận"
        },
        {
                "stt": 47,
                "primaryWord": "benefit",
                "displayWord": "benefit",
                "ipa": "/ˈbenɪfɪt/",
                "type": "(n; v)",
                "typeCategory": "noun",
                "primaryMeaning": "lợi ích, có lợi cho",
                "fullMeaning": "lợi ích (n) / có lợi cho, mang lại lợi ích cho (v)",
                "teacherQuestion": "lợi ích hoặc có lợi cho",
                "example": "Visa-free travel across ASEAN brings huge benefits to international tourists.",
                "exampleVi": "Chính sách miễn thị thực đi lại khắp ASEAN mang lại những lợi ích khổng lồ cho khách du lịch quốc tế.",
                "note": "benefit from sth (hưởng lợi từ); be of benefit to sb; beneficial (adj)"
        },
        {
                "stt": 48,
                "primaryWord": "beneficial",
                "displayWord": "beneficial",
                "ipa": "/ˌbenɪˈfɪʃl/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "có lợi, hữu ích",
                "fullMeaning": "có lợi, hữu ích, mang lại điều tốt (= advantageous, helpful)",
                "teacherQuestion": "có lợi, hữu ích",
                "example": "Cultural exchange is extremely beneficial to mutual understanding.",
                "exampleVi": "Giao lưu văn hóa vô cùng có lợi cho sự hiểu biết lẫn nhau.",
                "note": "beneficial to / for sth (có lợi cho); benefit (n, v)"
        },
        {
                "stt": 49,
                "primaryWord": "host",
                "displayWord": "host",
                "ipa": "/həʊst/",
                "type": "(n; v)",
                "typeCategory": "verb",
                "primaryMeaning": "chủ nhà, đăng cai, tổ chức",
                "fullMeaning": "chủ nhà, người đăng cai (n) / đăng cai tổ chức (v)",
                "teacherQuestion": "chủ nhà, đăng cai tổ chức",
                "example": "Vietnam successfully hosted the 31st SEA Games with great enthusiasm.",
                "exampleVi": "Việt Nam đã đăng cai tổ chức thành công SEA Games 31 với sự hưởng ứng nhiệt tình to lớn.",
                "note": "host country (nước chủ nhà); host an event (đăng cai tổ chức sự kiện)"
        },
        {
                "stt": 50,
                "primaryWord": "proposal",
                "displayWord": "proposal / propose",
                "ipa": "/prəˈpəʊzl/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "đề xuất",
                "fullMeaning": "bản đề xuất, sự đề xuất (động từ: propose)",
                "teacherQuestion": "đề xuất, bản đề xuất",
                "example": "The committee submitted an innovative proposal to reduce plastic waste.",
                "exampleVi": "Ủy ban đã đệ trình một bản đề xuất sáng tạo nhằm giảm thiểu rác thải nhựa.",
                "note": "propose (v: đề xuất, cầu hôn) -> proposal (n: bản đề xuất)"
        },
        {
                "stt": 51,
                "primaryWord": "break the ice",
                "displayWord": "break the ice",
                "ipa": "/breɪk ði aɪs/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "phá vỡ sự ngại ngùng",
                "fullMeaning": "phá vỡ sự ngại ngùng, xóa tan bầu không khí e dè ban đầu",
                "teacherQuestion": "phá vỡ sự ngại ngùng",
                "example": "The host played a funny game to break the ice among international students.",
                "exampleVi": "Người dẫn chương trình đã chơi một trò chơi vui nhộn để phá vỡ sự ngại ngùng giữa các bạn học sinh quốc tế.",
                "note": "break the ice (thành ngữ: phá vỡ sự xa lạ, ngại ngùng ban đầu); ice-breaker (trò chơi mở đầu)"
        },
        {
                "stt": 52,
                "primaryWord": "create bonds with sb",
                "displayWord": "create bonds with sb",
                "ipa": "/kriˈeɪt bɒndz wɪð/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "tạo dựng sự gắn kết với ai",
                "fullMeaning": "tạo dựng sự gắn kết, mối liên kết thân thiết với ai đó",
                "teacherQuestion": "tạo dựng sự gắn kết với ai",
                "example": "Volunteering together helps youths create strong bonds with each other.",
                "exampleVi": "Cùng làm tình nguyện giúp thanh niên tạo dựng sự gắn kết bền chặt với nhau.",
                "note": "create bonds with someone (tạo dựng mối dây gắn kết bền chặt với ai)"
        },
        {
                "stt": 53,
                "primaryWord": "create shared values",
                "displayWord": "create shared values",
                "ipa": "/kriˈeɪt ʃeəd ˈvæljuːz/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "tạo ra những giá trị chung",
                "fullMeaning": "tạo ra những giá trị chung, giá trị cùng chia sẻ",
                "teacherQuestion": "tạo ra những giá trị chung",
                "example": "Collaborative educational initiatives create shared values for all ASEAN partners.",
                "exampleVi": "Các sáng kiến giáo dục hợp tác tạo ra những giá trị chung cho tất cả các đối tác ASEAN.",
                "note": "shared values: những giá trị chung, cùng sẻ chia"
        },
        {
                "stt": 54,
                "primaryWord": "build a community",
                "displayWord": "build a community",
                "ipa": "/bɪld ə kəˈmjuːnəti/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "xây dựng cộng đồng",
                "fullMeaning": "xây dựng cộng đồng vững mạnh và gắn bó",
                "teacherQuestion": "xây dựng cộng đồng",
                "example": "All member countries are working hard together to build a peaceful ASEAN community.",
                "exampleVi": "Tất cả các quốc gia thành viên đang nỗ lực cùng nhau xây dựng một cộng đồng ASEAN hòa bình.",
                "note": "build / develop / foster a community (xây dựng, phát triển cộng đồng)"
        },
        {
                "stt": 55,
                "primaryWord": "training workshop",
                "displayWord": "training workshop",
                "ipa": "/ˈtreɪnɪŋ ˈwɜːkʃɒp/",
                "type": "n.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "hội thảo tập huấn",
                "fullMeaning": "buổi hội thảo tập huấn, đào tạo kỹ năng",
                "teacherQuestion": "hội thảo tập huấn",
                "example": "The training workshop equipped volunteers with essential emergency first-aid skills.",
                "exampleVi": "Buổi hội thảo tập huấn đã trang bị cho tình nguyện viên các kỹ năng sơ cứu khẩn cấp thiết yếu.",
                "note": "training (n: đào tạo) + workshop (n: hội thảo thực hành)"
        },
        {
                "stt": 56,
                "primaryWord": "make arrangements",
                "displayWord": "make arrangements",
                "ipa": "/meɪk əˈreɪndʒmənts/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "sắp xếp, chuẩn bị",
                "fullMeaning": "sắp xếp, chuẩn bị trước các kế hoạch (= prepare, organize)",
                "teacherQuestion": "sắp xếp, chuẩn bị",
                "example": "The school made careful arrangements for the international delegates' accommodation.",
                "exampleVi": "Nhà trường đã sắp xếp, chuẩn bị chu đáo chỗ ở cho các đại biểu quốc tế.",
                "note": "arrange (v) -> make arrangements for sth (chuẩn bị, thu xếp cho việc gì)"
        },
        {
                "stt": 57,
                "primaryWord": "appreciate",
                "displayWord": "appreciate",
                "ipa": "/əˈpriːʃieɪt/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "trân trọng, đánh giá cao",
                "fullMeaning": "trân trọng, đánh giá cao, biết ơn sự giúp đỡ (= value, admire)",
                "teacherQuestion": "trân trọng, đánh giá cao",
                "example": "We deeply appreciate all the hard work contributed by the young volunteers.",
                "exampleVi": "Chúng tôi vô cùng trân trọng tất cả những nỗ lực làm việc do các bạn tình nguyện viên trẻ đóng góp.",
                "note": "appreciate (v: trân trọng) -> appreciation (n: sự cảm kích) -> appreciative (adj)"
        },
        {
                "stt": 58,
                "primaryWord": "appreciated",
                "displayWord": "appreciated",
                "ipa": "/əˈpriːʃieɪtɪd/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "được đánh giá cao",
                "fullMeaning": "được đánh giá cao, được trân trọng, được biết ơn",
                "teacherQuestion": "được đánh giá cao, được trân trọng",
                "example": "Your kind assistance during the seminar is greatly appreciated by the whole team.",
                "exampleVi": "Sự hỗ trợ nhiệt tình của bạn trong buổi hội thảo được toàn đội vô cùng trân trọng đánh giá cao.",
                "note": "be greatly appreciated (được trân trọng, đánh giá rất cao)"
        },
        {
                "stt": 59,
                "primaryWord": "grateful",
                "displayWord": "grateful",
                "ipa": "/ˈɡreɪtfl/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "biết ơn",
                "fullMeaning": "biết ơn, cảm kích (= thankful)",
                "teacherQuestion": "biết ơn, cảm kích",
                "example": "I am truly grateful to my teacher for encouraging me to participate in the contest.",
                "exampleVi": "Tôi thực sự biết ơn cô giáo vì đã khuyến khích tôi tham gia cuộc thi.",
                "note": "be grateful to sb for sth (biết ơn ai vì điều gì); gratitude (n: lòng biết ơn)"
        },
        {
                "stt": 60,
                "primaryWord": "pleased",
                "displayWord": "pleased",
                "ipa": "/pliːzd/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "hài lòng",
                "fullMeaning": "hài lòng, vui lòng (= happy, satisfied)",
                "teacherQuestion": "hài lòng, vui lòng",
                "example": "The organizers were very pleased with the enthusiastic participation of the students.",
                "exampleVi": "Ban tổ chức rất hài lòng với sự tham gia nhiệt tình của các bạn học sinh.",
                "note": "be pleased with sth (hài lòng với cái gì); please (v) -> pleasant (adj) -> pleasure (n)"
        },
        {
                "stt": 61,
                "primaryWord": "present",
                "displayWord": "present",
                "ipa": "/prɪˈzent/",
                "type": "v",
                "typeCategory": "verb",
                "primaryMeaning": "thuyết trình, trình bày",
                "fullMeaning": "thuyết trình, trình bày trước đám đông (động từ phát âm là /prɪˈzent/)",
                "teacherQuestion": "thuyết trình, trình bày",
                "example": "Each group will present their research project on ASEAN biodiversity.",
                "exampleVi": "Mỗi nhóm sẽ thuyết trình đề án nghiên cứu của mình về đa dạng sinh học ASEAN.",
                "note": "present (v: /prɪˈzent/ thuyết trình) >< present (n/adj: /ˈpreznt/ món quà, hiện tại)"
        },
        {
                "stt": 62,
                "primaryWord": "presentation",
                "displayWord": "presentation",
                "ipa": "/ˌpreznˈteɪʃn/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "bài thuyết trình",
                "fullMeaning": "bài thuyết trình, phần trình bày",
                "teacherQuestion": "bài thuyết trình",
                "example": "Her presentation on green cities won the first prize in the school competition.",
                "exampleVi": "Bài thuyết trình của cô ấy về các thành phố xanh đã đoạt giải nhất trong cuộc thi của trường.",
                "note": "give / make a presentation on sth (thực hiện một bài thuyết trình về cái gì)"
        },
        {
                "stt": 63,
                "primaryWord": "presenter",
                "displayWord": "presenter",
                "ipa": "/prɪˈzentər/",
                "type": "n",
                "typeCategory": "noun",
                "primaryMeaning": "người thuyết trình",
                "fullMeaning": "người thuyết trình, người dẫn chương trình",
                "teacherQuestion": "người thuyết trình, người trình bày",
                "example": "The keynote presenter gave an inspiring speech on ASEAN cultural preservation.",
                "exampleVi": "Người thuyết trình chính đã có một bài phát biểu đầy cảm hứng về bảo tồn văn hóa ASEAN.",
                "note": "presenter (n: người thuyết trình / MC dẫn chương trình)"
        },
        {
                "stt": 64,
                "primaryWord": "informative",
                "displayWord": "informative",
                "ipa": "/ɪnˈfɔːmətɪv/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "cung cấp nhiều thông tin",
                "fullMeaning": "cung cấp nhiều thông tin bổ ích, hữu ích (= instructive, revealing)",
                "teacherQuestion": "cung cấp nhiều thông tin bổ ích",
                "example": "The lecture was very informative and helped us understand ASEAN trade policies better.",
                "exampleVi": "Bài giảng cung cấp rất nhiều thông tin bổ ích và giúp chúng tôi hiểu rõ hơn chính sách thương mại ASEAN.",
                "note": "inform (v) -> information (n) -> informative (adj: nhiều thông tin hữu ích)"
        },
        {
                "stt": 65,
                "primaryWord": "well-organised",
                "displayWord": "well-organised",
                "ipa": "/ˌwel ˈɔːɡənaɪzd/",
                "type": "adj",
                "typeCategory": "adj",
                "primaryMeaning": "được tổ chức tốt",
                "fullMeaning": "được tổ chức tốt, sắp xếp chu đáo, có trật tự",
                "teacherQuestion": "được tổ chức tốt, sắp xếp chu đáo",
                "example": "The youth festival was well-organised, and all activities ran smoothly on schedule.",
                "exampleVi": "Lễ hội thanh niên được tổ chức rất tốt và mọi hoạt động đều diễn ra suôn sẻ theo đúng lịch trình.",
                "note": "organise (v) -> organisation (n) -> well-organised (adj: có tổ chức tốt)"
        },
        {
                "stt": 66,
                "primaryWord": "put effort into",
                "displayWord": "put effort into",
                "ipa": "/pʊt ˈefət ˈɪntuː/",
                "type": "v.phr",
                "typeCategory": "phrase",
                "primaryMeaning": "nỗ lực, dồn nỗ lực vào",
                "fullMeaning": "nỗ lực, dồn tâm huyết và sức lực vào làm việc gì",
                "teacherQuestion": "nỗ lực, dồn công sức vào việc gì",
                "example": "The students put a lot of effort into preparing for the ASEAN speech contest.",
                "exampleVi": "Các bạn học sinh đã dồn rất nhiều nỗ lực vào việc chuẩn bị cho cuộc thi hùng biện ASEAN.",
                "note": "put effort into + V-ing / N (dồn nỗ lực vào việc gì); make an effort to do sth"
        },
        {
                "stt": 67,
                "primaryWord": "compliment",
                "displayWord": "compliment",
                "ipa": "/ˈkɒmplɪmənt/",
                "type": "(n; v)",
                "typeCategory": "noun",
                "primaryMeaning": "lời khen",
                "fullMeaning": "lời khen ngợi (n) / khen ngợi (v) (= praise)",
                "teacherQuestion": "lời khen",
                "example": "The teacher gave the student a warm compliment on her excellent essay.",
                "exampleVi": "Cô giáo đã dành cho bạn học sinh một lời khen ấm áp vì bài viết luận xuất sắc của bạn.",
                "note": "pay sb a compliment (khen ngợi ai); compliment sb on sth (khen ai về điều gì)"
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
    
        // ==========================================
    // BỘ PHÁT ÂM TIẾNG VIỆT GIỌNG NỮ 100% (GOOGLE TTS NỮ + FALLBACK NỮ WEBSPEECH)
    // Đã loại bỏ hoàn toàn giọng nam (Microsoft An), chỉ đọc câu hỏi, không đọc đáp án
    // ==========================================
    
    function isMaleVoice(name) {
        const n = (name || '').toLowerCase();
        return n.includes('microsoft an') || 
               n.includes(' an online') || 
               n.includes(' an ') ||
               n.endsWith(' an') || 
               n.includes(' male') || 
               n.includes('nam') || 
               n.includes('david') || 
               n.includes('mark') ||
               n.includes('george') ||
               n.includes('guy') ||
               n.includes('man');
    }

    function getVietnameseFemaleVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return null;

            const viVoices = voices.filter(v => {
                const l = (v.lang || '').toLowerCase();
                const n = (v.name || '').toLowerCase();
                return l.startsWith('vi') || l.includes('vi-vn') || n.includes('vietnam') || n.includes('tiếng việt');
            });

            // Ưu tiên các giọng nữ nổi tiếng
            const femaleVi = viVoices.find(v => {
                const n = (v.name || '').toLowerCase();
                return !isMaleVoice(n) && (
                    n.includes('hoaimy') || 
                    n.includes('hoài my') || 
                    n.includes('linh') || 
                    n.includes('mai') || 
                    n.includes('google') || 
                    n.includes('female')
                );
            });
            if (femaleVi) return femaleVi;

            // Bất kỳ giọng nào không phải giọng nam
            const nonMaleVi = viVoices.find(v => !isMaleVoice(v.name));
            if (nonMaleVi) return nonMaleVi;

            return null; // Tuyệt đối không trả về Microsoft An nam
        } catch (e) {
            return null;
        }
    }

    function getEnglishFemaleVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return null;

            const engVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
            const femaleEng = engVoices.find(v => {
                const n = (v.name || '').toLowerCase();
                return !isMaleVoice(n) && (
                    n.includes('jenny') || 
                    n.includes('aria') || 
                    n.includes('samantha') || 
                    n.includes('zira') || 
                    n.includes('google us') || 
                    n.includes('female')
                );
            });
            if (femaleEng) return femaleEng;

            const nonMaleEng = engVoices.find(v => !isMaleVoice(v.name));
            return nonMaleEng || engVoices[0] || null;
        } catch (e) {
            return null;
        }
    }

    function setTeacherSpeakingStatus(isSpeaking, customText) {
        oralIsSpeaking = isSpeaking;
        const waveBox = document.getElementById("oralSoundWaveBox");
        const statusText = document.getElementById("oralTeacherStatusText");
        const teacherAvatar = document.getElementById("oralTeacherAvatar");

        if (waveBox) {
            if (isSpeaking) {
                waveBox.classList.remove("opacity-0");
                waveBox.classList.add("opacity-100");
                waveBox.querySelectorAll(".oral-sound-bar").forEach(bar => bar.classList.add("animate-soundWave"));
            } else {
                waveBox.classList.add("opacity-0");
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

    // PHÁT ÂM TIẾNG VIỆT CÔ GIÁO (CHỈ ĐỌC CÂU HỎI BẰNG GIỌNG NỮ 100%, TUYỆT ĐỐI KHÔNG DÙNG GIỌNG NAM)
    function speakTeacherQuestion(vietnameseText, itemIndex) {
        // Hủy bất kỳ âm thanh hay phát âm đang chạy
        stopAllSpeech();

        setTeacherSpeakingStatus(true, "Cô Kiều Anh đang hỏi...");

        // Xác định số thứ tự câu hỏi (stt: 1..67)
        let stt = itemIndex;
        if (!stt && oralCurrentItem) {
            stt = oralCurrentItem.stt;
        }

        // 1. ƯU TIÊN SỐ 1: BẢN ÂM THANH MP3 GIỌNG NỮ THUẦN VIỆT ĐƯỢC ĐÓNG GÓI SẴN (CỰC NHANH, 100% GIỌNG NỮ, KHÔNG CÓ GIỌNG NAM)
        if (stt && stt >= 1 && stt <= 67) {
            try {
                const audioPath = `audio/teacher_unit4/q${stt}.mp3`;
                const audio = new Audio(audioPath);
                window._currentTeacherAudio = audio;

                audio.onended = () => {
                    setTeacherSpeakingStatus(false);
                    window._currentTeacherAudio = null;
                };

                audio.onerror = () => {
                    console.warn(`[Teacher Audio] Không tải được file audio: ${audioPath}`);
                    speakTeacherFemaleVoiceOnly(vietnameseText);
                };

                const p = audio.play();
                if (p !== undefined) {
                    p.catch(err => {
                        console.warn("[Teacher Audio] Play interrupted:", err.message);
                        setTeacherSpeakingStatus(false);
                    });
                }
                return;
            } catch (err) {
                console.warn("[Teacher Audio] Audio init failed:", err);
            }
        }

        speakTeacherFemaleVoiceOnly(vietnameseText);
    }

    // CHỈ CHO PHÉP GIỌNG NỮ VIỆT NAM (HOÀI MY, MAI, LINH) NÓI
    // NẾU HỆ THỐNG CHỈ CÓ MICROSOFT AN HOẶC GIỌNG NAM -> KHÔNG BAO GIỜ GỌI ĐỂ TRÁNH GIỌNG NAM LÀM PHIỀN NGƯỜI DÙNG!
    function speakTeacherFemaleVoiceOnly(vietnameseText) {
        if (!('speechSynthesis' in window)) {
            setTeacherSpeakingStatus(false);
            return;
        }

        const femaleVi = getVietnameseFemaleVoice();
        if (!femaleVi || isMaleVoice(femaleVi.name)) {
            // TUYỆT ĐỐI KHÔNG ĐỂ MICROSOFT AN PHÁT TIẾNG
            setTeacherSpeakingStatus(false);
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const cleanPrompt = `Từ nào có nghĩa là: ${vietnameseText}?`;
            const utterance = new SpeechSynthesisUtterance(cleanPrompt);
            utterance.voice = femaleVi;
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            utterance.pitch = 1.25;

            utterance.onend = () => {
                setTeacherSpeakingStatus(false);
            };
            utterance.onerror = () => {
                setTeacherSpeakingStatus(false);
            };

            window.speechSynthesis.speak(utterance);
        } catch(e) {
            setTeacherSpeakingStatus(false);
        }
    }

    // KHÔNG ĐỌC ĐÁP ÁN (NGƯỜI DÙNG YÊU CẦU: "đáp án thì cứ kệ đi")
    function stopAllSpeech() {
        if (window._currentTeacherAudio) {
            try {
                window._currentTeacherAudio.pause();
                window._currentTeacherAudio.currentTime = 0;
            } catch(e) {}
            window._currentTeacherAudio = null;
        }
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch(e) {}
        }
        setTeacherSpeakingStatus(false);
    }

    function speakWord(text, onEndCallback) {
        // Chỉ dùng khi người dùng chủ động bấm icon loa 🔊 ở bảng từ
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanWord = text.split('\n')[0].split('/')[0].split('(')[0].replace(/sb|sth|\+ V-ing/g, '').trim();
            const utterance = new SpeechSynthesisUtterance(cleanWord);
            utterance.lang = 'en-US';
            utterance.rate = 0.92;
            utterance.pitch = 1.08;

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

    // PHÁT ÂM TIẾNG ANH CHO CÔ GIÁO Ở CHẾ ĐỘ 3 (CÓ SÓNG ÂM EQUALIZER)
    function speakTeacherEnglishWord(text) {
        stopAllSpeech();
        setTeacherSpeakingStatus(true, "Cô đang phát âm Tiếng Anh...");
        speakWord(text, () => {
            setTeacherSpeakingStatus(false);
        });
    }

    // TIỆN ÍCH SO KHỚP ĐÁP ÁN TIẾNG ANH THÔNG MINH (CHẾ ĐỘ 2)
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

    // TIỆN ÍCH SO KHỚP ĐÁP ÁN TIẾNG VIỆT THÔNG MINH (CHẾ ĐỘ 3: NGHE TIẾNG ANH -> GHI TIẾNG VIỆT)
    function checkOralAnswerVi(userInput, item) {
        if (!userInput || !item) return false;
        const clean = (s) => (s || '')
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const u = clean(userInput);
        if (!u) return false;

        // Tập hợp các cụm từ nghĩa chuẩn từ tài liệu đề cương
        const targets = [];
        if (item.primaryMeaning) targets.push(...item.primaryMeaning.split(/[,/]/));
        if (item.teacherQuestion) targets.push(...item.teacherQuestion.split(/[,/]/));
        if (item.fullMeaning) {
            const cleanFull = item.fullMeaning.replace(/\([^)]*\)/g, '');
            targets.push(...cleanFull.split(/[,/]/));
        }

        const cleanTargets = targets.map(t => clean(t)).filter(t => t.length > 0);

        // 1. So khớp chuẩn xác tuyệt đối
        for (const t of cleanTargets) {
            if (u === t) return true;
        }

        // 2. So khớp chuỗi con (nếu học sinh gõ từ trọng tâm hoặc cụm từ bao hàm, ví dụ "tình nguyện" trong "tình nguyện viên")
        for (const t of cleanTargets) {
            if (u.includes(t) || (t.includes(u) && u.length >= 3)) {
                return true;
            }
        }

        // 3. Trùng khớp từ khóa (token overlap)
        const uWords = u.split(' ').filter(w => w.length > 1);
        for (const t of cleanTargets) {
            const tWords = t.split(' ').filter(w => w.length > 1);
            if (tWords.length > 0) {
                const matches = uWords.filter(w => tWords.includes(w));
                if (matches.length >= Math.min(2, tWords.length)) return true;
            }
        }

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
    let oralRemainingList = [];   // Danh sách các từ CHƯA THUỘC (ban đầu 67 từ)
    let oralMasteredList = [];    // Danh sách các từ ĐÃ THUỘC (ban đầu 0 từ)
    let oralCurrentItem = null;   // Từ đang được cô hỏi
    // 3 TÙY CHỌN: 'choice' (1: Chọn A-B-C-D) | 'type_en' (2: Ghi tiếng Anh) | 'type_vi' (3: Ghi tiếng Việt)
    let oralMode = localStorage.getItem('aseta_oral_mode') || 'choice';
    if (oralMode === 'type') oralMode = 'type_en';
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
        modal.className = "fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn";

        // Khung Modal chính
        const container = document.createElement("div");
        container.className = "relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all";
        
        container.innerHTML = `
            <!-- HEADER TÍCH HỢP -->
            <div class="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/67 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
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
                                Thuộc Đủ 67/67 Câu
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

            <!-- TABS ĐIỀU HƯỚNG CHẾ ĐỘ HỌC (GỌN GÀNG, KHÔNG BỊ TRÀN HAY KHUẤT CHỮ) -->
            <div class="px-2 sm:px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button type="button" data-tab="oral" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>👩‍🏫</span> <span>Cô Khảo Bài</span>
                </button>
                <button type="button" data-tab="flashcards" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>🎴</span> <span>Flashcard</span>
                </button>
                <button type="button" data-tab="match" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>⚡</span> <span>Ghép Thẻ</span>
                </button>
                <button type="button" data-tab="spelling" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>✍️</span> <span>Luyện Viết</span>
                </button>
                <button type="button" data-tab="quiz" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>🎯</span> <span>Trắc Nghiệm</span>
                </button>
                <button type="button" data-tab="list" class="vocab-tab-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span>📖</span> <span>Bảng Từ (67)</span>
                </button>
                <button type="button" id="vocabGoToExamBtn" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 ml-auto sm:ml-1">
                    <span>📝</span> <span>Đề Khảo Sát</span>
                </button>
            </div>

            <!-- NỘI DUNG CHÍNH (THEO TAB) -->
            <div id="vocabTabContent" class="flex-1 overflow-y-auto p-2 sm:p-5 flex flex-col items-center justify-start overscroll-contain">
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
                👩‍🏫 Thuộc: ${oralMasteredCount}/67
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
    // Hỏi bất kì câu tiếng Việt, sai lặp lại đến khi thuộc 67/67
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

        // Phát âm câu hỏi của cô giáo tương ứng với chế độ
        setTimeout(() => {
            if (oralMode === 'type_vi') {
                speakTeacherEnglishWord(oralCurrentItem.primaryWord);
            } else {
                speakTeacherQuestion(oralCurrentItem.primaryMeaning, oralCurrentItem.stt);
            }
        }, 120);
    }

    function renderOralTab(container) {
        // Kiểm tra nếu đã hoàn thành đủ 67 câu
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

        container.className = "w-full max-w-2xl flex flex-col items-center gap-3.5 pb-8";
        container.innerHTML = `
            <!-- TOP BAR: TIẾN ĐỘ THUỘC BÀI & CÁC THỐNG KÊ GỌN GÀNG -->
            <div class="w-full flex flex-col gap-2 px-1">
                <div class="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="font-black text-rose-400 flex items-center gap-1.5 text-sm">
                            <span>👩‍🏫</span> <span>Cô Kiều Anh Khảo Bài</span>
                        </span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Đã thuộc: ${masteredCount}/${totalCount} từ (${progressPercent}%)
                        </span>
                        ${oralStreak > 1 ? `
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse flex items-center gap-1">
                                <span>🔥</span> <span>${oralStreak} câu</span>
                            </span>
                        ` : ''}
                    </div>

                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-slate-400 text-[11px]">Còn lại: <strong class="text-white">${remainingCount} từ</strong></span>
                        <button type="button" id="oralResetBtn" class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center gap-1 active:scale-95" title="Khảo lại từ đầu">
                            <span>🔄</span> <span>Khảo lại</span>
                        </button>
                    </div>
                </div>

                <!-- Progress Bar thanh mảnh, sang trọng -->
                <div class="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
                    <div class="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm shadow-pink-500/50" style="width: ${progressPercent}%"></div>
                </div>

                <!-- BỘ 3 TÙY CHỌN CHẾ ĐỘ HIỆN ĐẠI (SEGMENTED SWITCHER) -->
                <div class="w-full grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner mt-0.5">
                    <button type="button" data-mode="choice" class="oral-mode-pill py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                        oralMode === 'choice' 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 ring-1 ring-white/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }" title="Chế độ 1: Chọn A B C D (Phím 1-4)">
                        <span>🎯</span> <span class="truncate">1. Chọn A-B-C-D</span>
                    </button>
                    <button type="button" data-mode="type_en" class="oral-mode-pill py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                        oralMode === 'type_en' 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 ring-1 ring-white/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }" title="Chế độ 2: Cô đọc tiếng Việt, bạn ghi tiếng Anh">
                        <span class="px-1.5 py-0.5 rounded-md bg-blue-500/30 text-sky-200 font-mono font-black text-[10px] border border-blue-400/40">EN</span> <span class="truncate">2. Gõ Tiếng Anh</span>
                    </button>
                    <button type="button" data-mode="type_vi" class="oral-mode-pill py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                        oralMode === 'type_vi' 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 ring-1 ring-white/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }" title="Chế độ 3: Cô đọc tiếng Anh, bạn ghi tiếng Việt">
                        <span class="px-1.5 py-0.5 rounded-md bg-red-500/30 text-yellow-300 font-mono font-black text-[10px] border border-red-400/40">★ VN</span> <span class="truncate">3. Ghi Tiếng Việt</span>
                    </button>
                </div>
            </div>

            <!-- TEACHER CLASSROOM CARD (THIẾT KẾ STUDIO CAO CẤP) -->
            <div class="w-full p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-800/95 via-slate-900 to-slate-950 border border-slate-700/70 shadow-2xl flex flex-col gap-5 transition-all">
                
                <!-- HỘI THOẠI CỦA CÔ GIÁO & CÂU HỎI TRỌNG TÂM -->
                <div class="flex items-start gap-4">
                    <!-- Avatar Cô Kiều Anh hiệu ứng ánh sáng nhẹ -->
                    <div id="oralTeacherAvatar" class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/25 shrink-0 select-none transition-all duration-300 ring-2 ring-white/10">
                        ${oralIsAnswered ? (oralIsCorrect ? '🥰' : '🧐') : '👩‍🏫'}
                    </div>

                    <div class="flex-1 min-w-0">
                        <!-- Header hội thoại & Sóng âm trực tiếp -->
                        <div class="text-xs font-bold text-rose-300 flex items-center justify-between mb-1.5 flex-wrap gap-2">
                            <div class="flex items-center gap-2">
                                <span id="oralTeacherStatusText" class="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
                                    <span>👩‍🏫</span> <span>${oralMode === 'type_vi' ? 'Cô đang phát âm Tiếng Anh:' : 'Cô Kiều Anh đang khảo bài:'}</span>
                                </span>
                                <!-- Sóng âm Equalizer (Ẩn khi nghỉ, hiện khi nói) -->
                                <div id="oralSoundWaveBox" class="flex items-end gap-0.5 h-3 opacity-0 transition-opacity">
                                    <span class="oral-sound-bar w-1 bg-pink-400 rounded-full h-1.5"></span>
                                    <span class="oral-sound-bar w-1 bg-pink-400 rounded-full h-3"></span>
                                    <span class="oral-sound-bar w-1 bg-pink-400 rounded-full h-2"></span>
                                    <span class="oral-sound-bar w-1 bg-pink-400 rounded-full h-3.5"></span>
                                </div>
                            </div>
                            <button type="button" id="oralTeacherVoiceBtn" class="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 active:scale-95 text-xs shadow-xs" title="${oralMode === 'type_vi' ? 'Nghe phát âm tiếng Anh (Phím Space)' : 'Nghe cô đọc lại câu hỏi (Phím Space)'}">
                                <span>🔊</span> <span>${oralMode === 'type_vi' ? 'Nghe phát âm (Space)' : 'Nghe lại cô hỏi (Space)'}</span>
                            </button>
                        </div>

                        ${oralMode === 'type_vi' ? `
                            <div class="text-xs text-slate-400 mb-1 font-medium">
                                "Em hãy lắng nghe và cho cô biết nghĩa tiếng Việt của từ:"
                            </div>

                            <!-- BẢNG TỪ TIẾNG ANH & PHIÊN ÂM IPA NỔI BẬT -->
                            <div class="my-2 py-3 px-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-inner flex items-center justify-between flex-wrap gap-2">
                                <span class="text-white text-xl sm:text-2xl font-black tracking-wide">${oralCurrentItem.primaryWord}</span>
                                <span class="text-xs sm:text-sm font-mono text-cyan-400 font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40">${oralCurrentItem.ipa}</span>
                            </div>

                            <div class="text-xs text-slate-400 flex items-center gap-2 mt-1.5">
                                <span class="px-2 py-0.5 rounded-md ${getTypeBadge(oralCurrentItem.type).bg} text-white font-bold text-[11px] border border-white/10">${oralCurrentItem.type}</span>
                                <span>Ghi nghĩa tiếng Việt rồi nhấn Enter</span>
                            </div>
                        ` : `
                            <div class="text-xs text-slate-400 mb-1 font-medium">
                                "Em hãy cho cô biết từ tiếng Anh nào có nghĩa là:"
                            </div>

                            <!-- CÂU HỎI TIẾNG VIỆT NỔI BẬT -->
                            <div class="my-2 py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-inner">
                                <span class="text-amber-300 text-lg sm:text-2xl font-black tracking-wide">👉 "${oralCurrentItem.primaryMeaning}"</span>
                            </div>

                            <div class="text-xs text-slate-400 flex items-center gap-2 mt-1.5 flex-wrap">
                                <span class="px-2 py-0.5 rounded-md ${getTypeBadge(oralCurrentItem.type).bg} text-white font-bold text-[11px] border border-white/10">${oralCurrentItem.type}</span>
                                <span>Từ này gồm <strong class="text-white">${oralCurrentItem.primaryWord.length} chữ cái</strong></span>
                                ${oralMode === 'choice' ? '<span class="text-slate-500">• Bấm số 1-4 để chọn nhanh</span>' : '<span class="text-slate-500">• Gõ từ tiếng Anh & Enter</span>'}
                            </div>
                        `}
                    </div>
                </div>

                <!-- KHU VỰC HỌC SINH TRẢ LỜI -->
                ${!oralIsAnswered ? `
                    ${oralMode === 'choice' ? `
                        <!-- MODE 1: CHỌN 4 ĐÁP ÁN NHANH (CÓ PHÍM TẮT 1-4) -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            ${oralChoices.map((choice, idx) => {
                                const letters = ['A', 'B', 'C', 'D'];
                                const keys = ['1', '2', '3', '4'];
                                return `
                                    <button type="button" data-choice-idx="${idx}" class="oral-choice-btn group p-3.5 sm:p-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 hover:border-pink-500/80 hover:bg-slate-800 text-white font-bold text-left text-sm flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-98 shadow-sm">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <span class="w-8 h-8 rounded-xl bg-slate-700/80 group-hover:bg-gradient-to-tr group-hover:from-rose-500 group-hover:to-pink-500 group-hover:text-white font-black text-xs flex items-center justify-center shrink-0 text-slate-300 transition-all shadow-xs">
                                                ${letters[idx]}
                                            </span>
                                            <span class="truncate font-black text-sm">${choice.text}</span>
                                        </div>
                                        <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900/80 text-slate-400 group-hover:text-pink-300 border border-white/5">
                                            Phím [${keys[idx]}]
                                        </span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    ` : (oralMode === 'type_vi' ? `
                        <!-- MODE 3: NGHE TIẾNG ANH - GHI NGHĨA TIẾNG VIỆT -->
                        <form id="oralAnswerForm" class="flex flex-col gap-3.5 mt-1">
                            <div class="relative">
                                <input type="text" id="oralInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                                       placeholder="Ghi nghĩa tiếng Việt của từ này rồi nhấn Enter..." 
                                       class="w-full px-5 py-4 text-center text-base sm:text-lg font-black rounded-2xl bg-slate-950/90 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner">
                            </div>

                            <div class="flex items-center justify-between gap-2 flex-wrap pt-1">
                                <div class="flex items-center gap-2">
                                    <button type="button" id="oralHintBtn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                        <span>💡</span> <span>Gợi ý nghĩa</span>
                                    </button>
                                    <button type="button" id="oralSkipBtn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5" title="Nếu chưa nhớ, bấm để cô chỉ bài và khảo lại sau">
                                        <span>❓</span> <span>Em chưa nhớ (Khảo lại sau)</span>
                                    </button>
                                </div>
                                <button type="submit" class="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ml-auto">
                                    <span>Trả Lời (Enter)</span> <span>↵</span>
                                </button>
                            </div>
                        </form>
                    ` : `
                        <!-- MODE 2: CÔ ĐỌC TIẾNG VIỆT - GÕ TỪ TIẾNG ANH -->
                        <form id="oralAnswerForm" class="flex flex-col gap-3.5 mt-1">
                            <div class="relative">
                                <input type="text" id="oralInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                                       placeholder="Gõ từ tiếng Anh vào đây rồi nhấn Enter..." 
                                       class="w-full px-5 py-4 text-center text-base sm:text-lg font-black rounded-2xl bg-slate-950/90 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all shadow-inner">
                            </div>

                            <div class="flex items-center justify-between gap-2 flex-wrap pt-1">
                                <div class="flex items-center gap-2">
                                    <button type="button" id="oralHintBtn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5">
                                        <span>💡</span> <span>Gợi ý chữ cái</span>
                                    </button>
                                    <button type="button" id="oralSkipBtn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5" title="Nếu chưa nhớ, bấm để cô chỉ bài và khảo lại sau">
                                        <span>❓</span> <span>Em chưa nhớ (Khảo lại sau)</span>
                                    </button>
                                </div>
                                <button type="submit" class="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ml-auto">
                                    <span>Trả Lời (Enter)</span> <span>↵</span>
                                </button>
                            </div>
                        </form>
                    `)}
                ` : `
                    <!-- MÀN HÌNH PHẢN HỒI KẾT QUẢ CỦA CÔ -->
                    <div class="p-4 sm:p-5 rounded-2xl ${
                        oralIsCorrect ? 'bg-emerald-950/60 border border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-rose-950/60 border border-rose-500/50 shadow-lg shadow-rose-500/10'
                    } flex flex-col gap-3 animate-fadeIn">
                        
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <span class="text-xs sm:text-sm font-black ${oralIsCorrect ? 'text-emerald-300' : 'text-rose-300'} flex items-center gap-2">
                                <span>${oralIsCorrect ? '✅ XUẤT SẮC! CÔ CỘNG 1 ĐIỂM THUỘC BÀI' : '❌ CHƯA CHÍNH XÁC! CÔ SẼ KHẢO LẠI CÂU NÀY SAU'}</span>
                            </span>
                            <button type="button" onclick="window.VocabHub.speak('${oralCurrentItem.primaryWord}')" class="text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 transition-all active:scale-95">
                                <span>🔊</span> <span>Phát âm lại</span>
                            </button>
                        </div>

                        <!-- Đáp án chuẩn chi tiết -->
                        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <div class="flex items-center gap-2.5 flex-wrap">
                                <span class="text-xl sm:text-2xl font-black text-white">${oralCurrentItem.primaryWord}</span>
                                <span class="text-xs sm:text-sm text-sky-400 font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-sky-900/50">${oralCurrentItem.ipa}</span>
                                <span class="text-[11px] px-2.5 py-0.5 rounded-full ${getTypeBadge(oralCurrentItem.type).bg} text-white font-bold border border-white/10">${oralCurrentItem.type}</span>
                            </div>
                            <div class="text-sm sm:text-base text-emerald-300 font-bold">
                                👉 Nghĩa: ${oralCurrentItem.primaryMeaning}
                            </div>
                            <div class="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                                <div>"${oralCurrentItem.example}"</div>
                                <div class="text-[11px] text-slate-400 not-italic">🇻🇳 ${oralCurrentItem.exampleVi}</div>
                            </div>
                            ${oralCurrentItem.note ? `
                                <div class="text-xs text-amber-300 font-bold flex items-center gap-1.5 pt-1">
                                    <span>📌</span> <span>Lưu ý: ${oralCurrentItem.note}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${!oralIsCorrect ? `
                            <!-- BẮT BUỘC GÕ LẠI 1 LẦN NẾU SAI ĐỂ KHẮC SÂU TRÍ NHỚ -->
                            <div class="mt-1 space-y-1.5">
                                ${oralMode === 'type_vi' ? `
                                    <div class="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                                        <span>✍️</span> <span>Em hãy gõ lại nghĩa tiếng Việt: <strong class="text-amber-300 underline font-black">"${oralCurrentItem.primaryMeaning}"</strong> để khắc sâu trí nhớ:</span>
                                    </div>
                                    <form id="oralRetryForm" class="flex items-center gap-2">
                                        <input type="text" id="oralRetryInput" placeholder="Gõ lại '${oralCurrentItem.primaryMeaning}' vào đây..." 
                                               autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                                               class="flex-1 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all">
                                        <button type="submit" class="px-5 py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-600/30">
                                            <span>Đã Thuộc, Khảo Tiếp</span> <span>→</span>
                                        </button>
                                    </form>
                                ` : `
                                    <div class="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                                        <span>✍️</span> <span>Em hãy gõ lại từ: <strong class="text-amber-300 underline font-black">"${oralCurrentItem.primaryWord}"</strong> để khắc sâu trí nhớ:</span>
                                    </div>
                                    <form id="oralRetryForm" class="flex items-center gap-2">
                                        <input type="text" id="oralRetryInput" placeholder="Gõ lại '${oralCurrentItem.primaryWord}' vào đây..." 
                                               autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                                               class="flex-1 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all">
                                        <button type="submit" class="px-5 py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-600/30">
                                            <span>Đã Thuộc, Khảo Tiếp</span> <span>→</span>
                                        </button>
                                    </form>
                                `}
                            </div>
                        ` : `
                            <div class="flex items-center justify-end mt-1">
                                <button type="button" id="oralNextBtn" class="px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                                    <span>Cô hỏi câu tiếp theo (Enter)</span> <span>→</span>
                                </button>
                            </div>
                        `}
                    </div>
                `}

            </div>

            <!-- FOOTER INFO: RÕ RÀNG, TINH TẾ -->
            <div class="w-full flex items-center justify-between text-[11px] text-slate-500 px-2 flex-wrap gap-2">
                <span>💡 Quy tắc: Bất kỳ câu nào sai cô sẽ khảo lại đến khi thuộc 67/67!</span>
                <span>Số lần làm lại: <strong class="${oralMistakesCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}">${oralMistakesCount} lần</strong></span>
            </div>
        `;

        // BIND EVENTS CHO CÔ KHẢO BÀI
        // 1. Nghe cô đọc
        const voiceBtn = container.querySelector("#oralTeacherVoiceBtn");
        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                if (oralMode === 'type_vi') {
                    speakTeacherEnglishWord(oralCurrentItem.primaryWord);
                } else {
                    speakTeacherQuestion(oralCurrentItem.primaryMeaning, oralCurrentItem.stt);
                }
            });
        }

        // 2. Chọn chế độ khảo bài (Bộ 3 nút 1 - 2 - 3)
        const modePills = container.querySelectorAll(".oral-mode-pill");
        modePills.forEach(pill => {
            pill.addEventListener("click", () => {
                const targetMode = pill.getAttribute("data-mode");
                if (targetMode && targetMode !== oralMode) {
                    oralMode = targetMode;
                    localStorage.setItem('aseta_oral_mode', oralMode);
                    stopAllSpeech();
                    if (!oralIsAnswered && oralCurrentItem) {
                        if (oralMode === 'type_vi') {
                            speakTeacherEnglishWord(oralCurrentItem.primaryWord);
                        } else {
                            speakTeacherQuestion(oralCurrentItem.primaryMeaning, oralCurrentItem.stt);
                        }
                    }
                    renderCurrentTab();
                }
            });
        });

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
                if (oralMode === 'type_vi') {
                    speakTeacherEnglishWord(oralCurrentItem.primaryWord);
                } else {
                    speakTeacherQuestion(oralCurrentItem.primaryMeaning, oralCurrentItem.stt);
                }
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
            if (oralMode === 'type_en' || oralMode === 'type_vi') {
                const inputEl = container.querySelector("#oralInput");
                if (inputEl) {
                    setTimeout(() => inputEl.focus(), 80);
                }

                // Gợi ý chữ
                let revealed = 0;
                const hintBtn = container.querySelector("#oralHintBtn");
                if (hintBtn) {
                    hintBtn.addEventListener("click", () => {
                        if (oralMode === 'type_vi') {
                            revealed += 2;
                            const meaning = oralCurrentItem.primaryMeaning;
                            inputEl.value = meaning.slice(0, Math.min(revealed, meaning.length));
                        } else {
                            revealed++;
                            const word = oralCurrentItem.primaryWord;
                            inputEl.value = word.slice(0, revealed);
                        }
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
                        const isMatch = (oralMode === 'type_vi') 
                            ? checkOralAnswerVi(typed, oralCurrentItem)
                            : checkOralAnswer(typed, oralCurrentItem);
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
                    const isMatch = (oralMode === 'type_vi')
                        ? (checkOralAnswerVi(typed, oralCurrentItem) || typed.trim().length >= 2)
                        : (checkOralAnswer(typed, oralCurrentItem) || typed.trim().length >= 2);

                    if (isMatch) {
                        // Đã gõ lại từ đúng để khắc sâu, chuyển sang câu tiếp theo
                        if (window.AudioHelper && window.AudioHelper.playPlip) window.AudioHelper.playPlip();
                        pickNextOralQuestion();
                        renderCurrentTab();
                    } else {
                        retryInput.classList.add("border-rose-500", "animate-shake");
                        retryInput.placeholder = (oralMode === 'type_vi')
                            ? `Hãy gõ đúng nghĩa: ${oralCurrentItem.primaryMeaning}`
                            : `Hãy gõ đúng từ: ${oralCurrentItem.primaryWord}`;
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

            // Tự động tắt giọng đọc cô nếu đang phát, không đọc đáp án (theo yêu cầu: "đáp án thì cứ kệ đi")
            stopAllSpeech();

            // Tự động chuyển câu sau 1.2s nếu ở mode choice
            if (oralMode === 'choice') {
                setTimeout(() => {
                    if (currentTab === 'oral' && oralIsAnswered && oralIsCorrect) {
                        pickNextOralQuestion();
                        renderCurrentTab();
                    }
                }, 1200);
            }
        } else {
            // SAI: Reset streak, tăng số lần sai, giữ lại trong hàng đợi để khảo lại ở các câu tiếp theo!
            oralStreak = 0;
            oralMistakesCount++;
            // Xáo trộn lại remainingList để câu này xuất hiện lại bất ngờ
            oralRemainingList = shuffleArray(oralRemainingList);
            // Dừng mọi âm thanh (không đọc đáp án)
            stopAllSpeech();
        }

        renderCurrentTab();
    }

    function showOralVictoryScreen(container) {
        if (window.confetti) {
            window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }

        // Cô giáo phát biểu chúc mừng bằng giọng nữ từ file victory.mp3
        try {
            stopAllSpeech();
            const victoryAudio = new Audio('audio/teacher_unit4/victory.mp3');
            window._currentTeacherAudio = victoryAudio;
            victoryAudio.play().catch(() => {});
        } catch (e) {}

        container.className = "flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center";
        container.innerHTML = `
            <div class="max-w-lg w-full text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl animate-scaleUp">
                <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 mb-4 animate-bounce">
                    👩‍🏫💯
                </div>

                <div class="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/67 mb-2">
                    XUẤT SẮC ĐẠT 10 ĐIỂM BÀI KHẢO MIỆNG
                </div>

                <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    Chúc Mừng Em Đã Thuộc Lào Lào Trọn Bộ 67/67 Từ Vựng!
                </h3>
                <p class="text-xs text-slate-300 mb-5 leading-relaxed">
                    Em đã xuất sắc vượt qua toàn bộ câu hỏi bất kì bằng tiếng Việt của cô Kiều Anh. Mọi từ sai trước đó đều đã được em rèn luyện và ghi nhớ thành thạo 100%!
                </p>

                <!-- Thống kê thành tích -->
                <div class="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
                    <div class="p-2 rounded-xl bg-slate-800/60">
                        <div class="text-[10px] text-slate-400 font-bold mb-0.5">Đã thuộc làu</div>
                        <div class="text-lg sm:text-xl font-black text-emerald-400">67 / 67</div>
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
                        📝 Làm Khảo Sát 67 Câu
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
                    <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-indigo-500/67 bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 shadow-2xl transition-all">
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

        // Bốc 6 từ ngẫu nhiên từ 67 từ
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
                                    ? 'border-blue-500/67 bg-gradient-to-b from-blue-950/67 to-slate-900 hover:border-blue-400/80 text-white'
                                    : 'border-purple-500/67 bg-gradient-to-b from-purple-950/67 to-slate-900 hover:border-purple-400/80 text-slate-200'
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
                        <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/67">
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
                            btnStyle = "border-emerald-500 bg-emerald-950/67 text-emerald-300 ring-2 ring-emerald-500/67 font-bold";
                        } else if (quizSelectedAnswer === idx) {
                            btnStyle = "border-rose-500 bg-rose-950/67 text-rose-300 ring-2 ring-rose-500/67";
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
                        Tất cả (67)
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
            <div class="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/67">
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
                <tr class="hover:bg-slate-800/67 transition-colors">
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
