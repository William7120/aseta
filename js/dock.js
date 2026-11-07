// ========================================================
// AZOTA OS - ANIMATED SPRING DOCK (PHYSICS BASED ON FRAMER MOTION)
// ========================================================
window.AzotaDock = (function() {

    let dockEl = null;
    let items = [];
    let mouseX = Infinity;
    let isHovering = false;
    let animFrame = null;
    let isMinimized = false;

    // Item state for spring physics
    let itemStates = [];

    function init() {
        dockEl = document.getElementById("osDock");
        if (!dockEl) return;

        items = Array.from(dockEl.querySelectorAll(".dock-item"));
        itemStates = items.map(() => ({
            width: 48,
            targetWidth: 48,
            scale: 1,
            targetScale: 1
        }));

        dockEl.addEventListener("mousemove", handleMouseMove);
        dockEl.addEventListener("mouseleave", handleMouseLeave);
        dockEl.addEventListener("mouseenter", handleMouseEnter);

        // Touch support for mobile/tablet
        dockEl.addEventListener("touchmove", handleTouchMove, { passive: true });
        dockEl.addEventListener("touchend", handleMouseLeave);

        startSpringLoop();
    }

    function wakeSpringLoop() {
        if (!animFrame) {
            animFrame = requestAnimationFrame(updatePhysics);
        }
    }

    function handleMouseMove(e) {
        mouseX = e.clientX;
        isHovering = true;
        wakeSpringLoop();
    }

    function handleTouchMove(e) {
        if (e.touches && e.touches[0]) {
            mouseX = e.touches[0].clientX;
            isHovering = true;
            wakeSpringLoop();
        }
    }

    function handleMouseEnter() {
        isHovering = true;
        wakeSpringLoop();
    }

    function handleMouseLeave() {
        mouseX = Infinity;
        isHovering = false;
        // Reset all targets to stable base
        itemStates.forEach(st => {
            st.targetWidth = 48;
            st.targetScale = 1;
        });
        wakeSpringLoop();
    }

    function updatePhysics() {
        if (isHovering && mouseX !== Infinity && !isMinimized) {
            const maxDistance = 105; // Tight, comfortable detection radius
            const baseWidth = 48;
            const maxWidth = 66; // Subtle, elegant magnification (48px to 66px)

            items.forEach((item, idx) => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - itemCenterX);

                if (distance < maxDistance) {
                    // Smooth cosine curve
                    const norm = distance / maxDistance;
                    const factor = Math.cos((norm * Math.PI) / 2);
                    
                    itemStates[idx].targetWidth = baseWidth + factor * (maxWidth - baseWidth);
                    itemStates[idx].targetScale = 1 + factor * 0.32;
                } else {
                    itemStates[idx].targetWidth = baseWidth;
                    itemStates[idx].targetScale = 1;
                }
            });
        }

        let needsAnother = isHovering;

        // Spring interpolation
        items.forEach((item, idx) => {
            const st = itemStates[idx];
            const dWidth = st.targetWidth - st.width;
            const dScale = st.targetScale - st.scale;

            if (Math.abs(dWidth) > 0.08 || Math.abs(dScale) > 0.008) {
                st.width += dWidth * 0.28;
                st.scale += dScale * 0.28;
                needsAnother = true;
            } else {
                st.width = st.targetWidth;
                st.scale = st.targetScale;
            }

            item.style.width = `${st.width}px`;
            item.style.height = `${st.width}px`;

            const icon = item.querySelector(".dock-icon");
            if (icon) {
                icon.style.transform = `scale(${st.scale})`;
            }
        });

        if (needsAnother) {
            animFrame = requestAnimationFrame(updatePhysics);
        } else {
            animFrame = null;
        }
    }

    function startSpringLoop() {
        wakeSpringLoop();
    }

    function bounceItem(appId) {
        const item = document.querySelector(`[data-dock-app="${appId}"]`);
        if (!item) return;

        item.classList.remove("dock-bounce");
        void item.offsetWidth; // Trigger reflow
        item.classList.add("dock-bounce");
        setTimeout(() => item.classList.remove("dock-bounce"), 750);
    }

    function setActiveApp(appId) {
        document.querySelectorAll(".dock-item").forEach(item => {
            const dot = item.querySelector(".dock-dot");
            if (item.dataset.dockApp === appId) {
                if (dot) dot.classList.remove("opacity-0");
                item.classList.add("dock-active-app");
            } else {
                if (dot) dot.classList.add("opacity-0");
                item.classList.remove("dock-active-app");
            }
        });
    }

    function toggleMinimize() {
        isMinimized = !isMinimized;
        applyMinimizedState();
    }

    function setMinimized(minimized) {
        isMinimized = !!minimized;
        applyMinimizedState();
    }

    function applyMinimizedState() {
        if (!dockEl) dockEl = document.getElementById("osDock");
        const pill = document.getElementById("dockTriggerPill");
        if (dockEl) {
            if (isMinimized) {
                dockEl.classList.add("dock-minimized");
                if (pill) pill.classList.remove("hidden");
            } else {
                dockEl.classList.remove("dock-minimized");
                if (pill) pill.classList.add("hidden");
            }
        }
    }

    return {
        init: init,
        bounceItem: bounceItem,
        setActiveApp: setActiveApp,
        toggleMinimize: toggleMinimize,
        setMinimized: setMinimized
    };
})();
