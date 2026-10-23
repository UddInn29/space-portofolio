import * as THREE from "three";

/* =========================================
   SPACE PORTFOLIO — PLANET 3D
   BAGIAN 1: SCENE, TEKSTUR, PLANET, CAHAYA
========================================= */

const container = document.querySelector("#planet-canvas");

if (container) {
    initPlanet();
} else {
    console.warn(
        "Elemen #planet-canvas tidak ditemukan. Periksa index.html."
    );
}

function initPlanet() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        42,
        1,
        0.1,
        100
    );

    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    /* =========================================
       1. TEKSTUR PLANET
    ========================================= */

    function createPlanetTexture() {
        const canvas = document.createElement("canvas");

        canvas.width = 1024;
        canvas.height = 512;

        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        const gradient = ctx.createLinearGradient(
            0, 0, 1024, 512
        );

        gradient.addColorStop(0, "#13204c");
        gradient.addColorStop(0.25, "#2877d0");
        gradient.addColorStop(0.5, "#5946aa");
        gradient.addColorStop(0.75, "#2359ad");
        gradient.addColorStop(1, "#10152f");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Awan biru dan ungu
        for (let i = 0; i < 220; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = 15 + Math.random() * 45;

            const cloud = ctx.createRadialGradient(
                x, y, 1,
                x, y, radius
            );

            cloud.addColorStop(
                0,
                i % 2 === 0
                    ? "rgba(160, 210, 255, 0.32)"
                    : "rgba(185, 130, 255, 0.27)"
            );

            cloud.addColorStop(
                1,
                "rgba(20, 40, 100, 0)"
            );

            ctx.fillStyle = cloud;

            ctx.fillRect(
                x - radius,
                y - radius,
                radius * 2,
                radius * 2
            );
        }

        // Garis atmosfer pada tekstur
        for (let i = 0; i < 42; i++) {
            const y = i * 12 + Math.sin(i * 0.4) * 8;

            ctx.beginPath();
            ctx.moveTo(0, y);

            ctx.bezierCurveTo(
                250, y - 12,
                700, y + 18,
                1024, y - 4
            );

            ctx.strokeStyle =
                `rgba(210, 225, 255, ${
                    0.025 + (i % 4) * 0.008
                })`;

            ctx.lineWidth = 2 + (i % 3);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);

        texture.colorSpace = THREE.SRGBColorSpace;

        texture.anisotropy = Math.min(
            renderer.capabilities.getMaxAnisotropy(),
            4
        );

        return texture;
    }

    /* =========================================
       2. PLANET UTAMA
    ========================================= */

    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetTexture = createPlanetTexture();

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(1.32, 80, 80),

        new THREE.MeshStandardMaterial({
            map: planetTexture || undefined,
            color: planetTexture ? 0xffffff : 0x386fd0,
            roughness: 0.88,
            metalness: 0.02
        })
    );

    planetGroup.add(planet);

    /* =========================================
       3. ATMOSFER PLANET
    ========================================= */

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.37, 64, 64),

        new THREE.MeshBasicMaterial({
            color: 0x5b8cff,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );

    planetGroup.add(atmosphere);

    /* =========================================
       4. PENCAHAYAAN
    ========================================= */

    scene.add(
        new THREE.AmbientLight(0x8798ff, 1)
    );

    const keyLight = new THREE.DirectionalLight(
        0x9bd5ff,
        3.1
    );

    keyLight.position.set(-3, 2.5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(
        0xa64dff,
        11,
        10
    );

    rimLight.position.set(2, -1, 2);
    scene.add(rimLight);

    /* =========================================
       5. CINCIN PLANET 3D
    ========================================= */

    const ringGroup = new THREE.Group();
    planetGroup.add(ringGroup);

    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x9baaff,
        emissive: 0x252b78,
        emissiveIntensity: 0.55,
        metalness: 0.2,
        roughness: 0.4
    });

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
            1.78,
            0.055,
            12,
            220
        ),
        ringMaterial
    );

    ring.rotation.x = 1.18;
    ring.rotation.y = -0.12;

    ringGroup.add(ring);

    // Cincin luar yang lebih tipis dan bercahaya
    const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(
            1.91,
            0.012,
            8,
            220
        ),
        new THREE.MeshBasicMaterial({
            color: 0x83baff,
            transparent: true,
            opacity: 0.7
        })
    );

    outerRing.rotation.copy(ring.rotation);
    ringGroup.add(outerRing);


    /* =========================================
       6. BINTANG 3D
    ========================================= */

    function createStarField(
        count,
        spread,
        depth,
        size,
        color
    ) {
        const positions = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                -depth - Math.random() * depth
            );
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3
            )
        );

        const material = new THREE.PointsMaterial({
            color,
            size,
            transparent: true,
            opacity: 0.72,
            sizeAttenuation: true,
            depthWrite: false
        });

        const stars = new THREE.Points(
            geometry,
            material
        );

        scene.add(stars);

        return stars;
    }

    const distantStars = createStarField(
        420,
        17,
        10,
        0.025,
        0xc7d8ff
    );

    const nearStars = createStarField(
        90,
        14,
        7,
        0.04,
        0x8bbaff
    );


    /* =========================================
       7. RESPONSIVE CANVAS
    ========================================= */

    function resizePlanet() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height, false);
    }

    const resizeObserver = new ResizeObserver(
        resizePlanet
    );

    resizeObserver.observe(container);
    resizePlanet();


    /* =========================================
       8. KONTROL MOUSE DAN SENTUHAN
    ========================================= */

    let dragging = false;

    let previousX = 0;
    let previousY = 0;

    container.addEventListener(
        "pointerdown",
        (event) => {
            // Abaikan klik tombol mouse selain tombol kiri
            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            dragging = true;

            previousX = event.clientX;
            previousY = event.clientY;

            if (container.setPointerCapture) {
                container.setPointerCapture(
                    event.pointerId
                );
            }
        }
    );

    container.addEventListener(
        "pointermove",
        (event) => {
            if (!dragging) return;

            const dx = event.clientX - previousX;
            const dy = event.clientY - previousY;

            planetGroup.rotation.y += dx * 0.006;
            planetGroup.rotation.x += dy * 0.003;

            // Batasi kemiringan agar planet mudah dikendalikan
            planetGroup.rotation.x =
                THREE.MathUtils.clamp(
                    planetGroup.rotation.x,
                    -0.65,
                    0.65
                );

            previousX = event.clientX;
            previousY = event.clientY;
        }
    );

    function stopDragging() {
        dragging = false;
    }

    container.addEventListener(
        "pointerup",
        stopDragging
    );

    container.addEventListener(
        "pointercancel",
        stopDragging
    );

    container.addEventListener(
        "lostpointercapture",
        stopDragging
    );

    /* =========================================
       9. ANIMASI PLANET
    ========================================= */

    const clock = new THREE.Clock();

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId = 0;
    let disposed = false;

    function animate() {
        animationFrameId = 0;

        if (disposed || document.hidden) return;

        const delta = Math.min(
            clock.getDelta(),
            0.05
        );

        if (!prefersReducedMotion) {
            // Rotasi planet otomatis
            if (!dragging) {
                planetGroup.rotation.y += delta * 0.10;
            }

            // Gerakan cincin dan bintang
            ringGroup.rotation.z += delta * 0.012;

            distantStars.rotation.y += delta * 0.002;
            nearStars.rotation.y -= delta * 0.004;
        }

        renderer.render(scene, camera);

        animationFrameId =
            requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (
            disposed ||
            document.hidden ||
            animationFrameId
        ) {
            return;
        }

        // Hindari lonjakan delta setelah tab kembali aktif
        clock.getDelta();

        animationFrameId =
            requestAnimationFrame(animate);
    }

    function pauseAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            pauseAnimation();
        } else {
            startAnimation();
        }
    }

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    startAnimation();


    /* =========================================
       10. PEMBERSIHAN RESOURCE
    ========================================= */

    window.addEventListener(
        "beforeunload",
        () => {
            disposed = true;

            pauseAnimation();
            resizeObserver.disconnect();

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            planet.geometry.dispose();
            atmosphere.geometry.dispose();
            ring.geometry.dispose();
            outerRing.geometry.dispose();

            planet.material.dispose();
            atmosphere.material.dispose();
            ring.material.dispose();
            outerRing.material.dispose();

            if (planetTexture) {
                planetTexture.dispose();
            }

            distantStars.geometry.dispose();
            distantStars.material.dispose();

            nearStars.geometry.dispose();
            nearStars.material.dispose();

            renderer.dispose();
            renderer.domElement.remove();
        },
        { once: true }
    );
}


