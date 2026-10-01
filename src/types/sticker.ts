/**
 * types/sticker.ts
 * Definisi tipe stiker, koordinat relatif, dan katalog stiker/emoji bawaan.
 */

export interface StickerItem {
  id: string
  type: 'emoji' | 'svg' | 'custom'
  content: string // Karakter emoji atau raw SVG / dataURL
  x: number // Posisi tengah X relatif terhadap lebar canvas (0..1)
  y: number // Posisi tengah Y relatif terhadap tinggi canvas (0..1)
  scale: number // Skala relatif (1.0 = ukuran standar)
  rotation: number // Sudut rotasi dalam derajat (0..360)
  size: number // Base size dalam pixel relatif terhadap lebar (misal 0.15 dari canvas width)
}

export interface StickerCatalogItem {
  id: string
  type: 'emoji' | 'svg'
  label: string
  content: string
  preview: string // Karakter emoji atau svg snippet
}

// ── KATALOG EMOJI POPULER PHOTOBOOTH (30+ Pilihan) ──────
export const EMOJI_STICKERS: StickerCatalogItem[] = [
  { id: 'e-sparkles', type: 'emoji', label: 'Sparkles', content: '✨', preview: '✨' },
  { id: 'e-heart-pink', type: 'emoji', label: 'Pink Heart', content: '💖', preview: '💖' },
  { id: 'e-ribbon', type: 'emoji', label: 'Bow Ribbon', content: '🎀', preview: '🎀' },
  { id: 'e-sunglasses', type: 'emoji', label: 'Cool Glasses', content: '🕶️', preview: '🕶️' },
  { id: 'e-crown', type: 'emoji', label: 'Crown', content: '👑', preview: '👑' },
  { id: 'e-party', type: 'emoji', label: 'Party', content: '🥳', preview: '🥳' },
  { id: 'e-cat-heart', type: 'emoji', label: 'Cat Heart', content: '😻', preview: '😻' },
  { id: 'e-cherry-blossom', type: 'emoji', label: 'Blossom', content: '🌸', preview: '🌸' },
  { id: 'e-cherries', type: 'emoji', label: 'Cherries', content: '🍒', preview: '🍒' },
  { id: 'e-strawberry', type: 'emoji', label: 'Strawberry', content: '🍓', preview: '🍓' },
  { id: 'e-teddy', type: 'emoji', label: 'Teddy Bear', content: '🧸', preview: '🧸' },
  { id: 'e-camera', type: 'emoji', label: 'Camera', content: '📸', preview: '📸' },
  { id: 'e-white-heart', type: 'emoji', label: 'White Heart', content: '🤍', preview: '🤍' },
  { id: 'e-fire', type: 'emoji', label: 'Fire', content: '🔥', preview: '🔥' },
  { id: 'e-star', type: 'emoji', label: 'Glowing Star', content: '⭐', preview: '⭐' },
  { id: 'e-unicorn', type: 'emoji', label: 'Unicorn', content: '🦄', preview: '🦄' },
  { id: 'e-kiss', type: 'emoji', label: 'Kiss Mark', content: '💋', preview: '💋' },
  { id: 'e-balloon', type: 'emoji', label: 'Balloon', content: '🎈', preview: '🎈' },
  { id: 'e-cake', type: 'emoji', label: 'Birthday Cake', content: '🎂', preview: '🎂' },
  { id: 'e-peace', type: 'emoji', label: 'Peace Sign', content: '✌️', preview: '✌️' },
  { id: 'e-bunny', type: 'emoji', label: 'Cute Bunny', content: '🐰', preview: '🐰' },
  { id: 'e-dog', type: 'emoji', label: 'Puppy', content: '🐶', preview: '🐶' },
  { id: 'e-rainbow', type: 'emoji', label: 'Rainbow', content: '🌈', preview: '🌈' },
  { id: 'e-dizzy', type: 'emoji', label: 'Dizzy Star', content: '💫', preview: '💫' },
  { id: 'e-lollipop', type: 'emoji', label: 'Lollipop', content: '🍭', preview: '🍭' },
  { id: 'e-butterfly', type: 'emoji', label: 'Butterfly', content: '🦋', preview: '🦋' },
  { id: 'e-diamond', type: 'emoji', label: 'Diamond', content: '💎', preview: '💎' },
  { id: 'e-letter', type: 'emoji', label: 'Love Letter', content: '💌', preview: '💌' },
  { id: 'e-tada', type: 'emoji', label: 'Confetti', content: '🎉', preview: '🎉' },
  { id: 'e-devil', type: 'emoji', label: 'Cute Devil', content: '😈', preview: '😈' },
  { id: 'e-angel', type: 'emoji', label: 'Angel Smile', content: '😇', preview: '😇' },
  { id: 'e-ghost', type: 'emoji', label: 'Cute Ghost', content: '👻', preview: '👻' },
]

