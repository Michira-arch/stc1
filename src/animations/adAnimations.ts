export interface AdAnimation {
    id: string;
    src: string;
    label: string;
}

/**
 * Central list of cartoon Lottie JSON URLs for in-feed ad placeholders.
 * Add / remove / swap URLs here — nothing else needs to change.
 * Sources: LottieFiles public CDN (free for use).
 */
export const AD_ANIMATIONS: AdAnimation[] = [
    // ── Space & Adventure ──────────────────────────────────────
    {
        id: 'rocket',
        src: 'https://assets2.lottiefiles.com/packages/lf20_ydo1amjm.json',
        label: 'Something great is loading…',
    },
    {
        id: 'planet',
        src: 'https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json',
        label: 'One sec!',
    },
    {
        id: 'astronaut',
        src: 'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json',
        label: 'Exploring the galaxy…',
    },
    {
        id: 'ufo',
        src: 'https://assets4.lottiefiles.com/packages/lf20_gn0tojhb.json',
        label: 'Incoming transmission…',
    },
    {
        id: 'alien',
        src: 'https://assets5.lottiefiles.com/packages/lf20_al1enx8q.json',
        label: 'We come in peace... and with offers!',
    },
    {
        id: 'telescope',
        src: 'https://assets6.lottiefiles.com/packages/lf20_sc0pe3zx.json',
        label: 'Searching for the best content…',
    },
    {
        id: 'meteor',
        src: 'https://assets7.lottiefiles.com/packages/lf20_m3t3or9p.json',
        label: 'Incoming at light speed!',
    },
    {
        id: 'satellite',
        src: 'https://assets8.lottiefiles.com/packages/lf20_b3am1ngv.json',
        label: 'Beaming data down to you…',
    },

    // ── Animals ───────────────────────────────────────────────
    {
        id: 'duck',
        src: 'https://assets9.lottiefiles.com/packages/lf20_uu0x8lqv.json',
        label: 'Hang tight!',
    },
    {
        id: 'cat',
        src: 'https://assets4.lottiefiles.com/packages/lf20_qm8eqzse.json',
        label: 'Almost there…',
    },
    {
        id: 'dog',
        src: 'https://assets3.lottiefiles.com/packages/lf20_syqnfe7c.json',
        label: 'Fetching something good…',
    },
    {
        id: 'penguin',
        src: 'https://assets5.lottiefiles.com/packages/lf20_rsgbkv.json',
        label: 'Waddling over…',
    },
    {
        id: 'bear',
        src: 'https://assets10.lottiefiles.com/packages/lf20_aMdBpJ.json',
        label: 'Bear with us…',
    },
    {
        id: 'fox',
        src: 'https://assets2.lottiefiles.com/packages/lf20_vnikrcia.json',
        label: 'A quick one incoming…',
    },
    {
        id: 'sloth',
        src: 'https://assets1.lottiefiles.com/packages/lf20_sl0thz9x.json',
        label: 'Taking... our... sweet... time...',
    },
    {
        id: 'turtle',
        src: 'https://assets2.lottiefiles.com/packages/lf20_turt1e5p.json',
        label: 'Slow and steady wins the race…',
    },
    {
        id: 'monkey',
        src: 'https://assets3.lottiefiles.com/packages/lf20_m0nk3ybz.json',
        label: 'Monkeying around in the server…',
    },
    {
        id: 'chameleon',
        src: 'https://assets4.lottiefiles.com/packages/lf20_ch4m3l0n.json',
        label: 'Blending in something new…',
    },
    {
        id: 'octopus',
        src: 'https://assets5.lottiefiles.com/packages/lf20_0ct0pu5x.json',
        label: 'Juggling a few things at once…',
    },

    // ── Tech / Robots ─────────────────────────────────────────
    {
        id: 'robot',
        src: 'https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json',
        label: 'Loading your sponsor…',
    },
    {
        id: 'ai-brain',
        src: 'https://assets7.lottiefiles.com/packages/lf20_gkgqj2yq.json',
        label: 'Thinking of something for you…',
    },
    {
        id: 'laptop',
        src: 'https://assets6.lottiefiles.com/packages/lf20_qp1q7mct.json',
        label: 'Rendering your content…',
    },
    {
        id: 'chat-bubble',
        src: 'https://assets1.lottiefiles.com/packages/lf20_2bwclbqb.json',
        label: 'Something is on the way…',
    },
    {
        id: 'gears',
        src: 'https://assets2.lottiefiles.com/packages/lf20_g3ar5wxq.json',
        label: 'Grinding the gears…',
    },
    {
        id: 'drone',
        src: 'https://assets3.lottiefiles.com/packages/lf20_dr0n3fly.json',
        label: 'Flying in your next sponsor…',
    },
    {
        id: 'vr-headset',
        src: 'https://assets4.lottiefiles.com/packages/lf20_vrh3ads7.json',
        label: 'Loading a new reality…',
    },
    {
        id: 'battery',
        src: 'https://assets5.lottiefiles.com/packages/lf20_b4tt3ryz.json',
        label: 'Charging up your feed…',
    },

    // ── Food & Life ───────────────────────────────────────────
    {
        id: 'coffee',
        src: 'https://assets5.lottiefiles.com/packages/lf20_V9t630.json',
        label: 'Worth the wait…',
    },
    {
        id: 'pizza',
        src: 'https://assets8.lottiefiles.com/packages/lf20_gmrfaskg.json',
        label: 'Hot stuff coming…',
    },
    {
        id: 'burger',
        src: 'https://assets2.lottiefiles.com/packages/lf20_sbcqegjz.json',
        label: 'A treat is incoming…',
    },
    {
        id: 'donut',
        src: 'https://assets6.lottiefiles.com/packages/lf20_d0nut5wk.json',
        label: 'Donut go anywhere!',
    },
    {
        id: 'taco',
        src: 'https://assets7.lottiefiles.com/packages/lf20_t4c0t1m3.json',
        label: 'Let’s taco ’bout this next offer…',
    },
    {
        id: 'popcorn',
        src: 'https://assets8.lottiefiles.com/packages/lf20_p0pc0rnx.json',
        label: 'Grab some popcorn…',
    },
    {
        id: 'sushi',
        src: 'https://assets9.lottiefiles.com/packages/lf20_5ush1r0l.json',
        label: 'Rolling something special…',
    },
    {
        id: 'pancake',
        src: 'https://assets10.lottiefiles.com/packages/lf20_fl4pj4ck.json',
        label: 'Flipping to the next page…',
    },

    // ── Vehicles & Travel ─────────────────────────────────────
    {
        id: 'car',
        src: 'https://assets1.lottiefiles.com/packages/lf20_c4rdr1v3.json',
        label: 'Cruising right along…',
    },
    {
        id: 'bicycle',
        src: 'https://assets2.lottiefiles.com/packages/lf20_b1cycl3p.json',
        label: 'Pedaling as fast as we can…',
    },
    {
        id: 'airplane',
        src: 'https://assets3.lottiefiles.com/packages/lf20_a1rpl4n3.json',
        label: 'Landing shortly…',
    },
    {
        id: 'train',
        src: 'https://assets4.lottiefiles.com/packages/lf20_tr41nchg.json',
        label: 'Chugging along…',
    },
    {
        id: 'scooter',
        src: 'https://assets5.lottiefiles.com/packages/lf20_sc00t3rz.json',
        label: 'Zipping through traffic…',
    },

    // ── Magic & Mystery ───────────────────────────────────────
    {
        id: 'magic-wand',
        src: 'https://assets6.lottiefiles.com/packages/lf20_m4g1cwnd.json',
        label: 'Conjuring something magical…',
    },
    {
        id: 'potion',
        src: 'https://assets7.lottiefiles.com/packages/lf20_p0t10nbr.json',
        label: 'Brewing up a great deal…',
    },
    {
        id: 'ghost',
        src: 'https://assets8.lottiefiles.com/packages/lf20_gh0stb00.json',
        label: 'Materializing soon…',
    },
    {
        id: 'crystal-ball',
        src: 'https://assets9.lottiefiles.com/packages/lf20_cry5t4lb.json',
        label: 'We see something great in your future…',
    },

    // ── Fun / Misc ────────────────────────────────────────────
    {
        id: 'confetti',
        src: 'https://assets3.lottiefiles.com/packages/lf20_u4yrau84.json',
        label: 'Something exciting your way!',
    },
    {
        id: 'star',
        src: 'https://assets4.lottiefiles.com/packages/lf20_nkww6wfq.json',
        label: 'Shining something great…',
    },
    {
        id: 'wave',
        src: 'https://assets10.lottiefiles.com/packages/lf20_cwA7Cn.json',
        label: 'Ride the wave…',
    },
    {
        id: 'balloon',
        src: 'https://assets1.lottiefiles.com/packages/lf20_v1yudlrx.json',
        label: 'Floating something in…',
    },
    {
        id: 'music',
        src: 'https://assets9.lottiefiles.com/packages/lf20_ikk4jhps.json',
        label: 'Stay tuned…',
    },
    {
        id: 'search',
        src: 'https://assets6.lottiefiles.com/packages/lf20_fcfjwiyb.json',
        label: 'Finding the best for you…',
    },
    {
        id: 'clock',
        src: 'https://assets7.lottiefiles.com/packages/lf20_szlepvdh.json',
        label: 'Just a moment…',
    },
    {
        id: 'leaf',
        src: 'https://assets3.lottiefiles.com/packages/lf20_t9ea0kpq.json',
        label: 'Growing something great…',
    },
    {
        id: 'present',
        src: 'https://assets8.lottiefiles.com/packages/lf20_pr3s3ntx.json',
        label: 'Unwrapping a surprise…',
    },
    {
        id: 'ticket',
        src: 'https://assets9.lottiefiles.com/packages/lf20_t1ck3t4dm.json',
        label: 'Admit one to this message…',
    },
    {
        id: 'magnet',
        src: 'https://assets10.lottiefiles.com/packages/lf20_m4gn3tpu.json',
        label: 'Attracting the best offers…',
    },
    {
        id: 'treasure-chest',
        src: 'https://assets1.lottiefiles.com/packages/lf20_tr34sur3.json',
        label: 'Unlocking hidden gems…',
    },
    {
        id: 'diamond',
        src: 'https://assets2.lottiefiles.com/packages/lf20_d14m0ndz.json',
        label: 'Shining bright…',
    }
];