/**
 * =======================================================================
 * AZOTA OS - KỶ NIỆM A7 (THPT TRẦN VĂN GIÀU)
 * Bố cục tách đôi: BÊN TRÁI LÀ HÌNH ẢNH • BÊN PHẢI LÀ VIDEO
 * Video chạy liên tục không tiếng (Muted Loop) • Bấm vào coi lại từ đầu có nhạc
 * Phân mục rõ ràng: 11A7 ở đầu • 10A7 ở sau khi lướt
 * Thẻ ảnh thuần túy (Không đè chữ lên ảnh)
 * =======================================================================
 */

window.Class11A7JournalEngine = (function () {
  "use strict";

  // --- 11A7 Photos (8 Authentic Photos) ---
  const PHOTOS_11A7 = [
    {
      id: "11a7_2500",
      src: "assets/11a7/IMG_2500.JPG",
      title: "Chữ V Quyết Tâm — Gia Đình 11A7",
      desc: "Những nụ cười rạng rỡ cùng giơ tay chữ V dưới mái trường THPT Trần Văn Giàu.",
      aspect: "aspect-[4/3] lg:aspect-square",
    },
    {
      id: "11a7_2498",
      src: "assets/11a7/IMG_2498.JPG",
      title: "Pose Dáng Bất Hủ — Biệt Đội 11A7",
      desc: "Khoảnh khắc cả lớp cùng chỉ tay cực ngầu, các bạn nam ngồi bệt sàn lớp học.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2495",
      src: "assets/11a7/IMG_2495.JPG",
      title: "Tà Áo Dài & Cô Chủ Nhiệm Thân Yêu",
      desc: "Cô chủ nhiệm dịu dàng trong tà áo dài xanh ngọc bên các bạn nữ sinh duyên dáng.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2499",
      src: "assets/11a7/IMG_2499.JPG",
      title: "Nụ Cười Tuổi 17 Rạng Rỡ",
      desc: "Thanh xuân năm ấy chúng ta có nhau. Giữa giờ học là những giây phút cười nghiêng ngả.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2494",
      src: "assets/11a7/IMG_2494.JPG",
      title: "Món Quà Nhỏ — Niềm Vui To",
      desc: "Từng túi quà trao tay, từng lời chúc ấm áp gửi đến phái nữ 11A7.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2497",
      src: "assets/11a7/IMG_2497.JPG",
      title: "Lớp Học Thân Thương & Bảng Đen",
      desc: "Góc phòng học 11A7 với khẩu hiệu 'Chân - Thiện - Mỹ' và 'Muốn biết phải hỏi, muốn giỏi phải học'.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2501",
      src: "assets/11a7/IMG_2501.JPG",
      title: "Đoàn Kết Là Sức Mạnh Bất Diệt",
      desc: "Dù bài vở ôn thi hay phong trào, 11A7 luôn kề vai sát cánh cùng tiến bước.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "11a7_2496",
      src: "assets/11a7/IMG_2496.JPG",
      title: "Check-in Kỷ Niệm Cùng Cô",
      desc: "Lưu giữ từng khoảnh khắc thanh xuân tươi đẹp nhất của tuổi học trò.",
      aspect: "aspect-[16/10]",
    },
  ];

  // --- 10A7 Group Photos (20 Authentic Group Photos) ---
  const PHOTOS_10A7 = [
    {
      id: "10a7_2010_full1",
      src: "assets/10a7/10a7_2010_full1.jpg",
      title: "Đại Lễ 20/10 — Cả Lớp 10A7 Kề Vai",
      desc: "Phái nữ 10A7 duyên dáng áo dài trắng bên các bạn nam ngồi sàn lớp học cùng bóng bay rực rỡ.",
      aspect: "aspect-[4/3] lg:aspect-square",
    },
    {
      id: "10a7_chalkboard",
      src: "assets/10a7/10a7_chalkboard.jpg",
      title: "Tập Thể 10A7 — Ngày Đầu Chung Lớp",
      desc: "Khoảnh khắc đại gia đình 10A7 quây quần bên bục giảng và bảng đen thân thương năm lớp 10.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_girls_flowers",
      src: "assets/10a7/10a7_2010_girls_flowers.jpg",
      title: "Tà Áo Dài Trắng & Hoa Hồng 20/10",
      desc: "Cô chủ nhiệm cùng tập thể nữ sinh 10A7 rạng rỡ trong tà áo dài truyền thống và hoa tươi.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_selfie_fun",
      src: "assets/10a7/10a7_2010_selfie_fun.jpg",
      title: "Nụ Cười Tuổi 16 Tinh Khôi",
      desc: "Góc chụp selfie nhí nhảnh bắt trọn từng biểu cảm đáng yêu, hồn nhiên của thành viên 10A7.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_cheer",
      src: "assets/10a7/10a7_cheer.jpg",
      title: "Đội Cổ Vũ 10A7 Cháy Hết Mình",
      desc: "Những tiếng reo hò, nụ cười rạng rỡ cổ vũ tinh thần thể thao dưới sân trường THPT Trần Văn Giàu.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_jollibee",
      src: "assets/10a7/10a7_jollibee.jpg",
      title: "Chuyến Dã Ngoại Jollibee Đáng Nhớ",
      desc: "Cả lớp cùng check-in cực vui với chú ong Jollibee trong chuyến ngoại khóa gắn kết bạn bè.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_boys",
      src: "assets/10a7/10a7_2010_boys.jpg",
      title: "Biệt Đội Nam Sinh 10A7 Cực Ngầu",
      desc: "Các chàng trai 10A7 bên góc lớp học với nụ cười phong trần chuẩn nam thần học đường.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_peace_pose",
      src: "assets/10a7/10a7_2010_peace_pose.jpg",
      title: "Năng Lượng Bùng Nổ Lớp 10A7",
      desc: "Học hết sức, chơi hết mình — kỷ niệm không thể nào quên của thanh xuân dưới mái trường TVG.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_thethao_5183",
      src: "assets/10a7/10a7_thethao_5183.jpg",
      title: "Hội Thao Khí Thế — Toàn Đội Kề Vai",
      desc: "Sức trẻ 10A7 bùng cháy trên sân cỏ và đường chạy thể thao trường Trần Văn Giàu.",
      aspect: "aspect-[4/3] lg:aspect-square",
    },
    {
      id: "10a7_thethao_5178",
      src: "assets/10a7/10a7_thethao_5178.jpg",
      title: "Quyết Thắng Hội Thao Trường",
      desc: "Tập thể 10A7 với tinh thần đoàn kết tuyệt đối trong ngày hội thi đấu thể dục thể thao.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_thethao_5182",
      src: "assets/10a7/10a7_thethao_5182.jpg",
      title: "Nụ Cười Vận Động Viên 10A7",
      desc: "Những gương mặt rạng rỡ niềm vui sau những giờ tranh tài thể thao sôi động.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_thethao_5179",
      src: "assets/10a7/10a7_thethao_5179.jpg",
      title: "Kề Vai Sát Cánh Bên Sân Trường",
      desc: "Tình bạn bè khăng khít dưới bóng cây xanh mát sân trường THPT Trần Văn Giàu.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_1621",
      src: "assets/10a7/10a7_2010_1621.jpg",
      title: "Rực Rỡ Áo Dài 20/10 — Lớp 10A7",
      desc: "Các cô gái 10A7 thướt tha trong tà áo dài trắng cùng nụ cười duyên dáng thanh xuân.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_1626",
      src: "assets/10a7/10a7_2010_1626.jpg",
      title: "Bảng Vàng Hạnh Phúc — Ngày 20/10",
      desc: "Tập thể lớp cùng cô chủ nhiệm lưu giữ kỷ niệm ngày phụ nữ Việt Nam ấm áp.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_full2",
      src: "assets/10a7/10a7_2010_full2.jpg",
      title: "Niềm Vui Rạng Ngời 20/10",
      desc: "Bảng đen nắn nót dòng chữ Happy Women’s Day cùng nụ cười rạng ngời của toàn thể lớp 10A7.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_balloons",
      src: "assets/10a7/10a7_2010_balloons.jpg",
      title: "Bóng Bay Sắc Màu & Tuổi Học Trò",
      desc: "Cả lớp cùng giơ hoa và quà, lưu lại khoảnh khắc thanh xuân rực rỡ năm lớp 10.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_selfie_girls",
      src: "assets/10a7/10a7_selfie_girls.jpg",
      title: "Hội Bạn Thân 10A7 Siêu Nhí Nhố",
      desc: "Khoảnh khắc giờ ra chơi với những nụ cười tươi rói trong đồng phục thể dục xanh dương.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_2010_flower_lineup",
      src: "assets/10a7/10a7_2010_flower_lineup.jpg",
      title: "Duyên Dáng Nữ Sinh 10A7",
      desc: "Hàng ngũ tà áo dài truyền thống thướt tha bên cô giáo chủ nhiệm thân thương.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_thethao_5185",
      src: "assets/10a7/10a7_thethao_5185.jpg",
      title: "Hậu Trường Vui Vẻ Hội Thao",
      desc: "Tiếng cười rộn ràng bên lề sân bóng giữa các thành viên 10A7.",
      aspect: "aspect-[16/10]",
    },
    {
      id: "10a7_thethao_5186",
      src: "assets/10a7/10a7_thethao_5186.jpg",
      title: "Đoàn Kết Chiến Thắng",
      desc: "Từng ánh mắt, nụ cười gắn kết của những năm tháng học trò đáng trân quý.",
      aspect: "aspect-[16/10]",
    },
  ];

  // Combined Photos Array for Lightbox and Slider
  const ALL_PHOTOS = [...PHOTOS_11A7, ...PHOTOS_10A7];

  // --- 8 Authentic Videos from 10A7 Archive ---
  const ALL_VIDEOS = [
    {
      id: "video_20_10_full",
      src: "assets/10a7/videos/video_20_10_full.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_10_full.jpg",
      title: "Đại Lễ 20/10 — Toàn Cảnh Kỷ Niệm 10A7",
      desc: "Thước phim trọn vẹn không khí tưng bừng ngày 20/10: phái nam chuẩn bị hoa, quà và nụ cười rạng rỡ của phái nữ 10A7.",
      tag: "Đại lễ 20/10",
      grade: "10A7",
      duration: "02:44",
      size: "14.7 MB",
    },
    {
      id: "video_20_11_full",
      src: "assets/10a7/videos/video_20_11_full.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_11_full.jpg",
      title: "Tri Ân Thầy Cô 20/11 — Giai Điệu Thanh Xuân",
      desc: "Toàn bộ tiết mục văn nghệ và khoảnh khắc tri ân ấm áp của đại gia đình 10A7 gửi đến thầy cô.",
      tag: "Tri ân 20/11",
      grade: "10A7",
      duration: "03:26",
      size: "23.0 MB",
    },
    {
      id: "video_19_11_part1",
      src: "assets/10a7/videos/video_19_11_part1.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_19_11_part1.jpg",
      title: "Lễ 19/11 (Phần 1) — Rộn Rã Lớp Học",
      desc: "Những giây phút tập dượt và hoạt náo vui tươi của các bạn học sinh 10A7 trước ngày hội lớn.",
      tag: "Hoạt náo 19/11",
      grade: "10A7",
      duration: "03:44",
      size: "21.7 MB",
    },
    {
      id: "video_19_11_part2",
      src: "assets/10a7/videos/video_19_11_part2.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_19_11_part2.jpg",
      title: "Lễ 19/11 (Phần 2) — Tiếng Cười Tuổi Học Trò",
      desc: "Kỷ niệm khó phai với những màn pha trò dí dỏm và sự gắn kết thân thương của cả lớp.",
      tag: "Kỷ niệm 19/11",
      grade: "10A7",
      duration: "03:03",
      size: "20.3 MB",
    },
    {
      id: "video_20_10_clip1",
      src: "assets/10a7/videos/video_20_10_clip1.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_10_clip1.jpg",
      title: "Khoảnh Khắc Tặng Hoa & Quà 20/10",
      desc: "Từng cành hoa hồng trao tay các bạn nữ sinh 10A7 duyên dáng trong tà áo dài.",
      tag: "Clip 20/10",
      grade: "10A7",
      duration: "00:56",
      size: "14.6 MB",
    },
    {
      id: "video_20_10_clip2",
      src: "assets/10a7/videos/video_20_10_clip2.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_10_clip2.jpg",
      title: "Nụ Cười Tuổi 16 — Lời Chúc 20/10",
      desc: "Lời chúc dễ thương và những nụ cười tươi tắn nhất của phái đẹp 10A7.",
      tag: "Clip 20/10",
      grade: "10A7",
      duration: "01:08",
      size: "17.5 MB",
    },
    {
      id: "video_20_10_clip3",
      src: "assets/10a7/videos/video_20_10_clip3.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_10_clip3.jpg",
      title: "Hậu Trường Trang Trí Bảng Đen 20/10",
      desc: "Cùng ngắm nhìn nét vẽ nắn nót dòng chữ Happy Women’s Day trên bảng lớp.",
      tag: "Hậu trường",
      grade: "10A7",
      duration: "00:20",
      size: "5.3 MB",
    },
    {
      id: "video_20_10_clip4",
      src: "assets/10a7/videos/video_20_10_clip4.mp4",
      thumb: "assets/10a7/video_thumbs/thumb_20_10_clip4.jpg",
      title: "Quẩy Hết Mình Ngày Phụ Nữ Việt Nam",
      desc: "Bóng bay bay khắp phòng học và tiếng cười vang vọng khắp hành lang trường TVG.",
      tag: "Clip 20/10",
      grade: "10A7",
      duration: "02:30",
      size: "30.2 MB",
    },
  ];

  // --- LocalStorage Notes ---
  const STORAGE_KEY = "aseta_class_a7_custom_notes_v6";

  function loadCustomNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomNote(note) {
    try {
      const list = loadCustomNotes();
      list.unshift(note);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      renderNotes();
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Web Audio Synthesizer (Lo-Fi School Ambience) ---
  let audioCtx = null;
  let musicEnabled = false;
  let musicInterval = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playSchoolChord(freqs, dur = 2.2) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
      });
    } catch (e) {}
  }

  function toggleMusic(force) {
    musicEnabled = force !== undefined ? force : !musicEnabled;
    const btn = document.getElementById("galleryMusicBtn");
    if (btn) {
      btn.classList.toggle("bg-pink-500", musicEnabled);
      btn.classList.toggle("text-white", musicEnabled);
      btn.title = musicEnabled ? "Tắt nhạc học trò" : "Bật nhạc học trò du dương";
    }
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    if (musicEnabled) {
      getAudioContext();
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [196.0, 246.94, 293.66, 392.0], // G
        [220.0, 261.63, 329.63, 440.0], // Am7
        [174.61, 220.0, 261.63, 349.23], // F
      ];
      let step = 0;
      playSchoolChord(chords[0]);
      musicInterval = setInterval(() => {
        step = (step + 1) % chords.length;
        playSchoolChord(chords[step]);
      }, 2600);
    }
  }

  // --- Lightbox State for Photos ---
  let activeLightboxIndex = 0;

  function openLightboxByIndex(index) {
    activeLightboxIndex = (index + ALL_PHOTOS.length) % ALL_PHOTOS.length;
    const item = ALL_PHOTOS[activeLightboxIndex];
    if (!item) return;

    const modal = document.getElementById("galleryLightboxModal");
    const content = document.getElementById("galleryLightboxContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative w-full flex flex-col items-center">
        <!-- Close button inside modal -->
        <button type="button" 
                onclick="window.Class11A7JournalEngine.closeLightbox()" 
                class="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer">
          ✕
        </button>

        <!-- Main Image -->
        <div class="relative max-h-[75vh] w-auto overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black flex items-center justify-center">
          <img src="${item.src}" alt="${item.title}" class="max-h-[75vh] max-w-full w-auto object-contain block select-none"/>
          
          <!-- Prev / Next arrows inside lightbox -->
          <button type="button" 
                  onclick="event.stopPropagation(); window.Class11A7JournalEngine.prevLightbox()"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer">
            ‹
          </button>
          <button type="button" 
                  onclick="event.stopPropagation(); window.Class11A7JournalEngine.nextLightbox()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer">
            ›
          </button>
        </div>

        <!-- Info & Actions Below Photo (No text on photo) -->
        <div class="w-full max-w-2xl mt-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-wider">A7</span>
              <span class="text-xs text-slate-400">${activeLightboxIndex + 1} / ${ALL_PHOTOS.length}</span>
            </div>
            <h4 class="text-base sm:text-lg font-black text-white mt-1">${item.title}</h4>
            <p class="text-xs text-slate-300 mt-0.5">${item.desc}</p>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a href="${item.src}" download target="_blank" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-all">
              📥 Tải ảnh gốc
            </a>
            <button type="button" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-90 transition-all cursor-pointer" onclick="this.innerHTML='❤️ Đã yêu thích!';">
              ❤️ Thả tim
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeLightbox() {
    const modal = document.getElementById("galleryLightboxModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  function nextLightbox() {
    openLightboxByIndex(activeLightboxIndex + 1);
  }

  function prevLightbox() {
    openLightboxByIndex(activeLightboxIndex - 1);
  }

  // --- Cinema Video Modal (Chơi lại từ đầu có nhạc/tiếng đầy đủ) ---
  let activeVideoIndex = 0;

  function openVideoModal(videoIdx) {
    activeVideoIndex = videoIdx;
    const v = ALL_VIDEOS[videoIdx];
    if (!v) return;

    const modal = document.getElementById("galleryVideoModal");
    const content = document.getElementById("galleryVideoContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative w-full flex flex-col items-center">
        <!-- Close button inside modal -->
        <button type="button" 
                onclick="window.Class11A7JournalEngine.closeVideoModal()" 
                class="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer">
          ✕
        </button>

        <!-- Video Player Element (Phát từ đầu có tiếng) -->
        <div class="relative max-h-[75vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black flex items-center justify-center">
          <video id="activeCinemaVideo" 
                 src="${v.src}" 
                 poster="${v.thumb}"
                 controls 
                 autoplay 
                 playsinline 
                 class="w-full max-h-[75vh] rounded-2xl object-contain bg-black">
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>

        <!-- Video Info & Controls -->
        <div class="w-full max-w-4xl mt-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">${v.tag}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">⏱️ ${v.duration}</span>
              <span class="text-xs text-slate-400 font-mono">${v.size}</span>
            </div>
            <h4 class="text-base sm:text-lg font-black text-white mt-1.5">${v.title}</h4>
            <p class="text-xs text-slate-300 mt-0.5">${v.desc}</p>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
            <!-- Xem lại từ đầu button -->
            <button type="button" 
                    onclick="window.Class11A7JournalEngine.replayActiveVideo()" 
                    class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer">
              <span>⏮️</span>
              <span>Xem lại từ đầu</span>
            </button>

            <!-- Tải video -->
            <a href="${v.src}" download target="_blank" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-all">
              📥 Tải Video
            </a>

            <!-- Thả tim -->
            <button type="button" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all cursor-pointer" onclick="this.innerHTML='❤️ Đã thích!';">
              ❤️ Thả tim
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Start video from beginning unmuted with sound
    setTimeout(() => {
      const vid = document.getElementById("activeCinemaVideo");
      if (vid) {
        vid.currentTime = 0;
        vid.muted = false;
        vid.volume = 1.0;
        vid.play().catch(() => {});
      }
    }, 150);
  }

  function replayActiveVideo() {
    const vid = document.getElementById("activeCinemaVideo");
    if (vid) {
      vid.currentTime = 0;
      vid.muted = false;
      vid.play().catch(() => {});
    }
  }

  function closeVideoModal() {
    const modal = document.getElementById("galleryVideoModal");
    const video = document.getElementById("activeCinemaVideo");
    if (video) {
      try {
        video.pause();
        video.src = "";
      } catch (e) {}
    }
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  // --- Add Note Modal ---
  function openAddNoteModal() {
    const modal = document.getElementById("galleryAddNoteModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  function closeAddNoteModal() {
    const modal = document.getElementById("galleryAddNoteModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  function submitAddNote() {
    const authorEl = document.getElementById("noteAuthorInput");
    const titleEl = document.getElementById("noteTitleInput");
    const contentEl = document.getElementById("noteContentInput");

    const author = authorEl ? authorEl.value.trim() : "Thành viên A7";
    const title = titleEl ? titleEl.value.trim() : "Kỷ niệm thanh xuân A7";
    const content = contentEl ? contentEl.value.trim() : "";

    if (!content) {
      alert("Vui lòng nhập lời chúc hoặc kỷ niệm của bạn!");
      return;
    }

    const note = {
      id: "note_" + Date.now(),
      author: author || "Thành viên A7",
      title: title || "Lời nhắn gửi A7",
      content,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    saveCustomNote(note);
    closeAddNoteModal();

    if (authorEl) authorEl.value = "";
    if (titleEl) titleEl.value = "";
    if (contentEl) contentEl.value = "";

    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  }

  // --- Render Photos Column (11A7 SONG SONG VỚI VIDEO • 10A7 TRÀN TOÀN CẢNH KHI HẾT VIDEO) ---
  function renderPhotosSection() {
    // 1. 11A7 Photos Grid (Ở Đầu song song cùng Thước Phim Video)
    const c1_11 = document.getElementById("photos11A7Col1");
    const c2_11 = document.getElementById("photos11A7Col2");

    if (c1_11 && c2_11) {
      // 8 photos for 11A7 distributed in 2 columns
      const c1Photos = [PHOTOS_11A7[0], PHOTOS_11A7[1], PHOTOS_11A7[4], PHOTOS_11A7[6]];
      const c2Photos = [PHOTOS_11A7[2], PHOTOS_11A7[3], PHOTOS_11A7[5], PHOTOS_11A7[7]];

      const renderCard = (p) => {
        const globalIdx = ALL_PHOTOS.findIndex((x) => x.id === p.id);
        return `
          <div class="gallery-card group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#131520] border border-white/10 shadow-xl cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl ${p.aspect}"
               onclick="window.Class11A7JournalEngine.openLightbox(${globalIdx})"
               title="${p.title}">
            <img src="${p.src}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-105"/>
          </div>
        `;
      };

      c1_11.innerHTML = c1Photos.map(renderCard).join("");
      c2_11.innerHTML = c2Photos.map(renderCard).join("");
    }

    // 2. 10A7 Photos Grid (Tự động đưa ảnh tràn qua cả bên phải khi video hết hàng, 4 cột toàn cảnh tránh khoảng trống)
    const fullGrid10 = document.getElementById("photos10A7FullGrid");
    if (fullGrid10) {
      fullGrid10.innerHTML = PHOTOS_10A7.map((p) => {
        const globalIdx = ALL_PHOTOS.findIndex((x) => x.id === p.id);
        return `
          <div class="gallery-card group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#131520] border border-white/10 shadow-xl cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl ${p.aspect}"
               onclick="window.Class11A7JournalEngine.openLightbox(${globalIdx})"
               title="${p.title}">
            <img src="${p.src}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-105"/>
          </div>
        `;
      }).join("");
    }
  }

  // --- Render Videos Column (BÊN PHẢI: CHIA NHIỀU KHUNG HÌNH CHẠY LIÊN TỤC) ---
  let currentVideoCols = 2;

  function setVideoGridCols(cols) {
    currentVideoCols = cols;
    const container = document.getElementById("liveVideosStreamContainer");
    if (container) {
      container.className = cols === 3 
        ? "grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3" 
        : cols === 1 
          ? "grid grid-cols-1 gap-4" 
          : "grid grid-cols-2 gap-2.5 sm:gap-4";
    }
    const b2 = document.getElementById("btnGridCols2");
    const b3 = document.getElementById("btnGridCols3");
    if (b2 && b3) {
      if (cols === 3) {
        b3.className = "px-2.5 py-0.5 rounded-md font-bold transition-all bg-blue-600 text-white cursor-pointer shadow-sm";
        b2.className = "px-2.5 py-0.5 rounded-md text-slate-400 hover:text-white font-bold transition-all cursor-pointer";
      } else {
        b2.className = "px-2.5 py-0.5 rounded-md font-bold transition-all bg-blue-600 text-white cursor-pointer shadow-sm";
        b3.className = "px-2.5 py-0.5 rounded-md text-slate-400 hover:text-white font-bold transition-all cursor-pointer";
      }
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderVideosSection() {
    const container = document.getElementById("liveVideosStreamContainer");
    if (!container) return;

    container.innerHTML = ALL_VIDEOS.map((v, idx) => {
      return `
        <div class="live-video-card group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#10121d] border border-white/10 shadow-xl cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col"
             onclick="window.Class11A7JournalEngine.openVideo(${idx})"
             title="${v.title} — Chạm để xem từ đầu có âm thanh">
          
          <!-- Khung Video Player chạy liên tục (Muted Loop) -->
          <div class="relative w-full aspect-video overflow-hidden bg-black">
            <video src="${v.src}" 
                   poster="${v.thumb}"
                   autoplay 
                   muted 
                   loop 
                   playsinline 
                   preload="metadata"
                   class="w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105">
            </video>

            <!-- Gradient overlay for controls -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

            <!-- Top live & tag badges -->
            <div class="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
              <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-black/60 text-blue-300 border border-blue-400/30 backdrop-blur-md uppercase tracking-wider">
                ${v.tag}
              </span>
              <span class="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
              </span>
            </div>

            <!-- Center Hover Play Button -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div class="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center text-base shadow-xl shadow-blue-500/30 backdrop-blur-md">
                ▶
              </div>
            </div>

            <!-- Bottom inside video: Duration & Prompt -->
            <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
              <span class="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/80 text-white backdrop-blur-md border border-white/10">
                ⏱️ ${v.duration}
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1 group-hover:bg-blue-500">
                <span>🔊</span>
                <span>Bật tiếng</span>
              </span>
            </div>
          </div>

          <!-- Video Text Info -->
          <div class="p-2.5 sm:p-3 bg-slate-900/90 border-t border-white/5 flex flex-col justify-between flex-1">
            <div class="flex items-center justify-between gap-1.5">
              <h5 class="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors" title="${v.title}">
                ${v.title}
              </h5>
              <span class="shrink-0 text-slate-400 font-mono text-[9px]">
                ${v.size}
              </span>
            </div>
            <p class="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
              ${v.desc}
            </p>
          </div>

        </div>
      `;
    }).join("");

    // Ensure all background videos start autoplaying
    setTimeout(() => {
      const videos = container.querySelectorAll("video");
      videos.forEach((vid) => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }, 200);
  }

  // --- Render Notes Wall ---
  function renderNotes() {
    const customNotes = loadCustomNotes();
    const notesContainer = document.getElementById("galleryCustomNotesSection");
    if (!notesContainer) return;

    if (!customNotes.length) {
      notesContainer.style.display = "none";
    } else {
      notesContainer.style.display = "block";
      const grid = document.getElementById("galleryCustomNotesGrid");
      if (grid) {
        grid.innerHTML = customNotes
          .map(
            (n) => `
          <div class="p-4 rounded-2xl bg-slate-900/90 border border-pink-500/20 shadow-lg text-white space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-pink-400 flex items-center gap-1.5">
                <span>💌</span> ${n.author}
              </span>
              <span class="text-[10px] text-slate-500">${n.createdAt || ""}</span>
            </div>
            <h5 class="font-bold text-sm text-slate-100">${n.title}</h5>
            <p class="text-xs text-slate-300 leading-relaxed italic">"${n.content}"</p>
          </div>
        `
          )
          .join("");
      }
    }
  }

  // --- Render Infinite Auto Slider (Full width at bottom) ---
  function renderAutoSlider() {
    const track = document.getElementById("galleryInfiniteTrack");
    if (!track) return;

    // Duplicated images for seamless loop
    const sliderImages = [...ALL_PHOTOS, ...ALL_PHOTOS];

    track.innerHTML = sliderImages
      .map((p, idx) => {
        const globalIdx = idx % ALL_PHOTOS.length;
        return `
          <div class="image-item flex-shrink-0 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group cursor-pointer"
               onclick="window.Class11A7JournalEngine.openLightbox(${globalIdx})"
               title="${p.title}">
            <img src="${p.src}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover"/>
          </div>
        `;
      })
      .join("");
  }

  // --- Main HTML Architecture ---
  function buildModalHtml() {
    return `
      <style>
        @keyframes scroll-infinite-11a7 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll-11a7 {
          animation: scroll-infinite-11a7 36s linear infinite;
        }

        .infinite-scroll-11a7:hover {
          animation-play-state: paused;
        }

        .scroll-mask-11a7 {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .gallery-card, .live-video-card {
          will-change: transform;
        }

        .image-item {
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .image-item:hover {
          transform: scale(1.05);
          filter: brightness(1.08);
        }

        /* Custom scrollbar for dark gallery modal */
        .gallery-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .gallery-scrollbar::-webkit-scrollbar-track {
          background: #090a0f;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb {
          background: #25283b;
          border-radius: 9999px;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      </style>

      <div class="relative w-full h-full flex flex-col bg-[#08090d] text-white overflow-hidden select-none">
        
        <!-- ========================================== -->
        <!-- TOP APP HEADER (Chỉ ghi A7)                -->
        <!-- ========================================== -->
        <header class="sticky top-0 z-30 min-h-16 px-3.5 sm:px-6 py-2.5 bg-[#0c0e15]/90 backdrop-blur-2xl border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <!-- Left: Title & Logo -->
          <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-pink-500/25 border border-pink-400/30 shrink-0">
              📸
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-black text-white tracking-tight leading-tight truncate">
                  A7
                </h2>
                <span class="hidden xs:inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-sm uppercase tracking-wider">
                  THPT TVG
                </span>
              </div>
              <p class="text-[11px] text-slate-400 truncate">Kỷ niệm thanh xuân A7</p>
            </div>
          </div>

          <!-- Center: Jump Quick Filters (Hình ảnh & Nhiều Khung Hình Video) -->
          <div class="order-3 sm:order-2 w-full sm:w-auto flex justify-center">
            <div class="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 text-xs font-bold shadow-inner gap-1">
              <button type="button" 
                      onclick="window.Class11A7JournalEngine.scrollToSection('sectionLeftPhotos')"
                      class="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-md shadow-pink-500/20 font-bold cursor-pointer">
                <span>📸</span>
                <span>11A7 (8 Ảnh)</span>
              </button>
              <button type="button" 
                      onclick="window.Class11A7JournalEngine.scrollToSection('sectionRightVideos')"
                      class="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold cursor-pointer">
                <span>🎬</span>
                <span>Video (8 Live)</span>
              </button>
              <button type="button" 
                      onclick="window.Class11A7JournalEngine.scrollToSection('section10A7Full')"
                      class="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold cursor-pointer">
                <span>📸</span>
                <span>10A7 (20 Ảnh Toàn Cảnh)</span>
              </button>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="order-2 sm:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
            <!-- Music toggle -->
            <button type="button" 
                    id="galleryMusicBtn" 
                    onclick="window.Class11A7JournalEngine.toggleMusic()" 
                    title="Bật/Tắt nhạc nền học trò" 
                    class="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer">
              <span>🎵</span>
              <span class="hidden md:inline">Nhạc Nền</span>
            </button>

            <!-- Add Memory Note -->
            <button type="button" 
                    onclick="window.Class11A7JournalEngine.openAddNoteModal()" 
                    title="Viết lời chúc & lưu bút" 
                    class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:opacity-90 flex items-center gap-1.5 transition-all cursor-pointer">
              <span>✍️</span>
              <span class="hidden sm:inline">Lưu Bút</span>
            </button>

            <!-- Close Modal -->
            <button type="button" 
                    onclick="window.Class11A7JournalEngine.closeModal()" 
                    title="Đóng (Esc)" 
                    class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-white/10 flex items-center justify-center text-sm font-bold transition-all cursor-pointer">
              ✕
            </button>
          </div>
        </header>

        <!-- ========================================== -->
        <!-- MAIN SCROLLABLE BODY CANVAS                -->
        <!-- ========================================== -->
        <main class="flex-1 overflow-y-auto gallery-scrollbar p-3.5 sm:p-6 lg:p-8 space-y-8 sm:space-y-10">
          
          <!-- HERO INTRO BANNER -->
          <div class="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  KỶ NIỆM A7
                </span>
              </div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
                Thanh Xuân A7 Dưới Mái Trường TVG
              </h1>
              <p class="text-xs sm:text-sm text-slate-400 mt-1">
                Bên trái: Bộ sưu tập hình ảnh (11A7 ở đầu • 10A7 ở sau) • Bên phải: Nhiều khung hình video chạy song song
              </p>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-mono">
              <span>📸 <b>28</b> Ảnh</span>
              <span>•</span>
              <span>🎬 <b>8</b> Video Live</span>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- PHẦN 1: SONG SONG (11A7 BÊN TRÁI • VIDEO BÊN PHẢI)       -->
          <!-- ======================================================== -->
          <div class="max-w-[1520px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            
            <!-- ===================================================== -->
            <!-- BÊN TRÁI: HÌNH ẢNH 11A7 (8 ẢNH - 2 CỘT)                -->
            <!-- ===================================================== -->
            <section id="sectionLeftPhotos" class="space-y-4 lg:pr-2">
              
              <!-- SECTION 11A7 (Ở ĐẦU) -->
              <div class="space-y-4">
                <div class="flex items-center justify-between pb-2.5 border-b border-pink-500/25">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-xs font-black text-white shadow-md shadow-pink-500/25 shrink-0">
                      11
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm sm:text-base font-black text-white tracking-tight">Kỷ Niệm 11A7</h3>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                          Hiện tại
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-400">Những khoảnh khắc rạng rỡ của năm học lớp 11</p>
                    </div>
                  </div>
                  <span class="text-xs text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">8 Ảnh</span>
                </div>

                <!-- 11A7 Photos Grid (2 columns on left side) -->
                <div class="grid grid-cols-2 gap-3 sm:gap-4 items-start">
                  <div class="flex flex-col gap-3 sm:gap-4" id="photos11A7Col1"></div>
                  <div class="flex flex-col gap-3 sm:gap-4" id="photos11A7Col2"></div>
                </div>
              </div>

            </section>

            <!-- ===================================================== -->
            <!-- BÊN PHẢI: VIDEO (CHIA NHIỀU KHUNG HÌNH CHẠY LIÊN TỤC)  -->
            <!-- ===================================================== -->
            <section id="sectionRightVideos" class="space-y-4 lg:pl-2">
              
              <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-blue-500/25">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-base text-white shadow-md shadow-blue-500/25 shrink-0">
                    🎬
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm sm:text-base font-black text-white tracking-tight">Thước Phim A7</h3>
                      <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Chạy liên tục
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400">Đa khung hình tự động phát không tiếng • Chạm để coi lại có nhạc</p>
                  </div>
                </div>

                <!-- Multi-frame column toggle buttons & badge -->
                <div class="flex items-center gap-2">
                  <div class="inline-flex p-0.5 rounded-xl bg-slate-900 border border-white/10 text-[10px]">
                    <button type="button" 
                            id="btnGridCols2" 
                            onclick="window.Class11A7JournalEngine.setVideoGridCols(2)" 
                            class="px-2.5 py-0.5 rounded-lg font-bold transition-all bg-blue-600 text-white shadow-sm cursor-pointer"
                            title="Chia 2 khung hình song song">
                      2 Khung
                    </button>
                    <button type="button" 
                            id="btnGridCols3" 
                            onclick="window.Class11A7JournalEngine.setVideoGridCols(3)" 
                            class="px-2.5 py-0.5 rounded-lg text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
                            title="Chia 3 khung hình đa nhiệm">
                      3 Khung
                    </button>
                  </div>
                  <span class="text-xs text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 shrink-0">8 Video</span>
                </div>
              </div>

              <!-- Multi-Frame Grid of live continuous looping videos -->
              <div class="grid grid-cols-2 gap-2.5 sm:gap-4" id="liveVideosStreamContainer">
                <!-- Rendered automatically -->
              </div>

            </section>

          </div>

          <!-- ======================================================== -->
          <!-- PHẦN 2: KỶ NIỆM 10A7 (TỰ ĐỘNG TRÀN TOÀN CẢNH 4 CỘT)      -->
          <!-- Khi video hết hàng: tự động đưa ảnh qua phải, không trống-->
          <!-- ======================================================== -->
          <section id="section10A7Full" class="max-w-[1520px] mx-auto space-y-4 pt-6 sm:pt-8 border-t border-white/10">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-blue-500/25">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-blue-500/25 shrink-0">
                  10
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm sm:text-base font-black text-white tracking-tight">Kỷ Niệm 10A7</h3>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                      Năm Ấy
                    </span>
                    <span class="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30">
                      <span>✨</span> Tự động tràn toàn cảnh (Không khoảng trống)
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400">Trọn bộ 20 khoảnh khắc kỷ niệm 20/10, hội thao, dã ngoại và ngày đầu chung lớp</p>
                </div>
              </div>
              <span class="text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">20 Ảnh</span>
            </div>

            <!-- 10A7 Photos Grid (Tràn đều 4 cột trên desktop không để lại khoảng trống) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start" id="photos10A7FullGrid"></div>
          </section>

          <!-- ========================================== -->
          <!-- INFINITE AUTO-SLIDER AT BOTTOM             -->
          <!-- ========================================== -->
          <section class="w-full relative overflow-hidden pt-8 pb-12 mt-8 border-t border-white/10">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent pointer-events-none"></div>

            <div class="max-w-6xl mx-auto text-center mb-6 px-4">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-widest inline-block mb-2">
                Infinite Reel • Chạy Tự Động
              </span>
              <h3 class="text-base sm:text-xl font-black text-white">
                Cuộn Vô Tận Dòng Thời Gian A7
              </h3>
              <p class="text-xs text-slate-400 mt-1">Rê chuột hoặc chạm ngón tay để tạm dừng cuộn</p>
            </div>

            <div class="scroll-mask-11a7 w-full max-w-7xl mx-auto overflow-hidden">
              <div class="infinite-scroll-11a7 flex gap-4 sm:gap-6 w-max py-2" id="galleryInfiniteTrack"></div>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- USER LƯU BÚT NOTES WALL                    -->
          <!-- ========================================== -->
          <div id="galleryCustomNotesSection" class="max-w-6xl mx-auto space-y-3" style="display:none;">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-black text-white flex items-center gap-2">
                <span>💌 Bức Tường Lưu Bút Viết Tay</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">Cộng đồng A7</span>
              </h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="galleryCustomNotesGrid"></div>
          </div>

        </main>

        <!-- ========================================== -->
        <!-- LIGHTBOX MODAL (PHOTO VIEW)                -->
        <!-- ========================================== -->
        <div id="galleryLightboxModal" 
             style="z-index: 100000;"
             onclick="window.Class11A7JournalEngine.closeLightbox()" 
             class="fixed inset-0 bg-black/92 backdrop-blur-2xl hidden items-center justify-center p-3 sm:p-6 transition-all duration-200">
          <div class="relative w-full max-w-4xl" onclick="event.stopPropagation()" id="galleryLightboxContent"></div>
        </div>

        <!-- ========================================== -->
        <!-- VIDEO CINEMA MODAL (COI LẠI CÓ NHẠC/TIẾNG) -->
        <!-- ========================================== -->
        <div id="galleryVideoModal" 
             style="z-index: 100000;"
             onclick="window.Class11A7JournalEngine.closeVideoModal()" 
             class="fixed inset-0 bg-black/95 backdrop-blur-2xl hidden items-center justify-center p-3 sm:p-6 transition-all duration-200">
          <div class="relative w-full max-w-4xl" onclick="event.stopPropagation()" id="galleryVideoContent"></div>
        </div>

        <!-- ========================================== -->
        <!-- ADD NOTE / LƯU BÚT MODAL                   -->
        <!-- ========================================== -->
        <div id="galleryAddNoteModal" 
             style="z-index: 100000;"
             class="fixed inset-0 bg-black/85 backdrop-blur-md hidden items-center justify-center p-3 sm:p-4">
          <div class="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 text-white space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-pink-500/25">
                  ✍️
                </div>
                <div>
                  <h3 class="text-base font-black text-white">Viết Lưu Bút A7</h3>
                  <p class="text-xs text-slate-400">Gửi lời chúc & kỷ niệm của bạn</p>
                </div>
              </div>
              <button type="button" onclick="window.Class11A7JournalEngine.closeAddNoteModal()" class="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-slate-300 mb-1">Tên bạn (hoặc biệt danh):</label>
                <input type="text" id="noteAuthorInput" placeholder="Ví dụ: Minh Khôi" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"/>
              </div>

              <div>
                <label class="block font-bold text-slate-300 mb-1">Tiêu đề mẩu giấy:</label>
                <input type="text" id="noteTitleInput" placeholder="Ví dụ: Gửi cả lớp thân yêu..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"/>
              </div>

              <div>
                <label class="block font-bold text-slate-300 mb-1">Nội dung lưu bút:</label>
                <textarea id="noteContentInput" rows="4" placeholder="Nhập tâm sự, lời chúc thi cử hoặc kỷ niệm khó quên với lớp A7..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"></textarea>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-2.5">
              <button type="button" onclick="window.Class11A7JournalEngine.closeAddNoteModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
                Hủy bỏ
              </button>
              <button type="button" onclick="window.Class11A7JournalEngine.submitAddNote()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 font-bold">
                Ghim Lên Bảng 📌
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // --- Modal Open & Close Lifecycle ---
  let isInitialized = false;
  let containerEl = null;

  function init() {
    if (isInitialized) return;
    containerEl = document.getElementById("class11A7Modal");
    if (!containerEl) return;

    containerEl.innerHTML = buildModalHtml();
    renderPhotosSection();
    renderVideosSection();
    renderAutoSlider();
    renderNotes();

    // Keyboard support
    window.addEventListener("keydown", function (e) {
      if (!containerEl || containerEl.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        const videoModal = document.getElementById("galleryVideoModal");
        if (videoModal && !videoModal.classList.contains("hidden")) {
          closeVideoModal();
          return;
        }
        const lb = document.getElementById("galleryLightboxModal");
        if (lb && !lb.classList.contains("hidden")) {
          closeLightbox();
          return;
        }
        closeModal();
      } else if (e.key === "ArrowRight") {
        const lb = document.getElementById("galleryLightboxModal");
        if (lb && !lb.classList.contains("hidden")) nextLightbox();
      } else if (e.key === "ArrowLeft") {
        const lb = document.getElementById("galleryLightboxModal");
        if (lb && !lb.classList.contains("hidden")) prevLightbox();
      }
    });

    isInitialized = true;
  }

  function openModal() {
    init();
    if (containerEl) {
      containerEl.style.setProperty("display", "flex", "important");
      containerEl.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      // Ensure all continuous muted looping background videos start
      setTimeout(() => {
        const bgVideos = containerEl.querySelectorAll("#liveVideosStreamContainer video");
        bgVideos.forEach((v) => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }, 200);
    }
  }

  function closeModal() {
    if (containerEl) {
      containerEl.style.setProperty("display", "none", "important");
      containerEl.classList.add("hidden");
      document.body.style.overflow = "";
      if (musicEnabled) toggleMusic(false);
      closeLightbox();
      closeVideoModal();
      // Pause background videos to save battery/resources when modal closed
      const bgVideos = containerEl.querySelectorAll("#liveVideosStreamContainer video");
      bgVideos.forEach((v) => {
        try {
          v.pause();
        } catch (e) {}
      });
    }
  }

  return {
    init,
    openModal,
    closeModal,
    openLightbox: openLightboxByIndex,
    closeLightbox,
    nextLightbox,
    prevLightbox,
    openVideo: openVideoModal,
    replayActiveVideo,
    closeVideoModal,
    toggleMusic,
    openAddNoteModal,
    closeAddNoteModal,
    submitAddNote,
    setVideoGridCols,
    scrollToSection,
  };
})();