/* =========================================
   11. SCROLL REVEAL
   Disesuaikan dengan index.html kamu
========================================= */

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (
    !reduceMotion &&
    "IntersectionObserver" in window
) {
    const revealTargets = document.querySelectorAll(
        [
            ".content-section > .section-kicker",
            ".content-section > h2",
            ".content-section > .section-copy",
            ".content-section > .about-layout",
            ".content-section > .project-grid",
            ".content-section > .journey-timeline",
            ".content-section > .values-layout",
            ".content-section > .dreams-panel",
            ".content-section > .social-links",
            ".project-grid > .project-card",
            ".journey-timeline > .journey-item"
        ].join(", ")
    );

    revealTargets.forEach((element) => {
        element.classList.add("reveal-on-scroll");
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const element = entry.target;

                const siblings = element.parentElement
                    ? Array.from(
                        element.parentElement.children
                    )
                    : [];

                const siblingIndex = Math.max(
                    0,
                    siblings.indexOf(element)
                );

                const delay = Math.min(
                    siblingIndex * 70,
                    280
                );

                element.style.setProperty(
                    "--reveal-delay",
                    `${delay}ms`
                );

                element.classList.add("is-visible");

                observer.unobserve(element);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    revealTargets.forEach((element) => {
        revealObserver.observe(element);
    });
}