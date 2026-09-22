# Asset provenance

Generated with the built-in imagegen tool, September 22, 2026.

## Item prompt template

Create a single game item PNG asset: SUBJECT. Stylized polished 3D clay toy, simple recognizable silhouette for children 7+, rounded bevels, soft studio lighting, three-quarter isometric view, centered with generous margins, genuinely transparent background. No text, no watermark, no character. Consistent gentle pastel blue turquoise lavender orange palette. Save as item_ID.png if possible.

Subjects:
- cube: a rounded blue toy cube
- crystal: a faceted purple crystal
- crate: a small warm orange wooden shipping crate
- battery: a mint green energy battery with a lightning symbol
- wheel: a dark blue rubber wheel with lavender metal hub
- lamp: a yellow glowing light bulb in a lavender socket
- chip: a teal microchip
- robot_part: a blue and lavender mechanical joint module, not a character

## Background prompt template

Use case: stylized-concept. Create bg_ID.png, a wide landscape background for a friendly children's browser game order workshop. Very minimal pastel futuristic workshop, pale off-white lavender background, soft 3D clay rendering, tiny architectural shelf details only at far edges, huge empty center 85% for interface overlay. No characters, no text, no logo, no objects in center, elegant calm light palette, extremely subtle low contrast.

IDs: start, game, finish. For finish, add: A few small gold and lavender celebratory confetti pieces around the borders.

UI PNGs are generated from native SVG geometry using scripts/prepare-assets.mjs. MP3s are synthesized and encoded locally by that same script.
