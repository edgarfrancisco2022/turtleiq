import sharp from 'sharp'

// Library icon SVG paths (from Lucide), scaled to fill a 1024x1024 canvas
// with a teal-700 (#0f766e) background and white icon
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#0f766e"/>

  <!-- Library icon: original 24x24 viewBox, scaled to ~580px and centered -->
  <!-- scale = 580/24 = 24.17, offset = (1024-580)/2 = 222 -->
  <g transform="translate(222, 222) scale(24.17)"
     stroke="white"
     stroke-width="1.75"
     stroke-linecap="round"
     stroke-linejoin="round"
     fill="none">
    <path d="m16 6 4 14"/>
    <path d="M12 6v14"/>
    <path d="M8 8v12"/>
    <path d="M4 4v16"/>
  </g>
</svg>
`

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/app-icon-1024.png')

console.log('Icon generated at public/app-icon-1024.png')
