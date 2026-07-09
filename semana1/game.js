// Three.js Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 0, 500);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Game State
const gameState = {
    playerHealth: 100,
    playerMaxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    enemyHealth: 100,
    enemyMaxHealth: 100,
    playerScore: 0,
    enemyScore: 0,
    gameOver: false,
    playerWon: false,
    roundActive: true,
};

// Player Controller
const player = {
    position: new THREE.Vector3(0, 2, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.2,
    jumpForce: 0.4,
    yaw: 0,
    pitch: 0,
    isGrounded: true,
};

function getRandomSpawnPosition() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 30;
    return new THREE.Vector3(
        Math.cos(angle) * distance,
        2,
        Math.sin(angle) * distance
    );
}

function respawnPlayers() {
    // Check if anyone has won
    if (gameState.playerScore >= 3) {
        showGameOver('GAME OVER\nYou Win: 3 Kills!', true);
        return;
    } else if (gameState.enemyScore >= 3) {
        showGameOver('GAME OVER\nYou Lose: Enemy Wins', false);
        return;
    }
    
    gameState.roundActive = true;
    gameState.playerHealth = gameState.playerMaxHealth;
    gameState.enemyHealth = gameState.enemyMaxHealth;
    gameState.ammo = gameState.maxAmmo;
    
    player.position.copy(getRandomSpawnPosition());
    enemy.position.copy(getRandomSpawnPosition());
    
    player.velocity.set(0, 0, 0);
    enemyState.velocity.set(0, 0, 0);
}

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r') {
        gameState.ammo = gameState.maxAmmo;
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse Look
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', (e) => {
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    player.yaw -= deltaX * 0.005;
    player.pitch -= deltaY * 0.005;
    player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.pitch));
});

// Lock pointer on click
document.addEventListener('click', () => {
    document.body.requestPointerLock?.();
});

// Arena Floor
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a4e });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Arena Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a3e });
const walls = [];
const wallPositions = [
    { x: 0, z: -100, w: 200, h: 100 },
    { x: 0, z: 100, w: 200, h: 100 },
    { x: -100, z: 0, w: 200, h: 100 },
    { x: 100, z: 0, w: 200, h: 100 },
];

wallPositions.forEach((pos) => {
    const wallGeometry = new THREE.PlaneGeometry(pos.w, pos.h);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(pos.x, pos.h / 2, pos.z);
    if (pos.z !== 0) wall.rotation.y = Math.PI / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    walls.push(wall);
});

// Cover Objects (Crates)
const cratePositions = [
    { x: -30, z: -30 },
    { x: 30, z: -30 },
    { x: -30, z: 30 },
    { x: 30, z: 30 },
    { x: 0, z: -50 },
    { x: 0, z: 50 },
    { x: -50, z: 0 },
    { x: 50, z: 0 },
];

cratePositions.forEach((pos) => {
    const crateGeometry = new THREE.BoxGeometry(3, 3, 3);
    const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(pos.x, 1.5, pos.z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    scene.add(crate);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x505070, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
scene.add(directionalLight);

// Player Geometry (First-person hands)
const handGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.6);
const handMaterial = new THREE.MeshStandardMaterial({ color: 0xccaa88 });
const leftHand = new THREE.Mesh(handGeometry, handMaterial);
leftHand.position.set(-0.4, -0.5, -0.8);
leftHand.castShadow = true;

const rightHand = new THREE.Mesh(handGeometry, handMaterial);
rightHand.position.set(0.4, -0.5, -0.8);
rightHand.castShadow = true;

const gunGeometry = new THREE.BoxGeometry(0.15, 0.15, 1);
const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const gun = new THREE.Mesh(gunGeometry, gunMaterial);
gun.position.set(0.3, -0.3, -1.5);
gun.castShadow = true;

const gunGroup = new THREE.Group();
gunGroup.add(leftHand);
gunGroup.add(rightHand);
gunGroup.add(gun);
camera.add(gunGroup);
scene.add(camera);

// Enemy
const enemyGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
enemy.position.copy(getRandomSpawnPosition());
enemy.castShadow = true;
enemy.receiveShadow = true;
scene.add(enemy);

const enemyState = {
    position: enemy.position.clone(),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.12,
    shootCooldown: 0,
    shootInterval: 60,
};

// Projectiles
const projectiles = [];
const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 });

function shoot() {
    if (gameState.ammo <= 0 || gameState.gameOver) return;

    gameState.ammo--;

    const bulletSpeed = 1;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(camera.position).add(direction.clone().multiplyScalar(1));
    bullet.castShadow = true;
    scene.add(bullet);

    projectiles.push({
        mesh: bullet,
        position: bullet.position.clone(),
        velocity: direction.multiplyScalar(bulletSpeed),
        life: 200,
        isPlayerBullet: true,
    });
}

