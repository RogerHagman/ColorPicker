document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('color-picker');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const colorStyleButtons = {
        analogous: document.getElementById("analogous-button"),
        triadic: document.getElementById("triadic-button")
    };
    let currentColorStyle = "analogous";

    // Draw the color wheel on the canvas
    drawColorWheel();

    // Event listeners for color style buttons
    Object.keys(colorStyleButtons).forEach(style => {
        colorStyleButtons[style].addEventListener("click", () => {
            currentColorStyle = style;
            highlightSelectedButton(style);
            alignColors();
        });
    });

    function highlightSelectedButton(selectedStyle) {
        Object.keys(colorStyleButtons).forEach(style => {
            if (style === selectedStyle) {
                colorStyleButtons[style].classList.add("selected-button");
            } else {
                colorStyleButtons[style].classList.remove("selected-button");
            }
        });
    }

    // Function to draw the color wheel using fillRect
    function drawColorWheel() {
        for (let y = -radius; y < radius; y++) {
            for (let x = -radius; x < radius; x++) {
                const theta = Math.atan2(y, x);
                const distance = Math.sqrt(x * x + y * y);

                if (distance <= radius) {
                    const hue = (theta + Math.PI) / (2 * Math.PI) * 360;
                    const saturation = distance / radius * 100;
                    const value = 100; // Fixed at maximum brightness

                    const [r, g, b] = hsvToRgb(hue, saturation, value);

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(x + radius, y + radius, 1, 1);
                }
            }
        }
    }

    function pickColor(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - radius;
        const y = event.clientY - rect.top - radius;
        const distance = Math.sqrt(x * x + y * y);

        if (distance > radius) {
            // Outside the circle
            return;
        }

        const theta = Math.atan2(y, x);
        const hue = (theta + Math.PI) / (2 * Math.PI) * 360;
        const saturation = distance / radius * 100;
        const value = 100; // Fixed at maximum brightness

        const rgb = hsvToRgb(hue, saturation, value);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

        // Update middle swatch
        document.getElementById('color-hex-2').textContent = hex;
        document.getElementById('color-indicator-2').style.backgroundColor = hex;

        alignColors(hue);
    }

    function alignColors(baseHue) {
        const middleColorHex = document.getElementById('color-hex-2').textContent;
        const [r, g, b] = hexToRgb(middleColorHex);
        const hsv = rgbToHsv(r, g, b);
        const baseHueValue = baseHue || hsv[0];

       // Calculate related hues based on current color style
        let relatedHues;
        if (currentColorStyle === "analogous") {
            relatedHues = [(baseHueValue + 30) % 360, (baseHueValue - 30 + 360) % 360];
        } else if (currentColorStyle === "triadic") {
            relatedHues = [(baseHueValue + 120) % 360, (baseHueValue + 240) % 360];
        /*TODO
        Complementary and Split-Complementary
        */
        }

        // Update left and right swatches
        const rgbRelated1 = hsvToRgb(relatedHues[0], hsv[1], hsv[2]);
        const rgbRelated2 = hsvToRgb(relatedHues[1], hsv[1], hsv[2]);
        const hexRelated1 = rgbToHex(...rgbRelated1);
        const hexRelated2 = rgbToHex(...rgbRelated2);

        document.getElementById('color-hex-1').textContent = hexRelated1;
        document.getElementById('color-indicator-1').style.backgroundColor = hexRelated1;
        document.getElementById('color-hex-3').textContent = hexRelated2;
        document.getElementById('color-indicator-3').style.backgroundColor = hexRelated2;
    }

    // Utility functions
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function hsvToRgb(h, s, v) {
        h = h % 360;
        s = s / 100;
        v = v / 100;

        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;

        let rPrime, gPrime, bPrime;
        if (h < 60) {
            rPrime = c; gPrime = x; bPrime = 0;
        } else if (h < 120) {
            rPrime = x; gPrime = c; bPrime = 0;
        } else if (h < 180) {
            rPrime = 0; gPrime = c; bPrime = x;
        } else if (h < 240) {
            rPrime = 0; gPrime = x; bPrime = c;
        } else if (h < 300) {
            rPrime = x; gPrime = 0; bPrime = c;
        } else {
            rPrime = c; gPrime = 0; bPrime = x;
        }

        const r = Math.round((rPrime + m) * 255);
        const g = Math.round((gPrime + m) * 255);
        const b = Math.round((bPrime + m) * 255);

        return [r, g, b];
    }

    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;

        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, v * 100];
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }

    // Initialize button highlight
    highlightSelectedButton(currentColorStyle);

    // Event listener for canvas click
    canvas.addEventListener('click', pickColor);

    // Copy hex code functionality
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const colorId = button.getAttribute('data-color-id');
            const hexCode = document.getElementById(`color-hex-${colorId}`).textContent;
            navigator.clipboard.writeText(hexCode).then(() => {
                alert(`Hex code ${hexCode} copied to clipboard!`);
            }).catch(() => {
                alert('Failed to copy hex code to clipboard.');
            });
        });
    });
});
