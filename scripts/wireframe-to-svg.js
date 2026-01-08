/**
 * Content-First Wireframe to SVG Exporter (EXPERIMENTAL)
 * 
 * NOTE: This is an experimental script for exploring alternative export formats.
 * The primary workflow uses the web UI to export to Penpot via LLM instructions.
 * 
 * This script converts text-based DSL wireframes directly to SVG files.
 * While useful for open-source design tools (Inkscape, Illustrator) or as a
 * visual reference, the web-based Penpot export workflow is the recommended approach.
 * 
 * Converts text-based DSL wireframes to Penpot-compatible SVG files
 * 
 * Usage: node scripts/wireframe-to-svg.js <input-file.txt> [output-file.svg]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // 12-column grid (960px base / 12 = 80px per column)
  pageWidth: 960,
  columnWidth: 80,
  gutter: 20,
  padding: 40,
  
  // Typography
  fonts: {
    h1: { size: 32, weight: 'bold', lineHeight: 40 },
    h2: { size: 24, weight: 'bold', lineHeight: 32 },
    h3: { size: 20, weight: 'bold', lineHeight: 28 },
    h4: { size: 18, weight: 'bold', lineHeight: 24 },
    h5: { size: 16, weight: 'bold', lineHeight: 22 },
    h6: { size: 14, weight: 'bold', lineHeight: 20 },
    body: { size: 14, weight: 'normal', lineHeight: 22 },
    label: { size: 12, weight: 'normal', lineHeight: 18 },
  },
  
  // Colors (grayscale wireframe style)
  colors: {
    background: '#FFFFFF',
    border: '#CCCCCC',
    text: '#333333',
    textLight: '#666666',
    buttonBg: '#F5F5F5',
    buttonBorder: '#999999',
    imagePlaceholder: '#E8E8E8',
    landmarkBg: '#FAFAFA',
  },
  
  // Spacing
  spacing: {
    section: 40,
    element: 16,
    small: 8,
  },
  
  // Components
  button: {
    height: 40,
    borderRadius: 4,
    paddingX: 24,
  },
  
  input: {
    height: 40,
    borderRadius: 4,
  },
  
  image: {
    minHeight: 120,
    defaultWidth: 0.8, // 80% of container
  },
};

class WireframeToSVG {
  constructor(config = CONFIG) {
    this.config = config;
    this.elements = [];
    this.currentY = config.padding;
    this.currentLandmark = null;
    this.landmarkStartY = 0;
  }

  /**
   * Parse the wireframe text into structured elements
   */
  parseWireframe(text) {
    const lines = text.split('\n');
    const elements = [];
    let currentLandmark = null;
    let metadata = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Metadata
      if (line.startsWith('Title:')) {
        metadata.title = line.substring(6).trim();
        continue;
      }
      if (line.startsWith('URL:')) {
        metadata.url = line.substring(4).trim();
        continue;
      }
      if (line.startsWith('Purpose:') || line.startsWith('Page Purpose:')) {
        metadata.purpose = line.split(':')[1].trim();
        continue;
      }
      if (line.startsWith('Regions:') || line.startsWith('Referrer:') || 
          line.startsWith('Page language:') || line.startsWith('Interactive Elements:')) {
        continue;
      }

      // Landmarks
      if (line.startsWith('|| ')) {
        if (currentLandmark) {
          elements.push(currentLandmark);
        }
        currentLandmark = {
          type: 'landmark',
          name: line.substring(3),
          children: [],
        };
        continue;
      }

      // Skip to main link
      if (line.toLowerCase().includes('skip to main')) {
        elements.push({ type: 'skip-link', text: line });
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const element = { type: 'heading', level, text };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
        continue;
      }

      // Buttons [[Action]]
      const buttonMatch = line.match(/\[\[(.+?)\]\]/g);
      if (buttonMatch) {
        buttonMatch.forEach(match => {
          const text = match.substring(2, match.length - 2);
          const element = { type: 'button', text };
          
          if (currentLandmark) {
            currentLandmark.children.push(element);
          } else {
            elements.push(element);
          }
        });
        continue;
      }

      // Images <Description>
      const imageMatch = line.match(/<(.+?)>/);
      if (imageMatch) {
        const description = imageMatch[1];
        const element = { type: 'image', description };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
        continue;
      }

      // Form inputs - Label: [____]
      const inputMatch = line.match(/^([^:]+):\s*\[(_+)\]/);
      if (inputMatch) {
        const label = inputMatch[1].trim();
        const element = { type: 'input', label };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
        continue;
      }

      // Links [Text](url) or [Text]
      const linkMatch = line.match(/\[([^\]]+)\](?:\(([^)]+)\))?/g);
      if (linkMatch && !line.startsWith('[_')) {
        linkMatch.forEach(match => {
          const linkParts = match.match(/\[([^\]]+)\](?:\(([^)]+)\))?/);
          const text = linkParts[1];
          const url = linkParts[2] || '';
          const element = { type: 'link', text, url };
          
          if (currentLandmark) {
            currentLandmark.children.push(element);
          } else {
            elements.push(element);
          }
        });
        continue;
      }

      // Horizontal rule
      if (line === '---' || line === '***') {
        const element = { type: 'divider' };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
        continue;
      }

      // Lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const text = line.substring(2);
        const element = { type: 'list-item', text };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
        continue;
      }

      // Regular text
      if (line.length > 0) {
        const element = { type: 'text', text: line };
        
        if (currentLandmark) {
          currentLandmark.children.push(element);
        } else {
          elements.push(element);
        }
      }
    }

    // Close final landmark
    if (currentLandmark) {
      elements.push(currentLandmark);
    }

    return { metadata, elements };
  }

  /**
   * Render heading element
   */
  renderHeading(level, text) {
    const font = this.config.fonts[`h${level}`] || this.config.fonts.body;
    const y = this.currentY + font.size;
    
    const element = `
    <text x="${this.config.padding}" y="${y}" 
          font-size="${font.size}" 
          font-weight="${font.weight}" 
          fill="${this.config.colors.text}"
          font-family="Arial, sans-serif">${this.escapeXML(text)}</text>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render button element
   */
  renderButton(text) {
    const textWidth = text.length * 8; // Rough approximation
    const buttonWidth = Math.max(textWidth + (this.config.button.paddingX * 2), 120);
    const x = this.config.padding;
    const y = this.currentY;
    
    const element = `
    <g class="button">
      <rect x="${x}" y="${y}" 
            width="${buttonWidth}" 
            height="${this.config.button.height}" 
            rx="${this.config.button.borderRadius}" 
            fill="${this.config.colors.buttonBg}" 
            stroke="${this.config.colors.buttonBorder}" 
            stroke-width="1"/>
      <text x="${x + buttonWidth / 2}" y="${y + this.config.button.height / 2 + 5}" 
            font-size="${this.config.fonts.body.size}" 
            font-weight="${this.config.fonts.body.weight}" 
            fill="${this.config.colors.text}"
            font-family="Arial, sans-serif"
            text-anchor="middle">${this.escapeXML(text)}</text>
    </g>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.button.height + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render input field with label
   */
  renderInput(label) {
    const labelY = this.currentY + this.config.fonts.label.size;
    const inputY = labelY + this.config.spacing.small;
    const inputWidth = this.config.pageWidth - (this.config.padding * 2);
    
    const element = `
    <g class="input-field">
      <text x="${this.config.padding}" y="${labelY}" 
            font-size="${this.config.fonts.label.size}" 
            font-weight="${this.config.fonts.label.weight}" 
            fill="${this.config.colors.textLight}"
            font-family="Arial, sans-serif">${this.escapeXML(label)}</text>
      <rect x="${this.config.padding}" y="${inputY}" 
            width="${inputWidth}" 
            height="${this.config.input.height}" 
            rx="${this.config.input.borderRadius}" 
            fill="${this.config.colors.background}" 
            stroke="${this.config.colors.border}" 
            stroke-width="1"/>
    </g>`;
    
    this.elements.push(element);
    this.currentY = inputY + this.config.input.height + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render image placeholder
   */
  renderImage(description) {
    const width = (this.config.pageWidth - (this.config.padding * 2)) * this.config.image.defaultWidth;
    const height = this.config.image.minHeight;
    const x = this.config.padding + ((this.config.pageWidth - (this.config.padding * 2) - width) / 2);
    const y = this.currentY;
    
    const element = `
    <g class="image-placeholder">
      <rect x="${x}" y="${y}" 
            width="${width}" 
            height="${height}" 
            fill="${this.config.colors.imagePlaceholder}" 
            stroke="${this.config.colors.border}" 
            stroke-width="1"/>
      <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" 
            stroke="${this.config.colors.border}" stroke-width="1"/>
      <line x1="${x + width}" y1="${y}" x2="${x}" y2="${y + height}" 
            stroke="${this.config.colors.border}" stroke-width="1"/>
      <text x="${x + width / 2}" y="${y + height / 2 + 5}" 
            font-size="${this.config.fonts.label.size}" 
            fill="${this.config.colors.textLight}"
            font-family="Arial, sans-serif"
            text-anchor="middle">${this.escapeXML(description)}</text>
    </g>`;
    
    this.elements.push(element);
    this.currentY = y + height + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render link element
   */
  renderLink(text) {
    const y = this.currentY + this.config.fonts.body.size;
    
    const element = `
    <text x="${this.config.padding}" y="${y}" 
          font-size="${this.config.fonts.body.size}" 
          fill="#0066CC"
          text-decoration="underline"
          font-family="Arial, sans-serif">${this.escapeXML(text)}</text>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render text element
   */
  renderText(text) {
    const y = this.currentY + this.config.fonts.body.size;
    
    const element = `
    <text x="${this.config.padding}" y="${y}" 
          font-size="${this.config.fonts.body.size}" 
          fill="${this.config.colors.text}"
          font-family="Arial, sans-serif">${this.escapeXML(text)}</text>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render list item
   */
  renderListItem(text) {
    const y = this.currentY + this.config.fonts.body.size;
    const bulletX = this.config.padding + 10;
    const textX = bulletX + 15;
    
    const element = `
    <g class="list-item">
      <circle cx="${bulletX}" cy="${y - 5}" r="3" fill="${this.config.colors.text}"/>
      <text x="${textX}" y="${y}" 
            font-size="${this.config.fonts.body.size}" 
            fill="${this.config.colors.text}"
            font-family="Arial, sans-serif">${this.escapeXML(text)}</text>
    </g>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render divider
   */
  renderDivider() {
    const y = this.currentY + this.config.spacing.small;
    const width = this.config.pageWidth - (this.config.padding * 2);
    
    const element = `
    <line x1="${this.config.padding}" y1="${y}" 
          x2="${this.config.padding + width}" y2="${y}" 
          stroke="${this.config.colors.border}" 
          stroke-width="1"/>`;
    
    this.elements.push(element);
    this.currentY = y + this.config.spacing.element;
    
    return element;
  }

  /**
   * Render landmark container
   */
  renderLandmark(landmark) {
    const startY = this.currentY;
    
    // Render landmark label
    const labelY = this.currentY + this.config.fonts.label.size;
    this.elements.push(`
    <text x="${this.config.padding}" y="${labelY}" 
          font-size="${this.config.fonts.label.size}" 
          font-weight="bold" 
          fill="${this.config.colors.textLight}"
          font-family="Arial, sans-serif"
          text-transform="uppercase">${this.escapeXML(landmark.name)}</text>`);
    
    this.currentY = labelY + this.config.spacing.element;
    
    // Render children
    landmark.children.forEach(child => {
      this.renderElement(child);
    });
    
    // Draw background rect for landmark
    const landmarkHeight = this.currentY - startY + this.config.spacing.small;
    this.elements.unshift(`
    <rect x="${this.config.padding / 2}" y="${startY}" 
          width="${this.config.pageWidth - this.config.padding}" 
          height="${landmarkHeight}" 
          fill="${this.config.colors.landmarkBg}" 
          stroke="${this.config.colors.border}" 
          stroke-width="1" 
          stroke-dasharray="4,4"/>`);
    
    this.currentY += this.config.spacing.section;
  }

  /**
   * Render a single element based on type
   */
  renderElement(element) {
    switch (element.type) {
      case 'heading':
        this.renderHeading(element.level, element.text);
        break;
      case 'button':
        this.renderButton(element.text);
        break;
      case 'input':
        this.renderInput(element.label);
        break;
      case 'image':
        this.renderImage(element.description);
        break;
      case 'link':
        this.renderLink(element.text);
        break;
      case 'text':
        this.renderText(element.text);
        break;
      case 'list-item':
        this.renderListItem(element.text);
        break;
      case 'divider':
        this.renderDivider();
        break;
      case 'landmark':
        this.renderLandmark(element);
        break;
      case 'skip-link':
        this.renderLink(element.text);
        break;
    }
  }

  /**
   * Escape XML special characters
   */
  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate complete SVG from wireframe text
   */
  generateSVG(wireframeText) {
    const { metadata, elements } = this.parseWireframe(wireframeText);
    
    // Reset state
    this.elements = [];
    this.currentY = this.config.padding;
    
    // Render title if exists
    if (metadata.title) {
      this.renderHeading(1, metadata.title);
      this.currentY += this.config.spacing.small;
    }
    
    // Render all elements
    elements.forEach(element => {
      this.renderElement(element);
    });
    
    // Calculate total height
    const totalHeight = this.currentY + this.config.padding;
    
    // Build SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.config.pageWidth}" height="${totalHeight}" 
     xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${this.config.pageWidth} ${totalHeight}">
  
  <!-- Generated by Content-First Wireframe to SVG Exporter -->
  <!-- Original Title: ${this.escapeXML(metadata.title || 'Untitled')} -->
  ${metadata.purpose ? `<!-- Purpose: ${this.escapeXML(metadata.purpose)} -->` : ''}
  
  <!-- Background -->
  <rect width="${this.config.pageWidth}" height="${totalHeight}" fill="${this.config.colors.background}"/>
  
  <!-- Content -->
  ${this.elements.join('\n  ')}
  
</svg>`;
    
    return svg;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/wireframe-to-svg.js <input-file.txt> [output-file.svg]');
    console.log('\nExample:');
    console.log('  node scripts/wireframe-to-svg.js examples/login.txt output/login.svg');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(/\.txt$/, '.svg');
  
  try {
    // Read input file
    const wireframeText = fs.readFileSync(inputFile, 'utf8');
    
    // Generate SVG
    const converter = new WireframeToSVG();
    const svg = converter.generateSVG(wireframeText);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write output file
    fs.writeFileSync(outputFile, svg, 'utf8');
    
    console.log(`✓ SVG generated successfully: ${outputFile}`);
    console.log(`  Size: ${(Buffer.byteLength(svg, 'utf8') / 1024).toFixed(2)} KB`);
    console.log('\nTo use in Penpot:');
    console.log('  1. Open Penpot');
    console.log('  2. Go to Files → Import File');
    console.log(`  3. Select ${path.basename(outputFile)}`);
    console.log('  4. All elements will be editable layers');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { WireframeToSVG, CONFIG };
