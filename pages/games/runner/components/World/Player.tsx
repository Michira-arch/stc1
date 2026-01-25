/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';
import { audio } from '../System/Audio';

// Physics Constants
const GRAVITY = 50;
const JUMP_FORCE = 16; // Results in ~2.56 height (v^2 / 2g)

// Static Geometries
const TORSO_GEO = new THREE.CylinderGeometry(0.25, 0.15, 0.6, 4);
const JETPACK_GEO = new THREE.BoxGeometry(0.3, 0.4, 0.15);
const GLOW_STRIP_GEO = new THREE.PlaneGeometry(0.05, 0.2);
const HEAD_GEO = new THREE.BoxGeometry(0.25, 0.3, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.12, 0.6, 0.12);
const JOINT_SPHERE_GEO = new THREE.SphereGeometry(0.07);
const HIPS_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.2);
const LEG_GEO = new THREE.BoxGeometry(0.15, 0.7, 0.15);
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);

export const Player: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const shadowRef = useRef<THREE.Mesh>(null);

    // Limb Refs for Animation
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);

    const { status, laneCount, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive } = useStore();

    const [lane, setLane] = React.useState(0);
    const targetX = useRef(0);

    // Physics State (using Refs for immediate logic updates)
    const isJumping = useRef(false);
    const velocityY = useRef(0);
    const jumpsPerformed = useRef(0);
    const spinRotation = useRef(0); // For double jump flip

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const swipeConsumed = useRef(false);

    const isInvincible = useRef(false);
    const lastDamageTime = useRef(0);

    // Memoized Materials
    const { armorMaterial, jointMaterial, glowMaterial, shadowMaterial } = useMemo(() => {
        const armorColor = isImmortalityActive ? '#fde047' : '#10b981'; // Yellow for immortal, Emerald for normal
        const glowColor = isImmortalityActive ? '#ffffff' : '#6ee7b7'; // White for immortal, Mint for normal

        return {
            armorMaterial: new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.3, metalness: 0.8 }),
            jointMaterial: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.7, metalness: 0.5 }),
            glowMaterial: new THREE.MeshBasicMaterial({ color: glowColor }),
            shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.3, transparent: true })
        };
    }, [isImmortalityActive]); // Only recreate if immortality state changes (for color shift)

    // --- Reset State on Game Start ---
    useEffect(() => {
        if (status === GameStatus.PLAYING) {
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
            spinRotation.current = 0;
            if (groupRef.current) groupRef.current.position.y = 0;
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }
    }, [status]);

    // Safety: Clamp lane if laneCount changes (e.g. restart)
    useEffect(() => {
        const maxLane = Math.floor(laneCount / 2);
        if (Math.abs(lane) > maxLane) {
            setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
        }
    }, [laneCount, lane]);

    // --- Controls (Keyboard & Touch) ---
    const triggerJump = () => {
        const maxJumps = hasDoubleJump ? 2 : 1;

        if (!isJumping.current) {
            // First Jump
            audio.playJump(false);
            isJumping.current = true;
            jumpsPerformed.current = 1;
            velocityY.current = JUMP_FORCE;
        } else if (jumpsPerformed.current < maxJumps) {
            // Double Jump (Mid-air)
            audio.playJump(true);
            jumpsPerformed.current += 1;
            velocityY.current = JUMP_FORCE; // Reset velocity upwards
            spinRotation.current = 0; // Start flip
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== GameStatus.PLAYING) return;
            const maxLane = Math.floor(laneCount / 2);

            if (e.key === 'ArrowLeft') setLane(l => Math.max(l - 1, -maxLane));
            else if (e.key === 'ArrowRight') setLane(l => Math.min(l + 1, maxLane));
            else if (e.key === 'ArrowUp' || e.key === 'w') triggerJump();
            else if (e.key === ' ' || e.key === 'Enter') {
                activateImmortality();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, laneCount, hasDoubleJump, activateImmortality]);

    // Realtime Touch Controls
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            swipeConsumed.current = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (status !== GameStatus.PLAYING || swipeConsumed.current) return;

            const deltaX = e.touches[0].clientX - touchStartX.current;
            const deltaY = e.touches[0].clientY - touchStartY.current;
            const maxLane = Math.floor(laneCount / 2);

            // Lower threshold for "Instant" feel
            const SWIPE_THRESHOLD = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal
                if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
                    if (deltaX > 0) setLane(l => Math.min(l + 1, maxLane));
                    else setLane(l => Math.max(l - 1, -maxLane));

                    swipeConsumed.current = true;
                }
            } else {
                // Vertical (Jump only for now)
                if (deltaY < -SWIPE_THRESHOLD) {
                    triggerJump();
                    swipeConsumed.current = true;
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (status !== GameStatus.PLAYING) return;

            // Only trigger tap if swipe wasn't consumed
            if (!swipeConsumed.current) {
                const deltaX = e.changedTouches[0].clientX - touchStartX.current;
                const deltaY = e.changedTouches[0].clientY - touchStartY.current;

                // Very small movement counts as tap
                if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                    activateImmortality();
                }
            }
        };

        // Use non-passive listener for preventDefault if needed, but here we just listen
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [status, laneCount, hasDoubleJump, activateImmortality]);

    // Gyro Controls
    useEffect(() => {
        const { gyroEnabled } = useStore.getState(); // Access directly to avoid dependency loops if needed, or just use hook value
        if (!gyroEnabled || status !== GameStatus.PLAYING) return;

        const handleOrientation = (e: DeviceOrientationEvent) => {
            const tilt = e.gamma; // Left/Right tilt in degrees
            if (!tilt) return;

            const maxLane = Math.floor(laneCount / 2);
            const THRESHOLD = 15; // Degrees to tilt to switch lane

            // Simple state machine for tilt could be better, but direct mapping is fine for now
            // if tilt < -THRESHOLD -> Move Left
            // if tilt > THRESHOLD -> Move Right
            // But we need to avoid rapid switching. Let's use a "cool down" or "return to center" logic?
            // Actually, let's just map ranges to lanes relative to center if possible?
            // No, lanes are distinct steps.

            // Let's stick to "Tilt to steer" logic similar to swipe
            // We use a ref to track if we've already "acted" on this specific tilt directions to avoid rapid fire
            // This requires storing "lastTiltAction" state.

            // Implementing simple "Continuous steering" style:

            if (tilt > THRESHOLD) {
                // Tilted Right
                if (!swipeConsumed.current) { // Re-using swipeConsumed as "input consumed" flag
                    setLane(l => Math.min(l + 1, maxLane));
                    swipeConsumed.current = true;
                    setTimeout(() => { swipeConsumed.current = false; }, 400); // 400ms cooldown for next lane switch
                }
            } else if (tilt < -THRESHOLD) {
                // Tilted Left
                if (!swipeConsumed.current) {
                    setLane(l => Math.max(l - 1, -maxLane));
                    swipeConsumed.current = true;
                    setTimeout(() => { swipeConsumed.current = false; }, 400);
                }
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [status, laneCount, useStore().gyroEnabled]); // We need to re-bind if gyroEnabled changes

    // --- Animation Loop ---
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

        // 1. Horizontal Position
        targetX.current = lane * LANE_WIDTH;
        groupRef.current.position.x = THREE.MathUtils.lerp(
            groupRef.current.position.x,
            targetX.current,
            delta * 15
        );

        // 2. Physics (Jump)
        if (isJumping.current) {
            // Apply Velocity
            groupRef.current.position.y += velocityY.current * delta;
            // Apply Gravity
            velocityY.current -= GRAVITY * delta;

            // Floor Collision
            if (groupRef.current.position.y <= 0) {
                groupRef.current.position.y = 0;
                isJumping.current = false;
                jumpsPerformed.current = 0;
                velocityY.current = 0;
                // Reset flip
                if (bodyRef.current) bodyRef.current.rotation.x = 0;
            }

            // Double Jump Flip
            if (jumpsPerformed.current === 2 && bodyRef.current) {
                // Rotate 360 degrees quickly
                spinRotation.current -= delta * 15;
                if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
                bodyRef.current.rotation.x = spinRotation.current;
            }
        }

        // Banking Rotation
        const xDiff = targetX.current - groupRef.current.position.x;
        groupRef.current.rotation.z = -xDiff * 0.2;
        groupRef.current.rotation.x = isJumping.current ? 0.1 : 0.05;

        // 3. Skeletal Animation
        const time = state.clock.elapsedTime * 25;

        if (!isJumping.current) {
            // Running Cycle
            if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.7;
            if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.7;
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 1.0;

            if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time)) * 0.1;
        } else {
            // Jumping Pose
            const jumpPoseSpeed = delta * 10;
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
            if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
            if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.5, jumpPoseSpeed);
            if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.5, jumpPoseSpeed);

            // Only reset Y if not flipping (handled by flip logic mostly, but safe here)
            if (bodyRef.current && jumpsPerformed.current !== 2) bodyRef.current.position.y = 1.1;
        }

        // 4. Dynamic Shadow
        if (shadowRef.current) {
            const height = groupRef.current.position.y;
            const scale = Math.max(0.2, 1 - (height / 2.5) * 0.5); // 2.5 is max jump height approx
            const runStretch = isJumping.current ? 1 : 1 + Math.abs(Math.sin(time)) * 0.3;

            shadowRef.current.scale.set(scale, scale, scale * runStretch);
            const material = shadowRef.current.material as THREE.MeshBasicMaterial;
            if (material && !Array.isArray(material)) {
                material.opacity = Math.max(0.1, 0.3 - (height / 2.5) * 0.2);
            }
        }

        // Invincibility / Immortality Effect
        const showFlicker = isInvincible.current || isImmortalityActive;
        if (showFlicker) {
            if (isInvincible.current) {
                if (Date.now() - lastDamageTime.current > 1500) {
                    isInvincible.current = false;
                    groupRef.current.visible = true;
                } else {
                    groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
                }
            }
            if (isImmortalityActive) {
                groupRef.current.visible = true;
            }
        } else {
            groupRef.current.visible = true;
        }
    });

    // Damage Handler
    useEffect(() => {
        const checkHit = (e: any) => {
            if (isInvincible.current || isImmortalityActive) return;
            audio.playDamage(); // Play damage sound
            takeDamage();
            isInvincible.current = true;
            lastDamageTime.current = Date.now();
        };
        window.addEventListener('player-hit', checkHit);
        return () => window.removeEventListener('player-hit', checkHit);
    }, [takeDamage, isImmortalityActive]);

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <group ref={bodyRef} position={[0, 1.1, 0]}>

                {/* Torso */}
                <mesh castShadow position={[0, 0.2, 0]} geometry={TORSO_GEO} material={armorMaterial} />

                {/* Jetpack */}
                <mesh position={[0, 0.2, -0.2]} geometry={JETPACK_GEO} material={jointMaterial} />
                <mesh position={[-0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
                <mesh position={[0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />

                {/* Head */}
                <group ref={headRef} position={[0, 0.6, 0]}>
                    <mesh castShadow geometry={HEAD_GEO} material={armorMaterial} />
                </group>

                {/* Arms */}
                <group position={[0.32, 0.4, 0]}>
                    <group ref={rightArmRef}>
                        <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                        <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
                    </group>
                </group>
                <group position={[-0.32, 0.4, 0]}>
                    <group ref={leftArmRef}>
                        <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                        <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
                    </group>
                </group>

                {/* Hips */}
                <mesh position={[0, -0.15, 0]} geometry={HIPS_GEO} material={jointMaterial} />

                {/* Legs */}
                <group position={[0.12, -0.25, 0]}>
                    <group ref={rightLegRef}>
                        <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
                    </group>
                </group>
                <group position={[-0.12, -0.25, 0]}>
                    <group ref={leftLegRef}>
                        <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
                    </group>
                </group>
            </group>

            <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
        </group>
    );
};