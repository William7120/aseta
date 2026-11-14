/**
 * =======================================================================
 * AZOTA OS - KỶ NIỆM A7 (THPT TRẦN VĂN GIÀU)
 * Bento Masonry Grid (Image 1 Style) + Infinite Auto-Scroll Carousel
 * 100% Authentic Photos of Class A7 • Pure Photo Cards (No Text Overlay)
 * =======================================================================
 */

window.Class11A7JournalEngine = (function () {
  "use strict";

  // --- 20 Authentic Photos of Class A7 (Merged in One Place) ---
  const ALL_PHOTOS = [
    // --- 11A7 ---
    {
      id: "p2500",
      src: "assets/11a7/IMG_2500.JPG",
      title: "Chữ V Quyết Tâm — Đại Gia Đình A7",
      desc: "Những nụ cười rạng rỡ cùng giơ tay chữ V dưới mái trường THPT Trần Văn Giàu.",
      aspect: "aspect-[4/3] lg:aspect-square",
      col: 2,
    },
    {
      id: "p2498",
      src: "assets/11a7/IMG_2498.JPG",
      title: "Pose Dáng Bất Hủ — Biệt Đội A7",
      desc: "Khoảnh khắc cả lớp cùng chỉ tay cực ngầu, các bạn nam ngồi bệt sàn lớp học.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "p2495",
      src: "assets/11a7/IMG_2495.JPG",
      title: "Tà Áo Dài & Cô Chủ Nhiệm Thân Yêu",
      desc: "Cô chủ nhiệm dịu dàng trong tà áo dài xanh ngọc bên các bạn nữ sinh duyên dáng.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "p2499",
      src: "assets/11a7/IMG_2499.JPG",
      title: "Nụ Cười Tuổi Học Trò Rạng Rỡ",
      desc: "Thanh xuân năm ấy chúng ta có nhau. Giữa giờ học là những giây phút cười nghiêng ngả.",
      aspect: "aspect-[16/10]",
      col: 2,
    },
    {
      id: "p2494",
      src: "assets/11a7/IMG_2494.JPG",
      title: "Món Quà Nhỏ — Niềm Vui To",
      desc: "Từng túi quà trao tay, từng lời chúc ấm áp gửi đến phái nữ A7.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "p2497",
      src: "assets/11a7/IMG_2497.JPG",
      title: "Lớp Học Thân Thương & Bảng Đen",
      desc: "Góc phòng học A7 với khẩu hiệu 'Chân - Thiện - Mỹ' và 'Muốn biết phải hỏi, muốn giỏi phải học'.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "p2501",
      src: "assets/11a7/IMG_2501.JPG",
      title: "Đoàn Kết Là Sức Mạnh Bất Diệt",
      desc: "Dù bài vở ôn thi hay phong trào, A7 luôn kề vai sát cánh cùng tiến bước.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "p2496",
      src: "assets/11a7/IMG_2496.JPG",
      title: "Check-in Kỷ Niệm Cùng Cô",
      desc: "Lưu giữ từng khoảnh khắc thanh xuân tươi đẹp nhất của tuổi học trò.",
      aspect: "aspect-[16/10]",
      col: 3,
    },

    // --- 10A7 Group Photos ---
    {
      id: "10a7_2010_full1",
      src: "assets/10a7/10a7_2010_full1.jpg",
      title: "Đại Lễ 20/10 — Cả Lớp A7 Kề Vai",
      desc: "Phái nữ A7 duyên dáng áo dài trắng bên các bạn nam ngồi sàn lớp học cùng bóng bay rực rỡ.",
      aspect: "aspect-[4/3] lg:aspect-square",
      col: 2,
    },
    {
      id: "10a7_chalkboard",
      src: "assets/10a7/10a7_chalkboard.jpg",
      title: "Tập Thể A7 — Ngày Đầu Chung Lớp",
      desc: "Khoảnh khắc đại gia đình A7 quây quần bên bục giảng và bảng đen thân thương.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "10a7_2010_girls_flowers",
      src: "assets/10a7/10a7_2010_girls_flowers.jpg",
      title: "Tà Áo Dài Trắng & Hoa Hồng 20/10",
      desc: "Cô chủ nhiệm cùng tập thể nữ sinh A7 rạng rỡ trong tà áo dài truyền thống và hoa tươi.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "10a7_2010_selfie_fun",
      src: "assets/10a7/10a7_2010_selfie_fun.jpg",
      title: "Nụ Cười Tuổi Trẻ Tinh Khôi",
      desc: "Góc chụp selfie nhí nhảnh bắt trọn từng biểu cảm đáng yêu, hồn nhiên của thành viên A7.",
      aspect: "aspect-[16/10]",
      col: 2,
    },
    {
      id: "10a7_cheer",
      src: "assets/10a7/10a7_cheer.jpg",
      title: "Đội Cổ Vũ A7 Cháy Hết Mình",
      desc: "Những tiếng reo hò, nụ cười rạng rỡ cổ vũ tinh thần thể thao dưới sân trường THPT Trần Văn Giàu.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "10a7_jollibee",
      src: "assets/10a7/10a7_jollibee.jpg",
      title: "Chuyến Dã Ngoại Jollibee Đáng Nhớ",
      desc: "Cả lớp cùng check-in cực vui với chú ong Jollibee trong chuyến ngoại khóa gắn kết bạn bè.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "10a7_2010_boys",
      src: "assets/10a7/10a7_2010_boys.jpg",
      title: "Biệt Đội Nam Sinh A7 Cực Ngầu",
      desc: "Các chàng trai A7 bên góc lớp học với nụ cười phong trần chuẩn nam thần học đường.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "10a7_2010_peace_pose",
      src: "assets/10a7/10a7_2010_peace_pose.jpg",
      title: "Năng Lượng Bùng Nổ Lớp A7",
      desc: "Học hết sức, chơi hết mình — kỷ niệm không thể nào quên của thanh xuân dưới mái trường TVG.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "10a7_2010_full2",
      src: "assets/10a7/10a7_2010_full2.jpg",
      title: "Niềm Vui Rạng Ngời 20/10",
      desc: "Bảng đen nắn nót dòng chữ Happy Women’s Day cùng nụ cười rạng ngời của toàn thể lớp A7.",
      aspect: "aspect-[16/10]",
      col: 1,
    },
    {
      id: "10a7_2010_balloons",
      src: "assets/10a7/10a7_2010_balloons.jpg",
      title: "Bóng Bay Sắc Màu & Tuổi Học Trò",
      desc: "Cả lớp cùng giơ hoa và quà, lưu lại khoảnh khắc thanh xuân rực rỡ.",
      aspect: "aspect-[16/10]",
      col: 2,
    },
    {
      id: "10a7_selfie_girls",
      src: "assets/10a7/10a7_selfie_girls.jpg",
      title: "Hội Bạn Thân A7 Siêu Nhí Nhố",
      desc: "Khoảnh khắc giờ ra chơi với những nụ cười tươi rói trong đồng phục thể dục xanh dương.",
      aspect: "aspect-[16/10]",
      col: 3,
    },
    {
      id: "10a7_2010_flower_lineup",
      src: "assets/10a7/10a7_2010_flower_lineup.jpg",
      title: "Duyên Dáng Nữ Sinh A7",
      desc: "Hàng ngũ tà áo dài truyền thống thướt tha bên cô giáo chủ nhiệm thân thương.",
      aspect: "aspect-[16/10]",
      col: 2,
    },
  ];

  const STORAGE_KEY = "aseta_class_a7_custom_notes_v4";

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

  // --- Lightbox State ---
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

  // --- Add Custom Note Modal ---
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

  // --- Render Bento Masonry Grid (Pure Photos Only - No Text Overlaid) ---
  function renderGallery() {
    const col1 = document.getElementById("galleryCol1");
    const col2 = document.getElementById("galleryCol2");
    const col3 = document.getElementById("galleryCol3");
    if (!col1 || !col2 || !col3) return;

    // Distribute 20 photos across 3 columns matching Image 1
    // Column 1 (7 photos): 2498, 2494, 2501, 10a7_chalkboard, 10a7_cheer, 10a7_2010_boys, 10a7_2010_full2
    const c1Photos = [
      ALL_PHOTOS[1],
      ALL_PHOTOS[4],
      ALL_PHOTOS[6],
      ALL_PHOTOS[9],
      ALL_PHOTOS[12],
      ALL_PHOTOS[14],
      ALL_PHOTOS[16],
    ];

    // Column 2 (6 photos - Featured center with 2 square cards): 2500 (square), 2499, 10a7_2010_full1 (square), 10a7_2010_selfie_fun, 10a7_2010_balloons, 10a7_2010_flower_lineup
    const c2Photos = [
      ALL_PHOTOS[0],
      ALL_PHOTOS[3],
      ALL_PHOTOS[8],
      ALL_PHOTOS[11],
      ALL_PHOTOS[17],
      ALL_PHOTOS[19],
    ];

    // Column 3 (7 photos): 2495, 2497, 2496, 10a7_2010_girls_flowers, 10a7_jollibee, 10a7_2010_peace_pose, 10a7_selfie_girls
    const c3Photos = [
      ALL_PHOTOS[2],
      ALL_PHOTOS[5],
      ALL_PHOTOS[7],
      ALL_PHOTOS[10],
      ALL_PHOTOS[13],
      ALL_PHOTOS[15],
      ALL_PHOTOS[18],
    ];

    // Render pure photo card with ZERO text overlaid (as requested)
    const renderCard = (p) => {
      const globalIdx = ALL_PHOTOS.findIndex((x) => x.id === p.id);
      return `
        <div class="gallery-card group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#131520] border border-white/10 shadow-xl cursor-pointer select-none transition-all duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-2xl ${p.aspect}"
             onclick="window.Class11A7JournalEngine.openLightbox(${globalIdx})"
             title="${p.title}">
          <img src="${p.src}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-105"/>
        </div>
      `;
    };

    col1.innerHTML = c1Photos.map(renderCard).join("");
    col2.innerHTML = c2Photos.map(renderCard).join("");
    col3.innerHTML = c3Photos.map(renderCard).join("");

    renderNotes();
  }

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

  // --- Render Infinite Auto Slider (Pure Photos - No Text Overlaid) ---
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
      <!-- Embedded CSS for Auto Slider and Bento Masonry Grid -->
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
          animation: scroll-infinite-11a7 32s linear infinite;
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

        .gallery-card {
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
        <header class="sticky top-0 z-30 h-16 px-3.5 sm:px-6 bg-[#0c0e15]/90 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          
          <!-- Left: Title & Logo (Chỉ ghi A7) -->
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

          <!-- Right: Actions -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
          <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
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
                Chạm vào bất kỳ ảnh nào để xem ảnh gốc chất lượng cao
              </p>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
              <span>📸 <b>20</b> Khoảnh Khắc Tập Thể</span>
              <span>•</span>
              <span>👥 Đại Gia Đình A7</span>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 1. BENTO MASONRY GRID (MATCHING IMAGE 1)   -->
          <!-- PURE PHOTOS ONLY - NO TEXT OVERLAY         -->
          <!-- ========================================== -->
          <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 items-start">
              
              <!-- Column 1 (Image 1 Style) -->
              <div class="flex flex-col gap-3.5 sm:gap-4 lg:gap-5" id="galleryCol1"></div>

              <!-- Column 2 (Image 1 Style - Center Column) -->
              <div class="flex flex-col gap-3.5 sm:gap-4 lg:gap-5" id="galleryCol2"></div>

              <!-- Column 3 (Image 1 Style) -->
              <div class="flex flex-col gap-3.5 sm:gap-4 lg:gap-5" id="galleryCol3"></div>

            </div>
          </div>

          <!-- ========================================== -->
          <!-- 2. USER LƯU BÚT NOTES WALL (IF PRESENT)    -->
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

          <!-- ========================================== -->
          <!-- 3. INFINITE AUTO-SLIDER (PURE PHOTOS ONLY) -->
          <!-- ========================================== -->
          <section class="w-full relative overflow-hidden pt-8 pb-12 mt-6 border-t border-white/10">
            <!-- Background glow -->
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent pointer-events-none"></div>

            <!-- Title for infinite scroll -->
            <div class="max-w-6xl mx-auto text-center mb-6 px-4">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-widest inline-block mb-2">
                Infinite Reel • Chạy Tự Động
              </span>
              <h3 class="text-base sm:text-xl font-black text-white">
                Cuộn Vô Tận Dòng Thời Gian A7
              </h3>
              <p class="text-xs text-slate-400 mt-1">Rê chuột hoặc chạm ngón tay để tạm dừng cuộn</p>
            </div>

            <!-- Scroll container with gradient side masks (User's Code) -->
            <div class="scroll-mask-11a7 w-full max-w-7xl mx-auto overflow-hidden">
              <div class="infinite-scroll-11a7 flex gap-4 sm:gap-6 w-max py-2" id="galleryInfiniteTrack">
                <!-- Injected automatically -->
              </div>
            </div>
          </section>

        </main>

        <!-- ========================================== -->
        <!-- LIGHTBOX MODAL (HIGH-RES PHOTO VIEW)       -->
        <!-- ========================================== -->
        <div id="galleryLightboxModal" 
             style="z-index: 100000;"
             onclick="window.Class11A7JournalEngine.closeLightbox()" 
             class="fixed inset-0 bg-black/92 backdrop-blur-2xl hidden items-center justify-center p-3 sm:p-6 transition-all duration-200">
          <div class="relative w-full max-w-4xl" onclick="event.stopPropagation()" id="galleryLightboxContent"></div>
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
    renderGallery();
    renderAutoSlider();

    // Keyboard support
    window.addEventListener("keydown", function (e) {
      if (!containerEl || containerEl.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        const lb = document.getElementById("galleryLightboxModal");
        if (lb && !lb.classList.contains("hidden")) {
          closeLightbox();
        } else {
          closeModal();
        }
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
    }
  }

  function closeModal() {
    if (containerEl) {
      containerEl.style.setProperty("display", "none", "important");
      containerEl.classList.add("hidden");
      document.body.style.overflow = "";
      if (musicEnabled) toggleMusic(false);
      closeLightbox();
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
    toggleMusic,
    openAddNoteModal,
    closeAddNoteModal,
    submitAddNote,
  };
})();
