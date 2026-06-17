document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside (optional but recommended)
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && mainNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }

    // --- Conic Gradient Canvas Animation ---
    const canvas = document.getElementById('canvas-conic');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const buffer = document.createElement('canvas');
    const bCtx = buffer.getContext('2d');
    
    let width, height;
    let time = 0;

    // A simple, stable pseudo-random number generator (0.0 to 1.0) 
    // We use this so random values don't flicker every single frame.
    const hash = (n) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;

    function resize() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        buffer.width = width * dpr;
        buffer.height = height * dpr;
        
        ctx.scale(dpr, dpr);
        bCtx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        // 1. MASSIVELY SLOWED DOWN: 
        // A much smaller time increment for a hypnotic, slow-breathing pace.
        time += 0.0006; 

        ctx.clearRect(0, 0, width, height);
        bCtx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        
        // Increased max radius to ensure it fully engulfs wide desktop screens
        const maxRadius = Math.max(width, height) * 1.8; 

        // ===================================================================
        // STEP A: Shape the Randomized Fuzzy Toroidal Volumes
        // ===================================================================
        bCtx.globalCompositeOperation = 'source-over';
        
        const numRings = 8; // Increased for more "warps" and richer volumetric overlaps
        
        for (let i = 0; i < numRings; i++) {
            // Raw progress calculates total distance traveled over infinite time
            let rawProgress = time + (i / numRings);
            // Modulo 1 gives us the 0.0 -> 1.0 loop for the current screen cycle
            let progress = rawProgress % 1;
            
            // waveId uniquely identifies this specific ring during its current lifespan.
            // When it loops back to 0, waveId increments, generating new random traits!
            let waveId = Math.floor(rawProgress); 
            
            // Generate stable random traits for this specific ring
            let randomThickBonus = hash(waveId) * 300; // Adds up to 300px extra thickness
            let driftX = (hash(waveId + 1) - 0.5) * (width * 0.5); // Spawns up to 25% off-center horizontally
            let driftY = (hash(waveId + 2) - 0.5) * (height * 0.4); // Spawns up to 20% off-center vertically
            
            let spawnX = cx + driftX;
            let spawnY = cy + driftY;

            // The expanding major radius
            let r = progress * maxRadius;
            
            // Thickness incorporates our random bonus, ensuring some rings are fatter than others
            let thickness = 180 + randomThickBonus + (r * 0.35); 

            let innerR = Math.max(20, r - thickness / 2);
            let outerR = r + thickness / 2;

            // Opacity fade in/out for seamless infinite looping
            let alpha = 1.0;
            if (progress < 0.15) alpha = progress / 0.15; // Slow fade in at spawn point
            if (progress > 0.8) alpha = 1.0 - ((progress - 0.8) / 0.2); // Fade out as it leaves screen

            // Draw the fuzzy cross-section anchored to its randomized spawn point
            let radGrad = bCtx.createRadialGradient(spawnX, spawnY, innerR, spawnX, spawnY, outerR);
            radGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            radGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`); 
            radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            bCtx.fillStyle = radGrad;
            bCtx.beginPath();
            bCtx.arc(spawnX, spawnY, outerR, 0, Math.PI * 2);
            bCtx.fill();
        }

        // ===================================================================
        // STEP B: Map the Color Flow
        // ===================================================================
        bCtx.globalCompositeOperation = 'source-in';
        
        // We anchor the color gradient to the true center so the rings move 
        // through the colors dynamically as they drift off-center.
        const conicAngle = time * 2; 
        const surfaceGrad = bCtx.createConicGradient(conicAngle, cx, height * -0.5);
        
        const pink = '#F598FF';
        const deepPink = '#E879FF'; // Slightly more saturated pink
        const offWhite = '#FFF5FA';
        
        surfaceGrad.addColorStop(0, pink);
        surfaceGrad.addColorStop(0.15, deepPink);
        surfaceGrad.addColorStop(0.3, pink);
        surfaceGrad.addColorStop(0.5, deepPink);
        surfaceGrad.addColorStop(0.65, pink);
        surfaceGrad.addColorStop(0.85, offWhite); // Reduced white to a smaller "shimmer" window
        surfaceGrad.addColorStop(1, pink);

        bCtx.fillStyle = surfaceGrad;
        bCtx.fillRect(0, 0, width, height);

        // ===================================================================
        // STEP C: Render to Main Canvas with Expanded Horizontal Warp
        // ===================================================================
        ctx.fillStyle = '#FCF8FC';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(cx, cy);
        
        // Super slow ambient breathing wobble
        ctx.rotate(Math.sin(time * 0.2) * 0.03); 
        
        // Ensure the animation covers the entire height by using a scale >= 1.0
        // We use 1.1 to provide a small "bleed" margin to account for the rotation/wobble.
        ctx.scale(1.6, 1.1); 
        
        ctx.translate(-cx, -cy);
        ctx.drawImage(buffer, 0, 0, width, height);
        ctx.restore();

        requestAnimationFrame(draw);
    }

    draw();
}
});