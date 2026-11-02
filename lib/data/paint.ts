// Contenu de Paint : palette et pense-bête dessiné par Bernard le 3 février
// 2025, le jour du changement de mot de passe (il cherchait comment taper
// un dièse, cf. l'historique du navigateur).

export const PAINT_PALETTE = [
  "#000000", "#7f7f7f", "#ffffff", "#c3c3c3", "#880015", "#ed1c24", "#ff7f27", "#fff200",
  "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#b97a57", "#ffaec9", "#99d9ea", "#c8bfe7",
];

export const PAINT_CLUE = {
  text: "Pense-bête dans Paint : sur le clavier, le dièse (#) se tape avec AltGr + 3",
};

/** Dessine le pense-bête "pense-bete.png" sur le canevas */
export function drawPenseBete(c: CanvasRenderingContext2D, width: number, height: number) {
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, width, height);

  // Post-it
  c.save();
  c.translate(110, 70);
  c.rotate(-0.04);
  c.fillStyle = "#fff59d";
  c.shadowColor = "rgba(0,0,0,0.2)";
  c.shadowBlur = 12;
  c.shadowOffsetY = 6;
  c.fillRect(0, 0, 420, 380);
  c.restore();

  c.fillStyle = "#1e3a8a";
  c.font = "italic 30px 'Comic Sans MS', 'Segoe Print', cursive";
  c.fillText("Pense-bête — 03/02", 145, 125);
  c.font = "26px 'Comic Sans MS', 'Segoe Print', cursive";
  c.fillText("Le dièse # sur ce clavier :", 140, 185);
  c.fillText("AltGr  +  3", 205, 235);
  c.font = "22px 'Comic Sans MS', 'Segoe Print', cursive";
  c.fillText("(pas Maj + 3 !!)", 175, 280);
  c.fillStyle = "#b91c1c";
  c.fillText("Ne PAS écrire le mot", 155, 345);
  c.fillText("de passe ici !", 190, 378);

  // Touche "3 / #" entourée
  const kx = 600;
  const ky = 170;
  c.fillStyle = "#e5e7eb";
  c.strokeStyle = "#6b7280";
  c.lineWidth = 3;
  roundRect(c, kx, ky, 150, 150, 18);
  c.fill();
  c.stroke();
  c.fillStyle = "#111827";
  c.font = "bold 44px Arial, sans-serif";
  c.fillText("3", kx + 20, ky + 60);
  c.fillText("#", kx + 92, ky + 128);
  c.font = "22px Arial, sans-serif";
  c.fillText("\"", kx + 100, ky + 52);
  c.strokeStyle = "#dc2626";
  c.lineWidth = 5;
  c.beginPath();
  c.ellipse(kx + 112, ky + 112, 42, 38, 0, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(kx + 70, ky + 210);
  c.lineTo(kx + 105, ky + 160);
  c.stroke();
  c.fillStyle = "#dc2626";
  c.font = "italic 24px 'Comic Sans MS', 'Segoe Print', cursive";
  c.fillText("celui-là !", kx + 20, ky + 240);
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
