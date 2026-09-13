/* ==========================================================
   FUZZY TEXT (vanilla JS port dari komponen React FuzzyText)
   Merender teks ke <canvas> lalu menggeser tiap baris piksel
   secara acak per-frame untuk efek "fuzzy/glitch" halus.
   Warna & font otomatis mengikuti CSS elemen canvas-nya
   (termasuk saat tema light/dark berganti).
========================================================== */

export function initFuzzyText(canvas, text, options = {}) {
    const {
        enableHover = true,
        baseIntensity = 0.12,
        hoverIntensity = 0.4,
        fuzzRange = 8,
        fps = 30,
        smoothing = 0.15
    } = options;

    let animationFrameId = null;
    let isCancelled = false;
    let cleanupHandlers = () => {};

    function build() {
        const ctx = canvas.getContext("2d");
        if (!ctx) return () => {};

        const cs = getComputedStyle(canvas);
        const fontSize = cs.fontSize || "21px";
        const fontWeight = cs.fontWeight || "800";
        const fontFamily = cs.fontFamily || "sans-serif";
        const color = cs.color || "#ffffff";
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const fontString = `${fontWeight} ${fontSize} ${fontFamily}`;

        const offscreen = document.createElement("canvas");
        const offCtx = offscreen.getContext("2d");
        offCtx.font = fontString;
        offCtx.textBaseline = "alphabetic";

        const metrics = offCtx.measureText(text);
        const numericFontSize = parseFloat(fontSize) || 21;
        const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
        const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
        const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
        const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.25;

        const textWidth = Math.max(1, Math.ceil(actualLeft + actualRight));
        const textHeight = Math.max(1, Math.ceil(actualAscent + actualDescent));
        const buffer = 6;

        offscreen.width = (textWidth + buffer) * dpr;
        offscreen.height = textHeight * dpr;
        offCtx.scale(dpr, dpr);
        offCtx.font = fontString;
        offCtx.textBaseline = "alphabetic";
        offCtx.fillStyle = color;
        offCtx.fillText(text, buffer / 2 - actualLeft, actualAscent);

        const marginX = fuzzRange + 4;
        const marginY = 2;
        const cssWidth = textWidth + buffer + marginX * 2;
        const cssHeight = textHeight + marginY * 2;

        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        canvas.style.width = cssWidth + "px";
        canvas.style.height = cssHeight + "px";

        let isHovering = false;
        let currentIntensity = baseIntensity;
        let lastFrameTime = 0;
        const frameDuration = 1000 / fps;

        const interactiveLeft = marginX;
        const interactiveRight = marginX + textWidth + buffer;
        const interactiveTop = marginY;
        const interactiveBottom = marginY + textHeight;

        function isInside(x, y) {
            return x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;
        }

        function onMove(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            isHovering = isInside(x, y);
        }
        function onLeave() {
            isHovering = false;
        }

        if (enableHover) {
            canvas.addEventListener("mousemove", onMove);
            canvas.addEventListener("mouseleave", onLeave);
        }

        function run(timestamp) {
            if (isCancelled) return;

            if (timestamp - lastFrameTime < frameDuration) {
                animationFrameId = window.requestAnimationFrame(run);
                return;
            }
            lastFrameTime = timestamp;

            const target = isHovering ? hoverIntensity : baseIntensity;
            currentIntensity += (target - currentIntensity) * smoothing;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.translate(marginX, marginY);

            const rowCount = offscreen.height / dpr;
            for (let j = 0; j < rowCount; j++) {
                const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
                ctx.drawImage(offscreen, 0, j * dpr, offscreen.width, dpr, dx, j, offscreen.width / dpr, 1);
            }

            animationFrameId = window.requestAnimationFrame(run);
        }

        animationFrameId = window.requestAnimationFrame(run);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            if (enableHover) {
                canvas.removeEventListener("mousemove", onMove);
                canvas.removeEventListener("mouseleave", onLeave);
            }
        };
    }

    cleanupHandlers = build();

    // Render ulang kalau tema (light/dark) berubah supaya warnanya ikut update
    const themeObserver = new MutationObserver(() => {
        cleanupHandlers();
        isCancelled = false;
        cleanupHandlers = build();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Render ulang saat resize/orientasi berubah (biar posisi tetap presisi)
    const onResize = () => {
        cleanupHandlers();
        isCancelled = false;
        cleanupHandlers = build();
    };
    window.addEventListener("resize", onResize);

    return function destroy() {
        isCancelled = true;
        cleanupHandlers();
        themeObserver.disconnect();
        window.removeEventListener("resize", onResize);
    };
}