function enemyShoot() {
    if (gameState.gameOver) return;

    const direction = new THREE.Vector3();
    camera.position.sub(enemy.position, direction).normalize();
    direction.y += 0.1; // Slight upward aim

    const bullet = new THREE.Mesh(bulletGeometry, new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff6600 }));
    bullet.position.copy(enemy.position).add(direction.clone().multiplyScalar(0.8));
    bullet.castShadow = true;
    scene.add(bullet);

    projectiles.push({
        mesh: bullet,
        position: bullet.position.clone(),
        velocity: direction.multiplyScalar(0.7),
        life: 200,
        isPlayerBullet: false,
    });
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        e.preventDefault();
        shoot();
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Player Movement
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    if (keys['arrowup'] || keys['w']) {
        player.velocity.add(forward.multiplyScalar(player.speed));
    }
    if (keys['arrowdown'] || keys['s']) {
        player.velocity.add(forward.multiplyScalar(-player.speed));
    }
    if (keys['arrowright'] || keys['d']) {
        player.velocity.add(right.multiplyScalar(player.speed));
    }
    if (keys['arrowleft'] || keys['a']) {
        player.velocity.add(right.multiplyScalar(-player.speed));
    }

    // Jumping
    if ((keys[' '] || keys['spacebar']) && player.isGrounded) {
        player.velocity.y = player.jumpForce;
        player.isGrounded = false;
    }

    // Gravity
    player.velocity.y -= 0.01;

    // Update Player Position
    player.position.add(player.velocity);
    player.velocity.multiplyScalar(0.9);

    // Boundary Check
    const maxDistance = 95;
    if (Math.sqrt(player.position.x ** 2 + player.position.z ** 2) > maxDistance) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * maxDistance;
        player.position.z = Math.sin(angle) * maxDistance;
    }

    // Ground Check
    if (player.position.y <= 2) {
        player.position.y = 2;
        player.velocity.y = 0;
        player.isGrounded = true;
    }

    camera.position.copy(player.position);

    // Update Camera Rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // Enemy AI
    const dirToPlayer = new THREE.Vector3().subVectors(camera.position, enemy.position);
    const distanceToPlayer = dirToPlayer.length();
    dirToPlayer.normalize();

    // Move towards player
    enemy.position.add(dirToPlayer.clone().multiplyScalar(enemyState.speed));

    // Boundary Check for Enemy
    if (Math.sqrt(enemy.position.x ** 2 + enemy.position.z ** 2) > maxDistance) {
        const angle = Math.atan2(enemy.position.z, enemy.position.x);
        enemy.position.x = Math.cos(angle) * maxDistance;
        enemy.position.z = Math.sin(angle) * maxDistance;
    }

    // Enemy Shooting
    enemyState.shootCooldown--;
    if (enemyState.shootCooldown <= 0 && distanceToPlayer < 80) {
        enemyShoot();
        enemyState.shootCooldown = enemyState.shootInterval;
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.position.add(proj.velocity);
        proj.mesh.position.copy(proj.position);
        proj.life--;

        // Check collision with player
        if (proj.isPlayerBullet === false && proj.position.distanceTo(camera.position) < 2) {
            gameState.playerHealth -= 10;
            scene.remove(proj.mesh);
            projectiles.splice(i, 1);
            showDamageFlash();
            continue;
        }

        // Check collision with enemy
        if (proj.isPlayerBullet === true && proj.position.distanceTo(enemy.position) < 1.5) {
            gameState.enemyHealth -= 25;
            scene.remove(proj.mesh);
            projectiles.splice(i, 1);
            continue;
        }

        // Remove if out of bounds or expired
        if (proj.life <= 0 || proj.position.distanceTo(camera.position) > 300) {
            scene.remove(proj.mesh);
            projectiles.splice(i, 1);
        }
    }

    // Update HUD
    document.getElementById('healthValue').textContent = Math.max(0, gameState.playerHealth);
    document.getElementById('enemyHealthValue').textContent = Math.max(0, gameState.enemyHealth);
    document.getElementById('ammoValue').textContent = gameState.ammo;
    document.getElementById('playerScoreValue').textContent = gameState.playerScore;
    document.getElementById('enemyScoreValue').textContent = gameState.enemyScore;

    // Game Over Check - Handle Respawn
    if (gameState.playerHealth <= 0 && gameState.roundActive) {
        gameState.roundActive = false;
        gameState.enemyScore++;
        setTimeout(respawnPlayers, 2000);
    } else if (gameState.enemyHealth <= 0 && gameState.roundActive) {
        gameState.roundActive = false;
        gameState.playerScore++;
        setTimeout(respawnPlayers, 2000);
    }

    renderer.render(scene, camera);
}

function showDamageFlash() {
    const flash = document.getElementById('damageFlash');
    flash.style.display = 'block';
    setTimeout(() => {
        flash.style.display = 'none';
    }, 100);
}

function showGameOver(message, playerWon) {
    const gameOverDiv = document.getElementById('gameOver');
    gameOverDiv.textContent = message;
    gameOverDiv.style.display = 'block';
    gameOverDiv.style.color = playerWon ? '#0f0' : '#f00';
    gameState.gameOver = true;
    gameState.playerWon = playerWon;
    gameState.roundActive = false;
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