// ── KATALOG STIKER SVG DESAIN PHOTOBOOTH (Termasuk Edisi Retro 8-Bit Pixel Game) ───
export const SVG_STICKERS: StickerCatalogItem[] = [
  // ── RETRO 8-BIT PIXEL GAME EDITION ──
  {
    id: 'svg-pixel-invader',
    type: 'svg',
    label: 'Pixel Space Invader',
    preview: '👾',
    content: `<svg viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="
        M20 0h10v10H20V0zm60 0h10v10H80V0zm-50 10h10v10H30V10zm40 0h10v10H70V10z
        M20 20h70v10H20V20zm-10 10h20v10H10V30zm30 0h30v10H40V30zm40 0h20v10H80V30z
        M0 40h110v10H0V40zm0 10h10v20H0V50zm20 0h10v10H20V50zm60 0h10v10H80V50zm20 0h10v20h-10V50z
        M10 70h10v10H10V70zm20 0h10v10H30V70zm50 0h10v10H80V70zm20 0h10v10h-10V70z
      " fill="#00FF66"/>
      <!-- Pixel Eye Spots -->
      <rect x="20" y="30" width="10" height="10" fill="#090A12"/>
      <rect x="80" y="30" width="10" height="10" fill="#090A12"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-mushroom',
    type: 'svg',
    label: '8-Bit Power Mushroom',
    preview: '🍄',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Black Outline -->
      <path d="M30 10h40v10h20v20h10v30H90v10H80v10H20V80H10V70H0V40h10V20h20V10z" fill="#000000"/>
      <!-- Red Cap -->
      <path d="M30 20h40v10h20v20h-10V40H70V30H30v10H20v10H10V40h10V30h10V20z" fill="#FF0055"/>
      <rect x="30" y="40" width="40" height="20" fill="#FF0055"/>
      <!-- White Spots -->
      <rect x="40" y="20" width="20" height="20" fill="#FFFFFF"/>
      <rect x="10" y="40" width="20" height="20" fill="#FFFFFF"/>
      <rect x="70" y="40" width="20" height="20" fill="#FFFFFF"/>
      <!-- Skin Face -->
      <rect x="20" y="60" width="60" height="20" fill="#FFE4C4"/>
      <!-- Eyes -->
      <rect x="30" y="60" width="10" height="20" fill="#000000"/>
      <rect x="60" y="60" width="10" height="20" fill="#000000"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-heart',
    type: 'svg',
    label: '8-Bit RPG Heart',
    preview: '💖',
    content: `<svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Black Pixel Outline -->
      <path d="M20 0h20v10h20V0h20v10h10v20h10v30H90v10H80v10H70v10H30V80H20V70H10V60H0V30h10V10h10V0z" fill="#000000"/>
      <!-- Red Inner -->
      <path d="M20 10h20v10h20V10h20v20h10v30H80v10H70v10H30V70H20V60H10V30h10V10z" fill="#FF0055"/>
      <!-- Highlight -->
      <rect x="20" y="20" width="10" height="10" fill="#FFFFFF"/>
      <rect x="30" y="20" width="10" height="20" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-star',
    type: 'svg',
    label: '8-Bit Invincible Star',
    preview: '⭐',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pixel Outline -->
      <path d="M40 0h20v10h10v10h10v10h20v20H90v10H80v10H70v30H50V80H30v20H10V70H0V60h10V40h20V30h10V20h10V0h-10z" fill="#000000"/>
      <!-- Gold Yellow Fill -->
      <path d="M40 10h20v10h10v10h20v20H80v10H70v20H50V70H30v20H20V60H10V40h20V30h10V10z" fill="#FFE600"/>
      <!-- Star Eyes -->
      <rect x="40" y="30" width="6" height="20" fill="#000000"/>
      <rect x="54" y="30" width="6" height="20" fill="#000000"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-controller',
    type: 'svg',
    label: '8-Bit GamePad',
    preview: '🎮',
    content: `<svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Console Body -->
      <rect x="10" y="10" width="100" height="50" rx="4" fill="#1E2238" stroke="#00FF66" stroke-width="3"/>
      <!-- D-Pad -->
      <rect x="22" y="26" width="20" height="6" fill="#00F0FF"/>
      <rect x="29" y="19" width="6" height="20" fill="#00F0FF"/>
      <!-- Action Buttons A/B -->
      <circle cx="82" cy="34" r="5" fill="#FF007F"/>
      <circle cx="95" cy="25" r="5" fill="#FFE600"/>
      <!-- Select/Start -->
      <rect x="52" y="44" width="7" height="3" fill="#FFFFFF"/>
      <rect x="62" y="44" width="7" height="3" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-coin',
    type: 'svg',
    label: '8-Bit Coin +100',
    preview: '🪙',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outline -->
      <path d="M30 10h40v10h20v20h10v20H90v20H70v10H30V90H10V70H0V50h10V30h20V10z" fill="#000000"/>
      <!-- Coin Gold -->
      <path d="M30 20h40v10h20v40H70v10H30V70H10V30h20V20z" fill="#FFD700"/>
      <rect x="40" y="30" width="20" height="40" fill="#FFA500"/>
      <rect x="45" y="35" width="10" height="30" fill="#FFF8DC"/>
      <text x="50" y="10" font-family="'Press Start 2P', monospace" font-size="10" fill="#00FF66" text-anchor="middle">+100</text>
    </svg>`,
  },
  {
    id: 'svg-pixel-cat',
    type: 'svg',
    label: 'Kawaii Pixel Neko',
    preview: '🐱',
    content: `<svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pixel Outline -->
      <path d="M10 20h20v10h40V20h20v40H80v20H20V60H10V20z" fill="#000000"/>
      <!-- Cat White Face -->
      <path d="M20 30h60v30H20V30z" fill="#FFFFFF"/>
      <!-- Calico Orange Patch -->
      <rect x="20" y="20" width="10" height="20" fill="#FB923C"/>
      <rect x="30" y="20" width="10" height="10" fill="#FB923C"/>
      <!-- Pink Ears Inside -->
      <rect x="20" y="30" width="10" height="10" fill="#FDA4AF"/>
      <rect x="70" y="30" width="10" height="10" fill="#FDA4AF"/>
      <!-- Black Pixel Eyes -->
      <rect x="30" y="45" width="8" height="8" fill="#000000"/>
      <rect x="62" y="45" width="8" height="8" fill="#000000"/>
      <!-- Cute Pink Blush -->
      <rect x="22" y="55" width="12" height="6" fill="#FB7185"/>
      <rect x="66" y="55" width="12" height="6" fill="#FB7185"/>
      <!-- Nose / Mouth -->
      <rect x="48" y="52" width="4" height="4" fill="#F43F5E"/>
      <!-- Whiskers -->
      <rect x="12" y="50" width="8" height="2" fill="#000000"/>
      <rect x="80" y="50" width="8" height="2" fill="#000000"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-boba',
    type: 'svg',
    label: 'Pixel Boba Tea',
    preview: '🧋',
    content: `<svg viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Straw -->
      <rect x="52" y="4" width="8" height="30" fill="#A855F7" stroke="#000000" stroke-width="2"/>
      <!-- Cup Outline -->
      <path d="M20 25h50v60H60v10H30V85H20V25z" fill="#000000"/>
      <!-- Milk Tea Fill -->
      <path d="M24 30h42v52H56v8H34v-8H24V30z" fill="#FDE68A"/>
      <!-- Cup Lid -->
      <rect x="16" y="22" width="58" height="8" rx="2" fill="#F472B6" stroke="#000000" stroke-width="2"/>
      <!-- Smiling Face -->
      <rect x="36" y="50" width="4" height="6" fill="#000000"/>
      <rect x="50" y="50" width="4" height="6" fill="#000000"/>
      <rect x="42" y="56" width="6" height="3" fill="#000000"/>
      <!-- Boba Pearls -->
      <circle cx="32" cy="74" r="4" fill="#3B1C0B"/>
      <circle cx="44" cy="76" r="4" fill="#3B1C0B"/>
      <circle cx="56" cy="74" r="4" fill="#3B1C0B"/>
      <circle cx="38" cy="82" r="4" fill="#3B1C0B"/>
      <circle cx="50" cy="82" r="4" fill="#3B1C0B"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-cake',
    type: 'svg',
    label: 'Pixel Strawberry Cake',
    preview: '🍰',
    content: `<svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Strawberry Top -->
      <rect x="46" y="10" width="10" height="12" fill="#EF4444" stroke="#000000" stroke-width="2"/>
      <rect x="48" y="6" width="6" height="4" fill="#22C55E"/>
      <!-- Whipped Cream -->
      <path d="M20 26h60v12H20V26z" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
      <!-- Sponge Layer 1 -->
      <rect x="20" y="38" width="60" height="14" fill="#FDE047" stroke="#000000" stroke-width="2"/>
      <!-- Strawberry Cream Center -->
      <rect x="20" y="52" width="60" height="10" fill="#F472B6" stroke="#000000" stroke-width="2"/>
      <!-- Sponge Layer 2 -->
      <rect x="20" y="62" width="60" height="14" fill="#FDE047" stroke="#000000" stroke-width="2"/>
      <!-- Cake Base Plate -->
      <rect x="12" y="76" width="76" height="6" rx="2" fill="#CBD5E1" stroke="#000000" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-frog',
    type: 'svg',
    label: 'Pixel Froggy',
    preview: '🐸',
    content: `<svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outline -->
      <path d="M15 15h20v10h30V15h20v45H80v10H20V60H15V15z" fill="#000000"/>
      <!-- Green Body -->
      <path d="M20 20h15v10h30V20h15v35H75v10H25V55H20V20z" fill="#4ADE80"/>
      <!-- Big Cute Eyes -->
      <rect x="24" y="24" width="8" height="10" fill="#000000"/>
      <rect x="68" y="24" width="8" height="10" fill="#000000"/>
      <rect x="26" y="26" width="3" height="3" fill="#FFFFFF"/>
      <rect x="70" y="26" width="3" height="3" fill="#FFFFFF"/>
      <!-- Cheeks -->
      <rect x="20" y="42" width="10" height="5" fill="#FB7185"/>
      <rect x="70" y="42" width="10" height="5" fill="#FB7185"/>
      <!-- Smile -->
      <rect x="42" y="45" width="16" height="3" fill="#000000"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-duck',
    type: 'svg',
    label: 'Pixel Cool Duck',
    preview: '🦆',
    content: `<svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outline -->
      <path d="M30 10h40v30h10v20H90v20H30V70H15V50h15V10z" fill="#000000"/>
      <!-- Yellow Duck -->
      <path d="M35 15h30v30h10v15H85v15H35V65H20V55h15V15z" fill="#FACC15"/>
      <!-- Cool Pixel Sunglasses -->
      <rect x="40" y="28" width="35" height="10" fill="#000000"/>
      <rect x="42" y="30" width="8" height="6" fill="#38BDF8"/>
      <rect x="58" y="30" width="8" height="6" fill="#38BDF8"/>
      <!-- Orange Beak -->
      <rect x="70" y="40" width="18" height="8" fill="#F97316" stroke="#000000" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-sakura',
    type: 'svg',
    label: 'Pixel Sakura Blossom',
    preview: '🌸',
    content: `<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outline -->
      <path d="M35 5h20v20h20v20H55v20H35V45H15V25h20V5z" fill="#000000"/>
      <!-- Pink Petals -->
      <rect x="38" y="8" width="14" height="20" fill="#F472B6"/>
      <rect x="38" y="62" width="14" height="20" fill="#F472B6"/>
      <rect x="8" y="38" width="20" height="14" fill="#F472B6"/>
      <rect x="62" y="38" width="20" height="14" fill="#F472B6"/>
      <!-- Center Yellow Pollen -->
      <rect x="38" y="38" width="14" height="14" fill="#FDE047"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-rainbow',
    type: 'svg',
    label: 'Pixel Rainbow & Clouds',
    preview: '🌈',
    content: `<svg viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Rainbow Arcs -->
      <path d="M15 50 C15 15 95 15 95 50" stroke="#EF4444" stroke-width="6" fill="none"/>
      <path d="M21 50 C21 21 89 21 89 50" stroke="#F59E0B" stroke-width="6" fill="none"/>
      <path d="M27 50 C27 27 83 27 83 50" stroke="#10B981" stroke-width="6" fill="none"/>
      <path d="M33 50 C33 33 77 33 77 50" stroke="#3B82F6" stroke-width="6" fill="none"/>
      <!-- Left Cloud -->
      <rect x="8" y="44" width="22" height="14" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
      <!-- Right Cloud -->
      <rect x="80" y="44" width="22" height="14" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-loveletter',
    type: 'svg',
    label: 'Pixel Love Note',
    preview: '💌',
    content: `<svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- White Envelope -->
      <rect x="10" y="15" width="80" height="50" rx="3" fill="#F8FAFC" stroke="#000000" stroke-width="3"/>
      <path d="M10 15 L50 45 L90 15" stroke="#000000" stroke-width="2"/>
      <!-- Red Pixel Heart Seal -->
      <rect x="44" y="38" width="12" height="12" fill="#EF4444"/>
      <rect x="46" y="50" width="8" height="4" fill="#EF4444"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-sword',
    type: 'svg',
    label: '8-Bit Quest Sword',
    preview: '⚔️',
    content: `<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Blade -->
      <path d="M70 10 L80 20 L40 60 L30 50 Z" fill="#00F0FF" stroke="#000000" stroke-width="2"/>
      <path d="M72 12 L78 18 L42 54 L36 48 Z" fill="#FFFFFF"/>
      <!-- Crossguard -->
      <rect x="25" y="48" width="22" height="6" transform="rotate(-45 25 48)" fill="#FFE600" stroke="#000000" stroke-width="1.5"/>
      <!-- Hilt -->
      <rect x="18" y="62" width="6" height="14" transform="rotate(-45 18 62)" fill="#8B4513" stroke="#000000" stroke-width="1.5"/>
      <circle cx="10" cy="80" r="4" fill="#FFE600"/>
    </svg>`,
  },
  {
    id: 'svg-pixel-bubble',
    type: 'svg',
    label: 'RPG Dialogue Bubble',
    preview: '💬',
    content: `<svg viewBox="0 0 130 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="120" height="48" fill="#090A12" stroke="#00FF66" stroke-width="3"/>
      <path d="M25 53 L35 53 L20 63 Z" fill="#090A12"/>
      <path d="M20 63 L35 53" stroke="#00FF66" stroke-width="3"/>
      <text x="65" y="32" font-family="'Press Start 2P', monospace" font-size="9" fill="#00FF66" text-anchor="middle">PRESS START</text>
    </svg>`,
  },


  // ── KATALOG STIKER KLASIK ──
  {
    id: 'svg-y2k-star',
    type: 'svg',
    label: 'Y2K Star',
    preview: '✦',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="3"/>
      <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'svg-heart-glasses',
    type: 'svg',
    label: 'Heart Shades',
    preview: '👓',
    content: `<svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 70 C10 40 10 15 35 15 C45 15 50 25 50 25 C50 25 55 15 65 15 C90 15 90 40 60 70 Z" fill="#FB7185" fill-opacity="0.85" stroke="#E11D48" stroke-width="4"/>
      <path d="M110 70 C80 40 80 15 105 15 C115 15 120 25 120 25 C120 25 125 15 135 15 C160 15 160 40 130 70 Z" fill="#FB7185" fill-opacity="0.85" stroke="#E11D48" stroke-width="4"/>
      <path d="M50 25 C65 20 85 20 100 25" stroke="#E11D48" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 25 L5 20" stroke="#E11D48" stroke-width="4" stroke-linecap="round"/>
      <path d="M135 25 L145 20" stroke="#E11D48" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'svg-bunny-ears',
    type: 'svg',
    label: 'Bunny Ears',
    preview: '🐰',
    content: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 95 C15 70 20 10 38 10 C50 10 50 60 45 95 Z" fill="#FFFFFF" stroke="#F43F5E" stroke-width="3"/>
      <path d="M35 85 C25 65 28 20 38 20 C44 20 44 55 41 85 Z" fill="#FDA4AF"/>
      <path d="M85 95 C105 70 100 10 82 10 C70 10 70 60 75 95 Z" fill="#FFFFFF" stroke="#F43F5E" stroke-width="3"/>
      <path d="M85 85 C95 65 92 20 82 20 C76 20 76 55 79 85 Z" fill="#FDA4AF"/>
    </svg>`,
  },
  {
    id: 'svg-angel-wings',
    type: 'svg',
    label: 'Angel Halo',
    preview: '😇',
    content: `<svg viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="70" cy="25" rx="50" ry="14" fill="none" stroke="#FBBF24" stroke-width="6"/>
      <ellipse cx="70" cy="25" rx="46" ry="11" fill="none" stroke="#FEF08A" stroke-width="3"/>
      <path d="M70 5 L75 15 L70 20 L65 15 Z" fill="#FFF"/>
    </svg>`,
  },
  {
    id: 'svg-love-badge',
    type: 'svg',
    label: 'Love Stamp',
    preview: '❤️',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#E11D48" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="6 3"/>
      <path d="M50 75 C30 55 20 40 30 28 C37 20 48 24 50 32 C52 24 63 20 70 28 C80 40 70 55 50 75 Z" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'svg-besties-stamp',
    type: 'svg',
    label: 'Besties Tag',
    preview: '👯',
    content: `<svg viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="130" height="50" rx="15" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="4"/>
      <text x="70" y="38" font-family="'Outfit', sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">BESTIES ✨</text>
    </svg>`,
  },
  {
    id: 'svg-photobooth-cam',
    type: 'svg',
    label: 'Retro Cam',
    preview: '📷',
    content: `<svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="25" width="80" height="55" rx="12" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
      <rect x="30" y="15" width="40" height="15" rx="4" fill="#1D4ED8"/>
      <circle cx="50" cy="52" r="18" fill="#1E293B" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="50" cy="52" r="10" fill="#60A5FA"/>
      <circle cx="54" cy="48" r="3" fill="#FFFFFF"/>
      <circle cx="78" cy="36" r="4" fill="#EF4444"/>
    </svg>`,
  },
  {
    id: 'svg-kawaii-blush',
    type: 'svg',
    label: 'Kawaii Blush',
    preview: '☺️',
    content: `<svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="20" rx="18" ry="10" fill="#FB7185" fill-opacity="0.75"/>
      <line x1="16" y1="14" x2="22" y2="26" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="25" y1="14" x2="31" y2="26" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="95" cy="20" rx="18" ry="10" fill="#FB7185" fill-opacity="0.75"/>
      <line x1="86" y1="14" x2="92" y2="26" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="95" y1="14" x2="101" y2="26" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'svg-sparkle-cluster',
    type: 'svg',
    label: 'Sparkle Cluster',
    preview: '💫',
    content: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 10 C40 25 50 35 65 35 C50 35 40 45 40 60 C40 45 30 35 15 35 C30 35 40 25 40 10 Z" fill="#F472B6"/>
      <path d="M75 50 C75 60 82 66 92 66 C82 66 75 72 75 82 C75 72 68 66 58 66 C68 66 75 60 75 50 Z" fill="#60A5FA"/>
      <circle cx="30" cy="75" r="5" fill="#FDE047"/>
      <circle cx="70" cy="20" r="4" fill="#A78BFA"/>
    </svg>`,
  },
  {
    id: 'svg-vip-crown',
    type: 'svg',
    label: 'Golden Crown',
    preview: '👑',
    content: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 70 L20 25 L45 50 L60 15 L75 50 L100 25 L110 70 Z" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
      <circle cx="20" cy="22" r="5" fill="#EF4444"/>
      <circle cx="60" cy="12" r="6" fill="#3B82F6"/>
      <circle cx="100" cy="22" r="5" fill="#10B981"/>
      <rect x="15" y="62" width="90" height="8" rx="3" fill="#FEF3C7"/>
    </svg>`,
  },
]


